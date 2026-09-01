/* VIA·L — «режим приложения». Когда ИП открыт ВНУТРИ нативной обёртки (Capacitor),
   приводим вид к «как родное приложение»:
   • прячем тарифы EXPERT/ELITE и любые ссылки на внешнюю оплату Hotmart (anti-steering),
     ссылку «← Сайт» и «Кабінет» (кабинет — для специалистов, не для пациента);
   • safe-area: контент ниже статус-бара/«чёлки»;
   • компактный логотип VL вверху (он же = «домой»).
   На обычном вебе скрипт НИЧЕГО не меняет. Спека: docs/MOBILE-APP-MODEL.md §2. */
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
  function curLang(){ try { return localStorage.getItem('vial_lang') || 'en'; } catch(e){ return 'en'; } }
  function noteLang(){ var l = curLang(); return NOTE[l] ? l : 'en'; }

  // Пятый таб «Специалист» УДАЛЁН 2026-09-01: он дублировал штатный пункт «Мой наставник»
  // (nav-guide → my-specialist.html) и не влезал в ряд — подпись обрезалась в «СПЕЦ».
  // Таб-бар в приложении = ровно четыре пункта разметки.

  function apply(){
    if (!window.Capacitor) return false;                 // только внутри приложения
    var html = document.documentElement;
    if (!html.classList.contains('app-mode')) {
      html.classList.add('app-mode');
      var vp = document.querySelector('meta[name="viewport"]');
      if (vp && vp.content.indexOf('viewport-fit') < 0) vp.setAttribute('content', vp.content + ', viewport-fit=cover');
      var css = document.createElement('style');
      css.textContent =
        // тариф ELITE, ссылка «← Сайт» и «Кабинет» — только на лендинге interpreter/index.html
        // (anti-steering Apple + кабинет для специалистов). Правила .plan-expert и .topbar-home
        // сняты 2026-09-01: таких элементов нет ни на одной из страниц приложения.
        'html.app-mode .plan-elite{display:none !important;}' +
        'html.app-mode .menu-item[data-t="nav_site"],html.app-mode .cabinet-btn{display:none !important;}' +
        // таб-бар: четыре равные колонки — иконки встают строго по центрам и не «плывут»
        // вслед за разной длиной подписей (space-around делил остаток, а не ширину). 2026-09-01.
        'html.app-mode .bottom-nav{justify-content:space-between !important;}' +
        'html.app-mode .bottom-nav-item{flex:1 1 0 !important;min-width:0 !important;padding-left:2px !important;padding-right:2px !important;}' +
        'html.app-mode .bottom-nav-item span{font-size:10px !important;letter-spacing:0 !important;white-space:nowrap !important;}' +
        // строгие переходы шагов в app: появление без «падения» сверху — только проявление
        'html.app-mode .step.active{animation:appStepIn .18s ease both !important;}' +
        '@keyframes appStepIn{from{opacity:0}to{opacity:1}}' +
        // плотный режим: меньше прокрутки вниз — поджимаем вертикальные отступы шага
        // верхний отступ под компактный app-логотип (42px), а не под веб-логотип (50px) —
        // поднимает карточки к верху и убирает лишнюю высоту (почти-влезающие шаги фиксируются)
        'html.app-mode #scroll-area{padding-top:64px !important;}' +
        'html.app-mode .progress-wrap{margin-bottom:10px !important;}' +
        'html.app-mode .card{padding:16px 14px !important;margin-bottom:8px !important;}' +
        'html.app-mode .btn-row{margin-top:14px !important;}' +
        // результат: убираем горизонтальный «слив» (overflow-x:clip иногда не работает в iOS WebView)
        'html.app-mode,html.app-mode body{overflow-x:hidden !important;}' +
        'html.app-mode #scroll-area{overflow-x:hidden !important;}' +
        'html.app-mode .pro-module{overflow:hidden;}' +
        // «ВАШ РЕЗУЛЬТАТ» — НЕТ мелкого текста: вся проза/тело в каждом блоке = 15px, контрастно (.92), как ТГ.
        'html.app-mode .mod-explain,html.app-mode .nutri-text,html.app-mode .nutri-title,html.app-mode .nutri-dose,html.app-mode .prot-name,html.app-mode .prot-detail,html.app-mode .tl-name,html.app-mode .tl-detail,html.app-mode .circ-nutr-item,html.app-mode .insight-text,html.app-mode .insight-title,html.app-mode .cta-desc,html.app-mode .max-desc,html.app-mode .source-name,html.app-mode .source-desc,html.app-mode .result-sub{font-size:15px !important;line-height:1.55 !important;color:rgba(255,255,255,.92) !important;}' +
        // имена строк/времена/значения — не мельче 13px
        'html.app-mode .tl-time,html.app-mode .prot-time,html.app-mode .circ-nutr-time,html.app-mode .mod-sub,html.app-mode .horm-name,html.app-mode .bio-bar-label,html.app-mode .bio-bar-val{font-size:13px !important;color:var(--t2) !important;}' +
        // мини-подзаголовки/eyebrow/дисклеймер/бейджи — не мельче 12px (никакого микротекста)
        'html.app-mode .result-eyebrow,html.app-mode .result-steps-label,html.app-mode .circ-nutr-title,html.app-mode .prot-block-title,html.app-mode .disclaimer,html.app-mode .horm-status,html.app-mode .nutri-nutrient,html.app-mode .bio-lbl,html.app-mode .score-lbl,html.app-mode .max-badge{font-size:12px !important;}' +
        // ползунок: у .slider-labels не было CSS → подписи краёв слипались («сил10») и налезали на шкалу.
        // Разносим по краям, компактно, с отступом от шкалы.
        'html.app-mode .slider-labels{display:flex !important;justify-content:space-between !important;gap:16px !important;font-size:11px !important;color:var(--t3) !important;margin-top:10px !important;line-height:1.35 !important;}' +
        // заголовок шага — ярко-белый (тонкий Playfair казался серым)
        'html.app-mode .step-title{color:#fff !important;}' +
        // вывод QoL + текст анализа ИИ + «Рекомендуемые анализы» + фичи CTA → 15px, контрастно (как ТГ)
        'html.app-mode #qolDesc{font-size:15px !important;color:rgba(255,255,255,.92) !important;line-height:1.6 !important;}' +
        'html.app-mode #aiResult{font-size:15px !important;color:rgba(255,255,255,.92) !important;line-height:1.7 !important;}' +
        'html.app-mode .rec-list li{font-size:15px !important;color:#fff !important;}' +
        'html.app-mode #cta-marina span[data-t^="cta_f"]{font-size:14.5px !important;color:rgba(255,255,255,.9) !important;}' +
        // хвосты: добиваем оставшееся мелкое/тусклое до нормы
        'html.app-mode .doctor-alert{font-size:14px !important;color:rgba(255,170,170,.95) !important;}' +
        'html.app-mode .doctor-alert strong{font-size:14.5px !important;}' +
        'html.app-mode .prot-tag{font-size:11.5px !important;}' +
        'html.app-mode .max-textarea{font-size:15px !important;}' +
        'html.app-mode .max-btn{font-size:14px !important;}' +
        'html.app-mode .score-badge{font-size:12.5px !important;}' +
        // панель «История» (fixed inset:0) — отступ под чёлку/Dynamic Island, иначе ✕ не виден
        'html.app-mode #historyPanel{padding-top:calc(env(safe-area-inset-top,0px) + 20px) !important;}' +
        // iOS автозумит страницу при фокусе на поле со шрифтом <16px (отсюда «страница шире и ездит»
        // при открытии советника/ввода). Делаем все поля ввода 16px — зум отключается.
        'html.app-mode input,html.app-mode textarea,html.app-mode select{font-size:16px !important;}' +
        // ── ЕДИНЫЙ ШАБЛОН ШАГОВ (0 → результат) ──
        // убрать разноцветные свечения за карточками (у каждого шага свой цвет → пестро)
        'html.app-mode .card::before{display:none !important;}' +
        // метки полей/секций были бледные (.72 / 10px) — ярче и крупнее, читаемо
        'html.app-mode .manual-label,html.app-mode .input-group label{color:rgba(255,255,255,.92) !important;font-size:11px !important;}' +
        // единые читаемые размеры: подзаголовок, чипы выбора, кнопки, бейдж шага
        'html.app-mode .step-desc{color:rgba(255,255,255,.85) !important;font-size:13.5px !important;}' +
        'html.app-mode .chip label{font-size:12.5px !important;}' +
        'html.app-mode .btn,html.app-mode .btn-primary,html.app-mode .btn-back{font-size:12.5px !important;}' +
        'html.app-mode .step-badge{font-size:10px !important;}' +
        // логотип Logo_IP компактнее в приложении (на вебе остаётся 50px)
        'html.app-mode .lang-logo-img{height:42px !important;}' +
        // кнопки шага: как в браузере — горизонтально, короткая «назад» + длинная «далее»
        // (на узком экране базовый @media ставит их в столбик и растягивает «назад»)
        'html.app-mode .btn-row{flex-direction:row !important;}' +
        'html.app-mode .btn-back{flex:0 0 auto !important;}' +
        // футер-ссылка «← На главную» в приложении лишняя (логотип уже = домой)
        'html.app-mode .footer-back{display:none !important;}' +
        // футер прячем только внутри прохода/результата (прокрутка упирается в границу шага).
        // На стартовом экране подпись бренда со слоганом остаётся — как в PWA. 2026-09-01.
        'html.app-mode body.flow-mode footer,html.app-mode body.view-result footer{display:none !important;}' +
        // лендинг: шапка <header> ниже статус-бара/Dynamic Island
        'html.app-mode header{padding-top:calc(env(safe-area-inset-top,0px) + 12px) !important;}' +
        // инструменты (VIO/PRO): весь #app ниже системной зоны (низ уже учтён в .bottom-nav)
        // height:100vh при сдвинутом top уводит НИЗ за экран ровно на высоту чёлки — вместе с ним
        // пропадала нижняя навигация («Сегодня / Наш подход / Мой наставник / Мой профиль»).
        // Вычитаем сдвиг из высоты. 2026-08-31.
        'html.app-mode #app{top:env(safe-area-inset-top,0px) !important;height:calc(100vh - env(safe-area-inset-top,0px)) !important;}' +
        // …а раз #app уже опущен, собственный отступ топбара под «чёлку» становится ВТОРЫМ:
        // шапка «Анализ VIA-L» уезжала на две высоты чёлки вниз и налезала на карточку разбора,
        // а сверху оставался пустой беж. На вебе задвоения нет — там #app стоит в нуле.
        // 2026-08-31, поймано на TestFlight-сборке.
        'html.app-mode #topbar{padding-top:0 !important;}' +
        // …и по той же причине ВТОРАЯ safe-area сидела в фейде под шапкой: #topbar::before
        // отмерял height = safe-area + 12px уже НИЖЕ опущенного #app, и сплошной беж тянулся
        // на две высоты чёлки (скрин владельца: белая полоса до половины первой карточки).
        // В приложении фейд = только растушёвка, статус-бар закрашивает сам сдвиг #app.
        // 2026-09-01. В EXPERT-PWA (#app в нуле) правило не действует — там фейд прежний.
        'html.app-mode #topbar::before{height:14px !important;background:linear-gradient(to bottom,#EAE1C9 0%,rgba(234,225,201,0) 100%) !important;}';
      (document.head || html).appendChild(css);
    }
    // Платёж внутри приложения НЕ ведём на Hotmart (PRO-покупка появится через IAP магазина).
    window._openHotmart = function(){ alert(NOTE[noteLang()]); };
    // Логотип топ-бара в приложении = «домой» ВНУТРИ инструмента, а не выход на лендинг.
    // (href="./index.html" в webview выкидывал на страницу-лендинг — выглядело как «уход на сайт».)
    var logo = document.querySelector('.lang-logo');
    if (logo && !logo.hasAttribute('data-app-home')) {
      logo.setAttribute('data-app-home', '1');
      logo.removeAttribute('href');
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', function(e){
        e.preventDefault();
        if (typeof window.navTo === 'function') window.navTo('home');
      });
    }
    // Внешние ссылки оплаты Hotmart запрещены в приложении (anti-steering Apple) и засоряют
    // экран результата. Прячем их: если строка состоит только из таких ссылок — прячем строку
    // целиком (чисто), иначе только саму ссылку (чтобы не задеть текст рядом, напр. на гейте).
    document.querySelectorAll('a[href*="pay.hotmart.com"]').forEach(function(a){
      var p = a.parentElement;
      var onlyLinks = p && Array.prototype.every.call(p.children, function(c){
        return c.tagName === 'A' && /pay\.hotmart\.com/.test(c.href);
      });
      (onlyLinks ? p : a).style.display = 'none';
    });
    return true;
  }

  apply();                                               // сразу
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  setTimeout(apply, 800);                                // на случай позднего инжекта Capacitor / DOM
})();
