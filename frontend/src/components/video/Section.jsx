import { FaPlay, FaFire, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const VideoSection = ({ title, icon, videos, isLoading, onViewAll }) => (
    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
          {icon} <span className="ml-2">{title}</span>
        </div>
        <button 
          onClick={onViewAll}
          className="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
        >
          View all <FaArrowRight className="ml-1" />
        </button>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300 py-6 text-center">No videos available</p>
      ) : (
        <div className="grid gap-4">
          {videos.map(video => (
            <Link 
              to={`/play/${video._id}`} 
              key={video._id || video.cloudinary?.publicId} 
              className="flex bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition group overflow-hidden border border-gray-100 dark:border-gray-600"
            >
              <div className="w-32 h-24 relative flex-shrink-0 bg-gray-300 dark:bg-gray-700">
                <img 
                  src={video.cloudinary?.thumbnailUrl} 
                  alt={video.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/128x96?text=Video';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaPlay className="text-white text-xl" />
                </div>
              </div>
              <div className="p-4 flex-grow overflow-hidden">
                <h3 className="text-md font-medium text-gray-900 dark:text-white truncate">{video.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(video.cloudinary?.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <FaFire className="mr-1 text-red-500" /> {video.metadata.views.toLocaleString()} views
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );


  export default VideoSection;