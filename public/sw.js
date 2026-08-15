const CACHE_NAME = 'caremart-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA cache addAll fallback:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network First with Cache Fallback for navigation and static assets)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude non-GET and firestore / external API calls from service worker cache interference
  if (event.request.method !== 'GET' || url.protocol.startsWith('chrome-extension') || url.hostname.includes('firestore.googleapis.com') || url.hostname.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // Stale-While-Revalidate / Network First for HTML and Static Assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
          return new Response('Network offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
