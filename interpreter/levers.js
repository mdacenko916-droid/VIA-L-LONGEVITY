/* VIA·L — карта рычагов и решение недели (2026-10-02). Основа единого разбора «состояние + жалобы».
   Решение владельца и Марины: человек — один организм, рекомендация на неделю ОДНА («фокус недели»), а не
   по шагу на каждую жалобу. Один рычаг закрывает сразу несколько жалоб, поэтому фокус выбирается по карте:
   какой рычаг покрывает больше всего из отмеченного человеком. Выбирает и решает КОД; ИИ в недельном разборе
   это решение только объясняет. Утверждено на странице docs/COMPLAINT-BLOCK-PROPOSAL.html.

   Откуда связи «рычаг → жалоба»: паттерны базы знаний воркера (P-F1 приливы, P-F5 энергия, P-F7 вес,
   P-F9/P-F10 настроение и туман, P-F12 боли и мышцы, P-F17 сон). Либидо, цикл и мужская «мотивация» общих
   рычагов не имеют — по ним остаются карточки complaint-table.js и путь к специалисту.

   ТЕКСТ ФИКСИРОВАННЫЙ: доз и обещаний нет. Правишь русский — правь все 12 языков; число шагов у рычага
   одинаково во всех языках. В строках только типографские кавычки и апостроф ’.
   Здесь же — отрисовка блока «Фокус недели» (vialFocusHTML): состояние считает страница, модуль только рисует. */
