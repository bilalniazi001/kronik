import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/" replace />
  }

  return <AuthLayout>{children}</AuthLayout>
}

export default PublicRoute