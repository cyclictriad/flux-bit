import { createSlice } from "@reduxjs/toolkit";
import { deleteFileFromKV, getFileFromKV, saveFileToKV } from "../../utils/storage";
import { addToast } from './toastsSlice';
import axios from "axios";

const loadCachedUploads = () => {
    try {
        return JSON.parse(localStorage.getItem("pendingUploads")) || {};
    } catch {
        return {};
    }
};

const saveUploadsToCache = (uploads) => {
    localStorage.setItem("pendingUploads", JSON.stringify(uploads));
};

export const addToQueueAsync = (uploadId, title, description, fileData, options = {}) => async (dispatch) => {
    await saveFileToKV(uploadId, fileData);
    dispatch(addToQueue({ uploadId, title, description, options }));
};

export const uploadFile = (uploadId) => async (dispatch, getState) => {
    try {
        // Get the current upload data from state
        const state = getState().uploads.uploads;

        if (!state[uploadId]) throw new Error("Upload not found");

        const { title, description } = state[uploadId];

        const API_URL = import.meta.env.VITE_API_URL;


        const uploadVideoDetails = async (cloudinaryData) => {
            await axios.post(`${API_URL}/videos`, {
                title,
                description,
                cloudinary: cloudinaryData
            });
            
            dispatch(uploadSuccess({ uploadId }));

            localStorage.removeItem(`cloudinary_${uploadId}`)
        }

        //retrieve video details cache
        const cloudinary = localStorage.getItem(`cloudinary_${uploadId}`)

        if (cloudinary) {
            await uploadVideoDetails(cloudinary)
        }

        // Retrieve file from KV storage
        const file = await getFileFromKV(Number(uploadId));
        if (!file) throw new Error("File missing from storage");



        const formData = new FormData();
        formData.append("video", file);


        // Notify user that upload is starting
        dispatch(addToast({
            type: 'info',
            message: `Upload started for ${title}!`,
            duration: 5000
        }));

        // Create and configure XMLHttpRequest
        const uploadRequest = new XMLHttpRequest();
        uploadRequest.timeout = 60000; // 1 minute timeout

        // Add proper error handling for timeout
        uploadRequest.ontimeout = () => {
            dispatch(addToast({
                type: 'error',
                message: `Upload timed out for ${title}!`,
                duration: 5000
            }));
            dispatch(uploadFailed({ uploadId, error: "Upload timed out" }));
        };



        uploadRequest.open("POST", `${API_URL}/upload`, true);

        // Track upload progress
        uploadRequest.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                dispatch(updateProgress({ progress, uploadId }));
            }
        };

        // Handle successful upload
        uploadRequest.onload = async () => {
            if (uploadRequest.status >= 200 && uploadRequest.status < 300) {
                dispatch(addToast({
                    type: 'success',
                    message: `${title} uploaded successfully!`,
                    duration: 5000
                }));

                try {

                    const cloudinaryData = JSON.parse(uploadRequest.responseText);

                    localStorage.setItem(`cloudinary_${uploadId}`, cloudinaryData)

                    await uploadVideoDetails(cloudinaryData)

                } catch (error) {
                    console.error("Post-upload processing failed:", error);
                    dispatch(addToast({
                        type: 'warning',
                        message: `Upload succeeded but processing failed for ${title}!`,
                        duration: 5000
                    }));
                    dispatch(uploadFailed({
                        uploadId,
                        error: "Upload succeeded but processing failed"
                    }));
                }
            } else {
                const errorMsg = `Server responded with status ${uploadRequest.status}`;
                console.error(errorMsg);
                dispatch(addToast({
                    type: 'error',
                    message: `Upload failed for ${title}: ${errorMsg}`,
                    duration: 5000
                }));
                dispatch(uploadFailed({ uploadId, error: errorMsg }));
            }
        };

        // Handle network errors
        uploadRequest.onerror = () => {
            dispatch(addToast({
                type: 'error',
                message: `Network error while uploading ${title}!`,
                duration: 5000
            }));
            dispatch(uploadFailed({ uploadId, error: "Network error" }));
        };

        // Initiate the upload
        uploadRequest.send(formData);
    } catch (error) {
        console.error("Upload failed:", error.message);
        dispatch(addToast({
            type: 'error',
            message: `Could not start upload for ID ${uploadId}: ${error.message}`,
            duration: 5000
        }));
        dispatch(uploadFailed({ uploadId, error: error.message }));
    }
};

export const retryUploadAsync = (uploadId) => async (dispatch) => {
    dispatch(retryUpload({ uploadId }));

    const file = await getFileFromKV(Number(uploadId));
    if (!file) {
        dispatch(startProcessing({ uploadId })); // Restart processing if needed
    } else {
        dispatch(uploadFile(uploadId)); // Proceed to upload if file exists
    }
};

const uploadSlice = createSlice({
    name: "upload",
    initialState: {
        uploads: loadCachedUploads(),
        completedUploads: [],
    },
    reducers: {
        addToQueue: (state, action) => {
            const { uploadId, title, description, options } = action.payload;
            state.uploads[uploadId] = { status: "pending", progress: null, title, description, options };

            saveUploadsToCache(state.uploads);
        },
        startProcessing: (state, action) => {
            const { uploadId } = action.payload;

            if (!state.uploads[uploadId]) return;
            state.uploads[uploadId].status = "processing";

            saveUploadsToCache(state.uploads);
        },
        startUpload: (state, action) => {
            const { uploadId } = action.payload;

            if (!state.uploads[uploadId]) return;
            state.uploads[uploadId].status = "uploading";
            state.uploads[uploadId].progress = 0
        },
        updateProgress: (state, action) => {
            const { uploadId, progress } = action.payload;

            if (!state.uploads[uploadId]) return;
            state.uploads[uploadId].progress = progress;
            saveUploadsToCache(state.uploads);
        },
        uploadSuccess: (state, action) => {
            const { uploadId } = action.payload;
            if (!state.uploads[uploadId]) return;
            state.completedUploads.push(state.uploads[uploadId].title);
            delete state.uploads[uploadId];
            saveUploadsToCache(state.uploads);

            //delete both files (optimized and non-optimized)
            deleteFileFromKV(uploadId);
            deleteFileFromKV(`${uploadId}_optimized`);
        },
        uploadFailed: (state, action) => {
            const { uploadId, error } = action.payload;

            if (!state.uploads[uploadId]) return;
            state.uploads[uploadId].status = "failed";
            state.uploads[uploadId].error = error;
            saveUploadsToCache(state.uploads);

        }
    },
});



export const { addToQueue, startProcessing, startUpload, updateProgress, uploadSuccess, uploadFailed, retryUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
