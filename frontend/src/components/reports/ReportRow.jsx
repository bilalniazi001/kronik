import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MapPinIcon } from '@heroicons/react/24/outline';

const ReportRow = ({ report, onViewLocation }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'text-green-600';
      case 'checked_in':
        return 'text-yellow-600';
      case 'absent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed':
        return 'Present';
      case 'checked_in':
        return 'Incomplete';
      case 'absent':
        return 'Absent';
      default:
        return status;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden mb-2">
      <div 
        className="flex items-center justify-between p-4 bg-white cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="grid grid-cols-6 gap-4 flex-1">
          <div className="col-span-1">
            <p className="text-sm font-medium text-gray-900">
              {new Date(report.date).toLocaleDateString()}
            </p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-gray-500">{report.check_in_time || '-'}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm text-gray-500">{report.check_out_time || '-'}</p>
          </div>
          <div className="col-span-1">
            <p className="text-sm font-medium text-gray-900">{report.hours_worked || '-'}</p>
          </div>
          <div className="col-span-1">
            {(report.check_in_location || report.check_out_location) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewLocation(report);
                }}
                className="text-blue-600 hover:text-blue-900 flex items-center"
              >
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">View</span>
              </button>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </div>
          <div className="col-span-1">
            <span className={`text-sm font-medium ${getStatusColor(report.status)}`}>
              {getStatusText(report.status)}
            </span>
          </div>
        </div>
        <div className="ml-4">
          {expanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Check-In Location</p>
              <p className="text-sm font-medium">{report.check_in_location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Check-Out Location</p>
              <p className="text-sm font-medium">{report.check_out_location || 'N/A'}</p>
            </div>
            {report.check_in_latitude && report.check_in_longitude && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Coordinates</p>
                <p className="text-sm font-medium">
                  {report.check_in_latitude}, {report.check_in_longitude}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportRow;