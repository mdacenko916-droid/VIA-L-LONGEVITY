/* VIA·L — «Тазовое дно — 12 недель»: тренировка мышц тазового дна при подтекании (2026-11-24, ЧТО-КАК-РЕЗУЛЬТАТ §10.5 п.2).
   Карточка в шаге 3 «Что делать сегодня» (#rdPelvic), под тренировкой дня. Видна женщинам, отметившим в профиле
   «Подтекание при нагрузке или кашле» (support_shift) или «Внезапные позывы / подтекание» (tone_shift).
   При «Тазовая боль или напряжение» (pelvic_tension) программы нет: сжатия могут усилить напряжение → к врачу.

   Опора: Cochrane 2018 (Dumoulin, PMID 30288727) — при стрессовом недержании тренировка тазового дна: излечение
   56% против 6% без лечения; NICE NG123 — не меньше 3 месяцев как первая линия, лучше под наблюдением
   физиотерапевта; ориентир — не меньше 8 сжатий 3 раза в день. Прогрессия по неделям — PROG (держать дольше,
   больше повторов, лёжа → сидя → стоя), с 5-й недели — приём «сжатие перед кашлем».
   Голос — системный голос телефона (как sleep.js), ИИ и сеть не нужны. На устройстве: старт, журнал подходов,
   оценки «насколько беспокоит подтекание» 0–10 на старте и на 4/8/12-й неделе.
   Рамка для сторов: «тренировка», без «лечит» и обещаний. Правишь русский — правь все 12 языков. */