(function(){
  // cover — жалобы, которым рычаг помогает (ключи CMP_ITEMS); metrics — что смотреть «до → после» (_EXP_KEYS).
  // Порядок в списке = приоритет при равном счёте: сначала простое и сильное.
  var LEVERS = [
    { key:'evening', cover:['sleep','hf','energy'], metrics:['sleepHours','deepMin','rhr'],
      t:{ru:'Кофе до 14:00, вечер без алкоголя, ранний ужин',uk:'Кава до 14:00, вечір без алкоголю, рання вечеря',en:'Coffee before 2 pm, no evening alcohol, early dinner',es:'Café antes de las 14:00, noche sin alcohol, cena temprana',de:'Kaffee bis 14 Uhr, abends kein Alkohol, frühes Abendessen',pt:'Café até as 14h, noite sem álcool, jantar cedo',fr:'Café avant 14 h, soirée sans alcool, dîner tôt',pl:'Kawa do 14:00, wieczór bez alkoholu, wczesna kolacja',it:'Caffè entro le 14, sera senza alcol, cena presto',he:'קפה עד 14:00, ערב בלי אלכוהול, ארוחת ערב מוקדמת',ja:'コーヒーは14時まで、夜はお酒なし、夕食は早めに',ko:'커피는 오후 2시까지, 저녁엔 술 없이, 이른 저녁 식사'},
      s:[{ru:'Кофе и крепкий чай — только до 14:00.',uk:'Кава та міцний чай — лише до 14:00.',en:'Coffee and strong tea — only before 2 pm.',es:'Café y té fuerte, solo antes de las 14:00.',de:'Kaffee und starker Tee nur bis 14 Uhr.',pt:'Café e chá forte — só até as 14h.',fr:'Café et thé fort — uniquement avant 14 h.',pl:'Kawa i mocna herbata — tylko do 14:00.',it:'Caffè e tè forte solo entro le 14.',he:'קפה ותה חזק — רק עד 14:00.',ja:'コーヒーと濃いお茶は14時まで。',ko:'커피와 진한 차는 오후 2시까지만.'},
         {ru:'Алкоголь вечером — пауза на неделю.',uk:'Алкоголь увечері — пауза на тиждень.',en:'Evening alcohol — a one-week pause.',es:'Alcohol por la noche: una semana de pausa.',de:'Alkohol am Abend — eine Woche Pause.',pt:'Álcool à noite — uma semana de pausa.',fr:'Alcool le soir — une semaine de pause.',pl:'Alkohol wieczorem — tydzień przerwy.',it:'Alcol la sera — una settimana di pausa.',he:'אלכוהול בערב — הפסקה לשבוע.',ja:'夜のお酒は1週間お休み。',ko:'저녁 술은 일주일 쉬기.'},
         {ru:'Ужин — за три часа до сна.',uk:'Вечеря — за три години до сну.',en:'Dinner three hours before bed.',es:'Cena tres horas antes de dormir.',de:'Abendessen drei Stunden vor dem Schlafen.',pt:'Jantar três horas antes de dormir.',fr:'Dîner trois heures avant le coucher.',pl:'Kolacja trzy godziny przed snem.',it:'Cena tre ore prima di dormire.',he:'ארוחת ערב שלוש שעות לפני השינה.',ja:'夕食は就寝の3時間前までに。',ko:'저녁은 잠들기 3시간 전에.'}] },
    { key:'wake', cover:['sleep','energy','mood','fog'], metrics:['sleepHours','energy'],
      t:{ru:'Подъём в одно время и утренний свет',uk:'Підйом в один час і ранкове світло',en:'Same wake-up time and morning light',es:'Levantarse a la misma hora y luz por la mañana',de:'Feste Aufstehzeit und Morgenlicht',pt:'Acordar no mesmo horário e luz da manhã',fr:'Lever à heure fixe et lumière du matin',pl:'Stała pora wstawania i poranne światło',it:'Sveglia alla stessa ora e luce del mattino',he:'קימה בשעה קבועה ואור בוקר',ja:'同じ時刻に起きて朝の光を浴びる',ko:'같은 시간에 일어나고 아침 햇빛 쬐기'},
      s:[{ru:'Вставать в одно и то же время все семь дней, включая выходные.',uk:'Вставати в один і той самий час усі сім днів, зокрема у вихідні.',en:'Get up at the same time all seven days, weekends included.',es:'Levántate a la misma hora los siete días, también el fin de semana.',de:'An allen sieben Tagen zur gleichen Zeit aufstehen, auch am Wochenende.',pt:'Levantar no mesmo horário nos sete dias, inclusive no fim de semana.',fr:'Se lever à la même heure les sept jours, week-end compris.',pl:'Wstawać o tej samej porze przez wszystkie siedem dni, także w weekend.',it:'Alzarsi alla stessa ora tutti e sette i giorni, weekend compreso.',he:'לקום באותה שעה בכל שבעת הימים, גם בסוף השבוע.',ja:'週末も含め、7日間とも同じ時刻に起きる。',ko:'주말을 포함해 7일 모두 같은 시간에 일어나기.'},
         {ru:'В первый час после подъёма — 10–15 минут дневного света.',uk:'У першу годину після підйому — 10–15 хвилин денного світла.',en:'In the first hour after waking — 10–15 minutes of daylight.',es:'En la primera hora tras levantarte, 10–15 minutos de luz natural.',de:'In der ersten Stunde nach dem Aufstehen 10–15 Minuten Tageslicht.',pt:'Na primeira hora após acordar, 10–15 minutos de luz do dia.',fr:'Dans l’heure qui suit le lever, 10 à 15 minutes de lumière du jour.',pl:'W pierwszej godzinie po wstaniu — 10–15 minut światła dziennego.',it:'Nella prima ora dopo la sveglia, 10–15 minuti di luce naturale.',he:'בשעה הראשונה אחרי הקימה — 10–15 דקות של אור יום.',ja:'起床後1時間以内に、10〜15分ほど日光を浴びる。',ko:'일어난 뒤 한 시간 안에 10–15분 햇빛 쬐기.'}] },
    { key:'strength', cover:['hf','energy','mood','weight','pain','muscle'], metrics:['hf','energy','hrv'],
      t:{ru:'Силовая два раза в неделю',uk:'Силове двічі на тиждень',en:'Strength training twice a week',es:'Fuerza dos veces por semana',de:'Krafttraining zweimal pro Woche',pt:'Força duas vezes por semana',fr:'Renforcement deux fois par semaine',pl:'Trening siłowy dwa razy w tygodniu',it:'Forza due volte a settimana',he:'אימון כוח פעמיים בשבוע',ja:'週2回の筋トレ',ko:'주 2회 근력 운동'},
      s:[{ru:'Две силовые тренировки по 30–40 минут в разные дни.',uk:'Два силові тренування по 30–40 хвилин у різні дні.',en:'Two strength sessions of 30–40 minutes on separate days.',es:'Dos sesiones de fuerza de 30–40 minutos en días distintos.',de:'Zwei Krafteinheiten von 30–40 Minuten an verschiedenen Tagen.',pt:'Dois treinos de força de 30–40 minutos em dias diferentes.',fr:'Deux séances de renforcement de 30 à 40 minutes, à des jours différents.',pl:'Dwa treningi siłowe po 30–40 minut w różne dni.',it:'Due sedute di forza da 30–40 minuti in giorni diversi.',he:'שני אימוני כוח של 30–40 דקות בימים נפרדים.',ja:'別々の日に、30〜40分の筋トレを2回。',ko:'서로 다른 날에 30–40분 근력 운동 두 번.'},
         {ru:'Основа — приседания, тяги и жимы; без боли.',uk:'Основа — присідання, тяги та жими; без болю.',en:'Build on squats, pulls and presses; stay pain-free.',es:'La base: sentadillas, tirones y empujes; sin dolor.',de:'Basis: Kniebeugen, Zug- und Drückübungen; schmerzfrei.',pt:'A base: agachamentos, puxadas e empurradas; sem dor.',fr:'La base : squats, tirages et poussées ; sans douleur.',pl:'Podstawa to przysiady, ciągi i wyciskania; bez bólu.',it:'La base: squat, trazioni e spinte; senza dolore.',he:'הבסיס — סקוואטים, משיכות ודחיפות; בלי כאב.',ja:'基本はスクワット、引く動き、押す動き。痛みのない範囲で。',ko:'기본은 스쿼트, 당기기, 밀기 — 통증 없는 범위에서.'}] },
    { key:'protein', cover:['energy','weight','pain','muscle'], metrics:['energy'],
      t:{ru:'Белок в каждый приём, начиная с завтрака',uk:'Білок у кожен прийом, починаючи зі сніданку',en:'Protein at every meal, starting with breakfast',es:'Proteína en cada comida, empezando por el desayuno',de:'Eiweiß zu jeder Mahlzeit, beginnend mit dem Frühstück',pt:'Proteína em cada refeição, começando pelo café da manhã',fr:'Des protéines à chaque repas, dès le petit-déjeuner',pl:'Białko w każdym posiłku, zaczynając od śniadania',it:'Proteine a ogni pasto, a partire dalla colazione',he:'חלבון בכל ארוחה, החל מארוחת הבוקר',ja:'朝食から、毎食タンパク質を',ko:'아침부터 매 끼니 단백질'},
      s:[{ru:'В каждом приёме пищи — источник белка.',uk:'У кожному прийомі їжі — джерело білка.',en:'A source of protein at every meal.',es:'Una fuente de proteína en cada comida.',de:'Zu jeder Mahlzeit eine Eiweißquelle.',pt:'Uma fonte de proteína em cada refeição.',fr:'Une source de protéines à chaque repas.',pl:'W każdym posiłku źródło białka.',it:'Una fonte di proteine a ogni pasto.',he:'מקור חלבון בכל ארוחה.',ja:'毎食、タンパク質のとれる食品を入れる。',ko:'매 끼니에 단백질 식품 넣기.'},
         {ru:'Начать с завтрака: там белка обычно меньше всего.',uk:'Почати зі сніданку: там білка зазвичай найменше.',en:'Start with breakfast: that is usually where protein is lowest.',es:'Empieza por el desayuno: ahí suele faltar más proteína.',de:'Mit dem Frühstück beginnen: dort fehlt Eiweiß meist am stärksten.',pt:'Comece pelo café da manhã: é onde costuma faltar mais proteína.',fr:'Commencer par le petit-déjeuner : c’est là que les protéines manquent le plus.',pl:'Zacznij od śniadania: tam białka jest zwykle najmniej.',it:'Inizia dalla colazione: è lì che di solito le proteine mancano di più.',he:'להתחיל מארוחת הבוקר: שם החלבון בדרך כלל הכי חסר.',ja:'まず朝食から。朝はタンパク質が不足しがちです。',ko:'아침부터 시작하기: 보통 아침에 단백질이 가장 부족합니다.'}] },
    { key:'cool', cover:['sleep','hf'], metrics:['sleepHours','hf'],
      t:{ru:'Прохладная спальня',uk:'Прохолодна спальня',en:'A cool bedroom',es:'Dormitorio fresco',de:'Kühles Schlafzimmer',pt:'Quarto fresco',fr:'Chambre fraîche',pl:'Chłodna sypialnia',it:'Camera fresca',he:'חדר שינה קריר',ja:'涼しい寝室',ko:'서늘한 침실'},
      s:[{ru:'Спальня прохладная и тёмная.',uk:'Спальня прохолодна й темна.',en:'Keep the bedroom cool and dark.',es:'Dormitorio fresco y oscuro.',de:'Schlafzimmer kühl und dunkel halten.',pt:'Quarto fresco e escuro.',fr:'Chambre fraîche et sombre.',pl:'Sypialnia chłodna i ciemna.',it:'Camera fresca e buia.',he:'חדר שינה קריר וחשוך.',ja:'寝室は涼しく、暗くする。',ko:'침실은 서늘하고 어둡게.'},
         {ru:'Постель и одежда для сна — из дышащих тканей, слоями.',uk:'Постіль і одяг для сну — з дихаючих тканин, шарами.',en:'Bedding and sleepwear in breathable fabrics, in layers.',es:'Ropa de cama y de dormir de tejidos transpirables, por capas.',de:'Bettwäsche und Schlafkleidung aus atmungsaktiven Stoffen, in Schichten.',pt:'Roupa de cama e de dormir em tecidos respiráveis, em camadas.',fr:'Literie et vêtements de nuit en tissus respirants, en couches.',pl:'Pościel i ubranie do snu z oddychających tkanin, warstwami.',it:'Lenzuola e abiti da notte in tessuti traspiranti, a strati.',he:'מצעים ובגדי שינה מבדים נושמים, בשכבות.',ja:'寝具と寝間着は通気性のよい素材を重ねて。',ko:'침구와 잠옷은 통기성 좋은 소재로, 겹쳐서.'}] },
    { key:'walk', cover:['energy','weight'], metrics:['energy'],
      t:{ru:'Ходьба после еды',uk:'Ходьба після їжі',en:'A walk after meals',es:'Caminar después de comer',de:'Gehen nach dem Essen',pt:'Caminhar após as refeições',fr:'Marcher après les repas',pl:'Spacer po posiłku',it:'Camminare dopo i pasti',he:'הליכה אחרי האוכל',ja:'食後に歩く',ko:'식후 걷기'},
      s:[{ru:'10–15 минут ходьбы после основных приёмов пищи.',uk:'10–15 хвилин ходьби після основних прийомів їжі.',en:'A 10–15 minute walk after main meals.',es:'10–15 minutos de paseo después de las comidas principales.',de:'10–15 Minuten Gehen nach den Hauptmahlzeiten.',pt:'10–15 minutos de caminhada após as refeições principais.',fr:'10 à 15 minutes de marche après les repas principaux.',pl:'10–15 minut spaceru po głównych posiłkach.',it:'10–15 minuti di camminata dopo i pasti principali.',he:'10–15 דקות הליכה אחרי הארוחות העיקריות.',ja:'主な食事のあとに10〜15分歩く。',ko:'주요 식사 후 10–15분 걷기.'}] },
    { key:'breath', cover:['hf'], metrics:['hf','stress'],
      t:{ru:'Медленное дыхание',uk:'Повільне дихання',en:'Slow breathing',es:'Respiración lenta',de:'Langsames Atmen',pt:'Respiração lenta',fr:'Respiration lente',pl:'Powolne oddychanie',it:'Respirazione lenta',he:'נשימה איטית',ja:'ゆっくりした呼吸',ko:'느린 호흡'},
      s:[{ru:'5–10 минут медленного дыхания в день, удобнее вечером.',uk:'5–10 хвилин повільного дихання на день, зручніше ввечері.',en:'5–10 minutes of slow breathing a day, easiest in the evening.',es:'5–10 minutos de respiración lenta al día, mejor por la noche.',de:'5–10 Minuten langsames Atmen pro Tag, am besten abends.',pt:'5–10 minutos de respiração lenta por dia, de preferência à noite.',fr:'5 à 10 minutes de respiration lente par jour, plutôt le soir.',pl:'5–10 minut powolnego oddychania dziennie, najwygodniej wieczorem.',it:'5–10 minuti di respirazione lenta al giorno, meglio la sera.',he:'5–10 דקות של נשימה איטית ביום, הכי נוח בערב.',ja:'1日5〜10分、ゆっくり呼吸する。夜が続けやすい。',ko:'하루 5–10분 느린 호흡, 저녁이 하기 좋습니다.'}] },
    { key:'bed', cover:['sleep'], metrics:['sleepHours'],
      t:{ru:'Кровать только для сна',uk:'Ліжко лише для сну',en:'Bed is for sleep only',es:'La cama, solo para dormir',de:'Das Bett nur zum Schlafen',pt:'A cama só para dormir',fr:'Le lit uniquement pour dormir',pl:'Łóżko tylko do spania',it:'Il letto solo per dormire',he:'המיטה רק לשינה',ja:'ベッドは眠るためだけに',ko:'침대는 잠잘 때만'},
      s:[{ru:'Не лежать без сна: не спится — встать и вернуться, когда клонит в сон.',uk:'Не лежати без сну: не спиться — встати й повернутися, коли хилить на сон.',en:'Don’t lie awake: if sleep doesn’t come, get up and return when you feel sleepy.',es:'No te quedes en la cama sin dormir: si no llega el sueño, levántate y vuelve cuando lo tengas.',de:'Nicht wach liegen bleiben: Kommt der Schlaf nicht, aufstehen und zurückkehren, wenn du müde wirst.',pt:'Não fique na cama sem dormir: se o sono não vem, levante-se e volte quando ele chegar.',fr:'Ne pas rester éveillé au lit : si le sommeil ne vient pas, se lever et revenir quand il arrive.',pl:'Nie leż bez snu: jeśli sen nie przychodzi, wstań i wróć, gdy poczujesz senność.',it:'Non restare a letto sveglio: se il sonno non arriva, alzati e torna quando arriva.',he:'לא לשכב ערים: אם השינה לא מגיעה — לקום ולחזור כשמתחילים להירדם.',ja:'眠れないまま横にならない。眠れないときは起きて、眠くなってから戻る。',ko:'잠이 안 올 때 누워 있지 않기: 일어났다가 졸릴 때 다시 눕기.'},
         {ru:'В постели не работать и не листать телефон.',uk:'У ліжку не працювати й не гортати телефон.',en:'No work and no phone scrolling in bed.',es:'En la cama, ni trabajo ni móvil.',de:'Im Bett nicht arbeiten und nicht am Handy scrollen.',pt:'Na cama, nada de trabalho nem de celular.',fr:'Au lit, ni travail ni téléphone.',pl:'W łóżku nie pracuj i nie przeglądaj telefonu.',it:'A letto niente lavoro e niente telefono.',he:'במיטה לא עובדים ולא גוללים בטלפון.',ja:'ベッドでは仕事もスマホもしない。',ko:'침대에서는 일도, 휴대폰도 하지 않기.'}] },
    { key:'order', cover:['weight'], metrics:['energy'],
      t:{ru:'Овощи и белок раньше углеводов',uk:'Овочі та білок раніше вуглеводів',en:'Vegetables and protein before carbs',es:'Verduras y proteína antes que los carbohidratos',de:'Gemüse und Eiweiß vor den Kohlenhydraten',pt:'Vegetais e proteína antes dos carboidratos',fr:'Légumes et protéines avant les glucides',pl:'Warzywa i białko przed węglowodanami',it:'Verdure e proteine prima dei carboidrati',he:'ירקות וחלבון לפני הפחמימות',ja:'野菜とタンパク質を炭水化物より先に',ko:'채소와 단백질을 탄수화물보다 먼저'},
      s:[{ru:'Начинать еду с овощей и белка, углеводы — после.',uk:'Починати їжу з овочів і білка, вуглеводи — після.',en:'Start the meal with vegetables and protein; carbs come after.',es:'Empieza la comida por las verduras y la proteína; los carbohidratos, después.',de:'Die Mahlzeit mit Gemüse und Eiweiß beginnen, Kohlenhydrate danach.',pt:'Comece a refeição pelos vegetais e pela proteína; os carboidratos depois.',fr:'Commencer le repas par les légumes et les protéines, les glucides ensuite.',pl:'Zaczynaj posiłek od warzyw i białka, węglowodany na końcu.',it:'Inizia il pasto con verdure e proteine; i carboidrati dopo.',he:'להתחיל את הארוחה בירקות ובחלבון, פחמימות אחר כך.',ja:'食事は野菜とタンパク質から始め、炭水化物はそのあとに。',ko:'식사는 채소와 단백질부터, 탄수화물은 그다음에.'}] }
  ];

  function byKey(k){ for (var i = 0; i < LEVERS.length; i++) if (LEVERS[i].key === k) return LEVERS[i]; return null; }
  function tx(o, lang){ return (o && (o[lang] || o.en || o.ru)) || ''; }
  function arr(a){ return Array.isArray(a) ? a.map(String) : []; }

  // Сколько весит рычаг для этого человека: главная жалоба — 2, «также беспокоит» — 1.
  // Короткий сон по прибору (меньше 6,5 ч) добавляет балл рычагам сна: состояние тоже участвует в выборе.
  function score(L, o){
    var main = arr(o.main), also = arr(o.also), s = 0;
    L.cover.forEach(function(c){ if (main.indexOf(c) >= 0) s += 2; else if (also.indexOf(c) >= 0) s += 1; });
    var sh = o.state && Number(o.state.sleepHours);
    if (s > 0 && isFinite(sh) && sh > 0 && sh < 6.5 && L.cover.indexOf('sleep') >= 0) s += 1;
    return s;
  }

  // Фокус недели. o: {main:[], also:[], tried:[], state:{sleepHours}}. Возвращает ключ рычага или null,
  // когда подходящих рычагов не осталось (всё, что закрывает его жалобы, уже пробовали) → к специалисту.
  function pick(o){
    o = o || {};
    var tried = arr(o.tried), best = null, bestS = 0;
    LEVERS.forEach(function(L){                       // порядок LEVERS = приоритет при равном счёте
      if (tried.indexOf(L.key) >= 0) return;
      var s = score(L, o);
      if (s > bestS) { best = L.key; bestS = s; }
    });
    return best;
  }
  // Сколько подходящих рычагов ещё не пробовали — нужно решению «следующий или к специалисту».
  function left(o){
    o = o || {}; var tried = arr(o.tried);
    return LEVERS.filter(function(L){ return tried.indexOf(L.key) < 0 && score(L, o) > 0; }).length;
  }

  // Решение недели. o: {prev:{жалоба:0–10}, now:{…}, main:[], done:дней с отметкой «получилось», left:число, flag:bool}.
  //   start — сравнивать не с чем (первая оценка);
  //   up    — к специалисту: тревожный признак, жалоба выросла на 2 пункта или рычаги кончились;
  //   keep  — стало легче: главная жалоба снизилась на 2 пункта → закрепляем фокус;
  //   stay  — шаг выполнялся меньше 5 дней из 7 → остаёмся;
  //   next  — делал, но не сдвинулось → следующий рычаг.
  // Пороги (2 пункта из 10; 5 дней из 7) утверждены владельцем и Мариной 2026-10-02.
  function decide(o){
    o = o || {};
    if (o.flag) return 'up';
    var main = arr(o.main), prev = o.prev || {}, now = o.now || {}, cmp = 0, rose = false, fell = false;
    main.forEach(function(k){
      var a = Number(prev[k]), b = Number(now[k]);
      if (prev[k] == null || now[k] == null || !isFinite(a) || !isFinite(b)) return;
      cmp++; if (b - a >= 2) rose = true; if (a - b >= 2) fell = true;
    });
    if (!cmp) return 'start';
    if (rose) return 'up';
    if (fell) return 'keep';
    if ((Number(o.done) || 0) < 5) return 'stay';
    return (Number(o.left) || 0) > 0 ? 'next' : 'up';
  }

  // ── БЛОК «ФОКУС НЕДЕЛИ» НА ЭКРАНЕ «СЕГОДНЯ» ─────────────────────────────────────────────────
  // Отдельный бирюзовый блок между разбором дня и памяткой (решение владельца и Марины 2026-10-02):
  // отметка нужна каждый день, а в свёрнутой главе памятки её не видно. Состояния блока:
  //   base   — жалобы отмечены, оценок ещё нет: просим оценить каждую, после этого стартует фокус;
  //   run    — фокус идёт: шаги, отметка дня, семь точек недели;
  //   score  — неделя прошла: просим оценить жалобы снова;
  //   result — итог недели: состояние «до → после», жалобы «было → стало», решение кода;
  //   up     — рычаги пройдены или стало хуже: дальше специалист.
  // Сюда приходит готовое состояние (считает страница), функция только рисует. Цвета — токены страницы.
  var ACC = '90,196,178';
  var UI = {
    title:{ru:'Фокус недели',uk:'Фокус тижня',en:'Focus of the week',es:'Foco de la semana',de:'Fokus der Woche',pt:'Foco da semana',fr:'Focus de la semaine',pl:'Fokus tygodnia',it:'Focus della settimana',he:'המיקוד של השבוע',ja:'今週のフォーカス',ko:'이번 주 포커스'},
    day:{ru:'день {d} из 7',uk:'день {d} із 7',en:'day {d} of 7',es:'día {d} de 7',de:'Tag {d} von 7',pt:'dia {d} de 7',fr:'jour {d} sur 7',pl:'dzień {d} z 7',it:'giorno {d} di 7',he:'יום {d} מתוך 7',ja:'7日中{d}日目',ko:'7일 중 {d}일째'},
    what:{ru:'Что делаем',uk:'Що робимо',en:'What we do',es:'Qué hacemos',de:'Was wir tun',pt:'O que fazemos',fr:'Ce que l’on fait',pl:'Co robimy',it:'Cosa facciamo',he:'מה עושים',ja:'取り組むこと',ko:'할 일'},
    helps:{ru:'Помогает с:',uk:'Допомагає з:',en:'Helps with:',es:'Ayuda con:',de:'Hilft bei:',pt:'Ajuda com:',fr:'Aide pour :',pl:'Pomaga na:',it:'Aiuta con:',he:'עוזר עם:',ja:'関係する項目：',ko:'도움이 되는 항목:'},
    did:{ru:'Сегодня получилось',uk:'Сьогодні вдалося',en:'Done today',es:'Hoy lo logré',de:'Heute geschafft',pt:'Hoje consegui',fr:'Fait aujourd’hui',pl:'Dziś się udało',it:'Oggi fatto',he:'היום הצליח',ja:'今日はできた',ko:'오늘 했어요'},
    didnt:{ru:'Не вышло',uk:'Не вийшло',en:'Not today',es:'Hoy no',de:'Heute nicht',pt:'Hoje não',fr:'Pas aujourd’hui',pl:'Nie wyszło',it:'Oggi no',he:'לא היום',ja:'今日はできなかった',ko:'오늘은 못 했어요'},
    cards:{ru:'По вашим жалобам',uk:'За вашими скаргами',en:'About what bothers you',es:'Sobre lo que te preocupa',de:'Zu deinen Beschwerden',pt:'Sobre o que incomoda',fr:'Sur ce qui vous gêne',pl:'O tym, co Ci dokucza',it:'Su ciò che ti dà fastidio',he:'על מה שמטריד',ja:'気になることについて',ko:'불편한 점에 대하여'},
    baseQ:{ru:'Чтобы через неделю увидеть изменение, отметьте, насколько каждое беспокоит сейчас: 0 — не беспокоит, 10 — сильно.',uk:'Щоб через тиждень побачити зміну, позначте, наскільки кожне турбує зараз: 0 — не турбує, 10 — сильно.',en:'To see the change in a week, mark how much each one bothers you now: 0 — not at all, 10 — a lot.',es:'Para ver el cambio en una semana, marca cuánto te preocupa cada cosa ahora: 0 — nada, 10 — mucho.',de:'Damit die Veränderung in einer Woche sichtbar wird, markiere, wie sehr dich jedes jetzt belastet: 0 — gar nicht, 10 — stark.',pt:'Para ver a mudança em uma semana, marque quanto cada item incomoda agora: 0 — nada, 10 — muito.',fr:'Pour voir le changement dans une semaine, indiquez à quel point chaque point vous gêne maintenant : 0 — pas du tout, 10 — beaucoup.',pl:'Aby za tydzień zobaczyć zmianę, zaznacz, jak bardzo każda rzecz dokucza teraz: 0 — wcale, 10 — bardzo.',it:'Per vedere il cambiamento tra una settimana, segna quanto ti dà fastidio ogni punto adesso: 0 — per niente, 10 — molto.',he:'כדי לראות את השינוי בעוד שבוע, סמנו עד כמה כל דבר מטריד עכשיו: 0 — בכלל לא, 10 — מאוד.',ja:'1週間後に変化を見るために、いまそれぞれがどのくらい気になるかを選んでください。0＝気にならない、10＝とても気になる。',ko:'일주일 뒤 변화를 보기 위해, 지금 각각 얼마나 불편한지 표시하세요: 0 — 전혀, 10 — 매우.'},
    weekQ:{ru:'Неделя прошла. Отметьте, насколько каждое беспокоит сейчас: 0 — не беспокоит, 10 — сильно.',uk:'Тиждень минув. Позначте, наскільки кожне турбує зараз: 0 — не турбує, 10 — сильно.',en:'A week has passed. Mark how much each one bothers you now: 0 — not at all, 10 — a lot.',es:'Ha pasado una semana. Marca cuánto te preocupa cada cosa ahora: 0 — nada, 10 — mucho.',de:'Eine Woche ist vorbei. Markiere, wie sehr dich jedes jetzt belastet: 0 — gar nicht, 10 — stark.',pt:'Passou uma semana. Marque quanto cada item incomoda agora: 0 — nada, 10 — muito.',fr:'Une semaine est passée. Indiquez à quel point chaque point vous gêne maintenant : 0 — pas du tout, 10 — beaucoup.',pl:'Minął tydzień. Zaznacz, jak bardzo każda rzecz dokucza teraz: 0 — wcale, 10 — bardzo.',it:'È passata una settimana. Segna quanto ti dà fastidio ogni punto adesso: 0 — per niente, 10 — molto.',he:'עבר שבוע. סמנו עד כמה כל דבר מטריד עכשיו: 0 — בכלל לא, 10 — מאוד.',ja:'1週間が経ちました。いまそれぞれがどのくらい気になるかを選んでください。0＝気にならない、10＝とても気になる。',ko:'일주일이 지났습니다. 지금 각각 얼마나 불편한지 표시하세요: 0 — 전혀, 10 — 매우.'},
    res:{ru:'Итог недели',uk:'Підсумок тижня',en:'Week result',es:'Resultado de la semana',de:'Ergebnis der Woche',pt:'Resultado da semana',fr:'Bilan de la semaine',pl:'Wynik tygodnia',it:'Risultato della settimana',he:'סיכום השבוע',ja:'今週の結果',ko:'이번 주 결과'},
    state:{ru:'Состояние',uk:'Стан',en:'Your state',es:'Estado',de:'Zustand',pt:'Estado',fr:'État',pl:'Stan',it:'Stato',he:'מצב',ja:'状態',ko:'상태'},
    bother:{ru:'Что беспокоит',uk:'Що турбує',en:'What bothers you',es:'Qué te preocupa',de:'Was dich belastet',pt:'O que incomoda',fr:'Ce qui vous gêne',pl:'Co dokucza',it:'Cosa dà fastidio',he:'מה מטריד',ja:'気になること',ko:'불편한 점'},
    kept:{ru:'Шаг выполнен: {k} дн. из {n}',uk:'Крок виконано: {k} дн. із {n}',en:'Step done on {k} of {n} days',es:'Paso cumplido: {k} de {n} días',de:'Schritt umgesetzt: {k} von {n} Tagen',pt:'Passo cumprido: {k} de {n} dias',fr:'Étape réalisée : {k} jours sur {n}',pl:'Krok wykonany: {k} z {n} dni',it:'Passo fatto: {k} giorni su {n}',he:'הצעד בוצע: {k} מתוך {n} ימים',ja:'実行できた日：{n}日中{k}日',ko:'실천한 날: {n}일 중 {k}일'},
    v_keep:{ru:'Стало легче — закрепляем фокус ещё на неделю.',uk:'Стало легше — закріплюємо фокус ще на тиждень.',en:'It got easier — we keep this focus for another week.',es:'Ha mejorado: mantenemos este foco una semana más.',de:'Es ist leichter geworden — wir halten den Fokus eine weitere Woche.',pt:'Ficou mais leve — mantemos este foco por mais uma semana.',fr:'C’est plus léger — on garde ce focus une semaine de plus.',pl:'Jest lżej — utrzymujemy ten fokus jeszcze przez tydzień.',it:'Va meglio — manteniamo questo focus un’altra settimana.',he:'נהיה קל יותר — ממשיכים עם המיקוד הזה עוד שבוע.',ja:'楽になっています — このフォーカスをもう1週間続けます。',ko:'한결 나아졌습니다 — 이 포커스를 한 주 더 이어갑니다.'},
    v_done:{ru:'Стало легче, шаг закрепился — добавляем следующий.',uk:'Стало легше, крок закріпився — додаємо наступний.',en:'It got easier and the step has settled — we add the next one.',es:'Ha mejorado y el paso ya es un hábito: añadimos el siguiente.',de:'Es ist leichter und der Schritt sitzt — wir nehmen den nächsten dazu.',pt:'Ficou mais leve e o passo se firmou — acrescentamos o próximo.',fr:'C’est plus léger et l’étape est installée — on ajoute la suivante.',pl:'Jest lżej, a krok się utrwalił — dodajemy następny.',it:'Va meglio e il passo si è consolidato — aggiungiamo il successivo.',he:'נהיה קל יותר והצעד התבסס — מוסיפים את הבא.',ja:'楽になり、このステップも定着しました — 次のステップを加えます。',ko:'한결 나아졌고 이 단계가 자리 잡았습니다 — 다음 단계를 더합니다.'},
    v_stay:{ru:'Шаг пока не вошёл в привычку — остаёмся на нём ещё неделю.',uk:'Крок поки не став звичкою — залишаємося на ньому ще тиждень.',en:'The step hasn’t become a habit yet — we stay with it for another week.',es:'El paso aún no es un hábito: seguimos con él una semana más.',de:'Der Schritt ist noch keine Gewohnheit — wir bleiben eine weitere Woche dabei.',pt:'O passo ainda não virou hábito — ficamos nele por mais uma semana.',fr:'L’étape n’est pas encore une habitude — on y reste une semaine de plus.',pl:'Krok nie wszedł jeszcze w nawyk — zostajemy przy nim kolejny tydzień.',it:'Il passo non è ancora un’abitudine — ci restiamo un’altra settimana.',he:'הצעד עוד לא הפך להרגל — נשארים איתו עוד שבוע.',ja:'このステップはまだ習慣になっていません — もう1週間続けます。',ko:'이 단계가 아직 습관이 되지 않았습니다 — 한 주 더 이어갑니다.'},
    v_next:{ru:'Шаг выполнялся, но оценки не сдвинулись — пробуем следующий.',uk:'Крок виконувався, але оцінки не зрушили — пробуємо наступний.',en:'The step was done, but the scores didn’t move — we try the next one.',es:'El paso se cumplió, pero las valoraciones no cambiaron: probamos el siguiente.',de:'Der Schritt wurde umgesetzt, aber die Werte haben sich nicht bewegt — wir probieren den nächsten.',pt:'O passo foi cumprido, mas as avaliações não mudaram — tentamos o próximo.',fr:'L’étape a été réalisée, mais les notes n’ont pas bougé — on essaie la suivante.',pl:'Krok był wykonywany, ale oceny się nie zmieniły — próbujemy następnego.',it:'Il passo è stato fatto, ma i punteggi non si sono mossi — proviamo il successivo.',he:'הצעד בוצע, אבל הציונים לא זזו — מנסים את הבא.',ja:'ステップは実行できましたが、評価は変わりませんでした — 次のステップを試します。',ko:'단계를 실천했지만 점수가 움직이지 않았습니다 — 다음 단계를 시도합니다.'},
    v_up:{ru:'То, что можно сделать самостоятельно, сделано. Дальше это стоит обсудить со специалистом или врачом.',uk:'Те, що можна зробити самостійно, зроблено. Далі це варто обговорити з фахівцем або лікарем.',en:'What can be done on your own has been done. From here, it’s worth discussing with a specialist or a doctor.',es:'Lo que se puede hacer por cuenta propia ya está hecho. A partir de aquí conviene hablarlo con un especialista o con tu médico.',de:'Was sich selbst tun lässt, ist getan. Ab hier lohnt sich das Gespräch mit einer Fachperson oder Ärztin bzw. einem Arzt.',pt:'O que dá para fazer por conta própria já foi feito. Daqui em diante vale conversar com um especialista ou médico.',fr:'Ce qui peut se faire seul a été fait. La suite mérite d’être discutée avec un spécialiste ou un médecin.',pl:'To, co można zrobić samodzielnie, zostało zrobione. Dalej warto omówić to ze specjalistą lub lekarzem.',it:'Ciò che si può fare da soli è stato fatto. Da qui conviene parlarne con uno specialista o un medico.',he:'מה שאפשר לעשות לבד — נעשה. מכאן כדאי לשוחח על כך עם איש מקצוע או רופא/ה.',ja:'ご自身でできることは実行済みです。ここからは専門家や医師に相談する価値があります。',ko:'스스로 할 수 있는 일은 다 했습니다. 이제는 전문가나 의사와 상의해 볼 만합니다.'},
    next:{ru:'Дальше',uk:'Далі',en:'Next',es:'Lo siguiente',de:'Als Nächstes',pt:'A seguir',fr:'Ensuite',pl:'Dalej',it:'Poi',he:'הלאה',ja:'次へ',ko:'다음'},
    go:{ru:'Продолжить',uk:'Продовжити',en:'Continue',es:'Continuar',de:'Weiter',pt:'Continuar',fr:'Continuer',pl:'Kontynuuj',it:'Continua',he:'להמשיך',ja:'続ける',ko:'계속하기'},
    ask:{ru:'Обсудить со специалистом',uk:'Обговорити з фахівцем',en:'Discuss with your specialist',es:'Hablarlo con tu especialista',de:'Mit deiner Fachperson besprechen',pt:'Conversar com seu especialista',fr:'En parler à votre spécialiste',pl:'Omów ze specjalistą',it:'Parlane con il tuo specialista',he:'לדבר עם איש המקצוע שלך',ja:'担当の専門家に相談する',ko:'담당 전문가와 상의하기'},
    month:{ru:'Итог месяца от VIA-L',uk:'Підсумок місяця від VIA-L',en:'VIA-L review of the month',es:'Resumen del mes de VIA-L',de:'VIA-L-Auswertung des Monats',pt:'Resumo do mês do VIA-L',fr:'Bilan du mois par VIA-L',pl:'Podsumowanie miesiąca od VIA-L',it:'Bilancio del mese di VIA-L',he:'סיכום החודש של VIA-L',ja:'VIA-Lの今月のまとめ',ko:'VIA-L 월간 정리'},
    monthRows:{ru:'За месяц',uk:'За місяць',en:'Over the month',es:'En el mes',de:'Im Monat',pt:'No mês',fr:'Sur le mois',pl:'W ciągu miesiąca',it:'Nel mese',he:'במהלך החודש',ja:'この1か月',ko:'한 달 동안'},
    review:{ru:'Разбор недели от VIA-L',uk:'Розбір тижня від VIA-L',en:'VIA-L review of the week',es:'Análisis de la semana de VIA-L',de:'VIA-L-Auswertung der Woche',pt:'Análise da semana do VIA-L',fr:'Analyse de la semaine par VIA-L',pl:'Analiza tygodnia od VIA-L',it:'Analisi della settimana di VIA-L',he:'סקירת השבוע של VIA-L',ja:'VIA-Lの今週のレビュー',ko:'VIA-L 주간 리뷰'}
  };
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  var CAP = 'font-family:var(--font-ui);font-size:var(--fs-cap);font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px;';
  function box(kind, label, body){
    var st = kind === 'do'  ? 'background:rgba(' + ACC + ',.09);border:1px solid rgba(' + ACC + ',.32);'
           : kind === 'res' ? 'background:rgba(226,185,90,.08);border:1px solid rgba(226,185,90,.30);'
           :                  'background:var(--surface);border:1px solid var(--b1);';
    var col = kind === 'do' ? 'rgb(' + ACC + ')' : kind === 'res' ? 'var(--gold-lt)' : 'var(--t3)';
    return '<div style="border-radius:12px;padding:11px 12px;margin-top:10px;' + st + '">'
      + (label ? '<div style="' + CAP + 'color:' + col + ';">' + esc(label) + '</div>' : '') + body + '</div>';
  }
  function line(s){ return '<div style="font-size:var(--fs-body);color:var(--t2);line-height:1.5;padding:2px 0;">' + esc(s) + '</div>'; }
  function pair(name, val, tone){
    return '<div style="display:flex;justify-content:space-between;gap:10px;font-size:var(--fs-body);padding:3px 0;font-variant-numeric:tabular-nums;">'
      + '<span style="color:var(--t2);min-width:0;">' + esc(name) + '</span>'
      + '<span style="font-weight:600;white-space:nowrap;color:' + (tone === 'dn' ? 'var(--ok)' : tone === 'up' ? 'var(--alert)' : 'var(--t1)') + ';">' + esc(val) + '</span></div>';
  }
  // Ряды «оцените 0–10» по каждой жалобе. rows: [{key,title,val,prev}]
  function scoreRows(rows){
    return (rows || []).map(function(r){
      var b = '';
      for (var n = 0; n <= 10; n++) {
        var on = (r.val === n);
        b += '<button type="button" onclick="_cmpScoreBy(\'' + esc(r.key) + '\',' + n + ')" style="min-width:28px;padding:6px 0;border-radius:9px;font-size:var(--fs-cap);font-family:inherit;cursor:pointer;text-align:center;'
          + (on ? 'border:1px solid rgb(' + ACC + ');background:rgb(' + ACC + ');color:#0e1413;font-weight:700;' : 'border:1px solid rgba(' + ACC + ',.36);background:transparent;color:var(--t1);') + '">' + n + '</button>';
      }
      return '<div style="margin-top:10px;"><div style="font-size:var(--fs-body);color:var(--t1);font-weight:600;">' + esc(r.title)
        + (r.prev != null ? ' <span style="font-weight:400;font-size:var(--fs-cap);color:var(--t3);">· ' + esc(r.prev) + '/10</span>' : '') + '</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;">' + b + '</div></div>';
    }).join('');
  }
  // st: {lang, mode, lever, nextLever, day, covers:[названия], marks:[7 × 'yes'|'no'|''], today, scoreRows,
  //      stateRows:[{name,val}], cmpRows:[{title,prev,now}], kept, asked, decision, spec, cards, review:{html,canGen}}
  // Итог месяца — внизу блока в любом состоянии: кнопка, когда пришёл срок, и сам текст в день получения.
  // rows — жалобы «первая оценка за месяц → последняя»: медленные (вес, либидо, мышцы, цикл) видны именно здесь.
  function monthHTML(m, lang){
    if (!m || (!m.canGen && !m.html)) return '';
    var T = function(k){ return tx(UI[k], lang); };
    var rows = (m.rows || []).map(function(r){
      var tone = (r.prev != null && r.now != null) ? (r.now < r.prev ? 'dn' : r.now > r.prev ? 'up' : '') : '';
      return pair(r.title, (r.prev != null ? r.prev + ' → ' : '') + (r.now != null ? r.now : '—'), tone);
    }).join('');
    return '<div style="border-top:1px solid rgba(' + ACC + ',.25);margin-top:14px;padding-top:12px;">'
      + (m.html ? '<div style="' + CAP + 'color:var(--gold-lt);">' + esc(T('month')) + '</div>' + (rows ? box('res', T('monthRows'), rows) : '') + box('more', '', m.html)
                : '<button type="button" id="focusMonthBtn" onclick="_focusMonth()" style="width:100%;padding:9px 10px;border-radius:10px;font-size:var(--fs-body);font-family:inherit;font-weight:600;cursor:pointer;background:transparent;color:var(--t1);border:1px solid rgba(226,185,90,.36);">' + esc(T('month')) + '</button>')
      + '</div>';
  }
  function focusHTML(st){
    st = st || {};
    var h0 = focusMain(st);
    return h0 ? h0 + monthHTML(st.month, st.lang || 'en') : '';
  }
  function focusMain(st){
    var lang = st.lang || 'en', T = function(k){ return tx(UI[k], lang); };
    var L = st.lever ? byKey(st.lever) : null;
    var head = function(title, sub){
      return '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;">'
        + '<div style="font-family:var(--font-ui);font-size:var(--fs-title);font-weight:600;color:rgb(' + ACC + ');">' + esc(title) + '</div>'
        + (sub ? '<div style="font-size:var(--fs-cap);color:var(--t3);white-space:nowrap;">' + esc(sub) + '</div>' : '') + '</div>';
    };
    var cardsLink = st.cards ? '<div onclick="openBpChapter(\'cmp\')" style="margin-top:10px;font-size:var(--fs-body);color:rgb(' + ACC + ');cursor:pointer;">' + esc(T('cards')) + ' ›</div>' : '';
    var askBtn = st.spec ? '<button type="button" class="as-usual" style="display:flex;width:100%;justify-content:center;" onclick="location.href=\'./my-specialist.html?chat=1\'">' + esc(T('ask')) + '</button>' : '';
    var h = '';
    if (st.mode === 'base' || st.mode === 'score') {
      h = head(T('title')) + '<div style="font-size:var(--fs-body);color:var(--t2);line-height:1.5;margin-top:6px;">' + esc(T(st.mode === 'base' ? 'baseQ' : 'weekQ')) + '</div>'
        + scoreRows(st.scoreRows) + cardsLink;
    } else if (st.mode === 'run' && L) {
      var steps = L.s.map(function(x){ return line(tx(x, lang)); }).join('');
      var tags = (st.covers && st.covers.length)
        ? '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px;"><span style="font-size:var(--fs-cap);color:var(--t3);">' + esc(T('helps')) + '</span>'
          + st.covers.map(function(c){ return '<span style="font-size:var(--fs-cap);font-weight:600;color:rgb(' + ACC + ');border:1px solid rgba(' + ACC + ',.36);border-radius:999px;padding:2px 9px;">' + esc(c) + '</span>'; }).join('') + '</div>' : '';
      var dots = '<div style="display:flex;gap:6px;margin-top:10px;">' + (st.marks || []).slice(0, 7).map(function(m, i){
        var s = m === 'yes' ? 'background:rgb(' + ACC + ');color:#0e1413;border:1px solid rgb(' + ACC + ');font-weight:700;'
              : m === 'no'  ? 'background:transparent;color:var(--t3);border:1px dashed rgba(255,255,255,.3);'
              :               'background:transparent;color:var(--t3);border:1px solid rgba(' + ACC + ',.36);';
        return '<span style="width:24px;height:24px;border-radius:50%;font-size:11px;display:flex;align-items:center;justify-content:center;' + s + '">' + (i + 1) + '</span>';
      }).join('') + '</div>';
      var B = function(v, label, on){
        return '<button type="button" onclick="_expMark(\'' + v + '\')" style="flex:1;padding:9px 10px;border-radius:10px;font-size:var(--fs-body);font-family:inherit;font-weight:600;cursor:pointer;'
          + (on ? 'background:rgb(' + ACC + ');color:#0e1413;border:1px solid rgb(' + ACC + ');' : 'background:transparent;color:var(--t1);border:1px solid rgba(' + ACC + ',.36);') + '">' + esc(label) + '</button>';
      };
      h = head(T('title'), T('day').replace('{d}', st.day || 1))
        + '<div style="font-size:var(--fs-body);font-weight:600;color:var(--t1);line-height:1.35;margin-top:6px;">' + esc(tx(L.t, lang)) + '</div>'
        + box('do', T('what'), steps + tags + dots
            + '<div style="display:flex;gap:8px;margin-top:10px;">' + B('yes', T('did'), st.today === 'yes') + B('no', T('didnt'), st.today === 'no') + '</div>')
        + cardsLink;
    } else if (st.mode === 'result') {
      var verdict = T('v_' + (st.decision || 'stay')) || T('v_stay');
      var cmp = (st.cmpRows || []).map(function(r){
        var tone = (r.prev != null && r.now != null) ? (r.now < r.prev ? 'dn' : r.now > r.prev ? 'up' : '') : '';
        return pair(r.title, (r.prev != null ? r.prev + ' → ' : '') + (r.now != null ? r.now : '—'), tone);
      }).join('');
      var stt = (st.stateRows || []).map(function(r){ return pair(r.name, r.val, ''); }).join('');
      var NL = st.nextLever ? byKey(st.nextLever) : null;
      h = head(T('res'))
        + (L ? '<div style="font-size:var(--fs-body);color:var(--t2);line-height:1.4;margin-top:6px;">' + esc(tx(L.t, lang)) + '</div>' : '')
        + '<div style="font-size:var(--fs-cap);color:var(--t3);margin-top:3px;">' + esc(T('kept').replace('{k}', st.kept || 0).replace('{n}', st.asked || 7)) + '</div>'
        + (stt ? box('more', T('state'), stt) : '')
        + (cmp ? box('res', T('bother'), cmp) : '')
        + box('do', T('next'), '<div style="font-size:var(--fs-body);font-weight:600;color:var(--t1);line-height:1.45;">' + esc(verdict) + '</div>'
            + (NL && st.decision !== 'up' ? line(tx(NL.t, lang)) : ''))
        + (st.review && st.review.html ? box('more', T('review'), st.review.html) : '')
        + '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">'
        + (st.review && st.review.canGen ? '<button type="button" id="focusReviewBtn" onclick="_focusReview()" style="flex:1;padding:9px 10px;border-radius:10px;font-size:var(--fs-body);font-family:inherit;font-weight:600;cursor:pointer;background:transparent;color:var(--t1);border:1px solid rgba(226,185,90,.36);">' + esc(T('review')) + '</button>' : '')
        + (st.decision === 'up' ? '' : '<button type="button" onclick="_focusGo()" style="flex:1;padding:9px 10px;border-radius:10px;font-size:var(--fs-body);font-family:inherit;font-weight:600;cursor:pointer;background:rgb(' + ACC + ');color:#0e1413;border:1px solid rgb(' + ACC + ');">' + esc(T('go')) + '</button>')
        + '</div>'
        // «К специалисту» — тоже решение, и его надо принять: без кнопки итог висел бы в блоке бессрочно.
        + (st.decision === 'up' ? '<div style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">' + askBtn
            + '<button type="button" onclick="_focusGo()" style="padding:9px 10px;border-radius:10px;font-size:var(--fs-body);font-family:inherit;font-weight:600;cursor:pointer;background:transparent;color:var(--t1);border:1px solid rgba(' + ACC + ',.36);">' + esc(st.okLabel || 'OK') + '</button></div>' : '') + cardsLink;
    } else if (st.mode === 'up') {
      // Фокуса нет, но разбор недели человеку по-прежнему положен: просить его больше негде.
      var rv = (st.review && st.review.html) ? box('more', T('review'), st.review.html)
             : (st.review && st.review.canGen) ? '<button type="button" id="focusReviewBtn" onclick="_focusReview()" style="width:100%;margin-top:10px;padding:9px 10px;border-radius:10px;font-size:var(--fs-body);font-family:inherit;font-weight:600;cursor:pointer;background:transparent;color:var(--t1);border:1px solid rgba(226,185,90,.36);">' + esc(T('review')) + '</button>' : '';
      h = head(T('title')) + box('res', '', '<div style="font-size:var(--fs-body);font-weight:600;color:var(--t1);line-height:1.45;">' + esc(T('v_up')) + '</div>')
        + rv + (askBtn ? '<div style="margin-top:10px;">' + askBtn + '</div>' : '') + cardsLink;
    } else return '';
    return h;
  }

  window.vialFocusHTML = focusHTML;
  window.vialFocusAcc = ACC;
  window.vialLevers = {
    keys: function(){ return LEVERS.map(function(L){ return L.key; }); },
    cover: function(k){ var L = byKey(k); return L ? L.cover.slice() : []; },
    metrics: function(k){ var L = byKey(k); return L ? L.metrics.slice() : []; },
    text: function(k, lang){ var L = byKey(k); return L ? { title: tx(L.t, lang), steps: L.s.map(function(x){ return tx(x, lang); }) } : null; },
    pick: pick, left: left, decide: decide
  };
})();
