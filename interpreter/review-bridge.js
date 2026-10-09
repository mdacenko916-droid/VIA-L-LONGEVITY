/* VIA·L — системное окно «Оцените приложение» (2026-10-08).
   Плагин @capacitor-community/in-app-review: iOS — SKStoreReviewController, Android — Play In-App Review.
   На вебе плагина нет — модуль ничего не делает.

   Когда просим: человек уже пользуется, а не пробует —
     • не в пробные дни (_isTrial);
     • в истории разборов не меньше 3 РАЗНЫХ дней (vialp_ai_daily);
     • с прошлой просьбы прошло ≥120 дней, всего не больше 3 раз.
   Показывать ли окно на самом деле, решает система (Apple — не больше 3 раз в год), поэтому
   «попросили» ≠ «показали»; своё ограничение нужно, чтобы не дёргать систему на каждом разборе.
   Окно — через 6 с после появления разбора и только если экран на виду: не перебиваем чтение. */
(function () {
  var KEY = 'vialp_review_asks', MIN_DAYS = 7, GAP = 120 * 86400000, MAX_ASKS = 3, DELAY = 6000;
  var timer = null;

  function plug() {
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.InAppReview) || null;
  }
  function asks() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function daysWithAnalysis() {
    try {
      var arr = (typeof _aiDailyGet === 'function') ? _aiDailyGet() : [], set = {};
      arr.forEach(function (e) { if (e && e.day && e.analysis) set[e.day] = 1; });
      return Object.keys(set).length;
    } catch (e) { return 0; }
  }
  function eligible() {
    if (!plug()) return false;
    try { if (typeof _isTrial === 'function' && _isTrial()) return false; } catch (e) { return false; }
    var a = asks();
    if (a.length >= MAX_ASKS) return false;
    if (a.length && Date.now() - a[a.length - 1] < GAP) return false;
    return daysWithAnalysis() >= MIN_DAYS;
  }
  function ask() {
    timer = null;
    if (document.visibilityState !== 'visible' || !eligible()) return;
    var r = document.getElementById('aiResult');
    if (!r || r.style.display === 'none' || !(r.textContent || '').trim()) return;
    try { var a = asks(); a.push(Date.now()); localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { return; }
    try { plug().requestReview(); } catch (e) {}
  }

  function watch() {
    var r = document.getElementById('aiResult'); if (!r || !plug()) return;
    new MutationObserver(function () {
      if (timer || !eligible()) return;
      timer = setTimeout(ask, DELAY);
    }).observe(r, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
