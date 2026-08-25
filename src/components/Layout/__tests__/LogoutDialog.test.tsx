import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { LogoutDialog } from '@/components/Layout/LogoutDialog'
import { apiLogout } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({
  apiLogout: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const mockApiLogout = vi.mocked(apiLogout)
const mockToast = vi.mocked(toast)

const renderDialog = (onOpenChange = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path='/'
            element={<LogoutDialog open onOpenChange={onOpenChange} />}
          />
          <Route path='/login' element={<p>halaman-login</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return onOpenChange
}

const clickLogout = () =>
  fireEvent.click(screen.getByRole('button', { name: /Log out/ }))

describe('LogoutDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('menampilkan judul dan deskripsi konfirmasi', () => {
    renderDialog()
    expect(screen.getByText('Confirm log out')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to log out?'),
    ).toBeInTheDocument()
  })

  it('logout sukses: navigasi ke /login dan menampilkan toast', async () => {
    mockApiLogout.mockResolvedValue(undefined)
    renderDialog()
    clickLogout()

    await waitFor(() =>
      expect(screen.getByText('halaman-login')).toBeInTheDocument(),
    )
    expect(mockApiLogout).toHaveBeenCalledTimes(1)
    expect(mockToast.success).toHaveBeenCalledWith('Logged out successfully')
  })

  it('logout gagal: tetap di halaman dan menampilkan pesan error', async () => {
    mockApiLogout.mockRejectedValue({ response: { status: 500, data: {} } })
    renderDialog()
    clickLogout()

    await waitFor(() => expect(mockToast.error).toHaveBeenCalled())
    expect(screen.queryByText('halaman-login')).not.toBeInTheDocument()
    expect(mockToast.success).not.toHaveBeenCalled()
  })

  it('menonaktifkan tombol dan tidak mengirim permintaan ganda saat memproses', async () => {
    mockApiLogout.mockImplementation(() => new Promise(() => {}))
    renderDialog()
    clickLogout()

    const pendingButton = await screen.findByRole('button', {
      name: /Logging out/,
    })
    expect(pendingButton).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()

    fireEvent.click(pendingButton)
    expect(mockApiLogout).toHaveBeenCalledTimes(1)
  })
})
