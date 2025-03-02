import React, { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import VideoCard from './Card';

const RelatedVideos = ({ relatedVideos, handleVideoSelect }) => {
    const scrollContainerRef = useRef(null);
    const darkMode = useSelector((state) => state.ui.darkMode);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };

    if (!relatedVideos || relatedVideos.length === 0) {
        return (
            <div className="mt-8">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Related Videos
                </h2>
                <div className={`${darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-100'} p-6 rounded-lg text-center`}>
                    No related videos found
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 relative">
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Related Videos
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={scrollLeft}
                        className={`p-2 rounded-full ${darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            } transition-colors duration-200 shadow-sm hover:shadow`}
                        aria-label="Scroll left"
                    >
                        <FaChevronLeft size={18} />
                    </button>
                    <button
                        onClick={scrollRight}
                        className={`p-2 rounded-full ${darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            } transition-colors duration-200 shadow-sm hover:shadow`}
                        aria-label="Scroll right"
                    >
                        <FaChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {relatedVideos.map((video) => (
                    <div
                        key={video._id}
                        className={`flex-shrink-0 w-72 snap-start rounded-lg overflow-hidden ${darkMode
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-white hover:bg-gray-50'
                            } transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
                    >
                        <VideoCard
                            handleSelect={() => handleVideoSelect(video._id)}
                            video={video}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedVideos;