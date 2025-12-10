const CACHE_NAME = 'expense-tracker-v20251209222800';
// Temporarily disable caching to force fresh loads
const urlsToCache = [];
  "images/logo.png"
];


self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", (event) => {
  // Clear old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Proxy OpenAI API requests through CORS-anywhere or direct with proper headers
  if (url.hostname === 'api.openai.com') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request, {
            mode: 'cors',
            credentials: 'omit'
          });
          return response;
        } catch (error) {
          console.error('OpenAI API fetch failed:', error);
          throw error;
        }
      })()
    );
    return;
  }
  
  // Network first, then cache strategy for API calls
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    // Cache first for static assets
    event.respondWith(
      caches.match(event.request).then((response) => response || fetch(event.request))
    );
  }
});