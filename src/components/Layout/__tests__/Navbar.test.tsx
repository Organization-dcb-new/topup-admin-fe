import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from '@/components/Layout/navbar'
import { useAuthUser } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({
  useAuthUser: vi.fn(),
  logout: vi.fn(),
}))

const mockUseAuthUser = vi.mocked(useAuthUser)

const renderNavbar = (initialPath = '/', onOpenMobile = vi.fn()) => {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar onOpenMobile={onOpenMobile} />
    </MemoryRouter>,
  )
  return onOpenMobile
}

describe('Navbar', () => {
  beforeEach(() => {
    mockUseAuthUser.mockReturnValue({
      isAuthenticated: true,
      isMfaRequired: false,
      role: 'admin',
      user: { username: 'vian', email: 'vian@example.com', role: 'admin' },
      isLoading: false,
    })
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
})
