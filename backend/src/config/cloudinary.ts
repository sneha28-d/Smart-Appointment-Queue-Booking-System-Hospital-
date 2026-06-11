let cloudinary: any;

try {
    const CloudinaryModule = require('cloudinary');
    cloudinary = CloudinaryModule.v2;
    
    if (!cloudinary) {
        throw new Error('Failed to get cloudinary.v2');
    }

    // Configure cloudinary with environment variables
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Log configuration status (without exposing secrets)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        console.log(`✅ Cloudinary configured with cloud_name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    } else {
        console.error('❌ CLOUDINARY_CLOUD_NAME not set in .env');
    }
} catch (error: any) {
    console.error('❌ Failed to initialize Cloudinary:', error.message);
    process.exit(1);
}

module.exports = cloudinary;
