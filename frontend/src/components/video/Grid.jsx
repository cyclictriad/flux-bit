import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineViewGrid } from 'react-icons/hi';
import VideoCard from './Card';

const VideosGrid = ({
    error,
    searchTerm,
    handlePageChange,
    status,
    pagination,
    activeCategory,
    displayVideos
}) => {

    const isLoading = status === 'loading';
    const currentPage = pagination[activeCategory].current;
    const totalPages = pagination[activeCategory].total;

    return (
        < div className="lg:col-span-3" >
            {status === 'failed' && (
                <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6">
                    <p>Error loading videos: {error}</p>
                </div>
            )
            }

            {
                isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow">
                                <div className="aspect-video bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
                                <div className="p-4">
                                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-2/3 mb-2"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayVideos.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                        <HiOutlineViewGrid className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No videos found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {searchTerm
                                ? `No results found for "${searchTerm}". Try different keywords.`
                                : "No videos available in this category right now."}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => dispatch(setSearchTerm(''))}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayVideos.map((video) => (
                                <VideoCard video={video} key={video._id || video.cloudinary.publicId} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-8 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-lg ${currentPage === 1
                                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <FiChevronLeft /> Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`w-10 h-10 rounded-lg ${currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-lg ${currentPage === totalPages
                                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                        : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    Next <FiChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )
            }
        </div >)
}


export default VideosGrid;