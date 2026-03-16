import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

const LocationStatus = ({ location, type = 'check-in' }) => {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center text-sm">
        <MapPinIcon className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-gray-600 font-medium">
          {type === 'check-in' ? 'Check-in Location:' : 'Check-out Location:'}
        </span>
      </div>
      <p className="text-sm text-gray-900 mt-1 ml-6">
        {location || 'Not available'}
      </p>
      {location && (
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 ml-6 mt-1 inline-block"
        >
          View on Map
        </a>
      )}
    </div>
  );
};

export default LocationStatus;