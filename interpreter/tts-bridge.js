/* VIA·L — «Слушать разбор» голосом самого телефона (2026-10-03).
   В приложении — плагин @capacitor-community/text-to-speech (iOS: системный голос из
   Настройки → Универсальный доступ → Устный контент; Android: движок «Синтез речи»).
   В браузере — window.speechSynthesis. Ничего не уходит на сервер и ничего не стоит.

   Почему плагин, а не speechSynthesis везде: в Android WebView speechSynthesis нет вовсе.
   Android читает за раз не больше 4000 знаков, поэтому текст режется на куски ≤1500.
   category:'playback' — на iPhone звучит и при выключенном звуке звонка и при погашенном экране.

   Текст берётся из уже отрисованной карточки #aiResult (рендеров разбора несколько — так не надо
   трогать каждый): из клона выбрасываются кнопки, «На чём основано», пробная плашка, иконки, эмодзи. */
(function () {
  var MAX = 1500;
  var playing = false, runId = 0;

  function plug() {
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) || null;
  }
  function web() { return ('speechSynthesis' in window) ? window.speechSynthesis : null; }
  function available() { return !!(plug() || web()); }
  function curLang() { return (typeof lang !== 'undefined' && lang) ? lang : 'en'; }
  function locale() { return (typeof _locale === 'function') ? _locale() : 'en-GB'; }
  function tr(o) { return o[curLang()] || o.en; }

  var LBL_PLAY = { ru: 'Слушать', uk: 'Слухати', en: 'Listen', es: 'Escuchar', de: 'Anhören', pt: 'Ouvir', fr: 'Écouter', pl: 'Słuchaj', it: 'Ascolta', he: 'האזנה', ja: '読み上げ', ko: '듣기' };
  var LBL_STOP = { ru: 'Стоп', uk: 'Стоп', en: 'Stop', es: 'Detener', de: 'Stopp', pt: 'Parar', fr: 'Arrêter', pl: 'Zatrzymaj', it: 'Stop', he: 'עצירה', ja: '停止', ko: '정지' };
  var MSG_NOVOICE = {
    ru: 'На телефоне нет голоса для этого языка. Добавьте его в настройках телефона — раздел синтеза речи («Устный контент» на iPhone).',
    uk: 'На телефоні немає голосу для цієї мови. Додайте його в налаштуваннях телефона — розділ синтезу мовлення («Усний контент» на iPhone).',
    en: 'Your phone has no voice for this language. Add one in the phone settings — text-to-speech (Spoken Content on iPhone).',
    es: 'Tu teléfono no tiene voz para este idioma. Añádela en los ajustes del teléfono: síntesis de voz (Contenido leído en iPhone).',
    de: 'Dein Telefon hat keine Stimme für diese Sprache. Füge sie in den Telefoneinstellungen hinzu – Sprachausgabe (Gesprochene Inhalte am iPhone).',
    pt: 'Seu telefone não tem voz para este idioma. Adicione nos ajustes do telefone: síntese de voz (Conteúdo Falado no iPhone).',
    fr: 'Votre téléphone n’a pas de voix pour cette langue. Ajoutez-la dans les réglages : synthèse vocale (Contenu énoncé sur iPhone).',
    pl: 'Telefon nie ma głosu dla tego języka. Dodaj go w ustawieniach telefonu — synteza mowy (Mówienie zawartości na iPhonie).',
    it: 'Il telefono non ha una voce per questa lingua. Aggiungila nelle impostazioni: sintesi vocale (Contenuto letto su iPhone).',
    he: 'אין בטלפון קול לשפה הזו. אפשר להוסיף אותו בהגדרות הטלפון — הקראת טקסט (תוכן מוקרא ב-iPhone).',
    ja: 'このスマートフォンにはこの言語の音声がありません。設定の読み上げ(iPhoneでは「読み上げコンテンツ」)から追加してください。',
    ko: '휴대폰에 이 언어의 음성이 없습니다. 휴대폰 설정의 텍스트 음성 변환(iPhone은 ‘음성 콘텐츠’)에서 추가해 주세요.'
  };

  // ── текст разбора из карточки ──
  function speechText() {
    var r = document.getElementById('aiResult');
    if (!r || r.style.display === 'none') return '';
    var c = r.cloneNode(true);
    c.querySelectorAll('button,.vial-ev,.trial-offer-wrap,.ai-sec-pill-row,img,script,style,[aria-hidden="true"],[onclick^="_iapOpen"]')
      .forEach(function (el) { el.remove(); });
    c.querySelectorAll('br').forEach(function (el) { el.replaceWith('\n'); });
    c.querySelectorAll('p,div,li,h1,h2,h3,h4').forEach(function (el) { el.appendChild(document.createTextNode('\n')); });
    var t = (c.textContent || '')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{2610}-\u{2612}]/gu, '')
      .replace(/[*_#`]+/g, '');
    return t.split('\n')
      .map(function (l) { return l.replace(/^[\s•·\-–—]+/, '').replace(/\s+/g, ' ').replace(/\s+([.,!?…:;])/g, '$1').trim(); })
      .filter(Boolean)
      .map(function (l) { return /[.!?…:;。！？]$/.test(l) ? l : l + '.'; })
      .join('\n');
  }
  function chunks(text) {
    var out = [], cur = '';
    text.split('\n').forEach(function (line) {
      while (line.length > MAX) {                       // длинный абзац — по предложениям
        var cut = line.lastIndexOf('. ', MAX); if (cut < 200) cut = MAX;
        push(line.slice(0, cut + 1)); line = line.slice(cut + 1).trim();
      }
      push(line);
    });
    if (cur) out.push(cur);
    return out;
    function push(s) {
      if (!s) return;
      if (cur && (cur.length + s.length + 1) > MAX) { out.push(cur); cur = ''; }
      cur = cur ? cur + ' ' + s : s;
    }
  }

  // ── движок ──
  async function speakNative(parts, my) {
    var p = plug(), lc = locale();
    try {
      var s = await p.isLanguageSupported({ lang: lc });
      if (s && s.supported === false) { note(tr(MSG_NOVOICE)); try { if (p.openInstall) p.openInstall(); } catch (e) {} return; }
    } catch (e) {}
    for (var i = 0; i < parts.length; i++) {
      if (my !== runId) return;
      try { await p.speak({ text: parts[i], lang: lc, rate: 1.0, category: 'playback' }); }
      catch (e) { if (my === runId && i === 0) note(tr(MSG_NOVOICE)); return; }
    }
  }
  function speakWeb(parts, my) {
    var ss = web(), lc = locale(), pre = lc.slice(0, 2);
    var v = (ss.getVoices() || []).filter(function (x) { return (x.lang || '').replace('_', '-').slice(0, 2) === pre; });
    var exact = v.filter(function (x) { return (x.lang || '').replace('_', '-') === lc; });
    if (ss.getVoices().length && !v.length) { note(tr(MSG_NOVOICE)); return Promise.resolve(); }
    return new Promise(function (res) {
      var i = 0;
      (function next() {
        if (my !== runId || i >= parts.length) return res();
        var u = new SpeechSynthesisUtterance(parts[i++]);
        u.lang = lc; if (exact[0] || v[0]) u.voice = exact[0] || v[0];
        u.onend = next; u.onerror = function () { res(); };
        ss.speak(u);
      })();
    });
  }

  function stop() {
    runId++; playing = false;
    try { var p = plug(); if (p) p.stop(); else if (web()) web().cancel(); } catch (e) {}
    paint();
  }
  async function start() {
    var text = speechText(); if (!text) return;
    note('');
    var my = ++runId; playing = true; paint();
    var parts = chunks(text);
    try { if (plug()) await speakNative(parts, my); else if (web()) await speakWeb(parts, my); } catch (e) {}
    if (my === runId) { playing = false; paint(); }
  }

  // ── кнопка в шапке карточки разбора ──
  function btn() { return document.getElementById('ai-tts'); }
  function note(msg) {
    var b = btn(); if (!b) return;
    var n = document.getElementById('ai-tts-msg');
    if (!n) { n = document.createElement('div'); n.id = 'ai-tts-msg'; n.className = 'ai-tts-msg'; var h = b.closest('.rd-card-t'); if (h && h.parentNode) h.parentNode.insertBefore(n, h.nextSibling); }
    n.textContent = msg || ''; n.style.display = msg ? 'block' : 'none';
  }
  function paint() {
    var b = btn(); if (!b) return;
    var ok = available() && !!speechText();
    b.style.display = ok ? '' : 'none';
    b.classList.toggle('on', playing);
    b.setAttribute('aria-pressed', playing ? 'true' : 'false');
    b.innerHTML = '<i class="ph ' + (playing ? 'ph-stop-circle' : 'ph-speaker-high') + '" aria-hidden="true"></i><span>' + tr(playing ? LBL_STOP : LBL_PLAY) + '</span>';
  }
  window.vialTtsToggle = function () { if (playing) stop(); else start(); };
  window.vialTtsStop = stop;
  window.vialTtsText = speechText;   // отладка: что именно пойдёт в озвучку

  function watch() {
    var r = document.getElementById('aiResult'); if (!r) return;
    // новый разбор / другой день / смена языка → старую озвучку гасим, кнопку перерисовываем
    new MutationObserver(function (m) {
      if (playing && m.some(function (x) { return x.type === 'childList'; })) stop(); else paint();
    }).observe(r, { childList: true, attributes: true, attributeFilter: ['style'] });
    if (web() && !plug()) { try { web().onvoiceschanged = function () {}; web().getVoices(); } catch (e) {} }
    paint();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
  window.addEventListener('pagehide', function () { if (playing && !plug()) stop(); });
})();
