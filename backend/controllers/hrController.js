const UserModel = require('../models/UserModel');
const LeaveBalanceModel = require('../models/LeaveBalanceModel');
const LeaveTypeModel = require('../models/LeaveTypeModel');
const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth');
const EmailHelper = require('../utils/emailHelper');

class HRController {
    // Phase 2 Step 2: Create Manager
    static async createManager(req, res, next) {
        try {
            const { name, email, phone, cnic, department, designation } = req.body;

            // Generate auto-password (or simple default)
            const password = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(authConfig.bcryptSaltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            const userId = await UserModel.create({
                name,
                email,
                password: hashedPassword,
                phone: phone || '0000000000',
                cnic: cnic || '00000-0000000-0',
                role_type: 'manager',
                department,
                designation
            });

            // Send welcome email
            await EmailHelper.sendWelcomeEmail(email, name, password);

            res.status(201).json({
                success: true,
                message: 'Manager account created successfully',
                data: { id: userId, email, password } // Temporarily returning password for testing
            });
        } catch (error) {
            next(error);
        }
    }

    // Phase 2 Step 3: Create Employee
    static async createEmployee(req, res, next) {
        try {
            const {
                name, email, phone, cnic, department, designation,
                manager_id, reporting_to, leave_quota
            } = req.body;

            const password = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(authConfig.bcryptSaltRounds);
            const hashedPassword = await bcrypt.hash(password, salt);

            const userId = await UserModel.create({
                name,
                email,
                password: hashedPassword,
                phone: phone || '0000000000',
                cnic: cnic || '00000-0000000-0',
                role_type: 'employee',
                department,
                designation,
                manager_id,
                reporting_to
            });

            // Allocate Leave Quota
            if (leave_quota && Array.isArray(leave_quota)) {
                for (const quota of leave_quota) {
                    await LeaveBalanceModel.allocateQuota({
                        employee_id: userId,
                        leave_type_id: quota.leave_type_id,
                        total_allocated: quota.allocated,
                        year: new Date().getFullYear(),
                        created_by_hr_id: req.userId
                    });
                }
            }

            // Send welcome email
            await EmailHelper.sendWelcomeEmail(email, name, password);

            res.status(201).json({
                success: true,
                message: 'Employee account created successfully with leave quota',
                data: { id: userId, email, password }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all managers (for dropdown in employee creation)
    static async getManagers(req, res, next) {
        try {
            const [managers] = await require('../config/database').pool.query(
                'SELECT id, name, email, department, designation FROM users WHERE role_type = ? AND status = ?',
                ['manager', 'active']
            );
            res.json({
                success: true,
                data: managers
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all leave types (for quota allocation form)
    static async getLeaveTypes(req, res, next) {
        try {
            const leaveTypes = await LeaveTypeModel.getAll();
            res.json({
                success: true,
                data: leaveTypes
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HRController;
