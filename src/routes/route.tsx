import { lazy, Suspense, useEffect } from 'react'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { RoleGuard } from '@/components/Auth/RoleGuard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { resolvePageTitleKey } from '@/lib/title-map'

const LoginPage = lazy(() => import('@/pages/Login'))
const VerifyOtpPage = lazy(() => import('@/pages/VerifyOTP'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const TransactionPage = lazy(() => import('@/pages/Transaction'))
const GamePage = lazy(() => import('@/pages/Game'))
const GameDetailPage = lazy(() => import('@/pages/GameDetail'))
const CategoryPage = lazy(() => import('@/pages/Category'))
const ProductPage = lazy(() => import('@/pages/Product'))
const PaymentMethodPage = lazy(() => import('@/pages/PaymentMethod'))
const ProviderPages = lazy(() => import('@/pages/Provider'))
const ReferralPage = lazy(() => import('@/pages/Referral'))
const ReferralDetailPage = lazy(() => import('@/pages/ReferralDetail'))
const PaymentDetailPage = lazy(() => import('@/pages/TransactionDetail'))
const BannerPage = lazy(() => import('@/pages/Banner'))
const ShowPage = lazy(() => import('@/pages/Show'))
const InputPages = lazy(() => import('@/pages/Input'))
const OrderPages = lazy(() => import('@/pages/Order'))
const CategoryProduct = lazy(() => import('@/pages/CategoryProduct'))
const PaymentMethodCategoryPages = lazy(
  () => import('@/pages/PaymentMethodCategory'),
)
const SpendingPages = lazy(() => import('@/pages/Summary'))
const BlogPage = lazy(() => import('@/pages/Blog'))
const CashflowPage = lazy(() => import('@/pages/Cashflow'))
const Setup2FAPage = lazy(() => import('@/pages/SetupAuth'))
const RateLimitPage = lazy(() => import('@/pages/RateLimit'))
const AdminManagementPage = lazy(() => import('@/pages/Admin'))
const MaintenancePage = lazy(() => import('@/pages/Maintenance'))
const AdminLogPage = lazy(() => import('@/pages/AdminLog'))
const AdminLogDetailPage = lazy(() => import('@/pages/AdminLogDetail'))
const UnauthorizedPage = lazy(() => import('@/pages/Unauthorized'))
const AnomalyProduct = lazy(() => import('@/pages/AnomalyProduct'))
const ProductCallbackLogPage = lazy(() => import('@/pages/ProductCallbackLog'))
const ProductCallbackLogDetailPage = lazy(
  () => import('@/pages/ProductCallbackLogDetail'),
)
const NotFoundPage = lazy(() => import('@/pages/NotFound'))

const PageLoader = () => (
  <div className='flex min-h-dvh items-center justify-center'>
    <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
  </div>
)

const RouteTitle = () => {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  // `t` berganti identitas saat bahasa berubah, jadi judul ikut ter-update
  useEffect(() => {
    const key = resolvePageTitleKey(pathname) ?? 'notFound'
    document.title = `${t('pageTitles.' + key)} · PakarGaming`
  }, [pathname, t])

  return null
}

const RootLayout = () => (
  <ErrorBoundary>
    <RouteTitle />
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </ErrorBoundary>
)

const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
        path: '/',
        children: [
          {
            index: true,
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <DashboardPage />
              </RoleGuard>
            ),
          },
          {
            path: 'summary',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <SpendingPages />
              </RoleGuard>
            ),
          },
          {
            path: 'cashflow',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <CashflowPage />
              </RoleGuard>
            ),
          },
          {
            path: 'blog',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <BlogPage />
              </RoleGuard>
            ),
          },
          {
            path: 'shows',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <ShowPage />
              </RoleGuard>
            ),
          },
          {
            path: 'orders',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <OrderPages />
              </RoleGuard>
            ),
          },
          {
            path: 'banners',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <BannerPage />
              </RoleGuard>
            ),
          },
          {
            path: 'transactions',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <TransactionPage />
              </RoleGuard>
            ),
          },
          {
            path: 'transactions/:paymentId',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <PaymentDetailPage />
              </RoleGuard>
            ),
          },
          {
            path: 'input',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <InputPages />
              </RoleGuard>
            ),
          },
          {
            path: 'games',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <GamePage />
              </RoleGuard>
            ),
          },
          {
            path: 'games/:gameId',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <GameDetailPage />
              </RoleGuard>
            ),
          },
          {
            path: 'category-product',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <CategoryProduct />
              </RoleGuard>
            ),
          },
          {
            path: 'categories',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <CategoryPage />
              </RoleGuard>
            ),
          },
          {
            path: 'products',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <ProductPage />
              </RoleGuard>
            ),
          },
          {
            path: 'products/callback-logs',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <ProductCallbackLogPage />
              </RoleGuard>
            ),
          },
          {
            path: 'products/callback-logs/:id',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <ProductCallbackLogDetailPage />
              </RoleGuard>
            ),
          },
          {
            path: 'anomaly',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin', 'noc']}>
                <AnomalyProduct />
              </RoleGuard>
            ),
          },
          {
            path: 'payment-methods',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <PaymentMethodPage />
              </RoleGuard>
            ),
          },
          {
            path: 'payment-methods-categories',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <PaymentMethodCategoryPages />
              </RoleGuard>
            ),
          },
          {
            path: 'provider',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <ProviderPages />
              </RoleGuard>
            ),
          },
          {
            path: 'referral-codes',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <ReferralPage />
              </RoleGuard>
            ),
          },
          {
            path: 'referral-codes/:id',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <ReferralDetailPage />
              </RoleGuard>
            ),
          },
          {
            path: '2fa-setup',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <Setup2FAPage />
              </RoleGuard>
            ),
          },
          {
            path: 'rate-limit',
            element: (
              <RoleGuard allowedRoles={['dev']}>
                <RateLimitPage />
              </RoleGuard>
            ),
          },
          {
            path: 'maintenances',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <MaintenancePage />
              </RoleGuard>
            ),
          },
          {
            path: 'admin',
            element: (
              <RoleGuard allowedRoles={['dev']}>
                <AdminManagementPage />
              </RoleGuard>
            ),
          },
          {
            path: 'admin-logs',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <AdminLogPage />
              </RoleGuard>
            ),
          },
          {
            path: 'admin-logs/:id',
            element: (
              <RoleGuard allowedRoles={['dev', 'admin']}>
                <AdminLogDetailPage />
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
    ],
  },
])

const App = () => <RouterProvider router={router} />

export default App
