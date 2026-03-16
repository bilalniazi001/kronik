import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { format } from 'date-fns';
import { useAlert } from '../hooks/useAlert';

const HolidayCalendarPage = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', holiday_date: '' });
    const { showSuccess, showError } = useAlert();

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const response = await api.get('/holidays');
            if (response.data.success) {
                setHolidays(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching holidays', error);
            showError('Failed to load holidays');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/holidays', formData);
            showSuccess('Holiday added successfully');
            setFormData({ title: '', holiday_date: '' });
            fetchHolidays();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to add holiday');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this holiday?')) return;
        try {
            await api.delete(`/holidays/${id}`);
            showSuccess('Holiday deleted');
            fetchHolidays();
        } catch (error) {
            showError('Failed to delete holiday');
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CalendarDaysIcon className="w-8 h-8 text-indigo-600" />
                    Public Holidays
                </h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Global Holiday</h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Eid al-Fitr"
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            name="holiday_date"
                            value={formData.holiday_date}
                            onChange={handleChange}
                            required
                            className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                            </tr>
                        ) : holidays.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No public holidays defined.</td>
                            </tr>
                        ) : (
                            holidays.map((holiday) => (
                                <tr key={holiday.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {format(new Date(holiday.holiday_date), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {holiday.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {holiday.created_by_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(holiday.id)}
                                            className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:bg-purple-50 transition-all group"
                                        >
                                            <TrashIcon className="w-5 h-5 text-indigo-600 group-hover:text-purple-600 transition-colors" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HolidayCalendarPage;
