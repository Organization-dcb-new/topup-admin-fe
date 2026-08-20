import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Tombol salin dengan umpan balik "tersalin" selama 2 detik.
 *
 * Memakai `copyTextToClipboard` yang sudah punya fallback `execCommand`, jadi
 * tetap jalan di konteks non-secure (http) — beda dengan `navigator.clipboard`
 * telanjang yang di sana justru melempar tanpa tertangkap.
 */
export function CopyButton({
  value,
  label,
  errorLabel,
  className,
  iconClassName,
}: {
  value: string
  /** Teks untuk `title` dan `aria-label`. */
  label: string
  /** Pesan toast saat penyalinan gagal. */
  errorLabel: string
  className?: string
  iconClassName?: string
}) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await copyTextToClipboard(value)
      setCopied(true)
      if (resetTimer.current) clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(errorLabel)
    }
  }

  return (
    <button
      type='button'
      onClick={handleCopy}
      title={label}
      aria-label={label}
      className={cn(
        'nb-frame nb-frame-thin nb-press-sm flex shrink-0 cursor-pointer items-center justify-center',
        copied ? 'bg-[#c9f24d]' : 'bg-white',
        className,
      )}
    >
      {copied ? (
        <Check className={cn('h-3.5 w-3.5', iconClassName)} strokeWidth={3} aria-hidden />
      ) : (
        <Copy className={cn('h-3.5 w-3.5', iconClassName)} strokeWidth={3} aria-hidden />
      )}
    </button>
  )
}
