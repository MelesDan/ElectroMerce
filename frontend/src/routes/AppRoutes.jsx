import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'
import Layout from '@components/layout/Layout'

// Lazy load pages
const HomePage = lazy(() => import('@pages/HomePage'))
const ShopPage = lazy(() => import('@pages/ShopPage'))
const ProductPage = lazy(() => import('@pages/ProductPage'))
const CartPage = lazy(() => import('@pages/CartPage'))
const CheckoutPage = lazy(() => import('@pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('@pages/OrderSuccessPage'))
const OrderHistoryPage = lazy(() => import('@pages/OrderHistoryPage'))
const OrderDetailPage = lazy(() => import('@pages/OrderDetailPage'))
const LoginPage = lazy(() => import('@pages/LoginPage'))
const RegisterPage = lazy(() => import('@pages/RegisterPage'))
const ProfilePage = lazy(() => import('@pages/ProfilePage'))
const WishlistPage = lazy(() => import('@pages/WishlistPage'))
const AdminDashboardPage = lazy(() => import('@pages/AdminDashboardPage'))

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-success/:orderNumber" element={<OrderSuccessPage />} />
            <Route path="orders" element={<OrderHistoryPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="wishlist" element={<WishlistPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes