import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <ShieldExclamationIcon className="w-24 h-24 text-red-500 mx-auto" />
        <h1 className="text-3xl font-semibold text-gray-900 mt-4">Access Denied</h1>
        <p className="text-gray-600 mt-2 mb-8">
          You don't have permission to access this page.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;