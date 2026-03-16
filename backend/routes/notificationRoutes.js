const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const AuthMiddleware = require('../middleware/authMiddleware');

router.use(AuthMiddleware.verifyToken);

router.get('/', NotificationController.getMyNotifications);
router.put('/:id/read', NotificationController.markRead);

module.exports = router;
