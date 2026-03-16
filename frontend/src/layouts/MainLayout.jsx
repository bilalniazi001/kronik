import React from 'react'
import Header from '../components/common/Header'

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-16 pb-20 md:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default MainLayout