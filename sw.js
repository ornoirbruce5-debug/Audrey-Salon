/* service-worker.js
   - Offline cache strategy (static assets + fallback page)
   - Tailored for GitHub Pages: scope root
*/

const CACHE_NAME = 'broskie-salon-v2';
const ASSETS = [
  '/',                // root
  '/index.html',
  '/style.css',
  '/main.js',
  '/products.js',
  '/jokes.js',
  '/manifest.json',
  '/offline.html',    // add offline fallback page
  '/assets/fallback.jpg',
  '/assets/beauty-bg.mp4',
  '/assets/whatsapp-qr.png',
  '/assets/salon-qr.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(ASSETS.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Network-first for HTML
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() =>
        caches.match(req).then(res => res || caches.match('/offline.html'))
      )
    );
    return;
  }

  // Stale-while-revalidate for other assets
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => {
        if (req.destination === 'image') return caches.match('/assets/fallback.jpg');
        return cached;
      });
      return cached || fetchPromise;
    })
  );
});
