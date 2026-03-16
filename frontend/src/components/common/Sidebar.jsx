import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  ClockIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, isAdmin, isHR, isManager } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
    { name: 'Attendance', href: '/attendance', icon: ClockIcon },
    { name: 'Apply Leave', href: '/apply-leave', icon: CalendarDaysIcon },
  ]

  // Navigation items logic

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-screen pt-16 bg-white border-r border-gray-200 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center p-2 text-gray-900 rounded-lg hover:bg-blue-50 group ${isActive ? 'bg-blue-50 text-blue-600' : ''
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}

export default Sidebar