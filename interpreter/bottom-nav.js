/* VIA·L — нижняя строка навигации, ОДНА для всех страниц VIA-L (2026-10-10, этап 0
   docs/APP-STRUCTURE-PLAN.md §8). До этого строка была нарисована вручную в четырёх файлах
   (interpreter-via-l.html, my-specialist.html, science.html, research-consent.html), копии отставали:
   в трёх висела удалённая вкладка «Наш подход» (баг f54e808). Теперь порядок, иконки и подписи ×12 —
   только здесь; переименовать вкладку = поправить одну строку ниже.

   Подключение на странице:
     <div id="bottombar"><nav class="bottom-nav" id="vialNav"></nav></div>
     <script src="bottom-nav.js"></script>
     <script>vialBottomNav.mount({ active:'guide', home:'./interpreter-via-l.html', lang:lang });</script>
   home не задан → это сама главная: пункты — кнопки navTo() с id nav-<вкладка> (на них ссылается код
   главной). home задан → ссылки home?tab=<вкладка>; главная открывает вкладку по ?tab (её обработчик
   «Возврат со страницы…»). Строку home пишем в самом html — app/sync-web.sh заменяет в нём
   interpreter-via-l.html → index.html. Язык сменился → страница зовёт vialBottomNav.setLang(l).
   set:'expert' — набор EXPERT (Наш подход, переписка) для research-consent.html?app=expert;
   основная страница EXPERT рисует свою строку сама. */
(function () {
  var L = {
    today:    {en:'Today',ru:'Сегодня',uk:'Сьогодні',es:'Hoy',de:'Heute',pt:'Hoje',fr:'Aujourd’hui',pl:'Dziś',it:'Oggi',he:'היום',ja:'今日',ko:'오늘'},
    path:     {en:'My path',ru:'Мой путь',uk:'Мій шлях',es:'Mi camino',de:'Mein Weg',pt:'Meu caminho',fr:'Mon parcours',pl:'Moja droga',it:'Il mio percorso',he:'הדרך שלי',ja:'私の歩み',ko:'나의 여정'},
    guide:    {en:'My guide',ru:'Мой наставник',uk:'Мій наставник',es:'Mi guía',de:'Mein Begleiter',pt:'Meu guia',fr:'Mon guide',pl:'Mój przewodnik',it:'La mia guida',he:'המלווה שלי',ja:'マイガイド',ko:'나의 가이드'},
    card:     {en:'My Profile',ru:'Мой профиль',uk:'Мій профіль',es:'Mi perfil',de:'Mein Profil',pt:'Meu perfil',fr:'Mon profil',pl:'Mój profil',it:'Il mio profilo',he:'הפרופיל שלי',ja:'マイプロフィール',ko:'내 프로필'},
    approach: {en:'Our approach',ru:'Наш подход',uk:'Наш підхід',es:'Enfoque',de:'Ansatz',pt:'Abordagem',fr:'Approche',pl:'Podejście',it:'Approccio',he:'הגישה שלנו',ja:'アプローチ',ko:'접근 방식'},
    chat:     {en:'Specialist',ru:'Специалист',uk:'Спеціаліст',es:'Especialista',de:'Spezialist',pt:'Especialista',fr:'Spécialiste',pl:'Specjalista',it:'Specialista',he:'מומחה',ja:'専門家',ko:'전문가'}
  };
  // [вкладка, иконка Phosphor]
  var SETS = {
    vial:   [['today','ph-sun'], ['path','ph-chart-line-up'], ['guide','ph-signpost'], ['card','ph-user']],
    expert: [['today','ph-sun'], ['approach','ph-stack'], ['chat','ph-chat-circle-dots'], ['card','ph-user']]
  };
  var cfg = null;

  function label(k, lang) { var o = L[k] || {}; return o[lang] || o.en || k; }

  function mount(o) {
    cfg = o || {};
    var nav = cfg.el || document.getElementById('vialNav');
    if (!nav) return;
    var lang = cfg.lang || 'en';
    var set = SETS[cfg.set] || SETS.vial;
    nav.innerHTML = '';
    set.forEach(function (it) {
      var k = it[0], el;
      if (!cfg.home) {                       // сама главная: кнопки, вкладки переключаются без перезагрузки
        el = document.createElement('button');
        el.type = 'button';
        el.id = 'nav-' + k;
        el.addEventListener('click', function () {
          if (k === 'guide') location.href = './my-specialist.html';
          else if (typeof window.navTo === 'function') window.navTo(k);
        });
      } else {                               // другая страница: ссылки на главную
        el = document.createElement('a');
        el.href = (k === 'guide') ? './my-specialist.html' : cfg.home + '?tab=' + k;
      }
      el.className = 'bottom-nav-item' + (cfg.active === k ? ' active' : '');
      el.setAttribute('data-nav', k);
      var i = document.createElement('i');
      i.className = 'ph ' + it[1] + ' bottom-nav-icon';
      i.setAttribute('aria-hidden', 'true');
      var s = document.createElement('span');
      s.textContent = label(k, lang);
      el.appendChild(i); el.appendChild(s);
      nav.appendChild(el);
    });
  }

  // Только подписи: перерисовка целиком сбросила бы .active, который главная ставит в navTo().
  function setLang(l) {
    if (!cfg) return;
    cfg.lang = l;
    var nav = cfg.el || document.getElementById('vialNav');
    if (!nav) return;
    nav.querySelectorAll('[data-nav]').forEach(function (el) {
      var s = el.querySelector('span');
      if (s) s.textContent = label(el.getAttribute('data-nav'), l);
    });
  }

  window.vialBottomNav = { mount: mount, setLang: setLang };
})();
