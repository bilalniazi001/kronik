import { useState, useEffect, useCallback } from 'react';
import attendanceService from '../services/attendanceService';
import { useAlert } from './useAlert';

export const useAttendance = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const { showError } = useAlert();

  const fetchTodayStatus = useCallback(async () => {
    try {
      const response = await attendanceService.getTodayStatus();
      setTodayStatus(response.data);
    } catch {
      showError('Failed to fetch attendance status');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchTodayStatus();
  }, [fetchTodayStatus]);

  const checkIn = async (locationData) => {
    setCheckingIn(true);
    try {
      const response = await attendanceService.checkIn(locationData);
      setTodayStatus(response.data);
      return { success: true, data: response.data };
    } catch {
      showError('Check-in failed');
      return { success: false, error: 'Check-in failed' };
    } finally {
      setCheckingIn(false);
    }
  };

  const checkOut = async (locationData) => {
    setCheckingOut(true);
    try {
      const response = await attendanceService.checkOut(locationData);
      setTodayStatus(response.data);
      return { success: true, data: response.data };
    } catch {
      showError('Check-out failed');
      return { success: false, error: 'Check-out failed' };
    } finally {
      setCheckingOut(false);
    }
  };

  const canLogout = async () => {
    try {
      const response = await attendanceService.canLogout();
      return response.can_logout;
    } catch {
      return true;
    }
  };

  return {
    todayStatus,
    loading,
    checkingIn,
    checkingOut,
    checkIn,
    checkOut,
    canLogout,
    refresh: fetchTodayStatus
  };
};