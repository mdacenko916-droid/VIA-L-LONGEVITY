// VIA-L / VIA-L EXPERT — service worker (PWA: устанавливаемость + офлайн-оболочка).
// ОДИН воркер на оба тарифа НАМЕРЕННО: scope у обоих один (/interpreter/), а два разных
// service worker'а один scope делить не могут — второй просто вытеснит первый и сломает
// уже установленный EXPERT. Имя файла не меняем по той же причине (сохранённые PWA его помнят).
// БЕЗОПАСНО для остальных соседей в /interpreter/: перехватываем навигацию ТОЛЬКО на эти две
// страницы (index.html, methodology.html и пр. — мимо). POST/cross-origin не трогаем.
const CACHE = 'vial-expert-v4';   // bump при смене иконок/оболочки → сбрасывает старый кэш
const EXPERT = 'interpreter-via-l-expert.html';
const BASE = 'interpreter-via-l.html';   // базовый тариф VIA-L — своя иконка/манифест, тот же механизм
// HTML НЕ предкэшируем: iOS-PWA любит отдавать закэшированную страницу при запуске
// и не обновляться. Кэшируем только статику (иконки/манифест); HTML — всегда network-first.
const SHELL = [
  './via-l-expert.webmanifest',
  './pwa/icon-192.png',
  './pwa/icon-512.png',
  './pwa/apple-touch-icon.png',
  './via-l.webmanifest',
  './pwa/vial-icon-192.png',
  './pwa/vial-icon-512.png',
  './pwa/vial-apple-touch-icon.png'
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
  const isBase = url.pathname.endsWith(BASE);        // endsWith(BASE) не ловит EXPERT: имена не суффиксы друг друга

  if (req.mode === 'navigate') {
    if (!isExpert && !isBase) return;                // чужие страницы — не перехватываем
    e.respondWith(                                   // наша страница: свежая из сети, офлайн → кеш
      // cache:'no-cache' — в обход HTTP-кэша (GitHub Pages: max-age=600 → перезапуск в
      // течение 10 мин отдавал старьё, «правки не доезжают»). При неизменном файле это 304.
      fetch(req, { cache: 'no-cache' })
        .then(r => { const cc = r.clone(); caches.open(CACHE).then(c => c.put(req, cc)); return r; })
        .catch(() => caches.match('./' + (isExpert ? EXPERT : BASE)))
    );
    return;
  }
  // Прочие same-origin GET: отдаём из кеша только наши shell-ассеты (иконки/манифест), иначе сеть.
  e.respondWith(caches.match(req).then(m => m || fetch(req)));
});
