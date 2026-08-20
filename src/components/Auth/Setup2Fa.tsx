import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import {
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  ShieldOff,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { api } from '@/api/axios'
import { authStorage } from '@/lib/auth'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

interface SetupData {
  qr_url: string;
  recovery_codes: string[];
}

const STEP_HEAD_CLASS =
  'flex items-center gap-2 border-b-4 border-[#111] px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em]'

const Setup2FA = () => {
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false)
  const [copied, setCopied] = useState(false)

  const {
    data: profile,
    isLoading: isChecking,
    refetch: reloadProfile,
  } = useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const res = await api.get('/admin/me')
      return res.data.data
    },
  })

  const isMfaActive = profile?.two_factor_enabled

  const { mutate: generateSetup, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      const res = await api.get('/admin/setup-2fa')
      return res.data.data
    },
    onSuccess: (data) => {
      setSetupData(data)
      toast.success('QR berhasil dibuat')
    },
    onError: () => toast.error('Gagal membuat setup 2FA'),
  })

  const { mutate: activateMfa, isPending: isActivating } = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/admin/activate', { code })
      return res.data
    },
    onSuccess: (res) => {
      toast.success('2FA berhasil diaktifkan')
      if (res.token) authStorage.setToken(res.token)
      setSetupData(null)
      reloadProfile()
    },
    onError: (err: unknown) => {
      const msg = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message
      toast.error(msg || 'Kode OTP tidak valid')
    },
  })

  const { mutate: deactivateMfa, isPending: isDeactivating } = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/admin/deactivate', { code })
      return res.data
    },
    onSuccess: (res) => {
      toast.success('2FA berhasil dinonaktifkan')
      if (res.token) authStorage.setToken(res.token)
      setIsConfirmingDeactivate(false)
      reloadProfile()
    },
    onError: (err: unknown) => {
      const msg = (
        err as { response?: { data?: { message?: string } } }
      )?.response?.data?.message
      toast.error(msg || 'Gagal menonaktifkan 2FA')
    },
  })

  const handleCopyCodes = async () => {
    if (!setupData) return
    const text = setupData.recovery_codes.join('\n')
    try {
      await copyTextToClipboard(text)
    } catch {
      toast.error('Gagal menyalin kode cadangan')
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Kode cadangan disalin')
  }

  if (isChecking)
    return (
      <div
        className='nb nb-frame nb-frame-thick nb-sd-lg flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-white py-12'
        role='status'
        aria-live='polite'
        aria-busy='true'
      >
        <div className='nb-frame nb-sd-sm flex h-16 w-16 items-center justify-center bg-[#6fe3f5]'>
          <Loader2 className='h-8 w-8 animate-spin' strokeWidth={2.5} aria-hidden />
        </div>
        <div className='text-center'>
          <p className='text-sm font-black uppercase tracking-[0.15em]'>
            Memeriksa status keamanan…
          </p>
          <p className='mt-1 text-xs font-bold text-[#111]/60'>
            Mohon tunggu sebentar.
          </p>
        </div>
      </div>
    )

  return (
    <div className='nb space-y-6'>
      {/* Judul halaman */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex gap-4'>
          <div className='nb-frame nb-sd-sm flex h-12 w-12 shrink-0 -rotate-3 items-center justify-center bg-[#c9f24d]'>
            <ShieldCheck className='h-6 w-6' strokeWidth={2.5} aria-hidden />
          </div>
          <div className='min-w-0 space-y-1.5'>
            <h1 className='text-2xl font-black uppercase leading-none tracking-tight'>
              Keamanan akun
            </h1>
            <p className='text-sm font-bold text-[#111]/70'>
              Kelola autentikasi dua faktor (2FA) untuk akun admin Anda.
            </p>
          </div>
        </div>
        {isMfaActive && (
          <div className='nb-frame nb-sd-sm flex items-center gap-2 self-start bg-[#c9f24d] px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] sm:self-auto'>
            <span className='nb-frame nb-frame-thin nb-round h-2.5 w-2.5 shrink-0 bg-[#111]' aria-hidden />
            2FA aktif
          </div>
        )}
      </div>

      {isMfaActive ? (
        <div className='nb-frame nb-frame-thick nb-sd-lg bg-white'>
          <div className={`${STEP_HEAD_CLASS} bg-[#ff4d3d] text-white`}>
            <ShieldOff className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            Kelola 2FA
          </div>

          <div className='flex flex-col items-center space-y-8 px-4 py-10 sm:py-12'>
            {!isConfirmingDeactivate ? (
              <div className='flex flex-col items-center space-y-6 text-center'>
                <div className='nb-frame nb-sd flex h-20 w-20 rotate-3 items-center justify-center bg-[#ffd84d]'>
                  <AlertTriangle className='h-10 w-10' strokeWidth={2.5} aria-hidden />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-xl font-black uppercase tracking-tight'>
                    Nonaktifkan perlindungan?
                  </h3>
                  <p className='mx-auto max-w-sm text-sm font-bold text-[#111]/70'>
                    Tindakan ini meningkatkan risiko akses tidak sah. Pastikan
                    Anda memahami konsekuensinya.
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => setIsConfirmingDeactivate(true)}
                  className='nb-frame nb-sd nb-press h-12 bg-[#ff4d3d] px-10 text-sm font-black uppercase tracking-[0.15em] text-white'
                >
                  Nonaktifkan 2FA
                </button>
              </div>
            ) : (
              <div className='flex flex-col items-center space-y-6 duration-300 animate-in zoom-in-95'>
                <div className='text-center'>
                  <h3 className='text-lg font-black uppercase tracking-tight'>
                    Verifikasi akhir
                  </h3>
                  <p className='text-sm font-bold text-[#111]/70'>
                    Masukkan kode OTP untuk mengonfirmasi
                  </p>
                </div>

                <div className='w-full overflow-x-auto py-2'>
                  <InputOTP
                    maxLength={6}
                    disabled={isDeactivating}
                    onComplete={(v) => deactivateMfa(v)}
                    containerClassName='mx-auto w-max'
                    autoFocus
                  >
                    <InputOTPGroup className='gap-1.5 sm:gap-2'>
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className='nb-otp nb-frame nb-sd-sm h-12 w-9 bg-white text-lg font-black text-[#111] sm:h-14 sm:w-11 sm:text-xl'
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className='flex flex-col items-center gap-3'>
                  {isDeactivating ? (
                    <p className='flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em]'>
                      <Loader2 className='h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
                      Menonaktifkan…
                    </p>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setIsConfirmingDeactivate(false)}
                      className='text-xs font-black uppercase tracking-[0.15em] underline decoration-[3px] underline-offset-4 hover:bg-[#ffd84d]'
                    >
                      Batal, tetap aktifkan 2FA
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {!setupData ? (
            <div className='nb-frame nb-frame-thick nb-sd-lg flex flex-col items-center bg-white px-4 py-16 sm:py-20'>
              <div className='nb-frame nb-sd mb-7 flex h-20 w-20 -rotate-3 items-center justify-center bg-[#6fe3f5]'>
                <RefreshCw
                  className={`h-10 w-10 ${isGenerating ? 'animate-spin' : ''}`}
                  strokeWidth={2.5}
                  aria-hidden
                />
              </div>
              <h3 className='mb-2 text-xl font-black uppercase tracking-tight'>
                Perkuat keamanan akun
              </h3>
              <p className='mb-8 max-w-xs px-4 text-center text-sm font-bold text-[#111]/70'>
                Gunakan aplikasi autentikator untuk melindungi dashboard admin
                dari akses tidak sah.
              </p>
              <button
                type='button'
                onClick={() => generateSetup()}
                disabled={isGenerating}
                className='nb-frame nb-sd nb-press flex h-12 items-center gap-2 bg-[#c9f24d] px-10 text-sm font-black uppercase tracking-[0.15em] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isGenerating ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
                    Menyiapkan…
                  </>
                ) : (
                  'Aktifkan 2FA'
                )}
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-5 duration-500 animate-in slide-in-from-bottom-4 sm:gap-6 lg:grid-cols-3'>
              {/* 1. QR */}
              <div className='nb-frame nb-frame-thick nb-sd-lg bg-white'>
                <div className={`${STEP_HEAD_CLASS} bg-[#6fe3f5]`}>
                  1. Pindai QR
                </div>
                <div className='flex justify-center px-4 py-6'>
                  <div className='nb-frame nb-sd-sm bg-white p-4'>
                    <QRCodeSVG value={setupData.qr_url} size={180} />
                  </div>
                </div>
              </div>

              {/* 2. Kode cadangan */}
              <div className='nb-frame nb-frame-thick nb-sd-lg bg-white'>
                <div className={`${STEP_HEAD_CLASS} bg-[#ff9ed2]`}>
                  2. Kode cadangan
                </div>
                <div className='space-y-4 px-4 py-6'>
                  <div className='grid grid-cols-2 gap-2'>
                    {setupData.recovery_codes.map((code) => (
                      <div
                        key={code}
                        className='nb-frame nb-frame-thin bg-[#f5f1e8] p-2 text-center font-mono text-[11px] font-black'
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <button
                    type='button'
                    onClick={handleCopyCodes}
                    className='nb-frame nb-sd-sm nb-press flex h-10 w-full items-center justify-center gap-2 bg-[#ffd84d] text-xs font-black uppercase tracking-[0.15em]'
                  >
                    {copied ? (
                      <Check className='h-4 w-4' strokeWidth={3} aria-hidden />
                    ) : (
                      <Copy className='h-4 w-4' strokeWidth={3} aria-hidden />
                    )}
                    {copied ? 'Disalin' : 'Salin semua kode'}
                  </button>
                </div>
              </div>

              {/* 3. Aktivasi */}
              <div className='nb-frame nb-frame-thick nb-sd-lg bg-white'>
                <div className={`${STEP_HEAD_CLASS} bg-[#c9f24d]`}>
                  3. Aktivasi
                </div>
                <div className='flex flex-col items-center space-y-6 px-4 py-8'>
                  <div className='w-full overflow-x-auto py-2'>
                    <InputOTP
                      maxLength={6}
                      disabled={isActivating}
                      onComplete={(v) => activateMfa(v)}
                      containerClassName='mx-auto w-max'
                    >
                      <InputOTPGroup className='gap-1.5'>
                        {[...Array(6)].map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className='nb-otp nb-frame nb-sd-sm h-14 w-10 bg-white text-xl font-black text-[#111]'
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {isActivating && (
                    <p className='flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em]'>
                      <Loader2 className='h-3.5 w-3.5 animate-spin' strokeWidth={3} aria-hidden />
                      Memverifikasi…
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Peringatan */}
      {setupData && !isMfaActive && (
        <div className='nb-frame nb-sd flex items-start gap-3 bg-[#ffd84d] px-4 py-3.5'>
          <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0' strokeWidth={3} aria-hidden />
          <div className='space-y-1'>
            <p className='text-sm font-black uppercase tracking-[0.12em]'>
              Sebelum aktivasi
            </p>
            <p className='text-xs font-bold text-[#111]/80'>
              Simpan kode cadangan di tempat aman. Tanpa kode ini, pemulihan akun
              sulit dilakukan jika aplikasi autentikator hilang.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Setup2FA
