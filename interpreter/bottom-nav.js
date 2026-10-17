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
   главной; «Специалист» с 2026-10-16 тоже панель главной, specialist.js). home задан → ссылки home?tab=<вкладка>; главная открывает вкладку по ?tab (её обработчик
   «Возврат со страницы…»). Строку home пишем в самом html — app/sync-web.sh заменяет в нём
   interpreter-via-l.html → index.html. Язык сменился → страница зовёт vialBottomNav.setLang(l).
   set:'expert' — набор EXPERT (Наш подход, переписка) для research-consent.html?app=expert;
   основная страница EXPERT рисует свою строку сама. */
(function () {
  var L = {
    today:    {en:'Today',ru:'Сегодня',uk:'Сьогодні',es:'Hoy',de:'Heute',pt:'Hoje',fr:'Aujourd’hui',pl:'Dziś',it:'Oggi',he:'היום',ja:'今日',ko:'오늘'},
    // короткие подписи (2026-10-17): с пятой кнопкой «Мой прогресс» не влезал в свою пятую часть строки
    path:     {en:'Progress',ru:'Прогресс',uk:'Прогрес',es:'Progreso',de:'Fortschritt',pt:'Progresso',fr:'Progrès',pl:'Postępy',it:'Progressi',he:'התקדמות',ja:'進捗',ko:'진행'},
    lib:      {en:'Library',ru:'Библиотека',uk:'Бібліотека',es:'Biblioteca',de:'Bibliothek',pt:'Biblioteca',fr:'Bibliothèque',pl:'Biblioteka',it:'Biblioteca',he:'ספרייה',ja:'ライブラリ',ko:'라이브러리'},
    guide:    {en:'Specialist',ru:'Специалист',uk:'Спеціаліст',es:'Especialista',de:'Spezialist',pt:'Especialista',fr:'Spécialiste',pl:'Specjalista',it:'Specialista',he:'מומחה',ja:'専門家',ko:'전문가'},
    card:     {en:'Profile',ru:'Профиль',uk:'Профіль',es:'Perfil',de:'Profil',pt:'Perfil',fr:'Profil',pl:'Profil',it:'Profilo',he:'פרופיל',ja:'プロフィール',ko:'프로필'},
    approach: {en:'Our approach',ru:'Наш подход',uk:'Наш підхід',es:'Enfoque',de:'Ansatz',pt:'Abordagem',fr:'Approche',pl:'Podejście',it:'Approccio',he:'הגישה שלנו',ja:'アプローチ',ko:'접근 방식'},
    chat:     {en:'Specialist',ru:'Специалист',uk:'Спеціаліст',es:'Especialista',de:'Spezialist',pt:'Especialista',fr:'Spécialiste',pl:'Specjalista',it:'Specialista',he:'מומחה',ja:'専門家',ko:'전문가'}
  };
  // [вкладка, иконка Phosphor]
  var SETS = {
    // lib — книга посередине, в разрыве линии над строкой (2026-10-17). Видна, только если языку есть что
    // показать: статьи (library.js) или ссылка на группу; иначе строка остаётся из четырёх кнопок.
    vial:   [['today','ph-sun'], ['path','ph-chart-line-up'], ['lib','ph-book-open-text'], ['guide','ph-signpost'], ['card','ph-user']],
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
          if (typeof window.navTo === 'function') window.navTo(k);   // «Специалист» — тоже вкладка-панель (2026-10-16)
          else if (k === 'guide') location.href = './my-specialist.html';
        });
      } else {                               // другая страница: ссылки на главную
        el = document.createElement('a');
        el.href = (k === 'guide') ? './my-specialist.html' : cfg.home + '?tab=' + k;
      }
      el.className = 'bottom-nav-item' + (cfg.active === k ? ' active' : '');
      el.setAttribute('data-nav', k);
      var i = document.createElement('i');
      i.className = 'ph ' + it[1] + (k === 'lib' ? '' : ' bottom-nav-icon');
      i.setAttribute('aria-hidden', 'true');
      if (k === 'lib') {                     // золотой круг над строкой
        el.className += ' bn-lib';
        var c = document.createElement('span'); c.className = 'bn-lib-c'; c.appendChild(i); i = c;
      }
      var s = document.createElement('span');
      s.textContent = label(k, lang);
      el.appendChild(i); el.appendChild(s);
      nav.appendChild(el);
    });
    css(); refresh();
  }

  // Круг с книгой и разрыв линии. Линия рисуется ::before с вырезом посередине (средняя из пяти кнопок; вырез уже круга —
  // линия доходит до самого круга и прячется под ним, владелец 2026-10-17
  // стоит ровно по центру), а не кольцом вокруг круга: кольцо цвета строки давало ореол на фоне страницы.
  function css() {
    if (document.getElementById('bnLibCss')) return;
    var st = document.createElement('style'); st.id = 'bnLibCss';
    st.textContent = ''
      + '.bottom-nav.has-lib{border-top-color:transparent!important;}'
      + '.bottom-nav.has-lib::before{content:"";position:absolute;left:0;right:0;top:-1.5px;height:1.5px;background:rgba(238,199,122,.62);pointer-events:none;'
      +   '-webkit-mask-image:linear-gradient(to right,#000 calc(50% - 20px),transparent calc(50% - 20px),transparent calc(50% + 20px),#000 calc(50% + 20px));'
      +   'mask-image:linear-gradient(to right,#000 calc(50% - 20px),transparent calc(50% - 20px),transparent calc(50% + 20px),#000 calc(50% + 20px));}'
      + '.bn-lib{position:relative;}'
      + '.bn-lib-c{width:54px;height:54px;border-radius:50%;margin:-33px auto 0;display:flex;align-items:center;justify-content:center;'
      +   'background:linear-gradient(160deg,#F0CF86,#C9973F);border:1.5px solid rgba(238,199,122,.9);box-shadow:0 5px 16px rgba(0,0,0,.5);}'
      + '.bn-lib-c i{font-size:28px;line-height:1;color:#10141C;}'
      + '.bn-lib:active .bn-lib-c{transform:scale(.92);}'
      + '.bn-lib.active .bn-lib-c{box-shadow:0 0 14px rgba(226,185,90,.75),0 5px 16px rgba(0,0,0,.5);}';
    document.head.appendChild(st);
  }

  // Книга видна только языку, которому есть что показать (vialLibrary.hasTab). library.js грузится позже
  // строки — он сам зовёт refresh(); на других страницах (нет library.js) книги нет.
  function refresh() {
    var nav = cfg && (cfg.el || document.getElementById('vialNav'));
    if (!nav) return;
    var b = nav.querySelector('[data-nav="lib"]'); if (!b) return;
    var on = !!(window.vialLibrary && vialLibrary.hasTab && vialLibrary.hasTab(cfg.lang || 'en'));
    b.style.display = on ? '' : 'none';
    nav.classList.toggle('has-lib', on);
  }

  // Только подписи: перерисовка целиком сбросила бы .active, который главная ставит в navTo().
  function setLang(l) {
    if (!cfg) return;
    cfg.lang = l;
    var nav = cfg.el || document.getElementById('vialNav');
    if (!nav) return;
    nav.querySelectorAll('[data-nav]').forEach(function (el) {
      var s = el.lastChild;   // подпись — последний элемент (у книги первым идёт круг-span)
      if (s) s.textContent = label(el.getAttribute('data-nav'), l);
    });
    refresh();
  }

  window.vialBottomNav = { mount: mount, setLang: setLang, refresh: refresh };
})();
