/* VIA·L — проигрыватель «Тренировки дня» (2026-10-10). Механика взята из пробы владельца
   (~/Developer/VIA-L-фитнес-медиа/Eva тренер видео/player.html, FITNESS-APP-MODEL.md §12.3): ролик Евы на весь экран, кольцо-таймер,
   счёт повторов по самому ролику, писки 3-2-1, музыка (WebAudio, своя), голос — ГОЛОС ТЕЛЕФОНА
   (плагин TextToSpeech в приложении, speechSynthesis в браузере; решение 2026-10-10, Cartesia не нужна).
   Шаги собирает vialWorkouts.steps(id) из плана тренировки; ролик — по номеру каталога (clips/<номер>.mp4,
   точка → дефис). Нет ролика — экран с названием и «как делать». В конце — отметка «Сделано».
   Новый ролик: положить clips/<номер>.mp4 (720p, без звука), вписать номер в CLIPS (и повторы в rep, если бумеранг). */
(function () {
  // Ролики и фото Евы. rep — моменты (с) конца повтора в петле ролика (размечено в пробе 2026-10-06).
  var CLIPS = {
    '8.1': {}, '5.2': {}, '2.20': {},
    '1.1': { rep: [4.75] }, '1.4': { rep: [3.92] }, '1.9': { rep: [4.08] }, '1.10': { rep: [5.08] },
    '1.13': { rep: [2.79, 4.67] }, '1.17': { rep: [2.92] }, '1.20': { rep: [3.33] },
    '2.1': { rep: [3.42] }, '2.3': { rep: [4.33] }, '2.7': { rep: [1.58] }, '2.9': { rep: [3.08] },
    '3.2': { rep: [2.9, 5.87] }, '3.4': { rep: [2.67, 5.29] },
    '3.6': { photo: 1 }, '3.7': { photo: 1 }, '3.8': { photo: 1 }, '6.3': { photo: 1 }
  };
  // Рамка движения в клипе (доли кадра x0,y0,x1,y1) — для «Крупного плана»: стоя Ева во весь рост, лёжа — коврик
  // от края до края. Перенесено из пробы владельца (player.html, BOX), ключи — номера каталога.
  var BOX = { '8.1': [.38, 0, .60, .95], '5.2': [.40, .02, .60, .95], '1.9': [.36, 0, .64, .97], '1.17': [.38, .02, .71, .92],
    '1.1': [.30, 0, .68, .92], '1.4': [.38, 0, .60, .95], '1.10': [.35, .02, .60, .95], '2.1': [.32, .05, .76, .90], '2.3': [.12, .25, .89, .84],
    '2.7': [.33, .10, .67, .92], '1.13': [.22, .08, .58, .92], '2.9': [.34, .15, .66, .92], '2.20': [.30, .03, .54, .95],
    '3.6': [.17, .35, .84, .80], '3.7': [.19, .40, .81, .84], '3.8': [.19, .30, .81, .84], '1.20': [.20, .45, .85, .88],
    '3.2': [.18, .28, .84, .88], '3.4': [.14, .28, .90, .88], '6.3': [.32, .07, .66, .92] };
  // Настройки (под «⋯», как в системном плеере iPhone) — запоминаются
  var PREF_K = 'vialp_mvp_prefs';
  function prefs() { var d = { tempo: 1, zoom: false, music: true, voice: true }; try { var o = JSON.parse(localStorage.getItem(PREF_K) || '{}'); for (var k in o) d[k] = o[k]; } catch (e) {} return d; }
  function savePrefs(p) { try { localStorage.setItem(PREF_K, JSON.stringify(p)); } catch (e) {} }
  var P = prefs();
  var BASE = 'clips/';
  function clipSrc(id) { var c = CLIPS[id]; return c ? BASE + id.replace('.', '-') + (c.photo ? '.jpg' : '.mp4') : ''; }

  var T = {
    start:  {ru:'Начать тренировку',uk:'Почати тренування',en:'Start workout',es:'Empezar entrenamiento',de:'Training starten',pt:'Começar treino',fr:'Commencer la séance',pl:'Zacznij trening',it:'Inizia allenamento',he:'להתחיל אימון',ja:'トレーニングを始める',ko:'운동 시작'},
    resume: {ru:'Продолжить',uk:'Продовжити',en:'Resume',es:'Continuar',de:'Weiter',pt:'Continuar',fr:'Reprendre',pl:'Wznów',it:'Riprendi',he:'להמשיך',ja:'再開',ko:'계속'},
    quit:   {ru:'Выйти',uk:'Вийти',en:'Exit',es:'Salir',de:'Beenden',pt:'Sair',fr:'Quitter',pl:'Wyjdź',it:'Esci',he:'יציאה',ja:'終了',ko:'나가기'},
    sure:   {ru:'Точно выйти?',uk:'Точно вийти?',en:'Exit for sure?',es:'¿Salir de verdad?',de:'Wirklich beenden?',pt:'Sair mesmo?',fr:'Vraiment quitter ?',pl:'Na pewno wyjść?',it:'Uscire davvero?',he:'בטוח לצאת?',ja:'本当に終了しますか？',ko:'정말 나갈까요?'},
    rest:   {ru:'Отдых',uk:'Відпочинок',en:'Rest',es:'Descanso',de:'Pause',pt:'Descanso',fr:'Repos',pl:'Odpoczynek',it:'Riposo',he:'מנוחה',ja:'休憩',ko:'휴식'},
    next:   {ru:'Дальше',uk:'Далі',en:'Next',es:'Siguiente',de:'Als Nächstes',pt:'A seguir',fr:'Ensuite',pl:'Dalej',it:'Prossimo',he:'הבא',ja:'次は',ko:'다음'},
    follow: {ru:'Повторяйте',uk:'Повторюйте',en:'Follow along',es:'Repite',de:'Mitmachen',pt:'Repita',fr:'Suivez',pl:'Powtarzaj',it:'Ripeti',he:'חזרו אחריה',ja:'一緒に',ko:'따라 하세요'},
    hold:   {ru:'Удержание',uk:'Утримання',en:'Hold',es:'Mantén',de:'Halten',pt:'Segure',fr:'Tenez',pl:'Utrzymaj',it:'Mantieni',he:'החזקה',ja:'キープ',ko:'유지'},
    noclip: {ru:'Ролика пока нет — делайте по описанию',uk:'Ролика поки немає — робіть за описом',en:'No video yet — follow the description',es:'Aún no hay vídeo: sigue la descripción',de:'Noch kein Video — nach Beschreibung ausführen',pt:'Ainda sem vídeo — siga a descrição',fr:'Pas encore de vidéo — suivez la description',pl:'Filmu jeszcze nie ma — ćwicz według opisu',it:'Video non ancora disponibile: segui la descrizione',he:'עדיין אין סרטון — בצעו לפי התיאור',ja:'動画はまだありません。説明に沿って行ってください',ko:'아직 영상이 없어요 — 설명대로 하세요'},
    round:  {ru:'Круг {r} из {n}',uk:'Коло {r} з {n}',en:'Round {r} of {n}',es:'Vuelta {r} de {n}',de:'Runde {r} von {n}',pt:'Volta {r} de {n}',fr:'Tour {r} sur {n}',pl:'Runda {r} z {n}',it:'Giro {r} di {n}',he:'סבב {r} מתוך {n}',ja:'{n}周中{r}周目',ko:'{n}라운드 중 {r}'},
    reps:   {ru:'раз',uk:'разів',en:'reps',es:'rep.',de:'Wdh.',pt:'rep.',fr:'rép.',pl:'powt.',it:'rip.',he:'חזרות',ja:'回',ko:'회'},
    sec:    {ru:'сек',uk:'сек',en:'sec',es:'s',de:'Sek.',pt:'s',fr:'s',pl:'s',it:'s',he:'שנ׳',ja:'秒',ko:'초'},
    voice:  {ru:'Голос',uk:'Голос',en:'Voice',es:'Voz',de:'Stimme',pt:'Voz',fr:'Voix',pl:'Głos',it:'Voce',he:'קול',ja:'音声',ko:'음성'},
    music:  {ru:'Музыка',uk:'Музика',en:'Music',es:'Música',de:'Musik',pt:'Música',fr:'Musique',pl:'Muzyka',it:'Musica',he:'מוזיקה',ja:'音楽',ko:'음악'},
    doneH:  {ru:'Готово!',uk:'Готово!',en:'Done!',es:'¡Hecho!',de:'Geschafft!',pt:'Feito!',fr:'Terminé !',pl:'Gotowe!',it:'Fatto!',he:'סיימתם!',ja:'完了！',ko:'완료!'},
    doneT:  {ru:'Тренировка отмечена «Сделано». Завтра утром она сама попадёт в «Движение вчера».',uk:'Тренування позначено «Зроблено». Завтра вранці воно саме потрапить у «Рух учора».',en:'The workout is marked done. Tomorrow morning it will fill in “Movement yesterday” by itself.',es:'El entrenamiento está marcado como hecho. Mañana se añadirá solo a «Movimiento de ayer».',de:'Das Training ist als erledigt markiert. Morgen früh steht es automatisch unter „Bewegung gestern“.',pt:'O treino foi marcado como feito. Amanhã de manhã ele entra sozinho em «Movimento de ontem».',fr:'La séance est marquée comme faite. Demain matin, elle s’ajoutera seule à « Mouvement d’hier ».',pl:'Trening oznaczony jako zrobiony. Jutro rano sam trafi do „Ruch wczoraj”.',it:'L’allenamento è segnato come fatto. Domattina comparirà da solo in «Movimento di ieri».',he:'האימון סומן כבוצע. מחר בבוקר הוא יופיע לבד ב«תנועה אתמול».',ja:'トレーニングを「完了」にしました。明日の朝「昨日の運動」に自動で入ります。',ko:'운동이 완료로 표시됐어요. 내일 아침 ‘어제의 움직임’에 자동으로 들어가요.'},
    more:   {ru:'Настройки',uk:'Налаштування',en:'Settings',es:'Ajustes',de:'Einstellungen',pt:'Ajustes',fr:'Réglages',pl:'Ustawienia',it:'Impostazioni',he:'הגדרות',ja:'設定',ko:'설정'},
    tempo:  {ru:'Темп Евы',uk:'Темп Єви',en:'Eva’s pace',es:'Ritmo de Eva',de:'Evas Tempo',pt:'Ritmo da Eva',fr:'Rythme d’Eva',pl:'Tempo Ewy',it:'Ritmo di Eva',he:'הקצב של אווה',ja:'エヴァのペース',ko:'에바의 속도'},
    tSlow:  {ru:'Медленнее',uk:'Повільніше',en:'Slower',es:'Más lento',de:'Langsamer',pt:'Mais devagar',fr:'Plus lent',pl:'Wolniej',it:'Più lento',he:'לאט יותר',ja:'ゆっくり',ko:'느리게'},
    tNorm:  {ru:'Обычный',uk:'Звичайний',en:'Normal',es:'Normal',de:'Normal',pt:'Normal',fr:'Normal',pl:'Normalne',it:'Normale',he:'רגיל',ja:'ふつう',ko:'보통'},
    tFast:  {ru:'Быстрее',uk:'Швидше',en:'Faster',es:'Más rápido',de:'Schneller',pt:'Mais rápido',fr:'Plus rapide',pl:'Szybciej',it:'Più veloce',he:'מהר יותר',ja:'速く',ko:'빠르게'},
    tFast2: {ru:'Ещё быстрее',uk:'Ще швидше',en:'Even faster',es:'Aún más rápido',de:'Noch schneller',pt:'Ainda mais rápido',fr:'Encore plus rapide',pl:'Jeszcze szybciej',it:'Ancora più veloce',he:'עוד יותר מהר',ja:'さらに速く',ko:'더 빠르게'},
    zoom:   {ru:'Крупный план',uk:'Великий план',en:'Close-up',es:'Primer plano',de:'Nahaufnahme',pt:'Close-up',fr:'Gros plan',pl:'Zbliżenie',it:'Primo piano',he:'תקריב',ja:'クローズアップ',ko:'클로즈업'},
    on:     {ru:'Вкл.',uk:'Увімк.',en:'On',es:'Sí',de:'An',pt:'Lig.',fr:'Oui',pl:'Wł.',it:'On',he:'פועל',ja:'オン',ko:'켜기'},
    off:    {ru:'Выкл.',uk:'Вимк.',en:'Off',es:'No',de:'Aus',pt:'Desl.',fr:'Non',pl:'Wył.',it:'Off',he:'כבוי',ja:'オフ',ko:'끄기'},
    close:  {ru:'Закрыть',uk:'Закрити',en:'Close',es:'Cerrar',de:'Schließen',pt:'Fechar',fr:'Fermer',pl:'Zamknij',it:'Chiudi',he:'סגירה',ja:'閉じる',ko:'닫기'},
    sayStart:{ru:'Начинаем. Сначала — лёгкая разминка.',uk:'Починаємо. Спочатку — легка розминка.',en:'Let’s begin. First, an easy warm-up.',es:'Empezamos. Primero, un calentamiento suave.',de:'Los geht’s. Zuerst ein leichtes Aufwärmen.',pt:'Vamos começar. Primeiro, um aquecimento leve.',fr:'On commence. D’abord, un échauffement léger.',pl:'Zaczynamy. Najpierw lekka rozgrzewka.',it:'Iniziamo. Prima un riscaldamento leggero.',he:'מתחילים. קודם — חימום קל.',ja:'始めましょう。まずは軽いウォームアップから。',ko:'시작합니다. 먼저 가벼운 준비 운동부터.'},
    sayRest:{ru:'Отдых. Походите, подышите спокойно.',uk:'Відпочинок. Походіть, подихайте спокійно.',en:'Rest. Walk around and breathe easy.',es:'Descanso. Camina un poco y respira tranquilo.',de:'Pause. Ein paar Schritte gehen, ruhig atmen.',pt:'Descanso. Ande um pouco e respire com calma.',fr:'Repos. Marchez un peu, respirez calmement.',pl:'Odpoczynek. Pochodź, oddychaj spokojnie.',it:'Riposo. Cammina un po’ e respira con calma.',he:'מנוחה. הסתובבו קצת ונשמו ברוגע.',ja:'休憩です。少し歩いて、ゆっくり呼吸しましょう。',ko:'휴식. 조금 걸으며 편하게 숨 쉬세요.'},
    sayHalf:{ru:'Половина. Так держать.',uk:'Половина. Так тримати.',en:'Halfway. Keep it up.',es:'La mitad. Sigue así.',de:'Halbzeit. Weiter so.',pt:'Metade. Continue assim.',fr:'À mi-chemin. Continuez comme ça.',pl:'Połowa. Tak trzymaj.',it:'A metà. Continua così.',he:'חצי. ממשיכים ככה.',ja:'半分です。その調子。',ko:'절반입니다. 그대로 계속하세요.'},
    sayToday:{ru:'Сегодня',uk:'Сьогодні',en:'Today',es:'Hoy',de:'Heute',pt:'Hoje',fr:'Aujourd’hui',pl:'Dziś',it:'Oggi',he:'היום',ja:'今日は',ko:'오늘은'},
    sayNeed:{ru:'Понадобится',uk:'Знадобиться',en:'You’ll need',es:'Necesitarás',de:'Du brauchst',pt:'Você vai precisar de',fr:'Il vous faut',pl:'Przyda się',it:'Ti servirà',he:'תצטרכו',ja:'用意するもの',ko:'준비물'},
    sayWt:{ru:'Вес гантелей выбирайте так, чтобы последние два-три повтора давались с трудом, но техника не ломалась. Если легко — в следующий раз возьмите тяжелее.',uk:'Вагу гантелей обирайте так, щоб останні два-три повторення давалися важко, але техніка не ламалася. Якщо легко — наступного разу візьміть важчі.',en:'Pick dumbbells heavy enough that the last two or three reps feel hard, but your form stays clean. If it’s easy, go heavier next time.',es:'Elige un peso con el que las dos o tres últimas repeticiones cuesten, pero sin perder la técnica. Si resulta fácil, la próxima vez coge más peso.',de:'Wähle die Hanteln so, dass die letzten zwei, drei Wiederholungen schwerfallen, die Technik aber sauber bleibt. Ist es leicht, nimm beim nächsten Mal mehr.',pt:'Escolha um peso em que as duas ou três últimas repetições custem, sem perder a técnica. Se ficar fácil, da próxima vez pegue mais peso.',fr:'Choisissez des haltères assez lourds pour que les deux ou trois dernières répétitions soient difficiles, sans perdre la technique. Si c’est facile, prenez plus lourd la prochaine fois.',pl:'Dobierz ciężar tak, by ostatnie dwa–trzy powtórzenia były trudne, ale technika się nie psuła. Jeśli łatwo — następnym razem weź cięższe.',it:'Scegli un peso con cui le ultime due o tre ripetizioni siano faticose, ma la tecnica resti pulita. Se è facile, la prossima volta prendi di più.',he:'בחרו משקולות כך ששתיים־שלוש החזרות האחרונות יהיו קשות, אבל הטכניקה תישמר. אם קל — בפעם הבאה קחו כבד יותר.',ja:'最後の2〜3回がきついけれど、フォームが崩れない重さのダンベルを選びましょう。楽なら次回は重くしましょう。',ko:'마지막 두세 번이 힘들지만 자세가 무너지지 않는 무게를 고르세요. 쉬우면 다음엔 더 무겁게 하세요.'},
    kgLast:{ru:"В прошлый раз вы брали {kg} кг.",uk:"Минулого разу ви брали {kg} кг.",en:"Last time you used {kg} kg.",es:"La última vez usaste {kg} kg.",de:"Letztes Mal hattest du {kg} kg.",pt:"Da última vez você usou {kg} kg.",fr:"La dernière fois, vous aviez {kg} kg.",pl:"Ostatnio używałaś/eś {kg} kg.",it:"L’ultima volta hai usato {kg} kg.",he:"בפעם הקודמת לקחתם {kg} ק\"ג.",ja:"前回は{kg}kgでした。",ko:"지난번에는 {kg}kg였어요."},
    kgUp:{ru:"Было легко — сегодня попробуйте {n} кг.",uk:"Було легко — сьогодні спробуйте {n} кг.",en:"It felt easy — try {n} kg today.",es:"Fue fácil: hoy prueba con {n} kg.",de:"Es war leicht — probier heute {n} kg.",pt:"Foi fácil — hoje tente {n} kg.",fr:"C’était facile — essayez {n} kg aujourd’hui.",pl:"Było łatwo — dziś spróbuj {n} kg.",it:"Era facile: oggi prova {n} kg.",he:"היה קל — היום נסו {n} ק\"ג.",ja:"楽だったので、今日は{n}kgを試してみましょう。",ko:"쉬웠으니 오늘은 {n}kg로 해 보세요."},
    kgKeep:{ru:"Можно оставить этот вес.",uk:"Можна залишити цю вагу.",en:"You can keep the same weight.",es:"Puedes mantener el mismo peso.",de:"Du kannst das Gewicht beibehalten.",pt:"Pode manter o mesmo peso.",fr:"Vous pouvez garder le même poids.",pl:"Możesz zostać przy tym ciężarze.",it:"Puoi tenere lo stesso peso.",he:"אפשר להישאר באותו משקל.",ja:"同じ重さで大丈夫です。",ko:"같은 무게로 하셔도 돼요."},
    kgDown:{ru:"Было тяжело — сегодня можно взять {n} кг.",uk:"Було важко — сьогодні можна взяти {n} кг.",en:"It felt hard — today you can use {n} kg.",es:"Fue duro: hoy puedes usar {n} kg.",de:"Es war schwer — heute gern {n} kg.",pt:"Foi pesado — hoje pode usar {n} kg.",fr:"C’était dur — aujourd’hui, prenez {n} kg.",pl:"Było ciężko — dziś możesz wziąć {n} kg.",it:"Era pesante: oggi puoi usare {n} kg.",he:"היה קשה — היום אפשר לקחת {n} ק\"ג.",ja:"きつかったので、今日は{n}kgでも大丈夫です。",ko:"힘들었으니 오늘은 {n}kg로 해도 돼요."},
    sayGo:  {ru:'Начали!',uk:'Почали!',en:'Go!',es:'¡Vamos!',de:'Los!',pt:'Vamos!',fr:'C’est parti !',pl:'Zaczynamy!',it:'Via!',he:'מתחילים!',ja:'スタート！',ko:'시작!'},
    sayDone:{ru:'Готово. Отличная работа — вы молодец.',uk:'Готово. Чудова робота — ви молодець.',en:'Done. Great work — well done you.',es:'Hecho. Muy buen trabajo, enhorabuena.',de:'Geschafft. Starke Leistung — gut gemacht.',pt:'Pronto. Ótimo trabalho — parabéns.',fr:'Terminé. Beau travail, bravo.',pl:'Gotowe. Świetna robota — brawo.',it:'Fatto. Ottimo lavoro, brava.',he:'סיימתם. עבודה מצוינת — כל הכבוד.',ja:'お疲れさまでした。よく頑張りました。',ko:'끝났어요. 정말 잘했어요.'},
    restNext:{ru:'Отдохните и приготовьтесь',uk:'Відпочиньте й приготуйтеся',en:'Rest and get ready',es:'Descansa y prepárate',de:'Ausruhen und bereit machen',pt:'Descanse e prepare-se',fr:'Reposez-vous et préparez-vous',pl:'Odpocznij i przygotuj się',it:'Riposa e preparati',he:'נוחו והתכוננו',ja:'休んで準備しましょう',ko:'쉬면서 준비하세요'}
  };
  // Слова поддержки в паузах (тон разборов: поддержка без давления — docs/WEEKLY-REVIEW-SAMPLES.md)
  var CHEER = {
    ru:['У вас отлично получается.','Дышите ровно, не задерживайте дыхание.','Двигайтесь в своём темпе.','Каждое повторение — вклад в вашу силу.','Если тяжело — можно медленнее, это тоже работа.','Ещё немного — вы справляетесь.','Плечи вниз, шея свободна.','Хорошо держите технику.','Это время — для вас.'],
    uk:['У вас чудово виходить.','Дихайте рівно, не затримуйте дихання.','Рухайтеся у своєму темпі.','Кожне повторення — внесок у вашу силу.','Якщо важко — можна повільніше, це теж робота.','Ще трохи — ви справляєтеся.','Плечі вниз, шия вільна.','Добре тримаєте техніку.','Цей час — для вас.'],
    en:['You’re doing great.','Breathe steadily — don’t hold your breath.','Move at your own pace.','Every rep adds to your strength.','If it feels hard, go slower — that still counts.','Just a little more — you’ve got this.','Shoulders down, neck relaxed.','Nice form — keep it up.','This time is for you.'],
    es:['Lo estás haciendo genial.','Respira con calma, no contengas el aire.','Muévete a tu ritmo.','Cada repetición suma a tu fuerza.','Si cuesta, ve más despacio: también cuenta.','Un poco más, lo estás logrando.','Hombros abajo, cuello suelto.','Buena técnica, sigue así.','Este tiempo es para ti.'],
    de:['Das machst du großartig.','Atme ruhig weiter, nicht die Luft anhalten.','Beweg dich in deinem Tempo.','Jede Wiederholung stärkt dich.','Wenn es schwer ist, mach langsamer — das zählt auch.','Nur noch ein bisschen — du schaffst das.','Schultern runter, Nacken locker.','Gute Technik, weiter so.','Diese Zeit gehört dir.'],
    pt:['Você está indo muito bem.','Respire com calma, não prenda o ar.','Mova-se no seu ritmo.','Cada repetição soma à sua força.','Se estiver difícil, vá mais devagar — também conta.','Só mais um pouco, você consegue.','Ombros para baixo, pescoço solto.','Boa técnica, continue assim.','Este tempo é para você.'],
    fr:['Vous vous en sortez très bien.','Respirez calmement, ne bloquez pas votre souffle.','Bougez à votre rythme.','Chaque répétition renforce votre force.','Si c’est dur, ralentissez — ça compte aussi.','Encore un peu, vous y êtes.','Épaules basses, nuque détendue.','Belle technique, continuez.','Ce moment est pour vous.'],
    pl:['Świetnie ci idzie.','Oddychaj spokojnie, nie wstrzymuj oddechu.','Ruszaj się we własnym tempie.','Każde powtórzenie dodaje ci siły.','Jeśli ciężko — zwolnij, to też się liczy.','Jeszcze trochę — dasz radę.','Barki w dół, szyja luźna.','Dobra technika, tak trzymaj.','Ten czas jest dla ciebie.'],
    it:['Stai andando benissimo.','Respira con calma, non trattenere il fiato.','Muoviti al tuo ritmo.','Ogni ripetizione aggiunge forza.','Se è dura, rallenta: conta lo stesso.','Ancora un po’, ce la fai.','Spalle giù, collo rilassato.','Buona tecnica, continua così.','Questo tempo è per te.'],
    he:['אתם עושים את זה מצוין.','נשמו בקצב רגוע, בלי לעצור את הנשימה.','זוזו בקצב שלכם.','כל חזרה מוסיפה כוח.','אם קשה — אפשר לאט יותר, גם זה נחשב.','עוד קצת — אתם מצליחים.','כתפיים למטה, צוואר רפוי.','טכניקה טובה, ממשיכים.','הזמן הזה הוא בשבילכם.'],
    ja:['とても上手です。','息を止めず、落ち着いて呼吸しましょう。','自分のペースで動きましょう。','一回一回が力になります。','きつければゆっくりでも大丈夫。それも立派な運動です。','あと少し、できていますよ。','肩を下げて、首はリラックス。','いいフォームです、その調子。','この時間はあなたのためのものです。'],
    ko:['정말 잘하고 있어요.','숨을 참지 말고 편하게 쉬세요.','자기 속도대로 움직이세요.','한 번 한 번이 힘이 됩니다.','힘들면 천천히 해도 괜찮아요. 그것도 운동이에요.','조금만 더, 잘하고 있어요.','어깨는 내리고 목은 편하게.','자세 좋아요, 계속하세요.','이 시간은 당신을 위한 시간이에요.']
  };
  var lastSpoke = 0, lastCheer = -1;
  function cheer() {
    var a = CHEER[L()] || CHEER.en, i = Math.floor(Math.random() * a.length);
    if (i === lastCheer) i = (i + 1) % a.length;
    lastCheer = i; say(a[i]);
  }
  function L() { return (typeof lang !== 'undefined' && lang) ? lang : 'en'; }   // `let lang` главной не лежит в window
  function t(k) { var o = T[k] || {}; return o[L()] || o.en || ''; }
  function loc() { try { return (typeof window._locale === 'function') ? window._locale() : 'en-GB'; } catch (e) { return 'en-GB'; } }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ── голос телефона ──
  var voiceOn = true, speaking = false, sayId = 0, vEnd = 0;
  // iPhone: голос страницы (speechSynthesis, как в пробе) — у плагина шкала скорости без «чуть медленнее»
  // и голос по умолчанию бывает мужским. Android WebView speechSynthesis не имеет — там плагин.
  function isIOS() { try { return window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'ios'; } catch (e) { return false; } }
  function plug() { if (window.speechSynthesis && (isIOS() || !window.Capacitor)) return null; return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) || null; }
  // Женские голоса по языкам (iOS/macOS/Android-имена). «Улучшенный»/«премиум», если скачан, — первым.
  var FEMALE = /milena|katya|lesya|samantha|karen|moira|serena|martha|kate|stephanie|tessa|fiona|victoria|allison|ava|susan|zoe|m[oó]nica|paulina|marisol|anna|petra|helena|luciana|joana|catarina|fernanda|am[eé]lie|audrey|marie|aur[eé]lie|zosia|ewa|alice|federica|carmit|kyoko|o-ren|yuna|sora|female/i;
  var MALE = /yuri|maxim|daniel|arthur|oliver|aaron|gordon|rishi|alex|fred|thomas|jorge|diego|markus|yannick|luca|felipe|otoya|hattori|male/i;
  var webVoice = null, plugVoice = -1;
  function pickVoices() {
    var lc = loc(), pre = lc.slice(0, 2);
    var ss = window.speechSynthesis;
    if (ss) {
      var v = (ss.getVoices() || []).filter(function (x) { return (x.lang || '').replace('_', '-').slice(0, 2) === pre; });
      var score = function (x) { var n = x.name + ' ' + (x.voiceURI || ''); return (FEMALE.test(n) ? 4 : 0) - (MALE.test(n) ? 4 : 0) + (/enhanced|premium|улучш|neural/i.test(n) ? 2 : 0) + ((x.lang || '').replace('_', '-') === lc ? 1 : 0); };
      webVoice = v.sort(function (a, b) { return score(b) - score(a); })[0] || null;
    }
    var p = plug();
    if (p && p.getSupportedVoices) p.getSupportedVoices().then(function (r) {
      var vs = (r && r.voices) || [], best = -1, bs = -99;
      vs.forEach(function (x, i) { if (String(x.lang || '').replace('_', '-').slice(0, 2) !== pre) return;
        var n = (x.name || '') + ' ' + (x.voiceURI || ''); var sc = (FEMALE.test(n) ? 4 : 0) - (MALE.test(n) ? 4 : 0) + (/enhanced|premium|neural/i.test(n) ? 2 : 0);
        if (sc > bs) { bs = sc; best = i; } });
      plugVoice = best;
    }).catch(function () {});
  }
  if (window.speechSynthesis) { try { window.speechSynthesis.onvoiceschanged = pickVoices; window.speechSynthesis.getVoices(); } catch (e) {} }
  // Сокращения единиц → слова (2026-10-12): голос читал «5 с» как «пять эс». Число + единица перед
  // пробелом/знаком/концом строки. Для ru/uk/pl — склонение по числу (держать 1 секунду / 3 секунды / 5 секунд).
  function plural3(n, a, b, c) { n = Math.abs(n) % 100; var d = n % 10; if (n > 10 && n < 20) return c; if (d === 1) return a; if (d >= 2 && d <= 4) return b; return c; }
  var UNITS = {
    ru: { s: ['секунду','секунды','секунд'], min: ['минуту','минуты','минут'], kg: ['килограмм','килограмма','килограммов'], km: ['километр','километра','километров'] },
    uk: { s: ['секунду','секунди','секунд'], min: ['хвилину','хвилини','хвилин'], kg: ['кілограм','кілограми','кілограмів'], km: ['кілометр','кілометри','кілометрів'] },
    pl: { s: ['sekundę','sekundy','sekund'], min: ['minutę','minuty','minut'], kg: ['kilogram','kilogramy','kilogramów'], km: ['kilometr','kilometry','kilometrów'] },
    en: { s: ['second','seconds'], min: ['minute','minutes'], kg: ['kilogram','kilograms'], km: ['kilometre','kilometres'] },
    es: { s: ['segundo','segundos'], min: ['minuto','minutos'], kg: ['kilo','kilos'], km: ['kilómetro','kilómetros'] },
    pt: { s: ['segundo','segundos'], min: ['minuto','minutos'], kg: ['quilo','quilos'], km: ['quilômetro','quilômetros'] },
    de: { s: ['Sekunde','Sekunden'], min: ['Minute','Minuten'], kg: ['Kilogramm','Kilogramm'], km: ['Kilometer','Kilometer'] },
    fr: { s: ['seconde','secondes'], min: ['minute','minutes'], kg: ['kilo','kilos'], km: ['kilomètre','kilomètres'] },
    it: { s: ['secondo','secondi'], min: ['minuto','minuti'], kg: ['chilo','chili'], km: ['chilometro','chilometri'] }
  };
  // Как пишется единица в текстах на каждом языке (без точки — точку съедает граница).
  var UNIT_RE = {
    s:   { ru: 'с|сек', uk: 'с|сек', pl: 's|sek', en: 's|sec|secs', es: 's|seg', pt: 's|seg', de: 's|Sek', fr: 's|sec', it: 's|sec' },
    min: { ru: 'мин', uk: 'хв', pl: 'min', en: 'min|mins', es: 'min', pt: 'min', de: 'Min', fr: 'min', it: 'min' },
    kg:  { ru: 'кг', uk: 'кг', pl: 'kg', en: 'kg', es: 'kg', pt: 'kg', de: 'kg', fr: 'kg', it: 'kg' },
    km:  { ru: 'км', uk: 'км', pl: 'km', en: 'km', es: 'km', pt: 'km', de: 'km', fr: 'km', it: 'km' }
  };
  function spoken(text) {
    var l = (typeof lang !== 'undefined' && lang) || 'en', U = UNITS[l]; if (!U) return String(text || '');
    var out = String(text || '');
    Object.keys(UNIT_RE).forEach(function (k) {
      var alt = UNIT_RE[k][l]; if (!alt || !U[k]) return;
      var re = new RegExp('(\\d+(?:[.,]\\d+)?)\\s?(?:' + alt + ')(?=[\\s.,;:!?)\\u2014\\u2013]|$)', 'g');
      out = out.replace(re, function (m, num) {
        var n = parseFloat(String(num).replace(',', '.')), f = U[k];
        var w = f.length === 3 ? (n % 1 ? f[1] : plural3(n, f[0], f[1], f[2])) : (n === 1 ? f[0] : f[1]);
        return num + ' ' + w;
      });
    });
    return out;
  }
  function vLen(text) { return String(text || '').length / 13; }   // ≈13 знаков в секунду — для расчёта, когда начать подсказку
  function say(text, force) {
    if (!voiceOn || !text) return;
    text = spoken(text);
    if (speaking && !force) return;
    var my = ++sayId, p = plug(), lc = loc();
    lastSpoke = Date.now();
    speaking = true; vEnd = Date.now() + vLen(text) * 1000 + 400;
    var done = function () { if (my === sayId) speaking = false; };
    if (p) {
      var o = { text: text, lang: lc, rate: 0.9, category: 'playback' }; if (plugVoice >= 0) o.voice = plugVoice;
      Promise.resolve(force ? p.stop().catch(function () {}) : null)
        .then(function () { return p.speak(o); })
        .then(done, done);
      return;
    }
    var ss = window.speechSynthesis; if (!ss) { speaking = false; return; }
    if (!webVoice) pickVoices();
    if (!webVoice && (ss.getVoices() || []).length === 0 && !(say._w > 8)) {   // голоса ещё не загрузились — ждём до ~2,5 с
      say._w = (say._w || 0) + 1; speaking = false;
      setTimeout(function () { if (my === sayId) say(text, force); }, 300); return;
    }
    say._w = 0;
    var u = new SpeechSynthesisUtterance(text); u.lang = lc; u.rate = 0.92;
    if (webVoice) u.voice = webVoice;
    u.onend = done; u.onerror = done;
    // Повторы (2026-10-12): в WebKit speak() сразу после cancel() иногда заново проигрывает оборванную
    // фразу. Если что-то звучит или в очереди — гасим и говорим через 80 мс; если тишина — сразу.
    if (force && (ss.speaking || ss.pending)) { ss.cancel(); setTimeout(function () { if (my === sayId) ss.speak(u); }, 80); }
    else ss.speak(u);
  }
  function hush() { sayId++; speaking = false; var p = plug(); if (p) p.stop().catch(function () {}); else if (window.speechSynthesis) window.speechSynthesis.cancel(); }

  // ── звук: писки и музыка (WebAudio, без файлов) ──
  var AC = null, mGain = null, mNext = 0, mStep = 0, mTimer = null, musicOn = true, keepAlive = null;
  // iPhone с выключенным звонком глушит WebAudio (музыка, писки), а голос идёт — поэтому «голос есть, музыки нет».
  // Просим у WebKit режим воспроизведения и держим тихий <audio> — он переводит звук страницы в «медиа».
  function unmuteIOS() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try {
      if (!keepAlive) {
        var sr = 8000, n = sr / 2, b = new ArrayBuffer(44 + n * 2), d = new DataView(b), w = function (o, s) { for (var i = 0; i < s.length; i++) d.setUint8(o + i, s.charCodeAt(i)); };
        w(0, 'RIFF'); d.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true);
        d.setUint32(24, sr, true); d.setUint32(28, sr * 2, true); d.setUint16(32, 2, true); d.setUint16(34, 16, true); w(36, 'data'); d.setUint32(40, n * 2, true);
        keepAlive = new Audio(URL.createObjectURL(new Blob([b], { type: 'audio/wav' })));
        keepAlive.loop = true; keepAlive.setAttribute('playsinline', ''); keepAlive.volume = 0.01;
      }
      var pr = keepAlive.play(); if (pr && pr.catch) pr.catch(function () {});
    } catch (e) {}
  }
  function tone(f, d, v) { if (!AC) return; var o = AC.createOscillator(), g = AC.createGain(), x = AC.currentTime;
    o.frequency.value = f; g.gain.setValueAtTime(v || .25, x); g.gain.exponentialRampToValueAtTime(.0001, x + d); o.connect(g); g.connect(AC.destination); o.start(x); o.stop(x + d); }
  function beep() { tone(880, .15, .25); }
  function endBeep() { tone(880, .7, .3); }
  function tock() { if (!AC) return; var o = AC.createOscillator(), g = AC.createGain(), x = AC.currentTime;
    o.type = 'triangle'; o.frequency.setValueAtTime(520, x); o.frequency.exponentialRampToValueAtTime(320, x + .09);
    g.gain.setValueAtTime(.35, x); g.gain.exponentialRampToValueAtTime(.0001, x + .12); o.connect(g); g.connect(AC.destination); o.start(x); o.stop(x + .13); }
  function chime() { if (!AC) return; [[660, 0], [990, .16]].forEach(function (n) { var o = AC.createOscillator(), g = AC.createGain(), x = AC.currentTime + n[1];
    o.frequency.value = n[0]; g.gain.setValueAtTime(.0001, x); g.gain.exponentialRampToValueAtTime(.28, x + .02); g.gain.exponentialRampToValueAtTime(.0001, x + .45);
    o.connect(g); g.connect(AC.destination); o.start(x); o.stop(x + .5); }); }
  var CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function note(f, x, d, type, vol) { var o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, x); g.gain.exponentialRampToValueAtTime(vol, x + Math.min(.08, d / 4)); g.gain.exponentialRampToValueAtTime(.0001, x + d);
    o.connect(g); g.connect(mGain); o.start(x); o.stop(x + d + .05); }
  function kick(x) { var o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(110, x); o.frequency.exponentialRampToValueAtTime(45, x + .15);
    g.gain.setValueAtTime(.5, x); g.gain.exponentialRampToValueAtTime(.0001, x + .22); o.connect(g); g.connect(mGain); o.start(x); o.stop(x + .25); }
  function hat(x) { var n = AC.sampleRate * .04, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.value = .12; s.connect(f); f.connect(g); g.connect(mGain); s.start(x); }
  function musicTick() {
    if (!AC || !mGain) return;
    var beat = 60 / 100 / 2;
    while (mNext < AC.currentTime + .3) {
      var bar = Math.floor(mStep / 8) % 4, pos = mStep % 8, c = CH[bar];
      if (pos === 0) c.forEach(function (m) { note(hz(m), mNext, beat * 8, 'triangle', .05); });
      if (pos % 2 === 0) note(hz(c[0] - 12), mNext, beat * 1.6, 'sine', .14);
      if (pos === 0 || pos === 4) kick(mNext);
      if (pos % 2 === 1) hat(mNext);
      if (pos === 3 || pos === 7) note(hz(c[(mStep >> 3) % 3] + 12), mNext, beat * 1.5, 'sine', .035);
      mNext += beat; mStep++;
    }
    mGain.gain.setTargetAtTime(!musicOn ? .0001 : ((speaking || Date.now() < vEnd) ? .12 : .45), AC.currentTime, .15);
  }
  function startMusic() { if (!AC || mGain) return; mGain = AC.createGain(); mGain.gain.value = .0001; mGain.connect(AC.destination);
    mNext = AC.currentTime + .1; mTimer = setInterval(musicTick, 100); }
  function stopMusic() { if (mGain && AC) mGain.gain.setTargetAtTime(.0001, AC.currentTime, .8); setTimeout(function () { clearInterval(mTimer); mTimer = null; mGain = null; }, 2500); }

  // ── состояние ──
  var S = [], idx = 0, phase = 'work', left = 0, total = 0, paused = false, last = 0, raf = 0, wid = '', lastWhole = -1, saidHalf = false;
  var fromRest = false, repMode = false, repsLeft = 0, repsN = 0, repEnds = [], repLastT = 0, repSaid = false, wake = null, introDone = -1;
  // вступление: какая тренировка, что приготовить, как выбрать вес (владелец 2026-10-11)
  function opening() {
    var W = window.vialWorkouts, l = L(), o = t('sayToday') + ': ' + W.title(wid, l) + '. ';
    var inv = W.inv ? W.inv(wid, l) : ''; if (inv) o += t('sayNeed') + ': ' + inv + '. ';
    if (W.hasDb && W.hasDb(wid)) {
      // вес по прошлому разу: «легко» → +1 кг (до 10) / +2, «тяжело» → −1; иначе — общее правило (ACSM «2 за 2», +2–10%)
      var k = W.lastKg && W.lastKg(wid), f = function (x) { return String(x).replace('.', l === 'en' || l === 'ja' || l === 'ko' || l === 'he' ? '.' : ','); };
      if (k) {
        o += t('kgLast').replace('{kg}', f(k.kg)) + ' ';
        o += k.feel === 'easy' ? t('kgUp').replace('{n}', f(k.kg + (k.kg < 10 ? 1 : 2)))
           : k.feel === 'hard' && k.kg > 1 ? t('kgDown').replace('{n}', f(k.kg - 1)) : t('kgKeep');
      } else o += t('sayWt');
    }
    return o.trim();
  }
  function intro(s) { return s.name + '. ' + (s.round === 1 ? (s.how || '') : ''); }   // техника — в первом круге
  function busy() { return speaking || Date.now() < vEnd; }
  var ARC = 263.9;
  function restAfter(i) {
    var s = S[i]; if (!s || i >= S.length - 1) return 0;
    if (s.last && s.round < s.rounds) return 60;                 // между кругами
    return (s.k === 'main' || s.k === 'int' || s.k === 'str') ? 15 : 10;
  }

  var CSS = '#mvp{position:fixed;inset:0;z-index:100000;background:#000;color:#fff;font-family:var(--font-ui,-apple-system,sans-serif);overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}'
    + '#mvp .bg{position:absolute;inset:-40px;width:calc(100% + 80px);height:calc(100% + 80px);object-fit:cover;filter:blur(28px) brightness(.45)}'
    + '#mvp .fg{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transition:filter .4s}'
    + '#mvp.resting .fg{filter:brightness(.5)}'
    + '#mvp .nc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:120px 24px 200px;background:radial-gradient(circle at 50% 40%,#222a37,#0c0f15);text-align:center}'
    + '#mvp .nc div{max-width:520px;font-size:17px;line-height:1.55;color:rgba(255,255,255,.85)}'
    + '#mvp .nc i{display:block;font-style:normal;font-size:13px;color:#EEAF54;margin-bottom:12px}'
    + '#mvp .bar{position:absolute;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:2px}'
    + '#mvp .bar i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.22)}#mvp .bar i.d{background:#C68C34}#mvp .bar i.c{background:#EEAF54}'
    + '#mvp .blk{position:absolute;left:16px;top:calc(22px + env(safe-area-inset-top));font-size:13px;color:rgba(255,255,255,.75);text-shadow:0 1px 6px rgba(0,0,0,.7)}'
    + '#mvp .ring{position:absolute;right:14px;top:calc(22px + env(safe-area-inset-top));width:96px;height:96px;border-radius:50%;background:rgba(10,12,18,.55)}'
    + '#mvp .ring svg{transform:rotate(-90deg);display:block}'
    + '#mvp .num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}'
    + '#mvp .num b{font-size:34px;font-weight:400;line-height:1;font-variant-numeric:tabular-nums}#mvp .num span{font-size:11px;color:rgba(255,255,255,.72);margin-top:3px}'
    + '#mvp .info{position:absolute;left:0;right:0;bottom:0;padding:60px 18px calc(18px + env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(0,0,0,.8))}'
    + '#mvp .tag{font-size:12px;letter-spacing:.06em;color:#EEAF54;margin-bottom:4px;text-transform:uppercase}#mvp.resting .tag{color:#5AC4B2}'
    + '#mvp .name{font-family:"Playfair Display",serif;font-size:24px;margin:0;line-height:1.2}'
    + '#mvp .dose{font-size:15px;color:#EEAF54;margin-top:4px}#mvp .hint{font-size:14px;color:rgba(255,255,255,.75);margin-top:4px;line-height:1.4}'
    + '#mvp .b321{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:110px;font-family:"Playfair Display",serif;color:#EEAF54;text-shadow:0 2px 24px rgba(0,0,0,.7);pointer-events:none}'
    + '#mvp .ctl{position:absolute;inset:0;z-index:3;background:rgba(0,0,0,.55);display:none;flex-direction:column;justify-content:center;align-items:center;gap:22px}'
    + '#mvp.pz .ctl{display:flex}#mvp.pz .blk{opacity:0}'
    + '#mvp .row{display:flex;align-items:center;gap:24px}'
    + '#mvp button{font-family:inherit;cursor:pointer;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.12);color:#fff;border-radius:14px;padding:11px 16px;font-size:15px}'
    + '#mvp .cb{width:62px;height:62px;border-radius:50%;padding:0;font-size:22px}#mvp .cb.big{width:84px;height:84px;background:#C68C34;border-color:#C68C34;color:#10131A;font-size:28px}'
    + '#mvp .x{position:absolute;left:14px;top:calc(22px + env(safe-area-inset-top))}'
    + '#mvp .tg.off{opacity:.45}'
    + '#mvp .end{position:absolute;inset:0;z-index:4;background:#10131A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center}'
    + '#mvp .end h2{font-family:"Playfair Display",serif;color:#EEAF54;font-size:32px;margin:0}#mvp .end p{max-width:440px;color:rgba(255,255,255,.8);line-height:1.5;margin:0}'
    + '#mvp .end button{background:#C68C34;border-color:#C68C34;color:#10131A;font-weight:600;min-width:200px}'
    + '#mvp .info{padding-right:76px}'
    + '#mvp .more{position:absolute;right:16px;bottom:calc(22px + env(safe-area-inset-bottom));z-index:4;width:48px;height:48px;border-radius:50%;padding:0;font-size:22px;line-height:1;background:rgba(30,34,44,.7);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}'
    + '#mvp .mnu{position:absolute;right:16px;bottom:calc(80px + env(safe-area-inset-bottom));z-index:5;min-width:250px;max-width:calc(100% - 32px);border-radius:18px;background:rgba(36,40,50,.94);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.12);padding:6px 0;box-shadow:0 12px 40px rgba(0,0,0,.5)}'
    + '#mvp .mnu button{display:flex;align-items:center;gap:12px;width:100%;border:0;border-radius:0;background:none;padding:13px 18px;font-size:16px;text-align:left;color:#fff}'
    + '#mvp .mnu button+button{border-top:1px solid rgba(255,255,255,.08)}'
    + '#mvp .mnu .mi{width:22px;text-align:center;opacity:.9}#mvp .mnu .mv{margin-left:auto;color:rgba(255,255,255,.55);font-size:14px}#mvp .mnu .mc{margin-left:auto;color:rgba(255,255,255,.4)}'
    + '#mvp .mnu .mh{font-weight:600}#mvp .mnu .ck{width:22px;color:#EEAF54}'
    + '#mvp.fill .fg{object-fit:fill}'
    + '#mvp .hid{display:none!important}';

  function build() {
    if (!$('mvp-css')) { var st = document.createElement('style'); st.id = 'mvp-css'; st.textContent = CSS; document.head.appendChild(st); }
    var d = document.createElement('div'); d.id = 'mvp';
    d.innerHTML = '<video class="bg" muted playsinline loop></video><video class="fg" muted playsinline loop onloadedmetadata="window.vialPlayer&&vialPlayer._fit()"></video>'
      + '<img class="bg hid" alt=""><img class="fg hid" alt="" onload="window.vialPlayer&&vialPlayer._fit()"><div class="nc hid"><div><i></i><span></span></div></div>'
      + '<div class="bar" id="mvp-bar"></div><div class="blk" id="mvp-blk"></div>'
      + '<div class="ring"><svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="6"/>'
      + '<circle id="mvp-arc" cx="48" cy="48" r="42" fill="none" stroke="#C68C34" stroke-width="6" stroke-linecap="round" stroke-dasharray="263.9" stroke-dashoffset="0"/></svg>'
      + '<div class="num"><b id="mvp-sec">0</b><span id="mvp-unit"></span></div></div>'
      + '<div class="info"><div class="tag" id="mvp-tag"></div><p class="name" id="mvp-name"></p><div class="dose" id="mvp-dose"></div><div class="hint" id="mvp-hint"></div></div>'
      + '<div class="b321 hid" id="mvp-321"></div>'
      + '<div class="ctl"><button class="x" id="mvp-quit"></button><div class="row"><button class="cb" id="mvp-prev" aria-label="prev">⏮</button>'
      + '<button class="cb big" id="mvp-play" aria-label="play">▶</button><button class="cb" id="mvp-next" aria-label="next">⏭</button></div>'
      + '</div><button class="more" id="mvp-more" aria-label="settings">⋯</button><div class="mnu hid" id="mvp-mnu"></div>'
      + '<div class="end hid"><h2></h2><p></p><button id="mvp-close"></button></div>';
    document.body.appendChild(d);
    d.addEventListener('pointerup', function (e) { if (e.target.closest('button') || !d.querySelector('.end').classList.contains('hid')) return;
      var m = $('mvp-mnu'); if (m && !m.classList.contains('hid')) { m.classList.add('hid'); return; }   // нажатие мимо меню — только закрыть его
      if (!paused) setPaused(true); });
    $('mvp-play').onclick = function () { setPaused(false); };
    $('mvp-next').onclick = function () { setPaused(false); goNext(); };
    $('mvp-prev').onclick = function () { setPaused(false); goPrev(); };
    $('mvp-quit').onclick = function () { var b = $('mvp-quit'); if (b.getAttribute('data-sure')) { finish(false); return; } b.setAttribute('data-sure', '1'); b.textContent = '✕ ' + t('sure'); };
    $('mvp-more').onclick = function (e) { e.stopPropagation(); var m = $('mvp-mnu'); if (m.classList.contains('hid')) menu(''); else m.classList.add('hid'); };
    $('mvp-close').onclick = close;
    return d;
  }
  // Меню «⋯»: строки с текущим значением → подменю с галочкой (как в системном плеере iPhone)
  var TEMPOS = [[0.8, 'tSlow'], [1, 'tNorm'], [1.25, 'tFast'], [1.5, 'tFast2']];
  function menu(sub) {
    var m = $('mvp-mnu'), h = '', onoff = function (v) { return t(v ? 'on' : 'off'); };
    var tl = (TEMPOS.filter(function (x) { return x[0] === P.tempo; })[0] || TEMPOS[1])[1];
    if (!sub) {
      h = row('tempo', '🏃', t('tempo'), t(tl)) + row('zoom', '⤢', t('zoom'), onoff(P.zoom)) + row('music', '🎵', t('music'), onoff(P.music)) + row('voice', '🔊', t('voice'), onoff(P.voice));
    } else {
      h = '<button type="button" data-k="" class="mh"><span class="mi">‹</span>' + esc(t(sub)) + '</button>';
      var opts = sub === 'tempo' ? TEMPOS.map(function (x) { return [x[0], t(x[1])]; }) : [[true, t('on')], [false, t('off')]];
      opts.forEach(function (o) { h += '<button type="button" data-set="' + sub + '" data-v="' + o[0] + '"><span class="ck">' + (P[sub] === o[0] ? '✓' : '') + '</span>' + esc(o[1]) + '</button>'; });
    }
    m.innerHTML = h; m.classList.remove('hid');
    m.querySelectorAll('button').forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        if (b.hasAttribute('data-k')) { menu(b.getAttribute('data-k')); return; }
        var k = b.getAttribute('data-set'), v = b.getAttribute('data-v');
        P[k] = k === 'tempo' ? +v : v === 'true'; savePrefs(P); applyPrefs(); menu('');
      };
    });
    function row(k, ic, lb, val) { return '<button type="button" data-k="' + k + '"><span class="mi">' + ic + '</span>' + esc(lb) + '<span class="mv">' + esc(val) + '</span><span class="mc">›</span></button>'; }
  }
  function applyPrefs() {
    voiceOn = P.voice; if (!voiceOn) hush();
    musicOn = P.music;
    el().classList.toggle('fill', !!P.zoom); fitBox();
    vids().forEach(function (v) { v.playbackRate = P.tempo; });
  }
  // «Крупный план»: вписать рамку движения в свободную часть экрана (между верхней полосой и подписью)
  function fitBox() {
    var d = el(); if (!d) return;
    var shown = d.getAttribute('data-clip') || '';
    [].slice.call(d.querySelectorAll('.fg')).forEach(function (fg) {
      if (!P.zoom || fg.classList.contains('hid') || !BOX[shown]) { fg.style.left = fg.style.top = fg.style.width = fg.style.height = ''; return; }
      var W = d.clientWidth, H = d.clientHeight, nw = fg.videoWidth || fg.naturalWidth || 16, nh = fg.videoHeight || fg.naturalHeight || 9, b = BOX[shown];
      var land = W > H, top = land ? 0 : 76, bot = land ? 0 : 170, side = land ? 0 : 8, aw = W - 2 * side, ah = H - top - bot;
      var sc = Math.min(aw / ((b[2] - b[0]) * nw), ah / ((b[3] - b[1]) * nh)); sc = Math.max(sc, Math.min(W / nw, H / nh));
      var vw = nw * sc, vh = nh * sc, cx = (b[0] + b[2]) / 2 * vw, cy = (b[1] + b[3]) / 2 * vh;
      fg.style.width = vw + 'px'; fg.style.height = vh + 'px'; fg.style.left = (side + aw / 2 - cx) + 'px'; fg.style.top = (top + ah / 2 - cy) + 'px';
    });
  }
  window.addEventListener('resize', function () { setTimeout(fitBox, 60); });
  function el() { return $('mvp'); }
  function vids() { return [].slice.call(el().querySelectorAll('video')); }
  function playV(v) { v.playbackRate = P.tempo || 1; if (paused) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  // показать ролик / фото / экран без ролика
  function showMedia(s) {
    var d = el(), src = s ? clipSrc(s.clip) : '', c = s && CLIPS[s.clip];
    var imgs = [].slice.call(d.querySelectorAll('img')), nc = d.querySelector('.nc');
    d.setAttribute('data-clip', src ? s.clip : '');
    vids().forEach(function (v) {
      var on = !!(src && !c.photo);
      v.classList.toggle('hid', !on);
      if (!on) { v.pause(); return; }
      if (v.getAttribute('data-f') !== src) { v.setAttribute('data-f', src); v.src = src; }
      try { v.currentTime = 0; } catch (e) {}
      playV(v);
    });
    imgs.forEach(function (i) { var on = !!(src && c.photo); i.classList.toggle('hid', !on); if (on && i.getAttribute('src') !== src) i.src = src; });
    nc.classList.toggle('hid', !!src);
    if (!src && s) { nc.querySelector('i').textContent = t('noclip'); nc.querySelector('span').textContent = s.how || ''; }
    fitBox();
  }

  function render() {
    var rest = phase === 'rest', s = rest ? S[idx + 1] : S[idx];
    el().classList.toggle('resting', rest);
    showMedia(s);
    $('mvp-blk').textContent = s.part + (s.rounds > 1 ? ' · ' + t('round').replace('{r}', s.round).replace('{n}', s.rounds) : '');
    $('mvp-tag').textContent = rest ? t('rest') + ' · ' + t('next') : (CLIPS[s.clip] && CLIPS[s.clip].photo ? t('hold') : t('follow'));
    $('mvp-name').textContent = s.name;
    $('mvp-dose').textContent = s.dose;
    $('mvp-hint').textContent = rest ? t('restNext') : (CLIPS[s.clip] ? s.how : '');
    $('mvp-unit').textContent = rest ? t('rest').toLowerCase() : t('sec');
    $('mvp-arc').style.stroke = rest ? '#5AC4B2' : '#C68C34';
    var h = ''; for (var i = 0; i < S.length; i++) h += '<i class="' + (i < idx ? 'd' : i === idx ? 'c' : '') + '"></i>';
    $('mvp-bar').innerHTML = h;
  }

  function startPhase(p) {
    phase = p; lastWhole = -1; saidHalf = false; $('mvp-321').classList.add('hid');
    total = left = (p === 'work' ? S[idx].sec : restAfter(idx));
    render();
    repMode = false;
    if (p === 'work') {
      var s = S[idx], c = CLIPS[s.clip];
      chime();
      if (s.reps && c && c.rep) {
        repMode = true; repsN = repsLeft = s.reps; repEnds = c.rep; repLastT = 0;
        $('mvp-unit').textContent = t('reps'); $('mvp-sec').textContent = repsLeft;
      }
      if (introDone !== idx) { introDone = idx; say((idx === 0 ? opening() + ' ' + t('sayStart') + ' ' : (fromRest ? t('sayGo') + ' ' : '')) + intro(s), true); }
      repSaid = false; fromRest = false;
    } else {
      // отдых: что будет дальше — сразу и коротко; в конце — голосом 3-2-1 с писком, на старте «Начали!» (владелец 2026-10-11)
      fromRest = true;
      say(t('sayRest') + ' ' + t('next') + ': ' + S[idx + 1].name + '.', true);
    }
  }
  function finishPhase() {
    if (phase === 'work') { endBeep(); if (restAfter(idx) > 0) { startPhase('rest'); return; } }
    idx++;
    if (idx >= S.length) { finish(true); return; }
    startPhase('work');
  }
  // Таймер на setInterval, не на requestAnimationFrame: rAF замирает в фоне/в части WebView, интервал надёжнее.
  function tick() {
    var now = performance.now();
    if (!last) last = now;
    var dt = (now - last) / 1000; last = now;
    if (paused || !el()) return;
    if (phase === 'work' && repMode) {
      var v = el().querySelector('video.fg'), tt = v ? v.currentTime : 0, crossed = 0;
      if (tt < repLastT - .5) { repEnds.forEach(function (b) { if (b > repLastT) crossed++; }); repEnds.forEach(function (b) { if (b <= tt) crossed++; }); }
      else repEnds.forEach(function (b) { if (b > repLastT && b <= tt) crossed++; });
      repLastT = tt;
      if (!repSaid && !busy()) { repSaid = true; say(String(repsLeft)); }   // «десять» — как только освободился голос
      for (var c = 0; c < crossed && repsLeft > 0; c++) { repsLeft--; if (repsLeft > 0) { say(String(repsLeft), true); repSaid = true; if (repsLeft <= 3) beep(); } }
      if (repsLeft <= 0) { finishPhase(); return; }
      if (voiceOn && repsLeft > 3 && Date.now() - lastSpoke > 15000 && !busy()) cheer();   // медленные повторы — тоже не молчим
      var prev = 0, nxt = repEnds[0]; for (var q = 0; q < repEnds.length; q++) { if (repEnds[q] <= tt) prev = repEnds[q]; else { nxt = repEnds[q]; break; } }
      var fr = Math.min(1, Math.max(0, (tt - prev) / Math.max(.1, nxt - prev)));
      $('mvp-sec').textContent = repsLeft;
      $('mvp-arc').style.strokeDashoffset = ARC * (1 - ((repsN - repsLeft + fr) / repsN));
      return;
    }
    left -= dt;
    if (left <= 0) { finishPhase(); return; }
    if (phase === 'work' && voiceOn && left > 12 && Date.now() - lastSpoke > 15000 && !busy()) cheer();
    var whole = Math.ceil(left);
    $('mvp-sec').textContent = whole;
    $('mvp-arc').style.strokeDashoffset = ARC * (1 - left / total);
    if (phase === 'work' && total >= 30 && !saidHalf && left <= total / 2) { saidHalf = true; say(t('sayHalf')); }
    if (whole !== lastWhole) {
      lastWhole = whole;
      var b = $('mvp-321');
      if (phase === 'work' && voiceOn && total >= 15 && whole <= 10) say(String(whole), true);   // голосом 10…1
      if (phase === 'rest' && voiceOn && whole <= 3) say(String(whole), true);   // конец отдыха — тоже вслух
      if (whole <= 3) { beep(); b.textContent = whole; b.classList.remove('hid'); } else b.classList.add('hid');
    }
  }

  function setPaused(p) {
    paused = p; el().classList.toggle('pz', p);
    var q = $('mvp-quit'); q.removeAttribute('data-sure'); q.textContent = '✕ ' + t('quit');
    if (AC) { p ? AC.suspend() : AC.resume(); }
    if (!p) unmuteIOS();
    last = 0;
    if (p) hush();
    vids().forEach(function (v) { if (v.classList.contains('hid')) return; p ? v.pause() : playV(v); });
  }
  function goNext() { if (phase === 'work' && repMode) { repsLeft = 0; finishPhase(); } else left = .0001; }
  function goPrev() {
    if (phase === 'rest') { startPhase('work'); return; }
    if (left < total - 2 || idx === 0) { startPhase('work'); return; }
    idx--; startPhase('work');
  }

  function finish(completed) {
    clearInterval(raf); hush(); stopMusic();
    vids().forEach(function (v) { v.pause(); });
    if (wake) { try { wake.release(); } catch (e) {} wake = null; }
    if (!completed) { close(); return; }
    try { var day = (typeof window._dayKey === 'function') ? window._dayKey() : new Date().toISOString().slice(0, 10);
      if (window.vialWorkouts && vialWorkouts.doneOn(day) !== wid) vialWorkouts.mark(wid, day, true); } catch (e) {}
    say(t('sayDone'), true);
    var e = el().querySelector('.end'); e.classList.remove('hid');
    e.querySelector('h2').textContent = t('doneH'); e.querySelector('p').textContent = t('doneT'); $('mvp-close').textContent = t('close');
    // дальше — «Как прошло?» (легко/нормально/тяжело + боль 0–10): по ответам меняется уровень (этап 2б)
    $('mvp-close').onclick = function () { close(); try { if (window.vialWorkouts && vialWorkouts.askFeel) vialWorkouts.askFeel(wid); } catch (er) {} };
  }
  function close() {
    clearInterval(raf); hush();
    if (mTimer) { clearInterval(mTimer); mTimer = null; mGain = null; }
    if (AC) { try { AC.close(); } catch (e) {} AC = null; }
    if (keepAlive) { try { keepAlive.pause(); } catch (e) {} }
    var d = el(); if (d) { vids().forEach(function (v) { v.pause(); v.removeAttribute('src'); }); d.remove(); }
    try { if (typeof window._rdWorkout === 'function') window._rdWorkout(); } catch (e) {}
  }

  function start(id, opts) {
    if (!window.vialWorkouts || el()) return;
    opts = opts || {};
    wid = id; S = vialWorkouts.steps(id, L(), !!opts.hyp);
    if (!S.length) return;
    // AudioContext и первое видео — прямо из нажатия «Начать» (иначе iPhone не даст звук и видео)
    unmuteIOS();
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); tone(1, .01, .0001); } catch (e) { AC = null; }
    pickVoices(); introDone = -1;
    if (window.speechSynthesis && !plug()) { try { var u0 = new SpeechSynthesisUtterance(' '); u0.volume = 0; window.speechSynthesis.speak(u0); } catch (e) {} }
    build();
    if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { wake = w; }).catch(function () {});
    vids().forEach(function (v) { v.muted = true; v.playsInline = true; });
    P = prefs(); startMusic(); applyPrefs();
    idx = 0; paused = false; last = 0;
    startPhase('work');
    raf = setInterval(tick, 100);
  }

  window.vialPlayer = { _fit: function () { fitBox(); }, start: start, close: close, hasClip: function (id) { return !!CLIPS[id]; }, label: function () { return t('start'); } };
})();
