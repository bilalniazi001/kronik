const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
const DocumentModel = require('../models/DocumentModel');
const AttendanceModel = require('../models/AttendanceModel');
const AdminModel = require('../models/AdminModel');
const { pool } = require('../config/database');
const authConfig = require('../config/auth');

class UserController {
    // Get user profile (as per FDC 4.2.1)
    static async getProfile(req, res, next) {
        try {
            // Use already fetched user from middleware or re-fetch depending on type
            let user = req.user;

            if (req.userType === 'user' && !user) {
                user = await UserModel.findById(req.userId);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User profile not found'
                });
            }

            // Get user documents (only for regular users)
            const documents = req.userType === 'user' ? await DocumentModel.getUserDocuments(req.userId) : [];

            // Get today's attendance status (only for regular users)
            const todayAttendance = req.userType === 'user' ? await AttendanceModel.getTodayStatus(req.userId) : null;

            res.json({
                success: true,
                user: {
                    ...user,
                    profile_image: (user && user.profile_image) ?
                        `/uploads/profiles/${user.profile_image}` : null
                },
                documents,
                today_attendance: todayAttendance,
                stats: {
                    total_documents: documents.length
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Update profile (as per FDC 4.2.2)
    static async updateProfile(req, res, next) {
        try {
            const { name, phone, current_password } = req.body;
            const userType = req.userType;
            const userId = req.userId;

            // Get user with password from correct table
            let userWithPass;
            if (userType === 'user') {
                const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
                userWithPass = rows[0];
            } else {
                const [rows] = await pool.query('SELECT password FROM admins WHERE id = ?', [userId]);
                userWithPass = rows[0];
            }

            if (!userWithPass) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(current_password, userWithPass.password);

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update profile
            const updateData = {};
            if (name) updateData.name = name;

            if (userType === 'user') {
                if (phone) updateData.phone = phone;
                const updated = await UserModel.update(userId, updateData);
                if (updated) {
                    const updatedUser = await UserModel.findById(userId);
                    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
                } else {
                    res.status(400).json({ success: false, message: 'No changes made' });
                }
            } else {
                const updated = await AdminModel.update(userId, updateData);
                if (updated) {
                    const updatedAdmin = await AdminModel.findById(userId);
                    res.json({ success: true, message: 'Profile updated successfully', user: updatedAdmin });
                } else {
                    res.status(400).json({ success: false, message: 'No changes made' });
                }
            }

        } catch (error) {
            next(error);
        }
    }

    // Change password
    static async changePassword(req, res, next) {
        try {
            const { current_password, new_password } = req.body;
            const userType = req.userType;
            const userId = req.userId;

            // Get user with password from correct table
            let userWithPass;
            if (userType === 'user') {
                const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
                userWithPass = rows[0];
            } else {
                const [rows] = await pool.query('SELECT password FROM admins WHERE id = ?', [userId]);
                userWithPass = rows[0];
            }

            if (!userWithPass) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(current_password, userWithPass.password);

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(authConfig.bcryptSaltRounds);
            const hashedPassword = await bcrypt.hash(new_password, salt);

            // Update password
            if (userType === 'user') {
                await UserModel.updatePassword(userId, hashedPassword);
            } else {
                await AdminModel.updatePassword(userId, hashedPassword);
            }

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            next(error);
        }
    }

    // Upload profile image (as per FDC 4.2.3)
    static async uploadProfileImage(req, res, next) {
        try {
            if (req.userType !== 'user') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin profile pictures are not supported yet. Please use regular user account.'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image file provided'
                });
            }

            const profileImagePath = req.file.filename;

            await UserModel.update(req.userId, { profile_image: profileImagePath });

            res.json({
                success: true,
                message: 'Profile image uploaded successfully',
                profile_image: `/uploads/profiles/${profileImagePath}`
            });

        } catch (error) {
            next(error);
        }
    }

    // Get user dashboard (home page data)
    static async getDashboard(req, res, next) {
        try {
            let user = req.user;
            if (req.userType === 'user' && !user) {
                user = await UserModel.findById(req.userId);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const todayAttendance = req.userType === 'user' ? await AttendanceModel.getTodayStatus(req.userId) : null;

            res.json({
                success: true,
                user: {
                    name: user.name,
                    profile_image: (user && user.profile_image) ?
                        `/uploads/profiles/${user.profile_image}` : null
                },
                attendance: todayAttendance,
                current_time: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    }

    // Get user's attendance reports (as per FDC 4.4)
    static async getReports(req, res, next) {
        try {
            const { start_date, end_date, page = 1, limit = 30 } = req.query;

            // Default to current month if no dates provided
            const now = new Date();
            const firstDay = start_date || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const lastDay = end_date || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const attendance = await AttendanceModel.getUserHistory(
                req.userId,
                firstDay,
                lastDay,
                parseInt(limit),
                offset
            );

            res.json({
                success: true,
                attendance: attendance.data,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(attendance.total / limit),
                    total_records: attendance.total,
                    limit: parseInt(limit)
                },
                filters: {
                    start_date: firstDay,
                    end_date: lastDay
                }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;