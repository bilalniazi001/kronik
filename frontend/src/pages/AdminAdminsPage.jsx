import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAlert } from '../hooks/useAlert';
import adminService from '../services/adminService';
import AdminTable from '../components/admin/AdminTable';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { PlusIcon } from '@heroicons/react/24/outline';

const AdminAdminsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdmins();
      setAdmins(response.admins);
    } catch {
      showError('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAdmin) {
        // Edit admin
        await adminService.updateAdmin(selectedAdmin.id, formData);
        showSuccess('Admin updated successfully');
      } else {
        // Create admin
        await adminService.createAdmin(formData);
        showSuccess('Admin created successfully');
      }
      setModalOpen(false);
      resetForm();
      fetchAdmins();
    } catch {
      showError('Operation failed');
    }
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role
    });
    setModalOpen(true);
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;

    try {
      await adminService.deleteAdmin(adminId);
      showSuccess('Admin deleted successfully');
      fetchAdmins();
    } catch {
      showError('Failed to delete admin');
    }
  };

  const resetForm = () => {
    setSelectedAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600 mt-1">View and manage system administrators</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="btn-primary-premium group flex items-center"
        >
          <div className="btn-shimmer"></div>
          <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
          <span className="relative z-10">Add New Admin</span>
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <AdminTable
          admins={admins}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentAdminId={user?.id}
          userRole={user?.role}
        />
      )}

      {/* Admin Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={selectedAdmin ? 'Edit Admin' : 'Create New Admin'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {selectedAdmin ? 'New Password (leave blank to keep current)' : 'Password *'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!selectedAdmin}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="btn-primary-premium group flex-1"
            >
              <div className="btn-shimmer"></div>
              <span className="relative z-10">
                {selectedAdmin ? 'Update Admin' : 'Create Admin'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAdminsPage;