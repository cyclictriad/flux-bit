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
import { FaPenFancy } from 'react-icons/fa';
import VideoEditPopup from '../components/form/EditVideo';


const PlayPage = () => {
    const { videoId } = useParams();
    const dispatch = useDispatch();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Get current video and related videos from Redux
    const currentVideo = useSelector(getCurrentVideoDetails);
    const relatedVideos = useSelector(getRelatedVideos);

    // Update current video ID when the component mounts or videoId changes
    useEffect(() => {
        if (videoId) {
            updateVideoViews(videoId)
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

            // Optional: auto-play when changing videos
            // dispatch(setPlaying(true));

            // Update page title
            document.title = `${currentVideo.title} | Your Video Platform`;
        }
    }, [currentVideo, dispatch]);

    // Handle navigation to a new video
    const handleVideoSelect = () => {
        // Pause current video
        dispatch(setPlaying(false));
    };

    // Show loading or error state if no video
    if (!currentVideo) {
        return (
            <div className="max-w-5xl mx-auto p-5 flex justify-center items-center h-64">
                <div className="text-white text-lg">Loading video...</div>
            </div>
        );
    }

    return (
        <>
        <div className="max-w-5xl mx-auto p-5">
            <div className='flex justify-end'>
            <button onClick={() => setIsEditModalOpen(true)} className='flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition'>
                <FaPenFancy className='mr-2'/> Edit Video
            </button>
            </div>
            {/* Video Player */}
            <VideoPlayer
                src={currentVideo.cloudinary?.secureUrl}
                title={currentVideo.title}
                thumbnail={currentVideo.cloudinary?.thumbnailUrl}
            />

            {/* Video Info */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg text-white">
                <h1 className="text-2xl font-bold">{currentVideo.title}</h1>
                <div className="mt-2 text-gray-300">{currentVideo.description}</div>

                {/* Additional metadata could go here */}
                <div className="mt-4 flex items-center text-sm text-gray-400">
                    <span>Views: {currentVideo.metadata.views || 0}</span>
                    <span className="mx-2">•</span>
                    <span>Uploaded: {new Date(currentVideo.cloudinary?.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Related Videos */}
            <RelatedVideos  relatedVideos={relatedVideos} handleVideoSelect={handleVideoSelect} />
        </div>
        <VideoEditPopup isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} video={currentVideo}/>
        </>
    );
};

export default PlayPage;