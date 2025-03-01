import axios from 'axios'

export async function fetchVideos() {
    const apiUrl = `${import.meta.env.VITE_API_URL}/videos`

    let videos = []
    try{
        const response = await axios.get(apiUrl)

        videos = response.data;
    }catch(error){

        console.log("Error fetching videos")
    }

    return videos;
}

export async function deleteVideo(videoId) {
    const apiUrl = `${import.meta.env.VITE_API_URL}/videos/${videoId}`

    try{
        await axios.delete(apiUrl)

    }catch(error){

        console.log("Error fetching videos")
    }
}


export async function updateVideo(videoId, videoData = {}) {
    const apiUrl = `${import.meta.env.VITE_API_URL}/videos/${videoId}`

    try{
        await axios.put(apiUrl, videoData)

    }catch(error){

        console.log("Error fetching videos")
    }
}

export async function updateVideoViews(videoId) {
    const apiUrl = `${import.meta.env.VITE_API_URL}/videos/${videoId}`

    try{
        await axios.patch(apiUrl, {})

    }catch(error){

        console.log("Error fetching videos")
    }
}

