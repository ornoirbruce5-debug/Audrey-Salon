/* service-worker.js
  - Simple offline cache strategy (static assets + fallback page)
  - Tailored for GitHub Pages: scope root
*/

const CACHE_NAME = 'broskie-salon-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './products.js',
  './jokes.js',
  './manifest.json',
  // Placeholder assets (uzishyireho koko muri repo)
  './assets/fallback.jpg',
  './assets/beauty-bg.mp4',
  './assets/whatsapp-qr.png',
  './assets/salon-qr.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Network-first for HTML to get latest; cache-first for others
  if (req.destination === 'document') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((res) => res || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
      return res;
    }).catch(() => {
      // Fallback image for media
      if (req.destination === 'image') return caches.match('./assets/fallback.jpg');
      return new Response('', { status: 200 });
    }))
  );
});
