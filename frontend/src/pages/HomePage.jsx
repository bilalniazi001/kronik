import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAlert } from '../hooks/useAlert';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import attendanceService from '../services/attendanceService';
import { MapPinIcon, ClockIcon, CalendarDaysIcon, ArrowLeftOnRectangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [attendance, setAttendance] = useState({
    checked_in: false,
    checked_out: false,
    check_in_time: null,
    check_out_time: null,
    check_in_location: null,
    check_out_location: null,
    hours_worked: null
  });
  const [stats, setStats] = useState({
    attendance_days: 0,
    leave_days: 0,
    incomplete_days: 0,
    weekly_hours: '0h 0m',
    weekly_minutes: 0
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance + stats from backend on page load
  const fetchData = useCallback(async () => {
    try {
      setPageLoading(true);
      const [todayRes, statsRes] = await Promise.all([
        attendanceService.getTodayStatus(),
        attendanceService.getStats()
      ]);

      if (todayRes.success && todayRes.data) {
        setAttendance({
          checked_in: todayRes.data.checked_in || false,
          checked_out: todayRes.data.checked_out || false,
          check_in_time: todayRes.data.check_in_time || null,
          check_out_time: todayRes.data.check_out_time || null,
          check_in_location: todayRes.data.check_in_location || null,
          check_out_location: todayRes.data.check_out_location || null,
          hours_worked: todayRes.data.hours_worked || null
        });
      }

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            let message = 'Failed to get location';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Please enable location to check in/out';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                message = 'Location request timeout';
                break;
            }
            reject(new Error(message));
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:-- --';
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

  const getGoogleMapsUrl = (locationStr) => {
    if (!locationStr) return null;
    const parts = locationStr.split(',');
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return `https://www.google.com/maps?q=${parts[0].trim()},${parts[1].trim()}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(locationStr)}`;
  };

  const handleCheckIn = async (e) => {
    if (e) e.preventDefault();

    // Check if day is complete
    if (attendance?.checked_in && attendance?.checked_out) {
      alert('You have already completed your attendance sessions for today. You can check in again on your next working day.');
      return;
    }

    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const response = await attendanceService.checkIn({
        latitude: location.latitude,
        longitude: location.longitude
      });
      if (response.success) {
        setAttendance({
          ...attendance,
          checked_in: true,
          checked_out: false, // Reset checked_out for new session
          check_in_time: response.data.check_in_time,
          check_in_location: response.data.location,
          check_out_time: null,
          check_out_location: null,
          hours_worked: null
        });
        showSuccess(response.message || 'Check-In Successful!');
      }
    } catch (error) {
      showError(error?.message || 'Check-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const response = await attendanceService.checkOut({
        latitude: location.latitude,
        longitude: location.longitude
      });
      if (response.success) {
        setAttendance({
          ...attendance,
          checked_out: true,
          check_out_time: response.data.check_out_time,
          check_out_location: response.data.location,
          hours_worked: response.data.hours_worked
        });
        showSuccess(response.message || 'Check-Out Successful!');
        // Refresh stats after checkout
        try {
          const statsRes = await attendanceService.getStats();
          if (statsRes.success) setStats(statsRes.stats);
        } catch { }
      }
    } catch (error) {
      showError(error?.message || 'Check-out failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderLocationLink = (locationStr, label) => {
    if (!locationStr) return <span className="text-gray-400">Not recorded</span>;
    const mapsUrl = getGoogleMapsUrl(locationStr);
    const displayName = locationStr.length > 50 ? locationStr.substring(0, 50) + '...' : locationStr;
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors group"
        title={`Open ${label} location in Google Maps\n${locationStr}`}
      >
        <MapPinIcon className="w-4 h-4 flex-shrink-0 group-hover:text-red-500 transition-colors" />
        <span className="text-sm">{displayName}</span>
      </a>
    );
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-indigo-100 mt-1">{format(currentTime, 'EEEE, MMMM do yyyy')}</p>
            <p className="text-indigo-100 text-2xl font-semibold mt-2 font-mono">
              {format(currentTime, 'h:mm:ss a')}
            </p>
          </div>
          {user?.profile_image && (
            <img
              src={user.profile_image.startsWith('http') ? user.profile_image : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/${user.profile_image}`}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Attendance Days</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.attendance_days}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CalendarDaysIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Leave Days</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.leave_days}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowLeftOnRectangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Weekly Hours</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.weekly_hours}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Mon - Sun</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Incomplete</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.incomplete_days}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">No checkout</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-primary">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/apply-leave"
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-1 transition-all duration-300"
          >
            <CalendarDaysIcon className="w-6 h-6" />
            <div className="text-left">
              <p className="text-sm font-bold">Apply for Leave</p>
              <p className="text-[10px] text-indigo-100 font-medium">Request time off from work</p>
            </div>
          </Link>

          <Link
            to="/reports"
            className="flex items-center gap-3 px-6 py-4 bg-white border-2 border-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all duration-300"
          >
            <ClockIcon className="w-6 h-6" />
            <div className="text-left">
              <p className="text-sm font-bold">View Reports</p>
              <p className="text-[10px] text-gray-400 font-medium">Check your attendance history</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Today's Attendance Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Attendance</h2>

        {/* Check-in / Check-out details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1 font-medium">Check In</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatTime(attendance.check_in_time)}
            </p>
            {attendance.check_in_location && (
              <div className="mt-2">
                {renderLocationLink(attendance.check_in_location, 'Check-In')}
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1 font-medium">Check Out</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatTime(attendance.check_out_time)}
            </p>
            {attendance.check_out_location && (
              <div className="mt-2">
                {renderLocationLink(attendance.check_out_location, 'Check-Out')}
              </div>
            )}
          </div>
        </div>

        {/* Hours Worked */}
        {attendance.hours_worked && (
          <div className="text-center mb-4 py-3 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Hours Worked Today</p>
            <p className="text-2xl font-bold text-indigo-600">{attendance.hours_worked}</p>
          </div>
        )}

        {/* Check-in/out Buttons */}
        <div className="flex flex-col items-center justify-center py-6">
          {user?.userType === 'admin' ? (
            <div className="text-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 w-full max-w-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LockClosedIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Restricted Access</h3>
              <p className="text-gray-500 mt-2">
                Attendance tracking is only available for regular employee accounts.
              </p>
            </div>
          ) : !attendance.checked_in ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="relative w-44 h-44 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 
                         text-white font-bold text-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50
                         transform hover:scale-105 hover:-translate-y-1 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex flex-col items-center justify-center overflow-hidden group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <span>CHECK IN</span>
              )}
            </button>
          ) : !attendance.checked_out ? (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="relative w-44 h-44 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600
                         text-white font-bold text-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50
                         transform hover:scale-105 hover:-translate-y-1 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex flex-col items-center justify-center overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-[100%] group-hover:translate-y-[-100%] transition-transform duration-700 ease-in-out"></div>
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white relative z-10"></div>
              ) : (
                <span className="relative z-10 font-bold">CHECK OUT</span>
              )}
            </button>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-green-600">Day Completed!</p>
              <p className="text-gray-500 mt-2 mb-6 text-center">Total Hours: {attendance.hours_worked || '00:00'}</p>

              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="relative w-44 h-44 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 
                           text-white font-bold text-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50
                           transform hover:scale-105 hover:-translate-y-1 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex flex-col items-center justify-center overflow-hidden group"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  <span>CHECK IN</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;