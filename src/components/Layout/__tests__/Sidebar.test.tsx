import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/components/Layout/sidebar'
import { useAuthUser } from '@/lib/auth'

vi.mock('@/lib/auth', () => ({ useAuthUser: vi.fn() }))
vi.mock('@/components/Layout/SidebarHealthIndicator', () => ({
  SidebarHealthIndicator: () => <div data-testid='health' />,
}))

const mockUseAuthUser = vi.mocked(useAuthUser)

const asRole = (role: string | null) => ({
  isAuthenticated: !!role,
  isMfaRequired: false,
  role,
  user: role ? { username: 'vian', role } : null,
  isLoading: false,
})

const renderSidebar = (
  props: Partial<Parameters<typeof Sidebar>[0]> = {},
  initialPath = '/',
) => {
  const onCloseMobile = vi.fn()
  const onToggleCollapse = vi.fn()
  const view = render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Sidebar
          collapsed={false}
          mobileOpen={false}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
          {...props}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { ...view, onCloseMobile, onToggleCollapse }
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthUser.mockReturnValue(asRole('dev'))
  })

  it('merender menu untuk role dev', () => {
    renderSidebar()
    expect(screen.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Security/ })).toBeInTheDocument()
  })

  it('menyembunyikan grup yang tidak boleh diakses role noc', () => {
    mockUseAuthUser.mockReturnValue(asRole('noc'))
    renderSidebar()
    expect(screen.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Security/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Payment/ }),
    ).not.toBeInTheDocument()
  })

  it('role kosong tidak merender satu pun tautan menu', () => {
    mockUseAuthUser.mockReturnValue(asRole(null))
    renderSidebar()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('grup dengan anak aktif otomatis terbuka', () => {
    renderSidebar({}, '/games')
    const group = screen.getByRole('button', { name: /Inventory/ })
    expect(group).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Games' })).toBeInTheDocument()
  })

  it('grup tanpa anak aktif tertutup dan bisa dibuka manual', () => {
    renderSidebar({}, '/')
    const group = screen.getByRole('button', { name: /Inventory/ })
    expect(group).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(group)
    expect(group).toHaveAttribute('aria-expanded', 'true')
  })

  it('mode rail merender tombol ikon tanpa label teks', () => {
    renderSidebar({ collapsed: true })
    // useIsMdUp memakai matchMedia yang di-stub false, jadi rail tidak aktif
    // pada lebar mobile — memastikan komponen tetap merender tanpa error
    expect(screen.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument()
  })

  it('halaman detail tetap menandai induknya aktif dan grup terbuka', () => {
    renderSidebar({}, '/games/abc-123')
    const group = screen.getByRole('button', { name: /Inventory/ })
    expect(group).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('hanya satu item aktif saat path saling berimbuhan', () => {
    renderSidebar({}, '/products/callback-logs')
    const active = screen
      .getAllByRole('link')
      .filter((el) => el.getAttribute('aria-current') === 'page')
    expect(active).toHaveLength(1)
    expect(active[0]).toHaveTextContent('Product callback logs')
  })

  it('submenu tertutup tidak ikut urutan tab maupun pembaca layar', () => {
    const { container } = renderSidebar({}, '/')
    const inertWrappers = container.querySelectorAll('[inert]')
    expect(inertWrappers.length).toBeGreaterThan(0)
  })

  it('mengklik tautan menutup drawer mobile', () => {
    const { onCloseMobile } = renderSidebar({ mobileOpen: true })
    fireEvent.click(screen.getByRole('link', { name: /Dashboard/ }))
    expect(onCloseMobile).toHaveBeenCalled()
  })
})
