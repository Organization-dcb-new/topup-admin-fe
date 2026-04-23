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
} from 'lucide-react'

export type SidebarMenu = {
  label: string
  icon: ElementType
  path?: string
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
      },
      {
        label: 'Transaksi',
        icon: Wallet,
        children: [
          { label: 'Ikhtisar', path: '/transactions', icon: LayoutDashboard },
          { label: 'Rekap', path: '/summary', icon: Banknote },
          { label: 'Pesanan', path: '/orders', icon: ListOrdered },
        ],
      },
      {
        label: 'Konten',
        icon: ImageIcon,
        children: [
          { label: 'Banner', path: '/banners', icon: ImageIcon },
          { label: 'Acara', path: '/shows', icon: Tv },
          { label: 'Artikel', path: '/blog', icon: FileText },
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
          { label: 'Game', icon: Gamepad2, path: '/games' },
          { label: 'Produk', icon: Boxes, path: '/products' },
          {
            label: 'Kategori produk',
            icon: Tags,
            path: '/category-product',
          },
          { label: 'Produk anomali', icon: AlertTriangle, path: '/anomaly' },
          { label: 'Kategori', icon: FolderTree, path: '/categories' },
          { label: 'Field input', icon: FormInput, path: '/input' },
        ],
      },
      {
        label: 'Pembayaran',
        icon: CreditCard,
        children: [
          { label: 'Metode', icon: CreditCard, path: '/payment-methods' },
          {
            label: 'Kategori pembayaran',
            icon: WalletCards,
            path: '/payment-methods-categories',
          },
        ],
      },
      {
        label: 'Penyedia',
        icon: Building2,
        path: '/provider',
      },
      {
        label: 'Keamanan',
        icon: Shield,
        children: [
          {
            label: '2FA',
            icon: KeyRound,
            path: '/2fa-setup',
          },
          {
            label: 'Pembatas laju',
            icon: Gauge,
            path: '/rate-limit',
          },
          {
            label: 'Pemeliharaan',
            icon: Construction,
            path: '/maintenances',
          },
          {
            label: 'Pengguna',
            icon: Users,
            path: '/admin',
          },
          {
            label: 'Log admin',
            icon: ClipboardList,
            path: '/admin-logs',
          },
        ],
      },
    ],
  },
]
