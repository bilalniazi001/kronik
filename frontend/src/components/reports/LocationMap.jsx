import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const LocationMap = ({ checkInLocation, checkOutLocation, checkInLat, checkInLng, checkOutLat, checkOutLng, onClose }) => {
  const hasCheckIn = checkInLat && checkInLng;
  const hasCheckOut = checkOutLat && checkOutLng;

  const getMapUrl = () => {
    if (hasCheckIn) {
      return `https://www.openstreetmap.org/?mlat=${checkInLat}&mlon=${checkInLng}#map=15/${checkInLat}/${checkInLng}`;
    } else if (hasCheckOut) {
      return `https://www.openstreetmap.org/?mlat=${checkOutLat}&mlon=${checkOutLng}#map=15/${checkOutLat}/${checkOutLng}`;
    }
    return 'https://www.openstreetmap.org/#map=2/0/0';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg max-w-4xl w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location Details</h3>
            
            <div className="space-y-4 mb-4">
              {hasCheckIn && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Check-In Location</p>
                  <p className="text-sm text-blue-600 break-all">{checkInLocation || `${checkInLat}, ${checkInLng}`}</p>
                </div>
              )}
              
              {hasCheckOut && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Check-Out Location</p>
                  <p className="text-sm text-green-600 break-all">{checkOutLocation || `${checkOutLat}, ${checkOutLng}`}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-100 rounded-lg overflow-hidden h-96">
              <iframe
                title="Location Map"
                src={getMapUrl()}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>

            <div className="mt-4 flex justify-end">
              <a
                href={getMapUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open in OpenStreetMap
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;