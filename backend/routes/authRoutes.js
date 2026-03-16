const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/authMiddleware');
const ValidationMiddleware = require('../middleware/validationMiddleware');

// Public routes
router.post('/signup', ValidationMiddleware.validateSignup, AuthController.signup);
router.post('/login', ValidationMiddleware.validateLogin, AuthController.login);
router.post('/admin/login', ValidationMiddleware.validateLogin, AuthController.adminLogin);

// Protected routes
router.get('/profile', AuthMiddleware.verifyToken, AuthController.getProfile);
router.post('/logout', AuthMiddleware.verifyToken, AuthController.logout);

module.exports = router;