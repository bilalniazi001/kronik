const { pool } = require('../config/database');

class LeaveBalanceModel {
    static async getByEmployeeId(employeeId, year = new Date().getFullYear()) {
        const [rows] = await pool.query(
            `SELECT eb.*, lt.name as leave_type_name, lt.code as leave_type_code 
             FROM employee_leave_balances eb
             JOIN leave_types lt ON eb.leave_type_id = lt.id
             WHERE eb.employee_id = ? AND eb.year = ?`,
            [employeeId, year]
        );
        return rows;
    }

    static async getBalance(employeeId, leaveTypeId, year = new Date().getFullYear()) {
        const [rows] = await pool.query(
            `SELECT * FROM employee_leave_balances 
             WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
            [employeeId, leaveTypeId, year]
        );
        return rows[0];
    }

    static async allocateQuota(data) {
        const { employee_id, leave_type_id, total_allocated, year, created_by_hr_id } = data;
        const [result] = await pool.query(
            `INSERT INTO employee_leave_balances 
             (employee_id, leave_type_id, total_allocated, used, pending, year, created_by_hr_id)
             VALUES (?, ?, ?, 0, 0, ?, ?)`,
            [employee_id, leave_type_id, total_allocated, year, created_by_hr_id]
        );
        return result.insertId;
    }

    static async holdBalance(employeeId, leaveTypeId, days, year = new Date().getFullYear()) {
        const [result] = await pool.query(
            `UPDATE employee_leave_balances 
             SET pending = pending + ?
             WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
            [days, employeeId, leaveTypeId, year]
        );
        return result.affectedRows > 0;
    }

    static async deductBalance(employeeId, leaveTypeId, days, year = new Date().getFullYear()) {
        const [result] = await pool.query(
            `UPDATE employee_leave_balances 
             SET used = used + ?, pending = pending - ?
             WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
            [days, days, employeeId, leaveTypeId, year]
        );
        return result.affectedRows > 0;
    }

    static async releaseBalance(employeeId, leaveTypeId, days, year = new Date().getFullYear()) {
        const [result] = await pool.query(
            `UPDATE employee_leave_balances 
             SET pending = pending - ?
             WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
            [days, employeeId, leaveTypeId, year]
        );
        return result.affectedRows > 0;
    }
}

module.exports = LeaveBalanceModel;
