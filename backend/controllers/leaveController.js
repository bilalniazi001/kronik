const { pool } = require('../config/database');
const LeaveApplicationModel = require('../models/LeaveApplicationModel');
const LeaveBalanceModel = require('../models/LeaveBalanceModel');
const LeaveTypeModel = require('../models/LeaveTypeModel');
const NotificationModel = require('../models/NotificationModel');
const UserModel = require('../models/UserModel');
const HolidayModel = require('../models/HolidayModel');
const AttendanceModel = require('../models/AttendanceModel');
const EmailHelper = require('../utils/emailHelper');

class LeaveController {
    // Phase 3 Step 2: Submit Leave Application
    static async applyLeave(req, res, next) {
        try {
            const { start_date, end_date, reason, details, is_half_day, half_day_type } = req.body;
            const employee_id = req.userId;
            const year = new Date(start_date).getFullYear();

            // 0. Fetch Employee details for manager info
            const user = await UserModel.findById(employee_id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            if (!user.manager_id && user.role_type === 'employee') {
                return res.status(400).json({
                    success: false,
                    message: 'No manager assigned to your account. Please contact HR.'
                });
            }

            // 1. Calculate Net Working Days (Subtract holidays/weekends)
            let totalDaysRaw = 0;
            if (is_half_day) {
                totalDaysRaw = 0.5;
            } else {
                totalDaysRaw = await calculateNetDays(start_date, end_date);
            }

            if (totalDaysRaw <= 0) {
                return res.status(400).json({ success: false, message: 'Selected date range contains no working days.' });
            }

            // 2. Validate multi-type details sum matches total
            const detailSum = details.reduce((acc, curr) => acc + parseFloat(curr.days_applied), 0);
            if (detailSum !== totalDaysRaw) {
                return res.status(400).json({
                    success: false,
                    message: `Days breakdown (${detailSum}) does not match effective duration (${totalDaysRaw}).`
                });
            }

            // 3. Check balances for EACH type
            for (const item of details) {
                const balance = await LeaveBalanceModel.getBalance(employee_id, item.leave_type_id, year);

                // If no balance record exists, they have 0 balance
                const totalAllocated = balance ? parseFloat(balance.total_allocated) : 0;
                const used = balance ? parseFloat(balance.used) : 0;
                const pending = balance ? parseFloat(balance.pending) : 0;
                const remaining = totalAllocated - used - pending;

                if (remaining < parseFloat(item.days_applied)) {
                    const leaveType = await LeaveTypeModel.getById(item.leave_type_id);
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient balance for ${leaveType ? leaveType.name : 'requested leave type'}. Available: ${remaining}, Requested: ${item.days_applied}`
                    });
                }
            }

            // 3. Create Application Record
            const application_no = await LeaveApplicationModel.generateApplicationNo();
            const application_id = await LeaveApplicationModel.create({
                employee_id,
                manager_id: user.manager_id,
                application_no,
                start_date,
                end_date,
                total_days: totalDaysRaw,
                reason,
                status: 'pending_manager',
                current_approver: 'manager'
            });

            // Holders for email data
            const firstLeaveType = details.length > 0 ? await LeaveTypeModel.getById(details[0].leave_type_id) : null;
            const leaveData = {
                leaveType: firstLeaveType ? firstLeaveType.name : 'Multiple',
                startDate: start_date,
                endDate: end_date,
                totalDays: totalDaysRaw,
                reason: reason
            };

            // 4. Create Details & Hold Balance
            for (const item of details) {
                await LeaveApplicationModel.createDetail({
                    application_id,
                    leave_type_id: item.leave_type_id,
                    days_applied: item.days_applied
                });

                await LeaveBalanceModel.holdBalance(employee_id, item.leave_type_id, item.days_applied, year);
            }

            // 5. Create Notification for Manager
            if (user.manager_id) {
                const manager = await UserModel.findById(user.manager_id);

                await NotificationModel.create({
                    user_id: user.manager_id,
                    title: 'New Leave Application',
                    message: `${user.name} has applied for ${totalDaysRaw} days leave.`,
                    type: 'portal'
                });

                // Send Email to Manager
                if (manager && manager.email) {
                    await EmailHelper.sendAdminNotification(manager.email, 'leave_request', {
                        userName: user.name,
                        leaveType: leaveData.leaveType,
                        startDate: leaveData.startDate,
                        endDate: leaveData.endDate,
                        reason: leaveData.reason
                    });
                }
            }

            res.status(201).json({
                success: true,
                message: 'Leave application submitted successfully',
                data: { application_id, application_no }
            });

        } catch (error) {
            next(error);
        }
    }

    // Get my leave applications
    static async getMyLeaves(req, res, next) {
        try {
            const [rows] = await pool.query(
                `SELECT la.*,
                 (SELECT JSON_ARRAYAGG(JSON_OBJECT('leave_type_name', lt.name, 'days_applied', lad.days_applied))
                  FROM leave_application_details lad
                  JOIN leave_types lt ON lad.leave_type_id = lt.id
                  WHERE lad.application_id = la.id) as details
                 FROM leave_applications la
                 WHERE la.employee_id = ?
                 ORDER BY la.applied_at DESC`,
                [req.userId]
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            next(error);
        }
    }

    // Get my leave balances
    static async getMyBalances(req, res, next) {
        try {
            const balances = await LeaveBalanceModel.getByEmployeeId(req.userId);
            res.json({
                success: true,
                data: balances
            });
        } catch (error) {
            next(error);
        }
    }

    // Cancel Leave (Phase 4 Step 3)
    static async cancelLeave(req, res, next) {
        try {
            const { id } = req.params;
            const employee_id = req.userId;

            const application = await LeaveApplicationModel.findById(id);
            if (!application || application.employee_id !== employee_id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            if (application.status !== 'pending_manager' && application.status !== 'pending_hr') {
                return res.status(400).json({ success: false, message: 'Only pending requests can be cancelled' });
            }

            await LeaveApplicationModel.updateStatus(id, 'cancelled', null);

            // Release Balance for each detail type
            const year = new Date(application.start_date).getFullYear();
            const details = await LeaveApplicationModel.getDetails(id);
            for (const item of details) {
                await LeaveBalanceModel.releaseBalance(employee_id, item.leave_type_id, item.days_applied, year);
            }

            res.json({ success: true, message: 'Leave request cancelled successfully' });
        } catch (error) {
            next(error);
        }
    }

    // Manager Action: Approve/Reject (Phase 3 Step 3)
    static async managerAction(req, res, next) {
        try {
            const { id } = req.params;
            const { action, reason } = req.body;
            const managerId = req.userId;

            const application = await LeaveApplicationModel.findById(id);
            if (!application || application.manager_id !== managerId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            if (action === 'approve') {
                await LeaveApplicationModel.updateStatus(id, 'approved_by_manager', 'hr', reason, 'manager');

                // Notify HR & Send Email
                const hrs = await UserModel.getAll(10, 0, '', 'hr');
                if (hrs.length > 0) {
                    await NotificationModel.create({
                        user_id: hrs[0].id,
                        from_user_id: managerId,
                        message: `Manager approved ${application.application_no} (${application.employee_name}). Final review needed.`,
                        link: `/leave-approvals`,
                        type: 'portal'
                    });

                    // Send Email to HR
                    await EmailHelper.sendAdminNotification(hrs[0].email, 'leave_request', {
                        userName: application.employee_name,
                        leaveType: 'Leave (Manager Approved)',
                        startDate: application.start_date,
                        endDate: application.end_date,
                        reason: `Manager approved: ${reason || 'No specific comments'}`
                    });
                }
            } else {
                await LeaveApplicationModel.updateStatus(id, 'rejected_by_manager', null, reason, 'manager');

                // Release Balances for each detail
                const details = await LeaveApplicationModel.getDetails(id);
                const year = new Date(application.start_date).getFullYear();
                for (const item of details) {
                    await LeaveBalanceModel.releaseBalance(application.employee_id, item.leave_type_id, item.days_applied, year);
                }

                // Notify Employee & Send Email
                await NotificationModel.create({
                    user_id: application.employee_id,
                    from_user_id: managerId,
                    message: `Request ${application.application_no} was rejected by manager.`,
                    type: 'portal'
                });

                const employee = await UserModel.findById(application.employee_id);
                if (employee && employee.email) {
                    await EmailHelper.sendLeaveStatusEmail(employee.email, employee.name, {
                        leaveType: 'Requested Leave',
                        startDate: application.start_date,
                        endDate: application.end_date,
                        totalDays: application.total_days,
                        reason: application.reason,
                        rejectionReason: reason
                    }, 'rejected');
                }
            }

            res.json({ success: true, message: `Action '${action}' saved.` });
        } catch (error) {
            next(error);
        }
    }

    // HR Final Action (Phase 3 Step 4)
    static async hrAction(req, res, next) {
        try {
            const { id } = req.params;
            const { action, reason } = req.body;
            const hrId = req.userId;

            const application = await LeaveApplicationModel.findById(id);
            if (!application) return res.status(404).json({ success: false, message: 'Not found' });

            const year = new Date(application.start_date).getFullYear();
            const details = await LeaveApplicationModel.getDetails(id);

            if (action === 'approve') {
                await LeaveApplicationModel.updateStatus(id, 'approved', null, reason, 'hr');

                // Deduct Balances for each detail
                for (const item of details) {
                    await LeaveBalanceModel.deductBalance(application.employee_id, item.leave_type_id, item.days_applied, year);
                }

                // Auto-Mark Attendance
                // Use first type as label or aggregate
                const leaveLabel = details.length > 0 ? details[0].leave_type_code : 'Leave';
                await AttendanceModel.markLeaveDays(
                    application.employee_id,
                    application.start_date,
                    application.end_date,
                    id,
                    leaveLabel
                );

                // Notify Employee
                await NotificationModel.create({
                    user_id: application.employee_id,
                    from_user_id: hrId,
                    message: `Congratulations! Your leave ${application.application_no} is approved.`,
                    type: 'portal'
                });

                // Send Approval Email
                const employee = await UserModel.findById(application.employee_id);
                if (employee && employee.email) {
                    await EmailHelper.sendLeaveStatusEmail(employee.email, employee.name, {
                        leaveType: leaveLabel,
                        startDate: application.start_date,
                        endDate: application.end_date,
                        totalDays: application.total_days,
                        reason: application.reason
                    }, 'approved');
                }
            } else {
                await LeaveApplicationModel.updateStatus(id, 'rejected', null, reason, 'hr');

                // Release Balances
                for (const item of details) {
                    await LeaveBalanceModel.releaseBalance(application.employee_id, item.leave_type_id, item.days_applied, year);
                }

                await NotificationModel.create({
                    user_id: application.employee_id,
                    from_user_id: hrId,
                    message: `HR did not approve ${application.application_no}. Reason: ${reason || 'N/A'}`,
                    type: 'portal'
                });

                // Send Rejection Email
                const employee = await UserModel.findById(application.employee_id);
                if (employee && employee.email) {
                    await EmailHelper.sendLeaveStatusEmail(employee.email, employee.name, {
                        leaveType: 'Requested Leave',
                        startDate: application.start_date,
                        endDate: application.end_date,
                        totalDays: application.total_days,
                        reason: application.reason,
                        rejectionReason: reason
                    }, 'rejected');
                }
            }

            res.json({ success: true, message: `Final action '${action}' completed.` });
        } catch (error) {
            next(error);
        }
    }

    // New: Get Pending for Manager (for API visibility)
    static async getManagerPending(req, res, next) {
        try {
            const [rows] = await pool.query(
                `SELECT la.*, u.name as employee_name, u.designation,
                 (SELECT JSON_ARRAYAGG(JSON_OBJECT('leave_type_name', lt.name, 'days_applied', lad.days_applied))
                  FROM leave_application_details lad
                  JOIN leave_types lt ON lad.leave_type_id = lt.id
                  WHERE lad.application_id = la.id) as details
                 FROM leave_applications la
                 JOIN users u ON la.employee_id = u.id
                 WHERE la.manager_id = ? AND la.status = 'pending_manager'
                 ORDER BY la.applied_at DESC`,
                [req.userId]
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            next(error);
        }
    }

    // New: Get History for Manager
    static async getManagerHistory(req, res, next) {
        try {
            const [rows] = await pool.query(
                `SELECT la.*, u.name as employee_name, u.designation,
                 (SELECT JSON_ARRAYAGG(JSON_OBJECT('leave_type_name', lt.name, 'days_applied', lad.days_applied))
                  FROM leave_application_details lad
                  JOIN leave_types lt ON lad.leave_type_id = lt.id
                  WHERE lad.application_id = la.id) as details
                 FROM leave_applications la
                 JOIN users u ON la.employee_id = u.id
                 WHERE la.manager_id = ? AND la.status != 'pending_manager'
                 ORDER BY la.applied_at DESC`,
                [req.userId]
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            next(error);
        }
    }

    // New: Get Pending for HR
    static async getHRPending(req, res, next) {
        try {
            const [rows] = await pool.query(
                `SELECT la.*, u.name as employee_name, u.designation, m.name as manager_name,
                 (SELECT JSON_ARRAYAGG(JSON_OBJECT('leave_type_name', lt.name, 'days_applied', lad.days_applied))
                  FROM leave_application_details lad
                  JOIN leave_types lt ON lad.leave_type_id = lt.id
                  WHERE lad.application_id = la.id) as details
                 FROM leave_applications la
                 JOIN users u ON la.employee_id = u.id
                 JOIN users m ON la.manager_id = m.id
                 WHERE la.status = 'approved_by_manager'
                 ORDER BY la.applied_at DESC`
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            next(error);
        }
    }

    // New: Get History for HR
    static async getHRHistory(req, res, next) {
        try {
            const [rows] = await pool.query(
                `SELECT la.*, u.name as employee_name, u.designation, m.name as manager_name,
                 (SELECT JSON_ARRAYAGG(JSON_OBJECT('leave_type_name', lt.name, 'days_applied', lad.days_applied))
                  FROM leave_application_details lad
                  JOIN leave_types lt ON lad.leave_type_id = lt.id
                  WHERE lad.application_id = la.id) as details
                 FROM leave_applications la
                 JOIN users u ON la.employee_id = u.id
                 JOIN users m ON la.manager_id = m.id
                 WHERE la.status IN ('approved', 'rejected', 'rejected_by_manager')
                 ORDER BY la.applied_at DESC`
            );
            res.json({ success: true, data: rows });
        } catch (error) {
            next(error);
        }
    }

    // New: Get Holidays
    static async getHolidays(req, res, next) {
        try {
            const holidays = await HolidayModel.getAll();
            res.json({ success: true, data: holidays });
        } catch (error) {
            next(error);
        }
    }
}

// Helper to calculate net days (Excludes Saturdays, Sundays, and Public Holidays)
async function calculateNetDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let total = 0;

    const holidays = await HolidayModel.getByDateRange(startDate, endDate);
    const holidayStrings = holidays.map(h => {
        const d = new Date(h.holiday_date);
        return d.toISOString().split('T')[0];
    });

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dateString = d.toISOString().split('T')[0];

        // Skip Weekends: Saturday (6) and Sunday (0) and Holidays
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayStrings.includes(dateString)) {
            total++;
        }
    }
    return total;
}

module.exports = LeaveController;
