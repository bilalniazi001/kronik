import React from 'react';
import { ChevronDownIcon, ChevronUpIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminRow = ({ admin, isExpanded, onToggle, currentAdminId }) => {
  const getRoleIcon = (role) => {
    return role === 'super_admin' ? 'text-purple-600' : 'text-blue-600';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className={`w-6 h-6 ${getRoleIcon(admin.role)}`} />
          <div>
            <h3 className="font-medium text-gray-900">
              {admin.name}
              {admin.id === currentAdminId && (
                <span className="ml-2 text-xs text-gray-400">(You)</span>
              )}
            </h3>
            <p className="text-sm text-gray-500">{admin.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            admin.role === 'super_admin' 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium">{admin.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm font-medium capitalize">{admin.role.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Login</p>
              <p className="text-sm font-medium">
                {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created At</p>
              <p className="text-sm font-medium">{new Date(admin.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRow;