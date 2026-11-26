/* VIA·L — «Прохлада»: гипнотическая релаксация при приливах и для сна (2026-11-24; модель — docs/HYPNOSIS-MODEL.md).
   Карточка в шаге 5 «Мой вечерний ритуал» (#rdHypno), под блоком «Сон». 6 недель: каждую неделю своя запись
   (неделя считается от первого прослушивания), плюс «выручалка» на 2–3 минуты, когда начинается прилив.
   Записи — Gemini TTS (голос Sulafat), лежат в R2 `vial-assets/hypnosis/<язык>/<файл>.m4a` (моно AAC 64k),
   в бандл не входят: язык добавляется и текст правится без новой сборки (только залить файлы в R2).
   Курс виден только на языках из LANGS и не мужчинам. ИИ не нужен, на устройстве — только дата старта и журнал.
   Плеер: экран #sl-ov и стили sl-* из sleep.js, фон — записанный трек Pixabay (HYP_MUS, docs/SLEEP-MUSIC-SOURCES.md; без сети — vialSleep._music), экран не гаснет.
   Рамка для сторов: «гипнотическая релаксация» / «аудиопрактика», без «лечения» и обещаний. */
(function () {
  var BASE = 'https://pub-2f2f1a44a98c46beabafa751ba849852.r2.dev/hypnosis/';
  var LANGS = ['ru', 'uk', 'es'];   // язык — сюда только когда все 8 его файлов лежат в R2
  var FILES = { 1: 's1', 2: 's2', 3: 's3', 4: 's4', 5: 's5', '6d': 's6d', '6n': 's6n', sos: 'sos' };
  var NIGHT = { 3: 1, '6n': 1 };   // ночные записи: в конце не возвращают, мелодия ещё 2 минуты
  var KEY = 'vial_hyp';            // { start, ok, mel, log:[{d,k}] }

  function L() { return (typeof lang !== 'undefined' && lang) ? lang : 'en'; }
  function tr(o) { return (o && (o[L()] || o.en)) || ''; }
  function t(k) { return tr(S[k]); }
  function sl(k) { try { return window.vialSleep ? vialSleep.label(k) : ''; } catch (e) { return ''; } }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function get() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function put(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function male() { try { return String((JSON.parse(localStorage.getItem('vialp_profile') || '{}') || {}).gender || '') === 'male'; } catch (e) { return false; } }
  function avail() { return LANGS.indexOf(L()) >= 0 && !male(); }
  function dayKey() { try { return (typeof _dayKey === 'function') ? _dayKey() : new Date().toISOString().slice(0, 10); } catch (e) { return ''; } }
  function week() { var s = get(); return s.start ? Math.min(6, Math.floor((Date.now() - s.start) / (7 * 86400000)) + 1) : 1; }
  function evening() { var h = new Date().getHours(); return h >= 20 || h < 5; }
  function key6(n) { return n === 6 ? (evening() ? '6n' : '6d') : n; }
  function mel() { var m = get().mel; return m === 'music' || m === 'none' ? m : 'soft'; }

  // ── строки ×12 (русский — канон) ──
  var S = {
    card_t: {ru:'«Прохлада» — гипнотическая релаксация',uk:'«Прохолода» — гіпнотична релаксація',en:'“Cool” — hypnotic relaxation',es:'«Frescor» — relajación hipnótica',de:'„Kühle“ — hypnotische Entspannung',pt:'«Frescor» — relaxamento hipnótico',fr:'« Fraîcheur » — relaxation hypnotique',pl:'„Chłód” — relaksacja hipnotyczna',it:'«Fresco» — rilassamento ipnotico',he:'״קרירות״ — הרפיה היפנוטית',ja:'「涼しさ」— 催眠リラクゼーション',ko:'‘시원함’ — 최면 이완'},
    sub: {ru:'Аудиопрактика при приливах и для сна. 6 недель, одна запись в день — лучше вечером, 10–15 минут.',uk:'Аудіопрактика при припливах і для сну. 6 тижнів, один запис на день — краще ввечері, 10–15 хвилин.',en:'An audio practice for hot flashes and sleep. 6 weeks, one recording a day — ideally in the evening, 10–15 minutes.',es:'Práctica de audio para los sofocos y el sueño. 6 semanas, una grabación al día —mejor por la noche—, 10–15 minutos.',de:'Eine Audiopraxis bei Hitzewallungen und für den Schlaf. 6 Wochen, eine Aufnahme pro Tag — am besten abends, 10–15 Minuten.',pt:'Prática em áudio para as ondas de calor e o sono. 6 semanas, uma gravação por dia — de preferência à noite, 10–15 minutos.',fr:'Une pratique audio pour les bouffées de chaleur et le sommeil. 6 semaines, un enregistrement par jour — de préférence le soir, 10 à 15 minutes.',pl:'Praktyka audio na uderzenia gorąca i sen. 6 tygodni, jedno nagranie dziennie — najlepiej wieczorem, 10–15 minut.',it:'Una pratica audio per le vampate e il sonno. 6 settimane, una registrazione al giorno — meglio la sera, 10–15 minuti.',he:'תרגול שמע לגלי חום ולשינה. 6 שבועות, הקלטה אחת ביום — עדיף בערב, 10–15 דקות.',ja:'ほてりと睡眠のための音声プラクティス。6週間、1日1回の録音 — できれば夜に、10〜15分。',ko:'열감과 수면을 위한 오디오 연습. 6주, 하루 한 번 녹음 — 저녁이 좋아요, 10–15분.'},
    info: {ru:'Гипнотическая релаксация — это дыхание, расслабление тела и образ прохлады под голос. Состояние похоже на глубокий отдых: вы всё слышите и в любой момент можете открыть глаза.\n\nОткуда это: The Menopause Society (2023) рекомендует клинический гипноз при приливах — уровень доказательств I. В рандомизированном исследовании 2025 года (JAMA Network Open) 6 недель аудиозаписей для самостоятельных занятий уменьшали приливы сильнее, чем контрольная запись. Тексты курса — наши, по принципам этих работ.\n\nЗаписи загружаются по сети — нужен интернет.',uk:'Гіпнотична релаксація — це дихання, розслаблення тіла й образ прохолоди під голос. Стан схожий на глибокий відпочинок: ви все чуєте й будь-якої миті можете розплющити очі.\n\nЗвідки це: The Menopause Society (2023) рекомендує клінічний гіпноз при припливах — рівень доказів I. У рандомізованому дослідженні 2025 року (JAMA Network Open) 6 тижнів аудіозаписів для самостійних занять зменшували припливи сильніше, ніж контрольний запис. Тексти курсу — наші, за принципами цих робіт.\n\nЗаписи завантажуються мережею — потрібен інтернет.',en:'Hypnotic relaxation is breathing, body relaxation and an image of coolness guided by a voice. It feels like deep rest: you hear everything and can open your eyes at any moment.\n\nWhere this comes from: The Menopause Society (2023) recommends clinical hypnosis for hot flashes — evidence level I. In a 2025 randomised trial (JAMA Network Open), 6 weeks of self-guided audio reduced hot flashes more than a control recording. The course texts are our own, based on the principles of these studies.\n\nRecordings stream over the network — you need internet.',es:'La relajación hipnótica es respiración, relajación del cuerpo y una imagen de frescor guiadas por una voz. Se parece a un descanso profundo: lo oyes todo y puedes abrir los ojos en cualquier momento.\n\nDe dónde sale: The Menopause Society (2023) recomienda la hipnosis clínica para los sofocos, con nivel de evidencia I. En un ensayo aleatorizado de 2025 (JAMA Network Open), 6 semanas de audios para practicar por tu cuenta redujeron los sofocos más que una grabación de control. Los textos del curso son nuestros, basados en los principios de esos estudios.\n\nLas grabaciones se cargan por la red: necesitas internet.',de:'Hypnotische Entspannung bedeutet Atmung, Körperentspannung und ein Bild von Kühle, geführt von einer Stimme. Es fühlt sich an wie tiefe Ruhe: Sie hören alles und können jederzeit die Augen öffnen.\n\nWoher das kommt: The Menopause Society (2023) empfiehlt klinische Hypnose bei Hitzewallungen — Evidenzgrad I. In einer randomisierten Studie von 2025 (JAMA Network Open) verringerten 6 Wochen Audio zum Selbstüben die Hitzewallungen stärker als eine Kontrollaufnahme. Die Kurstexte sind unsere eigenen, nach den Prinzipien dieser Studien.\n\nDie Aufnahmen werden über das Netz geladen — Sie brauchen Internet.',pt:'O relaxamento hipnótico é respiração, relaxamento do corpo e uma imagem de frescor guiados por uma voz. Parece um descanso profundo: você ouve tudo e pode abrir os olhos a qualquer momento.\n\nDe onde vem: The Menopause Society (2023) recomenda a hipnose clínica para as ondas de calor — nível de evidência I. Num ensaio randomizado de 2025 (JAMA Network Open), 6 semanas de áudios para praticar sozinha reduziram as ondas de calor mais do que uma gravação de controle. Os textos do curso são nossos, com base nos princípios desses estudos.\n\nAs gravações carregam pela rede — é preciso internet.',fr:'La relaxation hypnotique, c’est la respiration, la détente du corps et une image de fraîcheur guidées par une voix. On dirait un repos profond : vous entendez tout et pouvez ouvrir les yeux à tout moment.\n\nD’où cela vient : The Menopause Society (2023) recommande l’hypnose clinique contre les bouffées de chaleur — niveau de preuve I. Dans un essai randomisé de 2025 (JAMA Network Open), 6 semaines d’audio en autonomie ont réduit les bouffées davantage qu’un enregistrement témoin. Les textes du cours sont les nôtres, d’après les principes de ces études.\n\nLes enregistrements se chargent par le réseau — il faut Internet.',pl:'Relaksacja hipnotyczna to oddech, rozluźnienie ciała i obraz chłodu prowadzone głosem. Przypomina głęboki odpoczynek: wszystko słyszysz i w każdej chwili możesz otworzyć oczy.\n\nSkąd to: The Menopause Society (2023) zaleca hipnozę kliniczną przy uderzeniach gorąca — poziom dowodów I. W randomizowanym badaniu z 2025 roku (JAMA Network Open) 6 tygodni nagrań do samodzielnej praktyki zmniejszało uderzenia gorąca bardziej niż nagranie kontrolne. Teksty kursu są nasze, oparte na zasadach tych prac.\n\nNagrania ładują się przez sieć — potrzebny jest internet.',it:'Il rilassamento ipnotico è respiro, rilassamento del corpo e un’immagine di fresco guidati da una voce. Somiglia a un riposo profondo: senti tutto e puoi aprire gli occhi in qualsiasi momento.\n\nDa dove viene: The Menopause Society (2023) raccomanda l’ipnosi clinica per le vampate — livello di evidenza I. In uno studio randomizzato del 2025 (JAMA Network Open), 6 settimane di audio da praticare da sola hanno ridotto le vampate più di una registrazione di controllo. I testi del corso sono nostri, basati sui principi di questi studi.\n\nLe registrazioni si caricano dalla rete — serve internet.',he:'הרפיה היפנוטית היא נשימה, הרפיית הגוף ודימוי של קרירות בהנחיית קול. זה מרגיש כמו מנוחה עמוקה: את שומעת הכול ויכולה לפקוח עיניים בכל רגע.\n\nמאין זה: The Menopause Society ‏(2023) ממליצה על היפנוזה קלינית לגלי חום — רמת ראיות I. במחקר אקראי מ־2025 ‏(JAMA Network Open), שישה שבועות של הקלטות לתרגול עצמי הפחיתו גלי חום יותר מהקלטת ביקורת. הטקסטים של הקורס הם שלנו, על פי העקרונות של המחקרים האלה.\n\nההקלטות נטענות מהרשת — צריך אינטרנט.',ja:'催眠リラクゼーションは、声に導かれる呼吸・体の弛緩・涼しさのイメージです。深い休息に近い状態で、すべて聞こえていて、いつでも目を開けられます。\n\n根拠：The Menopause Society（2023）は、ほてりに対する臨床催眠をエビデンスレベルIで推奨しています。2025年のランダム化試験（JAMA Network Open）では、6週間のセルフ音声が対照の録音よりもほてりを減らしました。コースの文章は、これらの研究の原則に基づく私たち独自のものです。\n\n録音はネットワークから読み込みます — インターネットが必要です。',ko:'최면 이완은 목소리의 안내에 따라 호흡하고, 몸을 이완하고, 시원함을 떠올리는 연습이에요. 깊은 휴식과 비슷해요. 모든 것이 들리고 언제든 눈을 뜰 수 있어요.\n\n근거: The Menopause Society(2023)는 열감에 임상 최면을 근거 수준 I로 권고해요. 2025년 무작위 연구(JAMA Network Open)에서 6주간의 자가 오디오가 대조 녹음보다 열감을 더 줄였어요. 코스 문장은 이 연구들의 원칙에 따라 저희가 직접 썼어요.\n\n녹음은 네트워크로 불러와요 — 인터넷이 필요해요.'},
    week: {ru:'Неделя {n} из 6',uk:'Тиждень {n} з 6',en:'Week {n} of 6',es:'Semana {n} de 6',de:'Woche {n} von 6',pt:'Semana {n} de 6',fr:'Semaine {n} sur 6',pl:'Tydzień {n} z 6',it:'Settimana {n} di 6',he:'שבוע {n} מתוך 6',ja:'6週中{n}週目',ko:'6주 중 {n}주차'},
    play: {ru:'Слушать сессию недели',uk:'Слухати сесію тижня',en:'Play this week’s session',es:'Escuchar la sesión de la semana',de:'Sitzung der Woche anhören',pt:'Ouvir a sessão da semana',fr:'Écouter la séance de la semaine',pl:'Posłuchaj sesji tygodnia',it:'Ascolta la sessione della settimana',he:'להאזין למפגש השבוע',ja:'今週のセッションを聴く',ko:'이번 주 세션 듣기'},
    all: {ru:'Все сессии',uk:'Усі сесії',en:'All sessions',es:'Todas las sesiones',de:'Alle Sitzungen',pt:'Todas as sessões',fr:'Toutes les séances',pl:'Wszystkie sesje',it:'Tutte le sessioni',he:'כל המפגשים',ja:'すべてのセッション',ko:'전체 세션'},
    sos: {ru:'Выручалка: начинается прилив (2–3 мин)',uk:'Рятівниця: починається приплив (2–3 хв)',en:'Quick help: a hot flash is starting (2–3 min)',es:'Audio de rescate: empieza un sofoco (2–3 min)',de:'Schnelle Hilfe: eine Hitzewallung beginnt (2–3 Min.)',pt:'Socorro rápido: começa uma onda de calor (2–3 min)',fr:'Aide rapide : une bouffée commence (2–3 min)',pl:'Szybka pomoc: zaczyna się uderzenie gorąca (2–3 min)',it:'Aiuto rapido: inizia una vampata (2–3 min)',he:'עזרה מהירה: מתחיל גל חום (2–3 דק׳)',ja:'お助け：ほてりが始まったら（2〜3分）',ko:'빠른 도움: 열감이 시작될 때 (2–3분)'},
    s6d: {ru:'днём',uk:'вдень',en:'daytime',es:'de día',de:'tagsüber',pt:'de dia',fr:'en journée',pl:'w dzień',it:'di giorno',he:'ביום',ja:'日中',ko:'낮'},
    s6n: {ru:'перед сном',uk:'перед сном',en:'before sleep',es:'antes de dormir',de:'vor dem Schlafen',pt:'antes de dormir',fr:'avant de dormir',pl:'przed snem',it:'prima di dormire',he:'לפני השינה',ja:'寝る前',ko:'잠들기 전'},
    n1: {ru:'Прохлада',uk:'Прохолода',en:'Coolness',es:'Frescor',de:'Kühle',pt:'Frescor',fr:'Fraîcheur',pl:'Chłód',it:'Fresco',he:'קרירות',ja:'涼しさ',ko:'시원함'},
    n2: {ru:'Ключ на выдохе',uk:'Ключ на видиху',en:'The key on the out-breath',es:'La llave en la espiración',de:'Der Schlüssel im Ausatmen',pt:'A chave na expiração',fr:'La clé sur l’expiration',pl:'Klucz na wydechu',it:'La chiave nell’espirazione',he:'המפתח בנשיפה',ja:'吐く息の鍵',ko:'날숨의 열쇠'},
    n3: {ru:'Ночь',uk:'Ніч',en:'Night',es:'La noche',de:'Die Nacht',pt:'A noite',fr:'La nuit',pl:'Noc',it:'La notte',he:'לילה',ja:'夜',ko:'밤'},
    n4: {ru:'Прохладная вода',uk:'Прохолодна вода',en:'Cool water',es:'Agua fresca',de:'Kühles Wasser',pt:'Água fresca',fr:'L’eau fraîche',pl:'Chłodna woda',it:'Acqua fresca',he:'מים קרירים',ja:'涼しい水',ko:'시원한 물'},
    n5: {ru:'Вы ведёте',uk:'Ви ведете',en:'You lead',es:'Tú decides',de:'Sie bestimmen',pt:'Você conduz',fr:'C’est vous qui menez',pl:'To ty prowadzisz',it:'Sei tu a guidare',he:'את מובילה',ja:'主導するのはあなた',ko:'이끄는 건 당신'},
    n6: {ru:'Сама',uk:'Сама',en:'On your own',es:'Tú sola',de:'Selbst',pt:'Sozinha',fr:'Seule',pl:'Sama',it:'Da sola',he:'לבד',ja:'ひとりで',ko:'스스로'},
    safe_t: {ru:'Перед первой сессией',uk:'Перед першою сесією',en:'Before your first session',es:'Antes de la primera sesión',de:'Vor der ersten Sitzung',pt:'Antes da primeira sessão',fr:'Avant la première séance',pl:'Przed pierwszą sesją',it:'Prima della prima sessione',he:'לפני המפגש הראשון',ja:'最初のセッションの前に',ko:'첫 세션 전에'},
    safe: {ru:'• Не слушайте за рулём, при работе с механизмами и в воде.\n• Если у вас психотическое или диссоциативное расстройство, тяжёлое ПТСР или эпилепсия — сначала посоветуйтесь с врачом.\n• Станет неприятно — просто откройте глаза: это сразу возвращает.\n• Практика дополняет лечение, но не заменяет его. Если приливы будят и мешают жить — обсудите это с врачом.',uk:'• Не слухайте за кермом, під час роботи з механізмами та у воді.\n• Якщо у вас психотичний чи дисоціативний розлад, важкий ПТСР або епілепсія — спершу порадьтеся з лікарем.\n• Стане неприємно — просто розплющте очі: це одразу повертає.\n• Практика доповнює лікування, але не замінює його. Якщо припливи будять і заважають жити — обговоріть це з лікарем.',en:'• Don’t listen while driving, operating machinery or in water.\n• If you have a psychotic or dissociative disorder, severe PTSD or epilepsy, talk to your doctor first.\n• If it becomes unpleasant, simply open your eyes — that brings you straight back.\n• The practice complements treatment but doesn’t replace it. If hot flashes wake you and disrupt your life, discuss it with your doctor.',es:'• No la escuches mientras conduces, manejas maquinaria o estás en el agua.\n• Si tienes un trastorno psicótico o disociativo, TEPT grave o epilepsia, consulta antes con tu médico.\n• Si te resulta desagradable, simplemente abre los ojos: eso te devuelve al momento.\n• La práctica complementa el tratamiento, pero no lo sustituye. Si los sofocos te despiertan y te complican la vida, coméntalo con tu médico.',de:'• Nicht beim Autofahren, beim Bedienen von Maschinen oder im Wasser anhören.\n• Bei einer psychotischen oder dissoziativen Störung, schwerer PTBS oder Epilepsie zuerst ärztlich beraten lassen.\n• Wird es unangenehm, öffnen Sie einfach die Augen — das holt Sie sofort zurück.\n• Die Praxis ergänzt eine Behandlung, ersetzt sie aber nicht. Wenn Hitzewallungen Sie wecken und den Alltag stören, sprechen Sie mit Ihrer Ärztin oder Ihrem Arzt.',pt:'• Não ouça ao volante, operando máquinas ou dentro da água.\n• Se você tem transtorno psicótico ou dissociativo, TEPT grave ou epilepsia, converse antes com seu médico.\n• Se ficar desagradável, basta abrir os olhos — isso traz você de volta na hora.\n• A prática complementa o tratamento, mas não o substitui. Se as ondas de calor acordam você e atrapalham sua vida, fale com seu médico.',fr:'• N’écoutez pas en conduisant, en utilisant une machine ni dans l’eau.\n• En cas de trouble psychotique ou dissociatif, de TSPT sévère ou d’épilepsie, parlez-en d’abord à votre médecin.\n• Si cela devient désagréable, ouvrez simplement les yeux : cela vous ramène aussitôt.\n• La pratique complète un traitement, sans le remplacer. Si les bouffées vous réveillent et vous gênent au quotidien, parlez-en à votre médecin.',pl:'• Nie słuchaj podczas jazdy, obsługi maszyn ani w wodzie.\n• Jeśli masz zaburzenie psychotyczne lub dysocjacyjne, ciężkie PTSD albo padaczkę — najpierw porozmawiaj z lekarzem.\n• Gdy zrobi się nieprzyjemnie, po prostu otwórz oczy — to od razu przywraca.\n• Praktyka uzupełnia leczenie, ale go nie zastępuje. Jeśli uderzenia gorąca budzą cię i utrudniają życie — omów to z lekarzem.',it:'• Non ascoltare alla guida, usando macchinari o in acqua.\n• Se hai un disturbo psicotico o dissociativo, un PTSD grave o l’epilessia, parlane prima con il medico.\n• Se diventa spiacevole, apri semplicemente gli occhi: ti riporta subito qui.\n• La pratica affianca le cure, ma non le sostituisce. Se le vampate ti svegliano e ti pesano nella vita, parlane con il medico.',he:'• לא להאזין בזמן נהיגה, הפעלת מכונות או במים.\n• אם יש לך הפרעה פסיכוטית או דיסוציאטיבית, PTSD חמור או אפילפסיה — קודם התייעצי עם רופא/ה.\n• אם נעשה לא נעים — פשוט פקחי עיניים: זה מחזיר מיד.\n• התרגול משלים טיפול, אך לא מחליף אותו. אם גלי החום מעירים אותך ומפריעים לחיים — שוחחי על כך עם רופא/ה.',ja:'• 運転中、機械の操作中、水中では聴かないでください。\n• 精神病性障害・解離性障害、重いPTSD、てんかんがある場合は、先に医師に相談してください。\n• 不快に感じたら、目を開けるだけですぐに戻れます。\n• このプラクティスは治療を補うもので、代わりにはなりません。ほてりで目が覚め生活に支障がある場合は、医師に相談してください。',ko:'• 운전 중, 기계 작업 중, 물속에서는 듣지 마세요.\n• 정신병적·해리성 장애, 심한 PTSD, 뇌전증이 있다면 먼저 의사와 상담하세요.\n• 불편해지면 눈을 뜨기만 하면 바로 돌아와요.\n• 이 연습은 치료를 보완할 뿐 대신하지 않아요. 열감 때문에 잠에서 깨고 생활이 힘들다면 의사와 상의하세요.'},
    safe_ok: {ru:'Понятно, начать',uk:'Зрозуміло, почати',en:'Got it, start',es:'Entendido, empezar',de:'Verstanden, starten',pt:'Entendi, começar',fr:'Compris, commencer',pl:'Rozumiem, zaczynam',it:'Ho capito, inizia',he:'הבנתי, להתחיל',ja:'わかりました、始める',ko:'알겠어요, 시작'},
    loading: {ru:'Загружаю запись…',uk:'Завантажую запис…',en:'Loading the recording…',es:'Cargando la grabación…',de:'Aufnahme wird geladen…',pt:'Carregando a gravação…',fr:'Chargement de l’enregistrement…',pl:'Ładuję nagranie…',it:'Carico la registrazione…',he:'טוענת את ההקלטה…',ja:'録音を読み込んでいます…',ko:'녹음을 불러오는 중…'},
    err: {ru:'Запись не загрузилась. Нужен интернет — попробуйте ещё раз.',uk:'Запис не завантажився. Потрібен інтернет — спробуйте ще раз.',en:'The recording didn’t load. You need internet — please try again.',es:'La grabación no se ha cargado. Necesitas internet; inténtalo de nuevo.',de:'Die Aufnahme wurde nicht geladen. Sie brauchen Internet — bitte erneut versuchen.',pt:'A gravação não carregou. É preciso internet — tente de novo.',fr:'L’enregistrement ne s’est pas chargé. Il faut Internet — réessayez.',pl:'Nagranie się nie załadowało. Potrzebny internet — spróbuj ponownie.',it:'La registrazione non si è caricata. Serve internet — riprova.',he:'ההקלטה לא נטענה. צריך אינטרנט — נסי שוב.',ja:'録音を読み込めませんでした。インターネットに接続して、もう一度お試しください。',ko:'녹음을 불러오지 못했어요. 인터넷이 필요해요 — 다시 시도해 주세요.'},
    done: {ru:'Сессия закончилась. Спасибо, что нашли это время для себя.',uk:'Сесія завершилася. Дякуємо, що знайшли цей час для себе.',en:'The session is over. Thank you for making this time for yourself.',es:'La sesión ha terminado. Gracias por dedicarte este tiempo.',de:'Die Sitzung ist zu Ende. Danke, dass Sie sich diese Zeit genommen haben.',pt:'A sessão terminou. Obrigada por reservar este tempo para você.',fr:'La séance est terminée. Merci d’avoir pris ce temps pour vous.',pl:'Sesja się skończyła. Dziękujemy, że znalazłaś ten czas dla siebie.',it:'La sessione è finita. Grazie di esserti presa questo tempo.',he:'המפגש הסתיים. תודה שמצאת את הזמן הזה לעצמך.',ja:'セッションが終わりました。自分のための時間をとってくれてありがとう。',ko:'세션이 끝났어요. 자신을 위해 시간을 내 주셔서 고마워요.'}
  };
  function name(k) { var n = String(k).charAt(0); return t('n' + n) + (k === '6d' ? ' · ' + t('s6d') : k === '6n' ? ' · ' + t('s6n') : ''); }

  // ── карточка ──
  var infoOpen = false, listOpen = false;
  function card() {
    var box = $('rdHypno'); if (!box) return;
    if (!avail()) { box.innerHTML = ''; return; }
    var w = week(), m = mel();
    var mp = [['music', 'n_music'], ['soft', 'n_soft'], ['none', 'n_none']].map(function (x) {
      return '<button type="button" class="sl-pill' + (m === x[0] ? ' on' : '') + '" onclick="vialHypno.mel(\'' + x[0] + '\')">' + esc(sl(x[1])) + '</button>'; }).join('');
    var list = !listOpen ? '' : '<div class="sl-read">' + [1, 2, 3, 4, 5, '6d', '6n'].map(function (k) {
      var n = String(k).charAt(0);
      return '<button type="button" class="sl-rd' + (+n === w ? ' hy-cur' : '') + '" onclick="vialHypno.play(\'' + k + '\')"><span>' + n + '. ' + esc(name(k)) + '</span><span class="sl-chev">▶</span></button>'; }).join('') + '</div>';
    box.innerHTML = '<div class="sl-card"><div class="sl-h"><button type="button" class="help-btn-inline" aria-label="info" onclick="vialHypno.info()">ℹ</button>❄️ ' + esc(t('card_t')) + '</div>'
      + '<div class="sl-tx">' + esc(t('sub')) + '</div>'
      + '<div id="hy-info" class="sl-note"' + (infoOpen ? '' : ' hidden') + '>' + esc(t('info')) + '</div>'
      + '<div class="sl-lbl">' + esc(t('week').replace('{n}', w)) + ' · ' + esc(name(key6(w))) + '</div>'
      + '<button type="button" class="sl-btn sl-main" onclick="vialHypno.play(\'' + key6(w) + '\')">▶ ' + esc(t('play')) + '</button>'
      + '<button type="button" class="sl-btn" onclick="vialHypno.play(\'sos\')">❄️ ' + esc(t('sos')).replace(/\(([^)]*)\)/, '<span style="white-space:nowrap">$&</span>') + '</button>'
      + '<div class="sl-lbl">' + esc(sl('noise')) + '</div><div class="sl-pills">' + mp + '</div>'
      + '<button type="button" class="sl-off" onclick="vialHypno.list()">' + esc(t('all')) + (listOpen ? ' ▴' : ' ▾') + '</button>' + list
      + '</div>';
  }

  // ── экран-плеер (общий #sl-ov из sleep.js) ──
  var voice = null, music = null, run = 0, endT = null;
  function ov(html) {
    var o = $('sl-ov'); if (!o) { o = document.createElement('div'); o.id = 'sl-ov'; document.body.appendChild(o); }
    o.innerHTML = '<div class="sl-ov-in">' + html + '</div>'; o.style.display = 'flex'; return o;
  }
  function play(k) {
    if (!FILES[k]) return;
    if (!get().ok) return safety(k);
    stop(); var my = ++run;
    var s = get(); if (!s.start && k !== 'sos') s.start = Date.now();
    s.log = (s.log || []).concat([{ d: dayKey(), k: String(k) }]).slice(-90); put(s);
    ov('<div class="sl-ov-t">' + esc(k === 'sos' ? t('sos') : name(k)) + '</div>'
      + '<div class="sl-circle hy-breath"></div><div class="sl-ov-tx" id="hy-tx">' + esc(t('loading')) + '</div>'
      + '<div class="sl-ov-keep">' + esc(sl('keep')) + '</div>'
      + '<button type="button" class="sl-btn" onclick="vialHypno.stop()">' + esc(sl('stop')) + '</button>');
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    awake(true);
    voice = new Audio(BASE + L() + '/' + FILES[k] + '.m4a'); voice.setAttribute('playsinline', ''); voice.preload = 'auto';
    voice.addEventListener('playing', function () { if (my === run) tx(''); });
    voice.addEventListener('timeupdate', function () { if (my === run && voice && voice.duration) tx(clock(voice.duration - voice.currentTime)); });
    voice.addEventListener('error', function () { if (my === run) { tx(t('err')); musicOff(); awake(false); } });
    voice.addEventListener('ended', function () {
      if (my !== run) return;
      tx(t('done')); awake(false);
      endT = setTimeout(function () { if (my === run) musicOff(); }, NIGHT[k] ? 120000 : 4000);
    });
    var pr = voice.play(); if (pr && pr.catch) pr.catch(function () { if (my === run) tx(t('err')); });
    musicOn(my);
  }
  // Фон под голосом (2026-11-26, выбор владельца): записанный трек Pixabay 195425 (docs/SLEEP-MUSIC-SOURCES.md), громкость
  // зашита в файл (−30 LUFS, «Тише» −36; голос −16). Нет сети / файла → мелодия, собранная на телефоне.
  var HYP_MUS = 'https://pub-2f2f1a44a98c46beabafa751ba849852.r2.dev/hypnosis/music/195425';
  function musicOn(my) {
    var m = mel(); if (m === 'none') return;
    try {
      var a = new Audio(HYP_MUS + (m === 'soft' ? '-soft' : '') + '.m4a'); a.loop = true; a.setAttribute('playsinline', ''); music = a;
      a.addEventListener('error', function () { if (music === a && my === run) { music = null; synthOn(my); } });
      var p = a.play(); if (p && p.catch) p.catch(function () {});
    } catch (e) { synthOn(my); }
  }
  function synthOn(my) {
    var m = mel(); if (m === 'none' || !window.vialSleep || !vialSleep._music) return;
    var seed = parseInt(String(dayKey()).replace(/\D/g, ''), 10) || 1;
    vialSleep._music(seed, m === 'soft' ? 0.25 : 0.5).then(function (u) {   // под голосом тише, чем в ритуале сна
      if (!u || my !== run) return;
      try { music = new Audio(u); music.loop = true; music.setAttribute('playsinline', ''); music.volume = 0.3; var p = music.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    });
  }
  function musicOff() { try { if (music) music.pause(); } catch (e) {} music = null; }
  function tx(s) { var e = $('hy-tx'); if (e) e.textContent = s; }
  function clock(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2); }
  function stop() {
    run++; clearTimeout(endT);
    try { if (voice) { voice.pause(); voice.removeAttribute('src'); voice.load(); } } catch (e) {}
    voice = null; musicOff(); awake(false);
    var o = $('sl-ov'); if (o) o.style.display = 'none';
  }
  function safety(k) {
    ov('<div class="sl-ov-t">' + esc(t('safe_t')) + '</div>'
      + '<div class="sl-ov-tx hy-safe">' + esc(t('safe')) + '</div>'
      + '<button type="button" class="sl-btn sl-main" onclick="vialHypno.agree(\'' + k + '\')">' + esc(t('safe_ok')) + '</button>'
      + '<button type="button" class="sl-off" onclick="vialHypno.stop()">' + esc(sl('close')) + '</button>');
  }
  // экран не гаснет (как в sleep.js): плагин KeepAwake → Wake Lock API
  var lock = null;
  function awake(on) {
    var ka = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.KeepAwake;
    if (ka) { try { var p = on ? ka.keepAwake && ka.keepAwake() : ka.allowSleep && ka.allowSleep(); if (p && p.catch) p.catch(function () {}); } catch (e) {} return; }
    try {
      if (on && navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request('screen').then(function (l) { lock = l; }).catch(function () {});
      if (!on && lock) { lock.release(); lock = null; }
    } catch (e) {}
  }

  var css = document.createElement('style');
  css.textContent = '#rdHypno:empty{display:none;}#rdHypno{margin-bottom:12px;}'
    + '.sl-rd.hy-cur{border-color:var(--gold-lt);}'
    + '.hy-safe{text-align:start;white-space:pre-wrap;color:rgba(255,255,255,.75);min-height:0;margin-bottom:8px;}'
    + '@keyframes hyBreath{0%,100%{transform:scale(1);}40%{transform:scale(1.25);}}'
    + '.hy-breath{animation:hyBreath 10s ease-in-out infinite;}';
  document.head.appendChild(css);

  window.vialHypno = {
    card: card, play: function (k) { play(/^\d$/.test(k) ? +k : k); }, stop: stop,
    agree: function (k) { var s = get(); s.ok = true; put(s); play(/^\d$/.test(k) ? +k : k); },
    mel: function (m) { var s = get(); s.mel = m; put(s); card(); },
    info: function () { infoOpen = !infoOpen; var e = $('hy-info'); if (e) e.hidden = !infoOpen; },
    list: function () { listOpen = !listOpen; card(); },
    langs: LANGS
  };
  card();
})();
