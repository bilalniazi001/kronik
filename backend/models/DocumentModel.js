const { pool } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class DocumentModel {
    // Upload document
    static async upload(userId, file, documentType = 'other') {
        const { filename, originalname, mimetype, size, path: filePath } = file;

        const [result] = await pool.query(
            `INSERT INTO user_documents 
            (user_id, file_name, file_path, file_type, file_size, mime_type)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, originalname, filePath, documentType, size, mimetype]
        );

        return {
            id: result.insertId,
            file_name: originalname,
            file_path: filePath,
            file_type: documentType,
            uploaded_at: new Date()
        };
    }

    // Get user documents
    static async getUserDocuments(userId) {
        const [rows] = await pool.query(
            `SELECT id, file_name, file_path, file_type, file_size, mime_type, uploaded_at
             FROM user_documents
             WHERE user_id = ?
             ORDER BY uploaded_at DESC`,
            [userId]
        );
        return rows;
    }

    // Get document by ID
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM user_documents WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    // Delete document
    static async delete(id, userId) {
        // Get file path first
        const [doc] = await pool.query(
            'SELECT file_path FROM user_documents WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (doc.length === 0) {
            throw new Error('Document not found');
        }

        // Delete from database
        const [result] = await pool.query(
            'DELETE FROM user_documents WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        // Delete file from disk (async, don't wait)
        if (result.affectedRows > 0) {
            try {
                await fs.unlink(doc[0].file_path);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }

        return result.affectedRows > 0;
    }

    // Get document count for user
    static async getCount(userId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as total FROM user_documents WHERE user_id = ?',
            [userId]
        );
        return rows[0].total;
    }

    // Get all documents (admin)
    static async getAll(limit = 20, offset = 0) {
        const [rows] = await pool.query(
            `SELECT d.*, u.name as user_name, u.email
             FROM user_documents d
             JOIN users u ON d.user_id = u.id
             ORDER BY d.uploaded_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );
        return rows;
    }
}

module.exports = DocumentModel;