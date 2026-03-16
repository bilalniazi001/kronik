const { pool } = require('../config/database');

class LeaveApplicationModel {
    static async create(applicationData) {
        const {
            employee_id, manager_id, application_no,
            start_date, end_date, total_days, reason,
            status, current_approver
        } = applicationData;

        const [result] = await pool.query(
            `INSERT INTO leave_applications (
                employee_id, manager_id, application_no, start_date, end_date,
                total_days, reason, status, current_approver, applied_at
            )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                employee_id, manager_id, application_no, start_date, end_date,
                total_days, reason, status || 'pending_manager', current_approver || 'manager'
            ]
        );
        return result.insertId;
    }

    static async createDetail(detailData) {
        const { application_id, leave_type_id, days_applied } = detailData;
        const [result] = await pool.query(
            `INSERT INTO leave_application_details (application_id, leave_type_id, days_applied, balance_status) 
             VALUES (?, ?, ?, 'hold')`,
            [application_id, leave_type_id, days_applied]
        );
        return result.insertId;
    }

    static async addDetails(application_id, details) {
        // details = [{ leave_type_id, days_applied }]
        for (const detail of details) {
            await pool.query(
                `INSERT INTO leave_application_details (application_id, leave_type_id, days_applied, balance_status) 
                 VALUES (?, ?, ?, 'hold')`,
                [application_id, detail.leave_type_id, detail.days_applied]
            );
        }
    }

    static async generateApplicationNo() {
        const year = new Date().getFullYear();
        const [rows] = await pool.query(
            `SELECT COUNT(*) as count FROM leave_applications WHERE application_no LIKE ?`,
            [`LEAVE-${year}-%`]
        );
        const nextNum = (rows[0].count + 1).toString().padStart(4, '0');
        return `LEAVE-${year}-${nextNum}`;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT la.*, u.name as employee_name
             FROM leave_applications la
             JOIN users u ON la.employee_id = u.id
             WHERE la.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async updateStatus(id, status, current_approver, comments = null, role = 'manager') {
        const commentField = role === 'manager' ? 'manager_comments' : 'hr_comments';

        const [result] = await pool.query(
            `UPDATE leave_applications SET status = ?, current_approver = ?, ${commentField} = ? WHERE id = ?`,
            [status, current_approver, comments, id]
        );
        return result.affectedRows > 0;
    }

    static async getPendingForManager(managerId) {
        const [rows] = await pool.query(
            `SELECT la.*, u.name as employee_name
             FROM leave_applications la
             JOIN users u ON la.employee_id = u.id
             WHERE la.manager_id = ? AND la.status = 'pending_manager'
             ORDER BY la.applied_at DESC`,
            [managerId]
        );
        return rows;
    }

    static async getPendingForHR() {
        const [rows] = await pool.query(
            `SELECT la.*, u.name as employee_name, m.name as manager_name
             FROM leave_applications la
             JOIN users u ON la.employee_id = u.id
             JOIN users m ON la.manager_id = m.id
             WHERE la.status = 'pending_hr'
             ORDER BY la.applied_at DESC`
        );
        return rows;
    }

    static async getEmployeeLeaves(employeeId) {
        const [rows] = await pool.query(
            `SELECT la.*, u.name as employee_name
             FROM leave_applications la
             JOIN users u ON la.employee_id = u.id
             WHERE la.employee_id = ?
             ORDER BY la.applied_at DESC`,
            [employeeId]
        );
        return rows;
    }

    static async getDetails(applicationId) {
        const [rows] = await pool.query(
            `SELECT lad.*, lt.name as leave_type_name, lt.code as leave_type_code
             FROM leave_application_details lad
             JOIN leave_types lt ON lad.leave_type_id = lt.id
             WHERE lad.application_id = ?`,
            [applicationId]
        );
        return rows;
    }
}

module.exports = LeaveApplicationModel;
