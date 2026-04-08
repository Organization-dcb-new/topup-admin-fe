/**
 * Copies text in response to a user gesture.
 * Uses Async Clipboard API when allowed; falls back to execCommand for HTTP,
 * strict permissions, or browsers that reject writeText.
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('copy: no window')
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall through — production may reject despite HTTPS (policy, focus, etc.)
    }
  }

  const ok = copyTextWithExecCommand(text)
  if (!ok) {
    throw new Error('copy failed')
  }
}

function copyTextWithExecCommand(text: string): boolean {
  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.position = 'fixed'
  el.style.left = '-9999px'
  el.style.top = '0'
  el.style.opacity = '0'
  document.body.appendChild(el)
  el.focus()
  el.select()
  el.setSelectionRange(0, text.length)

  let success = false
  try {
    success = document.execCommand('copy')
  } finally {
    document.body.removeChild(el)
  }
  return success
}
