import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PermissionGuard } from '@/components/Auth/PermissionGuard'
import { useAuthUser } from '@/lib/auth'
import { authStateForRole } from '@/test/auth-fixture'
import { PERM } from '@/constants/permissions'

vi.mock('@/lib/auth', () => ({
  useAuthUser: vi.fn(),
}))

const mockUseAuthUser = vi.mocked(useAuthUser)

type AuthState = ReturnType<typeof useAuthUser>

const authState = (overrides: Partial<AuthState>): AuthState => ({
  ...authStateForRole(null),
  ...overrides,
})

const renderGuard = (requires: string | string[]) =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path='/'
          element={
            <PermissionGuard requires={requires}>
              <p>konten-rahasia</p>
            </PermissionGuard>
          }
        />
        <Route path='/login' element={<p>halaman-login</p>} />
        <Route path='/verify-otp' element={<p>halaman-otp</p>} />
        <Route path='/unauthorized' element={<p>halaman-403</p>} />
      </Routes>
    </MemoryRouter>,
  )

describe('PermissionGuard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('menampilkan konten bila permission dimiliki', () => {
    mockUseAuthUser.mockReturnValue(authStateForRole('admin'))
    renderGuard(PERM.GAME_VIEW)
    expect(screen.getByText('konten-rahasia')).toBeInTheDocument()
  })

  it('mengalihkan ke 403 bila permission tidak dimiliki', () => {
    mockUseAuthUser.mockReturnValue(authStateForRole('noc'))
    renderGuard(PERM.ADMIN_VIEW)
    expect(screen.getByText('halaman-403')).toBeInTheDocument()
  })

  it('beberapa kode bersifat OR', () => {
    mockUseAuthUser.mockReturnValue(authStateForRole('noc'))
    renderGuard([PERM.ADMIN_VIEW, PERM.TRANSACTION_VIEW])
    expect(screen.getByText('konten-rahasia')).toBeInTheDocument()
  })

  // Path tanpa entri di ROUTE_PERMISSIONS menghasilkan daftar kosong.
  // Kalau daftar kosong dianggap "cukup terautentikasi", halaman baru yang
  // lupa didaftarkan akan terbuka untuk siapa saja.
  it('daftar permission kosong ditolak (fail-closed)', () => {
    mockUseAuthUser.mockReturnValue(authStateForRole('dev'))
    renderGuard([])
    expect(screen.getByText('halaman-403')).toBeInTheDocument()
  })

  it('mengalihkan ke login bila belum terautentikasi', () => {
    mockUseAuthUser.mockReturnValue(authState({ isAuthenticated: false }))
    renderGuard(PERM.GAME_VIEW)
    expect(screen.getByText('halaman-login')).toBeInTheDocument()
  })

  it('mengalihkan ke verifikasi OTP bila MFA belum selesai', () => {
    mockUseAuthUser.mockReturnValue(
      authState({ isAuthenticated: false, isMfaRequired: true }),
    )
    renderGuard(PERM.GAME_VIEW)
    expect(screen.getByText('halaman-otp')).toBeInTheDocument()
  })

  // Profil yang gagal dimuat BUKAN bukti bahwa sesi berakhir. Mengusir user
  // ke /login di sini justru sumber kedipan halaman login: begitu request
  // berikutnya berhasil, /admin/me menjawab 200 dan dia dipantulkan balik ke
  // halaman ini.
  it('profil gagal dimuat: menawarkan coba lagi, bukan mengalihkan ke login', () => {
    const refetchProfile = vi.fn()
    mockUseAuthUser.mockReturnValue(
      authState({ isAuthenticated: false, isError: true, refetchProfile }),
    )
    renderGuard(PERM.GAME_VIEW)

    expect(screen.queryByText('halaman-login')).not.toBeInTheDocument()
    expect(screen.queryByText('konten-rahasia')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Try again/ }))
    expect(refetchProfile).toHaveBeenCalledTimes(1)
  })

  // Selama profil dimuat, permission belum diketahui. Menampilkan konten di
  // sini akan membocorkan halaman sekejap sebelum guard sempat menolak.
  it('menampilkan pemuat selama profil dimuat', () => {
    mockUseAuthUser.mockReturnValue(
      authState({ ...authStateForRole('dev'), isLoading: true }),
    )
    renderGuard(PERM.GAME_VIEW)
    expect(screen.queryByText('konten-rahasia')).not.toBeInTheDocument()
    expect(screen.queryByText('halaman-403')).not.toBeInTheDocument()
  })
})
