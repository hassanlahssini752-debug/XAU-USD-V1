const CACHE = 'gold-analyzer-v2';
const ASSETS = [
  '/XAU-USD-V1/',
  '/XAU-USD-V1/index.html',
  '/XAU-USD-V1/manifest.json',
  '/XAU-USD-V1/icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).catch(()=>{}))
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
  const url = e.request.url;
  if(url.includes('ws://') || url.includes('wss://') ||
     url.includes('twelvedata') || url.includes('finnhub') ||
     url.includes('api.metals') || url.includes('fonts.googleapis')) {
    return;
  }
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .then(res => {
          if(res && res.status === 200){
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match('/XAU-USD-V1/index.html'))
      )
  );
});
