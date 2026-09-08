/* VIA·L — IAP bridge: подписка €30/мес (RevenueCat, плагин @revenuecat/purchases-capacitor).
   Google Play — настроен 2026-09-08 (продукт via_l_pro_monthly:monthly, entitlement via_l_pro).
   App Store — ждёт оплаты Apple Developer; ключ-заглушка, платформа сама себя отключает.
   Работает ТОЛЬКО внутри приложения (window.Capacitor.Plugins.Purchases). На обычном вебе —
   все функции no-op, страница остаётся открытой как сейчас (веб-версия не платная).
   Настройка перед первым релизом (владелец):
     1) Создать проект в RevenueCat dashboard, добавить iOS-приложение (bundle id com.viael.vial).
     2) В App Store Connect создать auto-renewable subscription €30/мес, привязать к RevenueCat.
     3) В RevenueCat создать Entitlement с идентификатором ENTITLEMENT_ID (см. константу ниже) и
        Offering "default" с этим продуктом как package (Monthly).
     4) Вставить сюда реальный iOS API key вместо RC_API_KEY_IOS.
   Пока ключ не вставлен — configure() будет падать в try/catch, paywall останется видимым
   (fail-closed: это правильно для непроверенной конфигурации, не должно молча открывать доступ). */
(function(){
  /* Ключи RevenueCat разные на платформу, entitlement — ОДИН на обе: человек, купивший
     подписку на телефоне, должен получить доступ и на планшете, и позже на iPhone.
     Ключи публичные (public SDK key) — их и положено зашивать в приложение. 2026-09-08. */
  var RC_API_KEYS = {
    android: 'goog_BHsIdgHZJEhYqOpcDbQoVQFbFPC',
    ios:     'YOUR_REVENUECAT_IOS_API_KEY',   // TODO: появится вместе с оплатой Apple Developer
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
