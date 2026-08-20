import { useEffect } from 'react'

const SUFFIX = 'Pakargaming'

/**
 * Menyetel judul tab per halaman. Sebelumnya seluruh aplikasi memakai satu
 * judul statis dari index.html, termasuk layar login, OTP, dan 403.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : SUFFIX
  }, [title])
}
