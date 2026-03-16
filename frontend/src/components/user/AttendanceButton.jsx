import React from 'react';

const AttendanceButton = ({ type, onClick, loading, disabled }) => {
  const getButtonStyles = () => {
    if (type === 'checkin') {
      return {
        bg: 'bg-gradient-to-r from-green-400 to-green-600',
        hover: 'hover:from-green-500 hover:to-green-700',
        text: 'CHECK IN',
        icon: '↗'
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-red-400 to-red-600',
        hover: 'hover:from-red-500 hover:to-red-700',
        text: 'CHECK OUT',
        icon: '↙'
      };
    }
  };

  const styles = getButtonStyles();

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-48 h-48 rounded-full ${styles.bg} ${styles.hover} text-white font-bold text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          <span className="text-4xl mb-2">{styles.icon}</span>
          <span>{styles.text}</span>
        </>
      )}
    </button>
  );
};

export default AttendanceButton;