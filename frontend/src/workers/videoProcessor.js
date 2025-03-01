// Listen for messages from the main thread
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    try {
        switch (type) {
            case 'PROCESS_VIDEO':
                // Simulate video processing (in a real app, you'd do actual processing)
                const processedData = processVideo(payload);
                self.postMessage({
                    type: 'PROCESS_VIDEO_RESULT',
                    payload: processedData
                });
                break;

            case 'EXTRACT_METADATA':
                // Simulate metadata extraction
                const metadata = extractMetadata(payload);
                self.postMessage({
                    type: 'EXTRACT_METADATA_RESULT',
                    payload: metadata
                });
                break;

            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({
            type: `${type}_ERROR`,
            payload: null,
            error: error.message || String(error)
        });
    }
});

// Simulated video processing function
function processVideo(videoData) {
    // In a real app, this would do actual video processing
    console.log('Processing video in worker thread', videoData);

    // Simulate processing time
    let startTime = Date.now();
    while (Date.now() - startTime < 500) {
        // CPU-intensive operation simulation
    }

    return {
        id: videoData.id,
        processed: true,
        processingTime: Date.now() - startTime,
        quality: 'high',
        frameCount: Math.floor(Math.random() * 1000) + 1000
    };
}

// Simulated metadata extraction
function extractMetadata(videoData) {
    // Simulate extraction time
    let startTime = Date.now();
    while (Date.now() - startTime < 300) {
        // CPU-intensive operation simulation
    }

    return {
        id: videoData.id,
        duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
        resolution: '1920x1080',
        codec: 'H.264',
        bitrate: `${Math.floor(Math.random() * 5) + 3} Mbps`,
        fps: 30,
        aspectRatio: '16:9',
        audioChannels: 2,
        extractionTime: Date.now() - startTime
    };
}

// Needed for Vite
export { };