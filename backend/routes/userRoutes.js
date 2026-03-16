const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const AuthMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');
const { uploadProfileImage } = require('../middleware/uploadMiddleware');

// All user routes require authentication
router.use(AuthMiddleware.verifyToken);

// Profile routes
router.get('/profile', UserController.getProfile);
router.put('/profile', ValidationMiddleware.validateProfileUpdate, UserController.updateProfile);
router.post('/profile/image', uploadProfileImage, UserController.uploadProfileImage);
router.post('/change-password', UserController.changePassword);

// Dashboard
router.get('/dashboard', UserController.getDashboard);

// Reports
router.get('/reports', UserController.getReports);

module.exports = router;