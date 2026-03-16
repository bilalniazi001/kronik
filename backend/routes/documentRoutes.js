const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/documentController');
const AuthMiddleware = require('../middleware/authMiddleware');
const { uploadDocument } = require('../middleware/uploadMiddleware');

// All document routes require authentication
router.use(AuthMiddleware.verifyToken);

// Document management
router.get('/', DocumentController.getMyDocuments);
router.post('/upload', uploadDocument, DocumentController.uploadDocument);
router.get('/:documentId/view', DocumentController.viewDocument);
router.get('/:documentId/download', DocumentController.downloadDocument);
router.delete('/:documentId', DocumentController.deleteDocument);

// Admin only routes
router.get('/admin/all', AuthMiddleware.isAdmin, DocumentController.getAllDocuments);

module.exports = router;