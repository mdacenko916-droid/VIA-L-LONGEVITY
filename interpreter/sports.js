/* «Мой спорт» + проверка перед тренировкой + сверка прибора и самочувствия (VIA-L, 2026-10-11).
   Владелец: человек играет в падел / ездит на велосипеде — мы это учитываем; утром выбрали силовую, а днём
   был футбол — перед стартом спрашиваем и меняем; кольцо говорит «отдых», а самочувствие хорошее — говорим
   про оба источника и даём вариант, а не спорим, кто прав. Правила — docs/FITNESS-SELECTION-RULES.md §15.
   Хранение (только на устройстве): vialp_sports [{id, days:[1..7], full}], vialp_wo_now {day, did, sid, ate},
   vialp_sport_skip "день". Выбор тренировки — vialWorkouts.pick (ctx.sportToday / ctx.now0). */
(function () {
  'use strict';
  var LG = ['ru', 'uk', 'en', 'es', 'de', 'pt', 'fr', 'pl', 'it', 'he', 'ja', 'ko'];
  // id, группа, иконка Phosphor, категория нагрузки для выбора тренировки (как в истории wo_logic),
  // названия ×12 (порядок LG). Категория: hiit — рывки, прыжки, смена направления (ноги + сердце);
  // cardio — ровная выносливость; full/upper/legs — силовая нагрузка; mind/pil — спокойные; other — лёгкая.
  var S = [
    ['padel', 'rk', 'tennis-ball', 'hiit', 'Падел|Падел|Padel|Pádel|Padel|Padel|Padel|Padel|Padel|פאדל|パデル|파델'],
    ['tennis', 'rk', 'tennis-ball', 'hiit', 'Теннис|Теніс|Tennis|Tenis|Tennis|Tênis|Tennis|Tenis|Tennis|טניס|テニス|테니스'],
    ['badminton', 'rk', 'tennis-ball', 'hiit', 'Бадминтон|Бадмінтон|Badminton|Bádminton|Badminton|Badminton|Badminton|Badminton|Badminton|בדמינטון|バドミントン|배드민턴'],
    ['tabletennis', 'rk', 'ping-pong', 'other', 'Настольный теннис|Настільний теніс|Table tennis|Tenis de mesa|Tischtennis|Tênis de mesa|Tennis de table|Tenis stołowy|Ping pong|טניס שולחן|卓球|탁구'],
    ['squash', 'rk', 'tennis-ball', 'hiit', 'Сквош|Сквош|Squash|Squash|Squash|Squash|Squash|Squash|Squash|סקווש|スカッシュ|스쿼시'],
    ['pickleball', 'rk', 'ping-pong', 'cardio', 'Пиклбол|Піклбол|Pickleball|Pickleball|Pickleball|Pickleball|Pickleball|Pickleball|Pickleball|פיקלבול|ピックルボール|피클볼'],
    ['football', 'bl', 'soccer-ball', 'hiit', 'Футбол|Футбол|Football (soccer)|Fútbol|Fußball|Futebol|Football|Piłka nożna|Calcio|כדורגל|サッカー|축구'],
    ['basketball', 'bl', 'basketball', 'hiit', 'Баскетбол|Баскетбол|Basketball|Baloncesto|Basketball|Basquete|Basket-ball|Koszykówka|Pallacanestro|כדורסל|バスケットボール|농구'],
    ['volleyball', 'bl', 'volleyball', 'hiit', 'Волейбол|Волейбол|Volleyball|Voleibol|Volleyball|Vôlei|Volley-ball|Siatkówka|Pallavolo|כדורעף|バレーボール|배구'],
    ['beachvolley', 'bl', 'volleyball', 'hiit', 'Пляжный волейбол|Пляжний волейбол|Beach volleyball|Vóley playa|Beachvolleyball|Vôlei de praia|Beach-volley|Siatkówka plażowa|Beach volley|כדורעף חופים|ビーチバレー|비치발리볼'],
    ['handball', 'bl', 'basketball', 'hiit', 'Гандбол|Гандбол|Handball|Balonmano|Handball|Handebol|Handball|Piłka ręczna|Pallamano|כדוריד|ハンドボール|핸드볼'],
    ['hockey', 'bl', 'hockey', 'hiit', 'Хоккей|Хокей|Hockey|Hockey|Hockey|Hóquei|Hockey|Hokej|Hockey|הוקי|ホッケー|하키'],
    ['running', 'en', 'person-simple-run', 'cardio', 'Бег|Біг|Running|Correr|Laufen|Corrida|Course à pied|Bieganie|Corsa|ריצה|ランニング|달리기'],
    ['cycling', 'en', 'person-simple-bike', 'cardio', 'Велосипед|Велосипед|Cycling|Ciclismo|Radfahren|Ciclismo|Vélo|Rower|Ciclismo|רכיבה על אופניים|サイクリング|자전거'],
    ['indoorbike', 'en', 'bicycle', 'cardio', 'Велотренажёр|Велотренажер|Indoor cycling|Bici estática|Indoor-Cycling|Bicicleta ergométrica|Vélo d’intérieur|Rower stacjonarny|Cyclette|אופני כושר|エアロバイク|실내 자전거'],
    ['swimming', 'en', 'person-simple-swim', 'cardio', 'Плавание|Плавання|Swimming|Natación|Schwimmen|Natação|Natation|Pływanie|Nuoto|שחייה|水泳|수영'],
    ['rowing', 'en', 'boat', 'cardio', 'Гребля|Веслування|Rowing|Remo|Rudern|Remo|Aviron|Wioślarstwo|Canottaggio|חתירה|ローイング|조정'],
    ['xcski', 'en', 'person-simple-ski', 'cardio', 'Беговые лыжи|Бігові лижі|Cross-country skiing|Esquí de fondo|Skilanglauf|Esqui cross-country|Ski de fond|Narciarstwo biegowe|Sci di fondo|סקי שטח|クロスカントリースキー|크로스컨트리 스키'],
    ['nordicwalk', 'en', 'person-simple-walk', 'other', 'Скандинавская ходьба|Скандинавська ходьба|Nordic walking|Marcha nórdica|Nordic Walking|Caminhada nórdica|Marche nordique|Nordic walking|Nordic walking|הליכה נורדית|ノルディックウォーキング|노르딕 워킹'],
    ['hiking', 'en', 'person-simple-hike', 'cardio', 'Поход|Похід|Hiking|Senderismo|Wandern|Trilha|Randonnée|Wędrówki|Escursionismo|טיול רגלי|ハイキング|하이킹'],
    ['elliptical', 'en', 'sneaker-move', 'cardio', 'Эллипс|Еліпс|Elliptical|Elíptica|Crosstrainer|Elíptico|Vélo elliptique|Orbitrek|Ellittica|אליפטי|クロストレーナー|일립티컬'],
    ['stairs', 'en', 'sneaker-move', 'cardio', 'Лестница|Сходи|Stair climbing|Subir escaleras|Treppensteigen|Subir escadas|Montée d’escaliers|Wchodzenie po schodach|Salire le scale|עליית מדרגות|階段のぼり|계단 오르기'],
    ['skiing', 'mw', 'person-simple-ski', 'hiit', 'Горные лыжи|Гірські лижі|Downhill skiing|Esquí alpino|Ski alpin|Esqui alpino|Ski alpin|Narciarstwo zjazdowe|Sci alpino|סקי|スキー|스키'],
    ['snowboard', 'mw', 'person-simple-snowboard', 'hiit', 'Сноуборд|Сноуборд|Snowboarding|Snowboard|Snowboarden|Snowboard|Snowboard|Snowboard|Snowboard|סנובורד|スノーボード|스노보드'],
    ['surfing', 'mw', 'waves', 'full', 'Сёрфинг|Серфінг|Surfing|Surf|Surfen|Surfe|Surf|Surfing|Surf|גלישת גלים|サーフィン|서핑'],
    ['sup', 'mw', 'waves', 'other', 'SUP|SUP|Stand-up paddle|Pádel surf|Stand-up-Paddling|Stand up paddle|Stand up paddle|SUP|SUP|סאפ|SUP|SUP'],
    ['kayak', 'mw', 'boat', 'upper', 'Каяк|Каяк|Kayaking|Kayak|Kajak|Caiaque|Kayak|Kajak|Kayak|קיאק|カヤック|카약'],
    ['climbing', 'mw', 'mountains', 'full', 'Скалолазание|Скелелазіння|Climbing|Escalada|Klettern|Escalada|Escalade|Wspinaczka|Arrampicata|טיפוס|クライミング|클라이밍'],
    ['boxing', 'cb', 'boxing-glove', 'hiit', 'Бокс|Бокс|Boxing|Boxeo|Boxen|Boxe|Boxe|Boks|Pugilato|אגרוף|ボクシング|복싱'],
    ['kickboxing', 'cb', 'boxing-glove', 'hiit', 'Кикбоксинг|Кікбоксинг|Kickboxing|Kickboxing|Kickboxen|Kickboxing|Kick-boxing|Kickboxing|Kickboxing|קיקבוקס|キックボクシング|킥복싱'],
    ['martial', 'cb', 'person-simple-throw', 'full', 'Дзюдо, карате|Дзюдо, карате|Martial arts|Artes marciales|Kampfsport|Artes marciais|Arts martiaux|Sztuki walki|Arti marziali|אומנויות לחימה|武道|무술'],
    ['fencing', 'cb', 'person-simple-throw', 'hiit', 'Фехтование|Фехтування|Fencing|Esgrima|Fechten|Esgrima|Escrime|Szermierka|Scherma|סייף|フェンシング|펜싱'],
    ['golf', 'cm', 'golf', 'other', 'Гольф|Гольф|Golf|Golf|Golf|Golfe|Golf|Golf|Golf|גולף|ゴルフ|골프'],
    ['horse', 'cm', 'horse', 'other', 'Конный спорт|Кінний спорт|Horse riding|Equitación|Reiten|Equitação|Équitation|Jeździectwo|Equitazione|רכיבה על סוסים|乗馬|승마'],
    ['bowling', 'cm', 'bowling-ball', 'other', 'Боулинг|Боулінг|Bowling|Bolos|Bowling|Boliche|Bowling|Kręgle|Bowling|באולינג|ボウリング|볼링'],
    ['garden', 'cm', 'plant', 'other', 'Работа в саду|Робота в саду|Gardening|Jardinería|Gartenarbeit|Jardinagem|Jardinage|Ogrodnictwo|Giardinaggio|גינון|ガーデニング|정원 가꾸기'],
    ['dance', 'db', 'music-notes', 'cardio', 'Танцы|Танці|Dance|Baile|Tanzen|Dança|Danse|Taniec|Danza|ריקוד|ダンス|댄스'],
    ['zumba', 'db', 'music-notes', 'cardio', 'Зумба|Зумба|Zumba|Zumba|Zumba|Zumba|Zumba|Zumba|Zumba|זומבה|ズンバ|줌바'],
    ['barre', 'db', 'person-simple-tai-chi', 'legs', 'Барре|Барре|Barre|Barre|Barre|Barre|Barre|Barre|Barre|בארה|バレエエクササイズ|바레'],
    ['yoga', 'db', 'flower-lotus', 'mind', 'Йога|Йога|Yoga|Yoga|Yoga|Ioga|Yoga|Joga|Yoga|יוגה|ヨガ|요가'],
    ['pilates', 'db', 'person-simple-tai-chi', 'pil', 'Пилатес|Пілатес|Pilates|Pilates|Pilates|Pilates|Pilates|Pilates|Pilates|פילאטיס|ピラティス|필라테스'],
    ['taichi', 'db', 'person-simple-tai-chi', 'mind', 'Тайцзи|Тайцзі|Tai chi|Tai chi|Tai-Chi|Tai chi|Tai-chi|Tai chi|Tai chi|טאי צ׳י|太極拳|태극권'],
    ['gym', 'db', 'barbell', 'full', 'Тренажёрный зал|Тренажерна зала|Gym|Gimnasio|Fitnessstudio|Academia|Salle de sport|Siłownia|Palestra|חדר כושר|ジム|헬스'],
    ['crossfit', 'db', 'barbell', 'hiit', 'Кроссфит|Кросфіт|CrossFit|CrossFit|CrossFit|CrossFit|CrossFit|CrossFit|CrossFit|קרוספיט|クロスフィット|크로스핏']
  ];
  var POP = ['padel', 'cycling', 'swimming', 'running', 'football', 'golf', 'hiking', 'dance'];
  var GRP = { rk: 'tennis-ball', bl: 'volleyball', en: 'bicycle', mw: 'mountains', cb: 'boxing-glove', cm: 'golf', db: 'music-notes' };
  var BY = {}; S.forEach(function (s) { BY[s[0]] = s; });

  function row(s) { var a = s.split('|'), o = {}; LG.forEach(function (l, i) { o[l] = a[i]; }); return o; }
  var T = {
    title: row('Мой спорт|Мій спорт|My sports|Mi deporte|Mein Sport|Meu esporte|Mon sport|Mój sport|Il mio sport|הספורט שלי|私のスポーツ|나의 스포츠'),
    intro: row('Чем вы занимаетесь кроме наших тренировок? Учтём это в плане дня — чтобы не перегрузить.|Чим ви займаєтеся окрім наших тренувань? Урахуємо це в плані дня — щоб не перевантажити.|What do you do besides our workouts? We’ll take it into account in your day plan so you don’t overdo it.|¿Qué haces además de nuestros entrenamientos? Lo tendremos en cuenta en tu plan del día para no sobrecargarte.|Was machst du außer unseren Trainings? Wir berücksichtigen es im Tagesplan, damit es nicht zu viel wird.|O que você pratica além dos nossos treinos? Vamos considerar isso no plano do dia para não sobrecarregar.|Que pratiquez-vous en plus de nos séances ? Nous en tiendrons compte dans le plan du jour pour éviter la surcharge.|Co robisz poza naszymi treningami? Uwzględnimy to w planie dnia, żeby cię nie przeciążyć.|Cosa fai oltre ai nostri allenamenti? Lo terremo presente nel piano del giorno per non sovraccaricarti.|במה אתם עוסקים מלבד האימונים שלנו? נתחשב בזה בתוכנית היום כדי לא להעמיס.|私たちのトレーニング以外に何をしていますか？無理のないよう、1日のプランに反映します。|저희 운동 외에 어떤 운동을 하시나요? 무리하지 않도록 하루 계획에 반영할게요.'),
    add: row('Добавить вид спорта|Додати вид спорту|Add a sport|Añadir deporte|Sport hinzufügen|Adicionar esporte|Ajouter un sport|Dodaj sport|Aggiungi sport|הוספת ענף ספורט|スポーツを追加|스포츠 추가'),
    none: row('Пока ничего не выбрано.|Поки нічого не вибрано.|Nothing selected yet.|Aún no has elegido nada.|Noch nichts ausgewählt.|Nada escolhido ainda.|Rien de choisi pour l’instant.|Na razie nic nie wybrano.|Ancora niente di selezionato.|עדיין לא נבחר דבר.|まだ選択されていません。|아직 선택한 것이 없어요.'),
    search: row('Найти: падел, йога, лыжи…|Знайти: падел, йога, лижі…|Search: padel, yoga, skiing…|Buscar: pádel, yoga, esquí…|Suchen: Padel, Yoga, Ski…|Buscar: padel, ioga, esqui…|Rechercher : padel, yoga, ski…|Szukaj: padel, joga, narty…|Cerca: padel, yoga, sci…|חיפוש: פאדל, יוגה, סקי…|検索：パデル、ヨガ、スキー…|검색: 파델, 요가, 스키…'),
    pop: row('Чаще всего|Найчастіше|Most popular|Los más habituales|Am häufigsten|Mais comuns|Les plus courants|Najczęściej|I più comuni|הנפוצים ביותר|よく選ばれる|많이 선택'),
    all: row('Все виды|Усі види|All sports|Todos|Alle Sportarten|Todos|Tous les sports|Wszystkie|Tutti|כל הענפים|すべて|전체'),
    rk: row('Ракетка|Ракетка|Racket sports|Raqueta|Rückschlagsport|Raquete|Raquette|Rakieta|Racchetta|מחבט|ラケット|라켓'),
    bl: row('Игры с мячом|Ігри з м’ячем|Ball games|Deportes de pelota|Ballsport|Esportes com bola|Sports de balle|Gry z piłką|Sport con la palla|משחקי כדור|球技|구기'),
    en: row('Выносливость|Витривалість|Endurance|Resistencia|Ausdauer|Resistência|Endurance|Wytrzymałość|Resistenza|סיבולת|持久系|지구력'),
    mw: row('Горы и вода|Гори й вода|Mountains and water|Montaña y agua|Berg und Wasser|Montanha e água|Montagne et eau|Góry i woda|Montagna e acqua|הרים ומים|山と水|산과 물'),
    cb: row('Единоборства|Єдиноборства|Combat sports|Deportes de combate|Kampfsport|Lutas|Sports de combat|Sporty walki|Sport da combattimento|אומנויות לחימה|格闘技|격투기'),
    cm: row('Спокойные|Спокійні|Gentle|Tranquilos|Ruhig|Tranquilos|Doux|Spokojne|Tranquilli|רגועים|穏やか|가벼운'),
    db: row('Танцы и тело|Танці й тіло|Dance and body|Baile y cuerpo|Tanz und Körper|Dança e corpo|Danse et corps|Taniec i ciało|Danza e corpo|ריקוד וגוף|ダンスとボディ|댄스와 바디'),
    days: row('Обычные дни|Звичайні дні|Usual days|Días habituales|Übliche Tage|Dias habituais|Jours habituels|Zwykłe dni|Giorni abituali|ימים קבועים|いつもの曜日|평소 요일'),
    easy: row('Спокойно|Спокійно|Easy pace|Tranquilo|Locker|Tranquilo|Tranquille|Spokojnie|Tranquillo|בקצב רגוע|ゆったり|가볍게'),
    full: row('В полную силу|На повну силу|Full effort|A tope|Mit voller Kraft|Com força total|À fond|Na całego|Al massimo|במאמץ מלא|全力で|전력으로'),
    remove: row('Убрать|Прибрати|Remove|Quitar|Entfernen|Remover|Retirer|Usuń|Rimuovi|הסרה|削除|삭제'),
    wd: row('Пн,Вт,Ср,Чт,Пт,Сб,Вс|Пн,Вт,Ср,Чт,Пт,Сб,Нд|Mo,Tu,We,Th,Fr,Sa,Su|Lu,Ma,Mi,Ju,Vi,Sá,Do|Mo,Di,Mi,Do,Fr,Sa,So|Seg,Ter,Qua,Qui,Sex,Sáb,Dom|Lu,Ma,Me,Je,Ve,Sa,Di|Pn,Wt,Śr,Cz,Pt,So,Nd|Lu,Ma,Me,Gi,Ve,Sa,Do|ב׳,ג׳,ד׳,ה׳,ו׳,ש׳,א׳|月,火,水,木,金,土,日|월,화,수,목,금,토,일'),
    // проверка перед стартом
    q1: row('Что уже было сегодня?|Що вже було сьогодні?|What have you done today?|¿Qué has hecho hoy?|Was hast du heute schon gemacht?|O que você já fez hoje?|Qu’avez-vous déjà fait aujourd’hui ?|Co już dziś było?|Cosa hai già fatto oggi?|מה כבר היה היום?|今日はもう何をしましたか？|오늘 이미 무엇을 했나요?'),
    d_none: row('Ничего|Нічого|Nothing yet|Nada|Noch nichts|Nada|Rien|Nic|Niente|כלום|まだ何も|아직 없음'),
    d_walk: row('Прогулка|Прогулянка|A walk|Un paseo|Spaziergang|Caminhada|Une marche|Spacer|Una passeggiata|הליכה|散歩|산책'),
    d_sport: row('Спорт / тренировка|Спорт / тренування|Sport / workout|Deporte / entreno|Sport / Training|Esporte / treino|Sport / séance|Sport / trening|Sport / allenamento|ספורט / אימון|スポーツ・運動|스포츠 / 운동'),
    which: row('Что именно?|Що саме?|Which one?|¿Cuál?|Was genau?|Qual?|Lequel ?|Co dokładnie?|Quale?|מה בדיוק?|どれですか？|어떤 운동인가요?'),
    q2: row('Когда ели?|Коли їли?|When did you last eat?|¿Cuándo comiste?|Wann hast du gegessen?|Quando comeu?|Quand avez-vous mangé ?|Kiedy jadłaś/eś?|Quando hai mangiato?|מתי אכלתם?|最後に食べたのは？|마지막 식사는 언제였나요?'),
    a_lt1: row('Меньше часа|Менше години|Under an hour ago|Hace menos de una hora|Vor weniger als 1 Std.|Há menos de 1 hora|Il y a moins d’une heure|Mniej niż godzinę temu|Meno di un’ora fa|לפני פחות משעה|1時間以内|1시간 이내'),
    a_12: row('1–2 часа|1–2 години|1–2 hours ago|Hace 1–2 horas|Vor 1–2 Std.|Há 1–2 horas|Il y a 1–2 h|1–2 godziny temu|1–2 ore fa|לפני 1–2 שעות|1〜2時間前|1–2시간 전'),
    a_long: row('Давно|Давно|A while ago|Hace rato|Länger her|Faz tempo|Il y a longtemps|Dawno|Da un po’|מזמן|しばらく前|꽤 됐어요'),
    m_lt1: row('После еды прошло меньше часа: разминка подольше, без прыжков и рывков. Тяжело в животе — отложите на час.|Після їжі минуло менше години: розминка довша, без стрибків і ривків. Важко в животі — відкладіть на годину.|Less than an hour since you ate: warm up longer and skip jumps and bursts. If your stomach feels heavy, wait an hour.|Ha pasado menos de una hora desde que comiste: calienta más y evita saltos y arranques. Si notas pesadez, espera una hora.|Weniger als eine Stunde nach dem Essen: länger aufwärmen, keine Sprünge und Sprints. Fühlt sich der Magen schwer an, eine Stunde warten.|Menos de uma hora depois de comer: aqueça mais e evite saltos e arrancadas. Se sentir peso no estômago, espere uma hora.|Moins d’une heure après le repas : échauffement plus long, sans sauts ni accélérations. Estomac lourd ? Attendez une heure.|Mniej niż godzinę po jedzeniu: dłuższa rozgrzewka, bez skoków i zrywów. Ciężko w żołądku — odłóż o godzinę.|Meno di un’ora dopo il pasto: riscaldamento più lungo, niente salti e scatti. Se senti pesantezza, aspetta un’ora.|עברה פחות משעה מהאוכל: חימום ארוך יותר, בלי קפיצות ופריצות. כבד בבטן — דחו בשעה.|食後1時間以内です。ウォームアップを長めにし、ジャンプやダッシュは控えましょう。お腹が重ければ1時間あけて。|식사 후 1시간이 안 됐어요. 준비 운동을 길게, 점프와 전력 질주는 빼세요. 속이 더부룩하면 1시간 뒤에 하세요.'),
    m_long: row('Давно не ели: за 30–60 минут перекусите — банан, йогурт или горсть орехов.|Давно не їли: за 30–60 хвилин перекусіть — банан, йогурт або жменя горіхів.|It’s been a while since you ate: have a small snack 30–60 minutes before — a banana, yogurt or a handful of nuts.|Hace rato que no comes: toma algo ligero 30–60 minutos antes — un plátano, yogur o un puñado de frutos secos.|Länger nichts gegessen: 30–60 Minuten vorher eine Kleinigkeit — Banane, Joghurt oder eine Handvoll Nüsse.|Faz tempo que não come: faça um lanche 30–60 minutos antes — banana, iogurte ou um punhado de castanhas.|Repas lointain : prenez une collation 30–60 minutes avant — banane, yaourt ou une poignée de noix.|Dawno nie jadłaś/eś: zjedz coś małego 30–60 minut wcześniej — banan, jogurt albo garść orzechów.|Hai mangiato tempo fa: fai uno spuntino 30–60 minuti prima — una banana, uno yogurt o una manciata di frutta secca.|עבר זמן מאז שאכלתם: נשנוש קטן 30–60 דקות לפני — בננה, יוגורט או חופן אגוזים.|しばらく食べていません。30〜60分前にバナナ、ヨーグルト、ナッツひとつかみなど軽く補給を。|식사한 지 꽤 됐어요. 30–60분 전에 바나나, 요거트, 견과류 한 줌 정도 가볍게 드세요.'),
    m_walk: row('Прогулка не мешает тренировке — разминку можно сделать короче.|Прогулянка не заважає тренуванню — розминку можна зробити коротшою.|A walk doesn’t get in the way — you can keep the warm-up shorter.|Un paseo no impide entrenar: puedes acortar el calentamiento.|Ein Spaziergang stört nicht — das Aufwärmen darf kürzer sein.|A caminhada não atrapalha — o aquecimento pode ser mais curto.|Une marche ne gêne pas — l’échauffement peut être plus court.|Spacer nie przeszkadza — rozgrzewka może być krótsza.|Una passeggiata non è un problema: il riscaldamento può essere più breve.|הליכה לא מפריעה — אפשר לקצר את החימום.|散歩は問題ありません。ウォームアップは短めでOKです。|산책은 괜찮아요. 준비 운동은 짧게 해도 돼요.'),
    swap: row('Сегодня уже: {s}. {P} поработали — сейчас лучше «{n}», а «{o}» в другой день.|Сьогодні вже: {s}. {P} попрацювали — зараз краще «{n}», а «{o}» іншого дня.|Already today: {s}. Your {p} have worked — “{n}” fits better now; keep “{o}” for another day.|Hoy ya: {s}. {P} ya han trabajado: ahora mejor «{n}», y «{o}» otro día.|Heute schon: {s}. {P} haben gearbeitet — jetzt passt „{n}“ besser, „{o}“ an einem anderen Tag.|Hoje já: {s}. {P} já trabalharam — agora é melhor «{n}», e «{o}» em outro dia.|Déjà aujourd’hui : {s}. {P} ont travaillé — mieux vaut « {n} » maintenant, et « {o} » un autre jour.|Dziś już: {s}. {P} popracowały — teraz lepiej „{n}”, a „{o}” innego dnia.|Oggi già: {s}. {P} hanno lavorato — ora meglio «{n}», e «{o}» un altro giorno.|היום כבר: {s}. {P} עבדו — עכשיו עדיף „{n}”, ו„{o}” ביום אחר.|今日はすでに{s}。{P}は使っています。今は「{n}」がおすすめ、「{o}」は別の日に。|오늘 이미 {s}. {P}은 충분히 썼어요. 지금은 「{n}」이 좋고 「{o}」은 다른 날에.'),
    p_legs: row('ноги|ноги|legs|las piernas|die Beine|as pernas|les jambes|nogi|le gambe|הרגליים|脚|다리'),
    p_body: row('ноги и сердце|ноги й серце|legs and heart|piernas y corazón|Beine und Herz|pernas e coração|jambes et cœur|nogi i serce|gambe e cuore|הרגליים והלב|脚と心肺|다리와 심폐'),
    p_upper: row('плечи и руки|плечі й руки|shoulders and arms|hombros y brazos|Schultern und Arme|ombros e braços|épaules et bras|barki i ręce|spalle e braccia|הכתפיים והידיים|肩と腕|어깨와 팔'),
    p_all: row('мышцы|м’язи|muscles|los músculos|die Muskeln|os músculos|les muscles|mięśnie|i muscoli|השרירים|筋肉|근육'),
    keep: row('Всё равно сделать как в плане|Все одно зробити як у плані|Do the original plan anyway|Hacer igualmente lo planeado|Trotzdem wie geplant|Fazer como planejado mesmo assim|Faire quand même le plan prévu|Mimo to zrób plan|Fare comunque il piano|לעשות בכל זאת לפי התוכנית|予定どおり行う|그래도 계획대로 하기'),
    ok: row('Сегодня уже: {s}. Эта тренировка подходит — нагружает другое.|Сьогодні вже: {s}. Це тренування підходить — навантажує інше.|Already today: {s}. This workout still fits — it works different muscles.|Hoy ya: {s}. Este entrenamiento encaja: trabaja otra zona.|Heute schon: {s}. Dieses Training passt — es belastet anderes.|Hoje já: {s}. Este treino ainda serve — trabalha outra parte.|Déjà aujourd’hui : {s}. Cette séance convient — elle sollicite autre chose.|Dziś już: {s}. Ten trening pasuje — obciąża co innego.|Oggi già: {s}. Questo allenamento va bene: lavora altro.|היום כבר: {s}. האימון הזה מתאים — הוא עובד על משהו אחר.|今日はすでに{s}。このトレーニングは大丈夫、使う部位が違います。|오늘 이미 {s}. 이 운동은 괜찮아요. 다른 부위를 써요.'),
    // день спорта по расписанию
    dayT: row('Сегодня по плану: {s}|Сьогодні за планом: {s}|Today’s plan: {s}|Hoy toca: {s}|Heute geplant: {s}|Hoje no plano: {s}|Au programme aujourd’hui : {s}|Dziś w planie: {s}|Oggi in programma: {s}|היום בתוכנית: {s}|今日の予定：{s}|오늘의 계획: {s}'),
    daySub: row('по вашему расписанию|за вашим розкладом|on your schedule|según tu calendario|nach deinem Plan|conforme sua rotina|selon votre planning|według twojego planu|secondo il tuo programma|לפי הלוח שלכם|いつもの予定どおり|평소 일정대로'),
    dayOk: row('{s} — и есть нагрузка дня. Добавим к нему то, что бережёт суставы: разминку до и растяжку после.|{s} — і є навантаження дня. Додамо до нього те, що береже суглоби: розминку до і розтяжку після.|{s} is today’s workout. Add what protects your joints: a warm-up before and a stretch after.|{s} es la actividad del día. Añade lo que cuida tus articulaciones: calentar antes y estirar después.|{s} ist das Training des Tages. Dazu, was die Gelenke schützt: Aufwärmen vorher, Dehnen danach.|{s} é o treino do dia. Acrescente o que protege as articulações: aquecimento antes e alongamento depois.|{s}, c’est l’activité du jour. Ajoutez ce qui protège les articulations : échauffement avant, étirements après.|{s} to dzisiejsza aktywność. Dodaj to, co chroni stawy: rozgrzewkę przed i rozciąganie po.|{s} è l’attività del giorno. Aggiungi ciò che protegge le articolazioni: riscaldamento prima e allungamento dopo.|{s} — זה האימון של היום. הוסיפו מה ששומר על המפרקים: חימום לפני ומתיחות אחרי.|今日の運動は{s}です。関節を守るため、前にウォームアップ、後にストレッチを。|오늘의 운동은 {s}예요. 관절을 위해 전에는 준비 운동, 후에는 스트레칭을 더하세요.'),
    warm: row('Разминка до|Розминка до|Warm-up before|Calentamiento antes|Aufwärmen vorher|Aquecimento antes|Échauffement avant|Rozgrzewka przed|Riscaldamento prima|חימום לפני|事前のウォームアップ|사전 준비 운동'),
    cool: row('Растяжка после|Розтяжка після|Stretch after|Estiramiento después|Dehnen danach|Alongamento depois|Étirements après|Rozciąganie po|Allungamento dopo|מתיחות אחרי|事後のストレッチ|사후 스트레칭'),
    skip: row('Сегодня не играю → обычная тренировка|Сьогодні не граю → звичайне тренування|Not playing today → regular workout|Hoy no juego → entrenamiento normal|Heute kein Sport → normales Training|Hoje não vou jogar → treino normal|Pas de sport aujourd’hui → séance habituelle|Dziś nie gram → zwykły trening|Oggi non gioco → allenamento normale|לא משחק/ת היום → אימון רגיל|今日はしない → 通常のトレーニング|오늘은 안 해요 → 평소 운동'),
    // сверка прибора и самочувствия (решение владельца 2026-10-11: не спорить, кто прав)
    devLowFeelOk: row('Прибор показывает восстановление ниже вашей нормы, а самочувствие хорошее. Так бывает: прибор видит ночь, вы — себя сейчас. Двигаться можно, но спокойнее: разминка подольше, без рывков на пределе. Если в первые 10–15 минут тяжело дышать или пульс выше привычного — закончите раньше.|Прилад показує відновлення нижче вашої норми, а самопочуття добре. Так буває: прилад бачить ніч, ви — себе зараз. Рухатися можна, але спокійніше: розминка довша, без ривків на межі. Якщо в перші 10–15 хвилин важко дихати або пульс вищий за звичний — завершіть раніше.|Your device shows recovery below your usual, but you feel good. That happens: the device sees your night, you feel how you are now. You can train, just easier: a longer warm-up, no all-out bursts. If breathing feels hard or your pulse is higher than usual in the first 10–15 minutes, finish early.|Tu dispositivo muestra una recuperación por debajo de lo habitual, pero te sientes bien. Pasa: el dispositivo ve tu noche y tú, cómo estás ahora. Puedes moverte, pero con calma: calentamiento más largo, sin esfuerzos al límite. Si en los primeros 10–15 minutos te cuesta respirar o el pulso va más alto de lo normal, termina antes.|Dein Gerät zeigt eine Erholung unter deinem Üblichen, du fühlst dich aber gut. Das kommt vor: Das Gerät sieht die Nacht, du spürst dich jetzt. Bewegung ja, aber ruhiger: länger aufwärmen, keine Maximalsprints. Wenn in den ersten 10–15 Minuten das Atmen schwerfällt oder der Puls höher ist als sonst, früher aufhören.|O dispositivo mostra recuperação abaixo do seu normal, mas você se sente bem. Acontece: o dispositivo vê a noite, você sente como está agora. Pode se mexer, mas com calma: aquecimento mais longo, sem arrancadas no limite. Se nos primeiros 10–15 minutos a respiração pesar ou o pulso estiver acima do normal, termine antes.|Votre appareil indique une récupération inférieure à votre habitude, mais vous vous sentez bien. Ça arrive : l’appareil voit la nuit, vous sentez l’instant présent. Bougez, mais plus calmement : échauffement plus long, pas d’efforts à fond. Si la respiration est difficile ou le pouls plus élevé que d’habitude dans les 10–15 premières minutes, arrêtez plus tôt.|Urządzenie pokazuje regenerację poniżej twojej normy, a samopoczucie jest dobre. Tak bywa: urządzenie widzi noc, ty — siebie teraz. Ruszać się można, ale spokojniej: dłuższa rozgrzewka, bez zrywów na maksa. Jeśli w pierwszych 10–15 minutach ciężko oddychać albo tętno jest wyższe niż zwykle — skończ wcześniej.|Il dispositivo mostra un recupero sotto la tua norma, ma ti senti bene. Succede: il dispositivo vede la notte, tu senti come stai adesso. Puoi muoverti, ma con calma: riscaldamento più lungo, niente sforzi al massimo. Se nei primi 10–15 minuti respiri a fatica o il battito è più alto del solito, chiudi prima.|המכשיר מראה התאוששות מתחת לרגיל שלכם, אבל אתם מרגישים טוב. זה קורה: המכשיר רואה את הלילה, ואתם — את עצמכם עכשיו. אפשר לזוז, אבל ברוגע: חימום ארוך יותר, בלי מאמצים מרביים. אם ב־10–15 הדקות הראשונות קשה לנשום או שהדופק גבוה מהרגיל — סיימו מוקדם.|デバイスでは回復がいつもより低めですが、体調は良いようです。よくあることです。デバイスが見ているのは夜、あなたが感じているのは今。動いてOKですが、控えめに：ウォームアップは長めに、全力のダッシュはなし。最初の10〜15分で息が苦しい、脈がいつもより高いときは早めに切り上げて。|기기는 회복이 평소보다 낮다고 하지만 컨디션은 좋네요. 그럴 수 있어요. 기기는 밤을 보고, 당신은 지금의 몸을 느끼니까요. 움직여도 되지만 가볍게: 준비 운동은 길게, 전력 질주는 빼세요. 처음 10–15분에 숨이 차거나 맥박이 평소보다 높으면 일찍 마무리하세요.'),
    devOkFeelLow: row('Прибор показывает норму, но вы чувствуете усталость. Ориентируемся на самочувствие: сегодня легче или короче — это тоже тренировка.|Прилад показує норму, але ви відчуваєте втому. Орієнтуємося на самопочуття: сьогодні легше або коротше — це теж тренування.|Your device shows your usual, but you feel tired. We go by how you feel: lighter or shorter today — that still counts.|El dispositivo muestra lo habitual, pero te sientes cansada/o. Nos guiamos por cómo te sientes: hoy más suave o más corto, también cuenta.|Das Gerät zeigt Normalwerte, du fühlst dich aber müde. Wir richten uns nach deinem Gefühl: heute leichter oder kürzer — das zählt auch.|O dispositivo mostra o normal, mas você se sente cansada/o. Seguimos o que você sente: hoje mais leve ou mais curto — também conta.|L’appareil indique vos valeurs habituelles, mais vous êtes fatigué(e). On suit votre ressenti : plus léger ou plus court aujourd’hui — ça compte aussi.|Urządzenie pokazuje normę, ale czujesz zmęczenie. Kierujemy się samopoczuciem: dziś lżej albo krócej — to też trening.|Il dispositivo mostra i valori soliti, ma ti senti stanca/o. Seguiamo come ti senti: oggi più leggero o più breve — conta lo stesso.|המכשיר מראה את הרגיל, אבל אתם מרגישים עייפות. הולכים לפי התחושה: היום קל או קצר יותר — גם זה אימון.|デバイスはいつもどおりですが、疲れを感じているようです。体の声を優先して、今日は軽めか短めに。それも立派なトレーニングです。|기기는 평소와 같지만 피곤함을 느끼시네요. 몸의 느낌을 따를게요. 오늘은 가볍게 또는 짧게 — 그것도 운동이에요.'),
    bothLow: row('И прибор, и самочувствие говорят: телу нужен отдых. {s} лучше перенести или сыграть спокойно и недолго. Лёгкая растяжка сегодня — полноценный план.|І прилад, і самопочуття кажуть: тілу потрібен відпочинок. {s} краще перенести або зіграти спокійно й недовго. Легка розтяжка сьогодні — повноцінний план.|Both your device and how you feel say: your body needs rest. Better to move {s} to another day, or play easy and short. A light stretch is a full plan today.|Tanto el dispositivo como tu sensación dicen: el cuerpo necesita descanso. Mejor dejar {s} para otro día o hacerlo suave y corto. Un estiramiento suave hoy es un plan completo.|Gerät und Gefühl sagen beide: Der Körper braucht Ruhe. {s} lieber verschieben oder locker und kurz. Leichtes Dehnen ist heute ein vollwertiger Plan.|O dispositivo e o que você sente dizem o mesmo: o corpo precisa de descanso. Melhor adiar {s} ou fazer leve e curto. Um alongamento leve hoje é um plano completo.|L’appareil et votre ressenti disent la même chose : le corps a besoin de repos. Mieux vaut reporter {s} ou y aller doucement et brièvement. Des étirements légers sont un plan complet aujourd’hui.|I urządzenie, i samopoczucie mówią: ciało potrzebuje odpoczynku. {s} lepiej przełożyć albo zrobić spokojnie i krótko. Lekkie rozciąganie to dziś pełny plan.|Sia il dispositivo sia come ti senti dicono: il corpo ha bisogno di riposo. Meglio rimandare {s} o farlo leggero e breve. Un allungamento leggero oggi è un piano completo.|גם המכשיר וגם התחושה אומרים: הגוף צריך מנוחה. עדיף לדחות את {s} או לעשות בקלות ובקצרה. מתיחות קלות הן היום תוכנית מלאה.|デバイスも体調も「休息が必要」と示しています。{s}は別の日にするか、軽く短めに。今日は軽いストレッチで十分なプランです。|기기와 컨디션 모두 휴식이 필요하다고 말해요. {s}은 다른 날로 미루거나 가볍고 짧게 하세요. 오늘은 가벼운 스트레칭이면 충분한 계획이에요.')
  };
  function L_() { try { return (typeof lang !== 'undefined' && lang) || 'en'; } catch (e) { return 'en'; } }
  function t(k, l) { var o = T[k] || {}; return o[l || L_()] || o.en || ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function name(id, l) { var s = BY[id]; if (!s) return ''; var a = s[4].split('|'); return a[LG.indexOf(l || L_())] || a[2]; }

  // ── хранение ────────────────────────────────────────────────────────────────
  var KEY = 'vialp_sports', NOW = 'vialp_wo_now', SKIP = 'vialp_sport_skip';
  function get() { try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.filter(function (x) { return x && BY[x.id]; }) : []; } catch (e) { return []; } }
  function put(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function find(id) { return get().filter(function (x) { return x.id === id; })[0]; }
  function wday(day) { var d = new Date(Date.parse(day) || Date.now()).getUTCDay(); return d === 0 ? 7 : d; }   // 1 = пн … 7 = вс
  function dayKey() { try { return window._dayKey ? window._dayKey() : new Date().toISOString().slice(0, 10); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  // Категория нагрузки для выбора тренировки: «спокойно» понижает рывковые до ровной выносливости.
  function cat(id, full) { var s = BY[id]; if (!s) return 'other'; var c = s[3]; if (full === false) c = c === 'hiit' ? 'cardio' : c === 'cardio' ? 'other' : c; return c; }
  function catOf(id) { var x = find(id); return cat(id, x ? x.full !== false : true); }
  // Спорт по расписанию на день (если сегодня не отменён кнопкой «Сегодня не играю»).
  function scheduled(day) { day = day || dayKey(); var w = wday(day); return get().filter(function (x) { return (x.days || []).indexOf(w) >= 0; })[0] || null; }
  function today() { var day = dayKey(); try { if (localStorage.getItem(SKIP) === day) return null; } catch (e) {} return scheduled(day); }
  // Вчерашний спорт — для чипа «Спорт» в «Движении вчера»: по расписанию вчера, иначе первый в списке.
  function yesterday() { var d = new Date(Date.parse(dayKey()) - 86400000).toISOString().slice(0, 10), s = scheduled(d) || get()[0]; return s ? { id: s.id, c: cat(s.id, s.full !== false) } : null; }
  function nowGet() { try { var o = JSON.parse(localStorage.getItem(NOW) || 'null'); return o && o.day === dayKey() ? o : null; } catch (e) { return null; } }
  function nowSet(k, v) { var o = nowGet() || { day: dayKey() }; o[k] = v; if (k === 'did' && v !== 'sport') delete o.sid; try { localStorage.setItem(NOW, JSON.stringify(o)); } catch (e) {} rerender(); }
  function rerender() { try { localStorage.removeItem('vialp_wo_pick'); } catch (e) {} try { if (typeof window._rdWorkout === 'function') window._rdWorkout(); } catch (e) {} }

  // ── «Мой спорт» в Профиле ───────────────────────────────────────────────────
  var CSS = '.sp-mine{padding:12px 14px;border-radius:16px;border:1px solid var(--gold,#C68C34);background:rgba(226,185,90,.08);margin-bottom:10px;}'
    + '.sp-mine .r{display:flex;align-items:center;gap:10px;font-weight:600;color:var(--t1,#fff);margin-bottom:10px;}.sp-mine .r i{font-size:20px;color:var(--gold-lt,#EEAF54);}'
    + '.sp-mine .x{margin-left:auto;background:none;border:0;color:var(--t3,rgba(255,255,255,.55));font:inherit;font-size:13px;cursor:pointer;}'
    + '.sp-d{display:flex;gap:5px;}.sp-d button,.sp-i button{flex:1;min-width:0;padding:8px 0;border-radius:10px;border:1px solid rgba(226,185,90,.28);background:transparent;color:var(--t2,rgba(255,255,255,.85));font:500 13px var(--font-ui,inherit);cursor:pointer;}'
    + '.sp-d button.on,.sp-i button.on{background:var(--gold,#C68C34);border-color:var(--gold,#C68C34);color:#10131A;font-weight:600;}.sp-i{display:flex;gap:6px;margin-top:8px;}'
    + '.sp-add{display:block;width:100%;min-height:46px;border-radius:14px;border:1px solid rgba(226,185,90,.45);background:rgba(226,185,90,.10);color:var(--t1,#fff);font:600 var(--fs-body,15px) var(--font-ui,inherit);cursor:pointer;}'
    + '.sp-srch{width:100%;box-sizing:border-box;padding:11px 14px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(226,185,90,.14);color:var(--t1,#fff);font:inherit;margin-bottom:12px;}'
    + '.sp-lbl{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-lt,#EEAF54);margin:4px 0 8px;}'
    + '.sp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}.sp-chip{display:flex;align-items:center;gap:7px;padding:9px 12px;border-radius:14px;border:1px solid rgba(226,185,90,.22);background:rgba(6,9,18,.42);color:var(--t1,#fff);font:500 14px var(--font-ui,inherit);cursor:pointer;}'
    + '.sp-chip i{font-size:18px;color:var(--gold-lt,#EEAF54);}.sp-chip.on{background:rgba(226,185,90,.18);border-color:var(--gold,#C68C34);}'
    + '.sp-grp{border-radius:16px;border:1px solid rgba(226,185,90,.22);background:rgba(6,9,18,.42);margin-bottom:8px;}.sp-grp>summary{list-style:none;display:flex;align-items:center;gap:9px;padding:12px 14px;font-weight:600;color:var(--t1,#fff);cursor:pointer;}'
    + '.sp-grp>summary::-webkit-details-marker{display:none;}.sp-grp>summary i{font-size:19px;color:var(--gold-lt,#EEAF54);}.sp-grp .sp-chips{padding:0 12px 4px;}'
    // проверка перед стартом и день спорта (в карточке «Тренировка дня»)
    + '.sp-chk{margin-top:12px;padding-top:12px;border-top:1px solid rgba(226,185,90,.18);}.sp-q{font-weight:600;color:var(--t1,#fff);margin:10px 0 7px;font-size:var(--fs-body,15px);}'
    + '.sp-o{display:flex;flex-wrap:wrap;gap:7px;}.sp-o button{padding:8px 11px;border-radius:12px;border:1px solid rgba(226,185,90,.45);background:transparent;color:var(--t1,#fff);font:500 14px var(--font-ui,inherit);cursor:pointer;}'
    + '.sp-o button.on{background:var(--gold,#C68C34);border-color:var(--gold,#C68C34);color:#10131A;font-weight:600;}'
    + '.sp-adv{margin-top:12px;padding:12px;border-radius:14px;background:rgba(78,204,163,.10);border:1px solid rgba(78,204,163,.35);color:var(--t1,#fff);font-size:var(--fs-body,15px);line-height:1.5;}'
    + '.sp-row{display:flex;justify-content:space-between;align-items:center;width:100%;margin-top:8px;padding:12px 14px;border-radius:14px;border:1px solid rgba(226,185,90,.45);background:transparent;color:var(--t1,#fff);font:600 var(--fs-body,15px) var(--font-ui,inherit);cursor:pointer;text-align:left;}'
    + '.sp-row span{color:var(--t3,rgba(255,255,255,.55));font-weight:400;}.sp-keep{display:block;width:100%;margin-top:8px;padding:8px;border:0;background:none;color:var(--t3,rgba(255,255,255,.55));font:500 14px var(--font-ui,inherit);cursor:pointer;}';
  try { var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); } catch (e) {}

  function mineHtml(l) {
    var a = get(), wd = t('wd', l).split(',');
    if (!a.length) return '<div style="font-size:var(--fs-cap);color:var(--t3);margin-bottom:10px;">' + esc(t('none', l)) + '</div>';
    return a.map(function (x) {
      var s = BY[x.id];
      return '<div class="sp-mine"><div class="r"><i class="ph ph-' + s[2] + '"></i>' + esc(name(x.id, l))
        + '<button type="button" class="x" onclick="vialSports._rm(\'' + x.id + '\')">' + esc(t('remove', l)) + '</button></div>'
        + '<div style="font-size:12px;color:var(--t3);margin-bottom:6px;">' + esc(t('days', l)) + '</div>'
        + '<div class="sp-d">' + wd.map(function (n, i) { var on = (x.days || []).indexOf(i + 1) >= 0; return '<button type="button" class="' + (on ? 'on' : '') + '" onclick="vialSports._day(\'' + x.id + '\',' + (i + 1) + ')">' + esc(n) + '</button>'; }).join('') + '</div>'
        + '<div class="sp-i"><button type="button" class="' + (x.full === false ? 'on' : '') + '" onclick="vialSports._full(\'' + x.id + '\',false)">' + esc(t('easy', l)) + '</button>'
        + '<button type="button" class="' + (x.full !== false ? 'on' : '') + '" onclick="vialSports._full(\'' + x.id + '\',true)">' + esc(t('full', l)) + '</button></div></div>';
    }).join('');
  }
  function profileHtml(l) {
    return '<div id="spMine" style="margin-bottom:4px;"><div style="font-size:var(--fs-cap);color:var(--t2);line-height:1.5;margin-bottom:10px;">' + esc(t('intro', l)) + '</div>'
      + mineHtml(l) + '</div><button type="button" class="sp-add" onclick="vialSports.picker()">+ ' + esc(t('add', l)) + '</button>';
  }
  function refreshMine() { var b = document.getElementById('spMine'); if (b) b.outerHTML = profileHtml(L_()).replace(/<button type="button" class="sp-add"[\s\S]*$/, ''); }
  function chip(id, l) { var on = !!find(id); return '<button type="button" class="sp-chip' + (on ? ' on' : '') + '" data-sp="' + id + '" onclick="vialSports._tg(\'' + id + '\',this)"><i class="ph ph-' + BY[id][2] + '"></i>' + esc(name(id, l)) + '</button>'; }
  function picker() {
    if (typeof window.openSheet !== 'function') return;
    var l = L_();
    var h = '<input class="sp-srch" type="search" placeholder="' + esc(t('search', l)) + '" oninput="vialSports._find(this.value)">'
      + '<div id="spFound" class="sp-chips" style="display:none;"></div><div id="spBrowse">'
      + '<div class="sp-lbl">' + esc(t('pop', l)) + '</div><div class="sp-chips">' + POP.map(function (id) { return chip(id, l); }).join('') + '</div>'
      + '<div class="sp-lbl">' + esc(t('all', l)) + '</div>'
      + Object.keys(GRP).map(function (g) {
        return '<details class="sp-grp"><summary><i class="ph ph-' + GRP[g] + '"></i>' + esc(t(g, l)) + '</summary><div class="sp-chips">'
          + S.filter(function (s) { return s[1] === g; }).map(function (s) { return chip(s[0], l); }).join('') + '</div></details>';
      }).join('') + '</div>';
    window.openSheet('<i class="ph ph-tennis-ball" style="color:var(--gold-lt);"></i>', t('title', l), h);
  }
  function _find(q) {
    var f = document.getElementById('spFound'), b = document.getElementById('spBrowse'), l = L_();
    q = String(q || '').trim().toLowerCase();
    if (!f || !b) return;
    if (!q) { f.style.display = 'none'; b.style.display = ''; return; }
    var hit = S.filter(function (s) { return s[4].toLowerCase().indexOf(q) >= 0 || s[0].indexOf(q) >= 0; });   // ищем по всем 12 языкам сразу
    f.innerHTML = hit.map(function (s) { return chip(s[0], l); }).join(''); f.style.display = 'flex'; b.style.display = 'none';
  }
  function _tg(id, el) {
    var a = get(), i = a.map(function (x) { return x.id; }).indexOf(id);
    if (i >= 0) a.splice(i, 1); else a.push({ id: id, days: [], full: true });
    put(a);
    document.querySelectorAll('.sp-chip[data-sp="' + id + '"]').forEach(function (c) { c.classList.toggle('on', i < 0); });
    refreshMine(); rerender();
  }
  function _rm(id) { put(get().filter(function (x) { return x.id !== id; })); refreshMine(); rerender(); }
  function _day(id, d) { var a = get(); a.forEach(function (x) { if (x.id === id) { x.days = x.days || []; var k = x.days.indexOf(d); if (k >= 0) x.days.splice(k, 1); else x.days.push(d); x.days.sort(); } }); put(a); refreshMine(); rerender(); }
  function _full(id, v) { var a = get(); a.forEach(function (x) { if (x.id === id) x.full = !!v; }); put(a); refreshMine(); rerender(); }

  // ── проверка перед стартом ──────────────────────────────────────────────────
  // r — выбор на сейчас (с учётом ответа), r.orig — что было в плане утром. part — какие мышцы «уже поработали».
  var PART = { hiit: 'p_body', cardio: 'p_legs', legs: 'p_legs', upper: 'p_upper', full: 'p_all' };
  function checkHtml(r, l) {
    if (!r || !r.id) return '';
    var n = nowGet() || {}, mine = get();
    var b = function (k, v, lbl) { return '<button type="button" class="' + (n[k] === v ? 'on' : '') + '" onclick="vialSports._now(\'' + k + '\',\'' + v + '\')">' + esc(lbl) + '</button>'; };
    var h = '<div class="sp-chk"><div class="sp-q" style="margin-top:0;">' + esc(t('q1', l)) + '</div><div class="sp-o">'
      + b('did', 'none', t('d_none', l)) + b('did', 'walk', t('d_walk', l)) + b('did', 'sport', t('d_sport', l)) + '</div>';
    if (n.did === 'sport') {
      // свой спорт — первым; остальное — из полного каталога через поиск в «Моём спорте»
      var opts = mine.map(function (x) { return x.id; }); POP.forEach(function (id) { if (opts.indexOf(id) < 0) opts.push(id); });
      ['gym', 'yoga', 'pilates'].forEach(function (id) { if (opts.indexOf(id) < 0) opts.push(id); });
      h += '<div class="sp-q">' + esc(t('which', l)) + '</div><div class="sp-o">' + opts.map(function (id) { return b('sid', id, name(id, l)); }).join('') + '</div>';
    }
    h += '<div class="sp-q">' + esc(t('q2', l)) + '</div><div class="sp-o">' + b('ate', 'lt1', t('a_lt1', l)) + b('ate', '12', t('a_12', l)) + b('ate', 'long', t('a_long', l)) + '</div>';
    var adv = [];
    if (n.did === 'walk') adv.push(t('m_walk', l));
    if (n.did === 'sport' && n.sid && window.vialWorkouts) {
      var W = window.vialWorkouts, nm = name(n.sid, l), p = t(PART[catOf(n.sid)] || 'p_all', l);
      if (r.orig && r.orig !== r.id) adv.push(t('swap', l).replace('{s}', nm).replace('{P}', p.charAt(0).toUpperCase() + p.slice(1)).replace('{p}', p).replace('{n}', W.title(r.id, l)).replace('{o}', W.title(r.orig, l)));
      else adv.push(t('ok', l).replace('{s}', name(n.sid, l)));
    }
    if (n.ate === 'lt1') adv.push(t('m_lt1', l)); else if (n.ate === 'long') adv.push(t('m_long', l));
    if (adv.length) h += '<div class="sp-adv">' + adv.map(esc).join('<br><br>') + '</div>';
    if (r.orig && r.orig !== r.id) h += '<button type="button" class="sp-keep" onclick="vialWorkouts.play(\'' + r.orig + '\')">' + esc(t('keep', l)) + '</button>';
    return h + '</div>';
  }
  function _now(k, v) { nowSet(k, v); }

  // ── сверка прибора и самочувствия ───────────────────────────────────────────
  // dev — прибор ниже личной нормы (ВСР/пульс покоя или readiness < 70); feel — сон/энергия на 2 балла хуже обычного.
  function gap(ctx) { var d = !!(ctx && ctx.dev), f = !!(ctx && ctx.feel); return d && f ? 'both' : d ? 'dev' : f ? 'feel' : ''; }
  function gapTxt(g, sid, l) {
    if (g === 'dev') return t('devLowFeelOk', l);
    if (g === 'feel') return t('devOkFeelLow', l);
    if (g === 'both') return t('bothLow', l).replace('{s}', sid ? name(sid, l) : '');
    return '';
  }
  // ── день спорта по расписанию ───────────────────────────────────────────────
  function dayCard(r, l) {
    var sid = r.sport, s = BY[sid]; if (!s) return '';
    var W = window.vialWorkouts, mob = r.mob;
    var h = '<div class="wo-h"><i class="ph ph-' + s[2] + '" aria-hidden="true"></i>' + esc(W && W.uiTitle ? W.uiTitle(l) : '') + '</div>'
      + '<div class="wo-n">' + esc(t('dayT', l).replace('{s}', name(sid, l))) + '</div><div class="wo-d">' + esc(t('daySub', l)) + '</div>';
    var g = r.gap ? gapTxt(r.gap, sid, l) : '';
    h += '<div class="sp-adv">' + esc(g || t('dayOk', l).replace('{s}', name(sid, l))) + '</div>';
    if (mob && W) {
      h += '<button type="button" class="sp-row" onclick="vialWorkouts.' + (window.vialPlayer ? 'play' : 'open') + '(\'' + mob + '\')">' + esc(t('warm', l)) + '<span>' + esc(W.title(mob, l)) + ' ›</span></button>'
        + '<button type="button" class="sp-row" onclick="vialWorkouts.open(\'' + mob + '\')">' + esc(t('cool', l)) + '<span>›</span></button>';
    }
    h += '<button type="button" class="sp-row" onclick="vialSports._skip()">' + esc(t('skip', l)) + '<span>›</span></button>';
    return h;
  }
  function _skip() { try { localStorage.setItem(SKIP, dayKey()); } catch (e) {} rerender(); }

  // Для ИИ-разбора (воркер, _todayMovePlanBase): названия по-русски — промпт внутренний.
  function ctxForAI() {
    var wd = 'пн,вт,ср,чт,пт,сб,вс'.split(','), n = nowGet(), st = today(), mv = '';
    try { mv = (document.querySelector('input[name="move_today"]:checked') || {}).value || ''; } catch (e) {}
    var y = mv === 'sport' ? yesterday() : null, it = function (id, full) { return { n: name(id, 'ru'), c: cat(id, full) }; };
    var list = get().map(function (x) { return name(x.id, 'ru') + ((x.days || []).length ? ' (' + x.days.map(function (d) { return wd[d - 1]; }).join(', ') + ')' : '') + (x.full === false ? ', спокойно' : ''); });
    if (!list.length && !y && !(n && n.sid)) return null;
    return { list: list, today: st ? it(st.id, st.full !== false) : null, yday: y ? { n: name(y.id, 'ru'), c: y.c } : null,
      done: n && n.did === 'sport' && n.sid ? it(n.sid, (find(n.sid) || {}).full !== false) : null };
  }
  window.vialSports = {
    ctxForAI: ctxForAI,
    get: get, name: name, cat: cat, catOf: catOf, today: today, yesterday: yesterday, now: nowGet, gap: gap, gapTxt: gapTxt,
    profileHtml: profileHtml, picker: picker, checkHtml: checkHtml, dayCard: dayCard, t: t,
    _find: _find, _tg: _tg, _rm: _rm, _day: _day, _full: _full, _now: _now, _skip: _skip
  };
})();
