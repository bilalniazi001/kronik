import React from 'react';
import { PencilIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, IdentificationIcon } from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${API_BASE}${path}`;
};

const ProfileCard = ({ user, onEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Cover Photo */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

      {/* Profile Content */}
      <div className="relative px-6 pb-6">
        {/* Profile Image */}
        <div className="absolute -top-16 left-6">
          {user?.profile_image ? (
            <img
              src={getFullImageUrl(user.profile_image)}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-blue-600">
                {user?.name?.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="absolute top-4 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          <PencilIcon className="w-5 h-5 text-gray-600" />
        </button>

        {/* User Info */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500">{user?.designation || 'Employee'}</p>
        </div>

        {/* Contact Details - As per your design */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-gray-600">
            <EnvelopeIcon className="w-5 h-5 mr-3" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <PhoneIcon className="w-5 h-5 mr-3" />
            <span>{user?.phone}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="w-5 h-5 mr-3" />
            <span>{user?.address || 'No address provided'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <IdentificationIcon className="w-5 h-5 mr-3" />
            <span>{user?.cnic}</span>
          </div>
        </div>

        {/* Settings - As per your design */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 flex items-center justify-between">
              <span>Pending Request</span>
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">2</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
              Leave History
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
              Attendance History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;