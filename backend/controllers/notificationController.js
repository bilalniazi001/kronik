const NotificationModel = require('../models/NotificationModel');

class NotificationController {
    static async getMyNotifications(req, res, next) {
        try {
            const notifications = await NotificationModel.getByUser(req.userId);
            const unreadCount = await NotificationModel.getUnreadCount(req.userId);
            res.json({
                success: true,
                data: notifications,
                unreadCount
            });
        } catch (error) {
            next(error);
        }
    }

    static async markRead(req, res, next) {
        try {
            const { id } = req.params;
            await NotificationModel.markAsRead(id);
            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = NotificationController;
