import { useDispatch } from "react-redux";
import { getFileFromKV } from "../utils/storage";
import { startUpload, updateProgress, uploadSuccess, uploadFailed, retryUpload } from "../store/features/uploadsSlice";


export async function uploadVideo({ uploadId, title, description, retry = false } ) {
    try {
        const dispatch = useDispatch()

        const file = await getFileFromKV(uploadId);

        if (!file) throw new Error("File missing from storage");

        const formData = new FormData();

        formData.append("video", file);

        const uploadRequest = new XMLHttpRequest();
        uploadRequest.open("POST", `${API_URL}/upload`, true);

        uploadRequest.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                dispatch(updateProgress({progress, uploadId}))
            }
        };

        uploadRequest.onload = async () => {
            if (uploadRequest.status === 200) {
                const cloudinaryData = JSON.parse(uploadRequest.responseText);

                try {
                    await axios.post(`${API_URL}/video`,
                        {
                            title,
                            description,
                            cloudinary: cloudinaryData
                        }
                    )

                    self.postMessage({ type: "success", uploadId });
                } catch (error) {
                    self.postMessage({ type: "error", error: "Failed to save metadata", uploadId });
                }

            } else {
                throw new Error("Upload failed");
            }
        };

        uploadRequest.onerror = () => {
            throw new Error("Network error");
        };

        uploadRequest.timeout = 30000; // 30 seconds timeout

        uploadRequest.ontimeout = () => {
            console.error("Request timed out");
            self.postMessage({ type: "error", error: "Request timed out", uploadId });
        };

        // Add this to get more information
        uploadRequest.onreadystatechange = () => {
            console.log("Ready state:", uploadRequest.readyState);
            if (uploadRequest.readyState === 4) {
                console.log("Status:", uploadRequest.status);
                console.log("Response:", uploadRequest.responseText);
            }
        };

        uploadRequest.send(formData);
    } catch (error) {
        if (!retry) {
            self.postMessage({ type: "retry", uploadId });
        } else {
            self.postMessage({ type: "error", error: error.message, uploadId });
        }
    }
};