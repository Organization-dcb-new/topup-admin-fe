import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../pages/Login";
import DashboardPage from "@/pages/Dashboard";
import TransactionPage from "@/pages/Transaction";
import GamePage from "@/pages/Game";
import GameDetailPage from "@/pages/GameDetail";
import CategoryPage from "@/pages/Category";
import ProductPage from "@/pages/Product";
import PaymentMethodPage from "@/pages/PaymentMethod";
import ProviderPages from "@/pages/Provider";
import PaymentDetailPage from "@/pages/TransactionDetail";
import BannerPage from "@/pages/Banner";
import ShowPage from "@/pages/Show";
import InputPages from "@/pages/Input";
import OrderPages from "@/pages/Order";
import CategoryProduct from "@/pages/CategoryProduct";
import PaymentMethodCategoryPages from "@/pages/PaymentMethodCategory";
import SpendingPages from "@/pages/Summary";
import BlogPage from "@/pages/Blog";
import VerifyOtpPage from "@/pages/VerifyOTP";
import Setup2FAPage from "@/pages/SetupAuth";
import RateLimitPage from "@/pages/RateLimit";
import AdminManagementPage from "@/pages/Admin";
import MaintenancePage from "@/pages/Maintenance";
import AdminLogPage from '@/pages/AdminLog'
import AdminLogDetailPage from '@/pages/AdminLogDetail'
import { RoleGuard } from "@/components/Auth/RoleGuard";
import UnauthorizedPage from "@/pages/Unauthorized";
import AnomalyProduct from "@/pages/AnomalyProduct";
import ProductCallbackLogPage from "@/pages/ProductCallbackLog";
import ProductCallbackLogDetailPage from "@/pages/ProductCallbackLogDetail";
import NotFoundPage from "@/pages/NotFound";

export const router = createBrowserRouter([
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
          <RoleGuard allowedRoles={["dev", "admin"]}>
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
        path: "unauthorized",
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
