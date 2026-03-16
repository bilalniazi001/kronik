import React from 'react';

const CheckOutButton = ({ onClick, loading, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-48 h-48 rounded-full bg-gradient-to-r from-red-400 to-red-600 
                 text-white font-bold text-2xl shadow-lg hover:shadow-xl 
                 transform hover:scale-105 transition duration-300
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex flex-col items-center justify-center"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      ) : (
        <>
          <span className="text-4xl mb-2">↙</span>
          <span>CHECK OUT</span>
        </>
      )}
    </button>
  );
};

export default CheckOutButton;