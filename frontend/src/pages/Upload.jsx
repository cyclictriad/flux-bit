import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { FaCloudUploadAlt } from 'react-icons/fa';
import { addToQueueAsync } from '../store/features/uploadsSlice';


const UploadPage = () => {
    const [fileData, setFileData] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [preview, setPreview] = useState(null);

    const dispatch = useDispatch();

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            setFileData(selectedFiles);
            setPreview(URL.createObjectURL(selectedFiles[0]));
        }
    };


    // Reset form after upload
    const resetForm = () => {
        setFileData(null);
        setTitle('');
        setDescription('');
        setPreview(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!fileData || fileData?.length < 1 || !title.trim() || !description.trim()) {
            alert("Please provide file, title, and description!");
            return;
        }

        const uploadId = Date.now();

        dispatch(addToQueueAsync(uploadId, title, description, fileData));

        resetForm()
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upload Video</h2>

                {/* File Upload */}
                <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer">
                    <FaCloudUploadAlt className="w-12 h-12 text-gray-500 dark:text-gray-400 mb-2" />
                    <span className="text-gray-700 dark:text-gray-300">Click to upload or drag & drop</span>
                    <input type="file" multiple className="hidden" onChange={handleFileChange} accept="video/*" />
                </label>

                {/* Preview */}
                {preview && (
                    <video controls className="mt-4 w-full rounded-lg">
                        <source src={preview} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}

                {/* Form Fields */}
                <form onSubmit={handleUpload} className="mt-4 space-y-4">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Video Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Description (optional)"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>



                    {/* Upload Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                        Upload Video
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadPage;
