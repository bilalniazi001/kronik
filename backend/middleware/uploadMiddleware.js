const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authConfig = require('../config/auth');

// Ensure upload directories exist
const createDirIfNotExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Create directories if they don't exist
createDirIfNotExists('uploads/profiles');
createDirIfNotExists('uploads/documents');

// Profile image storage
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${req.userId}-${uniqueSuffix}${ext}`);
    }
});

// Document storage
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/documents/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `doc-${req.userId}-${uniqueSuffix}${ext}`);
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    if (authConfig.allowedFileTypes.images.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
    const allowedTypes = [...authConfig.allowedFileTypes.images, ...authConfig.allowedFileTypes.documents];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Allowed: JPG, PNG, GIF, PDF, DOC, DOCX'), false);
    }
};

// Profile image upload middleware
const uploadProfileImage = multer({
    storage: profileStorage,
    limits: { fileSize: authConfig.uploadLimits.profileImage },
    fileFilter: imageFilter
}).single('profile_image');

// Document upload middleware
const uploadDocument = multer({
    storage: documentStorage,
    limits: { fileSize: authConfig.uploadLimits.document },
    fileFilter: documentFilter
}).single('document');

// Error handling wrapper
const handleUpload = (uploadMiddleware) => {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: `File too large. Max size: ${authConfig.uploadLimits.document / (1024*1024)}MB`
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    };
};

module.exports = {
    uploadProfileImage: handleUpload(uploadProfileImage),
    uploadDocument: handleUpload(uploadDocument)
};