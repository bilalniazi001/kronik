import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const UserRow = ({ user, isExpanded, onToggle }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          {user.profile_image ? (
            <img 
              src={user.profile_image} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user.name?.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            user.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {user.status === 'active' ? 'Active' : 'Inactive'}
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
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CNIC</p>
              <p className="text-sm font-medium">{user.cnic}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="text-sm font-medium">{user.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Join Date</p>
              <p className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRow;