import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authStorage } from '@/lib/auth'
import { pageTitleMap } from '@/lib/title-map'
import { useLocation } from 'react-router-dom'

interface TopbarProps {
  onOpenMobile: () => void
}

export function logout() {
  authStorage.clearToken()
  window.location.href = '/login'
}

export function Topbar({ onOpenMobile }: TopbarProps) {
  const { pathname } = useLocation()

  const title = pageTitleMap[pathname] ?? 'Dashboard'
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobile}>
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2 cursor-pointer" onClick={logout}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  )
}
