/* VIA·L — «На чём основано»: список научных работ под разбором дня.
   Общий модуль VIA-L и VIA-L EXPERT (как intake.js). 2026-09-20.

   ЧЕСТНАЯ ЕДИНИЦА — ПАТТЕРН, А НЕ ФРАЗА. Текст разбора пишет модель, поэтому привязать
   отдельное предложение к конкретной публикации нельзя — такая привязка была бы выдумкой.
   Зато точно известно, какие паттерны базы знаний участвовали в ЭТОМ разборе: их считает
   selectKBPatterns() в воркере и возвращает в поле `kb`. Работы за этими паттернами лежат
   в реестре evidence-registry.json, собранном tools/build-evidence-registry.py прямо из
   выгрузок OpenEvidence — ни одной сочинённой ссылки, у каждой есть DOI.

   Реестр грузится ЛЕНИВО, по нажатию (190 КБ): большинство разборов открывают без него. */
(function () {
  var REG = null, REG_LOADING = null;
  var KEY = 'vial_kb_days';          // {день: [коды паттернов]} — последние 30 дней
  var MAX_DAYS = 30;

  function tr(dict) {   // словарь в приложении уже есть — берём его L(), иначе английский
    try { if (typeof window.L === 'function') return window.L(dict); } catch (e) {}
    return dict.en;
  }
  function esc(s) {
    try { if (typeof window._esc === 'function') return window._esc(s); } catch (e) {}
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  }
  function today() {
    try { if (typeof window._dayKey === 'function') return window._dayKey(); } catch (e) {}
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // ── Память: какие паттерны стояли за разбором какого дня ──
  function allDays() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  window._kbRemember = function (day, ids) {
    if (!day || !ids || !ids.length) return;
    try {
      var o = allDays();
      o[day] = ids.filter(function (x) { return /^P-[FM]\d+$/.test(String(x)); }).slice(0, 12);
      var keys = Object.keys(o).sort();
      while (keys.length > MAX_DAYS) { delete o[keys.shift()]; }
      localStorage.setItem(KEY, JSON.stringify(o));
    } catch (e) {}
  };
  function idsFor(day) { var o = allDays(); return (o && o[day]) || []; }

  // ── Кнопка под разбором. Возвращает '' , если для этого дня кодов нет ──
  // (старый разбор, сохранённый до 2026-09-20, или сборка приложения старее воркера).
  window._evidenceHtml = function (day) {
    var d = day || window._kbRenderDay || today();
    var ids = idsFor(d);
    if (!ids.length) return '';
    var lbl = tr({
      ru: 'На чём основано', uk: 'На чому ґрунтується', en: 'What this is based on',
      es: 'En qué se basa', de: 'Worauf das beruht', pt: 'Em que se baseia',
      fr: 'Sur quoi cela repose', pl: 'Na czym to się opiera', it: 'Su cosa si basa',
      he: 'על מה זה מבוסס', ja: '根拠について', ko: '근거',
    });
    return '<div class="ai-themes-box vial-ev" data-day="' + esc(d) + '">'
         + '<button type="button" class="ai-more-all" onclick="_evidenceOpen(this)">'
         + esc(lbl) + ' <i class="ph ph-caret-down" aria-hidden="true"></i></button>'
         + '<div class="ai-themes"><div class="ai-themes-in vial-ev-body"></div></div></div>';
  };

  function loadRegistry() {
    if (REG) return Promise.resolve(REG);
    if (REG_LOADING) return REG_LOADING;
    REG_LOADING = fetch('evidence-registry.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { REG = j; return j; })
      .catch(function () { return null; });
    return REG_LOADING;
  }

  window._evidenceOpen = function (btn) {
    var box = btn.parentNode, body = box.querySelector('.vial-ev-body');
    box.classList.toggle('open');
    if (!box.classList.contains('open') || box.getAttribute('data-filled')) return;
    body.innerHTML = '<div class="vial-ev-note">…</div>';
    loadRegistry().then(function (reg) {
      box.setAttribute('data-filled', '1');
      if (!reg) {
        body.innerHTML = '<div class="vial-ev-note">' + esc(tr({
          ru: 'Список не загрузился. Попробуйте позже.', uk: 'Список не завантажився. Спробуйте пізніше.',
          en: 'The list did not load. Try again later.', es: 'La lista no se cargó. Inténtalo más tarde.',
          de: 'Die Liste wurde nicht geladen. Später erneut versuchen.', pt: 'A lista não carregou. Tente mais tarde.',
          fr: 'La liste ne s’est pas chargée. Réessayez plus tard.', pl: 'Lista się nie wczytała. Spróbuj później.',
          it: 'L’elenco non si è caricato. Riprova più tardi.', he: 'הרשימה לא נטענה. נסו מאוחר יותר.',
          ja: 'リストを読み込めませんでした。後でもう一度お試しください。', ko: '목록을 불러오지 못했습니다. 나중에 다시 시도하세요.',
        })) + '</div>';
        return;
      }
      var ids = idsFor(box.getAttribute('data-day')), seen = {}, list = [];
      ids.forEach(function (p) {
        (reg.byPattern[p] || []).forEach(function (doi) {
          if (seen[doi] || !reg.sources[doi]) return;
          seen[doi] = 1; list.push(doi);
        });
      });
      list.sort(function (a, b) { return (reg.sources[b].y || '') > (reg.sources[a].y || '') ? 1 : -1; });
      var head = tr({
        ru: 'Разбор собран по темам вашей картины дня. За ними стоят опубликованные работы — вот они:',
        uk: 'Розбір зібрано за темами вашої картини дня. За ними стоять опубліковані роботи — ось вони:',
        en: 'The analysis was built from the themes of your day. These are the published studies behind them:',
        es: 'El análisis se construyó con los temas de tu día. Estos son los estudios publicados detrás:',
        de: 'Die Analyse folgt den Themen deines Tages. Dahinter stehen diese veröffentlichten Arbeiten:',
        pt: 'A análise foi construída a partir dos temas do seu dia. Estes são os estudos publicados por trás:',
        fr: 'L’analyse suit les thèmes de votre journée. Voici les travaux publiés qui les sous-tendent :',
        pl: 'Analiza powstała z tematów Twojego dnia. Oto opublikowane prace, które za nimi stoją:',
        it: 'L’analisi nasce dai temi della tua giornata. Ecco gli studi pubblicati alla base:',
        he: 'הניתוח נבנה מהנושאים של היום שלך. אלה המחקרים שפורסמו מאחוריהם:',
        ja: 'この分析はあなたの一日のテーマから組み立てられています。その根拠となる公表研究です：',
        ko: '이 분석은 당신의 하루 주제에서 만들어졌습니다. 그 근거가 된 공개 연구입니다:',
      });
      var foot = tr({
        ru: 'Работы общие, не про вас лично: они объясняют, почему приложение вообще смотрит на эти показатели. Это не диагноз и не назначение.',
        uk: 'Роботи загальні, не про вас особисто: вони пояснюють, чому застосунок узагалі дивиться на ці показники. Це не діагноз і не призначення.',
        en: 'These studies are general, not about you personally: they explain why the app looks at these signals at all. This is not a diagnosis or a prescription.',
        es: 'Son estudios generales, no sobre ti: explican por qué la app mira estas señales. No es un diagnóstico ni una prescripción.',
        de: 'Die Arbeiten sind allgemein, nicht über dich persönlich: Sie erklären, warum die App überhaupt auf diese Werte schaut. Keine Diagnose, keine Verordnung.',
        pt: 'Os estudos são gerais, não sobre você: explicam por que o app olha para estes sinais. Não é diagnóstico nem prescrição.',
        fr: 'Ces travaux sont généraux, pas sur vous : ils expliquent pourquoi l’application regarde ces signaux. Ni diagnostic ni prescription.',
        pl: 'Prace są ogólne, nie o Tobie: wyjaśniają, dlaczego aplikacja w ogóle patrzy na te sygnały. To nie diagnoza ani zalecenie.',
        it: 'Sono studi generali, non su di te: spiegano perché l’app guarda questi segnali. Non è una diagnosi né una prescrizione.',
        he: 'המחקרים כלליים, לא עליכם אישית: הם מסבירים מדוע האפליקציה בכלל מסתכלת על המדדים האלה. זו אינה אבחנה ואינה מרשם.',
        ja: 'これらは一般的な研究で、あなた個人についてではありません。アプリがこれらの指標を見る理由を示すものです。診断でも処方でもありません。',
        ko: '이 연구들은 일반적인 것으로 당신 개인에 대한 것이 아닙니다. 앱이 왜 이 지표를 보는지 설명합니다. 진단이나 처방이 아닙니다.',
      });
      // Сила доказательств. ФИКСИРОВАННАЯ строка, а не инструкция модели: оговорки в промпте
      // исполняются через раз (см. docs/PROMPT-RULES-AUDIT.md), а эту забыть нельзя. 2026-09-20
      var weak = tr({
        ru: 'Доказательная сила у этих работ разная: где-то крупные обзоры и мета-анализы, где-то отдельные небольшие исследования. То, что советует разбор, — безопасный шаг по самопомощи, а не лечение, и подходит не в каждой ситуации.',
        uk: 'Доказова сила цих робіт різна: десь великі огляди та мета-аналізи, десь окремі невеликі дослідження. Те, що радить розбір, — безпечний крок самодопомоги, а не лікування, і підходить не в кожній ситуації.',
        en: 'The strength of this evidence varies: some are large reviews and meta-analyses, some are small single studies. What the analysis suggests is a low-risk self-care step, not treatment, and it may not fit every situation.',
        es: 'La solidez de esta evidencia varía: hay grandes revisiones y metaanálisis, y también estudios pequeños aislados. Lo que sugiere el análisis es un paso de autocuidado de bajo riesgo, no un tratamiento, y puede no encajar en toda situación.',
        de: 'Die Aussagekraft dieser Arbeiten ist unterschiedlich: teils große Übersichten und Meta-Analysen, teils einzelne kleine Studien. Was die Auswertung vorschlägt, ist ein risikoarmer Selbsthilfe-Schritt, keine Behandlung — und passt nicht in jede Situation.',
        pt: 'A força desta evidência varia: há grandes revisões e meta-análises e também estudos pequenos isolados. O que a análise sugere é um passo de autocuidado de baixo risco, não um tratamento, e pode não servir para toda situação.',
        fr: 'La solidité de ces travaux varie : grandes revues et méta-analyses d’un côté, petites études isolées de l’autre. Ce que propose l’analyse est une mesure d’auto-soin à faible risque, pas un traitement, et elle ne convient pas à toutes les situations.',
        pl: 'Siła tych dowodów bywa różna: od dużych przeglądów i metaanaliz po pojedyncze małe badania. To, co podpowiada analiza, jest bezpiecznym krokiem samopomocy, a nie leczeniem, i nie pasuje do każdej sytuacji.',
        it: 'La forza di questi lavori varia: da grandi revisioni e meta-analisi a singoli piccoli studi. Ciò che l’analisi suggerisce è un passo di auto-cura a basso rischio, non una cura, e può non adattarsi a ogni situazione.',
        he: 'עוצמת הראיות משתנה: יש סקירות גדולות ומטא-אנליזות ויש מחקרים קטנים בודדים. מה שהניתוח מציע הוא צעד עזרה-עצמית בסיכון נמוך, לא טיפול, והוא לא מתאים לכל מצב.',
        ja: '根拠の強さはさまざまです。大規模なレビューやメタアナリシスもあれば、小規模な単一研究もあります。分析が提案するのは低リスクのセルフケアであり、治療ではありません。すべての状況に当てはまるとは限りません。',
        ko: '근거의 강도는 제각각입니다. 대규모 리뷰와 메타분석도 있고 소규모 단일 연구도 있습니다. 분석이 제안하는 것은 위험이 낮은 자기관리이지 치료가 아니며, 모든 상황에 맞지는 않습니다.',
      });
      // Список подрезан: 150 ссылок подряд не читает никто, а выглядит это не солиднее, а неряшливее.
      // Показываем свежие, остальное — по кнопке. Ничего не прячем: счётчик честно говорит сколько.
      var SHOW = 12;
      function row(doi) {
        var s = reg.sources[doi];
        return '<li><span class="vial-ev-t">' + esc(s.t) + '</span>'
             + (s.j ? '<span class="vial-ev-j"> — ' + esc(s.j) + (s.y ? ', ' + esc(s.y) : '') + '</span>'
                    : (s.y ? '<span class="vial-ev-j"> — ' + esc(s.y) + '</span>' : ''))
             + ' <a class="vial-ev-doi" href="https://doi.org/' + encodeURIComponent(doi)
             + '" target="_blank" rel="noopener">doi</a></li>';
      }
      var html = '<div class="vial-ev-note">' + esc(head) + '</div>'
               + '<ol class="vial-ev-list">' + list.slice(0, SHOW).map(row).join('') + '</ol>';
      if (list.length > SHOW) {
        html += '<ol class="vial-ev-list vial-ev-rest" hidden>' + list.slice(SHOW).map(row).join('') + '</ol>'
             + '<button type="button" class="vial-ev-all" onclick="_evidenceAll(this)">'
             + esc(tr({
                 ru: 'Показать все', uk: 'Показати всі', en: 'Show all', es: 'Ver todas',
                 de: 'Alle anzeigen', pt: 'Ver todas', fr: 'Tout afficher', pl: 'Pokaż wszystkie',
                 it: 'Mostra tutte', he: 'להצגת הכול', ja: 'すべて表示', ko: '전체 보기',
               })) + ' (' + list.length + ')</button>';
      }
      html += '<div class="vial-ev-note vial-ev-foot">' + esc(weak) + '</div>'
            + '<div class="vial-ev-note">' + esc(foot) + '</div>';
      body.innerHTML = html;
    });
  };

  window._evidenceAll = function (btn) {
    var rest = btn.parentNode.querySelector('.vial-ev-rest');
    if (rest) { rest.hidden = false; rest.start = 13; }
    btn.remove();
  };

  // Стили — в палитре приложения, без своих цветов (см. память про единый дизайн).
  var st = document.createElement('style');
  st.textContent = '.vial-ev-list{margin:0;padding:0 0 0 20px;}'
    + '.vial-ev-list li{margin:0 0 10px;font-size:13px;line-height:1.45;color:var(--t2,rgba(245,243,239,.78));}'
    + '.vial-ev-t{color:var(--t1,#F5F3EF);}'
    + '.vial-ev-j{color:var(--t3,rgba(245,243,239,.5));font-style:italic;}'
    + '.vial-ev-doi{color:var(--gold-lt,#EEC77A);text-decoration:none;border-bottom:1px solid rgba(226,185,90,.4);}'
    + '.vial-ev-note{font-size:13px;line-height:1.5;color:var(--t3,rgba(245,243,239,.5));margin:0 0 12px;}'
    + '.vial-ev-foot{margin:12px 0 0;}'
    + '.vial-ev-all{margin:2px 0 0;background:none;border:1px solid rgba(226,185,90,.4);border-radius:10px;color:var(--gold-lt,#EEC77A);font:inherit;font-size:13px;padding:8px 13px;cursor:pointer;}';
  document.head.appendChild(st);
})();
