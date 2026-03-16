import React, { useState, useEffect } from 'react';
import { DocumentArrowDownIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminReportView = ({ users, reports, onFilterChange, loading, onExportPDF, currentDateRange }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingSpecificReport, setViewingSpecificReport] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync with URL on mount or location change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get('userId');

    if (userId && users.length > 0) {
      const user = users.find(u => u.id === parseInt(userId) || u.id === userId);
      if (user) {
        setSelectedUser(user);
        setViewingSpecificReport(true);
      }
    }
  }, [location.search, users]);

  const handleViewReport = (user) => {
    navigate(`?userId=${user.id}`, { replace: true });
    setSelectedUser(user);
    setViewingSpecificReport(true);
    onFilterChange({
      userId: user.id,
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    });
  };

  const handleBack = () => {
    navigate('/admin/reports', { replace: true });
    setViewingSpecificReport(false);
    setSelectedUser(null);
  };

  const handleExportPDF = () => {
    if (selectedUser && onExportPDF) {
      onExportPDF(selectedUser, {
        start: currentDateRange.startDate.toLocaleDateString(),
        end: currentDateRange.endDate.toLocaleDateString()
      }, reports);
    }
  };

  if (!viewingSpecificReport) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Attendance Reports</h2>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewReport(user)}
                        className="btn-primary-premium group !py-1.5 !px-4 text-sm"
                      >
                        <div className="btn-shimmer"></div>
                        <span className="relative z-10">View Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span
            onClick={handleBack}
            className="px-4 py-2 bg-white rounded-lg shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 font-bold cursor-pointer hover:shadow-md transition-shadow whitespace-nowrap"
          >
            Back to List
          </span>
          <h2 className="text-2xl font-bold text-gray-900 truncate">
            Report for {selectedUser?.name}
          </h2>
        </div>
        <button
          onClick={handleExportPDF}
          className="btn-primary-premium group flex items-center shadow-lg"
        >
          <div className="btn-shimmer"></div>
          <DocumentArrowDownIcon className="w-5 h-5 mr-2 relative z-10" />
          <span className="relative z-10">Export PDF</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading report data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{reports.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Attendance %</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {reports.length > 0 ? ((reports.filter(r => r.status === 'completed' || r.status === 'present' || r.status === 'checked_in').length / reports.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Weekly Hours</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {reports.slice(0, 7).reduce((acc, curr) => {
                  if (curr.hours_worked) {
                    const parts = curr.hours_worked.split(':');
                    if (parts.length === 2) {
                      const [h, m] = parts.map(Number);
                      return acc + h + (m / 60);
                    }
                  }
                  return acc;
                }, 0).toFixed(1)}h
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Leave %</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {reports.length > 0 ? ((reports.filter(r => r.status === 'absent' || r.status === 'leave').length / reports.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.length > 0 ? reports.map((report, index) => (
                    <tr key={report.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.check_in_time || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.check_out_time || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.location_name || report.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.hours_worked || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.status === 'completed' || report.status === 'present' ? 'bg-green-100 text-green-800' :
                          report.status === 'checked_in' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {report.status === 'completed' || report.status === 'present' ? 'Present' :
                            report.status === 'checked_in' ? 'Incomplete' : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">
                        No records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReportView;