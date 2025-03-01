const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'video-uploads',
        allowed_formats: ['mp4', 'avi', 'mov', 'mkv'],
        resource_type: 'video' // Ensure Cloudinary processes it as a video
    },    
});

const incorrectMimeType = new Error('Incorrect file type');

exports.upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('video/')) {
            console.error("❌ Incorrect file type:", file.mimetype); // Debugging
            return cb(incorrectMimeType, false);
        }

        cb(null, true);
    }
});
