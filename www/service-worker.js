const CACHE_NAME = 'expense-tracker-v20251208000500';
const urlsToCache = [
  "index.html", 
  "style.css", 
  "app.js", 
  "sync-manager.js",
  "theme-manager.js",
  "paywall-manager.js",
  "onboarding.js",
  "voiceIntelligence.js",
  "currencyService.js",
  "aiService.js",
  "receipt-scanner.js",
  "budget-manager.js",
  "csv-importer.js",
  "subscription-detector.js",
  "export-manager.js",
  "supabaseClient.js",
  "auth.js",
  "manifest.json",
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
  // Network first, then cache strategy for API calls
  if (event.request.url.includes('supabase.co')) {
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