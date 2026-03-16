const { pool } = require('../config/database');

class AdminMiddleware {
    // Check if admin can manage users
    static canManageUsers(req, res, next) {
        if (req.userType === 'admin') {
            if (req.adminRole === 'super_admin' || req.adminRole === 'admin') {
                return next();
            }
        }

        // HR can also manage users (Managers/Employees)
        if (req.userType === 'user' && req.user?.role_type === 'hr') {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Insufficient permissions to manage users'
        });
    }

    // Check if admin can manage admins (super admin only)
    static canManageAdmins(req, res, next) {
        if (req.userType === 'admin' && req.adminRole === 'super_admin') {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Only super admin can manage admins'
        });
    }

    // Log admin actions
    static async logAction(req, res, next) {
        const originalJson = res.json;

        res.json = function (data) {
            if (req.userType === 'admin') {
                const logData = {
                    admin_id: req.userId,
                    action: `${req.method} ${req.originalUrl}`,
                    entity_type: req.baseUrl,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent')
                };

                // Log asynchronously (don't await)
                pool.query(
                    'INSERT INTO audit_logs (admin_id, action, entity_type, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
                    [logData.admin_id, logData.action, logData.entity_type, logData.ip_address, logData.user_agent]
                ).catch(err => console.error('Logging error:', err));
            }

            return originalJson.call(this, data);
        };

        next();
    }
}

module.exports = AdminMiddleware;