import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authStorage } from '@/lib/auth'
import { pageTitleMap } from '@/lib/title-map'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

interface TopbarProps {
  onOpenMobile: () => void
}

export async function logout(): Promise<void> {
  try {
    authStorage.clearToken()
    toast.success('Berhasil logout')
    window.location.href = '/login'
  } catch (error) {
    console.error(error)
    toast.error('Gagal logout, coba lagi!')
  }
}

export function Topbar({ onOpenMobile }: TopbarProps) {
  const { pathname } = useLocation()
  const title = pageTitleMap[pathname] ?? 'Dashboard'
  const [openLogoutModal, setOpenLogoutModal] = useState(false)

  return (
    <>
      <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobile}>
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer"
            onClick={() => setOpenLogoutModal(true)}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>
      {/* Modal Konfirmasi Logout */}
      <Dialog open={openLogoutModal} onOpenChange={setOpenLogoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin logout?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setOpenLogoutModal(false)}
            >
              Batal
            </Button>
            <Button
              className="cursor-pointer"
              variant="destructive"
              onClick={async () => {
                await logout()
                setOpenLogoutModal(false)
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
