const { pool } = require('../config/database');

class LeaveTypeModel {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM leave_types WHERE is_active = 1');
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM leave_types WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, code, description, is_active } = data;
        const [result] = await pool.query(
            'INSERT INTO leave_types (name, code, description, is_active) VALUES (?, ?, ?, ?)',
            [name, code, description, is_active !== undefined ? is_active : 1]
        );
        return result.insertId;
    }
}

module.exports = LeaveTypeModel;
