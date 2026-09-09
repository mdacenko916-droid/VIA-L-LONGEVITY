/* VIA·L — IAP bridge: подписка €30/мес (RevenueCat, плагин @revenuecat/purchases-capacitor).
   Google Play — настроен 2026-09-08 (продукт via_l_pro_monthly:monthly, entitlement via_l_pro).
   App Store — ключ-заглушка: членство Apple Developer оплачено и запись приложения в ASC есть
   (сборка Xcode Cloud дошла до TestFlight 2026-09-03), но второе приложение в проекте RevenueCat
   и сам продукт-подписка ещё не заведены. Пока ключа нет, платформа сама себя отключает.
   Работает ТОЛЬКО внутри приложения (window.Capacitor.Plugins.Purchases). На обычном вебе —
   все функции no-op, страница остаётся открытой как сейчас (веб-версия не платная).
   Что осталось сделать для iOS (владелец, порядок важен):
     1) В существующий проект RevenueCat «VIA-L» добавить ВТОРОЕ приложение — App Store,
        bundle id com.viael.vial (нужен ключ App Store Connect API для проверки чеков).
     2) В App Store Connect создать auto-renewable subscription €30/мес, привязать к RevenueCat.
     3) Добавить продукт в тот же Entitlement ENTITLEMENT_ID и в Offering "default" (Monthly).
     4) Вставить сюда реальный iOS API key (appl_…) вместо заглушки.
   Пока ключ не вставлен — rcKey() отдаёт пустую строку, IAP считается отсутствующим (как на
   вебе) и приложение на iOS остаётся открытым: см. комментарий у window.iapAvailable ниже. */
(function(){
  /* Ключи RevenueCat разные на платформу, entitlement — ОДИН на обе, чтобы обе платформы
     проверяли доступ по одному имени и офферинг был общим.
     ⚠️ Общий entitlement НЕ означает переноса покупки между сторами. logIn() и своего
     App User ID здесь нет — SDK работает в анонимном режиме, идентификатор свой на каждую
     установку, связать покупателя Google Play с ним же на iPhone нечем. Что реально работает:
     «Восстановить покупки» ВНУТРИ одного стора (второй Android под тем же Google-аккаунтом
     подписку вернёт — об этом знает сам Play; так же и Apple ID в App Store). Кросс-стор
     перенос потребовал бы общего идентификатора, то есть входа, которого у нас сознательно нет.
     Ключи публичные (public SDK key) — их и положено зашивать в приложение. 2026-09-08. */
  var RC_API_KEYS = {
    android: 'goog_BHsIdgHZJEhYqOpcDbQoVQFbFPC',
    ios:     'YOUR_REVENUECAT_IOS_API_KEY',   // TODO: appl_… — после заведения App Store-приложения в RevenueCat
  };
  var ENTITLEMENT_ID = 'via_l_pro';                       // должен совпадать с Entitlement ID в RevenueCat

  function rcKey(){
    var pl = '';
    try { pl = (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform()) || ''; } catch(e){}
    var k = RC_API_KEYS[pl];
    return (k && k.indexOf('YOUR_') !== 0) ? k : '';     // заглушка = ключа нет
  }

  function rc(){
    return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Purchases) || null;
  }
  /* Раньше здесь жил ручной флаг TEST_BYPASS_PAYWALL: без него живое устройство упиралось в
     незакрываемый пейволл, потому что ключа RevenueCat ещё не было. Снят 2026-09-08 — вместе с
     появлением ключа Google Play. Вместо флага решает НАЛИЧИЕ КЛЮЧА для текущей платформы:
     Android (ключ есть) → пейволл работает; iOS (пока заглушка) → IAP считается отсутствующим,
     как на вебе, и приложение остаётся открытым. Так забытый флаг больше не может закрыть
     доступ на платформе, где покупка ещё не настроена. */
  window.iapAvailable = function(){ return !!rc() && !!rcKey(); };

  var _configured = false;
  async function ensureConfigured(){
    var p = rc(); if(!p) return false;
    if(_configured) return true;
    var key = rcKey(); if(!key) return false;
    try { await p.configure({ apiKey: key }); _configured = true; return true; }
    catch(e){ console.warn('[iap] configure failed', e); return false; }
  }

  // Проверка активной подписки. Возвращает true/false, кэширует флаг в localStorage
  // (vialp_entitlement) — читается синхронно другими частями UI без повторного await.
  window.iapCheckEntitlement = async function(){
    var p = rc(); if(!p) return false;
    var ok = await ensureConfigured(); if(!ok) return false;
    try {
      var r = await p.getCustomerInfo();
      var active = !!(r && r.customerInfo && r.customerInfo.entitlements &&
                       r.customerInfo.entitlements.active && r.customerInfo.entitlements.active[ENTITLEMENT_ID]);
      try { localStorage.setItem('vialp_entitlement', active ? '1' : '0'); } catch(e){}
      return active;
    } catch(e){ console.warn('[iap] getCustomerInfo failed', e); return false; }
  };

  // Текущий package для покупки (Offering "default" → первый пакет, у нас одна подписка).
  window.iapGetPackage = async function(){
    var p = rc(); if(!p) return null;
    var ok = await ensureConfigured(); if(!ok) return null;
    try {
      var offerings = await p.getOfferings();
      var cur = offerings && offerings.current;
      return (cur && cur.availablePackages && cur.availablePackages[0]) || null;
    } catch(e){ console.warn('[iap] getOfferings failed', e); return null; }
  };

  // Покупка. Возвращает {ok:true} при успехе (в т.ч. если пользователь уже был подписан),
  // {ok:false, cancelled:true} при отмене пользователем, {ok:false, error} при сбое.
  window.iapPurchase = async function(pkg){
    var p = rc(); if(!p || !pkg) return { ok:false };
    try {
      var res = await p.purchasePackage({ aPackage: pkg });
      var active = !!(res && res.customerInfo && res.customerInfo.entitlements &&
                       res.customerInfo.entitlements.active && res.customerInfo.entitlements.active[ENTITLEMENT_ID]);
      try { localStorage.setItem('vialp_entitlement', active ? '1' : '0'); } catch(e){}
      return { ok: active };
    } catch(e){
      var cancelled = !!(e && (e.userCancelled || (e.message||'').toLowerCase().indexOf('cancel')>=0));
      return { ok:false, cancelled: cancelled, error: e };
    }
  };

  window.iapRestore = async function(){
    var p = rc(); if(!p) return false;
    var ok = await ensureConfigured(); if(!ok) return false;
    try {
      var r = await p.restorePurchases();
      var active = !!(r && r.customerInfo && r.customerInfo.entitlements &&
                       r.customerInfo.entitlements.active && r.customerInfo.entitlements.active[ENTITLEMENT_ID]);
      try { localStorage.setItem('vialp_entitlement', active ? '1' : '0'); } catch(e){}
      return active;
    } catch(e){ console.warn('[iap] restorePurchases failed', e); return false; }
  };
})();
