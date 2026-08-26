import type { Banner } from '@/types/banner'

/** Jendela tayang sebuah banner relatif terhadap satu titik waktu. */
export type BannerScheduleState = 'live' | 'scheduled' | 'expired'

/**
 * Jadwal datang sebagai ISO dari backend atau 'YYYY-MM-DDTHH:mm' dari
 * `<input type='datetime-local'>`; keduanya bisa dibaca `Date`. Kosong berarti
 * "tanpa batas", dan nilai yang tak terbaca diperlakukan sama supaya jadwal
 * rusak tidak pernah diam-diam menyembunyikan banner.
 */
export function toTime(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const time = new Date(raw).getTime()
  return Number.isNaN(time) ? null : time
}

/**
 * Satu-satunya penilai jendela jadwal di frontend, pasangan dari kondisi SQL
 * di `FindAllPublic`. Aturan ini sebelumnya ditulis tiga kali, dan pratinjau
 * carousel membacanya dari jam yang berbeda dengan chip di baris daftar —
 * sehingga keduanya bisa saling bertentangan di layar yang sama. `now`
 * sengaja jadi parameter, bukan `Date.now()` di dalam, supaya seluruh
 * pemanggil dalam satu render membaca titik waktu yang persis sama.
 */
export function bannerScheduleState(banner: Banner, now: number): BannerScheduleState {
  const end = toTime(banner.end_at)
  if (end !== null && end < now) return 'expired'

  const start = toTime(banner.start_at)
  if (start !== null && start > now) return 'scheduled'

  return 'live'
}

/**
 * Aturan yang sama dengan endpoint publik `GET /banners`: aktif dan berada di
 * dalam jendela jadwal. Dipakai pratinjau supaya yang tampil di panel admin
 * benar-benar sama dengan yang dilihat pengunjung, bukan sekadar yang aktif.
 */
export function isBannerLive(banner: Banner, now: number): boolean {
  return banner.is_active && bannerScheduleState(banner, now) === 'live'
}
