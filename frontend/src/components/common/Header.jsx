import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useAlert } from '../../hooks/useAlert';
import api from '../../services/api';
import { format } from 'date-fns';

const Header = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const [announcements, setAnnouncements] = React.useState([]);

  React.useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        let allItems = [];

        // 1. Fetch Announcements
        const annRes = await api.get('/announcements');
        if (annRes.data?.success && Array.isArray(annRes.data?.data)) {
          const formattedAnns = annRes.data.data.map(a => ({
            ...a,
            _type: 'announcement',
            display_title: a.title,
            display_message: a.content || a.message,
            date: new Date(a.created_at)
          }));
          allItems = [...allItems, ...formattedAnns];
        }

        // 2. Fetch System Notifications (Leave requests, etc.)
        if (user) {
          const sysRes = await api.get('/notifications');
          if (sysRes.data?.success && Array.isArray(sysRes.data?.data)) {
            const formattedSys = sysRes.data.data.map(n => ({
              ...n,
              _type: 'system',
              display_title: n.title,
              display_message: n.message,
              date: new Date(n.created_at)
            }));
            allItems = [...allItems, ...formattedSys];
          }
        }

        // 3. Sort chronologically (newest first) and keep top 10
        allItems.sort((a, b) => b.date - a.date);
        setAnnouncements(allItems.slice(0, 10));

      } catch (error) {
        console.error('Error fetching notifications for header:', error);
      }
    };

    fetchAllNotifications();
  }, [user]);

  const handleNotificationClick = async (item) => {
    if (item._type === 'system' && !item.is_read) {
      try {
        await api.put(`/notifications/${item.id}/read`);
        // Optimistically update UI
        setAnnouncements(prev => prev.map(n => n.id === item.id ? { ...n, is_read: 1 } : n));
      } catch (error) {
        console.error('Failed to mark read', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon, current: location.pathname === '/' },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon, current: location.pathname === '/reports' },
    { name: 'Announcements', href: '/announcements', icon: MegaphoneIcon, current: location.pathname === '/announcements' },
    { name: 'Profile', href: '/profile', icon: UserIcon, current: location.pathname === '/profile' },
  ];

  if (user?.role_type === 'manager' || user?.role_type === 'hr' || user?.role_type === 'admin') {
    navigation.splice(1, 0, { name: 'Team Requests', href: '/leave-approvals', icon: ClipboardDocumentCheckIcon, current: location.pathname === '/leave-approvals' });
  }

  return (
    <>
      {/* Top Header Bar */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Attendly
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.current
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right section - notifications and profile dropdown */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Menu as="div" className="relative">
                <Menu.Button className="p-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 relative focus:outline-none">
                  <BellIcon className="w-5 h-5" />
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
                  <Menu.Items className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      <Link to="/announcements" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {announcements.length > 0 ? (
                        announcements.map((item) => (
                          <Menu.Item key={`${item._type}-${item.id}`}>
                            {({ active }) => (
                              <div
                                onClick={() => handleNotificationClick(item)}
                                className={`${active ? 'bg-gray-50' : ''} ${item._type === 'system' && !item.is_read ? 'bg-indigo-50/30' : ''} px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${item._type === 'announcement' ? 'bg-purple-100' : 'bg-indigo-100'}`}>
                                    {item._type === 'announcement' ? (
                                      <MegaphoneIcon className="w-4 h-4 text-purple-600" />
                                    ) : (
                                      <BellIcon className="w-4 h-4 text-indigo-600" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <p className={`text-sm font-medium truncate ${item._type === 'system' && !item.is_read ? 'text-indigo-900' : 'text-gray-900'}`}>
                                        {item.display_title}
                                      </p>
                                      {item._type === 'system' && !item.is_read && (
                                        <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.display_message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                      {format(item.date, 'MMM dd, p')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Menu.Item>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-gray-500">No new notifications</p>
                        </div>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Profile Dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 bg-gray-100 rounded-full p-1.5 hover:bg-gray-200 transition-colors focus:outline-none">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image.startsWith('http') || user.profile_image.startsWith('data:')
                        ? user.profile_image
                        : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.profile_image.startsWith('/') ? '' : '/'}${user.profile_image}`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const next = e.target.nextElementSibling;
                        if (next) next.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${user?.profile_image ? 'hidden' : 'flex'} w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 items-center justify-center`}>
                    <span className="text-sm font-medium text-white uppercase">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  {/* Hide name on mobile, show on desktop */}
                  <span className="hidden lg:block text-gray-700 font-medium mr-2 text-sm">
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
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                              } flex items-center px-3 py-2.5 text-sm rounded-lg`}
                          >
                            <UserIcon className="w-5 h-5 mr-3" />
                            My Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/reports"
                            className={`${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                              } flex items-center px-3 py-2.5 text-sm rounded-lg`}
                          >
                            <DocumentTextIcon className="w-5 h-5 mr-3" />
                            Attendance Reports
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
                              } flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group`}
                          >
                            <ArrowRightOnRectangleIcon className={`w-5 h-5 mr-3 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
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

      {/* Mobile Bottom Navigation - fixed at bottom, icons only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around py-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all duration-300 ${item.current
                ? 'scale-110'
                : 'text-gray-400 opacity-60'
                }`}
            >
              <item.icon className={`w-7 h-7 transition-colors ${item.current ? 'text-indigo-600' : ''}`} />
              {item.current && (
                <div className="w-1 h-1 bg-indigo-600 rounded-full mt-1"></div>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;