(function () {
  var KEY = 'vial_pelvic';   // { start, log:[{d}], sc:[{w,v}] }
  var PER_DAY = 3;
  // неделя → повторы, держать (с), отдых (с), быстрые, положение
  var PROG = [
    { to: 2,  r: 8,  h: 3,  p: 6,  f: 5,  pos: 'lie' },
    { to: 4,  r: 10, h: 5,  p: 5,  f: 8,  pos: 'lie' },
    { to: 6,  r: 10, h: 8,  p: 8,  f: 10, pos: 'sit' },
    { to: 8,  r: 10, h: 8,  p: 8,  f: 10, pos: 'stand' },
    { to: 12, r: 12, h: 10, p: 10, f: 10, pos: 'stand' }
  ];

  function L() { return (typeof lang !== 'undefined' && lang) ? lang : 'en'; }
  function tr(o) { return (o && (o[L()] || o.en)) || ''; }
  function t(k) { return tr(S[k]); }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function get() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function put(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function prof() { try { return JSON.parse(localStorage.getItem('vialp_profile') || '{}') || {}; } catch (e) { return {}; } }
  function gsm() { var g = prof().gsm; return Array.isArray(g) ? g : []; }
  function male() { return String(prof().gender || '') === 'male'; }
  function leak() { var g = gsm(); return g.indexOf('support_shift') >= 0 || g.indexOf('tone_shift') >= 0; }
  function tension() { return gsm().indexOf('pelvic_tension') >= 0; }
  function dayKey() { try { return (typeof _dayKey === 'function') ? _dayKey() : new Date().toISOString().slice(0, 10); } catch (e) { return ''; } }
  function week() { var s = get(); return s.start ? Math.min(12, Math.floor((Date.now() - s.start) / (7 * 86400000)) + 1) : 1; }
  function lvl(w) { for (var i = 0; i < PROG.length; i++) if (w <= PROG[i].to) return PROG[i]; return PROG[PROG.length - 1]; }
  function today() { var d = dayKey(); return (get().log || []).filter(function (x) { return x.d === d; }).length; }
  // оценка нужна до старта и на 4/8/12-й неделе (раз на каждую контрольную точку)
  function scoreDue() {
    var s = get(), sc = s.sc || [];
    if (!sc.length) return 0;            // базовую просим при первом подходе
    var w = week(), cp = w >= 12 ? 12 : w >= 8 ? 8 : w >= 4 ? 4 : 0;
    if (!cp) return -1;
    return sc.some(function (x) { return x.w >= cp; }) ? -1 : cp;
  }

  // ── строки ×12 (русский — канон) ──
  var S = {
    card_t: {ru:'Тазовое дно — 12 недель',uk:'Тазове дно — 12 тижнів',en:'Pelvic floor — 12 weeks',es:'Suelo pélvico: 12 semanas',de:'Beckenboden — 12 Wochen',pt:'Assoalho pélvico — 12 semanas',fr:'Périnée — 12 semaines',pl:'Dno miednicy — 12 tygodni',it:'Pavimento pelvico — 12 settimane',he:'רצפת האגן — 12 שבועות',ja:'骨盤底 — 12週間',ko:'골반저근 — 12주'},
    sub: {ru:'Тренировка мышц тазового дна при подтекании. 3 раза в день по 2–5 минут, голос ведёт: сжать — держать — отпустить.',uk:'Тренування мʼязів тазового дна при підтіканні. 3 рази на день по 2–5 хвилин, голос веде: стиснути — тримати — відпустити.',en:'Pelvic floor muscle training for leaks. 3 times a day for 2–5 minutes; a voice guides you: squeeze — hold — let go.',es:'Entrenamiento del suelo pélvico para las pérdidas de orina. 3 veces al día, 2–5 minutos; una voz te guía: aprieta, mantén, suelta.',de:'Beckenbodentraining bei Harnverlust. 3-mal täglich 2–5 Minuten; eine Stimme führt: anspannen — halten — lösen.',pt:'Treino do assoalho pélvico para escapes de urina. 3 vezes ao dia, 2–5 minutos; uma voz guia: contrair — segurar — soltar.',fr:'Rééducation du périnée en cas de fuites. 3 fois par jour, 2 à 5 minutes ; une voix vous guide : contracter — tenir — relâcher.',pl:'Trening mięśni dna miednicy przy popuszczaniu. 3 razy dziennie po 2–5 minut; prowadzi głos: napnij — trzymaj — puść.',it:'Allenamento del pavimento pelvico per le perdite. 3 volte al giorno per 2–5 minuti; una voce ti guida: contrai — tieni — rilascia.',he:'אימון שרירי רצפת האגן לדליפת שתן. 3 פעמים ביום, 2–5 דקות; קול מנחה: לכווץ — להחזיק — לשחרר.',ja:'尿もれのための骨盤底筋トレーニング。1日3回、各2〜5分。声がガイドします：締める — キープ — ゆるめる。',ko:'소변이 새는 증상을 위한 골반저근 운동. 하루 3번, 2–5분씩. 목소리가 안내해요: 조이기 — 유지 — 풀기.'},
    info: {ru:'Мышцы тазового дна поддерживают мочевой пузырь. С возрастом, после родов и в менопаузе они слабеют — отсюда подтекание при кашле, смехе, прыжке или внезапный позыв.\n\nКак найти эти мышцы: представьте, что одновременно сдерживаете газы и мочу. Сожмите и чуть подтяните вверх и внутрь. Ягодицы, живот и бёдра расслаблены, дыхание свободное. Не тренируйтесь во время мочеиспускания.\n\nОткуда это: в обзоре Cochrane 2018 женщины с подтеканием при нагрузке, которые тренировали тазовое дно, в 8 раз чаще сообщали, что подтекание прошло (56% против 6% без тренировки). Британское руководство NICE советует тренировку не меньше 3 месяцев как первый шаг — лучше всего с физиотерапевтом тазового дна. Эффект копится 8–12 недель.',uk:'Мʼязи тазового дна підтримують сечовий міхур. З віком, після пологів і в менопаузі вони слабшають — звідси підтікання при кашлі, сміху, стрибку або раптовий позив.\n\nЯк знайти ці мʼязи: уявіть, що одночасно стримуєте гази й сечу. Стисніть і трохи підтягніть угору й усередину. Сідниці, живіт і стегна розслаблені, дихання вільне. Не тренуйтеся під час сечовипускання.\n\nЗвідки це: в огляді Cochrane 2018 жінки з підтіканням при навантаженні, які тренували тазове дно, у 8 разів частіше повідомляли, що підтікання минуло (56% проти 6% без тренування). Британська настанова NICE радить тренування не менше 3 місяців як перший крок — найкраще з фізіотерапевтом тазового дна. Ефект накопичується 8–12 тижнів.',en:'The pelvic floor muscles support the bladder. With age, after childbirth and in menopause they weaken — hence leaks when you cough, laugh or jump, or a sudden urge.\n\nHow to find these muscles: imagine holding in wind and urine at the same time. Squeeze and lift slightly up and in. Keep your buttocks, tummy and thighs relaxed and breathe freely. Don’t practise while passing urine.\n\nWhere this comes from: in a 2018 Cochrane review, women with leaks on exertion who trained their pelvic floor were 8 times more likely to report that the leaks had stopped (56% vs 6% without training). The UK NICE guideline advises at least 3 months of training as the first step — ideally with a pelvic floor physiotherapist. The effect builds over 8–12 weeks.',es:'Los músculos del suelo pélvico sostienen la vejiga. Con la edad, tras los partos y en la menopausia se debilitan: de ahí las pérdidas al toser, reír o saltar, o las ganas repentinas.\n\nCómo encontrar estos músculos: imagina que retienes a la vez los gases y la orina. Aprieta y eleva un poco hacia arriba y hacia dentro. Glúteos, abdomen y muslos relajados, respiración libre. No practiques mientras orinas.\n\nDe dónde sale: en una revisión Cochrane de 2018, las mujeres con pérdidas al hacer esfuerzo que entrenaron el suelo pélvico tuvieron 8 veces más probabilidad de decir que las pérdidas desaparecieron (56% frente a 6% sin entrenamiento). La guía británica NICE recomienda al menos 3 meses de entrenamiento como primer paso, mejor con fisioterapeuta de suelo pélvico. El efecto se acumula en 8–12 semanas.',de:'Die Beckenbodenmuskeln stützen die Blase. Mit dem Alter, nach Geburten und in den Wechseljahren werden sie schwächer — daher Harnverlust beim Husten, Lachen oder Springen oder plötzlicher Harndrang.\n\nSo finden Sie diese Muskeln: Stellen Sie sich vor, Sie halten gleichzeitig Wind und Urin zurück. Anspannen und leicht nach oben und innen ziehen. Gesäß, Bauch und Oberschenkel bleiben locker, der Atem fließt frei. Nicht beim Wasserlassen üben.\n\nWoher das kommt: In einer Cochrane-Übersicht von 2018 gaben Frauen mit Harnverlust bei Belastung, die ihren Beckenboden trainierten, 8-mal häufiger an, dass der Harnverlust verschwunden war (56 % gegenüber 6 % ohne Training). Die britische NICE-Leitlinie empfiehlt mindestens 3 Monate Training als ersten Schritt — am besten mit einer Beckenboden-Physiotherapeutin. Die Wirkung baut sich über 8–12 Wochen auf.',pt:'Os músculos do assoalho pélvico sustentam a bexiga. Com a idade, depois dos partos e na menopausa, eles enfraquecem — daí os escapes ao tossir, rir ou pular, ou a vontade repentina.\n\nComo encontrar esses músculos: imagine segurar ao mesmo tempo os gases e a urina. Contraia e puxe um pouco para cima e para dentro. Glúteos, barriga e coxas relaxados, respiração livre. Não pratique enquanto urina.\n\nDe onde vem: numa revisão Cochrane de 2018, mulheres com escapes ao fazer esforço que treinaram o assoalho pélvico tiveram 8 vezes mais chance de relatar que os escapes acabaram (56% contra 6% sem treino). A diretriz britânica NICE recomenda pelo menos 3 meses de treino como primeiro passo — de preferência com fisioterapeuta pélvica. O efeito se acumula em 8–12 semanas.',fr:'Les muscles du périnée soutiennent la vessie. Avec l’âge, après les accouchements et à la ménopause, ils s’affaiblissent — d’où des fuites en toussant, en riant ou en sautant, ou une envie soudaine.\n\nComment trouver ces muscles : imaginez retenir à la fois un gaz et l’urine. Contractez et remontez légèrement vers le haut et l’intérieur. Fesses, ventre et cuisses restent détendus, la respiration libre. Ne vous entraînez pas en urinant.\n\nD’où cela vient : dans une revue Cochrane de 2018, les femmes ayant des fuites à l’effort qui entraînaient leur périnée étaient 8 fois plus nombreuses à dire que les fuites avaient cessé (56 % contre 6 % sans entraînement). La recommandation britannique NICE conseille au moins 3 mois d’entraînement comme première étape — idéalement avec un kinésithérapeute spécialisé. L’effet se construit en 8 à 12 semaines.',pl:'Mięśnie dna miednicy podtrzymują pęcherz. Z wiekiem, po porodach i w menopauzie słabną — stąd popuszczanie przy kaszlu, śmiechu, skoku albo nagłe parcie.\n\nJak znaleźć te mięśnie: wyobraź sobie, że jednocześnie wstrzymujesz gazy i mocz. Napnij i lekko unieś do góry i do środka. Pośladki, brzuch i uda rozluźnione, oddech swobodny. Nie ćwicz podczas oddawania moczu.\n\nSkąd to: w przeglądzie Cochrane z 2018 roku kobiety z popuszczaniem przy wysiłku, które trenowały dno miednicy, 8 razy częściej mówiły, że popuszczanie ustąpiło (56% wobec 6% bez treningu). Brytyjskie wytyczne NICE zalecają co najmniej 3 miesiące treningu jako pierwszy krok — najlepiej z fizjoterapeutką uroginekologiczną. Efekt narasta przez 8–12 tygodni.',it:'I muscoli del pavimento pelvico sostengono la vescica. Con l’età, dopo i parti e in menopausa si indeboliscono — da qui le perdite quando tossisci, ridi o salti, o lo stimolo improvviso.\n\nCome trovare questi muscoli: immagina di trattenere contemporaneamente aria e urina. Contrai e solleva un po’ verso l’alto e verso l’interno. Glutei, pancia e cosce rilassati, respiro libero. Non allenarti mentre urini.\n\nDa dove viene: in una revisione Cochrane del 2018, le donne con perdite sotto sforzo che allenavano il pavimento pelvico avevano 8 volte più probabilità di riferire che le perdite erano sparite (56% contro 6% senza allenamento). La linea guida britannica NICE consiglia almeno 3 mesi di allenamento come primo passo — meglio con una fisioterapista del pavimento pelvico. L’effetto si accumula in 8–12 settimane.',he:'שרירי רצפת האגן תומכים בשלפוחית. עם הגיל, אחרי לידות ובגיל המעבר הם נחלשים — ומכאן דליפה בשיעול, צחוק או קפיצה, או דחיפות פתאומית.\n\nאיך למצוא את השרירים: דמייני שאת עוצרת בו־זמנית גזים ושתן. כווצי ומשכי מעט למעלה ופנימה. הישבן, הבטן והירכיים רפויים, הנשימה חופשית. לא להתאמן בזמן מתן שתן.\n\nמאין זה: בסקירת Cochrane מ־2018, נשים עם דליפה במאמץ שאימנו את רצפת האגן דיווחו פי 8 יותר שהדליפה חלפה (56% לעומת 6% בלי אימון). ההנחיה הבריטית NICE ממליצה על אימון של 3 חודשים לפחות כצעד ראשון — רצוי עם פיזיותרפיסטית לרצפת האגן. ההשפעה מצטברת במשך 8–12 שבועות.',ja:'骨盤底筋は膀胱を支えています。年齢、出産、更年期とともに弱まり、せき・笑い・ジャンプでの尿もれや、急な尿意につながります。\n\n筋肉の見つけ方：おならと尿を同時にがまんするところを想像してください。締めて、少し上と内側へ引き上げます。お尻・お腹・太ももはゆるめ、呼吸は自然に。排尿中には練習しないでください。\n\n根拠：2018年のコクラン・レビューでは、力を入れたときに尿もれがある女性のうち骨盤底筋を鍛えた人は、もれがなくなったと答える割合が8倍高くなりました（トレーニングなし6%に対し56%）。英国NICEガイドラインは、最初のステップとして少なくとも3か月のトレーニングを勧めています — 骨盤底の理学療法士と行うのが理想です。効果は8〜12週間で積み重なります。',ko:'골반저근은 방광을 받쳐 줘요. 나이가 들고, 출산 후, 폐경기에 약해지면서 기침·웃음·점프할 때 소변이 새거나 갑자기 급한 느낌이 생겨요.\n\n이 근육 찾는 법: 방귀와 소변을 동시에 참는다고 상상해 보세요. 조이면서 위쪽 안쪽으로 살짝 끌어올려요. 엉덩이·배·허벅지는 힘을 빼고 숨은 편하게 쉬어요. 소변을 보는 중에는 연습하지 마세요.\n\n근거: 2018년 코크란 리뷰에서 힘을 줄 때 소변이 새는 여성 중 골반저근을 훈련한 사람은 증상이 사라졌다고 답한 비율이 8배 높았어요(훈련 없음 6% 대비 56%). 영국 NICE 지침은 첫 단계로 최소 3개월 훈련을 권해요 — 골반저 물리치료사와 함께하면 가장 좋아요. 효과는 8–12주에 걸쳐 쌓여요.'},
    week: {ru:'Неделя {n} из 12',uk:'Тиждень {n} з 12',en:'Week {n} of 12',es:'Semana {n} de 12',de:'Woche {n} von 12',pt:'Semana {n} de 12',fr:'Semaine {n} sur 12',pl:'Tydzień {n} z 12',it:'Settimana {n} di 12',he:'שבוע {n} מתוך 12',ja:'12週中{n}週目',ko:'12주 중 {n}주차'},
    plan: {ru:'{r} сжатий по {h} с, отдых {p} с, затем {f} быстрых · {pos}',uk:'{r} стискань по {h} с, відпочинок {p} с, потім {f} швидких · {pos}',en:'{r} squeezes of {h} s, {p} s rest, then {f} quick ones · {pos}',es:'{r} contracciones de {h} s, {p} s de descanso y luego {f} rápidas · {pos}',de:'{r}-mal {h} s anspannen, {p} s Pause, dann {f} schnelle · {pos}',pt:'{r} contrações de {h} s, {p} s de descanso e depois {f} rápidas · {pos}',fr:'{r} contractions de {h} s, {p} s de repos, puis {f} rapides · {pos}',pl:'{r} napięć po {h} s, {p} s odpoczynku, potem {f} szybkich · {pos}',it:'{r} contrazioni da {h} s, {p} s di pausa, poi {f} rapide · {pos}',he:'{r} כיווצים של {h} שנ׳, {p} שנ׳ מנוחה, ואז {f} מהירים · {pos}',ja:'{h}秒キープ×{r}回、休み{p}秒、そのあと速い締め{f}回 · {pos}',ko:'{h}초 유지 {r}회, {p}초 휴식, 이어서 빠르게 {f}회 · {pos}'},
    lie: {ru:'лёжа',uk:'лежачи',en:'lying down',es:'tumbada',de:'im Liegen',pt:'deitada',fr:'allongée',pl:'na leżąco',it:'sdraiata',he:'בשכיבה',ja:'寝た姿勢で',ko:'누워서'},
    sit: {ru:'сидя',uk:'сидячи',en:'sitting',es:'sentada',de:'im Sitzen',pt:'sentada',fr:'assise',pl:'na siedząco',it:'seduta',he:'בישיבה',ja:'座った姿勢で',ko:'앉아서'},
    stand: {ru:'стоя',uk:'стоячи',en:'standing',es:'de pie',de:'im Stehen',pt:'em pé',fr:'debout',pl:'na stojąco',it:'in piedi',he:'בעמידה',ja:'立った姿勢で',ko:'서서'},
    start: {ru:'Начать подход',uk:'Почати підхід',en:'Start a session',es:'Empezar una serie',de:'Einheit starten',pt:'Começar uma série',fr:'Commencer une série',pl:'Zacznij serię',it:'Inizia una serie',he:'להתחיל סבב',ja:'セットを始める',ko:'세트 시작'},
    today: {ru:'Подходов сегодня: {k} из 3',uk:'Підходів сьогодні: {k} з 3',en:'Sessions today: {k} of 3',es:'Series de hoy: {k} de 3',de:'Einheiten heute: {k} von 3',pt:'Séries hoje: {k} de 3',fr:'Séries aujourd’hui : {k} sur 3',pl:'Serie dziś: {k} z 3',it:'Serie di oggi: {k} su 3',he:'סבבים היום: {k} מתוך 3',ja:'今日のセット：3回中{k}回',ko:'오늘 세트: 3회 중 {k}회'},
    knack: {ru:'Приём «сжатие перед кашлем»: перед кашлем, чихом или подъёмом тяжёлого сожмите мышцы и держите, пока усилие не пройдёт. Так тренировка защищает в ту самую секунду, когда обычно подтекает.',uk:'Прийом «стискання перед кашлем»: перед кашлем, чханням або підйомом важкого стисніть мʼязи й тримайте, поки зусилля не мине. Так тренування захищає саме в ту секунду, коли зазвичай підтікає.',en:'The “squeeze before you cough” trick: before you cough, sneeze or lift something heavy, squeeze the muscles and hold until the effort is over. This way the training protects you at the very moment leaks usually happen.',es:'El truco «apretar antes de toser»: antes de toser, estornudar o levantar algo pesado, aprieta los músculos y mantén hasta que pase el esfuerzo. Así el entrenamiento te protege justo en el momento en que suele haber pérdidas.',de:'Der Trick „Anspannen vor dem Husten“: Vor dem Husten, Niesen oder Heben spannen Sie die Muskeln an und halten, bis die Belastung vorbei ist. So schützt das Training genau in dem Moment, in dem sonst Urin verloren geht.',pt:'O truque «contrair antes de tossir»: antes de tossir, espirrar ou levantar algo pesado, contraia os músculos e segure até o esforço passar. Assim o treino protege justo no momento em que o escape costuma acontecer.',fr:'L’astuce « serrer avant de tousser » : avant de tousser, d’éternuer ou de soulever une charge, contractez le périnée et tenez jusqu’à la fin de l’effort. Ainsi l’entraînement vous protège au moment précis où les fuites surviennent.',pl:'Sposób „napnij przed kaszlem”: przed kaszlem, kichnięciem lub podniesieniem czegoś ciężkiego napnij mięśnie i trzymaj, aż wysiłek minie. Tak trening chroni dokładnie w tej sekundzie, w której zwykle dochodzi do popuszczania.',it:'Il trucco «contrai prima di tossire»: prima di tossire, starnutire o sollevare qualcosa di pesante, contrai i muscoli e tieni finché lo sforzo non è passato. Così l’allenamento ti protegge proprio nel momento in cui di solito ci sono perdite.',he:'הטריק ״לכווץ לפני שיעול״: לפני שיעול, עיטוש או הרמת משהו כבד — כווצי את השרירים והחזיקי עד שהמאמץ עובר. כך האימון מגן בדיוק ברגע שבו בדרך כלל יש דליפה.',ja:'「せきの前に締める」コツ：せき・くしゃみ・重い物を持つ前に筋肉を締め、力が抜けるまでキープします。もれやすいその瞬間をトレーニングが守ってくれます。',ko:'‘기침 전에 조이기’ 요령: 기침·재채기·무거운 것을 들기 전에 근육을 조이고 힘이 끝날 때까지 유지하세요. 이렇게 하면 평소 새는 바로 그 순간을 운동이 지켜 줘요.'},
    score_q: {ru:'Насколько беспокоит подтекание сейчас? 0 — не беспокоит, 10 — сильно.',uk:'Наскільки турбує підтікання зараз? 0 — не турбує, 10 — сильно.',en:'How much do leaks bother you now? 0 — not at all, 10 — a lot.',es:'¿Cuánto te molestan ahora las pérdidas? 0 — nada, 10 — mucho.',de:'Wie sehr belastet Sie der Harnverlust jetzt? 0 — gar nicht, 10 — stark.',pt:'Quanto os escapes incomodam agora? 0 — nada, 10 — muito.',fr:'À quel point les fuites vous gênent-elles maintenant ? 0 — pas du tout, 10 — beaucoup.',pl:'Jak bardzo dokucza teraz popuszczanie? 0 — wcale, 10 — bardzo.',it:'Quanto ti danno fastidio adesso le perdite? 0 — per niente, 10 — molto.',he:'עד כמה הדליפה מטרידה עכשיו? 0 — בכלל לא, 10 — מאוד.',ja:'いま尿もれはどのくらい気になりますか？ 0＝気にならない、10＝とても気になる。',ko:'지금 소변 새는 게 얼마나 불편한가요? 0 — 전혀, 10 — 매우.'},
    score_due: {ru:'Неделя {n}: отметьте, как сейчас — так будет видно, работает ли тренировка.',uk:'Тиждень {n}: позначте, як зараз — так буде видно, чи працює тренування.',en:'Week {n}: mark how things are now — that shows whether the training is working.',es:'Semana {n}: marca cómo estás ahora; así se verá si el entrenamiento funciona.',de:'Woche {n}: Markieren Sie, wie es jetzt ist — so sieht man, ob das Training wirkt.',pt:'Semana {n}: marque como está agora — assim dá para ver se o treino está funcionando.',fr:'Semaine {n} : indiquez où vous en êtes — on verra si l’entraînement fonctionne.',pl:'Tydzień {n}: zaznacz, jak jest teraz — tak zobaczysz, czy trening działa.',it:'Settimana {n}: segna come va adesso — così si vede se l’allenamento funziona.',he:'שבוע {n}: סמני איך עכשיו — כך יראו אם האימון עובד.',ja:'{n}週目：いまの状態を選んでください — トレーニングが効いているかがわかります。',ko:'{n}주차: 지금 상태를 표시하세요 — 운동이 효과가 있는지 볼 수 있어요.'},
    res: {ru:'Подтекание: было {a} → стало {b}',uk:'Підтікання: було {a} → стало {b}',en:'Leaks: before {a} → now {b}',es:'Pérdidas: antes {a} → ahora {b}',de:'Harnverlust: vorher {a} → jetzt {b}',pt:'Escapes: antes {a} → agora {b}',fr:'Fuites : avant {a} → maintenant {b}',pl:'Popuszczanie: było {a} → jest {b}',it:'Perdite: prima {a} → ora {b}',he:'דליפה: היה {a} ← עכשיו {b}',ja:'尿もれ：以前 {a} → いま {b}',ko:'소변 샘: 전 {a} → 지금 {b}'},
    slow: {ru:'Эффект тренировки копится 8–12 недель — первые недели без перемен это нормально.',uk:'Ефект тренування накопичується 8–12 тижнів — перші тижні без змін це нормально.',en:'The effect builds over 8–12 weeks — no change in the first weeks is normal.',es:'El efecto se acumula en 8–12 semanas: que no cambie nada las primeras semanas es normal.',de:'Die Wirkung baut sich über 8–12 Wochen auf — keine Veränderung in den ersten Wochen ist normal.',pt:'O efeito se acumula em 8–12 semanas — não mudar nada nas primeiras semanas é normal.',fr:'L’effet se construit en 8 à 12 semaines — aucun changement les premières semaines, c’est normal.',pl:'Efekt narasta przez 8–12 tygodni — brak zmian w pierwszych tygodniach jest normalny.',it:'L’effetto si accumula in 8–12 settimane — nessun cambiamento nelle prime settimane è normale.',he:'ההשפעה מצטברת במשך 8–12 שבועות — זה נורמלי שבשבועות הראשונים אין שינוי.',ja:'効果は8〜12週間で積み重なります — 最初の数週間に変化がないのは普通です。',ko:'효과는 8–12주에 걸쳐 쌓여요 — 처음 몇 주에 변화가 없어도 정상이에요.'},
    doc_t: {ru:'Когда к врачу',uk:'Коли до лікаря',en:'When to see a doctor',es:'Cuándo ir al médico',de:'Wann zur Ärztin oder zum Arzt',pt:'Quando procurar o médico',fr:'Quand consulter',pl:'Kiedy do lekarza',it:'Quando andare dal medico',he:'מתי לפנות לרופא/ה',ja:'受診したほうがよいとき',ko:'병원에 가야 할 때'},
    doc: {ru:'• кровь в моче, боль или жжение, температура;\n• тяжесть или ощущение «выпадения» внизу;\n• за 12 недель не стало лучше — есть и другие способы помочь, обсудите их с гинекологом или урологом.',uk:'• кров у сечі, біль або печіння, температура;\n• важкість або відчуття «випадання» внизу;\n• за 12 тижнів не стало краще — є й інші способи допомогти, обговоріть їх із гінекологом або урологом.',en:'• blood in the urine, pain or burning, fever;\n• heaviness or a feeling of something “coming down” below;\n• no improvement after 12 weeks — there are other ways to help, discuss them with a gynaecologist or urologist.',es:'• sangre en la orina, dolor o ardor, fiebre;\n• pesadez o sensación de que algo «baja» abajo;\n• sin mejora tras 12 semanas: hay otras formas de ayudar; coméntalas con tu ginecóloga o urólogo.',de:'• Blut im Urin, Schmerzen oder Brennen, Fieber;\n• Schweregefühl oder das Gefühl, dass unten etwas „herauskommt“;\n• nach 12 Wochen keine Besserung — es gibt weitere Hilfen, besprechen Sie sie in der Gynäkologie oder Urologie.',pt:'• sangue na urina, dor ou ardor, febre;\n• peso ou sensação de algo «descendo» embaixo;\n• sem melhora após 12 semanas — há outras formas de ajudar; converse com ginecologista ou urologista.',fr:'• sang dans les urines, douleur ou brûlure, fièvre ;\n• lourdeur ou sensation que quelque chose « descend » ;\n• pas d’amélioration après 12 semaines — il existe d’autres solutions, parlez-en à un gynécologue ou un urologue.',pl:'• krew w moczu, ból lub pieczenie, gorączka;\n• uczucie ciężkości lub „obniżania się” na dole;\n• po 12 tygodniach bez poprawy — są inne sposoby pomocy, omów je z ginekologiem lub urologiem.',it:'• sangue nelle urine, dolore o bruciore, febbre;\n• pesantezza o sensazione che qualcosa «scenda» in basso;\n• nessun miglioramento dopo 12 settimane — ci sono altri modi per aiutare, parlane con ginecologo o urologo.',he:'• דם בשתן, כאב או צריבה, חום;\n• כובד או תחושה ש״משהו יורד״ למטה;\n• אין שיפור אחרי 12 שבועות — יש עוד דרכים לעזור, שוחחי עליהן עם גינקולוג/ית או אורולוג/ית.',ja:'• 尿に血が混じる、痛みや灼熱感、発熱；\n• 下腹部の重さや「下がってくる」感じ；\n• 12週間たっても改善しない — ほかの方法もあるので、婦人科か泌尿器科で相談してください。',ko:'• 소변에 피, 통증이나 화끈거림, 발열;\n• 아래가 묵직하거나 ‘빠져나오는’ 느낌;\n• 12주가 지나도 나아지지 않을 때 — 다른 방법도 있으니 산부인과나 비뇨의학과와 상의하세요.'},
    tension: {ru:'Вы отметили тазовую боль или напряжение. В этом случае упражнения на сжатие могут не помочь, а усилить напряжение. Сначала обсудите это с гинекологом или физиотерапевтом тазового дна — они подскажут, с чего начать.',uk:'Ви позначили тазовий біль або напруження. У такому разі вправи на стискання можуть не допомогти, а посилити напруження. Спершу обговоріть це з гінекологом або фізіотерапевтом тазового дна — вони підкажуть, із чого почати.',en:'You marked pelvic pain or tension. In that case squeezing exercises may not help and can increase the tension. First discuss it with a gynaecologist or a pelvic floor physiotherapist — they’ll tell you where to start.',es:'Has marcado dolor o tensión pélvica. En ese caso, los ejercicios de contracción pueden no ayudar e incluso aumentar la tensión. Coméntalo primero con tu ginecóloga o con una fisioterapeuta de suelo pélvico: te dirán por dónde empezar.',de:'Sie haben Beckenschmerzen oder Anspannung angegeben. Dann helfen Anspannungsübungen womöglich nicht und können die Spannung verstärken. Besprechen Sie das zuerst in der Gynäkologie oder mit einer Beckenboden-Physiotherapeutin — dort erfahren Sie, womit Sie beginnen.',pt:'Você marcou dor ou tensão pélvica. Nesse caso, exercícios de contração podem não ajudar e até aumentar a tensão. Converse primeiro com ginecologista ou fisioterapeuta pélvica — eles dirão por onde começar.',fr:'Vous avez indiqué une douleur ou une tension pelvienne. Dans ce cas, les exercices de contraction risquent de ne pas aider, voire d’augmenter la tension. Parlez-en d’abord à un gynécologue ou à un kinésithérapeute spécialisé du périnée — il vous dira par où commencer.',pl:'Zaznaczyłaś ból lub napięcie w miednicy. Wtedy ćwiczenia napinające mogą nie pomóc, a nawet nasilić napięcie. Najpierw omów to z ginekologiem lub fizjoterapeutką uroginekologiczną — podpowiedzą, od czego zacząć.',it:'Hai segnalato dolore o tensione pelvica. In questo caso gli esercizi di contrazione possono non aiutare e aumentare la tensione. Parlane prima con il ginecologo o con una fisioterapista del pavimento pelvico: ti diranno da dove cominciare.',he:'סימנת כאב או מתח באגן. במקרה כזה תרגילי כיווץ עלולים לא לעזור ואף להגביר את המתח. קודם שוחחי על כך עם גינקולוג/ית או פיזיותרפיסטית לרצפת האגן — הם יגידו ממה להתחיל.',ja:'骨盤の痛みや緊張にチェックがありました。その場合、締める運動は効かないうえ、緊張を強めることがあります。まず婦人科か骨盤底の理学療法士に相談してください — どこから始めるか教えてくれます。',ko:'골반 통증이나 긴장을 표시하셨어요. 이 경우 조이는 운동은 도움이 되지 않고 긴장을 더 키울 수 있어요. 먼저 산부인과나 골반저 물리치료사와 상의하세요 — 어디서부터 시작할지 알려 줄 거예요.'},
    // плеер
    sq: {ru:'Сожмите и подтяните',uk:'Стисніть і підтягніть',en:'Squeeze and lift',es:'Aprieta y eleva',de:'Anspannen und hochziehen',pt:'Contraia e puxe para cima',fr:'Contractez et remontez',pl:'Napnij i unieś',it:'Contrai e solleva',he:'כווצי ומשכי למעלה',ja:'締めて、引き上げて',ko:'조이고 끌어올리세요'},
    hold: {ru:'Держите',uk:'Тримайте',en:'Hold',es:'Mantén',de:'Halten',pt:'Segure',fr:'Tenez',pl:'Trzymaj',it:'Tieni',he:'החזיקי',ja:'キープ',ko:'유지하세요'},
    rel: {ru:'Отпустите',uk:'Відпустіть',en:'Let go',es:'Suelta',de:'Lösen',pt:'Solte',fr:'Relâchez',pl:'Puść',it:'Rilascia',he:'שחררי',ja:'ゆるめて',ko:'풀어 주세요'},
    rest: {ru:'Отдых',uk:'Відпочинок',en:'Rest',es:'Descansa',de:'Pause',pt:'Descanse',fr:'Repos',pl:'Odpoczynek',it:'Riposo',he:'מנוחה',ja:'休憩',ko:'휴식'},
    fast: {ru:'Теперь быстрые: сжать — отпустить',uk:'Тепер швидкі: стиснути — відпустити',en:'Now quick ones: squeeze — let go',es:'Ahora rápidas: aprieta, suelta',de:'Jetzt schnelle: anspannen — lösen',pt:'Agora rápidas: contrai — solta',fr:'Maintenant, des rapides : contracter — relâcher',pl:'Teraz szybkie: napnij — puść',it:'Ora rapide: contrai — rilascia',he:'עכשיו מהירים: לכווץ — לשחרר',ja:'次は速く：締める — ゆるめる',ko:'이제 빠르게: 조이고 — 풀고'},
    q1: {ru:'Сжать',uk:'Стиснути',en:'Squeeze',es:'Aprieta',de:'Anspannen',pt:'Contrai',fr:'Contractez',pl:'Napnij',it:'Contrai',he:'לכווץ',ja:'締めて',ko:'조이고'},
    breath: {ru:'Дышите свободно, ягодицы и живот расслаблены.',uk:'Дихайте вільно, сідниці й живіт розслаблені.',en:'Breathe freely; buttocks and tummy relaxed.',es:'Respira con libertad; glúteos y abdomen relajados.',de:'Frei atmen; Gesäß und Bauch locker.',pt:'Respire livremente; glúteos e barriga relaxados.',fr:'Respirez librement ; fesses et ventre détendus.',pl:'Oddychaj swobodnie; pośladki i brzuch rozluźnione.',it:'Respira liberamente; glutei e pancia rilassati.',he:'נשמי בחופשיות; הישבן והבטן רפויים.',ja:'呼吸は自然に、お尻とお腹はゆるめて。',ko:'숨은 편하게, 엉덩이와 배는 힘을 빼세요.'},
    fin: {ru:'Подход закончен. Хорошая работа.',uk:'Підхід завершено. Гарна робота.',en:'Session done. Well done.',es:'Serie terminada. Buen trabajo.',de:'Einheit geschafft. Gut gemacht.',pt:'Série concluída. Bom trabalho.',fr:'Série terminée. Bravo.',pl:'Seria skończona. Dobra robota.',it:'Serie finita. Ottimo lavoro.',he:'הסבב הסתיים. כל הכבוד.',ja:'セット終了。よくできました。',ko:'세트가 끝났어요. 잘하셨어요.'},
    stop: {ru:'Остановить',uk:'Зупинити',en:'Stop',es:'Detener',de:'Stopp',pt:'Parar',fr:'Arrêter',pl:'Zatrzymaj',it:'Ferma',he:'לעצור',ja:'停止',ko:'정지'},
    close: {ru:'Закрыть',uk:'Закрити',en:'Close',es:'Cerrar',de:'Schließen',pt:'Fechar',fr:'Fermer',pl:'Zamknij',it:'Chiudi',he:'לסגור',ja:'閉じる',ko:'닫기'}
  };

  // ── карточка ──
  var infoOpen = false;
  function card() {
    var box = $('rdPelvic'); if (!box) return;
    if (male() || !(leak() || tension())) { box.innerHTML = ''; return; }
    var h = '<div class="sl-card"><div class="sl-h"><button type="button" class="help-btn-inline" aria-label="info" onclick="vialPelvic.info()">ℹ</button>🌸 ' + esc(t('card_t')) + '</div>';
    if (tension()) {   // при тазовой боли программы нет
      box.innerHTML = h + '<div class="sl-tx">' + esc(t('tension')) + '</div></div>'; return;
    }
    var s = get(), w = week(), v = lvl(w), k = today(), due = scoreDue(), sc = s.sc || [];
    h += '<div class="sl-tx">' + esc(t('sub')) + '</div>'
      + '<div id="pf-info" class="sl-note"' + (infoOpen ? '' : ' hidden') + '>' + esc(t('info')) + '</div>';
    if (due >= 0) {
      h += '<div class="sl-lbl">' + esc(due ? t('score_due').replace('{n}', due) : t('score_q')) + '</div>'
        + (due ? '<div class="sl-tx">' + esc(t('score_q')) + '</div>' : '')
        + '<div class="pf-sc">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) {
          return '<button type="button" class="sl-pill" onclick="vialPelvic.score(' + n + ')">' + n + '</button>'; }).join('') + '</div>';
    }
    if (sc.length >= 2) h += '<div class="sl-lbl">' + esc(t('res').replace('{a}', sc[0].v).replace('{b}', sc[sc.length - 1].v)) + '</div>';
    if (s.start && w <= 8) h += '<div class="sl-note">' + esc(t('slow')) + '</div>';
    h += '<div class="sl-lbl">' + esc(t('week').replace('{n}', w)) + '</div>'
      + '<div class="sl-tx">' + esc(t('plan').replace('{r}', v.r).replace('{h}', v.h).replace('{p}', v.p).replace('{f}', v.f).replace('{pos}', t(v.pos))) + '</div>'
      + (due === 0 ? '' : '<button type="button" class="sl-btn sl-main" onclick="vialPelvic.go()">▶ ' + esc(t('start')) + '</button>')
      + '<div class="sl-lbl">' + esc(t('today').replace('{k}', Math.min(k, PER_DAY))) + (k >= PER_DAY ? ' ✓' : '') + '</div>';
    if (w >= 5) h += '<div class="sl-note">' + esc(t('knack')) + '</div>';
    h += '<div class="sl-lbl">' + esc(t('doc_t')) + '</div><div class="sl-note pf-doc">' + esc(t('doc')) + '</div></div>';
    box.innerHTML = h;
  }

  // ── голос (как sleep.js: iPhone — голос страницы, Android — плагин) ──
  function isIOS() { try { return window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'ios'; } catch (e) { return false; } }
  function plug() { if (window.speechSynthesis && (isIOS() || !window.Capacitor)) return null; return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) || null; }
  function loc() { try { return (typeof window._locale === 'function') ? window._locale() : 'en-GB'; } catch (e) { return 'en-GB'; } }
  function say(text) {
    if (!text) return;
    var p = plug();
    if (p) { p.stop().catch(function () {}).then(function () { return p.speak({ text: text, lang: loc(), rate: 0.9, pitch: 1, volume: 1, category: 'playback' }); }).catch(function () {}); return; }
    var ss = window.speechSynthesis; if (!ss) return;
    var u = new SpeechSynthesisUtterance(text); u.lang = loc(); u.rate = 0.9;
    if (ss.speaking || ss.pending) ss.cancel();
    ss.speak(u);
  }
  function hush() { var p = plug(); if (p) p.stop().catch(function () {}); else if (window.speechSynthesis) window.speechSynthesis.cancel(); }

  // ── плеер: сценарий подхода → шаги по таймеру ──
  var run = 0, timer = null;
  function ov(html) {
    var o = $('sl-ov'); if (!o) { o = document.createElement('div'); o.id = 'sl-ov'; document.body.appendChild(o); }
    o.innerHTML = '<div class="sl-ov-in">' + html + '</div>'; o.style.display = 'flex'; return o;
  }
  function plan() {
    var v = lvl(week()), st = [{ s: t('breath'), say: t('breath'), sec: 4, c: 0 }];
    for (var i = 1; i <= v.r; i++) {
      st.push({ s: t('sq') + ' · ' + i + '/' + v.r, say: t('sq'), sec: 1, c: 1 });
      st.push({ s: t('hold') + ' · ' + i + '/' + v.r, say: v.h >= 5 ? t('hold') : '', sec: v.h, c: 1, n: 1 });
      st.push({ s: t('rel'), say: t('rel'), sec: v.p, c: 0, n: 1 });
    }
    st.push({ s: t('fast'), say: t('fast'), sec: 4, c: 0 });
    for (var j = 1; j <= v.f; j++) {
      st.push({ s: t('q1') + ' · ' + j + '/' + v.f, say: t('q1'), sec: 1, c: 1 });
      st.push({ s: t('rel'), say: '', sec: 1, c: 0 });
    }
    return st;
  }
  function go() {
    stop(); var my = ++run, st = plan(), i = 0;
    var s = get(); if (!s.start) { s.start = Date.now(); put(s); }
    ov('<div class="sl-ov-t">' + esc(t('card_t')) + '</div>'
      + '<div class="sl-circle pf-c" id="pf-c"></div><div class="sl-ov-tx" id="pf-tx"></div><div class="sl-ov-keep" id="pf-n"></div>'
      + '<button type="button" class="sl-btn" onclick="vialPelvic.stop()">' + esc(t('stop')) + '</button>');
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    awake(true);
    (function step() {
      if (my !== run) return;
      if (i >= st.length) return finish(my);
      var x = st[i++], c = $('pf-c'), tx = $('pf-tx'), n = $('pf-n'), left = x.sec;
      if (tx) tx.textContent = x.s;
      if (c) c.className = 'sl-circle pf-c' + (x.c ? ' on' : '');
      if (x.say) say(x.say);
      (function tick() {
        if (my !== run) return;
        if (n) n.textContent = x.n ? String(left) : '';
        if (left-- <= 0) return step();
        timer = setTimeout(tick, 1000);
      })();
    })();
  }
  function finish(my) {
    if (my !== run) return;
    var s = get(); s.log = (s.log || []).concat([{ d: dayKey() }]).slice(-400); put(s);
    say(t('fin')); awake(false);
    ov('<div class="sl-ov-t">' + esc(t('card_t')) + '</div><div class="sl-ov-tx">' + esc(t('fin')) + '</div>'
      + '<div class="sl-ov-keep">' + esc(t('today').replace('{k}', Math.min(today(), PER_DAY))) + '</div>'
      + '<button type="button" class="sl-btn sl-main" onclick="vialPelvic.stop()">' + esc(t('close')) + '</button>');
    card();
  }
  function stop() {
    run++; clearTimeout(timer); hush(); awake(false);
    var o = $('sl-ov'); if (o) o.style.display = 'none';
  }
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
  css.textContent = '#rdPelvic:empty{display:none;}#rdPelvic{margin:12px 0;}'
    + '.pf-sc{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px;}.pf-sc .sl-pill{flex:0 0 auto;min-width:40px;}'
    + '.pf-doc{white-space:pre-wrap;}'
    + '.pf-c{transition:transform .6s ease;}.pf-c.on{transform:scale(1.3);}';
  document.head.appendChild(css);

  window.vialPelvic = {
    card: card, go: go, stop: stop,
    score: function (n) { var s = get(); s.sc = (s.sc || []).concat([{ w: s.start ? week() : 0, v: n, d: dayKey() }]).slice(-12); put(s); card(); },
    info: function () { infoOpen = !infoOpen; var e = $('pf-info'); if (e) e.hidden = !infoOpen; },
    state: function () { var s = get(); return { on: !male() && leak() && !tension(), week: s.start ? week() : 0, sc: s.sc || [], days: (s.log || []).length }; }
  };
  card();
})();
