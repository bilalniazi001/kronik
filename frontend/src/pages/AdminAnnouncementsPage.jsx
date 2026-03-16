import React, { useState, useEffect, useCallback } from 'react';
import { useAlert } from '../hooks/useAlert';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { MegaphoneIcon, PlusIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const AdminAnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const { showSuccess, showError } = useAlert();

    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/announcements');
            if (response.data.success) {
                setAnnouncements(response.data.data);
            }
        } catch (error) {
            showError('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/announcements', formData);
            if (response.data.success) {
                showSuccess('Announcement published successfully');
                setModalOpen(false);
                setFormData({ title: '', content: '' });
                fetchAnnouncements();
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to publish announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await api.delete(`/admin/announcements/${id}`);
            showSuccess('Announcement deleted');
            fetchAnnouncements();
        } catch (error) {
            showError('Failed to delete announcement');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MegaphoneIcon className="w-8 h-8 text-purple-600" />
                        Announcement Management
                    </h1>
                    <p className="text-gray-600 mt-1">Create and manage system-wide announcements</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="btn-primary-premium group flex items-center"
                >
                    <div className="btn-shimmer"></div>
                    <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">New Announcement</span>
                </button>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="grid gap-6">
                    {announcements.length > 0 ? (
                        announcements.map((ann) => (
                            <div key={ann.id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{ann.title}</h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                {format(new Date(ann.created_at), 'MMM dd, yyyy p')}
                                            </span>
                                            <span>By: {ann.admin_name || 'Admin'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(ann.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                    {ann.content || ann.message}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                            <MegaphoneIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500">No announcements found. Click 'New Announcement' to create one.</p>
                        </div>
                    )}
                </div>
            )}

            {/* New Announcement Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Create New Announcement"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Important Update"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                            required
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Write your announcement message here..."
                        ></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="btn-primary-premium group flex-1"
                        >
                            <div className="btn-shimmer"></div>
                            <span className="relative z-10">Publish Announcement</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminAnnouncementsPage;
