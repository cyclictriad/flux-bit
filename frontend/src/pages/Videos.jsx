import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVideos, setSearchTerm, setFilter, setPage, setActiveCategory } from '../store/features/videosSlice';
import { BiFilter, BiSearch } from 'react-icons/bi';
import { FiChevronDown, } from 'react-icons/fi';
import AdvancedSearch from '../components/bar/AdvancedSearch';
import VideosGrid from '../components/video/Grid';


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
        pagination,
        activeCategory,
        searchTerm,
        filters,
        status,
        error,
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
                    <AdvancedSearch handleCategoryChange={handleCategoryChange} filters={filters} activeCategory={activeCategory} handleSortChange={handleSortChange} isFilterOpen={isFilterOpen} />
                    <VideosGrid status={status} handlePageChange={handlePageChange} pagination={pagination} searchTerm={searchTerm} error={error} activeCategory={activeCategory} displayVideos={displayVideos} />
                </div>

            </div>
        </div>
    );
};

export default VideosPage;