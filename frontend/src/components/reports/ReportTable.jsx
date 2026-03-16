import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

const ReportTable = ({ reports, loading, isTeamReport = false }) => {

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Present</span>;
      case 'checked_in':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Incomplete</span>;
      case 'absent':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Absent</span>;
      case 'weekend':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Weekend</span>;
      case 'leave':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Leave</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status || 'Unknown'}</span>;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  // Build a Google Maps link from a location string
  const getGoogleMapsUrl = (locationStr) => {
    if (!locationStr) return null;
    // If the location contains comma-separated lat,lng, use that directly
    const parts = locationStr.split(',');
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return `https://www.google.com/maps?q=${parts[0].trim()},${parts[1].trim()}`;
    }
    // Otherwise search by the location name
    return `https://www.google.com/maps/search/${encodeURIComponent(locationStr)}`;
  };

  const renderLocationCell = (location, label) => {
    if (!location) return <span className="text-gray-400">-</span>;

    const mapsUrl = getGoogleMapsUrl(location);
    // Truncate long location names for display
    const displayName = location.length > 40 ? location.substring(0, 40) + '...' : location;

    return (
      <div className="flex items-start gap-1">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
          title={`Open ${label} location in Google Maps\n${location}`}
        >
          <MapPinIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs">{displayName}</span>
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              {isTeamReport && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-In Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-Out Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(report.date).toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                {isTeamReport && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{report.employee_name}</span>
                      <span className="text-xs text-gray-500">{report.designation}</span>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTime(report.check_in_time)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-[150px]">
                  <div className="truncate" title={report.check_in_location}>
                    {renderLocationCell(report.check_in_location, 'Check-In')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTime(report.check_out_time)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-[150px]">
                  <div className="truncate" title={report.check_out_location}>
                    {renderLocationCell(report.check_out_location, 'Check-Out')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {report.hours_worked || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(report.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No attendance records found</p>
        </div>
      )}
    </div>
  );
};

export default ReportTable;