import React, { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import VideoCard from './Card';

const RelatedVideos = ({ relatedVideos, handleVideoSelect }) => {
    const scrollContainerRef = useRef(null);

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
                <h2 className="text-xl font-bold text-white mb-4">Related Videos</h2>
                <div className="text-gray-400 p-6 bg-gray-800 rounded-lg text-center">
                    No related videos found
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 relative">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Related Videos</h2>
                <div className="flex gap-2">
                    <button
                        onClick={scrollLeft}
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
                        aria-label="Scroll left"
                    >
                        <FaChevronLeft size={20} />
                    </button>
                    <button
                        onClick={scrollRight}
                        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition"
                        aria-label="Scroll right"
                    >
                        <FaChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {relatedVideos.map((video) => (

                    <div className="flex-shrink-0 w-72 snap-start rounded-lg overflow-hidden bg-gray-800 hover:bg-gray-700 transition cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        <VideoCard
                            key={video._id}
                            handleSelect={() => handleVideoSelect(video._id)}
                            video={video} />
                    </div>


                )) }

            </div>
        </div>
    );
};

export default RelatedVideos;