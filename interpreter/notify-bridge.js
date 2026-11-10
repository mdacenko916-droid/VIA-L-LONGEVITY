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
          // ⚠️ iOS: звук бывает ТОЛЬКО от файла в бандле. Строчки «возьми системный» у плагина
          // нет: без поля sound — тишина, с именем несуществующего файла — тоже тишина
          // (так и вышло 22.09 с 'default.wav'). Файл лежит в app/ios/App/App/vialchime.wav
          // и подключён к цели App в Xcode — если его выкинуть, звук снова пропадёт.
          // Android звучит сам: там звук берётся из канала уведомлений, файл ему не нужен.
          sound: 'vialchime.wav',
          extra: { tab: 'today', plan: 'morning' },
        }],
      });
      return true;
    } catch (e) { console.warn('[notify] schedule failed', e); return false; }
  };

  /* Напоминания о приёме добавок и препаратов («Мои приёмы», 2026-09-18). Живут отдельно от
     утреннего (id 1): их id — от 1000. Каждый вызов снимает ВСЕ прежние напоминания о приёме
     и ставит список заново, поэтому клиент просто передаёт актуальное расписание.
     Элемент: {id, hh, mm} — ежедневное повторяющееся (приём без даты окончания),
              {id, at}     — разовое на конкретный момент (курс с датой окончания: повторяющееся
                             не умеет остановиться само, и звенело бы после конца курса).
     iOS держит не больше 64 отложенных уведомлений на приложение — клиент режет список до 56.
     ⚠️ Текст виден на заблокированном экране: названий препаратов в нём быть не должно. */
  window.notifyIntake = async function (items) {
    var p = ln(); if (!p) return false;
    try {
      var pend = await p.getPending();
      var old = ((pend && pend.notifications) || [])
        .filter(function (n) { return Number(n.id) >= 1000; })
        .map(function (n) { return { id: Number(n.id) }; });
      if (old.length) await p.cancel({ notifications: old });
      if (!items || !items.length) return true;
      // Кнопка «✓ Принято» прямо в уведомлении (2026-11-08): приняв лекарство, человек отмечает это, а не
      // смахивает напоминание. Подпись — на языке приложения на момент постановки (переставляется при каждом
      // открытии). «Принято» на заблокированном экране ничего о здоровье не говорит. foreground — открыть
      // приложение: так отметка надёжно доходит до страницы и человек видит её в списке.
      try {
        if (p.registerActionTypes) await p.registerActionTypes({ types: [{ id: 'VIAL_INTAKE', actions: [
          { id: 'taken', title: (typeof _ikTakenLabel === 'function' ? _ikTakenLabel() : '✓'), foreground: true }] }] });
      } catch (e) {}
      await p.schedule({
        notifications: items.slice(0, 56).map(function (it) {
          return {
            id: Number(it.id),
            title: String(it.title || '').slice(0, 60),
            body: String(it.body || '').slice(0, 140),
            schedule: it.at ? { at: new Date(it.at), allowWhileIdle: true }
                            : { on: { hour: Number(it.hh), minute: Number(it.mm) }, allowWhileIdle: true },
            sound: 'vialchime.wav',                   // см. про звук выше
            // Время приёма — чтобы клик открыл ИМЕННО его, а не весь список. Названий здесь нет
            // и не будет: extra не видно на экране, но и хранить их незачем — время однозначно.
            extra: { kind: 'intake', t: String(it.t || '') },
            actionTypeId: 'VIAL_INTAKE',
          };
        }),
      });
      return true;
    } catch (e) { console.warn('[notify] intake schedule failed', e); return false; }
  };

  /* Напоминания о воде (VIA-L, 2026-10-10). Свои id 500–599: notifyIntake снимает только ≥1000, утреннее — id 1.
     times — ['09:00','11:00',…]; пустой список — выключено. Текст — только значок 💧: переводы не нужны,
     смысл понятен на любом языке (решение владельца). */
  window.notifyWater = async function (times) {
    var p = ln(); if (!p) return false;
    try {
      var pend = await p.getPending();
      var old = ((pend && pend.notifications) || []).filter(function (n) { var i = Number(n.id); return i >= 500 && i < 600; })
        .map(function (n) { return { id: Number(n.id) }; });
      if (old.length) await p.cancel({ notifications: old });
      if (!times || !times.length) return true;
      await p.schedule({ notifications: times.slice(0, 12).map(function (t, i) {
        return { id: 500 + i, title: 'VIA·L', body: '💧',
          schedule: { on: { hour: parseInt(t.slice(0, 2), 10), minute: parseInt(t.slice(3, 5), 10) }, allowWhileIdle: true },
          sound: 'vialchime.wav', extra: { kind: 'water' } };
      }) });
      return true;
    } catch (e) { console.warn('[notify] water schedule failed', e); return false; }
  };

  // Нажатие по уведомлению → утреннее открывает «Сегодня» с памяткой, напоминание о приёме — список приёма.
  try {
    var p0 = ln();
    if (p0 && p0.addListener) {
      var _onAct = function (ev) {
        try {
          var ex = ev && ev.notification && ev.notification.extra;
          if (typeof navTo === 'function') navTo('today');
          if (ex && ex.kind === 'intake' && typeof _ikOpen === 'function') {
            var _t = ex.t;
            // «✓ Принято» в уведомлении — отмечаем все приёмы этого времени, список открываем уже с галочками.
            if (ev.actionId === 'taken' && typeof _ikMarkAt === 'function') { try { _ikMarkAt(_t); } catch (e) {} }
            setTimeout(function () { try { if (typeof _rdIntake === 'function') _rdIntake(); } catch (e) {} _ikOpen(_t); }, 300); return;
          }
          // 2026-11-10: памятка = два напоминания и, пока проход не сделан, кнопка «Начать» — пуш ведёт в неё.
          if (typeof openDayPlanPanel === 'function') setTimeout(openDayPlanPanel, 300);   // модал «Памятка дня»
        } catch (e) {}
      };
      p0.addListener('localNotificationActionPerformed', function (ev) {
        // Холодный старт по уведомлению: событие приходит, пока остальные скрипты (intake.js) ещё грузятся —
        // ждём загрузки страницы, иначе отметка «Принято» потерялась бы.
        if (document.readyState !== 'complete') { window.addEventListener('load', function () { setTimeout(function () { _onAct(ev); }, 0); }, { once: true }); return; }
        _onAct(ev);
      });
    }
  } catch (e) {}
})();
