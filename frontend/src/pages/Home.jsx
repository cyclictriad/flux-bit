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
  
  // Get dark mode setting from UI state
  const darkMode = useSelector(state => state.ui.darkMode);

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
    <main className={`min-h-screen ${darkMode ? 'bg-black text-gray-100' : 'bg-gray-50 text-gray-900'} transition-all duration-300`}>
      {/* Hero Section with Immersive Design */}
      <section className="relative overflow-hidden" style={{height: "90vh", maxHeight: "700px"}}>
        {/* Video or Image Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-violet-900/90 via-indigo-900/80 to-black' : 'bg-gradient-to-br from-blue-600/90 via-indigo-500/80 to-purple-800'}`}></div>
          
          {/* Abstract shapes for modern look */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600 mix-blend-overlay opacity-60 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-purple-600 mix-blend-overlay opacity-40 blur-3xl animate-pulse" style={{animationDuration: '7s'}}></div>
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-6 h-full flex flex-col justify-center">
          <div className="max-w-2xl text-white" style={{textShadow: '0 2px 10px rgba(0,0,0,0.2)'}}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Extraordinary <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Content</span>
            </h1>
            <p className="text-xl mb-8 text-gray-100 max-w-lg">
              FluxBit elevates your streaming experience with premium content from visionary creators worldwide.
            </p>
            <Link to="/videos" className="inline-flex items-center bg-white text-indigo-800 px-8 py-4 rounded-full font-medium hover:bg-opacity-95 transition-all shadow-xl hover:shadow-blue-500/20 hover:scale-105">
              <FaPlay className="mr-2" /> Start Exploring
            </Link>
          </div>
        </div>
      </section>

      {/* Content Sections with Modern Styling */}
      <section className={`${darkMode ? 'bg-gray-900' : 'bg-white'} py-16 transition-colors duration-300`}>
        <div className="container mx-auto px-6">
          {/* Section Divider with Accent */}
          <div className="w-full flex items-center justify-center mb-16">
            <div className="h-px w-full max-w-sm bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>
          
          <VideoSection 
            title="Featured Videos" 
            icon={<FaStar className="text-yellow-500" />} 
            videos={featuredVideos} 
            isLoading={isLoading}
            onViewAll={() => navigateToCategory('featured')}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
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
      
      {/* Bottom wave separator */}
      <div className={`w-full h-24 ${darkMode ? 'text-gray-900' : 'text-white'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full">
          <path fill="currentColor" fillOpacity="1" d="M0,224L60,213.3C120,203,240,181,360,186.7C480,192,600,224,720,229.3C840,235,960,213,1080,202.7C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
    </main>
  );
};

// Add CSS for animations
const styles = `
@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.05); }
}

.animate-pulse {
  animation: pulse 5s infinite ease-in-out;
}
`;

// Insert styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default HomePage;