const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const AdminModel = require('../models/AdminModel');
const authConfig = require('../config/auth');

class AuthController {
    // User Sign Up (as per FDC 4.1.1)
    static async signup(req, res, next) {
        try {
            const { name, email, password, phone, cnic, address, profile_url } = req.body;

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Check if CNIC already exists
            const existingCNIC = await UserModel.findByCNIC(cnic);
            if (existingCNIC) {
                return res.status(400).json({
                    success: false,
                    message: 'CNIC already registered'
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
                address,
                profile_url
            });

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please login.',
                user: {
                    id: userId,
                    name,
                    email
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // User Login (as per FDC 4.1.2)
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if user is active
            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Your account is inactive. Contact admin.'
                });
            }

            // Check password
            const isMatch = await UserModel.verifyPassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Update last login
            await UserModel.updateLastLogin(user.id);

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    role_type: user.role_type,
                    userType: 'user'
                },
                authConfig.jwtSecret,
                { expiresIn: authConfig.jwtExpire }
            );

            // Check today's attendance status
            const todayAttendance = await UserModel.getTodayAttendance(user.id);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    role_type: user.role_type,
                    employee_id: user.employee_id,
                    designation: user.designation,
                    department: user.department,
                    profile_url: user.profile_url
                },
                attendance: {
                    checked_in: todayAttendance ? !!todayAttendance.check_in_time : false,
                    checked_out: todayAttendance ? !!todayAttendance.check_out_time : false,
                    check_in_time: todayAttendance?.check_in_time || null
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Admin Login (as per FDC 4.1.3)
    static async adminLogin(req, res, next) {
        try {
            const { email, password } = req.body;

            // Find admin
            const admin = await AdminModel.findByEmail(email);
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check password
            const isMatch = await AdminModel.verifyPassword(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Update last login
            await AdminModel.updateLastLogin(admin.id);

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: admin.id,
                    email: admin.email,
                    role: admin.role,
                    userType: 'admin'
                },
                authConfig.jwtSecret,
                { expiresIn: authConfig.jwtExpire }
            );

            res.json({
                success: true,
                message: 'Admin login successful',
                token,
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            });

        } catch (error) {
            next(error);
        }
    }

    // Get current user/profile
    static async getProfile(req, res, next) {
        try {
            if (req.userType === 'user') {
                const user = await UserModel.findById(req.userId);
                res.json({
                    success: true,
                    user
                });
            } else {
                const admin = await AdminModel.findById(req.userId);
                res.json({
                    success: true,
                    admin
                });
            }
        } catch (error) {
            next(error);
        }
    }

    // Logout
    static async logout(req, res) {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
}

module.exports = AuthController;