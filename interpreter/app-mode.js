/* VIA·L — «режим приложения». Когда ИП открыт ВНУТРИ нативной обёртки (Capacitor),
   прячем то, что нельзя в App Store / Google Play:
   • тарифы EXPERT / ELITE,
   • любые ссылки на внешнюю оплату Hotmart (правило anti-steering — иначе ревью отклонит),
   • ссылку «← Сайт» и кнопку «Кабінет» (кабинет — для специалистов, не для пациента).
   Остаются: VIO (бесплатно) + PRO. На обычном вебе скрипт НИЧЕГО не меняет.
   Спека: docs/MOBILE-APP-MODEL.md §2. Подключён ко всем ИП-страницам. */
(function(){
  var NOTE = {
    uk:'Придбання PRO у застосунку зʼявиться найближчим часом через магазин застосунків.',
    ru:'Оформление PRO в приложении появится в ближайшее время через магазин приложений.',
    en:'In-app PRO purchase is coming soon via the app store.',
    es:'La compra de PRO en la app llegará pronto a través de la tienda de apps.',
    de:'Der PRO-Kauf in der App kommt bald über den App-Store.',
    pt:'A compra do PRO no app chegará em breve pela loja de apps.',
    fr:'L’achat PRO dans l’app arrivera bientôt via la boutique d’apps.',
    pl:'Zakup PRO w aplikacji wkrótce przez sklep z aplikacjami.',
    it:'L’acquisto PRO nell’app arriverà presto tramite lo store.',
    he:'רכישת PRO באפליקציה תגיע בקרוב דרך חנות האפליקציות.',
    ja:'アプリ内のPRO購入は近日アプリストアより対応予定です。',
    ko:'앱 내 PRO 구매는 곧 앱스토어를 통해 제공됩니다.'
  };
  function noteLang(){ try { var l = localStorage.getItem('vial_lang'); return NOTE[l] ? l : 'en'; } catch(e){ return 'en'; } }

  function apply(){
    if (!window.Capacitor) return false;                 // только внутри приложения
    var html = document.documentElement;
    if (!html.classList.contains('app-mode')) {
      html.classList.add('app-mode');
      // Системные отступы «чёлки»/статус-бара: включаем viewport-fit=cover (иначе env() = 0)
      var vp = document.querySelector('meta[name="viewport"]');
      if (vp && vp.content.indexOf('viewport-fit') < 0) vp.setAttribute('content', vp.content + ', viewport-fit=cover');
      var css = document.createElement('style');
      css.textContent =
        'html.app-mode .plan-expert,html.app-mode .plan-elite{display:none !important;}' +
        'html.app-mode .menu-item[data-t="nav_site"],html.app-mode .cabinet-btn{display:none !important;}' +
        // лендинг: шапка <header> опускается ниже статус-бара/Dynamic Island
        'html.app-mode header{padding-top:calc(env(safe-area-inset-top,0px) + 12px) !important;}' +
        // страницы-инструменты (VIO/PRO): весь контейнер #app сдвигаем ниже системной зоны
        // (низ уже учитывает env(safe-area-inset-bottom) в .bottom-nav)
        'html.app-mode #app{top:env(safe-area-inset-top,0px) !important;}';
      (document.head || html).appendChild(css);
    }
    // Платёж внутри приложения НЕ ведём на Hotmart (PRO-покупка появится через IAP магазина).
    window._openHotmart = function(){ alert(NOTE[noteLang()]); };
    return true;
  }

  if (!apply()) {                                        // Capacitor мог инжектиться чуть позже
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
    setTimeout(apply, 800);
  }
})();
