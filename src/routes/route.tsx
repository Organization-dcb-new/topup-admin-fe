import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from '../pages/Login'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
  },
])

const App: React.FC = () => {
  return <RouterProvider router={router} />
}

export default App
