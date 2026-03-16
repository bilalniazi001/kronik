const moment = require('moment-timezone');

// Set timezone to Pakistan
const TIMEZONE = 'Asia/Karachi';

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    return moment().tz(TIMEZONE).format('YYYY-MM-DD');
}

// Get current time in HH:MM:SS format
function getCurrentTime() {
    return moment().tz(TIMEZONE).format('HH:mm:ss');
}

// Format date for display
function formatDate(date, format = 'DD MMM YYYY') {
    return moment(date).tz(TIMEZONE).format(format);
}

// Format time for display
function formatTime(time, format = 'hh:mm A') {
    return moment(time, 'HH:mm:ss').tz(TIMEZONE).format(format);
}

// Calculate hours between two times
function calculateHours(startTime, endTime) {
    const start = moment(startTime, 'HH:mm:ss');
    const end = moment(endTime, 'HH:mm:ss');
    const duration = moment.duration(end.diff(start));
    
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Get month date range
function getMonthDateRange(year, month) {
    const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month');
    
    return {
        start: startDate.format('YYYY-MM-DD'),
        end: endDate.format('YYYY-MM-DD')
    };
}

// Validate date range
function validateDateRange(startDate, endDate) {
    const start = moment(startDate);
    const end = moment(endDate);
    
    if (!start.isValid() || !end.isValid()) {
        throw new Error('Invalid date format');
    }
    
    if (end.isBefore(start)) {
        throw new Error('End date cannot be before start date');
    }
    
    return true;
}

module.exports = {
    getCurrentDate,
    getCurrentTime,
    formatDate,
    formatTime,
    calculateHours,
    getMonthDateRange,
    validateDateRange
};