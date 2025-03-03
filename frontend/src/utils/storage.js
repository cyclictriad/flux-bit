import { set, get, del } from "idb-keyval";

// Store file in KV storage
export const saveFileToKV = async (uploadId, file) => {
    await set(uploadId, file);
};

// Retrieve file from KV storage
export const getFileFromKV = async (uploadId) => {
    const fileDataArray = await get(uploadId);
    return fileDataArray;
};

// Delete file when upload completes
export const deleteFileFromKV = async (uploadId) => {
    await del(uploadId);
};
