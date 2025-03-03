const cloudinary = require('../config/cloudinary')

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ error: 'No File uploaded' })

        const transformCloudinaryData = (uploadData) => {
            if (!uploadData || !uploadData.filename || !uploadData.path) {
                throw new Error("Invalid upload data");
            }

            const publicId = uploadData.filename; // Extract publicId from filename
            const secureUrl = uploadData.path; // Cloudinary video URL
            const format = uploadData.mimetype.split("/")[1]; // Extract format (e.g., mp4)
            const createdAt = new Date().toISOString(); // Current timestamp

            // Generate thumbnail URL using Cloudinary transformations
            const thumbnailUrl = secureUrl
                .replace("/upload/", "/upload/w_300,h_200,c_fill/")
                .replace(`.${format}`, ".jpg");

            return {

                publicId,
                secureUrl,
                originalFilename: uploadData.originalname,
                format,
                bytes: uploadData.size,
                thumbnailUrl,
                resourceType: "video",
                createdAt

            };
        };


        res.status(201).json(transformCloudinaryData(req.file))

    } catch (error) {
        res.status(500).json(`Error occured on our side`)
        console.error(error.message)
    }
}

exports.deleteFile = async (req, res) => {
    try {
        let publicId = decodeURIComponent(req.params.publicId)

        if (!publicId) return res.status(400).json({
            message: 'A public_id must be provided'
        })

        await cloudinary.uploader.destroy(publicId)


        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to delete image' })
    }
}