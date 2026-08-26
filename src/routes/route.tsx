import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
  useParams,
} from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { PermissionGuard } from '@/components/Auth/PermissionGuard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { resolvePageTitleKey } from '@/lib/title-map'
import { ROUTE_PERMISSIONS } from '@/constants/route-permissions'

/**
 * Mengambil permission dari ROUTE_PERMISSIONS, sumber yang sama dengan
 * penyaring menu sidebar. Path tanpa entri menghasilkan daftar kosong, dan
 * PermissionGuard menolak daftar kosong (fail-closed).
 */
const Guarded = ({ path, children }: { path: string; children: ReactNode }) => (
  <PermissionGuard requires={ROUTE_PERMISSIONS[path] ?? []}>{children}</PermissionGuard>
)

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
const RoleManagementPage = lazy(() => import('@/pages/Role'))
const MaintenancePage = lazy(() => import('@/pages/Maintenance'))
const AdminLogPage = lazy(() => import('@/pages/AdminLog'))
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

/**
 * Deep-link lama `/transactions/:paymentId` tetap hidup: detail transaksi kini
 * berupa drawer yang dikendalikan search param `?tx=` di `/transactions`,
 * jadi rute lama cukup dialihkan. Tanpa guard — rute tujuan sudah di-guard.
 */
const LegacyTransactionDetailRedirect = () => {
  const { paymentId } = useParams<{ paymentId: string }>()
  return (
    <Navigate
      to={
        paymentId
          ? `/transactions?tx=${encodeURIComponent(paymentId)}`
          : '/transactions'
      }
      replace
    />
  )
}

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
              <Guarded path='/'>
                <DashboardPage />
              </Guarded>
            ),
          },
          {
            path: 'summary',
            element: (
              <Guarded path='/summary'>
                <SpendingPages />
              </Guarded>
            ),
          },
          {
            path: 'cashflow',
            element: (
              <Guarded path='/cashflow'>
                <CashflowPage />
              </Guarded>
            ),
          },
          {
            path: 'blog',
            element: (
              <Guarded path='/blog'>
                <BlogPage />
              </Guarded>
            ),
          },
          {
            path: 'shows',
            element: (
              <Guarded path='/shows'>
                <ShowPage />
              </Guarded>
            ),
          },
          {
            path: 'orders',
            element: (
              <Guarded path='/orders'>
                <OrderPages />
              </Guarded>
            ),
          },
          {
            path: 'banners',
            element: (
              <Guarded path='/banners'>
                <BannerPage />
              </Guarded>
            ),
          },
          {
            path: 'transactions',
            element: (
              <Guarded path='/transactions'>
                <TransactionPage />
              </Guarded>
            ),
          },
          {
            path: 'transactions/:paymentId',
            element: <LegacyTransactionDetailRedirect />,
          },
          {
            path: 'input',
            element: (
              <Guarded path='/input'>
                <InputPages />
              </Guarded>
            ),
          },
          {
            path: 'games',
            element: (
              <Guarded path='/games'>
                <GamePage />
              </Guarded>
            ),
          },
          {
            path: 'games/:gameId',
            element: (
              <Guarded path='/games/:gameId'>
                <GameDetailPage />
              </Guarded>
            ),
          },
          {
            path: 'category-product',
            element: (
              <Guarded path='/category-product'>
                <CategoryProduct />
              </Guarded>
            ),
          },
          {
            path: 'categories',
            element: (
              <Guarded path='/categories'>
                <CategoryPage />
              </Guarded>
            ),
          },
          {
            path: 'products',
            element: (
              <Guarded path='/products'>
                <ProductPage />
              </Guarded>
            ),
          },
          {
            path: 'products/callback-logs',
            element: (
              <Guarded path='/products/callback-logs'>
                <ProductCallbackLogPage />
              </Guarded>
            ),
          },
          {
            path: 'products/callback-logs/:id',
            element: (
              <Guarded path='/products/callback-logs/:id'>
                <ProductCallbackLogDetailPage />
              </Guarded>
            ),
          },
          {
            path: 'anomaly',
            element: (
              <Guarded path='/anomaly'>
                <AnomalyProduct />
              </Guarded>
            ),
          },
          {
            path: 'payment-methods',
            element: (
              <Guarded path='/payment-methods'>
                <PaymentMethodPage />
              </Guarded>
            ),
          },
          {
            path: 'payment-methods-categories',
            element: (
              <Guarded path='/payment-methods-categories'>
                <PaymentMethodCategoryPages />
              </Guarded>
            ),
          },
          {
            path: 'provider',
            element: (
              <Guarded path='/provider'>
                <ProviderPages />
              </Guarded>
            ),
          },
          {
            path: 'referral-codes',
            element: (
              <Guarded path='/referral-codes'>
                <ReferralPage />
              </Guarded>
            ),
          },
          {
            path: 'referral-codes/:id',
            element: (
              <Guarded path='/referral-codes/:id'>
                <ReferralDetailPage />
              </Guarded>
            ),
          },
          {
            path: '2fa-setup',
            element: (
              <Guarded path='/2fa-setup'>
                <Setup2FAPage />
              </Guarded>
            ),
          },
          {
            path: 'rate-limit',
            element: (
              <Guarded path='/rate-limit'>
                <RateLimitPage />
              </Guarded>
            ),
          },
          {
            path: 'maintenances',
            element: (
              <Guarded path='/maintenances'>
                <MaintenancePage />
              </Guarded>
            ),
          },
          {
            path: 'admin',
            element: (
              <Guarded path='/admin'>
                <AdminManagementPage />
              </Guarded>
            ),
          },
          {
            path: 'roles',
            element: (
              <Guarded path='/roles'>
                <RoleManagementPage />
              </Guarded>
            ),
          },
          {
            path: 'admin-logs',
            element: (
              <Guarded path='/admin-logs'>
                <AdminLogPage />
              </Guarded>
            ),
          },
          {
            // Detail tampil sebagai drawer di atas daftar, tapi tetap punya
            // URL sendiri supaya tautannya bisa dibagikan
            path: 'admin-logs/:id',
            element: (
              <Guarded path='/admin-logs/:id'>
                <AdminLogPage />
              </Guarded>
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
