import { useSyncExternalStore } from 'react'

const TICK_MS = 60_000

/**
 * Satu jam bersama untuk seluruh layar.
 *
 * Jendela jadwal bergeser sendiri seiring waktu, jadi "sekarang" harus berupa
 * state yang dibarui berkala — membaca `Date.now()` langsung saat render
 * membuat hasil render tidak murni. Yang tidak boleh terjadi: dua bagian
 * layar memakai jam yang berbeda. Versi lama halaman banner melakukannya
 * (pratinjau memakai state yang berdetak, chip baris memakai `Date.now()`
 * segar), sehingga pratinjau masih menayangkan banner yang oleh baris di
 * sebelahnya sudah disebut kedaluwarsa.
 *
 * Karena itu interval-nya tunggal dan dipakai bersama: semua pemanggil
 * berlangganan ke nilai yang sama, dan timer berhenti begitu pelanggan
 * terakhir pergi.
 */
let snapshot = Date.now()
let listeners: Array<() => void> = []
let timer: number | null = null

function tick() {
  snapshot = Date.now()
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener]

  if (timer === null) {
    snapshot = Date.now()
    timer = window.setInterval(tick, TICK_MS)
  }

  return () => {
    listeners = listeners.filter((current) => current !== listener)
    if (listeners.length === 0 && timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }
}

function getSnapshot(): number {
  return snapshot
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
