// sidebar-menu.ts
import { Home, CreditCard, Boxes, Gamepad2, Wallet, GalleryHorizontal, Images } from 'lucide-react'
import { MdOutlineCategory, MdCorporateFare, MdFormatListBulleted } from 'react-icons/md'

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
      {
        label: 'Banner',
        icon: GalleryHorizontal,
        path: '/banners',
      },
      {
        label: 'Show',
        icon: Images,
        path: '/shows',
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
        label: 'Input',
        icon: MdFormatListBulleted,
        path: '/input',
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
