import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "../pages/Login";
import DashboardPage from "@/pages/Dashboard";
import TransactionPage from "@/pages/Transaction";
import GamePage from "@/pages/Game";
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
import SpendingPages from "@/pages/Spending";
import BlogPage from "@/pages/Blog";
import VerifyOtpPage from "@/pages/VerifyOTP";
import Setup2FAPage from "@/pages/SetupAuth";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtpPage />,
  },
  {
    path: "/",
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "spending",
        element: <SpendingPages />,
      },
      {
        path: "blog",
        element: <BlogPage />,
      },
      {
        path: "shows",
        element: <ShowPage />,
      },
      {
        path: "orders",
        element: <OrderPages />,
      },
      {
        path: "banners",
        element: <BannerPage />,
      },
      {
        path: "transactions",
        element: <TransactionPage />,
      },

      {
        path: "transactions/:paymentId",
        element: <PaymentDetailPage />,
      },
      {
        path: "input",
        element: <InputPages />,
      },
      {
        path: "games",
        element: <GamePage />,
      },
      {
        path: "category-product",
        element: <CategoryProduct />,
      },
      {
        path: "categories",
        element: <CategoryPage />,
      },
      {
        path: "products",
        element: <ProductPage />,
      },
      {
        path: "payment-methods",
        element: <PaymentMethodPage />,
      },
      {
        path: "payment-methods-categories",
        element: <PaymentMethodCategoryPages />,
      },
      {
        path: "provider",
        element: <ProviderPages />,
      },
      {
        path: "2fa-setup",
        element: <Setup2FAPage />,
      },
    ],
  },
]);
const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
