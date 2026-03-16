import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CalendarDaysIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import leaveService from '../services/leaveService';
import { useAlert } from '../hooks/useAlert';

const ApplyLeavePage = () => {
    const [balances, setBalances] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        reason: '',
        total_days: 0,
        is_half_day: false,
        half_day_type: 'first_half',
        details: [{ leave_type_id: '', days_applied: 0 }]
    });
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBalances();
        fetchHolidays();
    }, []);

    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            if (formData.is_half_day) {
                setFormData(prev => ({ ...prev, total_days: 0.5, end_date: prev.start_date }));
            } else {
                const start = new Date(formData.start_date);
                const end = new Date(formData.end_date);
                let count = 0;

                const holidayStrings = holidays.map(h => new Date(h.holiday_date).toISOString().split('T')[0]);

                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dayOfWeek = d.getDay();
                    const dateString = d.toISOString().split('T')[0];
                    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.includes(dateString)) {
                        count++;
                    }
                }
                setFormData(prev => ({ ...prev, total_days: count }));
            }
        }
    }, [formData.start_date, formData.end_date, formData.is_half_day, holidays]);

    const fetchBalances = async () => {
        try {
            const res = await leaveService.getMyBalances();
            setBalances(res.data);
        } catch (error) {
            showError('Failed to load leave balances');
        }
    };

    const fetchHolidays = async () => {
        try {
            const res = await leaveService.getHolidays();
            setHolidays(res.data);
        } catch (error) {
            console.error('Failed to fetch holidays');
        }
    };

    const handleDetailChange = (index, field, value) => {
        const newDetails = [...formData.details];
        newDetails[index][field] = value;
        setFormData({ ...formData, details: newDetails });
    };

    const addDetailRow = () => {
        setFormData({
            ...formData,
            details: [...formData.details, { leave_type_id: '', days_applied: 0 }]
        });
    };

    const removeDetailRow = (index) => {
        if (formData.details.length === 1) return;
        const newDetails = formData.details.filter((_, i) => i !== index);
        setFormData({ ...formData, details: newDetails });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Check if effective days match sum of details
        const detailSum = formData.details.reduce((acc, curr) => acc + parseFloat(curr.days_applied || 0), 0);
        if (detailSum !== formData.total_days) {
            showError(`Breakdown sum (${detailSum}) does not match effective request (${formData.total_days} days).`);
            return;
        }

        // 2. Check each balance
        for (const detail of formData.details) {
            const balance = balances.find(b => b.leave_type_id === parseInt(detail.leave_type_id));
            if (!balance || parseFloat(detail.days_applied) > parseFloat(balance.remaining)) {
                showError(`Insufficient balance for ${balance ? balance.leave_type_name : 'selected type'}.`);
                return;
            }
        }

        setLoading(true);
        try {
            await leaveService.applyLeave(formData);
            showSuccess('Leave application submitted successfully!');
            navigate('/profile'); // Or to a dedicated "My Leaves" page
        } catch (error) {
            showError(error.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-24 pb-12">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Leave Balance Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <ClockIcon className="h-6 w-6 mr-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600" />
                            Available Balance
                        </h3>
                        <div className="space-y-4">
                            {balances.map(b => (
                                <div key={b.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-700 font-bold">{b.leave_type_name}</span>
                                        <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{b.leave_type_code}</span>
                                    </div>
                                    <div className="flex items-baseline">
                                        <span className="text-2xl font-bold text-indigo-600">{b.remaining}</span>
                                        <span className="text-gray-400 text-xs ml-1 font-medium">/ {b.total_allocated} days</span>
                                    </div>
                                    <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-700 ease-out"
                                            style={{ width: `${(b.remaining / b.total_allocated) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {balances.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No balances allocated yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Application Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 shadow-xl">
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
                                Apply for Leave
                            </h2>
                            <p className="text-gray-500 font-medium">
                                Submit your request for manager and HR approval
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <label className="block text-gray-400 text-xs font-medium mb-1 ml-1">Start Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            required
                                            className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 
                                rounded-xl text-gray-900 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="relative group">
                                    <label className="block text-gray-400 text-xs font-medium mb-1 ml-1">End Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            required
                                            className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 
                                rounded-xl text-gray-900 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-gray-500 text-sm font-bold ml-1 uppercase tracking-wider">Leave Breakdown</label>
                                    <button
                                        type="button"
                                        onClick={addDetailRow}
                                        className="text-xs font-bold text-indigo-600 hover:text-purple-600 flex items-center transition-all bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/50 shadow-sm"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1 stroke-[3]" /> Add Type
                                    </button>
                                </div>

                                {formData.details.map((detail, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                                        <div className="col-span-7">
                                            <select
                                                value={detail.leave_type_id}
                                                onChange={(e) => handleDetailChange(index, 'leave_type_id', e.target.value)}
                                                required
                                                className="block w-full px-4 py-2.5 bg-white border border-gray-200 
                                         rounded-xl text-gray-700 text-sm focus:outline-none focus:border-indigo-600 transition-all font-medium"
                                            >
                                                <option value="">Select Type</option>
                                                {balances.map(b => (
                                                    <option key={b.leave_type_id} value={b.leave_type_id}>
                                                        {b.leave_type_name} ({b.remaining} left)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                step="0.5"
                                                placeholder="Days"
                                                value={detail.days_applied}
                                                onChange={(e) => handleDetailChange(index, 'days_applied', e.target.value)}
                                                required
                                                className="block w-full px-4 py-2.5 bg-white border border-gray-200 
                                         rounded-xl text-gray-700 text-sm focus:outline-none focus:border-indigo-600 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-center pb-1">
                                            <button
                                                type="button"
                                                onClick={() => removeDetailRow(index)}
                                                className="p-2.5 bg-white hover:bg-purple-50 text-indigo-500 hover:text-purple-600 rounded-xl transition-all shadow-sm border border-gray-100 group"
                                            >
                                                <TrashIcon className="h-5 w-5 stroke-[2]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center space-x-4 mb-2">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={formData.is_half_day}
                                            onChange={(e) => setFormData({ ...formData, is_half_day: e.target.checked })}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.is_half_day ? 'bg-indigo-600 shadow-indigo-200' : 'bg-gray-200'}`}></div>
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${formData.is_half_day ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 text-gray-700 font-bold group-hover:text-indigo-600 transition-colors">Half Day Leave</span>
                                </label>

                                {formData.is_half_day && (
                                    <select
                                        name="half_day_type"
                                        value={formData.half_day_type}
                                        onChange={handleChange}
                                        className="bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-3 py-1 focus:outline-none"
                                    >
                                        <option value="first_half">First Half</option>
                                        <option value="second_half">Second Half</option>
                                    </select>
                                )}
                            </div>

                            {formData.total_days > 0 && (
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center shadow-sm">
                                    <CheckCircleIcon className="h-5 w-5 text-indigo-600 mr-2" />
                                    <span className="text-indigo-800 font-bold">
                                        Total duration: <span className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg ml-1">{formData.total_days} days</span>
                                    </span>
                                </div>
                            )}

                            <div className="relative group">
                                <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none">
                                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500 group-focus-within:text-purple-600 mt-1" />
                                </div>
                                <textarea
                                    name="reason"
                                    placeholder=" "
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 
                             rounded-xl text-gray-900 focus:outline-none focus:border-indigo-600 resize-none font-medium"
                                />
                                <label className="absolute left-11 top-3 text-gray-400 text-sm pointer-events-none transition-all peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:-top-2.5 peer-focus:bg-white peer-focus:px-1">
                                    Reason for leave
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || formData.total_days === 0}
                                className="group relative w-full py-4 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl 
                           hover:from-purple-700 hover:to-indigo-700 focus:outline-none disabled:opacity-70 transition-all duration-300 shadow-xl shadow-purple-200 mt-4 overflow-hidden"
                            >
                                <div className="btn-shimmer"></div>
                                {loading ? 'Submitting Request...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ApplyLeavePage;
