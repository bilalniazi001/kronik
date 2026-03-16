import React, { useState, useEffect, useCallback } from 'react';
import { useAlert } from '../hooks/useAlert';
import adminService from '../services/adminService';
import Loader from '../components/common/Loader';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const AdminAttendancePage = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 20
    });
    const { showError } = useAlert();

    const fetchAttendance = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminService.getAttendance(
                pagination.currentPage,
                pagination.limit
            );
            setAttendance(response.attendance);
            // Backend pagination for attendance might be different, adjusting
            if (response.pagination) {
                setPagination(prev => ({
                    ...prev,
                    totalPages: Math.ceil((response.pagination.total_records || 100) / prev.limit)
                }));
            }
        } catch (error) {
            console.error('Fetch attendance error:', error);
            showError('Failed to fetch attendance records');
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.limit, showError]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const filteredAttendance = attendance.filter(record =>
        record.name?.toLowerCase().includes(search.toLowerCase()) ||
        record.email?.toLowerCase().includes(search.toLowerCase()) ||
        record.cnic?.includes(search)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                    <p className="text-gray-600 mt-1">Monitor user check-in and check-out activity</p>
                </div>
            </div>



            {/* Attendance Table */}
            {loading ? (
                <Loader />
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">User</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Check In</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Check Out</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Hours</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attendance.length > 0 ? (
                                    attendance.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{record.name}</p>
                                                    <p className="text-xs text-gray-500">{record.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {record.check_in_time || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {record.check_out_time || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {record.hours_worked || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    record.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                                                        record.status === 'leave' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {record.status === 'leave' ? record.leave_type || 'Leave' : record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/admin/reports?userId=${record.user_id}`}
                                                    className="btn-primary-premium group !py-1 !px-3 text-xs flex items-center inline-flex"
                                                >
                                                    <div className="btn-shimmer"></div>
                                                    <EyeIcon className="w-3.5 h-3.5 mr-1 relative z-10" />
                                                    <span className="relative z-10">View Details</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="btn-primary-premium group !py-1 !px-4 text-sm disabled:opacity-50 disabled:transform-none"
                        >
                            <div className="btn-shimmer"></div>
                            <span className="relative z-10">Previous</span>
                        </button>
                        <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium">
                            {pagination.currentPage} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="btn-primary-premium group !py-1 !px-4 text-sm disabled:opacity-50 disabled:transform-none"
                        >
                            <div className="btn-shimmer"></div>
                            <span className="relative z-10">Next</span>
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default AdminAttendancePage;
