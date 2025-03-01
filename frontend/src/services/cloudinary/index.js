import axios from 'axios';

// Get config from environment variables
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

class CloudinaryService {
    constructor() {
        this.baseUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`;
    }

    /**
     * Get video URL from Cloudinary
     */
    getVideoUrl(publicId, options = {}) {
        const transformations = this.buildTransformations(options);
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformations}/${publicId}`;
    }

    /**
     * Get video thumbnail URL
     */
    getVideoThumbnailUrl(publicId, options = {}) {
        const transformations = this.buildTransformations({
            ...options,
            format: 'jpg',
        });
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformations}/${publicId}.jpg`;
    }

    /**
     * Fetch video metadata from Cloudinary
     */
    async getVideoMetadata(publicId) {
        try {
            const response = await axios.get(`${this.baseUrl}/resources/video/upload/${publicId}`, {
                params: {
                    api_key: CLOUDINARY_API_KEY,
                    // In production, you would use a server-side API to handle this securely
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching video metadata:', error);
            throw error;
        }
    }

    /**
     * Build transformation string for Cloudinary URLs
     */
    buildTransformations(options) {
        const transformations = [];

        if (options.width) transformations.push(`w_${options.width}`);
        if (options.height) transformations.push(`h_${options.height}`);
        if (options.crop) transformations.push(`c_${options.crop}`);
        if (options.quality) transformations.push(`q_${options.quality}`);
        if (options.format) transformations.push(`f_${options.format}`);

        return transformations.join(',');
    }

    /**
     * Generate adaptive streaming URLs (HLS)
     */
    getAdaptiveStreamingUrl(publicId) {
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/sp_hd/f_m3u8/${publicId}.m3u8`;
    }
}

export const cloudinaryService = new CloudinaryService();