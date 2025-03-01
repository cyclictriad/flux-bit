
const { Schema, model } = require('mongoose')

const videoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // Cloudinary specific information when media is uploaded to Cloudinary
    cloudinary: {
        publicId: {
            type: String,
            required:true
        },
        secureUrl: {
            type: String, // Secure URL for Cloudinary
            required:true
        },
        originalFilename: {
            type: String, // Original filename
            required:true
        },
        format: {
            type: String,
            required:true
        },
        bytes: {
            type: Number, // File size in bytes
            required:true
        },
        thumbnailUrl: {
            type: String, // URL for a thumbnail image (if applicable)
            required:true
        },
        resourceType: {
            type: String, // URL for a thumbnail image (if applicable)
            required:true
        },
        createdAt: {
            type: Date,
            required:true
        }
    },
    metadata:{
        views: {
            type: Number,
            default: 0
        }
    }
})

videoSchema.methods.incViews = async function() {
    this.metadata.views += 1;
    await this.save();
}

const videoModel = model('Video', videoSchema);

module.exports.videoSchema = videoSchema
module.exports.default = videoModel;