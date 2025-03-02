import { configureStore } from '@reduxjs/toolkit';
import videosReducer from './features/videosSlice';
import playerReducer from './features/playerSlice';
import uiReducer from './features/uiSlice';
import uploadsSlice from './features/uploadsSlice';
import toastsSlice from './features/toastsSlice';
import { cacheMiddleware } from './middleware/cacheMiddleware';

export const store = configureStore({
    reducer: {
        videos: videosReducer,
        player: playerReducer,
        ui: uiReducer,
        uploads: uploadsSlice,
        toasts: toastsSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(cacheMiddleware),
});