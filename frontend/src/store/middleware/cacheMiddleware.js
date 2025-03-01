import { cacheService } from '../../services/cache';

// Actions that should be cached
const CACHEABLE_ACTIONS = [
    'videos/fetchVideos/fulfilled',
    'player/loadVideoDetails/fulfilled'
];

// Create the middleware
export const cacheMiddleware = store => next => async action => {
    // Let the action go through first
    const result = next(action);

    // If it's a cacheable fulfilled action, store in cache
    if (CACHEABLE_ACTIONS.includes(action.type) && action.payload) {
        const cacheKey = `${action.type}_${JSON.stringify(action.meta?.arg || '')}`;
        await cacheService.set(cacheKey, action.payload);
        console.log(`Cached action result: ${action.type}`);
    }

    return result;
};