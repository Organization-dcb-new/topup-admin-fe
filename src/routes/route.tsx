import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from '../pages/Login'
import DashboardPage from '@/pages/Dashboard'
import TransactionPage from '@/pages/Transaction'
import GamePage from '@/pages/Game'
import CategoryPage from '@/pages/Category'
import ProductPage from '@/pages/Product'
import PaymentMethodPage from '@/pages/PaymentMethod'
import ProviderPages from '@/pages/Provider'
import PaymentDetailPage from '@/pages/TransactionDetail'
import BannerPage from '@/pages/Banner'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'banners',
        element: <BannerPage />,
      },
      {
        path: 'transactions',
        element: <TransactionPage />,
      },

      {
        path: 'transactions/:paymentId',
        element: <PaymentDetailPage />,
      },
      {
        path: 'games',
        element: <GamePage />,
      },
      {
        path: 'categories',
        element: <CategoryPage />,
      },
      {
        path: 'products',
        element: <ProductPage />,
      },
      {
        path: 'payment-methods',
        element: <PaymentMethodPage />,
      },
      {
        path: 'provider',
        element: <ProviderPages />,
      },
    ],
  },
])
const App: React.FC = () => {
  return <RouterProvider router={router} />
}

export default App
