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
   ⚠️ Модуль пока НЕ подключён к странице — это основа; подключение идёт следующими шагами (tasks/TODO.md). */
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

  window.vialLevers = {
    keys: function(){ return LEVERS.map(function(L){ return L.key; }); },
    cover: function(k){ var L = byKey(k); return L ? L.cover.slice() : []; },
    metrics: function(k){ var L = byKey(k); return L ? L.metrics.slice() : []; },
    text: function(k, lang){ var L = byKey(k); return L ? { title: tx(L.t, lang), steps: L.s.map(function(x){ return tx(x, lang); }) } : null; },
    pick: pick, left: left, decide: decide
  };
})();
