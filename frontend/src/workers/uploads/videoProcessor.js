// This worker uses WebCodecs API instead of FFmpeg
import { getFileFromKV, saveFileToKV } from "../../utils/storage";

// Simple in-memory LRU cache for processed videos
const videoCache = new Map();
const MAX_CACHE_SIZE = 5;

function addToCache(key, value) {
    if (videoCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = videoCache.keys().next().value;
        videoCache.delete(oldestKey);
    }
    videoCache.set(key, value);
}

// We'll try a different approach by importing our own implementation of MP4Box
// or a compatible wrapper that provides the same API
let mp4boxReady = false;

// Function to initialize a compatible MP4Box implementation
async function initMP4Box() {
    if (mp4boxReady) return;

    // Import the mp4box.js as a text file and evaluate it
    // This is necessary because the ESM version doesn't expose the same API
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js');
        const mp4boxCode = await response.text();

        // Create a function to evaluate the code in the global scope
        const evaluateInGlobalScope = new Function(mp4boxCode);
        evaluateInGlobalScope();

        // Check if MP4Box is now available in the global scope
        if (typeof self.MP4Box !== 'undefined') {
            mp4boxReady = true;
            console.log("MP4Box initialized successfully");
        } else {
            throw new Error("MP4Box not found in global scope after initialization");
        }
    } catch (error) {
        console.error("Failed to initialize MP4Box:", error);
        throw new Error(`MP4Box initialization failed: ${error.message}`);
    }
}

self.onmessage = async (event) => {
    const { uploadId, options } = event.data;
    const cacheKey = `${uploadId}_${JSON.stringify(options)}`;

    try {
        console.log("Video processor - Processing file");

        // Check worker cache first
        if (videoCache.has(cacheKey)) {
            console.log("Video processor - Key Exists");
            self.postMessage({
                type: "success",
                uploadId
            });
            return;
        }

        // Initialize MP4Box if not already done
        if (!mp4boxReady) {
            self.postMessage({ type: "status", uploadId, message: "Loading required libraries" });
            try {
                await initMP4Box();
            } catch (error) {
                console.error("Failed to load MP4Box:", error);
                throw new Error(`Failed to load required video processing libraries: ${error.message}`);
            }
        }

        // Retrieve file data from KV storage
        const fileDataArray = await getFileFromKV(Number(uploadId));

        console.log("Video processor - Processing file", { fileDataArray });

        if (!fileDataArray || fileDataArray.length === 0) {
            throw new Error("No files found");
        }

        // Process single file or merge multiple segments
        let videoData;
        if (fileDataArray.length === 1) {
            videoData = fileDataArray[0];
        } else {
            self.postMessage({ type: "status", uploadId, message: "Merging video segments" });
            videoData = await mergeVideoSegments(fileDataArray);
        }

        // Process the video
        self.postMessage({ type: "status", uploadId, message: "Processing video" });

        const processedVideo = await processVideo(videoData, options, (progress) => {
            self.postMessage({ type: "progress", uploadId, progress });
        });

        // Save optimized file to KV storage
        await saveFileToKV(`${uploadId}_optimized`, processedVideo);
        console.log("Video processor - Processed file");

        // Add to worker cache
        addToCache(cacheKey, processedVideo);

        self.postMessage({
            type: "success",
            uploadId
        });

    } catch (error) {
        console.error("Video processing error:", error);
        self.postMessage({
            type: "error",
            uploadId,
            error: error.message,
            stack: error.stack
        });
    }
};

async function mergeVideoSegments(videoSegments) {
    // Using MediaRecorder to concatenate video segments
    return new Promise(async (resolve, reject) => {
        try {
            // Create source buffers from video segments
            const sourceBuffers = await Promise.all(
                videoSegments.map(async (segment) => {
                    const buffer = await segment.arrayBuffer();
                    return new Uint8Array(buffer);
                })
            );

            // Create a combined buffer
            let totalLength = sourceBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
            let combinedBuffer = new Uint8Array(totalLength);

            let offset = 0;
            for (const buffer of sourceBuffers) {
                combinedBuffer.set(buffer, offset);
                offset += buffer.byteLength;
            }

            resolve(new Blob([combinedBuffer], { type: 'video/mp4' }));
        } catch (error) {
            reject(error);
        }
    });
}

async function processVideo(videoData, options, progressCallback) {
    return new Promise(async (resolve, reject) => {
        try {
            const videoBlob = new Blob([videoData], { type: 'video/mp4' });
            const videoUrl = URL.createObjectURL(videoBlob);

            // Fetch the video file
            const response = await fetch(videoUrl);
            const buffer = await response.arrayBuffer();

            // Parse the video file using MP4Box.js
            const mp4boxFile = self.MP4Box.createFile();
            mp4boxFile.onReady = async (info) => {
                try {
                    // Find the video track
                    const videoTrack = info.tracks.find((track) => track.type === 'video');
                    if (!videoTrack) {
                        reject(new Error('No video track found in the file'));
                        return;
                    }

                    console.log("Video track found:", videoTrack);

                    // Process samples using the correct approach for this version of MP4Box
                    // Since getSampleIterator is not available, we'll use a different approach

                    // Create a VideoDecoder
                    const decoder = new VideoDecoder({
                        output: (frame) => {
                            // Process the frame
                            processFrame(frame);
                            frame.close();
                        },
                        error: (e) => reject(e),
                    });

                    // Configure the decoder
                    decoder.configure({
                        codec: videoTrack.codec,
                        codedWidth: videoTrack.video.width,
                        codedHeight: videoTrack.video.height,
                    });

                    // Set up MP4Box to deliver samples
                    mp4boxFile.setExtractionOptions(videoTrack.id, null, { nbSamples: 1000 });

                    // Process samples as they are received
                    mp4boxFile.onSamples = (track_id, ref, samples) => {
                        console.log(`Received ${samples.length} samples for track ${track_id}`);

                        for (const sample of samples) {
                            const chunk = new EncodedVideoChunk({
                                type: sample.is_sync ? 'key' : 'delta',
                                data: sample.data,
                                timestamp: sample.cts,
                                duration: sample.duration,
                            });
                            decoder.decode(chunk);
                        }
                    };

                    // Start processing
                    mp4boxFile.start();

                    // After some time or when processing is complete, flush the decoder
                    // For now, we'll use a timeout as a simple approach
                    setTimeout(() => {
                        try {
                            decoder.flush().then(() => {
                                console.log("Decoder flushed");
                                // Clean up and resolve with the processed data
                                // For this example, we'll just resolve with the original data
                                URL.revokeObjectURL(videoUrl);
                                resolve(videoData);
                            });
                        } catch (flushError) {
                            console.error("Error flushing decoder:", flushError);
                            reject(flushError);
                        }
                    }, 5000); // Adjust this timeout based on your video length and processing needs
                } catch (processError) {
                    console.error("Error in processing video track:", processError);
                    reject(processError);
                }
            };

            mp4boxFile.onError = (error) => {
                console.error("MP4Box error:", error);
                reject(error);
            };

            // Append the buffer to MP4Box.js
            buffer.fileStart = 0;
            mp4boxFile.appendBuffer(buffer);
            mp4boxFile.flush();
        } catch (error) {
            console.error("Error in processVideo:", error);
            reject(error);
        }
    });
}

// This function needs to be implemented based on your processing requirements
function processFrame(frame) {
    // Implementation for frame processing
    console.log("Processing frame:", frame.timestamp);
    // Add your frame processing logic here
}

// Handle worker termination
self.addEventListener('close', () => {
    // Clean up resources
    videoCache.clear();
});