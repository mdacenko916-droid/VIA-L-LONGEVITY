/* VIA·L — пуши «Ваш наставник ответил» (2026-09-27, docs/CABINET-PUSH-MOBILE-PLAN.md §3).
   Только в приложении (Capacitor PushNotifications); на вебе — ничего.
   Телефон регистрируется, когда клиент подключён к наставнику (vial_spec_link.code): токен уходит на сервер
   (/push/app-register), и ответ специалиста из кабинета приходит пушем. Нажатие открывает переписку.
   Разрешение спрашиваем не на старте, а когда человек подключился к наставнику или открыл переписку —
   тогда просьба понятна. Android — после подключения Firebase (google-services.json): без него вызов
   register() роняет приложение, поэтому на Android пока выходим сразу. */
(function () {
  var WORKER = 'https://interpreter.viaelcom.workers.dev';
  function pn() { return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.PushNotifications) || null; }
  function plat() { try { return (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform()) || ''; } catch (e) { return ''; } }
  function link() { try { return JSON.parse(localStorage.getItem('vial_spec_link') || 'null'); } catch (e) { return null; } }
  function lang() { try { return localStorage.getItem('vial_lang') || 'en'; } catch (e) { return 'en'; } }
  var listening = false;
  function listen(p) {
    if (listening) return; listening = true;
    p.addListener('registration', function (t) {
      var l = link(); if (!l || !l.code || !t || !t.value) return;
      try {
        fetch(WORKER + '/push/app-register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: l.code, token: t.value, platform: plat() || 'ios', lang: lang() }) });
      } catch (e) {}
    });
    // Нажали на пуш — сразу в переписку с наставником.
    p.addListener('pushNotificationActionPerformed', function () {
      try { if (location.pathname.indexOf('my-specialist') < 0 || location.hash !== '#chat') location.href = 'my-specialist.html#chat'; } catch (e) {}
    });
  }
  // ask=true — можно показать системный запрос разрешения. ask=false — только тихо обновить токен.
  window.vialPushRegister = async function (ask) {
    var p = pn(); if (!p || plat() !== 'ios') return false;
    var l = link(); if (!l || !l.code) return false;
    listen(p);
    try {
      var st = await p.checkPermissions();
      if (st.receive !== 'granted') {
        if (!ask || st.receive === 'denied') return false;
        st = await p.requestPermissions();
        if (st.receive !== 'granted') return false;
      }
      await p.register();
      return true;
    } catch (e) { return false; }
  };
  try { if (pn() && plat() === 'ios') { listen(pn()); window.vialPushRegister(false); } } catch (e) {}
})();
