import { getFileFromKV } from "../utils/storage";

const API_URL = import.meta.env.VITE_API_URL;

self.onmessage = async (event) => {
    const { uploadId, title, description, retry = false } = event.data;
    console.log(JSON.stringify(event.data))
    try {
        const file = await getFileFromKV(uploadId);
        if (!file) throw new Error("File missing from storage");

        const formData = new FormData();
        formData.append("video", file);

        const uploadRequest = new XMLHttpRequest();
        uploadRequest.open("POST", `${API_URL}/upload`, true);

        uploadRequest.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                self.postMessage({ type: "progress", progress, uploadId });
            }
        };

        uploadRequest.onload = () => {
            if (uploadRequest.status === 200) {
                const cloudinaryData = JSON.parse(uploadRequest.responseText);

                fetch(`${API_URL}/video`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, description, cloudinary: cloudinaryData }),
                })
                    .then((res) => res.json())
                    .then(() => {
                        self.postMessage({ type: "success", uploadId });
                    })
                    .catch(() => {
                        self.postMessage({ type: "error", error: "Failed to save metadata", uploadId });
                    });

            } else {
                throw new Error("Upload failed");
            }
        };

        uploadRequest.onerror = () => {
            throw new Error("Network error");
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
