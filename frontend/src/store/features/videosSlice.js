import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { fetchVideos as fetchVideosApi } from '../../api/videoApi';
import Fuse from 'fuse.js';

/**
 * Initial state for the videos slice
 */
const initialState = {
  // Video collections
  items: [], // All fetched videos
  filteredItems: [], // Videos after filtering
  
  // API request state
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  
  // Pagination state by category
  pagination: {
    search: { current: 1, total: 1 },
    trending: { current: 1, total: 1 },
    recent: { current: 1, total: 1 },
    featured: { current: 1, total: 1 }
  },
  
  // Search and filter state
  searchTerm: '',
  filters: {
    category: 'all',
    duration: 'all',
    sortBy: 'newest'
  },
  
  // Current active category
  activeCategory: 'featured', // 'featured' | 'trending' | 'recent' | 'search'

  //current videoDetails
  currentVideoId: null,  // Stores the current video ID
  relatedVideos: [],  // Stores related videos
};

/**
 * Async thunk for fetching videos based on current state
 */
export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async ({ category }, { getState, rejectWithValue }) => {
    try {
      const state = getState().videos;
      const currentPage = state.pagination[category || state.activeCategory].current;
      
      // Prepare query parameters
      const params = {
        page: currentPage,
        limit: 12,
        category: state.filters.category !== 'all' ? state.filters.category : undefined,
        sortBy: state.filters.sortBy
      };
      
      // Add search term for search queries
      if (category === 'search' || (!category && state.activeCategory === 'search')) {
        params.search = state.searchTerm;
      }
      
      // Special case for featured videos (less than 1 hour ago)
      if (category === 'featured' || (!category && state.activeCategory === 'featured')) {
        params.timeframe = '1h';
      }
      
      // Special case for trending videos
      if (category === 'trending' || (!category && state.activeCategory === 'trending')) {
        params.sortBy = 'views';
      }
      
      // Special case for recent videos
      if (category === 'recent' || (!category && state.activeCategory === 'recent')) {
        params.sortBy = 'newest';
      }
      
      const response = await fetchVideosApi(params);

      return { data: response, category: category || state.activeCategory };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch videos');
    }
  }
);

/**
 * Videos slice with reducers and extra reducers
 */
const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    /**
     * Set the search term and reset pagination
     */
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
      state.pagination.search.current = 1;
      state.activeCategory = 'search';
    },
    
    /**
     * Update filters and reset pagination for the active category
     */
    setFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination[state.activeCategory].current = 1;
    },
    
    /**
     * Set the current page for the specified category
     */
    setPage(state, action) {
      const { category, page } = action.payload;
      state.pagination[category].current = page;
    },
    
    /**
     * Set the active category
     */
    setActiveCategory(state, action) {
      state.activeCategory = action.payload;
    },

    setCurrentVideoId(state, action) {
      state.currentVideoId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        const { data, category } = action.payload;
        
        state.status = 'succeeded';
        state.items = data;
        state.filteredItems = data;
        state.pagination[category].total = data.totalPages;
        
        // If we're in search mode, store the filtered results
        if (category === 'search' && state.searchTerm) {
          state.filteredItems = data;
        }
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});




// Configure Fuse.js for pattern matching
const fuseOptions = {
  keys: ['title', 'description'],
  threshold: 0.3, // Adjust similarity sensitivity (0 = strict, 1 = loose)
};




// Base selector to get videos array
const selectVideos = (state) => {
  return state.videos?.items || [];
}

// Selector to get current video ID
const selectCurrentVideoId = (state) => state.videos?.currentVideoId;

export const getCurrentVideoDetails = createSelector(
  [selectVideos, selectCurrentVideoId],
  (videos, currentVideoId) => {
    return videos.find(v => v._id === currentVideoId) || null
  }
);


// Memoized selector for related videos
export const getRelatedVideos = createSelector(
  [selectVideos, getCurrentVideoDetails],
  (videos, currentVideo) => {

    if (!currentVideo) return [];

    const fuse = new Fuse(
      videos.filter((v) => v._id !== currentVideo._id), 
      fuseOptions
    );

    return fuse.search(currentVideo.title + " " + currentVideo.description)
      .map((result) => result.item);
  }
);


// Memoized selector for featured videos
export const selectFeaturedVideos = createSelector(
  [selectVideos],
  (items) => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return items.filter(video => 
      new Date(video.cloudinary?.createdAt).getTime() > oneHourAgo
    );
  }
);

// Memoized selector for trending videos
export const selectTrendingVideos = createSelector(
  [selectVideos],
  (items) =>
    [...items].sort((a, b) => b.metadata.views - a.metadata.views).slice(0, 4)
);

// Memoized selector for recent videos
export const selectRecentVideos = createSelector(
  [selectVideos],
  (items) =>
    [...items]
      .sort((a, b) => 
        new Date(b.cloudinary?.createdAt).getTime() - 
        new Date(a.cloudinary?.createdAt).getTime()
      )
      .slice(0, 4)
);


// Export actions
export const { 
  setSearchTerm, 
  setFilter, 
  setPage, 
  setActiveCategory,
  setCurrentVideoId 
} = videosSlice.actions;

export default videosSlice.reducer;