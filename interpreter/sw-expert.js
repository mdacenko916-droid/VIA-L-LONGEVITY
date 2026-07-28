// VIA-L EXPERT — service worker (PWA: устанавливаемость + офлайн-оболочка).
// БЕЗОПАСНО для соседей в /interpreter/: трогаем ТОЛЬКО навигацию на саму EXPERT-страницу
// (базовый interpreter-via-l.html и пр. — не перехватываем). POST/cross-origin не трогаем.
const CACHE = 'vial-expert-v1';
const EXPERT = 'interpreter-via-l-expert.html';
const SHELL = [
  './' + EXPERT,
  './via-l-expert.webmanifest',
  './pwa/icon-192.png',
  './pwa/icon-512.png',
  './pwa/apple-touch-icon.png'
];

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
  if (req.method !== 'GET') return;                 // API (POST) не трогаем
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;       // воркер-API/шрифты/картинки CDN — мимо
  const isExpert = url.pathname.endsWith(EXPERT);

  if (req.mode === 'navigate') {
    if (!isExpert) return;                           // чужие страницы (базовый VIA-L) — не перехватываем
    e.respondWith(                                   // EXPERT: свежий из сети, офлайн → кеш
      fetch(req).then(r => { const cc = r.clone(); caches.open(CACHE).then(c => c.put(req, cc)); return r; })
        .catch(() => caches.match('./' + EXPERT))
    );
    return;
  }
  // Прочие same-origin GET: отдаём из кеша только наши shell-ассеты (иконки/манифест), иначе сеть.
  e.respondWith(caches.match(req).then(m => m || fetch(req)));
});
