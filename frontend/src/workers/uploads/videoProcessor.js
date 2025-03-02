import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { getFileFromKV, saveFileToKV } from "../../utils/storage";

const ffmpeg = new FFmpeg();

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';

// Load FFmpeg core
async function loadFFmpeg() {
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    });
}

// Pre-load FFmpeg when the worker starts
let ffmpegLoading = loadFFmpeg();

// Simple in-memory LRU cache for processed videos
const videoCache = new Map();
const MAX_CACHE_SIZE = 5; // Limit cache to 5 entries

// Helper to add to cache
function addToCache(key, value) {
    // Remove oldest entry if cache is full
    if (videoCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = videoCache.keys().next().value;
        videoCache.delete(oldestKey);
    }
    videoCache.set(key, value);
}

// Helper function to clean up FFmpeg files
async function cleanupFiles(filenames) {
    for (const filename of filenames) {
        try {
            ffmpeg.deleteFile(filename);
        } catch (error) {
            console.warn(`Failed to delete ${filename}: ${error.message}`);
        }
    }
}


self.onmessage = async (event) => {
   

    const { uploadId, options } = event.data;
    const cacheKey = `${uploadId}_${JSON.stringify(options)}`;
    const filesToCleanup = [];

    console.log("Video processor - Processing file")

    try {
        // Check worker cache first
        if (videoCache.has(cacheKey)) {
            self.postMessage({ type: "success", uploadId, optimizedData: videoCache.get(cacheKey), fromCache: true });
            return;
        }

        // Wait for FFmpeg to load if it hasn't already
        await ffmpegLoading;
        
        console.log("Video processor - Processing file")

        // Progress reporting setup
        let lastProgress = 0;
        ffmpeg.setProgress(({ ratio }) => {
            const progress = Math.round(ratio * 100);
            // Only report progress changes of 5% or more to reduce message overhead
            if (progress >= lastProgress + 5 || progress === 100) {
                self.postMessage({ type: "progress", uploadId, progress });
                lastProgress = progress;
            }
        });

        ffmpeg.on('log', ({ message }) => console.log(message));

        // Retrieve file data from KV storage
        const fileDataArray = await getFileFromKV(uploadId);

        console.log("Video processor - Processing file", {fileDataArray})

        if (!fileDataArray || fileDataArray.length === 0) throw new Error("No files found");

        let finalFile = fileDataArray[0];
        if (fileDataArray.length > 1) {
            self.postMessage({ type: "status", uploadId, message: "Merging video segments" });
            const concatFile = 'fileList.txt';
            await ffmpeg.writeFile(concatFile, new TextEncoder().encode(
                fileDataArray.map((_, i) => `file 'input${i}.mp4'`).join("\n")
            ));
            filesToCleanup.push(concatFile);

            for (let i = 0; i < fileDataArray.length; i++) {
                const inputName = `input${i}.mp4`;
                await ffmpeg.writeFile(inputName, await fetchFile(fileDataArray[i]));
                filesToCleanup.push(inputName);
            }

            const outputName = 'merged.mp4';
            await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', concatFile, '-c', 'copy', outputName]);
            finalFile = await ffmpeg.readFile(outputName);
            filesToCleanup.push(outputName);
        }

        const inputName = 'input.mp4';
        await ffmpeg.writeFile(inputName, finalFile);
        filesToCleanup.push(inputName);

        // Base compression settings
        let compressionLevel = '1000k'; // Default bitrate
        let preset = 'faster'; // Faster preset for better performance

        // Adjust compression based on file size
        if (finalFile.byteLength > 100 * 1024 * 1024) { // 100MB
            compressionLevel = '800k';
        } else if (finalFile.byteLength > 50 * 1024 * 1024) { // 50MB
            compressionLevel = '1000k';
        } else if (finalFile.byteLength > 20 * 1024 * 1024) { // 20MB
            compressionLevel = '1500k';
        }

        // Override with user options
        if (options.bitrate) compressionLevel = options.bitrate;
        if (options.preset) preset = options.preset;

        // Build filter complex for all operations
        let filters = [];
        let outputArgs = [];

        // Add resize filter if needed
        if (options.resize) {
            filters.push(`scale=${options.resize.width}:${options.resize.height}`);
        }

        // Add watermark if needed
        if (options.watermark) {
            const watermarkFile = 'watermark.png';
            ffmpeg.writeFile(watermarkFile, await fetchFile(options.watermark));
            filesToCleanup.push(watermarkFile);

            // If we already have filters, we need to add overlay to existing chain
            if (filters.length > 0) {
                filters.push('overlay=10:10');
                outputArgs.push('-i', watermarkFile);
            } else {
                filters.push('overlay=10:10');
                outputArgs.push('-i', watermarkFile);
            }
        }

        // Apply trim if needed
        let trimArgs = [];
        if (options.trim) {
            trimArgs.push('-ss', options.trim.start);
            if (options.trim.end) {
                trimArgs.push('-to', options.trim.end);
            }
        }

        // Final output arguments
        const outputName = 'output.mp4';

        self.postMessage({ type: "status", uploadId, message: "Processing video" });

        // Build complete FFmpeg command
        let ffmpegArgs = [
            ...trimArgs,
            '-i', inputName,
            ...outputArgs
        ];

        // Add filter complex if we have filters
        if (filters.length > 0) {
            ffmpegArgs.push('-filter_complex', filters.join(','));
        }

        // Add encoding parameters
        ffmpegArgs = [
            ...ffmpegArgs,
            '-c:v', 'libx264',
            '-preset', preset,
            '-b:v', compressionLevel,
            '-movflags', '+faststart', // Enable streaming optimization
            '-pix_fmt', 'yuv420p', // Ensure compatibility
            '-c:a', 'aac', // Use AAC for audio
            '-b:a', '128k', // Reasonable audio bitrate
            outputName
        ];

        // Run the operation
        await ffmpeg.exec(...ffmpegArgs);

        finalFile = await ffmpeg.readFile(outputName);
        filesToCleanup.push(outputName);

        //Save optimized file to KV storage
        await saveFileToKV(`${uploadId}_optimized`, finalFile);
        console.log("Video processor - Processed file")

        // Add to worker cache
        addToCache(cacheKey, finalFile);

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
    } finally {
        // Clean up any files we created
        await cleanupFiles(filesToCleanup);
    }
};

// Handle worker termination
self.addEventListener('close', () => {
    // Clean up FFmpeg resources
    try {
        ffmpeg.exit();
    } catch (e) {
        console.warn("Error while terminating FFmpeg worker:", e);
    }
});

