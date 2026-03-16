const { pool } = require('../config/database');

class HolidayModel {
    static async getAll() {
        const [rows] = await pool.query(
            `SELECT h.*, u.name as created_by_name 
             FROM public_holidays h
             LEFT JOIN users u ON h.created_by = u.id
             ORDER BY h.holiday_date ASC`
        );
        return rows;
    }

    static async getByDateRange(startDate, endDate) {
        const [rows] = await pool.query(
            `SELECT * FROM public_holidays 
             WHERE holiday_date BETWEEN ? AND ?`,
            [startDate, endDate]
        );
        return rows;
    }

    static async getByDate(date) {
        const [rows] = await pool.query(
            'SELECT * FROM public_holidays WHERE holiday_date = ?',
            [date]
        );
        return rows[0];
    }

    static async create(title, holidayDate, createdBy) {
        const [result] = await pool.query(
            'INSERT INTO public_holidays (title, holiday_date, created_by) VALUES (?, ?, ?)',
            [title, holidayDate, createdBy]
        );
        return result.insertId;
    }

    static async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM public_holidays WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = HolidayModel;
