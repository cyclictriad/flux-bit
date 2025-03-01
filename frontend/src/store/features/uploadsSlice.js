import { createSlice } from "@reduxjs/toolkit";
import { deleteFileFromKV } from "../../utils/storage";

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

const uploadSlice = createSlice({
    name: "upload",
    initialState: {
        uploads: loadCachedUploads(),
        completedUploads: [],
    },
    reducers: {
        startUpload: (state, action) => {
            const { uploadId, title, description } = action.payload;
            state.uploads[uploadId] = { status: "uploading", progress: 0, title, description };

            saveUploadsToCache(state.uploads);
        },
        updateProgress: (state, action) => {
            const { uploadId, progress } = action.payload;
            if (state.uploads[uploadId]) {
                state.uploads[uploadId].progress = progress;
                saveUploadsToCache(state.uploads);
            }
        },
        uploadSuccess: (state, action) => {
            const { uploadId } = action.payload;
            if (state.uploads[uploadId]) {
                state.completedUploads.push(state.uploads[uploadId].title);
                delete state.uploads[uploadId];
                saveUploadsToCache(state.uploads);
                deleteFileFromKV(uploadId);
            }
        },
        uploadFailed: (state, action) => {
            const { uploadId, error } = action.payload;
            if (state.uploads[uploadId]) {
                state.uploads[uploadId].status = "failed";
                state.uploads[uploadId].error = error;
                saveUploadsToCache(state.uploads);
            }
        },
        retryUpload: (state, action) => {
            const { uploadId } = action.payload;
            if (state.uploads[uploadId]) {
                state.uploads[uploadId].status = "uploading";
                state.uploads[uploadId].progress = 0;
                saveUploadsToCache(state.uploads);
            }
        },
    },
});

export const { startUpload, updateProgress, uploadSuccess, uploadFailed, retryUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
