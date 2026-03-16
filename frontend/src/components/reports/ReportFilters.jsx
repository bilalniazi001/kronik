import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FunnelIcon } from '@heroicons/react/24/outline';
import DatePicker from '../common/DatePicker';

const ReportFilters = ({ startDate, endDate, onDateChange }) => {
  const handleStartDateChange = (date) => {
    onDateChange(date, endDate);
  };

  const handleEndDateChange = (date) => {
    onDateChange(startDate, date);
  };

  const setPresetRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onDateChange(start, end);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Reports</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DatePicker
          label="From Date"
          selected={startDate}
          onChange={handleStartDateChange}
          maxDate={endDate}
        />
        <DatePicker
          label="To Date"
          selected={endDate}
          onChange={handleEndDateChange}
          minDate={startDate}
        />
      </div>

      <div className="hidden md:flex flex-wrap gap-2">
        <button
          onClick={() => setPresetRange(7)}
          className="px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg 
                     hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-300"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setPresetRange(30)}
          className="px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg 
                     hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-300"
        >
          Last 30 Days
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            onDateChange(firstDay, today);
          }}
          className="px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg 
                     hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-300"
        >
          This Month
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
            onDateChange(firstDay, lastDay);
          }}
          className="px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg 
                     hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-300"
        >
          Last Month
        </button>
      </div>

      {/* Mobile Filters Dropdown */}
      <div className="md:hidden flex justify-end">
        <Menu as="div" className="relative">
          <Menu.Button className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg focus:outline-none">
            <FunnelIcon className="w-5 h-5" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
              <div className="py-1 bg-white">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setPresetRange(7)}
                      className={`${active ? 'bg-gray-50 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold' : 'text-gray-700'} block w-full text-left px-4 py-3 text-sm transition-all duration-300`}
                    >
                      Last 7 Days
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setPresetRange(30)}
                      className={`${active ? 'bg-gray-50 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold' : 'text-gray-700'} block w-full text-left px-4 py-3 text-sm transition-all duration-300`}
                    >
                      Last 30 Days
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        const today = new Date();
                        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                        onDateChange(firstDay, today);
                      }}
                      className={`${active ? 'bg-gray-50 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold' : 'text-gray-700'} block w-full text-left px-4 py-3 text-sm transition-all duration-300`}
                    >
                      This Month
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        const today = new Date();
                        const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
                        onDateChange(firstDay, lastDay);
                      }}
                      className={`${active ? 'bg-gray-50 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-bold' : 'text-gray-700'} block w-full text-left px-4 py-3 text-sm transition-all duration-300`}
                    >
                      Last Month
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};

export default ReportFilters;