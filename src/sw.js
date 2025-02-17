// JohnF-code Jajajaja
// /sw.js

importScripts('/sync/syncManager.js');

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-clients') {
    event.waitUntil(syncClients());
  }
});

self.addEventListener('fetch', (event) => {
  // Cachear solo assets estáticos
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
