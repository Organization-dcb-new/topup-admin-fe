import Setup2FA from '@/components/Auth/Setup2Fa'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'

export default function Setup2FAPage() {
  return (
    <DashboardLayout>
      {/* Alur linear satu tugas — dibatasi agar mata tidak menyeberangi
          layar lebar; halaman tabel tetap memakai max-w-7xl */}
      <div className='mx-auto max-w-3xl'>
        <Setup2FA />
      </div>
    </DashboardLayout>
  )
}
