import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'admin' || user?.is_superuser
  
  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

export default AdminRoute