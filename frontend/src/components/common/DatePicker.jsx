import React from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

const DatePicker = ({ label, selected, onChange, minDate, maxDate }) => {
  const handleChange = (e) => {
    const date = new Date(e.target.value);
    onChange(date);
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const minDateStr = minDate ? formatDateForInput(minDate) : '';
  const maxDateStr = maxDate ? formatDateForInput(maxDate) : '';

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="date"
          value={formatDateForInput(selected)}
          onChange={handleChange}
          min={minDateStr}
          max={maxDateStr}
          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default DatePicker;