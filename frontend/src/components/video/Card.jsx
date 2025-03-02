import { AiFillPlayCircle, AiOutlineEye } from 'react-icons/ai';
import { formatDistance } from 'date-fns';
import { Link } from 'react-router-dom';
import { FaRegClock} from 'react-icons/fa';

function VideoCard({ video, handleSelect = () => {} }) {

    
    return (
        <Link to={`/play/${video._id}`} onClick={handleSelect}  className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video">
                    <img
                        src={video.cloudinary.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/640x360?text=Video';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                        <div className="bg-blue-600 rounded-full p-4 shadow-lg">
                            <AiFillPlayCircle className="text-white w-8 h-8" />
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {video.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                        {video.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                            <AiOutlineEye className="mr-1" />
                            {video.metadata.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                            <FaRegClock className="mr-1" />
                            {formatDistance(new Date(video.cloudinary.createdAt), new Date(), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}


export default VideoCard;