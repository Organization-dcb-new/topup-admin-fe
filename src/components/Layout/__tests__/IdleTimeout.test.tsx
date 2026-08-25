import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { IdleTimeout } from '@/components/Layout/IdleTimeout'
import { apiLogout } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({ apiLogout: vi.fn() }))
vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), { dismiss: vi.fn() }),
}))

const mockApiLogout = vi.mocked(apiLogout)
const mockToast = vi.mocked(toast)

const IDLE_MS = 30 * 60 * 1000
const WARNING_MS = 60 * 1000

const renderIdle = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path='/' element={<IdleTimeout />} />
          <Route path='/login' element={<p>halaman-login</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('IdleTimeout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockApiLogout.mockResolvedValue(undefined)
  })
  afterEach(() => vi.useRealTimers())

  it('belum melakukan apa pun sebelum ambang peringatan', () => {
    renderIdle()
    act(() => {
      vi.advanceTimersByTime(IDLE_MS - WARNING_MS - 1000)
    })
    expect(mockToast).not.toHaveBeenCalled()
    expect(mockApiLogout).not.toHaveBeenCalled()
  })

  it('menampilkan peringatan satu menit sebelum sesi berakhir', () => {
    renderIdle()
    act(() => {
      vi.advanceTimersByTime(IDLE_MS - WARNING_MS)
    })
    expect(mockToast).toHaveBeenCalledTimes(1)
    expect(mockApiLogout).not.toHaveBeenCalled()
  })

  it('logout dan pindah ke /login setelah batas idle terlampaui', async () => {
    renderIdle()
    await act(async () => {
      vi.advanceTimersByTime(IDLE_MS)
      await Promise.resolve()
    })
    expect(mockApiLogout).toHaveBeenCalledTimes(1)
    expect(screen.getByText('halaman-login')).toBeInTheDocument()
  })

  it('aktivitas pengguna menyetel ulang hitungan mundur', () => {
    renderIdle()
    act(() => {
      vi.advanceTimersByTime(IDLE_MS - WARNING_MS - 5000)
    })
    act(() => {
      window.dispatchEvent(new Event('mousedown'))
      vi.advanceTimersByTime(IDLE_MS - WARNING_MS - 5000)
    })
    expect(mockToast).not.toHaveBeenCalled()
    expect(mockApiLogout).not.toHaveBeenCalled()
  })

  it('membersihkan timer saat unmount', () => {
    const { unmount } = renderIdle()
    unmount()
    act(() => {
      vi.advanceTimersByTime(IDLE_MS * 2)
    })
    expect(mockApiLogout).not.toHaveBeenCalled()
  })
})
