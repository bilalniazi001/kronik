import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  MegaphoneIcon,
  UserPlusIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, isAdmin, isHR } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'HR Management', href: '/admin/hr', icon: UsersIcon },
    { name: 'Manager Management', href: '/admin/managers', icon: UsersIcon },
    { name: 'Employee Management', href: '/admin/employees', icon: UsersIcon },
    { name: 'Admins', href: '/admin/admins', icon: ShieldCheckIcon },
  ];

  navigation.push(
    { name: 'Attendance', href: '/admin/attendance', icon: ClockIcon },
    { name: 'Reports', href: '/admin/reports', icon: DocumentTextIcon },
    { name: 'Announcements', href: '/admin/announcements', icon: MegaphoneIcon },
    { name: 'Public Holidays', href: '/admin/holidays', icon: CalendarDaysIcon }
  );

  if (isAdmin || isHR) {
    navigation.push({ name: 'Leave Management', href: '/leave-approvals', icon: ClipboardDocumentCheckIcon });
  }

  // Placeholder for any HR specific additions in future

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-24 bg-gradient-to-b from-purple-800 to-blue-700 text-white transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center p-2 text-white rounded-lg hover:bg-white hover:bg-opacity-20 group ${isActive ? 'bg-white bg-opacity-30' : ''
                    }`
                  }
                  end={item.href === '/admin'}
                >
                  <item.icon className="w-5 h-5 text-white opacity-70 group-hover:opacity-100" />
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="absolute bottom-4 left-3 right-3">
            <div className="p-3 bg-white bg-opacity-10 rounded-lg">
              <p className="text-xs text-white opacity-70">Admin Version</p>
              <p className="text-sm font-semibold">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;