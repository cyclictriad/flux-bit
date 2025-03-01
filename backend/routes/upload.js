const Router = require('express').Router;
const { upload } = require('../middleware/uploadsMiddleware')
const {uploadFile, deleteFile} = require('../controllers/uploadsController')

const uploadRouter = Router();


uploadRouter.post('/', upload.single('video'), uploadFile)

uploadRouter.delete('/:publicId',  deleteFile)
// Global error handler
uploadRouter.use((err, req, res, next) => {
    console.error("❌ Upload error:", err.message || err); // Debugging
    res.status(400).json({ error: err.message || "Something went wrong" });
});
module.exports = uploadRouter;