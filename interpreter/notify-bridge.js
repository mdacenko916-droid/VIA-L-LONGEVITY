/* VIA·L — мост локальных уведомлений (@capacitor/local-notifications).
   Работает ТОЛЬКО внутри приложения (window.Capacitor.Plugins.LocalNotifications).
   На вебе все функции — no-op: страница ведёт себя как раньше.

   Почему локальные, а не серверные пуши: не нужен сервер и APNs, работает без сети,
   ничего не стоит и не меняет метки приватности — данные никуда не уходят.
   Подробности и правила текста — docs/DAILY-NOTIFICATION-SPEC.md.

   ⚠️ Текст уведомления виден на ЗАБЛОКИРОВАННОМ экране посторонним. Ничего о здоровье
   здесь быть не может, даже того, что внутри приложения писать разрешено. Фильтр —
   на стороне клиента (_notifyText), мост его не проверяет. */
(function () {
  var ID = 1;   // одно уведомление, всегда перезаписываем его же

  function ln() {
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null;
  }
  window.notifyAvailable = function () { return !!ln(); };

  // Разрешение спрашиваем НЕ при первом запуске, а когда просьба уже понятна
  // (после первой «Памятки дня») — вызов делает клиент.
  window.notifyAsk = async function () {
    var p = ln(); if (!p) return false;
    try {
      var st = await p.checkPermissions();
      if (st && st.display === 'granted') return true;
      if (st && st.display === 'denied') return false;      // отказ уважаем и не переспрашиваем
      var r = await p.requestPermissions();
      return !!(r && r.display === 'granted');
    } catch (e) { return false; }
  };

  window.notifyCancel = async function () {
    var p = ln(); if (!p) return;
    try { await p.cancel({ notifications: [{ id: ID }] }); } catch (e) {}
  };

  /* Ставим ежедневное повторяющееся уведомление на hh:mm.
     Повторяющееся, а не разовое: если человек долго не открывает приложение, разовое
     выстрелит один раз и канал замолчит. Текст при этом обновляется при каждом открытии —
     клиент отменяет и ставит заново. */
  window.notifySchedule = async function (hh, mm, title, body) {
    var p = ln(); if (!p) return false;
    try {
      await window.notifyCancel();
      await p.schedule({
        notifications: [{
          id: ID,
          title: String(title || '').slice(0, 60),
          body: String(body || '').slice(0, 140),
          schedule: { on: { hour: Number(hh), minute: Number(mm) }, allowWhileIdle: true },
          extra: { tab: 'today', plan: 'morning' },
        }],
      });
      return true;
    } catch (e) { console.warn('[notify] schedule failed', e); return false; }
  };

  // Нажатие по уведомлению → открыть вкладку «Сегодня» с утренней карточкой.
  try {
    var p0 = ln();
    if (p0 && p0.addListener) {
      p0.addListener('localNotificationActionPerformed', function () {
        try {
          if (typeof navTo === 'function') navTo('today');
          if (typeof openDayPlanPanel === 'function') setTimeout(openDayPlanPanel, 300);   // модал «Памятка дня»
        } catch (e) {}
      });
    }
  } catch (e) {}
})();
