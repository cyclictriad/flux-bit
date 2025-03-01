import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaStar, FaFire, FaClock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVideos, setActiveCategory, selectFeaturedVideos, selectTrendingVideos, selectRecentVideos } from '../store/features/videosSlice';
import VideoSection from '../components/video/Section';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    status,
    pagination
  } = useSelector(state => state.videos);

  // Get videos for different categories
  const featuredVideos = useSelector(selectFeaturedVideos);
  const trendingVideos = useSelector(selectTrendingVideos);
  const recentVideos = useSelector(selectRecentVideos);

  // Loading states
  const isLoading = status === 'loading';

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchVideos({ category: 'featured' }));
  }, [dispatch]);

  // Handle category navigation
  const navigateToCategory = (category) => {
    dispatch(setActiveCategory(category));
    navigate(`/videos?category=${category}&page=${pagination[category].current}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-800 to-purple-900 flex items-center px-6">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Stream Your Favorite Content</h1>
          <p className="text-lg mb-8">FluxBit brings you a curated collection of high-quality videos from creators around the world.</p>
          <Link to="/videos" className="flex items-center bg-blue-500 px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition">
            <FaPlay className="mr-2" /> Browse Videos
          </Link>
        </div>
      </section>

      {/* Video Sections */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <VideoSection 
            title="Featured Videos" 
            icon={<FaStar className="text-yellow-500" />} 
            videos={featuredVideos} 
            isLoading={isLoading}
            onViewAll={() => navigateToCategory('featured')}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <VideoSection 
              title="Recent Uploads" 
              icon={<FaClock className="text-blue-500" />} 
              videos={recentVideos} 
              isLoading={isLoading}
              onViewAll={() => navigateToCategory('recent')}
            />
            <VideoSection 
              title="Trending Now" 
              icon={<FaFire className="text-red-500" />} 
              videos={trendingVideos} 
              isLoading={isLoading}
              onViewAll={() => navigateToCategory('trending')}
            />
          </div>
        </div>
      </section>
    </div>
  );
};



export default HomePage;