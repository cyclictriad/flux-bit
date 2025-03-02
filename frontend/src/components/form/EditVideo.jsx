import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaExclamationCircle } from 'react-icons/fa';
import { updateVideo } from '../../api/videoApi';

const VideoEditPopup = ({
    isOpen,
    onClose = () => { },
    video,
    darkMode = true // Use the darkMode prop from state.ui
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (video) {
            setFormData({
                title: video.title || '',
                description: video.description || ''
            });
        }
    }, [video]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await updateVideo(
                video._id,
                formData
            );
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            console.log(err.message)
            setError(err.message || 'Failed to update video');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Theme classes based on dark mode
    const bgClass = darkMode ? 'bg-gray-900' : 'bg-white';
    const textClass = darkMode ? 'text-white' : 'text-gray-900';
    const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
    const inputBgClass = darkMode ? 'bg-gray-800' : 'bg-gray-50';
    const buttonPrimaryClass = darkMode
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
        : 'bg-indigo-500 hover:bg-indigo-600 text-white';
    const buttonSecondaryClass = darkMode
        ? 'bg-gray-700 hover:bg-gray-600 text-white'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-800';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`w-full max-w-lg relative rounded-xl shadow-2xl overflow-hidden ${bgClass} transition-all duration-300 transform scale-100`}
                style={{ maxHeight: '90vh' }}
            >
                {/* Success overlay */}
                {success && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-green-500 bg-opacity-90 text-white">
                        <div className="text-center p-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4">
                                <FaSave size={28} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Video Updated!</h3>
                            <p>Your changes have been saved successfully.</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${borderClass}`}>
                    <h2 className={`text-xl font-semibold ${textClass}`}>Edit Video Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        <FaTimes size={20} className={textClass} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 text-red-500 flex items-start">
                            <FaExclamationCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="title" className={`block mb-2 font-medium ${textClass}`}>
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className={`w-full p-3 rounded-lg border ${borderClass} ${inputBgClass} ${textClass} focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                placeholder="Enter video title"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className={`block mb-2 font-medium ${textClass}`}>
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className={`w-full p-3 rounded-lg border ${borderClass} ${inputBgClass} ${textClass} focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                placeholder="Enter video description"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-5 py-2.5 rounded-lg font-medium ${buttonSecondaryClass}`}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-5 py-2.5 rounded-lg font-medium flex items-center ${buttonPrimaryClass} disabled:opacity-70 disabled:cursor-not-allowed`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaSave size={16} className="mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VideoEditPopup;