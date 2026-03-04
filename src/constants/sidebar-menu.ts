// sidebar-menu.ts
import {
  Home,
  CreditCard,
  Boxes,
  Gamepad2,
  Wallet,
  GalleryHorizontal,
  Images,
  ListOrdered,
  Notebook,
  LucideWalletCards,
} from 'lucide-react'
import { MdOutlineCategory, MdCorporateFare, MdFormatListBulleted } from 'react-icons/md'
import { HiCash } from 'react-icons/hi'

import { TbCategoryPlus } from 'react-icons/tb'

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
        label: 'Spending',
        icon: HiCash,
        path: '/spending',
      },
      {
        label: 'Blog',
        icon: Notebook,
        path: '/blog',
      },

      {
        label: 'Transactions',
        icon: Wallet,
        path: '/transactions',
      },
      {
        label: 'Order',
        icon: ListOrdered,
        path: '/orders',
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
        label: 'Category Product',
        icon: TbCategoryPlus,
        path: '/category-product',
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
        label: 'Payment Method Categories',
        icon: LucideWalletCards,
        path: '/payment-methods-categories',
      },
      {
        label: 'Provider',
        icon: MdCorporateFare,
        path: '/provider',
      },
    ],
  },
]
