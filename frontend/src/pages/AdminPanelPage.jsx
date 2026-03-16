import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAlert } from '../hooks/useAlert';
import adminService from '../services/adminService';
import {
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const AdminPanelPage = () => {
  const { user } = useAuth();
  const { showError } = useAlert();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Dashboard stats fetch failed:', error);
      showError('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Checked In Today',
      value: stats?.today_checked_in || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      link: '/admin/attendance'
    },
    {
      title: 'Pending Checkout',
      value: stats?.pending_checkout || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      link: '/admin/attendance'
    },
    {
      title: 'Yet to Check In',
      value: stats?.not_checked_in || 0,
      icon: XCircleIcon,
      color: 'bg-red-500',
      link: '/admin/attendance'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          <Link
            to="/admin/users"
            className="group relative p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UsersIcon className="w-7 h-7" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">Manage Users</p>
              <p className="text-sm text-gray-500">Add, edit, or remove system users</p>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="group relative p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ArrowTrendingUpIcon className="w-7 h-7" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">View Reports</p>
              <p className="text-sm text-gray-500">Analyze attendance and activity</p>
            </div>
          </Link>

          <Link
            to="/admin/add-hr"
            className="group relative p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-7 h-7" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">Add HR</p>
              <p className="text-sm text-gray-500">Create new HR accounts</p>
            </div>
          </Link>

          {user?.role === 'super_admin' && (
            <Link
              to="/admin/admins"
              className="group relative p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheckIcon className="w-7 h-7" />
                </div>
                <p className="text-lg font-bold text-gray-900 mb-1">Manage Admins</p>
                <p className="text-sm text-gray-500">System security and access control</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;