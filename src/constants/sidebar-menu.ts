import type { ElementType } from 'react'
// Phosphor duotone instead of the stock Lucide set, so the nav doesn't read as a default template.
import {
  PiArticleDuotone,
  PiCardholderDuotone,
  PiChartLineUpDuotone,
  PiClockCounterClockwiseDuotone,
  PiCoinsDuotone,
  PiCreditCardDuotone,
  PiDiamondDuotone,
  PiFlagBannerDuotone,
  PiGameControllerDuotone,
  PiHandshakeDuotone,
  PiIdentificationBadgeDuotone,
  PiImagesDuotone,
  PiKeyDuotone,
  PiLockKeyDuotone,
  PiPackageDuotone,
  PiPlugsConnectedDuotone,
  PiReceiptDuotone,
  PiShieldCheckDuotone,
  PiShoppingBagOpenDuotone,
  PiSquaresFourDuotone,
  PiStorefrontDuotone,
  PiTagDuotone,
  PiTextboxDuotone,
  PiTicketDuotone,
  PiUsersThreeDuotone,
  PiWalletDuotone,
  PiWarningDiamondDuotone,
  PiWrenchDuotone,
} from 'react-icons/pi'

import { PERM, type Permission } from '@/constants/permissions'

export type SidebarMenu = {
  label: string
  icon: ElementType
  path?: string
  /** Needed to see the item (and open its route); groups show when any child is visible. */
  permission?: Permission
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
        icon: PiSquaresFourDuotone,
        path: '/',
        permission: PERM.dashboardView,
      },
      {
        label: 'Transaksi',
        icon: PiReceiptDuotone,
        children: [
          { label: 'Ikhtisar', path: '/transactions', icon: PiChartLineUpDuotone, permission: PERM.transactionView },
          { label: 'Cashflow', path: '/cashflow', icon: PiCoinsDuotone, permission: PERM.cashflowView },
          { label: 'Pesanan', path: '/orders', icon: PiShoppingBagOpenDuotone, permission: PERM.orderView },
          { label: 'Pelanggan', path: '/customers', icon: PiUsersThreeDuotone, permission: PERM.customerView },
        ],
      },
      {
        label: 'Konten',
        icon: PiImagesDuotone,
        children: [
          { label: 'Banner', path: '/banners', icon: PiFlagBannerDuotone, permission: PERM.bannerView },
          { label: 'Acara', path: '/shows', icon: PiStorefrontDuotone, permission: PERM.showView },
          { label: 'Artikel', path: '/blog', icon: PiArticleDuotone, permission: PERM.blogView },
        ],
      },
    ],
  },
  {
    title: 'Data master',
    menus: [
      {
        label: 'Inventaris',
        icon: PiPackageDuotone,
        children: [
          { label: 'Game', icon: PiGameControllerDuotone, path: '/games', permission: PERM.gameView },
          { label: 'Produk', icon: PiDiamondDuotone, path: '/products', permission: PERM.productView },
          {
            label: 'Kategori produk',
            icon: PiTagDuotone,
            path: '/category-product',
            permission: PERM.categoryProductView,
          },
          { label: 'Produk anomali', icon: PiWarningDiamondDuotone, path: '/anomaly', permission: PERM.productViewAnomaly },
          { label: 'Field input', icon: PiTextboxDuotone, path: '/input', permission: PERM.gameInputUpdate },
          { label: 'Log callback produk', icon: PiPlugsConnectedDuotone, path: '/products/callback-logs', permission: PERM.productViewCallbackLog },
        ],
      },
      {
        label: 'Pembayaran',
        icon: PiWalletDuotone,
        children: [
          { label: 'Metode', icon: PiCreditCardDuotone, path: '/payment-methods', permission: PERM.paymentMethodView },
          {
            label: 'Kategori pembayaran',
            icon: PiCardholderDuotone,
            path: '/payment-methods-categories',
            permission: PERM.paymentCategoryView,
          },
        ],
      },
      {
        label: 'Penyedia',
        icon: PiHandshakeDuotone,
        path: '/provider',
        permission: PERM.providerView,
      },
      {
        label: 'Referral',
        icon: PiTicketDuotone,
        path: '/referral-codes',
        permission: PERM.referralView,
      },
      {
        label: 'Keamanan',
        icon: PiShieldCheckDuotone,
        children: [
          {
            label: '2FA',
            icon: PiKeyDuotone,
            path: '/2fa-setup',
            permission: PERM.security2faManage,
          },
          {
            label: 'Pemeliharaan',
            icon: PiWrenchDuotone,
            path: '/maintenances',
            permission: PERM.maintenanceView,
          },
          {
            label: 'Pengguna',
            icon: PiIdentificationBadgeDuotone,
            path: '/admin',
            permission: PERM.adminView,
          },
          {
            label: 'Role & akses',
            icon: PiLockKeyDuotone,
            path: '/roles',
            permission: PERM.roleView,
          },
          {
            label: 'Log admin',
            icon: PiClockCounterClockwiseDuotone,
            path: '/admin-logs',
            permission: PERM.adminLogView,
          },
        ],
      },
    ],
  },
]
