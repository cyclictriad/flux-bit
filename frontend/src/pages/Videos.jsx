import React, { useState, useEffect } from 'react';
import {  useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVideos, setSearchTerm, setFilter, setPage, setActiveCategory } from '../store/features/videosSlice';
import { BiFilter, BiSearch, BiCategory } from 'react-icons/bi';
import { FaRegClock, FaFire, FaSortAmountDown } from 'react-icons/fa';
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineViewGrid } from 'react-icons/hi';
import VideoCard from '../components/video/Card';

const VideosPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Parse URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category') || 'featured';
    const pageParam = parseInt(queryParams.get('page') || '1', 10);
    const searchParam = queryParams.get('search') || '';
    
    // Local UI states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchInputValue, setSearchInputValue] = useState(searchParam);
    
    // Redux state
    const { 
        items, 
        filteredItems,
        status, 
        error,
        pagination,
        activeCategory,
        searchTerm,
        filters
    } = useSelector(state => state.videos);
    
    // Update Redux state based on URL parameters on initial load
    useEffect(() => {
        dispatch(setActiveCategory(categoryParam));
        if (pageParam > 1) {
            dispatch(setPage({ category: categoryParam, page: pageParam }));
        }
        if (searchParam) {
            dispatch(setSearchTerm(searchParam));
        }
    }, []);
    
    // Fetch videos when relevant state changes
    useEffect(() => {
        dispatch(fetchVideos({ category: activeCategory }));
    }, [dispatch, activeCategory, pagination[activeCategory].current, filters, searchTerm]);
    
    // Update URL when pagination or category changes
    useEffect(() => {
        const params = new URLSearchParams();
        params.set('category', activeCategory);
        params.set('page', pagination[activeCategory].current.toString());
        
        if (searchTerm) {
            params.set('search', searchTerm);
        }
        
        navigate(`/videos?${params.toString()}`, { replace: true });
    }, [navigate, activeCategory, pagination[activeCategory].current, searchTerm]);
    
    // Handle search submission
    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(setSearchTerm(searchInputValue));
    };
    
    // Handle category selection
    const handleCategoryChange = (category) => {
        dispatch(setActiveCategory(category));
        // Reset to page 1 when changing category
        dispatch(setPage({ category, page: 1 }));
        setIsFilterOpen(false);
    };
    
    // Handle sort order change
    const handleSortChange = (sortBy) => {
        dispatch(setFilter({ sortBy }));
    };
    
    // Handle pagination
    const handlePageChange = (newPage) => {
        dispatch(setPage({ category: activeCategory, page: newPage }));
    };
    
    // Determine videos to display
    const displayVideos = filteredItems.length > 0 ? filteredItems : items;
    const isLoading = status === 'loading';
    const currentPage = pagination[activeCategory].current;
    const totalPages = pagination[activeCategory].total;
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-8 pb-16">
            <div className="container mx-auto px-4">
                {/* Header section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {activeCategory === 'search' ? 'Search Results' : 
                                 activeCategory === 'featured' ? 'Featured Videos' :
                                 activeCategory === 'trending' ? 'Trending Videos' : 
                                 activeCategory === 'recent' ? 'Recent Videos' : 'All Videos'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {displayVideos.length} 
                                {displayVideos.length === 1 ? ' video' : ' videos'} available
                            </p>
                        </div>
                        <button
                            className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm md:hidden mt-4 md:mt-0"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <BiFilter className="w-5 h-5" />
                            <span>Filter & Sort</span>
                            <FiChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    
                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchInputValue}
                                onChange={(e) => setSearchInputValue(e.target.value)}
                                placeholder="Search videos by title or description..."
                                className="block w-full pl-10 pr-24 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                                <button
                                    type="submit"
                                    className="px-4 font-medium text-sm inline-flex items-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className={`lg:block bg-white dark:bg-gray-800 rounded-xl shadow p-6 h-fit ${isFilterOpen ? 'block' : 'hidden'}`}>
                        {/* Categories */}
                        <div className="mb-6">
                            <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                <BiCategory className="mr-2" /> Categories
                            </h3>
                            <div className="space-y-2">
                                {['featured', 'recent', 'trending'].map((category) => (
                                    <button
                                        key={category}
                                        className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                            activeCategory === category
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleCategoryChange(category)}
                                    >
                                        {category === 'featured' && <FaSortAmountDown className="inline mr-2" />}
                                        {category === 'recent' && <FaRegClock className="inline mr-2" />}
                                        {category === 'trending' && <FaFire className="inline mr-2" />}
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Sort options */}
                        <div>
                            <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                <FaSortAmountDown className="mr-2" /> Sort By
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { id: 'newest', name: 'Most Recent' },
                                    { id: 'views', name: 'Most Popular' }
                                ].map((sort) => (
                                    <button
                                        key={sort.id}
                                        className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                            filters.sortBy === sort.id
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => handleSortChange(sort.id)}
                                    >
                                        {sort.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Videos Grid */}
                    <div className="lg:col-span-3">
                        {status === 'failed' && (
                            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6">
                                <p>Error loading videos: {error}</p>
                            </div>
                        )}
                        
                        {isLoading ? (
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
                                            className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                                                currentPage === 1
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
                                                    className={`w-10 h-10 rounded-lg ${
                                                        currentPage === i + 1
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
                                            className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                                                currentPage === totalPages
                                                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            Next <FiChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideosPage;