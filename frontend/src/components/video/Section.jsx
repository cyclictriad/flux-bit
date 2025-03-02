import React from 'react';
import { FaPlay, FaFire, FaArrowRight, FaEye, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const VideoSection = ({ title, icon, videos, isLoading, onViewAll }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
        <span className="mr-3">{icon}</span>
        <h2 className="relative">
          {title}
          <span className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
        </h2>
      </div>
      <button 
        onClick={onViewAll}
        className="flex items-center text-sm font-medium px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all group"
      >
        View all <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
    
    {isLoading ? (
      <div className="grid gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    ) : videos.length === 0 ? (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No videos available</p>
      </div>
    ) : (
      <div className="grid gap-4">
        {videos.map(video => (
          <Link 
            to={`/play/${video._id}`} 
            key={video._id || video.cloudinary?.publicId} 
            className="flex bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-32 h-24 relative flex-shrink-0 bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <img 
                src={video.cloudinary?.thumbnailUrl} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/128x96?text=Video';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-blue-600 text-white rounded-full p-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <FaPlay />
                </div>
              </div>
            </div>
            <div className="p-4 flex-grow overflow-hidden">
              <h3 className="text-md font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {video.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {video.description}
              </p>
              <div className="flex flex-wrap items-center mt-2 gap-3">
                <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-1 text-gray-400 dark:text-gray-500" /> 
                  {new Date(video.cloudinary?.createdAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FaEye className="mr-1 text-gray-400 dark:text-gray-500" /> 
                  {video.metadata?.views.toLocaleString() || 0} views
                </span>
                {video.metadata?.trending && (
                  <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <FaFire className="mr-1" /> Trending
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default VideoSection;