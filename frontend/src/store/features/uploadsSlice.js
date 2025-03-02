import { createSlice } from "@reduxjs/toolkit";
import { deleteFileFromKV, getFileFromKV, saveFileToKV } from "../../utils/storage";
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

export const addToQueueAsync = (uploadId, title, description, fileDataArray, options = {}) => async (dispatch) => {
    await saveFileToKV(uploadId, fileDataArray);
    dispatch(addToQueue({ uploadId, title, description, options }));
};

export const uploadFile = (uploadId) => async (dispatch, getState) => {
    try {
        const state = getState().upload.uploads;
        if (!state[uploadId]) throw new Error("Upload not found");

        const { title, description } = state[uploadId];

        const file = await getFileFromKV(`${uploadId}_optimized`);
        if (!file) throw new Error("File missing from storage");

        const formData = new FormData();
        formData.append("video", file);

        const uploadRequest = new XMLHttpRequest();
        uploadRequest.open("POST", `${API_URL}/upload`, true);

        uploadRequest.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                dispatch(updateProgress({ progress, uploadId }));
            }
        };

        uploadRequest.onload = async () => {
            if (uploadRequest.status === 200) {
                const cloudinaryData = JSON.parse(uploadRequest.responseText);
                await axios.post(`${API_URL}/videos`, { title, description, cloudinary: cloudinaryData });

                dispatch(uploadSuccess({ uploadId }));
            } else {
                dispatch(uploadFailed({ uploadId, error: "Upload failed" }));
            }
        };

        uploadRequest.onerror = () => {
            dispatch(uploadFailed({ uploadId, error: "Network error" }));
        };
     
        uploadRequest.send(formData);
    } catch (error) {
        dispatch(uploadFailed({ uploadId, error: error.message }));
    }
};



export const retryUploadAsync = (uploadId) => async (dispatch) => {
    dispatch(retryUpload({ uploadId }));

    const file = await getFileFromKV(`${uploadId}_optimized`);
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
