import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import VideoPlayer from '../components/video/VideoPlayer';
import { setCurrentVideoId, getCurrentVideoDetails, getRelatedVideos} from '../store/features/videosSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

const PlayPage = () => {
    const { videoId } = useParams();
    const dispatch = useDispatch();

    useEffect(() =>{
        dispatch(setCurrentVideoId(videoId));
    }, [])

    const video = useSelector(getCurrentVideoDetails);
    const relatedVideos = useSelector(getRelatedVideos);
 
    return (
        <div className="max-w-5xl mx-auto p-5">
            {video && (
                <VideoPlayer src={video.cloudinary?.secureUrl} title={video.title} thumbnail={video.cloudinary?.thumbnailUrl} />
            )}

            {/* Related Videos */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Related Videos</h2>
                <div className="space-y-4">
                    {relatedVideos.map((vid) => (
                        <Link to={`/play/${vid._id}`} key={vid._id} className="block">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 text-white transition hover:bg-gray-700">
                                <img src={vid.cloudinary?.thumbnailUrl} alt={vid.title} className="w-24 h-16 rounded-md" />
                                <div>
                                    <h3 className="text-md font-semibold">{vid.title}</h3>
                                    <p className="text-sm text-gray-400">{vid.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlayPage;
