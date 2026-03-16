const { body, validationResult } = require('express-validator');

class ValidationMiddleware {
    // Signup validation rules
    static validateSignup = [
        body('name')
            .trim()
            .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
            .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
        
        body('email')
            .isEmail().withMessage('Please provide a valid email')
            .normalizeEmail(),
        
        body('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter and one number'),
        
        body('phone')
            .matches(/^03[0-9]{9}$/).withMessage('Phone must be 11 digits starting with 03'),
        
        body('cnic')
            .matches(/^[0-9]{13}$/).withMessage('CNIC must be 13 digits without dashes'),
        
        body('address')
            .optional()
            .trim()
            .isLength({ max: 500 }).withMessage('Address too long'),
        
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => ({
                        field: err.path,
                        message: err.msg
                    }))
                });
            }
            next();
        }
    ];

    // Login validation rules
    static validateLogin = [
        body('email')
            .isEmail().withMessage('Please provide a valid email')
            .normalizeEmail(),
        
        body('password')
            .notEmpty().withMessage('Password is required'),
        
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => ({
                        field: err.path,
                        message: err.msg
                    }))
                });
            }
            next();
        }
    ];

    // Check-in validation
    static validateCheckIn = [
        body('latitude')
            .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        
        body('longitude')
            .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
        
        body('location_name')
            .optional()
            .trim()
            .isLength({ max: 255 }).withMessage('Location name too long'),
        
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => ({
                        field: err.path,
                        message: err.msg
                    }))
                });
            }
            next();
        }
    ];

    // Check-out validation
    static validateCheckOut = [
        body('latitude')
            .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        
        body('longitude')
            .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
        
        body('location_name')
            .optional()
            .trim()
            .isLength({ max: 255 }).withMessage('Location name too long'),
        
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => ({
                        field: err.path,
                        message: err.msg
                    }))
                });
            }
            next();
        }
    ];

    // Profile update validation
    static validateProfileUpdate = [
        body('name')
            .optional()
            .trim()
            .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
            .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
        
        body('phone')
            .optional()
            .matches(/^03[0-9]{9}$/).withMessage('Phone must be 11 digits starting with 03'),
        
        body('current_password')
            .notEmpty().withMessage('Current password is required to update profile'),
        
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(err => ({
                        field: err.path,
                        message: err.msg
                    }))
                });
            }
            next();
        }
    ];
}

module.exports = ValidationMiddleware;