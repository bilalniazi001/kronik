import React from 'react'
import LoginForm from '../components/auth/LoginForm'

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Content Container */}
      <div className="w-full relative z-10">
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage