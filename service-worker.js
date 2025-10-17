// Service Worker for MusicListener6000
const CACHE_NAME = 'musiclistener6000-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/app.css',
  '/css/bootstrap.min.css',
  '/css/bootstrap-grid.min.css',
  '/css/bootstrap-utilities.min.css',
  '/css/bootstrap-overrides.css',
  '/css/pages.css',
  '/css/mobile-optimized.css',
  '/css/library-vertical.css',
  '/css/album-covers-fix.css',
  '/js/bootstrap.bundle.min.js',
  '/js/bootstrap.min.js',
  '/js/library-tabs.js',
  '/img/app-icon.png',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/home-icon.png',
  '/img/library-icon.png',
  '/img/new-icon.png',
  '/img/radio-icon.png',
  '/img/search-icon.png',
  '/img/default-cover.png',
  '/img/default-profile.png',
  '/pages/home.html',
  '/pages/library.html',
  '/pages/album.html',
  '/pages/search.html',
  '/pages/now-playing.html'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then(
          response => {
            // Return the original response if not valid for caching
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
  );
});