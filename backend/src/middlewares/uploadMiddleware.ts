const multer = require('multer');
const CloudinaryStorage = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

if (!cloudinary) {
    console.error('❌ FATAL: Cloudinary is not initialized!');
    throw new Error('Cloudinary configuration failed');
}

try {
    const storage = new CloudinaryStorage({
        cloudinary: { v2: cloudinary },
        params: {
            folder: 'doc-queue-doctors',
            allowed_formats: ['jpg', 'png', 'jpeg']
        }
    });

    const upload = multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req: any, file: any, cb: any) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed'), false);
            }
        }
    });

    module.exports = { upload };
} catch (error: any) {
    console.error('❌ Failed to initialize upload middleware:', error.message);
    throw error;
}
