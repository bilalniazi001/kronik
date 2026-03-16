import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Alert = ({ type = 'info', message, onClose, autoClose = 5000 }) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getAlertStyles = () => {
    switch(type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-400',
          text: 'text-green-800',
          icon: <CheckCircleIcon className="w-5 h-5 text-green-400" />
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: <XCircleIcon className="w-5 h-5 text-red-400" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-400',
          text: 'text-yellow-800',
          icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          text: 'text-blue-800',
          icon: <InformationCircleIcon className="w-5 h-5 text-blue-400" />
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`rounded-md ${styles.bg} p-4 border ${styles.border} mb-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${styles.text}`}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${styles.bg} ${styles.text} hover:bg-opacity-75 focus:outline-none`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;