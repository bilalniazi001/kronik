const express = require('express');
const router = express.Router();
const HRController = require('../controllers/hrController');
const AuthMiddleware = require('../middleware/authMiddleware');

// HR Protected Routes
router.use(AuthMiddleware.verifyToken, AuthMiddleware.isHR);

router.post('/managers', HRController.createManager);
router.post('/employees', HRController.createEmployee);
router.get('/managers', HRController.getManagers);
router.get('/leave-types', HRController.getLeaveTypes);

module.exports = router;
