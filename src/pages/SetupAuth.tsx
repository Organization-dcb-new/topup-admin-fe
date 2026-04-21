import Setup2FA from '@/components/Auth/Setup2Fa'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'

export default function Setup2FAPage() {
  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <Setup2FA />
      </div>
    </DashboardLayout>
  )
}
