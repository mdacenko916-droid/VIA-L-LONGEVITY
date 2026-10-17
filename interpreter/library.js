/* VIA·L — библиотека статей в «Профиле» (2026-10-17, docs/ARTICLE-LIBRARY-PLAN.md).
   Данные — articles.js (СОБРАНО tools/build-articles.py из docs/articles/<язык>/*.md, руками не править).
   Здесь только показ: список по разделам («С чего начать», «Что беспокоит», «Что делать») и экран статьи.
   Текст фиксированный, ИИ его не пишет; русский канон вычитан специалистом 2026-10-17.
   Язык без полного набора статей строку «Статьи» не видит (has() → false) — полупереведённой библиотеки нет.
   «На чём основано» — работы реестра по темам статьи (evidence.js → _evidenceArticleHtml). Ссылок на сайт нет:
   App Store-версия изолирована от сайта (feedback_via_l_appstore_isolation). */
(function () {
  var UI = {
    row:   {ru:'Статьи',uk:'Статті',en:'Articles',es:'Artículos',de:'Artikel',pt:'Artigos',fr:'Articles',pl:'Artykuły',it:'Articoli',he:'מאמרים',ja:'記事',ko:'아티클'},
    rowSub:{ru:'Перименопауза, менопауза и что делать',uk:'Перименопауза, менопауза і що робити',en:'Perimenopause, menopause and what to do',es:'Perimenopausia, menopausia y qué hacer',de:'Perimenopause, Menopause und was hilft',pt:'Perimenopausa, menopausa e o que fazer',fr:'Périménopause, ménopause et que faire',pl:'Perimenopauza, menopauza i co robić',it:'Perimenopausa, menopausa e cosa fare',he:'פרימנופאוזה, מנופאוזה ומה עושים',ja:'更年期の前後とできること',ko:'폐경 전후와 할 수 있는 것'},
    start: {ru:'С чего начать',uk:'З чого почати',en:'Where to start',es:'Por dónde empezar',de:'Der Einstieg',pt:'Por onde começar',fr:'Pour commencer',pl:'Od czego zacząć',it:'Da dove iniziare',he:'מאיפה מתחילים',ja:'はじめに',ko:'시작하기'},
    cmp:   {ru:'Что беспокоит',uk:'Що турбує',en:'What bothers you',es:'Qué te preocupa',de:'Was dich belastet',pt:'O que te incomoda',fr:'Ce qui vous gêne',pl:'Co Ci dokucza',it:'Cosa ti disturba',he:'מה מטריד',ja:'気になること',ko:'신경 쓰이는 것'},
    step:  {ru:'Что делать',uk:'Що робити',en:'What to do',es:'Qué hacer',de:'Was tun',pt:'O que fazer',fr:'Que faire',pl:'Co robić',it:'Cosa fare',he:'מה עושים',ja:'できること',ko:'할 수 있는 것'},
    sheetArt:{ru:'Статьи',uk:'Статті',en:'Articles',es:'Artículos',de:'Artikel',pt:'Artigos',fr:'Articles',pl:'Artykuły',it:'Articoli',he:'מאמרים',ja:'記事',ko:'아티클'},
    sheetArtSub:{ru:'Перименопауза, менопауза и что делать',uk:'Перименопауза, менопауза і що робити',en:'Perimenopause, menopause and what to do',es:'Perimenopausia, menopausia y qué hacer',de:'Perimenopause, Menopause und was hilft',pt:'Perimenopausa, menopausa e o que fazer',fr:'Périménopause, ménopause et que faire',pl:'Perimenopauza, menopauza i co robić',it:'Perimenopausa, menopausa e cosa fare',he:'פרימנופאוזה, מנופאוזה ומה עושים',ja:'更年期の前後とできること',ko:'폐경 전후와 할 수 있는 것'},
    sheetTg:{ru:'Сообщество в Telegram',uk:'Спільнота в Telegram',en:'Telegram community',es:'Comunidad en Telegram',de:'Community auf Telegram',pt:'Comunidade no Telegram',fr:'Communauté sur Telegram',pl:'Społeczność na Telegramie',it:'Community su Telegram',he:'הקהילה בטלגרם',ja:'Telegramコミュニティ',ko:'텔레그램 커뮤니티'},
    sheetTgSub:{ru:'Общение с женщинами, которые проходят то же',uk:'Спілкування з жінками, які проходять те саме',en:'Talk with women going through the same',es:'Habla con mujeres que viven lo mismo',de:'Austausch mit Frauen, die dasselbe erleben',pt:'Converse com mulheres que vivem o mesmo',fr:'Échangez avec des femmes qui vivent la même chose',pl:'Rozmowy z kobietami, które przechodzą to samo',it:'Parla con donne che vivono lo stesso',he:'שיחה עם נשים שעוברות את אותו הדבר',ja:'同じ経験をしている女性たちと話せます',ko:'같은 시기를 지나는 여성들과 이야기해요'},
    check: {ru:'Проверено специалистом VIA-L',uk:'Перевірено спеціалістом VIA-L',en:'Reviewed by a VIA-L specialist',es:'Revisado por un especialista de VIA-L',de:'Geprüft von einer VIA-L-Fachperson',pt:'Revisado por um especialista VIA-L',fr:'Relu par un spécialiste VIA-L',pl:'Sprawdzone przez specjalistę VIA-L',it:'Rivisto da uno specialista VIA-L',he:'נבדק על ידי מומחה VIA-L',ja:'VIA-Lの専門家が確認済み',ko:'VIA-L 전문가 검토 완료'}
  };
  function tx(o, lang) { return (o && (o[lang] || o.en || o.ru)) || ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function data(lang) { var A = window.VIAL_ART; return (A && A.langs && A.langs[lang]) || null; }

  // Стили статьи — из токенов приложения (Playfair для заголовка, графит + золото, как блоки «Профиля»).
  var CSS_ID = 'vialArtCss';
  function css() {
    if (document.getElementById(CSS_ID)) return;
    var st = document.createElement('style'); st.id = CSS_ID;
    st.textContent = ''
      + '.art-card{grid-column:1/-1;background:linear-gradient(160deg,#222a37,#161c26);border:1px solid rgba(226,185,90,.20);border-radius:18px;padding:18px 18px 14px;}'
      + '.art-title{font-family:\'Playfair Display\',serif;font-weight:400;font-size:calc(var(--fs-title) + 4px);line-height:1.3;color:var(--t1);margin:0 0 6px;}'
      + '.art-min{font-size:var(--fs-cap);color:var(--t3);margin:0 0 14px;}'
      + '.art-h{font-size:var(--fs-title);font-weight:600;color:var(--gold-lt);margin:18px 0 8px;line-height:1.35;}'
      + '.art-p{font-size:var(--fs-body);color:var(--t2);line-height:1.65;margin:0 0 10px;}'
      + '.art-p b,.art-ul b{color:var(--t1);font-weight:600;}'
      + '.art-note{color:var(--t3);font-size:var(--fs-cap);}'
      + '.art-ul{margin:0 0 10px;padding-inline-start:20px;font-size:var(--fs-body);color:var(--t2);line-height:1.6;}'
      + '.art-ul li{margin:0 0 6px;}'
      + '.art-check{display:flex;align-items:center;gap:6px;font-size:var(--fs-cap);color:var(--t3);margin:14px 0 0;}'
      + '.art-check i{color:var(--gold-lt);}'
      + '.art-ev{margin:6px 0 4px;}'
      + '.art-sheet-bg{position:fixed;inset:0;z-index:800;background:rgba(8,11,16,.55);display:flex;align-items:flex-end;}'
      + '.art-sheet{width:100%;box-sizing:border-box;display:grid;gap:10px;padding:18px 16px calc(22px + env(safe-area-inset-bottom,0px));background:linear-gradient(180deg,#242c39,#181e28);border-top:1px solid rgba(226,185,90,.30);border-radius:20px 20px 0 0;}'
      + '.art-sh{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;padding:14px 16px;border-radius:16px;background:rgba(6,9,18,.42);border:1px solid rgba(226,185,90,.22);color:var(--t1);text-decoration:none;text-align:start;font:inherit;cursor:pointer;}'
      + '.art-sh-ic{flex:0 0 auto;width:44px;height:44px;border-radius:50%;background:rgba(226,185,90,.13);display:flex;align-items:center;justify-content:center;color:var(--gold-lt);font-size:22px;}'
      + '.art-sh-tx{flex:1 1 auto;min-width:0;}'
      + '.art-sh-t{display:block;font-size:var(--fs-body);font-weight:600;color:var(--t1);}'
      + '.art-sh-s{display:block;margin-top:3px;font-size:var(--fs-cap);color:var(--t3);line-height:1.4;}'
      + '.art-sh-chev{flex:0 0 auto;color:var(--gold-lt);font-size:22px;}'
      + 'body.lib-sheet #vlAdvBtn{display:none!important;}'
      + '.art-row .vc-tt{font-size:var(--fs-body);text-transform:none;letter-spacing:normal;line-height:1.35;}';
    document.head.appendChild(st);
  }

  function rowHtml(k, a) {
    return '<button type="button" class="vc-link vc-span art-row" onclick="_cardOpen(\'art:' + k + '\')">'
      + '<span class="vc-txt"><span class="vc-tt">' + esc(a.t) + '</span>'
      + (a.min ? '<span class="vc-sub2">' + esc(a.min) + '</span>' : '') + '</span><span class="vc-chev">›</span></button>';
  }

  // Группа в Telegram — ссылка на язык (ru и uk — отдельные группы, docs/ARTICLE-LIBRARY-PLAN.md). Пусто = группы
  // ещё нет: книга внизу открывает статьи сразу, без выбора. Ссылку вписывает владелец, когда группа откроется.
  var TG = { ru: '', uk: '' };

  function sheetClose() { var o = document.getElementById('vialLibSheet'); if (o) o.remove(); document.body.classList.remove('lib-sheet'); }
  function shRow(tag, attrs, ic, t, sub) {
    return '<' + tag + ' class="art-sh" ' + attrs + '><span class="art-sh-ic"><i class="ph ' + ic + '"></i></span>'
      + '<span class="art-sh-tx"><span class="art-sh-t">' + esc(t) + '</span><span class="art-sh-s">' + esc(sub) + '</span></span>'
      + '<span class="art-sh-chev">›</span></' + tag + '>';
  }
  // Выбор по нажатию на книгу: «Статьи» или группа. Только если у языка есть и то и другое.
  function sheet(lang) {
    sheetClose(); css();
    var o = document.createElement('div'); o.id = 'vialLibSheet'; o.className = 'art-sheet-bg';
    o.onclick = function (e) { if (e.target === o) sheetClose(); };
    var art = data(lang) ? shRow('button', 'type="button" id="artSheetArt"', 'ph-book-open-text', tx(UI.sheetArt, lang), tx(UI.sheetArtSub, lang)) : '';
    var tg = shRow('a', 'href="' + esc(TG[lang]) + '" target="_blank" rel="noopener"', 'ph-telegram-logo', tx(UI.sheetTg, lang), tx(UI.sheetTgSub, lang));
    o.innerHTML = '<div class="art-sheet">' + art + tg + '</div>';
    document.body.appendChild(o); document.body.classList.add('lib-sheet');
    var b = document.getElementById('artSheetArt');
    if (b) b.onclick = function () { sheetClose(); if (typeof window.navTo === 'function') window.navTo('lib', { direct: 1 }); };
    o.querySelector('a').addEventListener('click', function () { setTimeout(sheetClose, 300); });
  }

  window.vialLibrary = {
    has: function (lang) { return !!data(lang); },
    hasTab: function (lang) { return !!data(lang) || !!TG[lang]; },   // книга в нижней строке
    tg: function (lang) { return TG[lang] || ''; },
    // Нажатие на книгу: есть группа → выбор из двух; нет → true (открыть статьи сразу).
    tap: function (lang) { if (TG[lang]) { sheet(lang); return false; } return true; },
    sheetClose: sheetClose,
    label: function (k, lang) { return tx(UI[k], lang); },
    // «Профиль › Статьи»: три раздела, внутри — строки-входы теми же классами, что «Мои данные» / «Настройки».
    listHtml: function (lang) {
      var d = data(lang), A = window.VIAL_ART; if (!d) return '';
      css();
      return A.sections.map(function (sec) {
        return '<div class="vc-subh vc-span" style="grid-column:1/-1;">' + esc(tx(UI[sec[0]], lang)) + '</div>'
          + sec[1].filter(function (k) { return d[k]; }).map(function (k) { return rowHtml(k, d[k]); }).join('');
      }).join('');
    },
    // Экран статьи. «На чём основано» встаёт на место служебной метки <!--EV--> (её ставит сборщик).
    articleHtml: function (k, lang) {
      var d = data(lang), a = d && d[k]; if (!a) return '';
      css();
      var ev = (typeof window._evidenceArticleHtml === 'function') ? window._evidenceArticleHtml(a.codes) : '';
      var body = a.h.replace('<!--EV-->', ev ? '<div class="art-ev">' + ev + '</div>' : '');
      return '<div class="art-card"><h2 class="art-title">' + esc(a.t) + '</h2>'
        + (a.min ? '<div class="art-min">' + esc(a.min) + '</div>' : '') + body
        + '<div class="art-check"><i class="ph ph-seal-check" aria-hidden="true"></i>' + esc(tx(UI.check, lang)) + '</div></div>';
    },
    title: function (k, lang) { var d = data(lang); return (d && d[k] && d[k].t) || ''; }
  };
  try { if (window.vialBottomNav && vialBottomNav.refresh) vialBottomNav.refresh(); } catch (e) {}   // строка смонтирована раньше — показать книгу
})();
