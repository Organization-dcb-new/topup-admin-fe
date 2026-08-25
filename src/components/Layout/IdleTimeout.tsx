import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

import { apiLogout } from '@/lib/auth'

/** Sesi cookie BE berumur 24 jam, jadi dashboard yang ditinggal terbuka
 *  tetap bisa dipakai orang lain. Timer ini menutupnya dari sisi klien. */
const IDLE_MS = 30 * 60 * 1000
const WARNING_MS = 60 * 1000
/** Aktivitas hanya dicatat sekali per detik supaya mousemove tidak
 *  membanjiri localStorage. */
const RECORD_THROTTLE_MS = 1000
const CHECK_INTERVAL_MS = 15 * 1000
/** Stempel aktivitas dibagikan antar tab: satu tab yang aktif menjaga
 *  sesi tetap hidup untuk tab lain yang menganggur. */
const ACTIVITY_KEY = 'pg_last_activity'

const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'wheel',
  'touchstart',
  'scroll',
] as const

/** Stempel dari tab lain; 0 bila storage tidak tersedia (mode privat,
 *  storage diblokir). Sengaja TIDAK jatuh ke Date.now(): itu akan membuat
 *  sesi selalu terlihat baru dan mematikan timeout tanpa jejak. */
function readSharedActivity(): number {
  try {
    const raw = localStorage?.getItem(ACTIVITY_KEY)
    const parsed = raw ? Number(raw) : NaN
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

function writeSharedActivity(at: number) {
  try {
    localStorage?.setItem(ACTIVITY_KEY, String(at))
  } catch {
    /* storage tak tersedia — timer tetap jalan dengan stempel di memori */
  }
}

export function IdleTimeout() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const warningShown = useRef(false)
  const isLoggingOut = useRef(false)
  const lastRecorded = useRef(0)
  /** Sumber utama; localStorage hanya menambah kesadaran antar-tab.
   *  Diisi di effect, bukan saat render (Date.now() bukan fungsi murni). */
  const lastActivity = useRef(0)

  useEffect(() => {
    const markActive = (at: number) => {
      lastActivity.current = at
      writeSharedActivity(at)
    }
    const lastActivityAt = () =>
      Math.max(lastActivity.current, readSharedActivity())

    markActive(Date.now())

    const dismissWarning = () => {
      if (!warningShown.current) return
      toast.dismiss('idle-warning')
      warningShown.current = false
    }

    const recordActivity = () => {
      const now = Date.now()
      if (now - lastRecorded.current < RECORD_THROTTLE_MS) return
      lastRecorded.current = now
      markActive(now)
      dismissWarning()
    }

    const endSession = async () => {
      if (isLoggingOut.current) return
      isLoggingOut.current = true
      try {
        await apiLogout()
        dismissWarning()
        // Buang seluruh cache agar data sesi lama tidak tersisa di memori
        queryClient.clear()
        navigate('/login?session=idle', { replace: true })
      } catch {
        // Sesi TIDAK berhasil diakhiri di server. Menggiring user ke /login
        // hanya akan memantulkannya balik ke dashboard (cookie masih sah),
        // jadi lebih jujur memberi tahu dan mencoba lagi pada siklus berikut.
        isLoggingOut.current = false
        lastRecorded.current = 0
        markActive(Date.now())
        dismissWarning()
        toast.error(t('idleTimeout.logoutFailed'), { id: 'idle-logout-failed' })
      }
    }

    const tick = () => {
      const idleFor = Date.now() - lastActivityAt()

      if (idleFor >= IDLE_MS) {
        void endSession()
        return
      }

      if (idleFor >= IDLE_MS - WARNING_MS && !warningShown.current) {
        warningShown.current = true
        toast(t('idleTimeout.warning', { minutes: WARNING_MS / 60000 }), {
          id: 'idle-warning',
          duration: WARNING_MS,
        })
      }
    }

    const interval = window.setInterval(tick, CHECK_INTERVAL_MS)
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, recordActivity, { passive: true }),
    )
    // Aktivitas di tab lain ikut membatalkan peringatan di tab ini
    window.addEventListener('storage', dismissWarning)

    return () => {
      window.clearInterval(interval)
      dismissWarning()
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, recordActivity),
      )
      window.removeEventListener('storage', dismissWarning)
    }
  }, [navigate, queryClient, t])

  return null
}
