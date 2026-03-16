const express = require('express');
const router = express.Router();
const HolidayController = require('../controllers/holidayController');
const AuthMiddleware = require('../middleware/authMiddleware');

// All authenticated users can view holidays
router.get('/', AuthMiddleware.verifyToken, HolidayController.getAll);

// Only HR and Admins can create and delete holidays
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.isHR, HolidayController.create);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.isHR, HolidayController.delete);

module.exports = router;
