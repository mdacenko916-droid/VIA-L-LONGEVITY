/* VIA·L — IAP bridge: месячная подписка (RevenueCat, плагин @revenuecat/purchases-capacitor).
   ⚠️ ЦЕНЫ ЗДЕСЬ НЕТ И НЕ ДОЛЖНО БЫТЬ. База €29,99, США/Канада $34,99, дальше по странам своя —
   пейволл берёт цену из стора (`priceString`, см. _iapPriceFill в interpreter-via-l.html).
   Зашитая цифра врала бы всем за пределами еврозоны и расходилась бы с фактическим списанием.
   Google Play — настроен 2026-09-08 (продукт via_l_pro_monthly:monthly, entitlement via_l_pro).
   App Store — настроен 2026-09-09 (продукт via_l_pro_monthly, entitlement via_l_pro, ключ на месте).
   Работает ТОЛЬКО внутри приложения (window.Capacitor.Plugins.Purchases). На обычном вебе —
   все функции no-op, страница остаётся открытой как сейчас (веб-версия не платная).
   Настройка iOS завершена 2026-09-09: приложение App Store заведено вторым в проекте RevenueCat
   «VIA-L», продукт `via_l_pro_monthly` (группа «VIA-L Subscriptions», база €29,99, США $34,99)
   привязан к entitlement ENTITLEMENT_ID и к Offering "default". Ключ ниже — публичный SDK key,
   его и положено зашивать в приложение. */
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
    ios:     'appl_otTgmSBqRgDJFfLFrcIaldOYqGd',
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

  // Флаги подписки для синхронного UI: vialp_entitlement — доступ есть; vialp_ent_trial — это бесплатный
  // пробный период МАГАЗИНА (periodType TRIAL, 2026-10-31): карта привязана, разбор в эти дни остаётся коротким.
  function saveEnt(ci) {
    var e = ci && ci.entitlements && ci.entitlements.active && ci.entitlements.active[ENTITLEMENT_ID];
    try { localStorage.setItem('vialp_entitlement', e ? '1' : '0'); localStorage.setItem('vialp_ent_trial', e && String(e.periodType || '').toUpperCase() === 'TRIAL' ? '1' : '0'); } catch(x){}
    return !!e;
  }

  // Каким тарифам магазин сейчас даст бесплатную неделю (2026-10-31). iOS — спрашиваем право на вводное
  // предложение (одно на Apple ID в группе); Android — Play отдаёт бесплатную фазу только тем, кому она положена.
  // Возвращает {productId:true}; флаг vialp_st_offer = «пробник магазина существует» — по нему приложение
  // даёт без карты 1 день вместо 7 (пока в сторе предложения нет — всё по-старому).
  window.iapTrialEligible = async function(pkgs){
    var p = rc(), out = {}; if(!p || !pkgs || !pkgs.length) return out;
    var free = pkgs.filter(function(k){ var ip = k && k.product && k.product.introPrice; return ip && Number(ip.price) === 0; });
    try { localStorage.setItem('vialp_st_offer', free.length ? '1' : '0'); } catch(e){}
    if(!free.length) return out;
    if(window.iapPlatform() === 'ios' && p.checkTrialOrIntroductoryPriceEligibility){
      try {
        var r = await p.checkTrialOrIntroductoryPriceEligibility({ productIdentifiers: free.map(function(k){ return k.product.identifier; }) });
        free.forEach(function(k){ var x = r && r[k.product.identifier]; if(x && Number(x.status) === 2) out[k.product.identifier] = true; });   // 2 = ELIGIBLE
      } catch(e){ console.warn('[iap] eligibility failed', e); }
    } else free.forEach(function(k){ out[k.product.identifier] = true; });
    return out;
  };

  // Проверка активной подписки. Возвращает true/false, кэширует флаг в localStorage
  // (vialp_entitlement) — читается синхронно другими частями UI без повторного await.
  window.iapCheckEntitlement = async function(){
    var p = rc(); if(!p) return false;
    var ok = await ensureConfigured(); if(!ok) return false;
    try {
      var r = await p.getCustomerInfo();
      return saveEnt(r && r.customerInfo);
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

  // ВСЕ варианты из текущего Offering: месяц, год, навсегда (линейка 2026-09-24: €14,99 / €99,99 /
  // €199,99). Порядок и подписи решает экран; здесь — только то, что реально заведено в сторе и
  // RevenueCat. Пока год и «навсегда» не заведены, вернётся один месячный — экран это переживёт.
  window.iapGetPackages = async function(){
    var p = rc(); if(!p) return [];
    var ok = await ensureConfigured(); if(!ok) return [];
    try {
      var offerings = await p.getOfferings();
      var cur = offerings && offerings.current;
      return (cur && cur.availablePackages) || [];
    } catch(e){ console.warn('[iap] getOfferings failed', e); return []; }
  };

  // Покупка. Возвращает {ok:true} при успехе (в т.ч. если пользователь уже был подписан),
  // {ok:false, cancelled:true} при отмене пользователем, {ok:false, error} при сбое.
  window.iapPurchase = async function(pkg){
    var p = rc(); if(!p || !pkg) return { ok:false };
    try {
      var res = await p.purchasePackage({ aPackage: pkg });
      return { ok: saveEnt(res && res.customerInfo) };
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
      return saveEnt(r && r.customerInfo);
    } catch(e){ console.warn('[iap] restorePurchases failed', e); return false; }
  };

  /* ── Разовая покупка «Разбор со специалистом» (docs/SPECIALIST-REVIEW-PLAN.md, 2026-10-02) ──
     Расходуемый товар: одна покупка — один письменный разбор. К entitlement не привязан и в Offering
     не лежит, поэтому берём его из стора напрямую по идентификатору. Покупку засчитывает СЕРВЕР
     (/review/claim сверяет чек с RevenueCat по идентификатору покупателя) — здесь только касса. */
  var REVIEW_PRODUCT_ID = 'via_l_specialist_review';
  // «Рекомендации на 3 месяца» (2026-11-02) — второй разовый товар, порядок тот же. kind='plan' во всех функциях ниже.
  var PLAN_PRODUCT_ID = 'via_l_specialist_plan';
  function _pid(kind){ return kind === 'plan' ? PLAN_PRODUCT_ID : REVIEW_PRODUCT_ID; }
  window.iapPlatform = function(){
    try { return (window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform()) || ''; } catch(e){ return ''; }
  };
  // Товар из стора (цена — product.priceString) или null: нет приложения, товар не заведён, нет сети.
  window.iapReviewProduct = async function(kind){
    var p = rc(); if(!p) return null;
    var ok = await ensureConfigured(); if(!ok) return null;
    try {
      var r = await p.getProducts({ productIdentifiers: [_pid(kind)], type: 'NON_SUBSCRIPTION' });
      if(kind === 'plan') return (r && r.products && r.products[0]) || null;   // диагностика — по разбору
      window._iapReviewDiag = 'products=' + ((r && r.products && r.products.length) || 0);
      return (r && r.products && r.products[0]) || null;
    } catch(e){ window._iapReviewDiag = 'error: ' + ((e && (e.message || e.code)) || e); console.warn('[iap] getProducts failed', e); return null; }
  };
  // Идентификатор покупателя в RevenueCat — по нему сервер находит чек.
  window.iapAppUserId = async function(){
    var p = rc(); if(!p) return '';
    var ok = await ensureConfigured(); if(!ok) return '';
    try { var r = await p.getAppUserID(); return (r && r.appUserID) || ''; } catch(e){ return ''; }
  };
  // Покупка разбора. {ok:true, rcUser} · {ok:false, cancelled:true} · {ok:false, error}.
  window.iapBuyReview = async function(product){
    var p = rc(); if(!p || !product) return { ok:false };
    try {
      await p.purchaseStoreProduct({ product: product });
      return { ok:true, rcUser: await window.iapAppUserId() };
    } catch(e){
      var cancelled = !!(e && (e.userCancelled || (e.message||'').toLowerCase().indexOf('cancel')>=0));
      return { ok:false, cancelled: cancelled, error: e };
    }
  };
  // Возврат за разбор: на iPhone — системное окно возврата Apple (iOS 15+). false = окна нет, показать запасной путь.
  window.iapRefundReview = async function(kind){
    var p = rc(); if(!p || window.iapPlatform() !== 'ios') return false;
    try {
      var prod = await window.iapReviewProduct(kind); if(!prod) return false;
      await p.beginRefundRequestForProduct({ storeProduct: prod });
      return true;
    } catch(e){ console.warn('[iap] refund request failed', e); return false; }
  };
})();
