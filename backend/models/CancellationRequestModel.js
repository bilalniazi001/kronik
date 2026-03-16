const { pool } = require('../config/database');

class CancellationRequestModel {
    static async create(data) {
        const { application_id, employee_id, reason } = data;
        const [result] = await pool.query(
            `INSERT INTO leave_cancellation_requests (application_id, employee_id, reason, status)
             VALUES (?, ?, ?, 'pending')`,
            [application_id, employee_id, reason]
        );
        return result.insertId;
    }

    static async updateStatus(id, status, adminId, comments = '') {
        const [result] = await pool.query(
            `UPDATE leave_cancellation_requests 
             SET status = ?, action_at = NOW(), action_by_admin_id = ?, comments = ?
             WHERE id = ?`,
            [status, adminId, comments, id]
        );
        return result.affectedRows > 0;
    }

    static async getPending() {
        const [rows] = await pool.query(
            `SELECT cr.*, u.name as employee_name, la.application_no
             FROM leave_cancellation_requests cr
             JOIN users u ON cr.employee_id = u.id
             JOIN leave_applications la ON cr.application_id = la.id
             WHERE cr.status = 'pending'`
        );
        return rows;
    }
}

module.exports = CancellationRequestModel;
