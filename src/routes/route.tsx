import React from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import {
  guestOnlyLoader,
  requireAuthLoader,
  verifyOtpLoader,
} from "./authLoaders";
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
import { RoleGuard } from "@/components/Auth/RoleGuard";
import UnauthorizedPage from "@/pages/Unauthorized";
import AnomalyProduct from "@/pages/AnomalyProduct";
import NotFoundPage from "@/pages/NotFound";

function ProtectedLayout() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    loader: guestOnlyLoader,
    element: <LoginPage />,
  },
  {
    path: "/verify-otp",
    loader: verifyOtpLoader,
    element: <VerifyOtpPage />,
  },
  {
    path: "/",
    loader: requireAuthLoader,
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: (
          <RoleGuard allowedRoles={["dev", "admin", "noc"]}>
            <DashboardPage />
          </RoleGuard>
        ),
      },
      {
        path: "summary",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <SpendingPages />
          </RoleGuard>
        ),
      },
      {
        path: "blog",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <BlogPage />
          </RoleGuard>
        ),
      },
      {
        path: "shows",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <ShowPage />
          </RoleGuard>
        ),
      },
      {
        path: "orders",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <OrderPages />
          </RoleGuard>
        ),
      },
      {
        path: "banners",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <BannerPage />
          </RoleGuard>
        ),
      },
      {
        path: "transactions",
        element: (
          <RoleGuard allowedRoles={["dev", "admin", "noc"]}>
            <TransactionPage />
          </RoleGuard>
        ),
      },

      {
        path: "transactions/:paymentId",
        element: (
          <RoleGuard allowedRoles={["dev", "admin", "noc"]}>
            <PaymentDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: "input",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <InputPages />
          </RoleGuard>
        ),
      },
      {
        path: "games",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <GamePage />
          </RoleGuard>
        ),
      },
      {
        path: "games/:gameId",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <GameDetailPage />
          </RoleGuard>
        ),
      },
      {
        path: "category-product",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <CategoryProduct />
          </RoleGuard>
        ),
      },
      {
        path: "categories",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <CategoryPage />
          </RoleGuard>
        ),
      },
      {
        path: "products",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <ProductPage />
          </RoleGuard>
        ),
      },
      {
        path: "anomaly",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <AnomalyProduct />
          </RoleGuard>
        ),
      },
      {
        path: "payment-methods",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <PaymentMethodPage />
          </RoleGuard>
        ),
      },
      {
        path: "payment-methods-categories",

        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <PaymentMethodCategoryPages />
          </RoleGuard>
        ),
      },
      {
        path: "provider",

        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <ProviderPages />
          </RoleGuard>
        ),
      },
      {
        path: "2fa-setup",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <Setup2FAPage />
          </RoleGuard>
        ),
      },
      {
        path: "rate-limit",
        element: (
          <RoleGuard allowedRoles={["dev"]}>
            <RateLimitPage />
          </RoleGuard>
        ),
      },
      {
        path: "maintenances",
        element: (
          <RoleGuard allowedRoles={["dev", "admin"]}>
            <MaintenancePage />
          </RoleGuard>
        ),
      },
      {
        path: "admin",
        element: (
          <RoleGuard allowedRoles={["dev"]}>
            <AdminManagementPage />
          </RoleGuard>
        ),
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
