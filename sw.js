const CACHE = 'gold-analyzer-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // للـ WebSocket والـ APIs — لا تخزنها
  if(e.request.url.startsWith('ws') || e.request.url.includes('api') || e.request.url.includes('twelvedata') || e.request.url.includes('finnhub')){
    return;
  }
  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if(cached) return cached;
        return fetch(e.request)
          .then(res => {
            if(!res || res.status !== 200) return res;
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
            return res;
          })
          .catch(() => caches.match('/index.html'));
      })
  );
});