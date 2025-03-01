// Install event: Cache static assets for offline use
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('video-app-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/logo192.png'
        ]);
      })
    );
    console.log('Service Worker Installed');
  });
  
  // Activate event: Cleanup old caches
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== 'video-app-cache') {
              return caches.delete(cache);
            }
          })
        );
      })
    );
    console.log('Service Worker Activated');
  });
  

  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 🚀 Skip caching for API requests (uploads, dynamic data)
    if (url.pathname.includes('/upload') || url.pathname.startsWith('/api')) {
        return;
    }

    // 🚀 Ensure React files are always fetched fresh
    if (event.request.mode === 'navigate') {
        event.respondWith(fetch(event.request)); 
        return;
    }

    // Fallback to cache for other requests
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

  