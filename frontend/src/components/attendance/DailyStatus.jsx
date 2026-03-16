import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

const DailyStatus = ({ attendance }) => {
  if (!attendance) {
    return (
      <div className="text-center py-4">
        <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No attendance record for today</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">Check In</p>
        <p className="text-xl font-semibold text-gray-900">
          {attendance.check_in_time || '--:--'}
        </p>
        {attendance.check_in_location && (
          <p className="text-xs text-gray-400 mt-1 truncate" title={attendance.check_in_location}>
            📍 {attendance.check_in_location}
          </p>
        )}
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">Check Out</p>
        <p className="text-xl font-semibold text-gray-900">
          {attendance.check_out_time || '--:--'}
        </p>
        {attendance.check_out_location && (
          <p className="text-xs text-gray-400 mt-1 truncate" title={attendance.check_out_location}>
            📍 {attendance.check_out_location}
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyStatus;