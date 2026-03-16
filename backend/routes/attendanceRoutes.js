const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendanceController');
const AuthMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

// All attendance routes require authentication
router.use(AuthMiddleware.verifyToken);

// Check-in/out
router.post('/checkin', ValidationMiddleware.validateCheckIn, AttendanceController.checkIn);
router.post('/checkout', ValidationMiddleware.validateCheckOut, AttendanceController.checkOut);

// Status
router.get('/today', AttendanceController.getTodayStatus);
router.get('/can-logout', AttendanceController.canLogout);
router.get('/stats', AttendanceController.getUserStats);

// Reports
router.get('/monthly', AttendanceController.getMonthlyReport);
router.get('/team-report', AttendanceController.getTeamReport);
router.get('/team-summary', AttendanceController.getTeamSummary);
router.get('/team-member-report/:memberId', AttendanceController.getTeamMemberReport);

module.exports = router;