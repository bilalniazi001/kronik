module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    bcryptSaltRounds: 10,
    
    // User roles
    userRoles: {
        USER: 'user',
        ADMIN: 'admin'
    },
    
    // Admin roles
    adminRoles: {
        SUPER_ADMIN: 'super_admin',
        ADMIN: 'admin'
    },
    
    // File upload limits
    uploadLimits: {
        profileImage: 2 * 1024 * 1024, // 2MB
        document: 5 * 1024 * 1024 // 5MB
    },
    
    // Allowed file types
    allowedFileTypes: {
        images: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
        documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
};