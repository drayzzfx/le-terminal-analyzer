const CACHE_NAME = 'lt-cache-v4';
const ASSETS_TO_CACHE = [
  './app.html',
  './calculateur.html',
  './bubble.html',
  './menu.js',
  './design-system.css',
  './logo.jpg.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    )).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Pages HTML : toujours réseau (jamais de cache pour les pages de navigation)
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  // Assets statiques : cache-first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request);
    })
  );
});
