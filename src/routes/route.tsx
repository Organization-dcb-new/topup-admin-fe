import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from '../pages/Login'
import DashboardPage from '@/pages/Dashboard'
import TransactionPage from '@/pages/Transaction'
import GamePage from '@/pages/Game'
import GameDetailPage from '@/pages/GameDetail'
import ProductPage from '@/pages/Product'
import PaymentMethodPage from '@/pages/PaymentMethod'
import ProviderPages from '@/pages/Provider'
import SupplierCatalogPage from '@/pages/SupplierCatalog'
import ReferralPage from '@/pages/Referral'
import ReferralDetailPage from '@/pages/ReferralDetail'
import PaymentDetailPage from '@/pages/TransactionDetail'
import BannerPage from '@/pages/Banner'
import ShowPage from '@/pages/Show'
import InputPages from '@/pages/Input'
import OrderPages from '@/pages/Order'
import CategoryProduct from '@/pages/CategoryProduct'
import PaymentMethodCategoryPages from '@/pages/PaymentMethodCategory'
import SpendingPages from '@/pages/Summary'
import BlogPage from '@/pages/Blog'
import CashflowPage from '@/pages/Cashflow'
import VerifyOtpPage from '@/pages/VerifyOTP'
import Setup2FAPage from '@/pages/SetupAuth'
import Required2FAPage from '@/pages/Required2FA'
import AdminManagementPage from '@/pages/Admin'
import MaintenancePage from '@/pages/Maintenance'
import AdminLogPage from '@/pages/AdminLog'
import AdminLogDetailPage from '@/pages/AdminLogDetail'
import ActivityLogPage from '@/pages/ActivityLog'
import ActivityLogDetailPage from '@/pages/ActivityLogDetail'
import CustomerPage from '@/pages/Customer'
import CustomerDetailPage from '@/pages/CustomerDetail'
import { RoleGuard } from '@/components/Auth/RoleGuard'
import { AuthLayout } from '@/components/Auth/AuthLayout'
import { AppShell } from '@/components/Layout/app-shell'
import UnauthorizedPage from '@/pages/Unauthorized'
import AnomalyProduct from '@/pages/AnomalyProduct'
import ProductCallbackLogPage from '@/pages/ProductCallbackLog'
import ProductCallbackLogDetailPage from '@/pages/ProductCallbackLogDetail'
import PaymentCallbackLogPage from '@/pages/PaymentCallbackLog'
import PaymentCallbackLogDetailPage from '@/pages/PaymentCallbackLogDetail'
import ProviderOrderLogPage from '@/pages/ProviderOrderLog'
import ProviderOrderLogDetailPage from '@/pages/ProviderOrderLogDetail'
import NotFoundPage from '@/pages/NotFound'
import RolesPage from '@/pages/Roles'
import RoleEditorPage from '@/pages/RoleEditor'
import { PERM } from '@/constants/permissions'
import { REQUIRED_2FA_PATH } from '@/lib/auth'

