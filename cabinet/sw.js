// VIA·L Cabinet — service worker (PWA: устанавливаемость + офлайн-оболочка).
// Безопасно: POST (API) и cross-origin (воркер-API, шрифты) НЕ трогаем.
const CACHE = 'vial-cabinet-v6';
const META  = 'vial-cab-meta';   // секрет пуша (peek) и адрес API — переживает смену версии кэша
const SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== META).map(k => caches.delete(k))))
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

// ── Пуш специалисту о сообщении клиента (2026-09-25, docs/CABINET-PUSH-MOBILE-PLAN.md) ──
// Пуш приходит БЕЗ тела: на серверах Apple/Google ни слова о клиенте. Надпись берём у нашего
// сервера по секрету подписки (peek): имя клиента и вид сообщения — ничего о здоровье.
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'vial-push' && d.peek) {
    e.waitUntil(caches.open(META).then(c => c.put('/__push', new Response(JSON.stringify({ peek: d.peek, api: d.api, lang: d.lang })))));
  }
});
async function _meta() {
  try { const r = await (await caches.open(META)).match('/__push'); return r ? await r.json() : null; } catch (_) { return null; }
}
const _PT = {
  ru:{t:'Новое сообщение',m:'новое сообщение',p:'фото',v:'голосовое',g:'Клиент написал вам',more:'ещё {n}'},
  uk:{t:'Нове повідомлення',m:'нове повідомлення',p:'фото',v:'голосове',g:'Клієнт написав вам',more:'ще {n}'},
  en:{t:'New message',m:'new message',p:'photo',v:'voice message',g:'A client wrote to you',more:'+{n} more'},
  es:{t:'Mensaje nuevo',m:'mensaje nuevo',p:'foto',v:'mensaje de voz',g:'Un cliente te escribió',more:'+{n} más'},
  de:{t:'Neue Nachricht',m:'neue Nachricht',p:'Foto',v:'Sprachnachricht',g:'Ein Klient hat dir geschrieben',more:'+{n} weitere'},
  pt:{t:'Nova mensagem',m:'nova mensagem',p:'foto',v:'mensagem de voz',g:'Um cliente escreveu para você',more:'+{n} mais'},
  fr:{t:'Nouveau message',m:'nouveau message',p:'photo',v:'message vocal',g:'Un client vous a écrit',more:'+{n} autres'},
  pl:{t:'Nowa wiadomość',m:'nowa wiadomość',p:'zdjęcie',v:'wiadomość głosowa',g:'Klient do Ciebie napisał',more:'+{n} więcej'},
  it:{t:'Nuovo messaggio',m:'nuovo messaggio',p:'foto',v:'messaggio vocale',g:'Un cliente ti ha scritto',more:'altri {n}'},
  he:{t:'הודעה חדשה',m:'הודעה חדשה',p:'תמונה',v:'הודעה קולית',g:'לקוח כתב לך',more:'ועוד {n}'},
  ja:{t:'新しいメッセージ',m:'新しいメッセージ',p:'写真',v:'音声メッセージ',g:'クライアントからメッセージ',more:'他{n}件'},
  ko:{t:'새 메시지',m:'새 메시지',p:'사진',v:'음성 메시지',g:'고객이 메시지를 보냈습니다',more:'외 {n}건'},
};
// Разовый разбор (docs/SPECIALIST-REVIEW-PLAN.md): оплачен · срок продлён на 48 ч · срок истёк.
const _RT = {
  ru:{t:'Разовый разбор',n:'оплачен, ответить в течение 48 часов',l:'срок продлён на 48 часов',o:'срок ответа истёк'},
  uk:{t:'Разовий розбір',n:'оплачено, відповісти протягом 48 годин',l:'термін продовжено на 48 годин',o:'термін відповіді минув'},
  en:{t:'One-off review',n:'paid, reply within 48 hours',l:'deadline extended by 48 hours',o:'reply deadline has passed'},
  es:{t:'Revisión única',n:'pagada, responder en 48 horas',l:'plazo ampliado 48 horas',o:'el plazo de respuesta ha vencido'},
  de:{t:'Einmalige Auswertung',n:'bezahlt, Antwort innerhalb von 48 Stunden',l:'Frist um 48 Stunden verlängert',o:'Antwortfrist abgelaufen'},
  pt:{t:'Análise avulsa',n:'paga, responder em 48 horas',l:'prazo prorrogado por 48 horas',o:'o prazo de resposta expirou'},
  fr:{t:'Analyse ponctuelle',n:'payée, répondre sous 48 heures',l:'délai prolongé de 48 heures',o:'délai de réponse dépassé'},
  pl:{t:'Jednorazowa analiza',n:'opłacona, odpowiedz w ciągu 48 godzin',l:'termin przedłużony o 48 godzin',o:'termin odpowiedzi minął'},
  it:{t:'Analisi singola',n:'pagata, rispondere entro 48 ore',l:'scadenza prorogata di 48 ore',o:'termine di risposta scaduto'},
  he:{t:'סקירה חד-פעמית',n:'שולמה, יש להשיב תוך 48 שעות',l:'המועד הוארך ב-48 שעות',o:'מועד התשובה חלף'},
  ja:{t:'単発レビュー',n:'支払い済み、48時間以内に回答',l:'期限を48時間延長',o:'回答期限を過ぎました'},
  ko:{t:'1회 리뷰',n:'결제 완료, 48시간 내 답변',l:'기한 48시간 연장',o:'답변 기한이 지났습니다'},
};
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    const m = await _meta();
    const L = _PT[(m && m.lang) || 'ru'] || _PT.ru;
    let title = L.t, body = L.g, code = '';
    if (m && m.peek && m.api) {
      try {
        const j = await (await fetch(m.api + '/cabinet/push-peek?t=' + encodeURIComponent(m.peek))).json();
        const R = _RT[(m && m.lang) || 'ru'] || _RT.ru;
        const rk = j && j.ok && j.code && { review: R.n, review_late: R.l, review_overdue: R.o }[j.kind];
        if (rk) {
          code = j.code; title = R.t; body = (j.name || '') + ' — ' + rk;
        } else if (j && j.ok && j.code) {
          code = j.code;
          body = (j.name || '') + ' — ' + (j.kind === 'audio' ? L.v : j.kind === 'image' ? L.p : L.m);
          if (j.total > 1) body += ' · ' + L.more.replace('{n}', j.total - 1);
        }
        // ⚠️ Показывать уведомление на КАЖДЫЙ пуш обязательно: iOS после нескольких «пустых» пушей
        // отзывает разрешение, Chrome показывает своё «сайт обновлён в фоне».

      } catch (_) { /* нет сети — покажем нейтральное «Клиент написал вам» */ }
    }
    await self.registration.showNotification(title, {
      body, tag: 'vial-chat', renotify: true, data: { code },
      icon: 'icon.svg', badge: 'icon.svg',
    });
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const code = (e.notification.data || {}).code || '';
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.indexOf('/cabinet/') >= 0) { w.postMessage({ type: 'vial-open', code }); return w.focus(); }
    }
    return self.clients.openWindow('./' + (code ? '?open=' + encodeURIComponent(code) : ''));
  })());
});
