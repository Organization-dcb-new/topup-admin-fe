import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from '@/components/Layout/navbar'
import { useAuthUser } from '@/lib/auth'
import { authStateForRole } from '@/test/auth-fixture'

vi.mock('@/lib/auth', () => ({
  useAuthUser: vi.fn(),
  apiLogout: vi.fn(),
}))

const mockUseAuthUser = vi.mocked(useAuthUser)

const asRole = (role: string) => authStateForRole(role)

const renderNavbar = (initialPath = '/', onOpenMobile = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Navbar onOpenMobile={onOpenMobile} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return onOpenMobile
}

describe('Navbar', () => {
  beforeEach(() => {
    mockUseAuthUser.mockReturnValue(asRole('admin'))
  })

  it('menampilkan judul halaman sesuai path', () => {
    renderNavbar('/games')
    expect(screen.getByRole('heading', { name: 'Games' })).toBeInTheDocument()
  })

  it('menampilkan username dan inisial avatar', () => {
    renderNavbar('/')
    expect(screen.getByText('vian')).toBeInTheDocument()
    expect(screen.getAllByText('VI').length).toBeGreaterThan(0)
  })

  it('memanggil onOpenMobile saat tombol menu ditekan', () => {
    const onOpenMobile = renderNavbar('/')
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    expect(onOpenMobile).toHaveBeenCalledTimes(1)
  })

  it('menu akun memuat email, role, dan aksi logout', () => {
    renderNavbar('/')
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(screen.getByText('vian@example.com')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Log out/ })).toBeInTheDocument()
  })

  it('halaman detail menampilkan breadcrumb dan tombol kembali', () => {
    renderNavbar('/games/abc-123')
    const parentLink = screen.getByRole('link', { name: 'Games' })
    expect(parentLink).toHaveAttribute('href', '/games')
    expect(screen.getByRole('heading', { name: 'abc-123' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument()
  })

  it('halaman biasa tanpa breadcrumb maupun tombol kembali', () => {
    renderNavbar('/games')
    expect(screen.getByRole('heading', { name: 'Games' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Go back' }),
    ).not.toBeInTheDocument()
  })

  // Sejak RBAC, noc memegang security.2fa.manage: sebelumnya noc tidak bisa
  // mengatur 2FA sendiri padahal login noc juga melewati gate MFA.
  it('menampilkan tautan keamanan akun untuk role noc', () => {
    mockUseAuthUser.mockReturnValue(asRole('noc'))
    renderNavbar('/')
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(
      screen.getByRole('link', { name: /Account security/ }),
    ).toHaveAttribute('href', '/2fa-setup')
  })

  it('menyembunyikan tautan keamanan akun dari sesi tanpa permission', () => {
    mockUseAuthUser.mockReturnValue({ ...asRole('noc'), permissions: [] })
    renderNavbar('/')
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(
      screen.queryByRole('link', { name: /Account security/ }),
    ).not.toBeInTheDocument()
  })

  it('menampilkan tautan keamanan akun untuk role admin', () => {
    renderNavbar('/')
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(
      screen.getByRole('link', { name: /Account security/ }),
    ).toHaveAttribute('href', '/2fa-setup')
  })
})
