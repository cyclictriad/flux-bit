const {default: Video, videoSchema} = require('../models/Video');
const { validateBody } = require('../utils/router');
const axios = require('axios')

const Router = require('express').Router;

const videoRouter = Router();


videoRouter.get('/',  async(req, res) =>{
    try{
        const videos = await Video.find({});

        res.status(200).json(videos)

    }catch(error){

        console.log(error.message)
        res.status(500).json({
            error:error.message
        })
    }
})



videoRouter.post('/', validateBody({schema:videoSchema}),  async(req, res) =>{
    try{
        const videoDetails = req.body;

        const video = await Video.create(videoDetails)

        res.sendStatus(200)
    }catch(error){

        console.log(error.message)
        res.status(500).json({
            error:error.message
        })
    }
})

videoRouter.put('/:id', validateBody({schema:videoSchema}),  async(req, res) =>{
    try{
        const videoId = req.params.id;

        const newVideoDetails = req.body;

        const video = await Video.findByIdAndUpdate(videoId, newVideoDetails)

        res.sendStatus(200)
    }catch(error){

        console.log(error.message)
        res.status(500).json({
            error:error.message
        })
    }
})


videoRouter.patch('/:id', async(req, res) =>{
    try{
        const videoId = req.params.id;

        const video = await Video.findById(videoId)

        await video.incViews()

        res.sendStatus(200)
    }catch(error){

        console.log(error.message)
        res.status(500).json({
            error:error.message
        })
    }
})

videoRouter.delete('/:id',  async(req, res) =>{
    try{
        const videoId = req.params.id;

        const deletedVideo = await Video.findByIdAndDelete(videoId);

        if(!deletedVideo){
            return res.sendStatus(404)
        }

        const publicId = deletedVideo.cloudinary.publicId;
        const deleteUrl = `${process.env.BASE_URL}/uploads/${publicId}`

        await axios.delete(deleteUrl)

    }catch(error){

        console.log(error.message)
        res.status(500).json({
            error:error.message
        })
    }
})

module.exports = videoRouter;