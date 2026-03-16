const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminModel {
    // Create new admin (super admin only)
    static async create(adminData) {
        const { name, email, password, role } = adminData;

        const [result] = await pool.query(
            `INSERT INTO admins (name, email, password, role)
             VALUES (?, ?, ?, ?)`,
            [name, email, password, role || 'admin']
        );

        return result.insertId;
    }

    // Find admin by email
    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM admins WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Find admin by ID
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT id, name, email, role, created_at, last_login
             FROM admins WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    // Update admin
    static async update(id, updateData) {
        const allowedFields = ['name', 'email', 'role', 'password'];
        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) return false;

        values.push(id);
        const query = `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`;

        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
    }

    // Update password
    static async updatePassword(id, hashedPassword) {
        const [result] = await pool.query(
            'UPDATE admins SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }

    // Update last login
    static async updateLastLogin(id) {
        const [result] = await pool.query(
            'UPDATE admins SET last_login = NOW() WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get all admins
    static async getAll() {
        const [rows] = await pool.query(
            `SELECT id, name, email, role, created_at, last_login
             FROM admins
             ORDER BY created_at DESC`
        );
        return rows;
    }

    // Delete admin
    static async delete(id) {
        // Check if this is the last super admin
        const [superAdmins] = await pool.query(
            'SELECT COUNT(*) as count FROM admins WHERE role = "super_admin"'
        );

        if (superAdmins[0].count <= 1) {
            const [admin] = await pool.query('SELECT role FROM admins WHERE id = ?', [id]);
            if (admin[0] && admin[0].role === 'super_admin') {
                throw new Error('Cannot delete the last super admin');
            }
        }

        const [result] = await pool.query('DELETE FROM admins WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = AdminModel;