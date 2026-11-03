import { createContext } from 'react'

/** True inside the persistent app shell, where `DashboardLayout` must not render a second frame. */
export const AppShellContext = createContext(false)
