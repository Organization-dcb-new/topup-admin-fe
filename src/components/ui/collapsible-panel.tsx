import { useLayoutEffect, useRef, useState, type ReactNode, type TransitionEvent } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

/**
 * Panel lipat yang tetap mulus untuk konten setinggi apa pun.
 *
 * Cara ringkasnya adalah menransisikan `grid-template-rows` dari `0fr` ke
 * `1fr`, dan itu memang dipakai di tempat lain repo ini untuk panel pendek.
 * Untuk panel yang tinggi caranya tidak memadai: browser harus menghitung ulang
 * tata letak grid pada setiap frame, sehingga isi berisi puluhan gambar terasa
 * tersendat — dan pada Safari maupun Firefox yang lebih lama nilai `fr` tidak
 * dianimasikan sama sekali, jadi panelnya melompat begitu saja.
 *
 * Di sini tingginya diukur satu kali lalu ditransisikan dalam piksel, dan
 * dikembalikan ke `auto` begitu animasi selesai — tanpa langkah terakhir itu,
 * isi yang tumbuh belakangan (gambar yang baru rampung dimuat) akan terpotong
 * oleh tinggi piksel yang sudah kedaluwarsa.
 */

export function CollapsiblePanel({
  open,
  id,
  className,
  children,
}: {
  open: boolean
  id?: string
  className?: string
  children: ReactNode
}) {
  const innerRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()
  /** `undefined` berarti `height: auto` — keadaan istirahat saat terbuka. */
  const [animatedHeight, setAnimatedHeight] = useState<number | undefined>(open ? undefined : 0)
  const isFirstRender = useRef(true)

  // Saat gerak dikurangi tidak ada animasi sama sekali, jadi tingginya
  // diturunkan langsung dari `open` sewaktu render — bukan dikejar lewat efek.
  const height = reduceMotion ? (open ? undefined : 0) : animatedHeight

  useLayoutEffect(() => {
    const inner = innerRef.current
    if (!inner) return

    // Render pertama tidak dianimasikan: panel yang dibuka dari preferensi
    // tersimpan tidak boleh ikut "tumbuh" tiap kali halaman dimuat.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (reduceMotion) return

    if (open) {
      setAnimatedHeight(inner.scrollHeight)
      return
    }

    // Menutup dari `auto` tidak bisa ditransisikan: tingginya dipatok dulu ke
    // nilai nyata, baru pada frame berikutnya diturunkan ke nol.
    setAnimatedHeight(inner.scrollHeight)
    const frame = requestAnimationFrame(() => setAnimatedHeight(0))
    return () => cancelAnimationFrame(frame)
  }, [open, reduceMotion])

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    // Transisi opacity milik anak ikut menggelembung ke sini.
    if (event.propertyName !== 'height' || event.target !== event.currentTarget) return
    if (open) setAnimatedHeight(undefined)
  }

  return (
    <div
      id={id}
      // Isinya tetap di DOM supaya tingginya bisa dianimasikan, jadi tanpa inert
      // baris tersembunyi ini masih ikut urutan tab dan masih terbaca pembaca layar.
      inert={!open}
      style={{ height }}
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        'overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
        className,
      )}
    >
      {/* Isi ikut memudar: tanpa itu, ujung animasi terasa seperti tirai yang
          memotong konten alih-alih panel yang menutup. Saat membuka, fade-nya
          sedikit tertunda supaya gerak tingginya yang terbaca lebih dulu. */}
      <div
        ref={innerRef}
        className={cn(
          'transition-opacity duration-200 ease-out motion-reduce:transition-none',
          open ? 'opacity-100 delay-75' : 'opacity-0',
        )}
      >
        {children}
      </div>
    </div>
  )
}
