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

// // Fetch event: Serve cached content if offline
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });
