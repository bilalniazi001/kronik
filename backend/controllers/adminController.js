const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const AdminModel = require('../models/AdminModel');
const AttendanceModel = require('../models/AttendanceModel');
const DocumentModel = require('../models/DocumentModel');
const authConfig = require('../config/auth');
const { pool } = require('../config/database');
const EmailHelper = require('../utils/emailHelper');

class AdminController {
    // Get dashboard stats
    static async getDashboard(req, res, next) {
        try {
            // Get counts
            const [userCount] = await pool.query(
                'SELECT COUNT(*) as total FROM users WHERE role = "user" AND status = "active"'
            );

            const [todayAttendance] = await pool.query(
                `SELECT COUNT(DISTINCT user_id) as checked_in 
                 FROM attendance WHERE date = CURDATE() AND check_in_time IS NOT NULL`
            );

            const [pendingCheckout] = await pool.query(
                `SELECT COUNT(*) as pending FROM attendance 
                 WHERE date = CURDATE() AND check_in_time IS NOT NULL AND check_out_time IS NULL`
            );

            res.json({
                success: true,
                stats: {
                    total_users: userCount[0].total,
                    today_checked_in: todayAttendance[0].checked_in,
                    pending_checkout: pendingCheckout[0].pending,
                    not_checked_in: userCount[0].total - todayAttendance[0].checked_in
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Get all users (as per FDC 4.5.2 Section A)
    static async getUsers(req, res, next) {
        try {
            const { page = 1, limit = 10, search = '', role_type = '' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const users = await UserModel.getAll(parseInt(limit), offset, search, role_type);
            const total = await UserModel.getCount(search, role_type);

            res.json({
                success: true,
                users,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / limit),
                    total_records: total,
                    limit: parseInt(limit)
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Get single user details
    static async getUserDetails(req, res, next) {
        try {
            const { userId } = req.params;

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get user documents
            const documents = await DocumentModel.getUserDocuments(userId);

            // Get attendance summary for current month
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

            const attendance = await AttendanceModel.getUserHistory(userId, firstDay, lastDay, 100, 0);

            res.json({
                success: true,
                user,
                documents,
                attendance: {
                    summary: {
                        total: attendance.total,
                        data: attendance.data
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Create new user (admin)
    static async createUser(req, res, next) {
        try {
            const { name, email, password, phone, cnic, address } = req.body;

            // Check if user exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(authConfig.bcryptSaltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const userId = await UserModel.create({
                name,
                email,
                password: hashedPassword,
                phone,
                cnic,
                address
            });

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                user: { id: userId, name, email }
            });

        } catch (error) {
            next(error);
        }
    }

    // Create new HR user (admin only)
    static async createHR(req, res, next) {
        try {
            const { name, email, password, phone, cnic, department, designation } = req.body;

            // Check if user exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(authConfig.bcryptSaltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create HR user
            const userId = await UserModel.create({
                name,
                email,
                password: hashedPassword,
                phone,
                cnic,
                role_type: 'hr',
                department,
                designation
            });

            // Send welcome email
            await EmailHelper.sendWelcomeEmail(email, name, password);

            res.status(201).json({
                success: true,
                message: 'HR account created successfully',
                data: { id: userId, name, email, password } // Temporarily returning password for testing
            });

        } catch (error) {
            next(error);
        }
    }

    // Update user
    static async updateUser(req, res, next) {
        try {
            const { userId } = req.params;
            const { name, phone, address, status } = req.body;

            const updateData = {};
            if (name) updateData.name = name;
            if (phone) updateData.phone = phone;
            if (address) updateData.address = address;
            if (status) updateData.status = status;

            const updated = await UserModel.update(userId, updateData);

            if (updated) {
                res.json({
                    success: true,
                    message: 'User updated successfully'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'No changes made'
                });
            }

        } catch (error) {
            next(error);
        }
    }

    // Delete user (soft delete)
    static async deleteUser(req, res, next) {
        try {
            const { userId } = req.params;

            const deleted = await UserModel.delete(userId);

            if (deleted) {
                res.json({
                    success: true,
                    message: 'User deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

        } catch (error) {
            next(error);
        }
    }

    // Get all admins (as per FDC 4.5.2 Section B)
    static async getAdmins(req, res, next) {
        try {
            const admins = await AdminModel.getAll();

            res.json({
                success: true,
                admins
            });

        } catch (error) {
            next(error);
        }
    }

    // Create new admin (super admin only)
    static async createAdmin(req, res, next) {
        try {
            const { name, email, password, role } = req.body;

            // Check if admin exists
            const existingAdmin = await AdminModel.findByEmail(email);
            if (existingAdmin) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(authConfig.bcryptSaltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create admin
            const adminId = await AdminModel.create({
                name,
                email,
                password: hashedPassword,
                role: role || 'admin'
            });

            // Send welcome email
            await EmailHelper.sendWelcomeEmail(email, name, password);

            res.status(201).json({
                success: true,
                message: 'Admin created successfully',
                admin: { id: adminId, name, email, role }
            });

        } catch (error) {
            next(error);
        }
    }

    // Update admin
    static async updateAdmin(req, res, next) {
        try {
            const { adminId } = req.params;
            const { name, email, role, password } = req.body;

            const updateData = { name, email, role };

            // If password is provided, hash it
            if (password) {
                const salt = await bcrypt.genSalt(authConfig.bcryptSaltRounds);
                updateData.password = await bcrypt.hash(password, salt);
            }

            // Update in database
            const updated = await AdminModel.update(adminId, updateData);

            if (updated) {
                res.json({
                    success: true,
                    message: 'Admin updated successfully'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'No changes made or admin not found'
                });
            }
        } catch (error) {
            next(error);
        }
    }

    // Delete admin
    static async deleteAdmin(req, res, next) {
        try {
            const { adminId } = req.params;

            // Don't allow deleting own account
            if (parseInt(adminId) === req.userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete your own account'
                });
            }

            const deleted = await AdminModel.delete(adminId);

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Admin deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

        } catch (error) {
            if (error.message === 'Cannot delete the last super admin') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // Get all attendance (admin view)
    static async getAllAttendance(req, res, next) {
        try {
            const { page = 1, limit = 20, user_id, start_date, end_date, status } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const filters = {};
            if (user_id) filters.user_id = user_id;

            const finalStartDate = start_date || req.query.startDate;
            const finalEndDate = end_date || req.query.endDate;

            if (finalStartDate) filters.start_date = finalStartDate;
            if (finalEndDate) filters.end_date = finalEndDate;
            if (status) filters.status = status;

            const attendance = await AttendanceModel.getAllAttendance(filters, parseInt(limit), offset);

            res.json({
                success: true,
                attendance,
                pagination: {
                    current_page: parseInt(page),
                    limit: parseInt(limit)
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Get attendance reports (as per FDC 4.5.2 Section C)
    static async getReports(req, res, next) {
        try {
            const { start_date, end_date, user_id, startDate, endDate, userId } = req.query;
            const finalStartDate = start_date || startDate;
            const finalEndDate = end_date || endDate;
            const finalUserId = user_id || userId;

            if (!finalStartDate || !finalEndDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required'
                });
            }

            const filters = { start_date: finalStartDate, end_date: finalEndDate };
            if (finalUserId) filters.user_id = finalUserId;

            let data;
            if (finalUserId) {
                // If user_id is provided, get daily records
                data = await AttendanceModel.getAllAttendance(filters, 100, 0);
            } else {
                // Otherwise get summary for all users
                data = await AttendanceModel.getSummaryReport(filters);
            }

            res.json({
                success: true,
                reports: data,
                period: {
                    start_date: finalStartDate,
                    end_date: finalEndDate
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Export attendance to CSV
    static async exportAttendance(req, res, next) {
        try {
            const { start_date, end_date, user_id } = req.query;

            let query = `
                SELECT 
                    u.name, u.email, u.cnic,
                    a.date, a.check_in_time, a.check_out_time,
                    a.hours_worked, a.status,
                    a.check_in_location, a.check_out_location
                FROM attendance a
                JOIN users u ON a.user_id = u.id
                WHERE a.date BETWEEN ? AND ?
            `;
            const values = [start_date, end_date];

            if (user_id) {
                query += ' AND a.user_id = ?';
                values.push(user_id);
            }

            query += ' ORDER BY a.date DESC, u.name';

            const [rows] = await pool.query(query, values);

            // Convert to CSV
            const csv = [
                ['Name', 'Email', 'CNIC', 'Date', 'Check In', 'Check Out', 'Hours', 'Status', 'Check In Location', 'Check Out Location'],
                ...rows.map(r => [
                    r.name, r.email, r.cnic, r.date,
                    r.check_in_time || '-', r.check_out_time || '-',
                    r.hours_worked || '-', r.status,
                    r.check_in_location || '-', r.check_out_location || '-'
                ])
            ].map(row => row.join(',')).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${start_date}_to_${end_date}.csv`);
            res.send(csv);

        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController;