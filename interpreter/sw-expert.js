// VIA-L / VIA-L EXPERT — service worker (PWA: устанавливаемость + офлайн-оболочка).
// ОДИН воркер на оба тарифа НАМЕРЕННО: scope у обоих один (/interpreter/), а два разных
// service worker'а один scope делить не могут — второй просто вытеснит первый и сломает
// уже установленный EXPERT. Имя файла не меняем по той же причине (сохранённые PWA его помнят).
// БЕЗОПАСНО для остальных соседей в /interpreter/: перехватываем навигацию ТОЛЬКО на эти две
// страницы (index.html, methodology.html и пр. — мимо). POST/cross-origin не трогаем.
const CACHE = 'vial-expert-v6';   // bump при смене иконок/оболочки → сбрасывает старый кэш
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

// ══════════════════════════════════════════════════════════════════════
// УТРЕННЕЕ НАПОМИНАНИЕ (Web Push) — только EXPERT-PWA, но код общий для обоих
// тарифов: service worker на /interpreter/ один, и разводить его нельзя.
//
// ⚠️ ПУШ ПРИХОДИТ ПУСТЫМ. Сервер намеренно не шлёт ни слова: надпись видна на
// заблокированном экране посторонним, а приложение — про менопаузу и андропаузу.
// Текст берём здесь, на устройстве, из нейтрального словаря: ни здоровья, ни
// имени, ни цифр. Ничего, что выдало бы человека помимо его воли.
// Язык кладёт страница в Cache под ключом vial-nt-lang (в SW нет localStorage).
// ══════════════════════════════════════════════════════════════════════
const NT_TXT = {
  ru:{t:'Доброе утро',b:'Отметьте, как прошла ночь'},
  uk:{t:'Доброго ранку',b:'Відмітьте, як минула ніч'},
  en:{t:'Good morning',b:'Note how your night went'},
  es:{t:'Buenos días',b:'Anota cómo fue tu noche'},
  de:{t:'Guten Morgen',b:'Halte fest, wie die Nacht war'},
  pt:{t:'Bom dia',b:'Anote como foi sua noite'},
  fr:{t:'Bonjour',b:'Notez comment s’est passée la nuit'},
  pl:{t:'Dzień dobry',b:'Zaznacz, jak minęła noc'},
  it:{t:'Buongiorno',b:'Segna com’è andata la notte'},
  he:{t:'בוקר טוב',b:'סמנו איך עבר הלילה'},
  ja:{t:'おはようございます',b:'夜の様子を記録しましょう'},
  ko:{t:'좋은 아침이에요',b:'간밤이 어땠는지 기록해요'}
};
async function ntLang(){
  // caches.match без имени ищет во ВСЕХ кэшах: страница могла положить ключ при прошлой
  // версии CACHE, и привязка к текущему имени молча вернула бы уведомления к английскому.
  try{
    const r = await caches.match('vial-nt-lang');
    if(r){ const v = (await r.text()).trim(); if(NT_TXT[v]) return v; }
  }catch(e){}
  return 'en';
}
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    const t = NT_TXT[await ntLang()] || NT_TXT.en;
    await self.registration.showNotification(t.t, {
      body: t.b,
      icon: './pwa/icon-192.png',
      badge: './pwa/icon-192.png',
      tag: 'vial-morning',        // один и тот же тег: вчерашнее не копится на экране
      renotify: false,
      data: { url: './' + EXPERT }
    });
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const url = (e.notification.data && e.notification.data.url) || ('./' + EXPERT);
    const abs = new URL(url, self.location.href).href;
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) { if (w.url.indexOf(EXPERT) >= 0 || w.url.indexOf(BASE) >= 0) return w.focus(); }
    return self.clients.openWindow(abs);
  })());
});
