import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { AlertContext } from '../context/AlertContext';

// Sirf component export - yeh allowed hai
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showSuccess = React.useCallback((message) => {
    toast.success(message);
    setAlerts(prev => [...prev, { type: 'success', message, id: Date.now() }]);
  }, []);

  const showError = React.useCallback((message) => {
    toast.error(message);
    setAlerts(prev => [...prev, { type: 'error', message, id: Date.now() }]);
  }, []);

  const showInfo = React.useCallback((message) => {
    toast.info(message);
    setAlerts(prev => [...prev, { type: 'info', message, id: Date.now() }]);
  }, []);

  const showWarning = React.useCallback((message) => {
    toast.warning(message);
    setAlerts(prev => [...prev, { type: 'warning', message, id: Date.now() }]);
  }, []);

  const removeAlert = React.useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAlerts = React.useCallback(() => {
    setAlerts([]);
  }, []);

  const value = React.useMemo(() => ({
    alerts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeAlert,
    clearAlerts,
  }), [alerts, showSuccess, showError, showInfo, showWarning, removeAlert, clearAlerts]);

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};