const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const uploadRouter = require('./routes/upload');
const videoRouter = require('./routes/video');
const app = express();

require('dotenv').config()

app.use(express.json())

const corsOptions = {
    origin: 'http://localhost:5173'
}

app.use(cors(corsOptions))

app.use('/api/upload', uploadRouter)
app.use('/api/videos', videoRouter)

app.get('/api/test', async (req, res)=>{

    return res.status(200).json({
        message:'test success'
    })
})



mongoose.connect(process.env.MONGO_URI).then(async() => {

    app.listen(process.env.PORT, () => {
        console.log(`App running on port ${process.env.PORT}`)
    })

})