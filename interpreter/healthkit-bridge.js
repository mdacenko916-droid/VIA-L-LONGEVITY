/* VIA·L — HealthKit bridge: нативный Apple Health → поля карточки «Apple Health» в ИП.
   Работает ТОЛЬКО внутри приложения (Capacitor + плагин @perfood/capacitor-healthkit).
   На обычном вебе window.Capacitor отсутствует → все функции no-op, виджет ничего не меняет.
   Натив/права: app/HEALTHKIT.md · спека: docs/MOBILE-APP-MODEL.md.
   ⚠️ Имена типов HealthKit и форму ответа плагина ПРОВЕРИТЬ по докам плагина и НА УСТРОЙСТВЕ —
   могут отличаться по версии (правь READ_TYPES и парсинг ниже). */
(function(){
  function hk(){
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHealthkit) || null;
  }
  // Доступно ли нативное чтение здоровья (мы внутри iOS-приложения с плагином).
  window.healthkitAvailable = function(){ return !!hk(); };

  // Базовые типы + опциональные (могут отсутствовать в старой версии плагина / на старых часах —
  // темп. запястья только Series 8+/Ultra). Авторизацию опц. типов изолируем: если на них падает,
  // повторяем только по базовым, чтобы один неизвестный тип не сломал весь доступ к Health.
  var CORE_TYPES = ['heartRate','restingHeartRate','heartRateVariability','stepCount','sleepAnalysis','vo2Max','oxygenSaturation'];
  // Полный приём (2026-09-18): тренировки, дыхание, вес, давление. Имена — ключи РАЗРЕШЕНИЙ плагина:
  // тренировки разрешаются ключом 'activity' (он же сон), а читаются как 'workoutType'.
  // iOS сам покажет окно только по новым типам — тем, кто уже подключился, повторять ничего не надо.
  var EXTRA_TYPES = ['activity','respiratoryRate','weight','bloodPressureSystolic','bloodPressureDiastolic'];
  var OPT_TYPES  = ['appleSleepingWristTemperature'];
  var READ_TYPES = CORE_TYPES.concat(EXTRA_TYPES, OPT_TYPES);

  function daysAgoISO(n){ var d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
  function nowISO(){ return new Date().toISOString(); }

  // Запрос разрешений Apple Health (системный экран). true — пользователь прошёл диалог.
  window.healthkitAuthorize = async function(){
    var p = hk(); if(!p) return false;
    try { await p.requestAuthorization({ all: [], read: READ_TYPES, write: [] }); return true; }
    catch(e){
      // Опциональный тип мог не поддерживаться версией плагина → без него, потом только базовые.
      try { await p.requestAuthorization({ all: [], read: CORE_TYPES.concat(EXTRA_TYPES), write: [] }); return true; }
      catch(e1){
        try { await p.requestAuthorization({ all: [], read: CORE_TYPES, write: [] }); return true; }
        catch(e2){ return false; }
      }
    }
  };

  // Последняя запись по типу за N дней (или null).
  async function lastSample(sampleName, nDays){
    var p = hk(); if(!p) return null;
    try {
      var r = await p.queryHKitSampleType({ sampleName: sampleName, startDate: daysAgoISO(nDays||7), endDate: nowISO(), limit: 0 });
      var arr = (r && r.resultData) || [];
      if(!arr.length) return null;
      arr.sort(function(a,b){ return new Date(b.endDate || b.startDate) - new Date(a.endDate || a.startDate); });
      return arr[0];
    } catch(e){ return null; }
  }

  // Среднее значение по типу за окно [startISO, endISO] (или null, если в окне нет сэмплов).
  // Нужно для HRV: Apple пишет SDNN множеством разовых замеров (в т.ч. дневных от Watch),
  // а сопоставимо с ночной агрегацией кольца только среднее за период сна, а не последний сэмпл.
  async function avgInWindow(sampleName, startISO, endISO){
    var p = hk(); if(!p) return null;
    try {
      var r = await p.queryHKitSampleType({ sampleName: sampleName, startDate: startISO, endDate: endISO, limit: 0 });
      var arr = (r && r.resultData) || [];
      var sum = 0, n = 0;
      arr.forEach(function(s){ if(s && s.value != null && !isNaN(Number(s.value))){ sum += Number(s.value); n++; } });
      return n ? (sum / n) : null;
    } catch(e){ return null; }
  }

  // Минимум по типу за окно [startISO, endISO]. Нужен для запасного пульса покоя: Fitbit/Google
  // Health отдают в Apple Health обычный пульс, но НЕ restingHeartRate — без фолбэка поле у таких
  // пользователей остаётся пустым, хотя ночные замеры есть. Берём не абсолютный минимум, а 10-й
  // перцентиль: одиночный артефакт замера не должен занижать показатель на весь день.
  async function lowInWindow(sampleName, startISO, endISO){
    var p = hk(); if(!p) return null;
    try {
      var r = await p.queryHKitSampleType({ sampleName: sampleName, startDate: startISO, endDate: endISO, limit: 0 });
      var arr = ((r && r.resultData) || []).map(function(s){ return Number(s && s.value); })
                 .filter(function(n){ return isFinite(n) && n > 25 && n < 200; });
      if(arr.length < 3) return null;
      arr.sort(function(a,b){ return a - b; });
      return arr[Math.floor(arr.length * 0.1)];
    } catch(e){ return null; }
  }

  // Все сэмплы типа за окно (пустой массив, если типа нет или доступ не дан — iOS не говорит, что отказано).
  async function samples(sampleName, startISO, endISO){
    var p = hk(); if(!p) return [];
    try {
      var r = await p.queryHKitSampleType({ sampleName: sampleName, startDate: startISO, endDate: endISO, limit: 0 });
      return (r && r.resultData) || [];
    } catch(e){ return []; }
  }
  function localDay(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }

  // Тренировки за 7 дней → те же поля, что у вендоров в воркере (_workoutSummary): workouts7d /
  // trainMin7d / trainDay / trainActivity. Правило то же: от 15 минут, ходьба и быт — фон, ходьба
  // засчитывается от 45 минут. Общее для Apple- и Android-моста (второй вызывает это же). 2026-09-18
  window._vialWorkoutSummary = function(list){
    var BG = /^(walking|housework|home_activity|gardening|shopping|cleaning|cooking|stairs|standing|moving|other)$/i;
    var all = (list || []).filter(function(w){ return w && w.day && w.minutes > 0; });
    if(!all.length) return {};
    var real = all.filter(function(w){
      var a = String(w.activity || '').toLowerCase();
      if(w.minutes < 15) return false;
      if(a === 'walking') return w.minutes >= 45;
      return !BG.test(a);
    }).sort(function(a, b){ return a.day < b.day ? -1 : a.day > b.day ? 1 : 0; });
    var ex = { workouts7d: real.length };
    if(all.length > real.length) ex.activityAuto7d = all.length - real.length;
    var mins = Math.round(real.reduce(function(s, w){ return s + w.minutes; }, 0));
    if(mins > 0) ex.trainMin7d = mins;
    var last = real[real.length - 1];
    if(last){ ex.trainDay = last.day; if(last.activity) ex.trainActivity = String(last.activity).toLowerCase(); }
    return ex;
  };

  // Кладёт «полный приём» в ИП (общее для обоих мостов): тренировки, шаги, дыхание → importedData;
  // давление — в поля давления, только если человек их ещё не заполнил; вес — в профиль, если
  // замер свежий (весы пишут в Health) и отличается от записанного. 2026-09-18
  window._vialHealthExtras = function(data, source){
    if(!data) return;
    var extra = {};
    if(data.workouts){ var ws = window._vialWorkoutSummary(data.workouts); Object.keys(ws).forEach(function(k){ extra[k] = ws[k]; }); }
    if(data.steps > 0) extra.steps = Math.round(data.steps);
    if(data.respRate >= 6 && data.respRate <= 40){
      extra.respRate = Math.round(data.respRate * 10) / 10;
      var rr = document.getElementById('resp_rate'); if(rr) rr.value = Math.round(data.respRate);
    }
    if(Object.keys(extra).length && typeof window.applyExtracted === 'function') window.applyExtracted(extra, source);
    if(data.bpSys >= 70 && data.bpSys <= 260 && data.bpDia >= 40 && data.bpDia <= 160){
      var s = document.getElementById('bp-sys'), d = document.getElementById('bp-dia');
      if(s && d && !s.value && !d.value){ s.value = Math.round(data.bpSys); d.value = Math.round(data.bpDia); }
    }
    if(data.weight >= 30 && data.weight <= 300){
      var w = document.getElementById('prof-weight'), kg = Math.round(data.weight * 10) / 10;
      if(w && Math.abs((parseFloat(w.value) || 0) - kg) >= 0.1){
        w.value = kg;
        if(typeof window._cardSaveNum === 'function') window._cardSaveNum('weight', String(kg));
      }
    }
  };

  // Читает метрики и нормализует в форму полей карточки Apple ИП.
  window.healthkitRead = async function(){
    if(!hk()) return null;
    var out = {};
    // Сон за прошедшую ночь: суммируем интервалы «asleep/core/rem/deep» (deep — отдельно) и
    // заодно находим окно сна [nightStart, nightEnd] — оно нужно для ночного усреднения HRV ниже.
    var nightStart = null, nightEnd = null;
    try {
      var p = hk();
      var sl = await p.queryHKitSampleType({ sampleName: 'sleepAnalysis', startDate: daysAgoISO(1), endDate: nowISO(), limit: 0 });
      var rows = (sl && sl.resultData) || [];
      var asleepMin = 0, deepMin = 0;
      rows.forEach(function(s){
        var mins = (new Date(s.endDate) - new Date(s.startDate)) / 60000;
        if(!(mins > 0)) return;
        var v = String(s.value != null ? s.value : (s.sleepState || '')).toLowerCase();
        var asleep = false;
        if(v.indexOf('deep') >= 0){ deepMin += mins; asleepMin += mins; asleep = true; }
        else if(v.indexOf('asleep') >= 0 || v.indexOf('core') >= 0 || v.indexOf('rem') >= 0){ asleepMin += mins; asleep = true; }
        if(asleep){
          var st = new Date(s.startDate), en = new Date(s.endDate);
          if(!nightStart || st < nightStart) nightStart = st;
          if(!nightEnd   || en > nightEnd)   nightEnd   = en;
        }
      });
      if(asleepMin > 0) out.sleep = Math.round(asleepMin / 60 * 100) / 100; // часы, 2 знака (точность до минуты, дисплей Ч:ММ)
      if(deepMin > 0)   out.deep  = Math.round(deepMin);
    } catch(e){}
    // HRV (SDNN): среднее по сэмплам внутри окна сна, сопоставимо с ночной HRV кольца.
    // Фолбэк на последний сэмпл, если ночь не размечена (нет sleepAnalysis за сутки).
    var hrvVal = null;
    if(nightStart && nightEnd) hrvVal = await avgInWindow('heartRateVariability', nightStart.toISOString(), nightEnd.toISOString());
    if(hrvVal == null){ var hrv = await lastSample('heartRateVariability'); if(hrv && hrv.value != null) hrvVal = Number(hrv.value); }
    if(hrvVal != null && !isNaN(hrvVal)) out.hrv = Math.round(hrvVal);
    var rhr = await lastSample('restingHeartRate');     if(rhr && rhr.value != null) out.rhr = Math.round(Number(rhr.value));
    // Фолбэк пульса покоя: тип restingHeartRate пишут не все источники (Google Health/Fitbit —
    // нет), поэтому при его отсутствии считаем сами по ночному пульсу внутри окна сна.
    if(out.rhr == null && nightStart && nightEnd){
      var lowHr = await lowInWindow('heartRate', nightStart.toISOString(), nightEnd.toISOString());
      if(lowHr != null) out.rhr = Math.round(lowHr);
    }
    var vo2 = await lastSample('vo2Max');               if(vo2 && vo2.value != null) out.vo2 = Math.round(Number(vo2.value));
    // SpO2: последний замер. Apple хранит долей 0–1 → переводим в проценты.
    var spo2 = await lastSample('oxygenSaturation');
    if(spo2 && spo2.value != null){ var sv = Number(spo2.value); if(sv > 0 && sv <= 1) sv *= 100; if(sv >= 70 && sv <= 100) out.spo2 = Math.round(sv); }
    // Темп. запястья (Series 8+/Ultra): Apple отдаёт абсолютную ночную темп., а «отклонение» считает
    // у себя и НЕ отдаёт через API → считаем сами: последняя ночь минус базовая линия (среднее за
    // 14 дней). Если тип не поддержан плагином/часами — тихо пропускаем (out.tempDev остаётся пустым).
    try {
      var pw = hk();
      var wt = await pw.queryHKitSampleType({ sampleName: 'appleSleepingWristTemperature', startDate: daysAgoISO(14), endDate: nowISO(), limit: 0 });
      var wrows = (wt && wt.resultData) || [];
      var wvals = wrows.map(function(s){ return Number(s.value); }).filter(function(n){ return isFinite(n) && n > 20 && n < 45; });
      if(wvals.length >= 3){
        var base = wvals.reduce(function(a,b){ return a + b; }, 0) / wvals.length;
        wrows.sort(function(a,b){ return new Date(b.endDate || b.startDate) - new Date(a.endDate || a.startDate); });
        var latest = Number(wrows[0].value);
        if(isFinite(latest)) out.tempDev = Math.round((latest - base) * 10) / 10; // °C, 1 знак
      }
    } catch(e){}

    // ── Полный приём (2026-09-18) ──
    // Тренировки за 7 дней: вид по-английски из плагина («Traditional Strength Training») → snake_case.
    var wk = await samples('workoutType', daysAgoISO(7), nowISO());
    var wl = wk.map(function(w){
      var st = new Date(w.startDate), mins = Number(w.duration) * 60;
      if(isNaN(st) || !(mins > 0)) return null;
      return { day: localDay(st), activity: String(w.workoutActivityName || '').trim().toLowerCase().replace(/\s+/g, '_'), minutes: mins };
    }).filter(Boolean);
    if(wl.length) out.workouts = wl;
    // Шаги за вчера (календарные сутки). iPhone и часы пишут шаги ПАРАЛЛЕЛЬНО — простая сумма
    // считала бы их дважды. Суммируем по каждому источнику и берём самый полный.
    var y0 = new Date(); y0.setHours(0,0,0,0); var y1 = new Date(y0); y0.setDate(y0.getDate() - 1);
    var bySrc = {};
    (await samples('stepCount', y0.toISOString(), y1.toISOString())).forEach(function(s){
      var v = Number(s.value); if(!(v > 0)) return;
      var k = s.sourceBundleId || s.source || '?'; bySrc[k] = (bySrc[k] || 0) + v;
    });
    var stepMax = Math.max.apply(null, [0].concat(Object.keys(bySrc).map(function(k){ return bySrc[k]; })));
    if(stepMax > 0) out.steps = Math.round(stepMax);
    // Частота дыхания — среднее за сон (днём её искажает движение).
    if(nightStart && nightEnd){ var rr = await avgInWindow('respiratoryRate', nightStart.toISOString(), nightEnd.toISOString()); if(rr != null) out.respRate = rr; }
    // Вес — последний замер за 7 дней (кг). Давление — последняя пара за сутки (мм рт. ст.).
    var wt = await lastSample('weight', 7); if(wt && wt.value != null) out.weight = Number(wt.value);
    var bs = await lastSample('bloodPressureSystolic', 1), bd = await lastSample('bloodPressureDiastolic', 1);
    if(bs && bd && bs.value != null && bd.value != null){ out.bpSys = Number(bs.value); out.bpDia = Number(bd.value); }
    return out;
  };

  // Заполняет поля карточки Apple Health значениями из HealthKit и применяет (applyManual).
  window.healthkitFillApple = async function(){
    var data = await window.healthkitRead(); if(!data) return false;
    function set(id, v){ var el = document.getElementById(id); if(el && v != null && !isNaN(v)) el.value = v; }
    set('m-hrv', data.hrv); set('m-rhr', data.rhr); set('m-sleep', data.sleep);
    set('m-deep', data.deep); set('m-vo2', data.vo2);
    if(typeof window.applyManual === 'function') window.applyManual();
    // SpO2 и темп. отклонение нет среди m-* полей карточки → кладём напрямую через applyExtracted
    // (applyManual к тому же округлил бы tempDev до целого, потеряв доли °C).
    var extra = {};
    if(data.spo2 != null)    extra.spo2 = data.spo2;
    if(data.tempDev != null) extra.tempDev = data.tempDev;
    if(Object.keys(extra).length && typeof window.applyExtracted === 'function'){
      window.applyExtracted(extra, 'apple');
    }
    window._vialHealthExtras(data, 'apple');
    if(typeof window.updateImportSummary === 'function') window.updateImportSummary();
    return Object.keys(data).length > 0;
  };
})();
