import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { showSuccess } = useAlert();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-gradient-to-r from-purple-700 to-blue-600 text-white">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-white rounded-lg hover:bg-white hover:bg-opacity-20 mr-2"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link to="/admin" className="flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-2" />
              <span className="text-xl font-semibold">Admin Panel</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 bg-white bg-opacity-20 rounded-full p-1.5 hover:bg-opacity-30 focus:outline-none">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
                <span className="hidden md:block text-white font-medium mr-2">
                  {user?.name}
                </span>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/admin/profile"
                          className={`${active ? 'bg-purple-50 text-purple-600' : 'text-gray-700'} flex items-center px-2 py-2 text-sm rounded-md`}
                        >
                          <UserCircleIcon className="w-5 h-5 mr-2" />
                          Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${active
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            } flex items-center w-full px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg group`}
                        >
                          <ArrowRightOnRectangleIcon className={`w-5 h-5 mr-3 transition-all duration-200 ${active ? 'text-white scale-110' : 'text-gray-400 group-hover:text-indigo-600'}`} />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;