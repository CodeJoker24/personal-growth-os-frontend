// Minimal service worker: network-first with a runtime cache fallback.
// This is intentionally simple (no build-time precaching) so it works without
// any extra tooling - it just means "first visit needs internet, repeat visits
// to already-seen pages/assets work offline."

const CACHE_NAME = 'pgos-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never cache API calls - they're user-specific and need to stay live.
  if (request.url.includes('/api/')) return;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
