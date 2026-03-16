import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../layouts/AdminLayout'

const AdminRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isAdmin, isHR, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin && !isHR) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check for specific role if required (e.g. super_admin)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <AdminLayout>{children}</AdminLayout>
}

export default AdminRoute