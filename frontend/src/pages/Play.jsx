import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import VideoPlayer from '../components/video/Player';
import {
    setCurrentVideoId,
    getCurrentVideoDetails,
    getRelatedVideos
} from '../store/features/videosSlice';
import {
    setPlaying,
    setVideo
} from '../store/features/playerSlice';
import RelatedVideos from '../components/video/Related';
import { updateVideoViews } from '../api/videoApi';
import { FaPenFancy, FaInfoCircle } from 'react-icons/fa';
import VideoEditPopup from '../components/form/EditVideo';

const PlayPage = () => {
    const { videoId } = useParams();
    const dispatch = useDispatch();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Get current video and related videos from Redux
    const currentVideo = useSelector(getCurrentVideoDetails);
    const relatedVideos = useSelector(getRelatedVideos);
    const darkMode = useSelector((state) => state.ui.darkMode);

    // Update current video ID when the component mounts or videoId changes
    useEffect(() => {
        if (videoId) {
            setIsLoading(true);
            updateVideoViews(videoId);
            dispatch(setCurrentVideoId(videoId));
        }
    }, [videoId, dispatch]);

    // Update player's video details when current video changes
    useEffect(() => {
        if (currentVideo) {
            // Set video details in the player state
            dispatch(setVideo({
                id: currentVideo._id,
                src: currentVideo.cloudinary?.secureUrl,
                title: currentVideo.title,
                thumbnail: currentVideo.cloudinary?.thumbnailUrl
            }));

            // Update page title
            document.title = `${currentVideo.title} | Your Video Platform`;
            setIsLoading(false);
        }
    }, [currentVideo, dispatch]);

    // Handle navigation to a new video
    const handleVideoSelect = () => {
        // Pause current video
        dispatch(setPlaying(false));
    };

    // Show loading or error state if no video
    if (isLoading || !currentVideo) {
        return (
            <div className={`max-w-5xl mx-auto p-5 flex justify-center items-center h-64 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <div className="animate-pulse flex flex-col items-center">
                    <div className={`h-12 w-12 mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <div className="text-lg font-medium">Loading video...</div>
                </div>
            </div>
        );
    }

    const formattedDate = new Date(currentVideo.cloudinary?.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            <div className={`max-w-5xl mx-auto p-5 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <div className="flex justify-end mb-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className={`flex items-center px-3 py-2 rounded-md ${darkMode
                                ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-blue-600 hover:text-blue-700'
                            } transition-colors duration-200`}
                    >
                        <FaPenFancy className="mr-2" /> Edit Video
                    </button>
                </div>

                {/* Video Player */}
                <VideoPlayer
                    src={currentVideo.cloudinary?.secureUrl}
                    title={currentVideo.title}
                    thumbnail={currentVideo.cloudinary?.thumbnailUrl}
                />

                {/* Video Info */}
                <div className={`mt-6 p-5 ${darkMode
                        ? 'bg-gray-800 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    } rounded-lg shadow-md transition-colors duration-300`}>
                    <h1 className="text-2xl font-bold mb-2">{currentVideo.title}</h1>

                    <div className="flex items-center text-sm mb-4">
                        <span className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <FaInfoCircle className="mr-1" />
                            {currentVideo.metadata.views?.toLocaleString() || 0} views
                        </span>
                        <span className="mx-2">•</span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            Uploaded: {formattedDate}
                        </span>
                    </div>

                    <div className={`mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                        {currentVideo.description || "No description provided."}
                    </div>
                </div>

                {/* Related Videos */}
                <RelatedVideos relatedVideos={relatedVideos} handleVideoSelect={handleVideoSelect} />
            </div>

            <VideoEditPopup
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                video={currentVideo}
            />
        </>
    );
};

export default PlayPage;