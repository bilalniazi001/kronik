const { pool } = require('../config/database');

class NotificationModel {
    static async create(data) {
        const { user_id, from_user_id, title, message, link, type } = data;
        const [result] = await pool.query(
            `INSERT INTO notifications (user_id, from_user_id, title, message, link, is_read, type, created_at)
             VALUES (?, ?, ?, ?, ?, 0, ?, NOW())`,
            [user_id, from_user_id, title || 'Leave Update', message, link || null, type || 'portal']
        );
        return result.insertId;
    }

    static async getByUser(userId) {
        const [rows] = await pool.query(
            `SELECT n.*, u.name as from_user_name
             FROM notifications n
             LEFT JOIN users u ON n.from_user_id = u.id
             WHERE n.user_id = ?
             ORDER BY n.created_at DESC`,
            [userId]
        );
        return rows;
    }

    static async markAsRead(id) {
        const [result] = await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    static async getUnreadCount(userId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );
        return rows[0].count;
    }
}

module.exports = NotificationModel;
