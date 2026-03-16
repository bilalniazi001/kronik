const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/authMiddleware');
const {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getLatestAnnouncements
} = require('../controllers/announcementController');

// Public routes (no authentication required)
router.get('/latest', getLatestAnnouncements);

// Protected routes (authentication required)
router.get('/', AuthMiddleware.verifyToken, getAllAnnouncements);
router.get('/:id', AuthMiddleware.verifyToken, getAnnouncementById);

// Admin only routes
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.isAdmin, createAnnouncement);
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.isAdmin, updateAnnouncement);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.isAdmin, deleteAnnouncement);

module.exports = router;