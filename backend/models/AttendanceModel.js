const { pool } = require('../config/database');
const moment = require('moment-timezone');

class AttendanceModel {
    // Check in
    static async checkIn(userId, checkInData) {
        const { latitude, longitude, location_name } = checkInData;
        const currentTime = moment().tz('Asia/Karachi').format('HH:mm:ss');
        const currentDate = moment().tz('Asia/Karachi').format('YYYY-MM-DD');

        // Check if there's an active (non-completed) session for today
        const [existing] = await pool.query(
            'SELECT id FROM attendance WHERE user_id = ? AND date = ? AND status = "checked_in"',
            [userId, currentDate]
        );

        if (existing.length > 0) {
            throw new Error('Already checked in');
        }

        // Create location string
        const location = location_name || `${latitude},${longitude}`;

        const [result] = await pool.query(
            `INSERT INTO attendance 
            (user_id, date, check_in_time, check_in_location, check_in_latitude, check_in_longitude, status)
            VALUES (?, ?, ?, ?, ?, ?, 'checked_in')`,
            [userId, currentDate, currentTime, location, latitude, longitude]
        );

        return {
            id: result.insertId,
            date: currentDate,
            check_in_time: currentTime,
            location
        };
    }

    // Check out
    static async checkOut(userId, checkOutData) {
        const { latitude, longitude, location_name } = checkOutData;
        const currentTime = moment().tz('Asia/Karachi').format('HH:mm:ss');
        const currentDate = moment().tz('Asia/Karachi').format('YYYY-MM-DD');

        // Find the latest active check-in record for today
        const [attendance] = await pool.query(
            `SELECT * FROM attendance 
             WHERE user_id = ? AND date = ? AND status = 'checked_in'
             ORDER BY id DESC LIMIT 1`,
            [userId, currentDate]
        );

        if (attendance.length === 0) {
            throw new Error('No check-in record found for today');
        }

        if (attendance[0].check_out_time) {
            throw new Error('Already checked out today');
        }

        // Calculate hours worked
        const checkInTime = attendance[0].check_in_time;
        const checkOutMoment = moment(currentTime, 'HH:mm:ss');
        const checkInMoment = moment(checkInTime, 'HH:mm:ss');
        const duration = moment.duration(checkOutMoment.diff(checkInMoment));
        const hoursWorked = `${String(Math.floor(duration.asHours())).padStart(2, '0')}:${String(duration.minutes()).padStart(2, '0')}`;

        // Create location string
        const location = location_name || `${latitude},${longitude}`;

        const [result] = await pool.query(
            `UPDATE attendance 
             SET check_out_time = ?,
                 check_out_location = ?,
                 check_out_latitude = ?,
                 check_out_longitude = ?,
                 hours_worked = ?,
                 status = 'completed'
             WHERE id = ?`,
            [currentTime, location, latitude, longitude, hoursWorked, attendance[0].id]
        );

        return {
            id: attendance[0].id,
            date: currentDate,
            check_in_time: attendance[0].check_in_time,
            check_out_time: currentTime,
            hours_worked: hoursWorked,
            location
        };
    }

    // Get today's attendance status
    static async getTodayStatus(userId) {
        const [rows] = await pool.query(
            `SELECT * FROM attendance 
             WHERE user_id = ? AND date = CURDATE()
             ORDER BY id DESC LIMIT 1`,
            [userId]
        );

        if (rows.length === 0) {
            return {
                checked_in: false,
                checked_out: false,
                message: 'Not checked in today'
            };
        }

        return {
            id: rows[0].id,
            checked_in: !!rows[0].check_in_time,
            checked_out: !!rows[0].check_out_time,
            check_in_time: rows[0].check_in_time,
            check_out_time: rows[0].check_out_time,
            check_in_location: rows[0].check_in_location,
            check_out_location: rows[0].check_out_location,
            hours_worked: rows[0].hours_worked,
            status: rows[0].status
        };
    }

