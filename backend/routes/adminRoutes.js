const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const AuthMiddleware = require('../middleware/authMiddleware');
const AdminMiddleware = require('../middleware/adminMiddleware');

// All admin routes require authentication and admin role
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.isAdmin);
router.use(AdminMiddleware.logAction);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// User management (accessible by all admins)
router.get('/users', AdminMiddleware.canManageUsers, AdminController.getUsers);
router.get('/users/:userId', AdminMiddleware.canManageUsers, AdminController.getUserDetails);
router.post('/users', AdminMiddleware.canManageUsers, AdminController.createUser);
router.post('/hr', AdminMiddleware.canManageUsers, AdminController.createHR);
router.put('/users/:userId', AdminMiddleware.canManageUsers, AdminController.updateUser);
router.delete('/users/:userId', AdminMiddleware.canManageUsers, AdminController.deleteUser);

// Admin management (super admin only)
router.get('/admins', AdminMiddleware.canManageAdmins, AdminController.getAdmins);
router.post('/admins', AdminMiddleware.canManageAdmins, AdminController.createAdmin);
router.put('/admins/:adminId', AdminMiddleware.canManageAdmins, AdminController.updateAdmin);
router.delete('/admins/:adminId', AdminMiddleware.canManageAdmins, AdminController.deleteAdmin);

// Attendance and reports
router.get('/attendance', AdminController.getAllAttendance);
router.get('/reports', AdminController.getReports);
router.get('/export', AdminController.exportAttendance);

// Announcements management
const AnnouncementController = require('../controllers/announcementController');
router.post('/announcements', AnnouncementController.createAnnouncement);
router.delete('/announcements/:id', AnnouncementController.deleteAnnouncement);

module.exports = router;