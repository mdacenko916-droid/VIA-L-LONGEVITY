/* VIA·L — библиотека статей в «Профиле» (2026-10-17, docs/ARTICLE-LIBRARY-PLAN.md).
   Данные — articles.js (СОБРАНО tools/build-articles.py из docs/articles/<язык>/*.md, руками не править).
   Здесь только показ: список по разделам («С чего начать», «Что беспокоит», «Что делать») и экран статьи.
   Текст фиксированный, ИИ его не пишет; русский канон вычитан специалистом 2026-10-17.
   Язык без полного набора статей строку «Статьи» не видит (has() → false) — полупереведённой библиотеки нет.
   «На чём основано» — работы реестра по темам статьи (evidence.js → _evidenceArticleHtml). Ссылок на сайт нет:
   App Store-версия изолирована от сайта (feedback_via_l_appstore_isolation). */
(function () {
  var UI = {
    row:   {ru:'Основы',uk:'Основи',en:'Essentials',es:'Lo esencial',de:'Grundlagen',pt:'O essencial',fr:'L’essentiel',pl:'Podstawy',it:'Le basi',he:'היסודות',ja:'基本',ko:'기초'},
    rowSub:{ru:'Перименопауза, менопауза и что делать',uk:'Перименопауза, менопауза і що робити',en:'Perimenopause, menopause and what to do',es:'Perimenopausia, menopausia y qué hacer',de:'Perimenopause, Menopause und was hilft',pt:'Perimenopausa, menopausa e o que fazer',fr:'Périménopause, ménopause et que faire',pl:'Perimenopauza, menopauza i co robić',it:'Perimenopausa, menopausa e cosa fare',he:'פרימנופאוזה, מנופאוזה ומה עושים',ja:'更年期の前後とできること',ko:'폐경 전후와 할 수 있는 것'},
    start: {ru:'С чего начать',uk:'З чого почати',en:'Where to start',es:'Por dónde empezar',de:'Der Einstieg',pt:'Por onde começar',fr:'Pour commencer',pl:'Od czego zacząć',it:'Da dove iniziare',he:'מאיפה מתחילים',ja:'はじめに',ko:'시작하기'},
    cmp:   {ru:'Что беспокоит',uk:'Що турбує',en:'What bothers you',es:'Qué te preocupa',de:'Was dich belastet',pt:'O que te incomoda',fr:'Ce qui vous gêne',pl:'Co Ci dokucza',it:'Cosa ti disturba',he:'מה מטריד',ja:'気になること',ko:'신경 쓰이는 것'},
    step:  {ru:'Что делать',uk:'Що робити',en:'What to do',es:'Qué hacer',de:'Was tun',pt:'O que fazer',fr:'Que faire',pl:'Co robić',it:'Cosa fare',he:'מה עושים',ja:'できること',ko:'할 수 있는 것'},
    more:{ru:'Подробнее в статье',uk:'Докладніше в статті',en:'Read the article',es:'Leer el artículo',de:'Zum Artikel',pt:'Ler o artigo',fr:'Lire l’article',pl:'Przeczytaj artykuł',it:'Leggi l’articolo',he:'לקריאת המאמר',ja:'記事を読む',ko:'글 읽기'},
    sheetArt:{ru:'Основы',uk:'Основи',en:'Essentials',es:'Lo esencial',de:'Grundlagen',pt:'O essencial',fr:'L’essentiel',pl:'Podstawy',it:'Le basi',he:'היסודות',ja:'基本',ko:'기초'},
    sheetArtSub:{ru:'Коротко о главном: что происходит и что делать',uk:'Коротко про головне: що відбувається і що робити',en:'The key facts: what’s happening and what to do',es:'Lo importante: qué está pasando y qué hacer',de:'Das Wichtigste: was passiert und was hilft',pt:'O principal: o que está acontecendo e o que fazer',fr:'L’essentiel : ce qui se passe et que faire',pl:'Najważniejsze: co się dzieje i co robić',it:'L’essenziale: cosa succede e cosa fare',he:'בקצרה: מה קורה ומה עושים',ja:'何が起きていて、何ができるかを手短に',ko:'무슨 일이 일어나고 무엇을 할 수 있는지 간단히'},
    sheetTg:{ru:'Сообщество в Telegram',uk:'Спільнота в Telegram',en:'Telegram community',es:'Comunidad en Telegram',de:'Community auf Telegram',pt:'Comunidade no Telegram',fr:'Communauté sur Telegram',pl:'Społeczność na Telegramie',it:'Community su Telegram',he:'הקהילה בטלגרם',ja:'Telegramコミュニティ',ko:'텔레그램 커뮤니티'},
    sheetTgSub:{ru:'Общение с женщинами, которые проходят то же',uk:'Спілкування з жінками, які проходять те саме',en:'Talk with women going through the same',es:'Habla con mujeres que viven lo mismo',de:'Austausch mit Frauen, die dasselbe erleben',pt:'Converse com mulheres que vivem o mesmo',fr:'Échangez avec des femmes qui vivent la même chose',pl:'Rozmowy z kobietami, które przechodzą to samo',it:'Parla con donne che vivono lo stesso',he:'שיחה עם נשים שעוברות את אותו הדבר',ja:'同じ経験をしている女性たちと話せます',ko:'같은 시기를 지나는 여성들과 이야기해요'},
    men:  {ru:'Мужское',uk:'Чоловіче',en:'For men',es:'Para hombres',de:'Für Männer',pt:'Para homens',fr:'Pour les hommes',pl:'Dla mężczyzn',it:'Per uomini',he:'לגברים',ja:'男性のために',ko:'남성을 위해'},
    rowSubM:{ru:'Андропауза, сон, сердце и что делать',uk:'Андропауза, сон, серце і що робити',en:'Andropause, sleep, heart and what to do',es:'Andropausia, sueño, corazón y qué hacer',de:'Andropause, Schlaf, Herz und was hilft',pt:'Andropausa, sono, coração e o que fazer',fr:'Andropause, sommeil, cœur et que faire',pl:'Andropauza, sen, serce i co robić',it:'Andropausa, sonno, cuore e cosa fare',he:'אנדרופאוזה, שינה, לב ומה עושים',ja:'男性更年期、睡眠、心臓とできること',ko:'남성 갱년기, 수면, 심장과 할 수 있는 것'},
    // Библиотека VIA-L — платная часть (, 2026-10-18, docs/LIBRARY-FULL-MODEL.md): анонсы всем, текст — по подписке.
    res:   {ru:'Библиотека VIA-L',uk:'Бібліотека VIA-L',en:'VIA-L Library',es:'Biblioteca VIA-L',de:'VIA-L-Bibliothek',pt:'Biblioteca VIA-L',fr:'Bibliothèque VIA-L',pl:'Biblioteka VIA-L',it:'Biblioteca VIA-L',he:'הספרייה של VIA-L',ja:'VIA-Lライブラリー',ko:'VIA-L 라이브러리'},
    resSub:{ru:'Научные работы простым языком: кто, что, как и что это значит для вас',uk:'Наукові роботи простою мовою: хто, що, як і що це означає для вас',en:'Studies in plain language: who, what, how and what it means for you',es:'Estudios en lenguaje sencillo: quién, qué, cómo y qué significa para ti',de:'Studien in einfacher Sprache: wer, was, wie und was es für dich bedeutet',pt:'Estudos em linguagem simples: quem, o quê, como e o que significa para você',fr:'Des études en langage clair : qui, quoi, comment et ce que cela signifie pour vous',pl:'Badania prostym językiem: kto, co, jak i co to dla Ciebie znaczy',it:'Studi in parole semplici: chi, cosa, come e cosa significa per te',he:'מחקרים בשפה פשוטה: מי, מה, איך ומה זה אומר עבורך',ja:'研究をやさしい言葉で：誰が、何を、どう調べ、あなたにとって何を意味するか',ko:'쉬운 말로 읽는 연구: 누가, 무엇을, 어떻게, 그리고 나에게 어떤 의미인지'},
    resMyth:{ru:'Миф и факты',uk:'Міф і факти',en:'Myth vs facts',es:'Mito y hechos',de:'Mythos und Fakten',pt:'Mito e fatos',fr:'Mythe et faits',pl:'Mit i fakty',it:'Mito e fatti',he:'מיתוס ועובדות',ja:'俗説と事実',ko:'속설과 사실'},
    resStudy:{ru:'Разбор исследования',uk:'Розбір дослідження',en:'Study explained',es:'Estudio explicado',de:'Studie erklärt',pt:'Estudo explicado',fr:'Étude expliquée',pl:'Badanie w skrócie',it:'Studio spiegato',he:'מחקר בהסבר',ja:'研究の解説',ko:'연구 해설'},
    resLock:{ru:'Полный разбор доступен по подписке VIA-L.',uk:'Повний розбір доступний за підпискою VIA-L.',en:'The full summary is part of the VIA-L subscription.',es:'El resumen completo está incluido en la suscripción VIA-L.',de:'Die vollständige Zusammenfassung ist im VIA-L-Abo enthalten.',pt:'O resumo completo faz parte da assinatura VIA-L.',fr:'Le résumé complet est inclus dans l’abonnement VIA-L.',pl:'Pełne omówienie jest dostępne w subskrypcji VIA-L.',it:'Il riassunto completo è incluso nell’abbonamento VIA-L.',he:'הסיכום המלא כלול במנוי VIA-L.',ja:'全文はVIA-Lのサブスクリプションでお読みいただけます。',ko:'전체 해설은 VIA-L 구독에 포함되어 있어요.'},
    resLockWeb:{ru:'Полный разбор доступен в приложении VIA-L по подписке.',uk:'Повний розбір доступний у застосунку VIA-L за підпискою.',en:'The full summary is available in the VIA-L app with a subscription.',es:'El resumen completo está disponible en la app VIA-L con suscripción.',de:'Die vollständige Zusammenfassung gibt es in der VIA-L-App mit Abo.',pt:'O resumo completo está disponível no app VIA-L com assinatura.',fr:'Le résumé complet est disponible dans l’app VIA-L avec abonnement.',pl:'Pełne omówienie jest dostępne w aplikacji VIA-L w subskrypcji.',it:'Il riassunto completo è disponibile nell’app VIA-L con abbonamento.',he:'הסיכום המלא זמין באפליקציית VIA-L במנוי.',ja:'全文はVIA-Lアプリのサブスクリプションでお読みいただけます。',ko:'전체 해설은 VIA-L 앱 구독으로 볼 수 있어요.'},
resFind:{ru:'Поиск: сон, приливы, кофе…',uk:'Пошук: сон, припливи, кава…',en:'Search: sleep, hot flashes, coffee…',es:'Buscar: sueño, sofocos, café…',de:'Suche: Schlaf, Hitzewallungen, Kaffee…',pt:'Buscar: sono, ondas de calor, café…',fr:'Rechercher : sommeil, bouffées de chaleur, café…',pl:'Szukaj: sen, uderzenia gorąca, kawa…',it:'Cerca: sonno, vampate, caffè…',he:'חיפוש: שינה, גלי חום, קפה…',ja:'検索：睡眠、ほてり、コーヒー…',ko:'검색: 수면, 안면홍조, 커피…'},
    back:{en:'Library',ru:'Библиотека',uk:'Бібліотека',es:'Biblioteca',de:'Bibliothek',pt:'Biblioteca',fr:'Bibliothèque',pl:'Biblioteka',it:'Biblioteca',he:'ספרייה',ja:'ライブラリ',ko:'라이브러리'},
    resTopics:{ru:'Темы',uk:'Теми',en:'Topics',es:'Temas',de:'Themen',pt:'Temas',fr:'Thèmes',pl:'Tematy',it:'Temi',he:'נושאים',ja:'テーマ',ko:'주제'},
    resAll:{ru:'Все темы',uk:'Усі теми',en:'All topics',es:'Todos los temas',de:'Alle Themen',pt:'Todos os temas',fr:'Tous les thèmes',pl:'Wszystkie tematy',it:'Tutti i temi',he:'כל הנושאים',ja:'すべてのテーマ',ko:'모든 주제'},
    resAsk:{ru:'Попросить добавить эту тему',uk:'Попросити додати цю тему',en:'Ask us to add this topic',es:'Pedir que añadamos este tema',de:'Dieses Thema vorschlagen',pt:'Pedir para adicionar este tema',fr:'Demander d’ajouter ce thème',pl:'Poproś o dodanie tego tematu',it:'Chiedi di aggiungere questo tema',he:'לבקש להוסיף את הנושא',ja:'このテーマの追加をリクエスト',ko:'이 주제 추가 요청하기'},
    resAsked:{ru:'Спасибо! Запрос у нас. Если найдём хорошее исследование, добавим материал в ближайшее время.',uk:'Дякуємо! Запит у нас. Якщо знайдемо гарне дослідження, додамо матеріал найближчим часом.',en:'Thank you! We’ve got your request. If we find a good study, we’ll add it soon.',es:'¡Gracias! Hemos recibido tu petición. Si encontramos un buen estudio, lo añadiremos pronto.',de:'Danke! Deine Anfrage ist bei uns. Wenn wir eine gute Studie finden, ergänzen wir sie bald.',pt:'Obrigado! Recebemos seu pedido. Se encontrarmos um bom estudo, vamos adicioná-lo em breve.',fr:'Merci ! Votre demande est bien reçue. Si nous trouvons une bonne étude, nous l’ajouterons bientôt.',pl:'Dziękujemy! Mamy Twoją prośbę. Jeśli znajdziemy dobre badanie, wkrótce je dodamy.',it:'Grazie! Abbiamo ricevuto la richiesta. Se troviamo un buono studio, lo aggiungeremo presto.',he:'תודה! הבקשה התקבלה. אם נמצא מחקר טוב, נוסיף אותו בקרוב.',ja:'ありがとうございます。リクエストを受け取りました。良い研究が見つかれば、近いうちに追加します。',ko:'감사해요! 요청을 받았어요. 좋은 연구를 찾으면 곧 추가할게요.'},
    resAskErr:{ru:'Не получилось отправить. Попробуйте позже.',uk:'Не вдалося надіслати. Спробуйте пізніше.',en:'Couldn’t send. Please try later.',es:'No se pudo enviar. Inténtalo más tarde.',de:'Senden fehlgeschlagen. Bitte später erneut versuchen.',pt:'Não foi possível enviar. Tente mais tarde.',fr:'Envoi impossible. Réessayez plus tard.',pl:'Nie udało się wysłać. Spróbuj później.',it:'Invio non riuscito. Riprova più tardi.',he:'השליחה נכשלה. נסו שוב מאוחר יותר.',ja:'送信できませんでした。後でもう一度お試しください。',ko:'보내지 못했어요. 나중에 다시 시도해 주세요.'},
    resNone:{ru:'Ничего не нашлось. Попробуйте другое слово.',uk:'Нічого не знайшлося. Спробуйте інше слово.',en:'Nothing found. Try another word.',es:'No hay resultados. Prueba otra palabra.',de:'Nichts gefunden. Versuche ein anderes Wort.',pt:'Nada encontrado. Tente outra palavra.',fr:'Aucun résultat. Essayez un autre mot.',pl:'Nic nie znaleziono. Spróbuj innego słowa.',it:'Nessun risultato. Prova un’altra parola.',he:'לא נמצא דבר. נסו מילה אחרת.',ja:'見つかりませんでした。別の言葉で試してください。',ko:'찾지 못했어요. 다른 단어로 찾아보세요.'},
        resSubBtn:{ru:'Подписка VIA-L',uk:'Підписка VIA-L',en:'VIA-L subscription',es:'Suscripción VIA-L',de:'VIA-L-Abo',pt:'Assinatura VIA-L',fr:'Abonnement VIA-L',pl:'Subskrypcja VIA-L',it:'Abbonamento VIA-L',he:'מנוי VIA-L',ja:'VIA-Lのサブスクリプション',ko:'VIA-L 구독'},
    resLoad:{ru:'Загружаем…',uk:'Завантажуємо…',en:'Loading…',es:'Cargando…',de:'Wird geladen…',pt:'Carregando…',fr:'Chargement…',pl:'Ładowanie…',it:'Caricamento…',he:'טוען…',ja:'読み込み中…',ko:'불러오는 중…'},
    resErr:{ru:'Не получилось загрузить. Проверьте интернет и откройте ещё раз.',uk:'Не вдалося завантажити. Перевірте інтернет і відкрийте ще раз.',en:'Couldn’t load. Check your connection and try again.',es:'No se pudo cargar. Revisa tu conexión e inténtalo de nuevo.',de:'Laden fehlgeschlagen. Prüfe die Verbindung und versuche es erneut.',pt:'Não foi possível carregar. Verifique a conexão e tente de novo.',fr:'Chargement impossible. Vérifiez votre connexion et réessayez.',pl:'Nie udało się wczytać. Sprawdź internet i spróbuj ponownie.',it:'Impossibile caricare. Controlla la connessione e riprova.',he:'הטעינה נכשלה. בדקו את החיבור ונסו שוב.',ja:'読み込めませんでした。接続を確認してもう一度お試しください。',ko:'불러오지 못했어요. 인터넷을 확인하고 다시 시도해 주세요.'},
    resNew:{ru:'Новые материалы выходят каждую неделю.',uk:'Нові матеріали виходять щотижня.',en:'New pieces come out every week.',es:'Cada semana hay contenido nuevo.',de:'Jede Woche erscheinen neue Beiträge.',pt:'Novos conteúdos saem toda semana.',fr:'De nouveaux contenus chaque semaine.',pl:'Nowe materiały co tydzień.',it:'Nuovi contenuti ogni settimana.',he:'תכנים חדשים יוצאים כל שבוע.',ja:'毎週新しい記事が追加されます。',ko:'매주 새 글이 올라와요.'},
    resSrc:{ru:'Источник',uk:'Джерело',en:'Source',es:'Fuente',de:'Quelle',pt:'Fonte',fr:'Source',pl:'Źródło',it:'Fonte',he:'מקור',ja:'出典',ko:'출처'},
    resRel:{ru:'Связанная статья',uk:'Пов’язана стаття',en:'Related article',es:'Artículo relacionado',de:'Passender Artikel',pt:'Artigo relacionado',fr:'Article associé',pl:'Powiązany artykuł',it:'Articolo correlato',he:'מאמר קשור',ja:'関連記事',ko:'관련 글'},
    check: {ru:'Проверено специалистом VIA-L',uk:'Перевірено спеціалістом VIA-L',en:'Reviewed by a VIA-L specialist',es:'Revisado por un especialista de VIA-L',de:'Geprüft von einer VIA-L-Fachperson',pt:'Revisado por um especialista VIA-L',fr:'Relu par un spécialiste VIA-L',pl:'Sprawdzone przez specjalistę VIA-L',it:'Rivisto da uno specialista VIA-L',he:'נבדק על ידי מומחה VIA-L',ja:'VIA-Lの専門家が確認済み',ko:'VIA-L 전문가 검토 완료'}
  };
  function tx(o, lang) { return (o && (o[lang] || o.en || o.ru)) || ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function data(lang) { var A = window.VIAL_ART; return (A && A.langs && A.langs[lang]) || null; }
  // Мужской раздел (2026-10-17): мужчине — свои статьи; язык без мужского набора мужчине «Основы» не показывает.
  function hasMen(lang) { var A = window.VIAL_ART; return !!(A && A.men && A.men.indexOf(lang) > -1 && data(lang)); }
  function secs(lang) { var A = window.VIAL_ART; return isMale() ? (A.sectionsM || []) : A.sections; }
  // Карточка жалобы мужчины → его статья (ключ жалобы из complaint-table.js; libido уже приходит как libido_m).
  var MK = { sleep: 'sleep_m', energy: 'energy_m', mood: 'mood_m', fog: 'fog_m', weight: 'weight_m', pain: 'pain_m',
             muscle: 'muscle_m', drive: 'drive', libido_m: 'libido_m',
             // шаги «Фокуса недели» (2026-10-18); cool — без статьи: в мужской базе нет опоры
             evening: 'evening_m', wake: 'wake_m', strength: 'strength_m', protein: 'protein_m', walk: 'walk_m',
             breath: 'breath_m', bed: 'bed_m', order: 'order_m' };

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

  // Группа в Telegram — ссылка на язык: четыре группы ru, uk, en, es (владелец 2026-10-17, docs/ARTICLE-LIBRARY-PLAN.md). Пусто = группы
  // ещё нет: книга внизу открывает статьи сразу, без выбора. Ссылку вписывает владелец, когда группа откроется.
  var TG = { ru: '', uk: '', en: '', es: '' };


  function sheetClose() { var o = document.getElementById('vialLibSheet'); if (o) o.remove(); document.body.classList.remove('lib-sheet'); }
  function shRow(tag, attrs, ic, t, sub) {
    return '<' + tag + ' class="art-sh" ' + attrs + '><span class="art-sh-ic"><i class="ph ' + ic + '"></i></span>'
      + '<span class="art-sh-tx"><span class="art-sh-t">' + esc(t) + '</span><span class="art-sh-s">' + esc(sub) + '</span></span>'
      + '<span class="art-sh-chev">›</span></' + tag + '>';
  }
  // Выбор по нажатию на книгу: «Библиотека VIA-L» (платная, в приложении), «Основы» и группа (если есть).
  // Строки «на сайте» нет (владелец 2026-10-18): «Основы» есть в приложении на всех 12 языках.
  // Платная полка — строкой здесь, а не внутри «Основ», и не на сайте: подписку видит только приложение (владелец 2026-10-18).
  function sheet(lang) {
    sheetClose(); css();
    var o = document.createElement('div'); o.id = 'vialLibSheet'; o.className = 'art-sheet-bg';
    o.onclick = function (e) { if (e.target === o) sheetClose(); };
    var res = resHas(lang) ? shRow('button', 'type="button" id="artSheetRes"', 'ph-flask', tx(UI.res, lang), tx(UI.resSub, lang)) : '';
    var art = has(lang) ? shRow('button', 'type="button" id="artSheetArt"', 'ph-book-open-text', tx(UI.sheetArt, lang), tx(UI.sheetArtSub, lang)) : '';
    var tg = TG[lang] ? shRow('a', 'href="' + esc(TG[lang]) + '" target="_blank" rel="noopener"', 'ph-telegram-logo', tx(UI.sheetTg, lang), tx(UI.sheetTgSub, lang)) : '';
    if (!(res || art || tg)) return;   // нечего показать — без пустой полосы и спрятанного советника
    o.innerHTML = '<div class="art-sheet">' + res + art + tg + '</div>';
    document.body.appendChild(o); document.body.classList.add('lib-sheet');
    var b = document.getElementById('artSheetArt');
    if (b) b.onclick = function () { sheetClose(); if (typeof window.navTo === 'function') window.navTo('lib', { direct: 1 }); };
    var rb = document.getElementById('artSheetRes');
    if (rb) rb.onclick = function () { sheetClose(); if (typeof window.navTo === 'function') window.navTo('lib', { direct: 1 }); if (typeof window._cardOpen === 'function') { resQ = ''; resTopic = ''; resMenu = false; window._cardOpen('research'); } };
    [].forEach.call(o.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { setTimeout(sheetClose, 300); }); });
  }

  function has(lang) { return isMale() ? hasMen(lang) : !!data(lang); }
  function isMale() { try { return (JSON.parse(localStorage.getItem('vialp_profile') || '{}') || {}).gender === 'male'; } catch (e) { return false; } }
  // Открыть статью из карточки «Что беспокоит» / «Фокуса недели»: закрыть главу памятки, вкладка «Библиотека», статья.
  function go(k) {
    try { if (typeof window.closeCircModal === 'function') window.closeCircModal(); } catch (e) {}
    if (typeof window.navTo === 'function') window.navTo('lib', { direct: 1 });
    if (typeof window._cardOpen === 'function') window._cardOpen('art:' + k);
  }

  // ── Полная библиотека: разборы исследований (2026-10-18) ──
  // Анонсы — GET /library/catalog (открыто), текст — POST /library/item: воркер сверяет подписку с RevenueCat
  // по идентификатору покупателя. Без подписки — анонс + кнопка экрана подписки стора (цен и сайта здесь нет).
  // Тексты: канон ru + наш перевод uk/en/es; остальные 8 языков приложения читают английский (владелец 2026-10-18).
  // Названия тем — на языке приложения (12), сами материалы — на языке текста (resLang).
  var API = 'https://interpreter.viaelcom.workers.dev', RES_LANGS = ['ru', 'uk', 'en', 'es'];
  function resLang(lang) { return RES_LANGS.indexOf(lang) > -1 ? lang : 'en'; }
  var TOPIC = {
    sleep:{ru:'Сон',uk:'Сон',en:'Sleep',es:'Sueño',de:'Schlaf',pt:'Sono',fr:'Sommeil',pl:'Sen',it:'Sonno',he:'שינה',ja:'睡眠',ko:'수면'},
    myths:{ru:'Мифы о перименопаузе',uk:'Міфи про перименопаузу',en:'Perimenopause myths',es:'Mitos sobre la perimenopausia',de:'Mythen über die Perimenopause',pt:'Mitos sobre a perimenopausa',fr:'Idées reçues sur la périménopause',pl:'Mity o perimenopauzie',it:'Miti sulla perimenopausa',he:'מיתוסים על פרימנופאוזה',ja:'更年期前後の俗説',ko:'폐경 이행기에 대한 속설'},
    food:{ru:'Питание',uk:'Харчування',en:'Nutrition',es:'Alimentación',de:'Ernährung',pt:'Alimentação',fr:'Alimentation',pl:'Odżywianie',it:'Alimentazione',he:'תזונה',ja:'食事',ko:'식사'},
    exercise:{ru:'Физические упражнения',uk:'Фізичні вправи',en:'Exercise',es:'Ejercicio',de:'Bewegung',pt:'Exercício',fr:'Activité physique',pl:'Aktywność fizyczna',it:'Esercizio fisico',he:'פעילות גופנית',ja:'運動',ko:'운동'},
    mental:{ru:'Психическое здоровье',uk:'Психічне здоров’я',en:'Mental health',es:'Salud mental',de:'Psychische Gesundheit',pt:'Saúde mental',fr:'Santé mentale',pl:'Zdrowie psychiczne',it:'Salute mentale',he:'בריאות נפשית',ja:'心の健康',ko:'마음 건강'},
    sex:{ru:'Сексуальное здоровье',uk:'Сексуальне здоров’я',en:'Sexual health',es:'Salud sexual',de:'Sexuelle Gesundheit',pt:'Saúde sexual',fr:'Santé sexuelle',pl:'Zdrowie seksualne',it:'Salute sessuale',he:'בריאות מינית',ja:'性の健康',ko:'성 건강'},
    hormones:{ru:'Гормональное здоровье',uk:'Гормональне здоров’я',en:'Hormonal health',es:'Salud hormonal',de:'Hormonelle Gesundheit',pt:'Saúde hormonal',fr:'Santé hormonale',pl:'Zdrowie hormonalne',it:'Salute ormonale',he:'בריאות הורמונלית',ja:'ホルモンの健康',ko:'호르몬 건강'},
    heart:{ru:'Сердце и сосуды',uk:'Серце і судини',en:'Heart and blood vessels',es:'Corazón y vasos sanguíneos',de:'Herz und Gefäße',pt:'Coração e vasos',fr:'Cœur et vaisseaux',pl:'Serce i naczynia',it:'Cuore e vasi sanguigni',he:'לב וכלי דם',ja:'心臓と血管',ko:'심장과 혈관'},
    pelvic:{ru:'Тазовое дно',uk:'Тазове дно',en:'Pelvic floor',es:'Suelo pélvico',de:'Beckenboden',pt:'Assoalho pélvico',fr:'Plancher pelvien',pl:'Dno miednicy',it:'Pavimento pelvico',he:'רצפת האגן',ja:'骨盤底',ko:'골반저'},
    osnovy:{ru:'Основы перименопаузы и менопаузы',uk:'Основи перименопаузи й менопаузи',en:'Perimenopause and menopause basics',es:'Lo básico de la perimenopausia y la menopausia',de:'Grundlagen zu Perimenopause und Menopause',pt:'O básico sobre perimenopausa e menopausa',fr:'Bases de la périménopause et de la ménopause',pl:'Podstawy perimenopauzy i menopauzy',it:'Le basi di perimenopausa e menopausa',he:'יסודות הפרימנופאוזה והמנופאוזה',ja:'更年期の基本',ko:'폐경 이행기와 폐경의 기초'},
    treatment:{ru:'Варианты лечения',uk:'Варіанти лікування',en:'Treatment options',es:'Opciones de tratamiento',de:'Behandlungsmöglichkeiten',pt:'Opções de tratamento',fr:'Options de traitement',pl:'Możliwości leczenia',it:'Opzioni di trattamento',he:'אפשרויות טיפול',ja:'治療の選択肢',ko:'치료 선택지'} };
  var resCat = null, resCatLang = '', resItems = {};
  function resHas(lang) { return !isMale(); }   // все 12 языков (resLang); мужские темы — позже (LIBRARY-FULL-MODEL §1)
  function subOn() { try { return localStorage.getItem('vialp_entitlement') === '1'; } catch (e) { return false; } }
  function inApp() { return !!(window.Capacitor && typeof window.iapAvailable === 'function' && window.iapAvailable()); }
  function resFill(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function resRow(x, lang) {
    return '<button type="button" class="vc-link vc-span art-row" onclick="_cardOpen(\'res:' + esc(x.id) + '\')">'
      + '<span class="vc-txt"><span class="vc-tt">' + esc(x.title) + '</span>'
      + '<span class="vc-sub2">' + esc(tx(x.type === 'myth' ? UI.resMyth : UI.resStudy, lang)) + ' · ' + esc(x.year || '') + '</span></span>'
      + '<span class="vc-chev">' + (subOn() ? '›' : '<i class="ph ph-lock-simple"></i>') + '</span></button>';
  }
  var resQ = '';   // строка поиска по полке: заголовок, анонс, тема (полный текст закрыт — ищем по анонсам)
  var resTopic = '', resMenu = false, resAsked = {};   // ☰ «Темы»: выбранная тема ('' — все), открыт ли список тем; уже отправленные запросы
  function resMatch(x, lang) {
    if (resTopic && x.topic !== resTopic) return false;
    if (!resQ) return true;
    var hay = (x.title + ' ' + (x.teaser || '') + ' ' + (tx(TOPIC[x.topic], lang) || '')).toLowerCase();
    return resQ.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
  }
  function resTopicBtn(lang) {
    var b = document.getElementById('vialResTopicsT'); if (b) b.textContent = resTopic ? (tx(TOPIC[resTopic], lang) || resTopic) : tx(UI.resTopics, lang);
  }
  // Список тем вместо материалов: «Все темы» + 11 тем с числом материалов; нажатие — тема и её материалы.
  function resMenuRender(lang) {
    var order = [], cnt = {};
    resCat.forEach(function (x) { if (!cnt[x.topic]) { cnt[x.topic] = 0; order.push(x.topic); } cnt[x.topic]++; });
    var row = function (k, t, n) {
      return '<button type="button" class="vc-link vc-span" onclick="vialLibrary.resPick(\'' + esc(k) + '\',\'' + esc(lang) + '\')">'
        + '<span class="vc-txt"><span class="vc-tt">' + esc(t) + '</span></span><span class="vc-sub2">' + n + '</span>'
        + '<span class="vc-chev">' + (k === resTopic ? '<i class="ph ph-check"></i>' : '›') + '</span></button>';
    };
    resFill('vialResList', row('', tx(UI.resAll, lang), resCat.length)
      + order.reverse().map(function (k) { return row(k, tx(TOPIC[k], lang) || k, cnt[k]); }).join(''));
  }
  // Поиск ничего не нашёл → запрос уходит нам на почту (POST /library/ask), тему добавим, если актуальна (владелец 2026-10-18).
  function resNoneHtml(lang) {
    var q = resQ;
    if (!q || q.length < 2) return '<p class="art-p art-note" style="grid-column:1/-1;">' + esc(tx(UI.resNone, lang)) + '</p>';
    if (resAsked[q]) return '<p class="art-p art-note" style="grid-column:1/-1;">' + esc(tx(resAsked[q] === 'err' ? UI.resAskErr : UI.resAsked, lang)) + '</p>';
    return '<div style="grid-column:1/-1;"><p class="art-p art-note">' + esc(tx(UI.resNone, lang)) + '</p>'
      + '<button type="button" class="as-usual" id="vialResAsk" onclick="vialLibrary.resAsk(\'' + esc(lang) + '\')">'
      + '<i class="ph ph-paper-plane-tilt" aria-hidden="true"></i>' + esc(tx(UI.resAsk, lang)) + '</button></div>';
  }
  function resListRender(lang) {
    if (!resCat) return;
    resTopicBtn(lang);
    if (resMenu) return resMenuRender(lang);
    var order = [], by = {}, hit = resCat.filter(function (x) { return resMatch(x, lang); });
    if (!hit.length) return resFill('vialResList', resNoneHtml(lang));
    hit.forEach(function (x) { if (!by[x.topic]) { by[x.topic] = []; order.push(x.topic); } by[x.topic].push(x); });
    resFill('vialResList', order.reverse().map(function (k) {   // свежая тема — сверху
      return '<div class="vc-subh vc-span" style="grid-column:1/-1;">' + esc(tx(TOPIC[k], lang) || k) + '</div>'
        + by[k].map(function (x) { return resRow(x, lang); }).join('');
    }).join('') + '<div class="art-note vc-span" style="grid-column:1/-1;margin-top:6px;">' + esc(tx(UI.resNew, lang)) + '</div>');
  }
  function resCatalog(lang, cb) {
    if (resCat && resCatLang === resLang(lang)) return cb();   // сменили язык — каталог заново
    var L = resLang(lang);
    fetch(API + '/library/catalog?lang=' + encodeURIComponent(L)).then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw 0; resCat = j.items || []; resCatLang = L; cb(); })
      .catch(function () { cb(true); });
  }
  function resLocked(x, lang) {
    var btn = inApp() ? '<button type="button" class="as-usual" style="display:flex;width:100%;justify-content:center;align-items:center;gap:7px;margin-top:12px;" onclick="_iapOpenFromProfile()">'
      + '<i class="ph ph-lock-simple-open" aria-hidden="true"></i>' + esc(tx(UI.resSubBtn, lang)) + '</button>' : '';
    return '<div class="art-card"><div class="art-min">' + esc(tx(x.type === 'myth' ? UI.resMyth : UI.resStudy, lang)) + '</div>'
      + '<h2 class="art-title">' + esc(x.title) + '</h2>'
      + (x.teaser ? '<p class="art-p">' + esc(x.teaser) + '</p>' : '')
      + '<p class="art-p art-note"><i class="ph ph-lock-simple"></i> ' + esc(tx(inApp() ? UI.resLock : UI.resLockWeb, lang)) + '</p>' + btn + '</div>';
  }
  function resFull(it, lang) {
    var s = it.source || {};
    return '<div class="art-card"><div class="art-min">' + esc(tx(it.type === 'myth' ? UI.resMyth : UI.resStudy, lang)) + '</div>'
      + '<h2 class="art-title">' + esc(it.title) + '</h2>'
      + (it.fields || []).map(function (f) { return '<p class="art-p"><b>' + esc(f[0]) + ':</b> ' + esc(f[1]) + '</p>'; }).join('')
      + (it.related ? '<p class="art-p art-note">' + esc(tx(UI.resRel, lang)) + ': ' + esc(String(it.related).replace(/^статья\s*/i, '')) + '</p>' : '')
      + '<p class="art-p art-note"><b>' + esc(tx(UI.resSrc, lang)) + ':</b> ' + esc(s.authors || '') + '. ' + esc(s.title || '') + ' ' + esc(s.journal || '') + ', ' + esc(s.year || '')
      + (s.url ? '. <a href="' + esc(s.url) + '" target="_blank" rel="noopener" style="color:var(--gold-lt);">' + esc(String(s.url).replace('https://', '')) + '</a>' : '') + '</p>'
      + '<div class="art-check"><i class="ph ' + ((it.reviewed || /специалист/.test(it.signature || '')) ? 'ph-seal-check' : 'ph-robot') + '" aria-hidden="true"></i>' + esc(it.signature || '') + '</div></div>';
  }
  async function resLoadItem(id, lang) {
    var x = (resCat || []).filter(function (y) { return y.id === id; })[0];
    if (!x) return resFill('vialResItem', '<p class="art-p">' + esc(tx(UI.resErr, lang)) + '</p>');
    var ik = resLang(lang) + ':' + id;
    if (resItems[ik]) return resFill('vialResItem', resFull(resItems[ik], lang));
    if (!subOn() || !inApp()) return resFill('vialResItem', resLocked(x, lang));
    try {
      var rc = (typeof window.iapAppUserId === 'function') ? await window.iapAppUserId() : '';
      var r = await fetch(API + '/library/item', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, lang: resLang(lang), rc_user: rc, platform: (typeof window.iapPlatform === 'function') ? window.iapPlatform() : '' }) });
      var j = await r.json();
      if (r.status === 402) return resFill('vialResItem', resLocked(x, lang));
      if (!j || !j.ok) throw 0;
      resItems[ik] = j.item; resFill('vialResItem', resFull(j.item, lang));
    } catch (e) { resFill('vialResItem', '<p class="art-p">' + esc(tx(UI.resErr, lang)) + '</p>'); }
  }

  window.vialLibrary = {
    go: go,
    // Кнопка «Подробнее в статье» под карточкой (ключ жалобы или шага = ключ статьи). Нет статьи на языке — пусто.
    moreBtn: function (k, lang) {
      if (isMale()) k = hasMen(lang) ? (MK[k] || '') : '';   // нет мужской статьи (cool, непереведённый шаг) — без ссылки
      var d = data(lang); if (!k || !d || !d[k]) return '';
      return '<button type="button" class="as-usual" style="display:flex;width:100%;justify-content:center;align-items:center;gap:7px;margin-top:10px;" onclick="vialLibrary.go(\'' + k + '\')">'
        + '<i class="ph ph-book-open-text" aria-hidden="true"></i>' + esc(tx(UI.more, lang)) + '</button>';
    },
    has: has,
    isMale: isMale,
    hasTab: function () { return true; },   // книга в нижней строке: «Основы» есть у всех 12 языков
    tg: function (lang) { return TG[lang] || ''; },
    // Нажатие на книгу: всегда выбор (статьи / сайт / группа).
    tap: function (lang) { sheet(lang); return false; },
    sheetClose: sheetClose,
    label: function (k, lang) { return tx(UI[k], lang); },
    // «Профиль › Статьи»: три раздела, внутри — строки-входы теми же классами, что «Мои данные» / «Настройки».
    listHtml: function (lang) {
      var d = data(lang); if (!has(lang)) return '';
      css();
      return secs(lang).map(function (sec) {
        if (!sec[1].some(function (k) { return d[k]; })) return '';   // группа ещё не переведена на язык — без заголовка
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
        + (((window.VIAL_ART.reviewed || []).indexOf(lang) > -1) && !a.nr   // подпись — только вычитанное специалистом
            ? '<div class="art-check"><i class="ph ph-seal-check" aria-hidden="true"></i>' + esc(tx(UI.check, lang)) + '</div>' : '')
        + '</div>';
    },
    title: function (k, lang) { var d = data(lang); return (d && d[k] && d[k].t) || ''; },
    resHas: resHas,
    // «Библиотека › Разборы исследований»: список по темам (подгружается), замок — без подписки.
    researchHtml: function (lang) {
      css(); resMenu = false;   // тема и строка поиска сохраняются, пока человек ходит «в материал и назад»
      var find = '<div class="vc-span" style="grid-column:1/-1;display:flex;gap:8px;align-items:center;margin-bottom:6px;">'
        + '<button type="button" class="as-usual" style="margin-top:0;flex:0 0 auto;max-width:45%;" onclick="vialLibrary.resMenu(\'' + esc(lang) + '\')">'
        + '<i class="ph ph-list" aria-hidden="true"></i><span id="vialResTopicsT" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(resTopic ? (tx(TOPIC[resTopic], lang) || resTopic) : tx(UI.resTopics, lang)) + '</span></button>'
        + '<input type="search" id="vialResFind" class="manual-input" style="flex:1 1 auto;min-width:0;box-sizing:border-box;" value="' + esc(resQ) + '"'
        + ' placeholder="' + esc(tx(UI.resFind, lang)) + '" oninput="vialLibrary.resFind(this.value,\'' + esc(lang) + '\')"></div>';
      var box = find + '<div id="vialResList" class="vc-span" style="grid-column:1/-1;display:contents;"><p class="art-p art-note">' + esc(tx(UI.resLoad, lang)) + '</p></div>';
      setTimeout(function () { resCatalog(lang, function (err) { if (err) resFill('vialResList', '<p class="art-p">' + esc(tx(UI.resErr, lang)) + '</p>'); else resListRender(lang); }); }, 0);
      return box;
    },
    resFind: function (q, lang) { resQ = String(q || '').trim().toLowerCase(); resMenu = false; resListRender(lang); },
    resMenu: function (lang) { resMenu = !resMenu; resListRender(lang); },
    resPick: function (k, lang) { resTopic = k || ''; resMenu = false; resQ = ''; var f = document.getElementById('vialResFind'); if (f) f.value = ''; resListRender(lang); },   // тема — с чистым поиском
    resReset: function () { resQ = ''; resTopic = ''; resMenu = false; },
    resAsk: function (lang) {
      var q = resQ; if (!q || resAsked[q]) return;
      var b = document.getElementById('vialResAsk'); if (b) b.disabled = true;
      fetch(API + '/library/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: q, lang: lang, platform: (typeof window.iapPlatform === 'function') ? window.iapPlatform() : '' }) })
        .then(function (r) { resAsked[q] = r.ok ? 'ok' : 'err'; })
        .catch(function () { resAsked[q] = 'err'; })
        .then(function () { if (resQ === q) resListRender(lang); });
    },
    researchItemHtml: function (id, lang) {
      css(); setTimeout(function () { resCatalog(lang, function (err) { if (err) resFill('vialResItem', '<p class="art-p">' + esc(tx(UI.resErr, lang)) + '</p>'); else resLoadItem(id, lang); }); }, 0);
      return '<div id="vialResItem" style="grid-column:1/-1;"><p class="art-p art-note">' + esc(tx(UI.resLoad, lang)) + '</p></div>';
    }
  };
  try { if (window.vialBottomNav && vialBottomNav.refresh) vialBottomNav.refresh(); } catch (e) {}   // строка смонтирована раньше — показать книгу
})();