    // Get user attendance history
    static async getUserHistory(userId, startDate, endDate, limit = 30, offset = 0) {
        const [rows] = await pool.query(
            `SELECT id, date, check_in_time, check_out_time, 
                    check_in_location, check_out_location,
                    hours_worked, status
             FROM attendance 
             WHERE user_id = ? 
               AND date BETWEEN ? AND ?
             ORDER BY date DESC
             LIMIT ? OFFSET ?`,
            [userId, startDate, endDate, parseInt(limit), parseInt(offset)]
        );

        // Get total count
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM attendance 
             WHERE user_id = ? AND date BETWEEN ? AND ?`,
            [userId, startDate, endDate]
        );

        return {
            data: rows,
            total: countResult[0].total,
            limit,
            offset
        };
    }

    // Get team attendance history for a manager
    static async getTeamHistory(managerId, startDate, endDate, limit = 50, offset = 0) {
        const [rows] = await pool.query(
            `SELECT a.id, a.date, a.check_in_time, a.check_out_time, 
                    a.check_in_location, a.check_out_location,
                    a.hours_worked, a.status,
                    u.name as employee_name, u.designation
             FROM attendance a
             JOIN users u ON a.user_id = u.id
             WHERE u.manager_id = ? 
               AND a.date BETWEEN ? AND ?
             ORDER BY a.date DESC, u.name ASC
             LIMIT ? OFFSET ?`,
            [managerId, startDate, endDate, parseInt(limit), parseInt(offset)]
        );

        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total 
             FROM attendance a
             JOIN users u ON a.user_id = u.id
             WHERE u.manager_id = ? AND a.date BETWEEN ? AND ?`,
            [managerId, startDate, endDate]
        );

        return {
            data: rows,
            total: countResult[0].total,
            limit,
            offset
        };
    }

    // Get team summary grouping by user
    static async getTeamSummary(managerId, startDate, endDate) {
        let query = `
            SELECT 
                u.id as user_id,
                u.name as employee_name,
                u.designation,
                COUNT(a.id) as total_days,
                SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN a.status = 'checked_in' THEN 1 ELSE 0 END) as incomplete_days,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days
            FROM users u
            LEFT JOIN attendance a ON u.id = a.user_id AND a.date BETWEEN ? AND ?
            WHERE u.manager_id = ?
            GROUP BY u.id, u.name, u.designation
            ORDER BY u.name ASC
        `;
        const [rows] = await pool.query(query, [startDate, endDate, managerId]);
        return rows;
    }

    // Get all attendance records (for admin)
    static async getAllAttendance(filters = {}, limit = 10, offset = 0) {
        let query = `
            SELECT a.*, u.name, u.email, u.cnic
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            WHERE 1=1
        `;
        const values = [];

        if (filters.user_id) {
            query += ' AND a.user_id = ?';
            values.push(filters.user_id);
        }

        if (filters.start_date) {
            query += ' AND a.date >= ?';
            values.push(filters.start_date);
        }

        if (filters.end_date) {
            query += ' AND a.date <= ?';
            values.push(filters.end_date);
        }

        if (filters.status) {
            query += ' AND a.status = ?';
            values.push(filters.status);
        }

        query += ' ORDER BY a.date DESC, a.check_in_time DESC LIMIT ? OFFSET ?';
        values.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, values);
        return rows;
    }

    // Get attendance summary for report
    static async getSummaryReport(filters = {}) {
        let query = `
            SELECT 
                u.id as user_id,
                u.name,
                u.email,
                u.cnic,
                COUNT(a.id) as total_days,
                SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN a.status = 'checked_in' THEN 1 ELSE 0 END) as incomplete_days,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SEC_TO_TIME(AVG(TIME_TO_SEC(a.hours_worked))) as avg_hours
            FROM users u
            LEFT JOIN attendance a ON u.id = a.user_id
            WHERE u.role = 'user'
        `;
        const values = [];

        if (filters.start_date && filters.end_date) {
            query += ' AND a.date BETWEEN ? AND ?';
            values.push(filters.start_date, filters.end_date);
        }

        if (filters.user_id) {
            query += ' AND u.id = ?';
            values.push(filters.user_id);
        }

        query += ' GROUP BY u.id, u.name, u.email, u.cnic';

        const [rows] = await pool.query(query, values);
        return rows;
    }

    // Mark absent for users who didn't check in
    static async markAbsent() {
        // ... (existing markAbsent code)
    }

    // New: Mark leave days for an approved application
    static async markLeaveDays(userId, startDate, endDate, leaveApplicationId, leaveType) {
        const start = moment(startDate);
        const end = moment(endDate);

        for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
            const dateStr = m.format('YYYY-MM-DD');
            await pool.query(
                `INSERT INTO attendance (user_id, date, status, is_leave_day, leave_application_id, leave_type)
                 VALUES (?, ?, 'leave', 1, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 is_leave_day = 1, 
                 leave_application_id = ?, 
                 leave_type = ?`,
                [userId, dateStr, leaveApplicationId, leaveType, leaveApplicationId, leaveType]
            );
        }
    }
}

module.exports = AttendanceModel;