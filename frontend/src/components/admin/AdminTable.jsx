import React, { useState } from 'react';
import { PencilIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminTable = ({ admins, onEdit, onDelete, currentAdminId, userRole }) => {
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const isSuperAdmin = userRole === 'super_admin';

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAdmins(admins.map(admin => admin.id));
    } else {
      setSelectedAdmins([]);
    }
  };

  const handleSelectAdmin = (adminId) => {
    setSelectedAdmins(prev =>
      prev.includes(adminId)
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:outline-none"
                  checked={selectedAdmins.length === admins.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin, index) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:outline-none"
                    checked={selectedAdmins.includes(admin.id)}
                    onChange={() => handleSelectAdmin(admin.id)}
                    disabled={admin.id === currentAdminId}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ShieldCheckIcon className={`w-5 h-5 mr-2 ${admin.role === 'super_admin' ? 'text-purple-600' : 'text-blue-600'
                      }`} />
                    <span className="text-sm font-medium text-gray-900">{admin.name}</span>
                    {admin.id === currentAdminId && (
                      <span className="ml-2 text-xs text-gray-400">(You)</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(admin.role)}`}>
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(admin)}
                    className="btn-icon-premium bg-green-50 text-green-600 hover:bg-green-100 mr-2 disabled:opacity-30 disabled:transform-none"
                    title="Edit"
                    disabled={admin.id === currentAdminId}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(admin.id)}
                    className="btn-icon-premium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-30 disabled:transform-none"
                    title="Delete"
                    disabled={admin.id === currentAdminId}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {admins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No admins found</p>
        </div>
      )}
    </div>
  );
};

export default AdminTable;