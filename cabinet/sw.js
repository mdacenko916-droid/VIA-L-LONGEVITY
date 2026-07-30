// VIA·L Cabinet — service worker (PWA: устанавливаемость + офлайн-оболочка).
// Безопасно: POST (API) и cross-origin (воркер-API, шрифты) НЕ трогаем.
const CACHE = 'vial-cabinet-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // не вмешиваемся в API-запросы (POST)
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;             // воркер-API/шрифты — мимо SW

  if (req.mode === 'navigate') {                          // HTML: свежий из сети, офлайн → кеш
    e.respondWith(
      fetch(req).then(r => { const cc = r.clone(); caches.open(CACHE).then(c => c.put(req, cc)); return r; })
        .catch(() => caches.match(req).then(m => m || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(req).then(m => m || fetch(req)));   // прочее same-origin — cache-first
});