const router = createBrowserRouter([
  {
    // Pathless layout: the auth shell stays mounted while moving between login and OTP.
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/verify-otp',
        element: <VerifyOtpPage />,
      },
      {
        path: REQUIRED_2FA_PATH,
        element: <Required2FAPage />,
      },
    ],
  },
  {
    path: '/',
    // Persistent dashboard chrome: the sidebar mounts once instead of once per page.
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <RoleGuard permission={PERM.dashboardView}>
            <DashboardPage />
          </RoleGuard>
        ),
      },
      {
        path: 'summary',
        element: (
          <RoleGuard permission={PERM.summaryView}>
            <SpendingPages />
          </RoleGuard>
        ),
      },
      {
        path: 'cashflow',
        element: (
          <RoleGuard permission={PERM.cashflowView}>
            <CashflowPage />
          </RoleGuard>
        ),
      },
      {
        path: 'blog',
        element: (
          <RoleGuard permission={PERM.blogView}>
            <BlogPage />
          </RoleGuard>
        ),
      },
      {
        path: 'shows',
        element: (
          <RoleGuard permission={PERM.showView}>
            <ShowPage />
          </RoleGuard>
        ),
      },
      {
        path: 'orders',
        element: (
          <RoleGuard permission={PERM.orderView}>
            <OrderPages />
          </RoleGuard>
        ),
      },
      {
        path: 'customers',
        element: (
          <RoleGuard permission={PERM.customerView}>
            <CustomerPage />
          </RoleGuard>
        ),
      },
      {
        path: 'customers/:id',
        element: (
          <RoleGuard permission={PERM.customerView}>
            <CustomerDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'banners',
        element: (
          <RoleGuard permission={PERM.bannerView}>
            <BannerPage />
          </RoleGuard>
        ),
      },
      {
        path: 'transactions',
        element: (
          <RoleGuard permission={PERM.transactionView}>
            <TransactionPage />
          </RoleGuard>
        ),
      },

      {
        path: 'transactions/:paymentId',
        element: (
          <RoleGuard permission={PERM.transactionView}>
            <PaymentDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'payment-callbacks',
        element: (
          <RoleGuard permission={PERM.paymentCallbackView}>
            <PaymentCallbackLogPage />
          </RoleGuard>
        ),
      },
      {
        path: 'payment-callbacks/:id',
        element: (
          <RoleGuard permission={PERM.paymentCallbackView}>
            <PaymentCallbackLogDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'provider-order-logs',
        element: (
          <RoleGuard permission={PERM.providerOrderLogView}>
            <ProviderOrderLogPage />
          </RoleGuard>
        ),
      },
      {
        path: 'provider-order-logs/:id',
        element: (
          <RoleGuard permission={PERM.providerOrderLogView}>
            <ProviderOrderLogDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'input',
        element: (
          <RoleGuard permission={PERM.gameInputUpdate}>
            <InputPages />
          </RoleGuard>
        ),
      },
      {
        path: 'games',
        element: (
          <RoleGuard permission={PERM.gameView}>
            <GamePage />
          </RoleGuard>
        ),
      },
      {
        path: 'games/:gameId',
        element: (
          <RoleGuard permission={PERM.gameView}>
            <GameDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'category-product',
        element: (
          <RoleGuard permission={PERM.categoryProductView}>
            <CategoryProduct />
          </RoleGuard>
        ),
      },
      {
        path: 'products',
        element: (
          <RoleGuard permission={PERM.productView}>
            <ProductPage />
          </RoleGuard>
        ),
      },
      {
        path: 'products/callback-logs',
        element: (
          <RoleGuard permission={PERM.productViewCallbackLog}>
            <ProductCallbackLogPage />
          </RoleGuard>
        ),
      },
      {
        path: 'products/callback-logs/:id',
        element: (
          <RoleGuard permission={PERM.productViewCallbackLog}>
            <ProductCallbackLogDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'anomaly',
        element: (
          <RoleGuard permission={PERM.productViewAnomaly}>
            <AnomalyProduct />
          </RoleGuard>
        ),
      },
      {
        path: 'payment-methods',
        element: (
          <RoleGuard permission={PERM.paymentMethodView}>
            <PaymentMethodPage />
          </RoleGuard>
        ),
      },
      {
        path: 'payment-methods-categories',

        element: (
          <RoleGuard permission={PERM.paymentCategoryView}>
            <PaymentMethodCategoryPages />
          </RoleGuard>
        ),
      },
      {
        path: 'provider',

        element: (
          <RoleGuard permission={PERM.providerView}>
            <ProviderPages />
          </RoleGuard>
        ),
      },
      {
        path: 'supplier-catalog',
        element: (
          <RoleGuard permission={PERM.providerView}>
            <SupplierCatalogPage />
          </RoleGuard>
        ),
      },
      {
        path: 'referral-codes',
        element: (
          <RoleGuard permission={PERM.referralView}>
            <ReferralPage />
          </RoleGuard>
        ),
      },
      {
        path: 'referral-codes/:id',
        element: (
          <RoleGuard permission={PERM.referralView}>
            <ReferralDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: '2fa-setup',
        element: (
          <RoleGuard permission={PERM.security2faManage}>
            <Setup2FAPage />
          </RoleGuard>
        ),
      },
      {
        path: 'maintenances',
        element: (
          <RoleGuard permission={PERM.maintenanceView}>
            <MaintenancePage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin',
        element: (
          <RoleGuard permission={PERM.adminView}>
            <AdminManagementPage />
          </RoleGuard>
        ),
      },
      {
        path: 'roles',
        element: (
          <RoleGuard permission={PERM.roleView}>
            <RolesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'roles/new',
        element: (
          <RoleGuard permission={PERM.roleCreate}>
            <RoleEditorPage />
          </RoleGuard>
        ),
      },
      {
        path: 'roles/:id',
        element: (
          <RoleGuard permission={PERM.roleView}>
            <RoleEditorPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin-logs',
        element: (
          <RoleGuard permission={PERM.adminLogView}>
            <AdminLogPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin-logs/:id',
        element: (
          <RoleGuard permission={PERM.adminLogView}>
            <AdminLogDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'activity-logs',
        element: (
          <RoleGuard permission={PERM.activityLogView}>
            <ActivityLogPage />
          </RoleGuard>
        ),
      },
      {
        path: 'activity-logs/:id',
        element: (
          <RoleGuard permission={PERM.activityLogView}>
            <ActivityLogDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
const App: React.FC = () => {
  return <RouterProvider router={router} />
}

export default App
