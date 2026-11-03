import type { ElementType } from 'react'
import {
  AlertTriangle,
  Banknote,
  Boxes,
  Building2,
  Construction,
  CreditCard,
  FileText,
  FolderTree,
  FormInput,
  Gamepad2,
  Gauge,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  ListOrdered,
  Package,
  Shield,
  ClipboardList,
  Tags,
  Tv,
  Users,
  Wallet,
  WalletCards,
  Percent,
  UserCog,
} from 'lucide-react'

import { PERM, type Permission } from '@/constants/permissions'

export type SidebarMenu = {
  label: string
  icon: ElementType
  path?: string
  /** Needed to see the item (and open its route); groups show when any child is visible. */
  permission?: Permission
  /** For pages with no permission in the backend catalog yet. */
  devOnly?: boolean
  children?: SidebarMenu[]
}

export type SidebarSection = {
  title?: string
  menus: SidebarMenu[]
}

export const sidebarMenus: SidebarSection[] = [
  {
    menus: [
      {
        label: 'Dasbor',
        icon: LayoutDashboard,
        path: '/',
        permission: PERM.dashboardView,
      },
      {
        label: 'Transaksi',
        icon: Wallet,
        children: [
          { label: 'Ikhtisar', path: '/transactions', icon: LayoutDashboard, permission: PERM.transactionView },
          { label: 'Cashflow', path: '/cashflow', icon: Banknote, permission: PERM.cashflowView },
          { label: 'Pesanan', path: '/orders', icon: ListOrdered, permission: PERM.orderView },
        ],
      },
      {
        label: 'Konten',
        icon: ImageIcon,
        children: [
          { label: 'Banner', path: '/banners', icon: ImageIcon, permission: PERM.bannerView },
          { label: 'Acara', path: '/shows', icon: Tv, permission: PERM.showView },
          { label: 'Artikel', path: '/blog', icon: FileText, permission: PERM.blogView },
        ],
      },
    ],
  },
  {
    title: 'Data master',
    menus: [
      {
        label: 'Inventaris',
        icon: Package,
        children: [
          { label: 'Game', icon: Gamepad2, path: '/games', permission: PERM.gameView },
          { label: 'Produk', icon: Boxes, path: '/products', permission: PERM.productView },
          {
            label: 'Kategori produk',
            icon: Tags,
            path: '/category-product',
            permission: PERM.categoryProductView,
          },
          { label: 'Produk anomali', icon: AlertTriangle, path: '/anomaly', permission: PERM.productViewAnomaly },
          { label: 'Kategori', icon: FolderTree, path: '/categories', permission: PERM.categoryView },
          { label: 'Field input', icon: FormInput, path: '/input', permission: PERM.gameInputUpdate },
          { label: 'Log callback produk', icon: ClipboardList, path: '/products/callback-logs', permission: PERM.productViewCallbackLog },
        ],
      },
      {
        label: 'Pembayaran',
        icon: CreditCard,
        children: [
          { label: 'Metode', icon: CreditCard, path: '/payment-methods', permission: PERM.paymentMethodView },
          {
            label: 'Kategori pembayaran',
            icon: WalletCards,
            path: '/payment-methods-categories',
            permission: PERM.paymentCategoryView,
          },
        ],
      },
      {
        label: 'Penyedia',
        icon: Building2,
        path: '/provider',
        permission: PERM.providerView,
      },
      {
        label: 'Referral',
        icon: Percent,
        path: '/referral-codes',
        permission: PERM.referralView,
      },
      {
        label: 'Keamanan',
        icon: Shield,
        children: [
          {
            label: '2FA',
            icon: KeyRound,
            path: '/2fa-setup',
            permission: PERM.security2faManage,
          },
          {
            label: 'Pembatas laju',
            icon: Gauge,
            path: '/rate-limit',
            devOnly: true,
          },
          {
            label: 'Pemeliharaan',
            icon: Construction,
            path: '/maintenances',
            permission: PERM.maintenanceView,
          },
          {
            label: 'Pengguna',
            icon: Users,
            path: '/admin',
            permission: PERM.adminView,
          },
          {
            label: 'Role & akses',
            icon: UserCog,
            path: '/roles',
            permission: PERM.roleView,
          },
          {
            label: 'Log admin',
            icon: ClipboardList,
            path: '/admin-logs',
            permission: PERM.adminLogView,
          },
        ],
      },
    ],
  },
]
