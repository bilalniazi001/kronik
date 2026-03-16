const { pool } = require('../config/database');

class AnnouncementModel {
    // Create new announcement
    static async create(adminId, title, message) {
        const [result] = await pool.query(
            'INSERT INTO announcements (admin_id, title, message) VALUES (?, ?, ?)',
            [adminId, title, message]
        );
        return result.insertId;
    }

    // Get all announcements (with admin info)
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                a.id,
                a.title,
                a.message,
                a.created_at,
                a.updated_at,
                u.name as admin_name,
                u.email as admin_email
            FROM announcements a
            JOIN users u ON a.admin_id = u.id
            ORDER BY a.created_at DESC
        `);
        return rows;
    }

    // Get single announcement by ID
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                u.name as admin_name,
                u.email as admin_email
            FROM announcements a
            JOIN users u ON a.admin_id = u.id
            WHERE a.id = ?
        `, [id]);
        return rows[0];
    }

    // Get announcements by admin ID
    static async getByAdminId(adminId) {
        const [rows] = await pool.query(`
            SELECT * FROM announcements 
            WHERE admin_id = ? 
            ORDER BY created_at DESC
        `, [adminId]);
        return rows;
    }

    // Update announcement
    static async update(id, title, message) {
        const [result] = await pool.query(
            'UPDATE announcements SET title = ?, message = ? WHERE id = ?',
            [title, message, id]
        );
        return result.affectedRows > 0;
    }

    // Delete announcement
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Get latest announcements (for homepage)
    static async getLatest(limit = 5) {
        const [rows] = await pool.query(`
            SELECT 
                a.id,
                a.title,
                a.message,
                a.created_at,
                u.name as admin_name
            FROM announcements a
            JOIN users u ON a.admin_id = u.id
            ORDER BY a.created_at DESC
            LIMIT ?
        `, [limit]);
        return rows;
    }
}

module.exports = AnnouncementModel;