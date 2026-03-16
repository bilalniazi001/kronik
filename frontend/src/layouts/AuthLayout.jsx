import React from 'react'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 ">
      <div className="max-w-lg w-full">
        <div className="">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout