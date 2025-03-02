const { default: Video } = require('./models/Video')

const sampleData = Array.from({ length: 10 }, (_, i) => ({
    title: `Sample Title ${i + 1}`,
    description: `This is a sample description for item ${i + 1}.`,
    cloudinary: {
        publicId: `id${i + 1}xyz`,
        secureUrl: `https://res.cloudinary.com/djwlujwil/video/upload/v1740858544/Your_paragraph_text_xdaofa.mp4`,
        originalFilename: `sample${i + 1}.jpg`,
        format: "jpg",
        bytes: 200000 + (i * 50000),
        thumbnailUrl: `https://res-console.cloudinary.com/djwlujwil/thumbnails/v1/video/upload/v1740858544/WW91cl9wYXJhZ3JhcGhfdGV4dF94ZGFvZmE=/preview`,
        resourceType: "image",
        createdAt: new Date(2023, i, 1).toISOString()
    },
    metadata: {
        views: (i + 1) * 100
    }
}));

module.exports.populateVideos = async () => {

    for (const video of sampleData) {
        console.log("This is a video")
        await Video.create(video)
    }
}