import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoleGuard } from '@/components/Auth/RoleGuard'
import { useAuthUser } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({
  useAuthUser: vi.fn(),
}))

const mockUseAuthUser = vi.mocked(useAuthUser)

type AuthState = ReturnType<typeof useAuthUser>

const authState = (overrides: Partial<AuthState>): AuthState => ({
  isAuthenticated: false,
  isMfaRequired: false,
  role: null,
  user: null,
  isLoading: false,
  ...overrides,
})

const renderGuard = (allowedRoles: string[]) =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path='/'
          element={
            <RoleGuard allowedRoles={allowedRoles}>
              <p>konten-rahasia</p>
            </RoleGuard>
          }
        />
        <Route path='/login' element={<p>halaman-login</p>} />
        <Route path='/verify-otp' element={<p>halaman-otp</p>} />
        <Route path='/unauthorized' element={<p>halaman-403</p>} />
      </Routes>
    </MemoryRouter>,
  )

describe('RoleGuard', () => {
  beforeEach(() => {
    mockUseAuthUser.mockReset()
  })

  it('menampilkan loading tanpa membocorkan konten', () => {
    mockUseAuthUser.mockReturnValue(authState({ isLoading: true }))
    renderGuard(['admin'])
    expect(screen.queryByText('konten-rahasia')).not.toBeInTheDocument()
    expect(screen.queryByText('halaman-login')).not.toBeInTheDocument()
  })

  it('redirect ke /login saat belum terautentikasi', () => {
    mockUseAuthUser.mockReturnValue(authState({}))
    renderGuard(['admin'])
    expect(screen.getByText('halaman-login')).toBeInTheDocument()
  })

  it('redirect ke /verify-otp saat MFA masih pending', () => {
    mockUseAuthUser.mockReturnValue(authState({ isMfaRequired: true }))
    renderGuard(['admin'])
    expect(screen.getByText('halaman-otp')).toBeInTheDocument()
  })

  it('redirect ke /unauthorized saat role tidak diizinkan', () => {
    mockUseAuthUser.mockReturnValue(
      authState({ isAuthenticated: true, role: 'noc', user: { role: 'noc' } }),
    )
    renderGuard(['dev', 'admin'])
    expect(screen.getByText('halaman-403')).toBeInTheDocument()
  })

  it('merender children saat role diizinkan', () => {
    mockUseAuthUser.mockReturnValue(
      authState({ isAuthenticated: true, role: 'admin', user: { role: 'admin' } }),
    )
    renderGuard(['dev', 'admin'])
    expect(screen.getByText('konten-rahasia')).toBeInTheDocument()
  })
})
