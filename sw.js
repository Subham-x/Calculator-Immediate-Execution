const CACHE_NAME = 'calc-cache-v1';
const FILES_TO_CACHE = [
  './',
  'index.html',
  'Calc_Immediate.html',
  'manifest.json'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);
  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  evt.respondWith(
    caches.match(evt.request).then((resp) => {
      return resp || fetch(evt.request).then((response) => {
        // Cache GET responses
        if (evt.request.method === 'GET' && response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, copy));
        }
        return response;
      }).catch(() => caches.match('index.html'));
    })
  );
});