import { useContext } from 'react'

import { AppFrame } from './app-shell'
import { AppShellContext } from './shell-context'

/**
 * Pages still wrap themselves in this. Inside the persistent `AppShell` route it only passes the
 * content through, so the sidebar is not remounted on every navigation.
 */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const inShell = useContext(AppShellContext)
  if (inShell) return <>{children}</>
  return <AppFrame>{children}</AppFrame>
}
