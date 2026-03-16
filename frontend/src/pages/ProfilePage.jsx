import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import EditProfileForm from '../components/user/EditProfileForm';
import ProfileImageUpload from '../components/user/ProfileImageUpload';
import DocumentList from '../components/user/DocumentList';
import DocumentUpload from '../components/user/DocumentUpload';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
  PencilIcon,
  Cog6ToothIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  WalletIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import leaveService from '../services/leaveService';
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  // Ensure we don't have double slashes when joining
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${cleanPath}`;
};

const ProfilePage = () => {
  const { showError, showSuccess } = useAlert();
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { isHR, isAdmin, isManager } = useAuth();

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await userService.getProfile();
      setUser(profileData.user);
      setDocuments(profileData.documents || []);

      // Fetch Leave Data
      const [balancesRes, historyRes] = await Promise.all([
        leaveService.getMyBalances(),
        leaveService.getMyLeaves()
      ]);
      setLeaveBalances(balancesRes.data);
      setLeaveHistory(historyRes.data);

      // Fetch Team Requests if Manager/HR
      if (isManager || isHR || isAdmin) {
        const res = isHR || isAdmin
          ? await api.get('/leaves/hr/pending')
          : await api.get('/leaves/manager/pending');
        setTeamRequests(res.data.data);
      }
    } catch (error) {
      console.error("PROFILE LOAD ERROR:", error);
      showError(error?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [showError, isManager, isHR, isAdmin]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleProfileUpdate = async (updatedUser) => {
    setUser(updatedUser);
    updateUser(updatedUser); // Sync to global context
    setEditMode(false);
    showSuccess('Profile updated successfully');
  };

  const handleImageUpload = async (imageUrl) => {
    const updatedUser = { ...user, profile_image: imageUrl };
    setUser(updatedUser);
    updateUser({ profile_image: imageUrl }); // Sync to global context
  };

  const handleDocumentUpload = (newDocument) => {
    setDocuments([...documents, newDocument]);
  };

  const handleDocumentDelete = (documentId) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const handleLeaveAction = async (id, action) => {
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
      alert(`Leave ${action}d successfully`);
      showSuccess(`Leave ${action}d successfully`);
      setTeamRequests(teamRequests.filter(r => r.id !== id));
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      showError(error.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Profile Info', icon: IdentificationIcon },
    { id: 'leaves', label: 'My Leaves', icon: WalletIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  if (isManager || isHR || isAdmin) {
    tabs.splice(2, 0, { id: 'team_leaves', label: 'Team Leaves', icon: UserGroupIcon });
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Profile Header Card - Centered like reference image */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Gradient Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative"></div>

        {/* Profile Info - Overlapping banner */}
        <div className="relative px-6 pb-6">
          {/* Profile Image - Centered, overlapping */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="relative group">
              {user?.profile_image ? (
                <img
                  src={getFullImageUrl(user.profile_image)}
                  alt={user.name}
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const next = e.target.nextElementSibling;
                    if (next) next.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`${user?.profile_image ? 'hidden' : 'flex'} w-28 h-28 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 items-center justify-center border-4 border-white shadow-lg`}>
                <span className="text-4xl font-bold text-white uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>

              {/* Quick edit image button */}
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-white text-indigo-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all duration-300 border-2 border-indigo-50">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('profile_image', file);
                    try {
                      const response = await userService.uploadProfileImage(formData);
                      const updatedUser = { ...user, profile_image: response.profile_image };
                      setUser(updatedUser);
                      updateUser({ profile_image: response.profile_image }); // Sync to global context
                      showSuccess('Profile picture updated!');
                    } catch (err) {
                      showError(err.message || 'Upload failed');
                    }
                  }}
                />
                <PencilIcon className="w-4.5 h-4.5" />
              </label>
            </div>
          </div>

          {/* Name & Designation */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
            <p className="text-gray-500 text-sm mt-1">{user?.designation || 'Employee'}</p>
          </div>

          {/* Quick Info Row */}
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            {user?.department && (
              <div className="flex items-center gap-1.5">
                <IdentificationIcon className="w-4 h-4 text-indigo-500" />
                <span>{user.department}</span>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center gap-1.5">
                <EnvelopeIcon className="w-4 h-4 text-indigo-500" />
                <span className="truncate max-w-[200px]">{user.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Apply Leave Promotion Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-indigo-900">Request Time Off</h3>
                <p className="text-xs text-indigo-600/70 font-medium">Plan your leaves and get approvals easily</p>
              </div>
            </div>
            <Link
              to="/apply-leave"
              className="w-full sm:w-auto text-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Apply for Leave
            </Link>
          </div>

          {/* Leave Balances Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaveBalances.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">{b.leave_type_name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{b.remaining}</span>
                  <span className="text-xs text-gray-400">/ {b.total_allocated}</span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${(b.remaining / b.total_allocated) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Leave History Table */}
          <div className="bg-white rounded-2xl shadow-md p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-6 font-primary">Leave History</h2>
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">App No</th>
                    <th className="px-6 py-3">Breakdown</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaveHistory.map((leave) => (
                    <tr key={leave.id} className="text-sm hover:bg-gray-100/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                        {leave.application_no}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {leave.details && leave.details.map((d, i) => (
                            <span key={i} className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md border border-indigo-100 whitespace-nowrap">
                              {d.leave_type_name}: {d.days_applied}d
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">{new Date(leave.start_date).toLocaleDateString()}</span>
                          <span className="text-[10px] text-gray-400">Total: {leave.total_days} days</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(leave.status === 'pending' || leave.status === 'approved_by_manager') && (
                          <button
                            onClick={async () => {
                              if (window.confirm('Cancel this request?')) {
                                try {
                                  await leaveService.cancelLeave(leave.id);
                                  showSuccess('Request cancelled');
                                  fetchProfileData();
                                } catch (e) {
                                  showError(e.message);
                                }
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancel Request"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {leaveHistory.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No leave applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'team_leaves' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Pending Team Requests</h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                {teamRequests.length} Pending
              </span>
            </div>
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teamRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center mr-3 border border-indigo-100">
                            <IdentificationIcon className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{req.employee_name}</p>
                            <p className="text-[10px] text-gray-500">{req.designation || 'Staff'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium">{new Date(req.start_date).toLocaleDateString()}</span>
                          <span className="text-[10px] text-indigo-600 font-bold">{req.total_days} Days</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          <EyeIcon className="w-3.5 h-3.5 mr-1.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teamRequests.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        No pending team leave applications.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="space-y-6">
          {editMode ? (
            <EditProfileForm
              user={user}
              onUpdate={handleProfileUpdate}
              onCancel={() => setEditMode(false)}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                <button
                  onClick={() => setEditMode(true)}
                  className="relative px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-xl
                                hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/30 hover:shadow-indigo-500/50
                                transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden group"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                  <span className="relative z-10 flex items-center gap-1.5">
                    <PencilIcon className="w-4 h-4" />
                    Edit Profile
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={IdentificationIcon} label="Full Name" value={user?.name} />
                <InfoItem icon={EnvelopeIcon} label="Email" value={user?.email} />
                <InfoItem icon={PhoneIcon} label="Phone" value={user?.phone} />
                <InfoItem icon={IdentificationIcon} label="CNIC" value={user?.cnic} />
                <InfoItem icon={IdentificationIcon} label="Department" value={user?.department || 'Not Set'} />
                <InfoItem icon={IdentificationIcon} label="Designation" value={user?.designation || 'Employee'} />
                <div className="md:col-span-2">
                  <InfoItem icon={MapPinIcon} label="Address" value={user?.address} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">My Documents</h2>
          <DocumentUpload onUpload={handleDocumentUpload} />
          <DocumentList
            documents={documents}
            onDelete={handleDocumentDelete}
          />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Picture</h2>
            <ProfileImageUpload
              currentImage={getFullImageUrl(user?.profile_image)}
              onUpload={handleImageUpload}
            />
          </div>
        </div>
      )}

      {/* Detail Modal for Team Leaves */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Leave Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XCircleIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <IdentificationIcon className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{selectedRequest.employee_name}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.designation}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-600 gap-2">
                    <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm font-medium">
                      {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{selectedRequest.total_days} Days</span>
                </div>
                <div className="pt-3 border-t border-gray-200/50">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Reason</p>
                  <p className="text-sm text-gray-700 italic">"{selectedRequest.reason}"</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleLeaveAction(selectedRequest.id, 'reject')}
                  disabled={processing}
                  className="flex items-center justify-center py-3 bg-white border border-red-200 text-red-600 rounded-2xl hover:bg-red-50 transition-all font-bold text-sm"
                >
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => handleLeaveAction(selectedRequest.id, 'approve')}
                  disabled={processing}
                  className="flex items-center justify-center py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-200"
                >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable info item component
const InfoItem = ({ icon: IconComponent, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
    <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
      <IconComponent className="w-4.5 h-4.5 text-indigo-600" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-900 font-medium truncate">{value || 'Not provided'}</p>
    </div>
  </div>
);
const StatusBadge = ({ status }) => {
  const config = {
    pending_manager: { label: 'Pending Manager', css: 'bg-yellow-100 text-yellow-700' },
    approved_by_manager: { label: 'Approved by Manager (Pending HR)', css: 'bg-indigo-100 text-indigo-700' },
    approved: { label: 'Approved', css: 'bg-green-100 text-green-700' },
    rejected_by_manager: { label: 'Rejected by Manager', css: 'bg-red-100 text-red-700' },
    rejected: { label: 'Rejected by HR', css: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Cancelled', css: 'bg-gray-100 text-gray-700' },
    not_approved: { label: 'Not Approved', css: 'bg-red-100 text-red-700' },
  };
  const current = config[status] || { label: status?.replace(/_/g, ' ') || 'Unknown', css: 'bg-gray-100 text-gray-600' };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${current.css}`}>
      {current.label}
    </span>
  );
};

export default ProfilePage;