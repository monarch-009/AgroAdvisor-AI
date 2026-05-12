// Service worker for AgroAdvisor AI
// This is a placeholder to prevent 404 errors in development.

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass-through
  event.respondWith(fetch(event.request));
});
