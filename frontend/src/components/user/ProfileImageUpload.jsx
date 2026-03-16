import React, { useState, useRef } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import userService from '../../services/userService';
import { useAlert } from '../../hooks/useAlert';
import { useAuth } from '../../hooks/useAuth';

const ProfileImageUpload = ({ currentImage, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useAlert();
  const { updateUser } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      showError('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('profile_image', file);

    setUploading(true);
    try {
      const response = await userService.uploadProfileImage(formData);
      showSuccess('Profile image updated successfully');
      updateUser({ profile_image: response.profile_image }); // Sync global state
      onUpload(response.profile_image);
    } catch (error) {
      showError(error.message || 'Failed to upload image');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>

      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-200">
              <CameraIcon className="w-12 h-12 text-blue-600" />
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/jpg,image/gif"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {uploading ? 'Uploading...' : 'Change Picture'}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          Max size: 2MB. Formats: JPG, PNG, GIF
        </p>
      </div>
    </div>
  );
};

export default ProfileImageUpload;