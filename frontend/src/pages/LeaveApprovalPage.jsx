import React, { useState, useEffect } from 'react';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserCircleIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    ArrowLeftIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import leaveService from '../services/leaveService';
import { useAuth } from '../hooks/useAuth';
import { useAlert } from '../hooks/useAlert';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const LeaveApprovalPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const { isHR, isAdmin, isManager } = useAuth();
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, [isHR, isAdmin, activeTab]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            let res;
            if (isHR || isAdmin) {
                res = activeTab === 'pending'
                    ? await api.get('/leaves/hr/pending')
                    : await leaveService.getHRHistory();
            } else {
                res = activeTab === 'pending'
                    ? await api.get('/leaves/manager/pending')
                    : await leaveService.getManagerHistory();
            }

            const data = activeTab === 'pending' ? res.data.data : res.data;
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            showError('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        let reason = '';
        if (action === 'reject') {
            reason = prompt('Enter reason for rejection:');
            if (reason === null) return;
        }

        setProcessing(true);
        try {
            if (isHR || isAdmin) {
                await leaveService.hrAction(id, { action, reason });
            } else {
                await leaveService.managerAction(id, { action, reason });
            }
            showSuccess(`Leave ${action}d successfully`);
            setRequests(requests.filter(r => r.id !== id));
            setIsModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            showError(error.message || 'Action failed');
        } finally {
            setProcessing(false);
        }
    };

    const openDetails = (req) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const StatusBadge = ({ status }) => {
        const config = {
            pending_manager: { label: 'Pending Manager', css: 'bg-yellow-100 text-yellow-700' },
            approved_by_manager: { label: 'Manager Approved', css: 'bg-indigo-100 text-indigo-700' },
            approved: { label: 'Approved', css: 'bg-green-100 text-green-700' },
            rejected_by_manager: { label: 'Rejected by Manager', css: 'bg-red-100 text-red-700' },
            rejected: { label: 'Rejected by HR', css: 'bg-red-100 text-red-700' },
            cancelled: { label: 'Cancelled', css: 'bg-gray-100 text-gray-700' },
        };
        const current = config[status] || { label: status?.replace(/_/g, ' '), css: 'bg-gray-100 text-gray-700' };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${current.css}`}>{current.label}</span>;
    };

    if (loading && requests.length === 0) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading requests...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-24 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            {isHR || isAdmin ? 'Leave Management (HR)' : 'Team Leave Requests (Manager)'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {activeTab === 'pending'
                                ? 'Review and process leave applications pending your approval.'
                                : 'View records of previously processed leave applications.'}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(isAdmin || isHR ? '/admin' : '/')}
                        className="group btn-primary-premium flex items-center focus:outline-none"
                    >
                        <div className="btn-shimmer"></div>
                        Back to Dashboard
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`${activeTab === 'pending'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 font-bold'
                                : 'text-gray-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600'
                                } whitespace-nowrap py-4 px-1 font-medium text-sm transition-all focus:outline-none bg-transparent border-none`}
                            style={{ backgroundSize: '100%', backgroundColor: 'transparent', border: 'none' }}
                        >
                            Pending Actions
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`${activeTab === 'history'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 font-bold'
                                : 'text-gray-500 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600'
                                } whitespace-nowrap py-4 px-1 font-medium text-sm transition-all focus:outline-none bg-transparent border-none`}
                            style={{ backgroundSize: '100%', backgroundColor: 'transparent', border: 'none' }}
                        >
                            History Records
                        </button>
                    </nav>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">App No</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">{activeTab === 'pending' ? 'Actions' : 'Details'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            {activeTab === 'pending'
                                                ? 'No pending leave applications found.'
                                                : 'No history records found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mr-3">
                                                        <UserCircleIcon className="w-6 h-6 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{req.employee_name}</p>
                                                        <p className="text-xs text-gray-500">{req.designation || 'Staff'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                                {req.application_no}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span>{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-indigo-600 font-bold">{req.total_days} Days</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openDetails(req)}
                                                    className="group relative inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 focus:outline-none overflow-hidden"
                                                >
                                                    <div className="btn-shimmer"></div>
                                                    <EyeIcon className="w-3.5 h-3.5 mr-1.5" />
                                                    {activeTab === 'pending' ? 'View & Action' : 'View Summary'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Modal */}
                {isModalOpen && selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">Leave Application Details</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 bg-white hover:bg-gray-50 rounded-full transition-all duration-300 focus:outline-none group shadow-sm border border-gray-100"
                                >
                                    <XCircleIcon className="h-6 w-6 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Employee</p>
                                        <p className="font-bold text-gray-900">{selectedRequest.employee_name}</p>
                                        <p className="text-xs text-gray-500">{selectedRequest.designation}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Application No</p>
                                        <p className="font-mono text-sm text-indigo-600 font-bold">{selectedRequest.application_no}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center text-gray-600">
                                            <CalendarDaysIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                            <span className="text-sm font-medium">
                                                {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <StatusBadge status={selectedRequest.status} />
                                    </div>

                                    {selectedRequest.details && selectedRequest.details.length > 0 && (
                                        <div className="space-y-2 pt-3 border-t border-gray-200/50">
                                            {selectedRequest.details.map((d, i) => (
                                                <div key={i} className="flex justify-between text-xs">
                                                    <span className="text-gray-500">{d.leave_type_name}</span>
                                                    <span className="font-bold text-gray-900">{d.days_applied} Days</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between pt-2 text-sm font-bold text-indigo-600">
                                                <span>Total Duration</span>
                                                <span>{selectedRequest.total_days} Days</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Reason for Leave</p>
                                    <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl italic text-gray-700 text-sm font-medium">
                                        "{selectedRequest.reason}"
                                    </div>
                                </div>

                                {selectedRequest.manager_comments && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Manager Decision Comments</p>
                                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-indigo-600 font-bold">
                                            {selectedRequest.manager_comments}
                                        </div>
                                    </div>
                                )}

                                {selectedRequest.hr_comments && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">HR Decision Comments</p>
                                        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-purple-600 font-bold">
                                            {selectedRequest.hr_comments}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'pending' ? (
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <button
                                            onClick={() => handleAction(selectedRequest.id, 'reject')}
                                            disabled={processing}
                                            className="flex items-center justify-center py-3 bg-white border border-red-200 text-red-600 rounded-2xl hover:bg-red-50 transition-all font-bold text-sm focus:outline-none"
                                        >
                                            <XCircleIcon className="w-5 h-5 mr-2" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedRequest.id, 'approve')}
                                            disabled={processing}
                                            className="flex items-center justify-center py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-200 focus:outline-none"
                                        >
                                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                                            Approve
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all font-bold text-sm focus:outline-none"
                                    >
                                        Close Summary
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveApprovalPage;
