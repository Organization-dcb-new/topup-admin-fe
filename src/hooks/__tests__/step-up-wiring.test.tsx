import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'

import { api } from '@/api/axios'
import { useAdminMutation, useCreateAdmin } from '@/hooks/useAdmin'
import { useDeleteRole, useSetRolePermissions } from '@/hooks/useRoles'
import { STEP_UP_HEADER } from '@/lib/step-up'

vi.mock('@/api/axios', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const mockApi = vi.mocked(api)
const mockToast = vi.mocked(toast)

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const stepUpRejection = (message: string) => ({ response: { data: { message } } })

/**
 * Membuktikan kode OTP benar-benar sampai ke server sebagai header, bukan
 * berhenti di state komponen. Ini satu-satunya jalur yang membuat gate di
 * backend bisa dipenuhi dari UI.
 */
describe('mutasi admin membawa kode step-up', () => {
  beforeEach(() => vi.clearAllMocks())

  it('update role mengirim kode sebagai header X-2FA-Code', async () => {
    mockApi.put.mockResolvedValue({ data: {} })
    const { result } = renderHook(() => useAdminMutation(), { wrapper })

    result.current.updateRole.mutate({ id: 'a-1', roleId: 'r-9', otp: '123456' })

    await waitFor(() => expect(mockApi.put).toHaveBeenCalled())
    expect(mockApi.put).toHaveBeenCalledWith(
      '/admin/users/a-1',
      { role_id: 'r-9' },
      { headers: { [STEP_UP_HEADER]: '123456' } },
    )
  })

  // Admin tanpa 2FA tidak punya kode untuk dikirim; header kosong hanya akan
  // memicu preflight tanpa menambah apa pun.
  it('update role tanpa kode tidak memasang header', async () => {
    mockApi.put.mockResolvedValue({ data: {} })
    const { result } = renderHook(() => useAdminMutation(), { wrapper })

    result.current.updateRole.mutate({ id: 'a-1', roleId: 'r-9' })

    await waitFor(() => expect(mockApi.put).toHaveBeenCalled())
    expect(mockApi.put).toHaveBeenCalledWith('/admin/users/a-1', { role_id: 'r-9' }, {})
  })

  it('hapus admin mengirim kode sebagai header', async () => {
    mockApi.delete.mockResolvedValue({ data: {} })
    const { result } = renderHook(() => useAdminMutation(), { wrapper })

    result.current.deleteAdmin.mutate({ id: 'a-2', otp: '654321' })

    await waitFor(() => expect(mockApi.delete).toHaveBeenCalled())
    expect(mockApi.delete).toHaveBeenCalledWith('/admin/users/a-2', {
      headers: { [STEP_UP_HEADER]: '654321' },
    })
  })

  it('buat admin mengirim kode sebagai header, bukan sebagai field body', async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const { result } = renderHook(() => useCreateAdmin(), { wrapper })

    result.current.mutate({
      username: 'baru',
      email: 'baru@example.com',
      password: 'rahasia',
      full_name: 'Admin Baru',
      role_id: 'r-1',
      confirm_admin_password: 'sandiku',
      otp: '111222',
    })

    await waitFor(() => expect(mockApi.post).toHaveBeenCalled())
    const [url, body, config] = mockApi.post.mock.calls[0]
    expect(url).toBe('/admin/users')
    expect(body).not.toHaveProperty('otp')
    expect(config).toEqual({ headers: { [STEP_UP_HEADER]: '111222' } })
  })

  it('ganti permission role mengirim kode sebagai header, bukan sebagai field body', async () => {
    mockApi.put.mockResolvedValue({ data: {} })
    const { result } = renderHook(() => useSetRolePermissions('r-7'), { wrapper })

    result.current.mutate({ permission_codes: ['game.view'], otp: '333444' })

    await waitFor(() => expect(mockApi.put).toHaveBeenCalled())
    const [url, body, config] = mockApi.put.mock.calls[0]
    expect(url).toBe('/admin/roles/r-7/permissions')
    expect(body).not.toHaveProperty('otp')
    expect(config).toEqual({ headers: { [STEP_UP_HEADER]: '333444' } })
  })

  it('hapus role mengirim kode sebagai header', async () => {
    mockApi.delete.mockResolvedValue({ data: {} })
    const { result } = renderHook(() => useDeleteRole(), { wrapper })

    result.current.mutate({ id: 'r-3', otp: '777888' })

    await waitFor(() => expect(mockApi.delete).toHaveBeenCalled())
    expect(mockApi.delete).toHaveBeenCalledWith('/admin/roles/r-3', {
      headers: { [STEP_UP_HEADER]: '777888' },
    })
  })
})

/**
 * Penolakan gate 2FA ditampilkan di kolom OTP tempat kodenya diketik. Kalau
 * hook ikut menoast-kannya, satu kode salah muncul dua kali di dua tempat.
 */
describe('penolakan gate 2FA tidak menghasilkan toast kedua', () => {
  beforeEach(() => vi.clearAllMocks())

  it('menahan toast untuk penolakan step-up', async () => {
    mockApi.put.mockRejectedValue(stepUpRejection('STEP_UP_INVALID'))
    const { result } = renderHook(() => useAdminMutation(), { wrapper })

    result.current.updateRole.mutate({ id: 'a-1', roleId: 'r-9', otp: '000000' })

    await waitFor(() => expect(result.current.updateRole.isError).toBe(true))
    expect(mockToast.error).not.toHaveBeenCalled()
  })

  it('menahan toast saat hapus role ditolak gate 2FA', async () => {
    mockApi.delete.mockRejectedValue(stepUpRejection('STEP_UP_REUSED'))
    const { result } = renderHook(() => useDeleteRole(), { wrapper })

    result.current.mutate({ id: 'r-3', otp: '777888' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToast.error).not.toHaveBeenCalled()
  })

  // Role yang masih dipegang admin ditolak 409 oleh service, bukan oleh gate
  // 2FA — penolakan itu harus tetap sampai ke operator sebagai toast.
  it('tetap menoast-kan penolakan role masih dipakai', async () => {
    mockApi.delete.mockRejectedValue(stepUpRejection('role masih dipakai admin'))
    const { result } = renderHook(() => useDeleteRole(), { wrapper })

    result.current.mutate({ id: 'r-3', otp: '777888' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToast.error).toHaveBeenCalled()
  })

  it('tetap menoast-kan kegagalan lain', async () => {
    mockApi.put.mockRejectedValue(stepUpRejection('access denied: insufficient permissions'))
    const { result } = renderHook(() => useAdminMutation(), { wrapper })

    result.current.updateRole.mutate({ id: 'a-1', roleId: 'r-9' })

    await waitFor(() => expect(result.current.updateRole.isError).toBe(true))
    expect(mockToast.error).toHaveBeenCalled()
  })
})
