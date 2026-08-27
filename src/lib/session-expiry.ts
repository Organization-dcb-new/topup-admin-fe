/**
 * Kanal satu arah dari interceptor axios ke router.
 *
 * Interceptor hidup di luar React, jadi ia tidak punya akses ke `navigate`.
 * Sebelumnya itu diakali dengan `window.location.href`, dan justru itulah
 * sumber kedipan halaman login: reload penuh membuang seluruh state, halaman
 * login ter-render dari nol, lalu `/admin/me` menjawab 200 dan memantulkan
 * user kembali ke dashboard. Dengan kanal ini redirect-nya tetap di dalam
 * router — tanpa reload, tanpa kedipan.
 */
type Listener = () => void

const listeners = new Set<Listener>()

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function notifySessionExpired(): void {
  listeners.forEach((listener) => listener())
}
