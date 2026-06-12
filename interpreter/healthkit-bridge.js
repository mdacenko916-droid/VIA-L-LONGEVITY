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

  var READ_TYPES = ['heartRate','restingHeartRate','heartRateVariability','stepCount','sleepAnalysis','vo2Max'];

  function daysAgoISO(n){ var d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); }
  function nowISO(){ return new Date().toISOString(); }

  // Запрос разрешений Apple Health (системный экран). true — пользователь прошёл диалог.
  window.healthkitAuthorize = async function(){
    var p = hk(); if(!p) return false;
    try { await p.requestAuthorization({ all: [], read: READ_TYPES, write: [] }); return true; }
    catch(e){ return false; }
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
      if(asleepMin > 0) out.sleep = Math.round(asleepMin / 6) / 10; // часы, 1 знак
      if(deepMin > 0)   out.deep  = Math.round(deepMin);
    } catch(e){}
    // HRV (SDNN): среднее по сэмплам внутри окна сна, сопоставимо с ночной HRV кольца.
    // Фолбэк на последний сэмпл, если ночь не размечена (нет sleepAnalysis за сутки).
    var hrvVal = null;
    if(nightStart && nightEnd) hrvVal = await avgInWindow('heartRateVariability', nightStart.toISOString(), nightEnd.toISOString());
    if(hrvVal == null){ var hrv = await lastSample('heartRateVariability'); if(hrv && hrv.value != null) hrvVal = Number(hrv.value); }
    if(hrvVal != null && !isNaN(hrvVal)) out.hrv = Math.round(hrvVal);
    var rhr = await lastSample('restingHeartRate');     if(rhr && rhr.value != null) out.rhr = Math.round(Number(rhr.value));
    var vo2 = await lastSample('vo2Max');               if(vo2 && vo2.value != null) out.vo2 = Math.round(Number(vo2.value));
    return out;
  };

  // Заполняет поля карточки Apple Health значениями из HealthKit и применяет (applyManual).
  window.healthkitFillApple = async function(){
    var data = await window.healthkitRead(); if(!data) return false;
    function set(id, v){ var el = document.getElementById(id); if(el && v != null && !isNaN(v)) el.value = v; }
    set('m-hrv', data.hrv); set('m-rhr', data.rhr); set('m-sleep', data.sleep);
    set('m-deep', data.deep); set('m-vo2', data.vo2);
    if(typeof window.applyManual === 'function') window.applyManual();
    return Object.keys(data).length > 0;
  };
})();
