import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CommandPalette } from '@/components/Layout/CommandPalette'
import { useAuthUser } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({
  useAuthUser: vi.fn(),
}))

const mockUseAuthUser = vi.mocked(useAuthUser)

const asRole = (role: string | null) => ({
  isAuthenticated: !!role,
  isMfaRequired: false,
  role,
  user: role ? { username: 'vian', role } : null,
  isLoading: false,
})

const renderPalette = (onOpenChange = vi.fn()) => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path='/'
          element={<CommandPalette open onOpenChange={onOpenChange} />}
        />
        <Route path='/games' element={<p>halaman-games</p>} />
      </Routes>
    </MemoryRouter>,
  )
  return onOpenChange
}

describe('CommandPalette', () => {
  beforeEach(() => vi.clearAllMocks())

  it('menampilkan halaman yang boleh diakses role dev', () => {
    mockUseAuthUser.mockReturnValue(asRole('dev'))
    renderPalette()
    expect(screen.getByRole('option', { name: /Dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Users/i })).toBeInTheDocument()
  })

  it('menyembunyikan halaman khusus dev dari role noc', () => {
    mockUseAuthUser.mockReturnValue(asRole('noc'))
    renderPalette()
    expect(screen.getByRole('option', { name: /Games/ })).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: /Rate limit/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: /Users/i }),
    ).not.toBeInTheDocument()
  })

  it('role kosong tidak menampilkan halaman apa pun', () => {
    mockUseAuthUser.mockReturnValue(asRole(null))
    renderPalette()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('memilih item menavigasi dan menutup palette', () => {
    mockUseAuthUser.mockReturnValue(asRole('dev'))
    const onOpenChange = renderPalette()
    fireEvent.click(screen.getByRole('option', { name: /Games/ }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByText('halaman-games')).toBeInTheDocument()
  })
})
