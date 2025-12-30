// sidebar-menu.ts
import { Home, CreditCard, Boxes, Gamepad2, Wallet } from 'lucide-react'
import { MdOutlineCategory, MdCorporateFare } from 'react-icons/md'

export type SidebarMenu = {
  label: string
  icon: React.ElementType
  path?: string
}

export type SidebarSection = {
  title?: string
  menus: SidebarMenu[]
}

export const sidebarMenus: SidebarSection[] = [
  {
    menus: [
      {
        label: 'Dashboard',
        icon: Home,
        path: '/',
      },
      {
        label: 'Transactions',
        icon: Wallet,
        path: '/transactions',
      },
    ],
  },
  {
    title: 'Master Data',
    menus: [
      {
        label: 'Games',
        icon: Gamepad2,
        path: '/games',
      },
      {
        label: 'Category',
        icon: MdOutlineCategory,
        path: '/categories',
      },
      {
        label: 'Product',
        icon: Boxes,
        path: '/products',
      },
      {
        label: 'Payment Method',
        icon: CreditCard,
        path: '/payment-methods',
      },
      {
        label: 'Provider',
        icon: MdCorporateFare,
        path: '/provider',
      },
    ],
  },
]
