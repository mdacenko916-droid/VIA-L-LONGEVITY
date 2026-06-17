/* VIA·L — Health Connect bridge: нативный Health Connect (Android) → поля карточки в ИП.
   Работает ТОЛЬКО внутри приложения на Android (Capacitor + локальный плагин HealthConnectVial,
   app/plugins/health-connect). На вебе и на iOS window.Capacitor.Plugins.HealthConnectVial
   отсутствует → все функции no-op (на iOS работает Apple-мост healthkit-bridge.js).
   Зеркало healthkit-bridge.js: плагин сам нормализует метрики в нативе и отдаёт
   {hrv, rhr, vo2, spo2, sleepHours, deepMin, steps} — мост только раскладывает их по полям. */
(function () {
  function hc() {
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.HealthConnectVial) || null;
  }

  // Есть ли натив-плагин в принципе (мы внутри Android-приложения со встроенным плагином).
  window.healthConnectPresent = function () { return !!hc(); };

  // Доступен ли Health Connect на устройстве (установлен провайдер). Промис → {available,status}.
  window.healthConnectAvailable = async function () {
    var p = hc(); if (!p) return { available: false, status: 'absent' };
    try { return await p.isAvailable(); }
    catch (e) { return { available: false, status: 'error' }; }
  };

  // Заполняет поля карточки значениями из Health Connect и применяет (applyManual + applyExtracted).
  window.healthConnectFill = async function () {
    var p = hc(); if (!p) return false;
    var data;
    try { data = await p.readMetrics(); } catch (e) { return false; }
    if (!data) return false;
    function set(id, v) { var el = document.getElementById(id); if (el && v != null && !isNaN(v)) el.value = v; }
    set('m-hrv', data.hrv); set('m-rhr', data.rhr); set('m-sleep', data.sleepHours);
    set('m-deep', data.deepMin); set('m-vo2', data.vo2);
    if (typeof window.applyManual === 'function') window.applyManual();
    // SpO2 нет среди m-* полей карточки → кладём напрямую через applyExtracted (как Apple-мост).
    var extra = {};
    if (data.spo2 != null) extra.spo2 = data.spo2;
    if (Object.keys(extra).length && typeof window.applyExtracted === 'function') {
      window.applyExtracted(extra, 'healthconnect');
      if (typeof window.updateImportSummary === 'function') window.updateImportSummary();
    }
    return Object.keys(data).length > 0;
  };

  // Обработчик кнопки «Health Connect»: запрос прав → чтение → заполнение.
  window.healthConnectImport = function (btn) {
    var p = hc(); if (!p) return;
    if (btn.disabled) return;
    var t = btn.textContent; btn.disabled = true; btn.textContent = '…';
    Promise.resolve(p.requestPermissions()).then(function (r) {
      if (!r || !r.granted) throw 0;
      return window.healthConnectFill();
    }).then(function (filled) {
      btn.disabled = false; btn.textContent = filled ? '✓ Health Connect' : t;
      setTimeout(function () { btn.textContent = t; }, 2500);
    }).catch(function () { btn.disabled = false; btn.textContent = t; });
  };

  // Показать кнопку «Health Connect», если плагин есть и провайдер доступен на устройстве.
  function reveal() {
    if (!hc()) return;
    window.healthConnectAvailable().then(function (a) {
      if (a && a.available) {
        var b = document.getElementById('hc-btn'); if (b) b.style.display = '';
      }
    });
  }
  if (document.readyState !== 'loading') reveal(); else document.addEventListener('DOMContentLoaded', reveal);
  setTimeout(reveal, 1500);
})();
