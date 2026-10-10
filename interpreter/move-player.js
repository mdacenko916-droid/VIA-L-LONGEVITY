/* VIA·L — проигрыватель «Тренировки дня» (2026-10-10). Механика взята из пробы владельца
   (скрин/Eva тренер видео/player.html, FITNESS-APP-MODEL.md §12.3): ролик Евы на весь экран, кольцо-таймер,
   счёт повторов по самому ролику, писки 3-2-1, музыка (WebAudio, своя), голос — ГОЛОС ТЕЛЕФОНА
   (плагин TextToSpeech в приложении, speechSynthesis в браузере; решение 2026-10-10, Cartesia не нужна).
   Шаги собирает vialWorkouts.steps(id) из плана тренировки; ролик — по номеру каталога (clips/<номер>.mp4,
   точка → дефис). Нет ролика — экран с названием и «как делать». В конце — отметка «Сделано».
   Новый ролик: положить clips/<номер>.mp4 (720p, без звука), вписать номер в CLIPS (и повторы в rep, если бумеранг). */
(function () {
  // Ролики и фото Евы. rep — моменты (с) конца повтора в петле ролика (размечено в пробе 2026-10-06).
  var CLIPS = {
    '8.1': {}, '5.2': {}, '2.20': {},
    '1.1': { rep: [4.75] }, '1.4': { rep: [3.92] }, '1.9': { rep: [4.08] }, '1.10': { rep: [5.08] },
    '1.13': { rep: [2.79, 4.67] }, '1.17': { rep: [2.92] }, '1.20': { rep: [3.33] },
    '2.1': { rep: [3.42] }, '2.3': { rep: [4.33] }, '2.7': { rep: [1.58] }, '2.9': { rep: [3.08] },
    '3.2': { rep: [2.9, 5.87] }, '3.4': { rep: [2.67, 5.29] },
    '3.6': { photo: 1 }, '3.7': { photo: 1 }, '3.8': { photo: 1 }, '6.3': { photo: 1 }
  };
  var BASE = 'clips/';
  function clipSrc(id) { var c = CLIPS[id]; return c ? BASE + id.replace('.', '-') + (c.photo ? '.jpg' : '.mp4') : ''; }

  var T = {
    start:  {ru:'Начать тренировку',uk:'Почати тренування',en:'Start workout',es:'Empezar entrenamiento',de:'Training starten',pt:'Começar treino',fr:'Commencer la séance',pl:'Zacznij trening',it:'Inizia allenamento',he:'להתחיל אימון',ja:'トレーニングを始める',ko:'운동 시작'},
    resume: {ru:'Продолжить',uk:'Продовжити',en:'Resume',es:'Continuar',de:'Weiter',pt:'Continuar',fr:'Reprendre',pl:'Wznów',it:'Riprendi',he:'להמשיך',ja:'再開',ko:'계속'},
    quit:   {ru:'Выйти',uk:'Вийти',en:'Exit',es:'Salir',de:'Beenden',pt:'Sair',fr:'Quitter',pl:'Wyjdź',it:'Esci',he:'יציאה',ja:'終了',ko:'나가기'},
    sure:   {ru:'Точно выйти?',uk:'Точно вийти?',en:'Exit for sure?',es:'¿Salir de verdad?',de:'Wirklich beenden?',pt:'Sair mesmo?',fr:'Vraiment quitter ?',pl:'Na pewno wyjść?',it:'Uscire davvero?',he:'בטוח לצאת?',ja:'本当に終了しますか？',ko:'정말 나갈까요?'},
    rest:   {ru:'Отдых',uk:'Відпочинок',en:'Rest',es:'Descanso',de:'Pause',pt:'Descanso',fr:'Repos',pl:'Odpoczynek',it:'Riposo',he:'מנוחה',ja:'休憩',ko:'휴식'},
    next:   {ru:'Дальше',uk:'Далі',en:'Next',es:'Siguiente',de:'Als Nächstes',pt:'A seguir',fr:'Ensuite',pl:'Dalej',it:'Prossimo',he:'הבא',ja:'次は',ko:'다음'},
    follow: {ru:'Повторяйте',uk:'Повторюйте',en:'Follow along',es:'Repite',de:'Mitmachen',pt:'Repita',fr:'Suivez',pl:'Powtarzaj',it:'Ripeti',he:'חזרו אחריה',ja:'一緒に',ko:'따라 하세요'},
    hold:   {ru:'Удержание',uk:'Утримання',en:'Hold',es:'Mantén',de:'Halten',pt:'Segure',fr:'Tenez',pl:'Utrzymaj',it:'Mantieni',he:'החזקה',ja:'キープ',ko:'유지'},
    noclip: {ru:'Ролика пока нет — делайте по описанию',uk:'Ролика поки немає — робіть за описом',en:'No video yet — follow the description',es:'Aún no hay vídeo: sigue la descripción',de:'Noch kein Video — nach Beschreibung ausführen',pt:'Ainda sem vídeo — siga a descrição',fr:'Pas encore de vidéo — suivez la description',pl:'Filmu jeszcze nie ma — ćwicz według opisu',it:'Video non ancora disponibile: segui la descrizione',he:'עדיין אין סרטון — בצעו לפי התיאור',ja:'動画はまだありません。説明に沿って行ってください',ko:'아직 영상이 없어요 — 설명대로 하세요'},
    round:  {ru:'Круг {r} из {n}',uk:'Коло {r} з {n}',en:'Round {r} of {n}',es:'Vuelta {r} de {n}',de:'Runde {r} von {n}',pt:'Volta {r} de {n}',fr:'Tour {r} sur {n}',pl:'Runda {r} z {n}',it:'Giro {r} di {n}',he:'סבב {r} מתוך {n}',ja:'{n}周中{r}周目',ko:'{n}라운드 중 {r}'},
    reps:   {ru:'раз',uk:'разів',en:'reps',es:'rep.',de:'Wdh.',pt:'rep.',fr:'rép.',pl:'powt.',it:'rip.',he:'חזרות',ja:'回',ko:'회'},
    sec:    {ru:'сек',uk:'сек',en:'sec',es:'s',de:'Sek.',pt:'s',fr:'s',pl:'s',it:'s',he:'שנ׳',ja:'秒',ko:'초'},
    voice:  {ru:'Голос',uk:'Голос',en:'Voice',es:'Voz',de:'Stimme',pt:'Voz',fr:'Voix',pl:'Głos',it:'Voce',he:'קול',ja:'音声',ko:'음성'},
    music:  {ru:'Музыка',uk:'Музика',en:'Music',es:'Música',de:'Musik',pt:'Música',fr:'Musique',pl:'Muzyka',it:'Musica',he:'מוזיקה',ja:'音楽',ko:'음악'},
    doneH:  {ru:'Готово!',uk:'Готово!',en:'Done!',es:'¡Hecho!',de:'Geschafft!',pt:'Feito!',fr:'Terminé !',pl:'Gotowe!',it:'Fatto!',he:'סיימתם!',ja:'完了！',ko:'완료!'},
    doneT:  {ru:'Тренировка отмечена «Сделано». Завтра утром она сама попадёт в «Движение вчера».',uk:'Тренування позначено «Зроблено». Завтра вранці воно саме потрапить у «Рух учора».',en:'The workout is marked done. Tomorrow morning it will fill in “Movement yesterday” by itself.',es:'El entrenamiento está marcado como hecho. Mañana se añadirá solo a «Movimiento de ayer».',de:'Das Training ist als erledigt markiert. Morgen früh steht es automatisch unter „Bewegung gestern“.',pt:'O treino foi marcado como feito. Amanhã de manhã ele entra sozinho em «Movimento de ontem».',fr:'La séance est marquée comme faite. Demain matin, elle s’ajoutera seule à « Mouvement d’hier ».',pl:'Trening oznaczony jako zrobiony. Jutro rano sam trafi do „Ruch wczoraj”.',it:'L’allenamento è segnato come fatto. Domattina comparirà da solo in «Movimento di ieri».',he:'האימון סומן כבוצע. מחר בבוקר הוא יופיע לבד ב«תנועה אתמול».',ja:'トレーニングを「完了」にしました。明日の朝「昨日の運動」に自動で入ります。',ko:'운동이 완료로 표시됐어요. 내일 아침 ‘어제의 움직임’에 자동으로 들어가요.'},
    close:  {ru:'Закрыть',uk:'Закрити',en:'Close',es:'Cerrar',de:'Schließen',pt:'Fechar',fr:'Fermer',pl:'Zamknij',it:'Chiudi',he:'סגירה',ja:'閉じる',ko:'닫기'},
    sayStart:{ru:'Начинаем. Сначала — лёгкая разминка.',uk:'Починаємо. Спочатку — легка розминка.',en:'Let’s begin. First, an easy warm-up.',es:'Empezamos. Primero, un calentamiento suave.',de:'Los geht’s. Zuerst ein leichtes Aufwärmen.',pt:'Vamos começar. Primeiro, um aquecimento leve.',fr:'On commence. D’abord, un échauffement léger.',pl:'Zaczynamy. Najpierw lekka rozgrzewka.',it:'Iniziamo. Prima un riscaldamento leggero.',he:'מתחילים. קודם — חימום קל.',ja:'始めましょう。まずは軽いウォームアップから。',ko:'시작합니다. 먼저 가벼운 준비 운동부터.'},
    sayRest:{ru:'Отдых. Походите, подышите спокойно.',uk:'Відпочинок. Походіть, подихайте спокійно.',en:'Rest. Walk around and breathe easy.',es:'Descanso. Camina un poco y respira tranquilo.',de:'Pause. Ein paar Schritte gehen, ruhig atmen.',pt:'Descanso. Ande um pouco e respire com calma.',fr:'Repos. Marchez un peu, respirez calmement.',pl:'Odpoczynek. Pochodź, oddychaj spokojnie.',it:'Riposo. Cammina un po’ e respira con calma.',he:'מנוחה. הסתובבו קצת ונשמו ברוגע.',ja:'休憩です。少し歩いて、ゆっくり呼吸しましょう。',ko:'휴식. 조금 걸으며 편하게 숨 쉬세요.'},
    sayHalf:{ru:'Половина. Так держать.',uk:'Половина. Так тримати.',en:'Halfway. Keep it up.',es:'La mitad. Sigue así.',de:'Halbzeit. Weiter so.',pt:'Metade. Continue assim.',fr:'À mi-chemin. Continuez comme ça.',pl:'Połowa. Tak trzymaj.',it:'A metà. Continua così.',he:'חצי. ממשיכים ככה.',ja:'半分です。その調子。',ko:'절반입니다. 그대로 계속하세요.'},
    sayDone:{ru:'Готово. Отличная работа — вы молодец.',uk:'Готово. Чудова робота — ви молодець.',en:'Done. Great work — well done you.',es:'Hecho. Muy buen trabajo, enhorabuena.',de:'Geschafft. Starke Leistung — gut gemacht.',pt:'Pronto. Ótimo trabalho — parabéns.',fr:'Terminé. Beau travail, bravo.',pl:'Gotowe. Świetna robota — brawo.',it:'Fatto. Ottimo lavoro, brava.',he:'סיימתם. עבודה מצוינת — כל הכבוד.',ja:'お疲れさまでした。よく頑張りました。',ko:'끝났어요. 정말 잘했어요.'},
    restNext:{ru:'Отдохните и приготовьтесь',uk:'Відпочиньте й приготуйтеся',en:'Rest and get ready',es:'Descansa y prepárate',de:'Ausruhen und bereit machen',pt:'Descanse e prepare-se',fr:'Reposez-vous et préparez-vous',pl:'Odpocznij i przygotuj się',it:'Riposa e preparati',he:'נוחו והתכוננו',ja:'休んで準備しましょう',ko:'쉬면서 준비하세요'}
  };
  function L() { return (typeof lang !== 'undefined' && lang) ? lang : 'en'; }   // `let lang` главной не лежит в window
  function t(k) { var o = T[k] || {}; return o[L()] || o.en || ''; }
  function loc() { try { return (typeof window._locale === 'function') ? window._locale() : 'en-GB'; } catch (e) { return 'en-GB'; } }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ── голос телефона ──
  var voiceOn = true, speaking = false, sayId = 0, vEnd = 0;
  // iPhone: голос страницы (speechSynthesis, как в пробе) — у плагина шкала скорости без «чуть медленнее»
  // и голос по умолчанию бывает мужским. Android WebView speechSynthesis не имеет — там плагин.
  function isIOS() { try { return window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'ios'; } catch (e) { return false; } }
  function plug() { if (window.speechSynthesis && (isIOS() || !window.Capacitor)) return null; return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) || null; }
  // Женские голоса по языкам (iOS/macOS/Android-имена). «Улучшенный»/«премиум», если скачан, — первым.
  var FEMALE = /milena|katya|lesya|samantha|karen|moira|serena|martha|tessa|fiona|victoria|allison|ava|susan|zoe|m[oó]nica|paulina|marisol|anna|petra|helena|luciana|joana|catarina|fernanda|am[eé]lie|audrey|marie|aur[eé]lie|zosia|ewa|alice|federica|carmit|kyoko|o-ren|yuna|sora|female/i;
  var MALE = /yuri|maxim|daniel|alex|fred|thomas|jorge|diego|markus|yannick|luca|felipe|otoya|hattori|male/i;
  var webVoice = null, plugVoice = -1;
  function pickVoices() {
    var lc = loc(), pre = lc.slice(0, 2);
    var ss = window.speechSynthesis;
    if (ss) {
      var v = (ss.getVoices() || []).filter(function (x) { return (x.lang || '').replace('_', '-').slice(0, 2) === pre; });
      var score = function (x) { var n = x.name + ' ' + (x.voiceURI || ''); return (FEMALE.test(n) ? 4 : 0) - (MALE.test(n) ? 4 : 0) + (/enhanced|premium|улучш|neural/i.test(n) ? 2 : 0) + ((x.lang || '').replace('_', '-') === lc ? 1 : 0); };
      webVoice = v.sort(function (a, b) { return score(b) - score(a); })[0] || null;
    }
    var p = plug();
    if (p && p.getSupportedVoices) p.getSupportedVoices().then(function (r) {
      var vs = (r && r.voices) || [], best = -1, bs = -99;
      vs.forEach(function (x, i) { if (String(x.lang || '').replace('_', '-').slice(0, 2) !== pre) return;
        var n = (x.name || '') + ' ' + (x.voiceURI || ''); var sc = (FEMALE.test(n) ? 4 : 0) - (MALE.test(n) ? 4 : 0) + (/enhanced|premium|neural/i.test(n) ? 2 : 0);
        if (sc > bs) { bs = sc; best = i; } });
      plugVoice = best;
    }).catch(function () {});
  }
  if (window.speechSynthesis) { try { window.speechSynthesis.onvoiceschanged = pickVoices; } catch (e) {} }
  function vLen(text) { return String(text || '').length / 13; }   // ≈13 знаков в секунду — для расчёта, когда начать подсказку
  function say(text, force) {
    if (!voiceOn || !text) return;
    if (speaking && !force) return;
    var my = ++sayId, p = plug(), lc = loc();
    speaking = true; vEnd = Date.now() + vLen(text) * 1000 + 400;
    var done = function () { if (my === sayId) speaking = false; };
    if (p) {
      var o = { text: text, lang: lc, rate: 0.9, category: 'playback' }; if (plugVoice >= 0) o.voice = plugVoice;
      Promise.resolve(force ? p.stop().catch(function () {}) : null)
        .then(function () { return p.speak(o); })
        .then(done, done);
      return;
    }
    var ss = window.speechSynthesis; if (!ss) { speaking = false; return; }
    if (force) ss.cancel();
    if (!webVoice) pickVoices();
    var u = new SpeechSynthesisUtterance(text); u.lang = lc; u.rate = 0.92;
    if (webVoice) u.voice = webVoice;
    u.onend = done; u.onerror = done; ss.speak(u);
  }
  function hush() { sayId++; speaking = false; var p = plug(); if (p) p.stop().catch(function () {}); else if (window.speechSynthesis) window.speechSynthesis.cancel(); }

  // ── звук: писки и музыка (WebAudio, без файлов) ──
  var AC = null, mGain = null, mNext = 0, mStep = 0, mTimer = null, musicOn = true, keepAlive = null;
  // iPhone с выключенным звонком глушит WebAudio (музыка, писки), а голос идёт — поэтому «голос есть, музыки нет».
  // Просим у WebKit режим воспроизведения и держим тихий <audio> — он переводит звук страницы в «медиа».
  function unmuteIOS() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try {
      if (!keepAlive) {
        var sr = 8000, n = sr / 2, b = new ArrayBuffer(44 + n * 2), d = new DataView(b), w = function (o, s) { for (var i = 0; i < s.length; i++) d.setUint8(o + i, s.charCodeAt(i)); };
        w(0, 'RIFF'); d.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true);
        d.setUint32(24, sr, true); d.setUint32(28, sr * 2, true); d.setUint16(32, 2, true); d.setUint16(34, 16, true); w(36, 'data'); d.setUint32(40, n * 2, true);
        keepAlive = new Audio(URL.createObjectURL(new Blob([b], { type: 'audio/wav' })));
        keepAlive.loop = true; keepAlive.setAttribute('playsinline', ''); keepAlive.volume = 0.01;
      }
      var pr = keepAlive.play(); if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {}
  }
  function tone(f, d, v) { if (!AC) return; var o = AC.createOscillator(), g = AC.createGain(), x = AC.currentTime;
    o.frequency.value = f; g.gain.setValueAtTime(v || .25, x); g.gain.exponentialRampToValueAtTime(.0001, x + d); o.connect(g); g.connect(AC.destination); o.start(x); o.stop(x + d); }
  function beep() { tone(880, .15, .25); }
  function endBeep() { tone(880, .7, .3); }
  function tock() { if (!AC) return; var o = AC.createOscillator(), g = AC.createGain(), x = AC.currentTime;
    o.type = 'triangle'; o.frequency.setValueAtTime(520, x); o.frequency.exponentialRampToValueAtTime(320, x + .09);
    g.gain.setValueAtTime(.35, x); g.gain.exponentialRampToValueAtTime(.0001, x + .12); o.connect(g); g.connect(AC.destination); o.start(x); o.stop(x + .13); }
  function chime() { if (!AC) return; [[660, 0], [990, .16]].forEach(function (n) { var o = AC.createOscillator(), g = AC.createGain(), x = AC.currentTime + n[1];
    o.frequency.value = n[0]; g.gain.setValueAtTime(.0001, x); g.gain.exponentialRampToValueAtTime(.28, x + .02); g.gain.exponentialRampToValueAtTime(.0001, x + .45);
    o.connect(g); g.connect(AC.destination); o.start(x); o.stop(x + .5); }); }
  var CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function note(f, x, d, type, vol) { var o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, x); g.gain.exponentialRampToValueAtTime(vol, x + Math.min(.08, d / 4)); g.gain.exponentialRampToValueAtTime(.0001, x + d);
    o.connect(g); g.connect(mGain); o.start(x); o.stop(x + d + .05); }
  function kick(x) { var o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(110, x); o.frequency.exponentialRampToValueAtTime(45, x + .15);
    g.gain.setValueAtTime(.5, x); g.gain.exponentialRampToValueAtTime(.0001, x + .22); o.connect(g); g.connect(mGain); o.start(x); o.stop(x + .25); }
  function hat(x) { var n = AC.sampleRate * .04, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.value = .12; s.connect(f); f.connect(g); g.connect(mGain); s.start(x); }
  function musicTick() {
    if (!AC || !mGain) return;
    var beat = 60 / 100 / 2;
    while (mNext < AC.currentTime + .3) {
      var bar = Math.floor(mStep / 8) % 4, pos = mStep % 8, c = CH[bar];
      if (pos === 0) c.forEach(function (m) { note(hz(m), mNext, beat * 8, 'triangle', .05); });
      if (pos % 2 === 0) note(hz(c[0] - 12), mNext, beat * 1.6, 'sine', .14);
      if (pos === 0 || pos === 4) kick(mNext);
      if (pos % 2 === 1) hat(mNext);
      if (pos === 3 || pos === 7) note(hz(c[(mStep >> 3) % 3] + 12), mNext, beat * 1.5, 'sine', .035);
      mNext += beat; mStep++;
    }
    mGain.gain.setTargetAtTime(!musicOn ? .0001 : ((speaking || Date.now() < vEnd) ? .12 : .45), AC.currentTime, .15);
  }
  function startMusic() { if (!AC || mGain) return; mGain = AC.createGain(); mGain.gain.value = .0001; mGain.connect(AC.destination);
    mNext = AC.currentTime + .1; mTimer = setInterval(musicTick, 100); }
  function stopMusic() { if (mGain && AC) mGain.gain.setTargetAtTime(.0001, AC.currentTime, .8); setTimeout(function () { clearInterval(mTimer); mTimer = null; mGain = null; }, 2500); }

  // ── состояние ──
  var S = [], idx = 0, phase = 'work', left = 0, total = 0, paused = false, last = 0, raf = 0, wid = '', lastWhole = -1, saidHalf = false;
  var repMode = false, repsLeft = 0, repsN = 0, repEnds = [], repLastT = 0, repSaid = false, wake = null, introDone = -1;
  function intro(s) { return s.name + '. ' + (s.round === 1 ? (s.how || '') : ''); }   // техника — в первом круге
  function busy() { return speaking || Date.now() < vEnd; }
  var ARC = 263.9;
  function restAfter(i) {
    var s = S[i]; if (!s || i >= S.length - 1) return 0;
    if (s.last && s.round < s.rounds) return 60;                 // между кругами
    return (s.k === 'main' || s.k === 'int' || s.k === 'str') ? 15 : 10;
  }

  var CSS = '#mvp{position:fixed;inset:0;z-index:100000;background:#000;color:#fff;font-family:var(--font-ui,-apple-system,sans-serif);overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}'
    + '#mvp .bg{position:absolute;inset:-40px;width:calc(100% + 80px);height:calc(100% + 80px);object-fit:cover;filter:blur(28px) brightness(.45)}'
    + '#mvp .fg{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transition:filter .4s}'
    + '#mvp.resting .fg{filter:brightness(.5)}'
    + '#mvp .nc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:120px 24px 200px;background:radial-gradient(circle at 50% 40%,#222a37,#0c0f15);text-align:center}'
    + '#mvp .nc div{max-width:520px;font-size:17px;line-height:1.55;color:rgba(255,255,255,.85)}'
    + '#mvp .nc i{display:block;font-style:normal;font-size:13px;color:#EEAF54;margin-bottom:12px}'
    + '#mvp .bar{position:absolute;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:2px}'
    + '#mvp .bar i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.22)}#mvp .bar i.d{background:#C68C34}#mvp .bar i.c{background:#EEAF54}'
    + '#mvp .blk{position:absolute;left:16px;top:calc(22px + env(safe-area-inset-top));font-size:13px;color:rgba(255,255,255,.75);text-shadow:0 1px 6px rgba(0,0,0,.7)}'
    + '#mvp .ring{position:absolute;right:14px;top:calc(22px + env(safe-area-inset-top));width:96px;height:96px;border-radius:50%;background:rgba(10,12,18,.55)}'
    + '#mvp .ring svg{transform:rotate(-90deg);display:block}'
    + '#mvp .num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}'
    + '#mvp .num b{font-size:34px;font-weight:400;line-height:1;font-variant-numeric:tabular-nums}#mvp .num span{font-size:11px;color:rgba(255,255,255,.72);margin-top:3px}'
    + '#mvp .info{position:absolute;left:0;right:0;bottom:0;padding:60px 18px calc(18px + env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(0,0,0,.8))}'
    + '#mvp .tag{font-size:12px;letter-spacing:.06em;color:#EEAF54;margin-bottom:4px;text-transform:uppercase}#mvp.resting .tag{color:#5AC4B2}'
    + '#mvp .name{font-family:"Playfair Display",serif;font-size:24px;margin:0;line-height:1.2}'
    + '#mvp .dose{font-size:15px;color:#EEAF54;margin-top:4px}#mvp .hint{font-size:14px;color:rgba(255,255,255,.75);margin-top:4px;line-height:1.4}'
    + '#mvp .b321{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:110px;font-family:"Playfair Display",serif;color:#EEAF54;text-shadow:0 2px 24px rgba(0,0,0,.7);pointer-events:none}'
    + '#mvp .ctl{position:absolute;inset:0;z-index:3;background:rgba(0,0,0,.55);display:none;flex-direction:column;justify-content:center;align-items:center;gap:22px}'
    + '#mvp.pz .ctl{display:flex}#mvp.pz .blk{opacity:0}'
    + '#mvp .row{display:flex;align-items:center;gap:24px}'
    + '#mvp button{font-family:inherit;cursor:pointer;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.12);color:#fff;border-radius:14px;padding:11px 16px;font-size:15px}'
    + '#mvp .cb{width:62px;height:62px;border-radius:50%;padding:0;font-size:22px}#mvp .cb.big{width:84px;height:84px;background:#C68C34;border-color:#C68C34;color:#10131A;font-size:28px}'
    + '#mvp .x{position:absolute;left:14px;top:calc(22px + env(safe-area-inset-top))}'
    + '#mvp .tg.off{opacity:.45}'
    + '#mvp .end{position:absolute;inset:0;z-index:4;background:#10131A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center}'
    + '#mvp .end h2{font-family:"Playfair Display",serif;color:#EEAF54;font-size:32px;margin:0}#mvp .end p{max-width:440px;color:rgba(255,255,255,.8);line-height:1.5;margin:0}'
    + '#mvp .end button{background:#C68C34;border-color:#C68C34;color:#10131A;font-weight:600;min-width:200px}'
    + '#mvp .hid{display:none!important}';

  function build() {
    if (!$('mvp-css')) { var st = document.createElement('style'); st.id = 'mvp-css'; st.textContent = CSS; document.head.appendChild(st); }
    var d = document.createElement('div'); d.id = 'mvp';
    d.innerHTML = '<video class="bg" muted playsinline loop></video><video class="fg" muted playsinline loop></video>'
      + '<img class="bg hid" alt=""><img class="fg hid" alt=""><div class="nc hid"><div><i></i><span></span></div></div>'
      + '<div class="bar" id="mvp-bar"></div><div class="blk" id="mvp-blk"></div>'
      + '<div class="ring"><svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="6"/>'
      + '<circle id="mvp-arc" cx="48" cy="48" r="42" fill="none" stroke="#C68C34" stroke-width="6" stroke-linecap="round" stroke-dasharray="263.9" stroke-dashoffset="0"/></svg>'
      + '<div class="num"><b id="mvp-sec">0</b><span id="mvp-unit"></span></div></div>'
      + '<div class="info"><div class="tag" id="mvp-tag"></div><p class="name" id="mvp-name"></p><div class="dose" id="mvp-dose"></div><div class="hint" id="mvp-hint"></div></div>'
      + '<div class="b321 hid" id="mvp-321"></div>'
      + '<div class="ctl"><button class="x" id="mvp-quit"></button><div class="row"><button class="cb" id="mvp-prev" aria-label="prev">⏮</button>'
      + '<button class="cb big" id="mvp-play" aria-label="play">▶</button><button class="cb" id="mvp-next" aria-label="next">⏭</button></div>'
      + '<div class="row"><button class="tg" id="mvp-voice"></button><button class="tg" id="mvp-music"></button></div></div>'
      + '<div class="end hid"><h2></h2><p></p><button id="mvp-close"></button></div>';
    document.body.appendChild(d);
    d.addEventListener('pointerup', function (e) { if (e.target.closest('button') || !d.querySelector('.end').classList.contains('hid')) return; if (!paused) setPaused(true); });
    $('mvp-play').onclick = function () { setPaused(false); };
    $('mvp-next').onclick = function () { setPaused(false); goNext(); };
    $('mvp-prev').onclick = function () { setPaused(false); goPrev(); };
    $('mvp-quit').onclick = function () { var b = $('mvp-quit'); if (b.getAttribute('data-sure')) { finish(false); return; } b.setAttribute('data-sure', '1'); b.textContent = '✕ ' + t('sure'); };
    $('mvp-voice').onclick = function () { voiceOn = !voiceOn; if (!voiceOn) hush(); paintToggles(); };
    $('mvp-music').onclick = function () { musicOn = !musicOn; paintToggles(); };
    $('mvp-close').onclick = close;
    return d;
  }
  function paintToggles() {
    $('mvp-voice').textContent = (voiceOn ? '🔊 ' : '🔇 ') + t('voice'); $('mvp-voice').classList.toggle('off', !voiceOn);
    $('mvp-music').textContent = '🎵 ' + t('music'); $('mvp-music').classList.toggle('off', !musicOn);
  }
  function el() { return $('mvp'); }
  function vids() { return [].slice.call(el().querySelectorAll('video')); }
  function playV(v) { if (paused) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  // показать ролик / фото / экран без ролика
  function showMedia(s) {
    var d = el(), src = s ? clipSrc(s.clip) : '', c = s && CLIPS[s.clip];
    var imgs = [].slice.call(d.querySelectorAll('img')), nc = d.querySelector('.nc');
    vids().forEach(function (v) {
      var on = !!(src && !c.photo);
      v.classList.toggle('hid', !on);
      if (!on) { v.pause(); return; }
      if (v.getAttribute('data-f') !== src) { v.setAttribute('data-f', src); v.src = src; }
      try { v.currentTime = 0; } catch (e) {}
      playV(v);
    });
    imgs.forEach(function (i) { var on = !!(src && c.photo); i.classList.toggle('hid', !on); if (on && i.getAttribute('src') !== src) i.src = src; });
    nc.classList.toggle('hid', !!src);
    if (!src && s) { nc.querySelector('i').textContent = t('noclip'); nc.querySelector('span').textContent = s.how || ''; }
  }

  function render() {
    var rest = phase === 'rest', s = rest ? S[idx + 1] : S[idx];
    el().classList.toggle('resting', rest);
    showMedia(s);
    $('mvp-blk').textContent = s.part + (s.rounds > 1 ? ' · ' + t('round').replace('{r}', s.round).replace('{n}', s.rounds) : '');
    $('mvp-tag').textContent = rest ? t('rest') + ' · ' + t('next') : (CLIPS[s.clip] && CLIPS[s.clip].photo ? t('hold') : t('follow'));
    $('mvp-name').textContent = s.name;
    $('mvp-dose').textContent = s.dose;
    $('mvp-hint').textContent = rest ? t('restNext') : (CLIPS[s.clip] ? s.how : '');
    $('mvp-unit').textContent = rest ? t('rest').toLowerCase() : t('sec');
    $('mvp-arc').style.stroke = rest ? '#5AC4B2' : '#C68C34';
    var h = ''; for (var i = 0; i < S.length; i++) h += '<i class="' + (i < idx ? 'd' : i === idx ? 'c' : '') + '"></i>';
    $('mvp-bar').innerHTML = h;
  }

  function startPhase(p) {
    phase = p; lastWhole = -1; saidHalf = false; $('mvp-321').classList.add('hid');
    total = left = (p === 'work' ? S[idx].sec : restAfter(idx));
    render();
    repMode = false;
    if (p === 'work') {
      var s = S[idx], c = CLIPS[s.clip];
      chime();
      if (s.reps && c && c.rep) {
        repMode = true; repsN = repsLeft = s.reps; repEnds = c.rep; repLastT = 0;
        $('mvp-unit').textContent = t('reps'); $('mvp-sec').textContent = repsLeft;
      }
      if (introDone !== idx) { introDone = idx; say((idx === 0 ? t('sayStart') + ' ' : '') + intro(s), true); }
      repSaid = false;
    } else {
      // «Отдых», а подсказку следующего — так, чтобы закончилась к старту (как в пробе)
      var nx = intro(S[idx + 1]);
      if (total < vLen(t('sayRest')) + vLen(nx) + 1.5) { introDone = idx + 1; say(nx, true); }
      else say(t('sayRest'), true);
    }
  }
  function finishPhase() {
    if (phase === 'work') { endBeep(); if (restAfter(idx) > 0) { startPhase('rest'); return; } }
    idx++;
    if (idx >= S.length) { finish(true); return; }
    startPhase('work');
  }
  // Таймер на setInterval, не на requestAnimationFrame: rAF замирает в фоне/в части WebView, интервал надёжнее.
  function tick() {
    var now = performance.now();
    if (!last) last = now;
    var dt = (now - last) / 1000; last = now;
    if (paused || !el()) return;
    if (phase === 'work' && repMode) {
      var v = el().querySelector('video.fg'), tt = v ? v.currentTime : 0, crossed = 0;
      if (tt < repLastT - .5) { repEnds.forEach(function (b) { if (b > repLastT) crossed++; }); repEnds.forEach(function (b) { if (b <= tt) crossed++; }); }
      else repEnds.forEach(function (b) { if (b > repLastT && b <= tt) crossed++; });
      repLastT = tt;
      if (!repSaid && !busy()) { repSaid = true; say(String(repsLeft)); }   // «десять» — как только освободился голос
      for (var c = 0; c < crossed && repsLeft > 0; c++) { repsLeft--; if (repsLeft > 0) { say(String(repsLeft), true); repSaid = true; if (repsLeft <= 3) beep(); } }
      if (repsLeft <= 0) { finishPhase(); return; }
      var prev = 0, nxt = repEnds[0]; for (var q = 0; q < repEnds.length; q++) { if (repEnds[q] <= tt) prev = repEnds[q]; else { nxt = repEnds[q]; break; } }
      var fr = Math.min(1, Math.max(0, (tt - prev) / Math.max(.1, nxt - prev)));
      $('mvp-sec').textContent = repsLeft;
      $('mvp-arc').style.strokeDashoffset = ARC * (1 - ((repsN - repsLeft + fr) / repsN));
      return;
    }
    left -= dt;
    if (left <= 0) { finishPhase(); return; }
    var whole = Math.ceil(left);
    $('mvp-sec').textContent = whole;
    $('mvp-arc').style.strokeDashoffset = ARC * (1 - left / total);
    if (phase === 'rest' && introDone !== idx + 1 && left <= vLen(intro(S[idx + 1])) + .6 && !busy()) { introDone = idx + 1; say(intro(S[idx + 1])); }
    if (phase === 'work' && total >= 30 && !saidHalf && left <= total / 2) { saidHalf = true; say(t('sayHalf')); }
    if (whole !== lastWhole) {
      lastWhole = whole;
      var b = $('mvp-321');
      if (phase === 'work' && voiceOn && total >= 15 && whole <= 10) say(String(whole), true);   // голосом 10…1
      if (whole <= 3) { phase === 'work' ? beep() : tock(); b.textContent = whole; b.classList.remove('hid'); } else b.classList.add('hid');
    }
  }

  function setPaused(p) {
    paused = p; el().classList.toggle('pz', p);
    var q = $('mvp-quit'); q.removeAttribute('data-sure'); q.textContent = '✕ ' + t('quit');
    if (AC) { p ? AC.suspend() : AC.resume(); }
    if (!p) unmuteIOS();
    last = 0;
    if (p) hush();
    vids().forEach(function (v) { if (v.classList.contains('hid')) return; p ? v.pause() : playV(v); });
  }
  function goNext() { if (phase === 'work' && repMode) { repsLeft = 0; finishPhase(); } else left = .0001; }
  function goPrev() {
    if (phase === 'rest') { startPhase('work'); return; }
    if (left < total - 2 || idx === 0) { startPhase('work'); return; }
    idx--; startPhase('work');
  }

  function finish(completed) {
    clearInterval(raf); hush(); stopMusic();
    vids().forEach(function (v) { v.pause(); });
    if (wake) { try { wake.release(); } catch (e) {} wake = null; }
    if (!completed) { close(); return; }
    try { var day = (typeof window._dayKey === 'function') ? window._dayKey() : new Date().toISOString().slice(0, 10);
      if (window.vialWorkouts && vialWorkouts.doneOn(day) !== wid) vialWorkouts.mark(wid, day, true); } catch (e) {}
    say(t('sayDone'), true);
    var e = el().querySelector('.end'); e.classList.remove('hid');
    e.querySelector('h2').textContent = t('doneH'); e.querySelector('p').textContent = t('doneT'); $('mvp-close').textContent = t('close');
  }
  function close() {
    clearInterval(raf); hush();
    if (mTimer) { clearInterval(mTimer); mTimer = null; mGain = null; }
    if (AC) { try { AC.close(); } catch (e) {} AC = null; }
    if (keepAlive) { try { keepAlive.pause(); } catch (e) {} }
    var d = el(); if (d) { vids().forEach(function (v) { v.pause(); v.removeAttribute('src'); }); d.remove(); }
    try { if (typeof window._rdWorkout === 'function') window._rdWorkout(); } catch (e) {}
  }

  function start(id, opts) {
    if (!window.vialWorkouts || el()) return;
    opts = opts || {};
    wid = id; S = vialWorkouts.steps(id, L(), !!opts.hyp);
    if (!S.length) return;
    // AudioContext и первое видео — прямо из нажатия «Начать» (иначе iPhone не даст звук и видео)
    unmuteIOS();
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); tone(1, .01, .0001); } catch (e) { AC = null; }
    pickVoices(); introDone = -1;
    if (window.speechSynthesis && !plug()) { try { var u0 = new SpeechSynthesisUtterance(' '); u0.volume = 0; window.speechSynthesis.speak(u0); } catch (e) {} }
    build(); paintToggles();
    if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { wake = w; }).catch(function () {});
    vids().forEach(function (v) { v.muted = true; v.playsInline = true; });
    musicOn = opts.music !== false; startMusic();
    idx = 0; paused = false; last = 0;
    startPhase('work');
    raf = setInterval(tick, 100);
  }

  window.vialPlayer = { start: start, close: close, hasClip: function (id) { return !!CLIPS[id]; }, label: function () { return t('start'); } };
})();
