import React, { useState, useEffect } from 'react';
import { MegaphoneIcon, CalendarIcon, UserIcon, BellIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

const AnnouncementsPage = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllContent = async () => {
            try {
                setLoading(true);
                let allItems = [];

                // 1. Fetch Global Announcements
                const annRes = await api.get('/announcements');
                if (annRes.data?.success && Array.isArray(annRes.data?.data)) {
                    const formattedAnns = annRes.data.data.map(a => ({
                        ...a,
                        _type: 'announcement',
                        display_title: a.title,
                        display_message: a.content || a.message,
                        date: new Date(a.created_at)
                    }));
                    allItems = [...allItems, ...formattedAnns];
                }

                // 2. Fetch Personal System Notifications
                if (user) {
                    const sysRes = await api.get('/notifications');
                    if (sysRes.data?.success && Array.isArray(sysRes.data?.data)) {
                        const formattedSys = sysRes.data.data.map(n => ({
                            ...n,
                            _type: 'system',
                            display_title: n.title,
                            display_message: n.message,
                            date: new Date(n.created_at)
                        }));
                        allItems = [...allItems, ...formattedSys];
                    }
                }

                // Sort chronologically (newest first)
                allItems.sort((a, b) => b.date - a.date);
                setAnnouncements(allItems);
            } catch (err) {
                console.error('Error fetching content:', err);
                setError('Failed to load content. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllContent();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MegaphoneIcon className="w-8 h-8 text-indigo-600" />
                    Announcements
                </h1>
            </div>

            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    {error}
                </div>
            ) : announcements.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <MegaphoneIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">No announcements yet</h3>
                    <p className="text-gray-500 mt-2">When admins post announcements, they will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {announcements.map((item) => (
                        <div
                            key={`${item._type}-${item.id}`}
                            className={`bg-white rounded-2xl shadow-sm border ${item._type === 'system' && !item.is_read ? 'border-indigo-200' : 'border-gray-100'} overflow-hidden hover:shadow-md transition-shadow`}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl flex items-center justify-center ${item._type === 'announcement' ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {item._type === 'announcement' ? (
                                                <MegaphoneIcon className="w-6 h-6" />
                                            ) : (
                                                <BellIcon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">{item.display_title}</h2>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item._type === 'announcement' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                        {item._type === 'announcement' ? 'Important' : 'System Update'}
                                    </span>
                                </div>

                                <div className="ml-12">
                                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                        {item.display_message}
                                    </p>

                                    <div className="mt-6 pt-6 border-t border-gray-50 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="w-4 h-4" />
                                            {format(item.date, 'MMM dd, yyyy p')}
                                        </div>
                                        {item._type === 'announcement' && (
                                            <div className="flex items-center gap-1.5">
                                                <UserIcon className="w-4 h-4" />
                                                Posted by: {item.admin_name || 'Admin'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementsPage;
