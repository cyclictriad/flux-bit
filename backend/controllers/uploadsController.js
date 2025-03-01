const cloudinary = require('../config/cloudinary')

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ error: 'No File uploaded' })

        console.log(JSON.stringify(req.file))
        
        res.status(201).json(req.file)
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