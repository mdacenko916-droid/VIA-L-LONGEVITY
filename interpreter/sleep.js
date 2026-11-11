/* VIA·L / ADAM-L — блок «Сон» на принципах КПТ-І (этап 1, 2026-11-11; модель — docs/SLEEP-MODULE-MODEL.md).
   Один общий файл для обоих приложений, как day-tasks.js. Что делает:
   1. Дневник сна — 3 вопроса в шаге «Сон» прохода (#step16), ТОЛЬКО при включённом блоке.
      Кофе/алкоголь не спрашиваем: они уже есть в проходе (caffeine_late, alc).
   2. Эффективность сна = часы сна ÷ время в постели (считает код, не ИИ).
   3. Карточка в шаге 5 «Мой вечерний ритуал» (#rdSleep): включить блок, ритуал, «Не спится»,
      «Выгрузить мысли», напоминание, эффективность за 7 дней, красные флаги.
   4. Аудио-ритуал 5/10/15 мин голосом телефона: дыхание 4/6 → мышечное расслабление → сканирование тела;
      фон — шум, сгенерированный на лету (файлов нет).
   Рамка: «привычки сна», без диагнозов и без «лечения». Окно сна (сжатие) — этап 2, здесь его НЕТ.
   Данные дневника и записанные мысли — только на устройстве; в разбор уходят лишь цифры дневника. */
(function () {
  var KEY_ON = 'vial_sleep_on', KEY_LAST = 'vial_sleep_last', KEY_SET = 'vial_sleep_set',
      KEY_FLAGS = 'vial_sleep_flags', KEY_WORRY = 'vial_sleep_worry';

  function L() { return (typeof lang !== 'undefined' && lang) ? lang : 'en'; }
  function tr(o) { return (o && (o[L()] || o.en)) || ''; }
  function t(k) { return tr(S[k]); }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function on() { return get(KEY_ON, false) === true; }
  function brand() { return /ADAM/.test(document.title || '') ? 'ADAM-L' : 'VIA·L'; }

  // ── строки ×12 (русский — канон) ──
  var S = {
    card_t: {ru:'Работаю над сном',uk:'Працюю над сном',en:'Working on my sleep',es:'Trabajo mi sueño',de:'Ich arbeite an meinem Schlaf',pt:'Trabalhando o meu sono',fr:'Je travaille mon sommeil',pl:'Pracuję nad snem',it:'Lavoro sul mio sonno',he:'עובדים על השינה',ja:'睡眠に取り組む',ko:'수면 개선 중'},
    off_tx: {ru:'Включите — и по утрам в шаге «Сон» появятся три коротких вопроса дневника сна, а здесь — ритуал перед сном. Подход построен на принципах КПТ-И — его рекомендуют первым, когда сон разладился.',
             uk:'Увімкніть — і щоранку в кроці «Сон» з’являться три короткі запитання щоденника сну, а тут — ритуал перед сном. Підхід побудований на принципах КПТ-І — її рекомендують першою, коли сон розладнався.',
             en:'Turn it on and each morning the Sleep step will add three short sleep-diary questions, and here you’ll get a wind-down ritual. The approach follows the principles of CBT-I — the first thing recommended when sleep goes off track.',
             es:'Actívalo y cada mañana el paso «Sueño» añadirá tres preguntas breves del diario de sueño, y aquí tendrás un ritual para antes de dormir. El enfoque sigue los principios de la TCC-I, lo primero que se recomienda cuando el sueño se desajusta.',
             de:'Schalte es ein: Morgens kommen im Schritt „Schlaf“ drei kurze Fragen fürs Schlaftagebuch dazu, und hier ein Ritual vor dem Schlafen. Der Ansatz folgt den Prinzipien der KVT-I — sie wird als Erstes empfohlen, wenn der Schlaf aus dem Takt gerät.',
             pt:'Ative e, todas as manhãs, o passo «Sono» terá três perguntas curtas do diário do sono, e aqui um ritual antes de dormir. A abordagem segue os princípios da TCC-I — a primeira recomendação quando o sono se desregula.',
             fr:'Activez-le : chaque matin, l’étape « Sommeil » ajoutera trois courtes questions de journal du sommeil, et ici un rituel avant le coucher. L’approche suit les principes de la TCC-I, recommandée en premier quand le sommeil se dérègle.',
             pl:'Włącz — rano w kroku „Sen” pojawią się trzy krótkie pytania dziennika snu, a tutaj rytuał przed snem. Podejście opiera się na zasadach CBT-I — zalecanej jako pierwsza, gdy sen się rozregulował.',
             it:'Attivalo: ogni mattina il passo «Sonno» aggiungerà tre brevi domande del diario del sonno, e qui avrai un rituale prima di dormire. L’approccio segue i principi della CBT-I, la prima cosa consigliata quando il sonno si scombina.',
             he:'הפעילו — ובכל בוקר יופיעו בשלב «שינה» שלוש שאלות קצרות של יומן שינה, וכאן — טקס לפני השינה. הגישה בנויה על עקרונות CBT-I — מה שממליצים עליו ראשון כשהשינה משתבשת.',
             ja:'オンにすると、毎朝「睡眠」ステップに睡眠日誌の短い質問が3つ加わり、ここには寝る前のリラックス習慣が表示されます。CBT-Iの原則に基づくアプローチで、睡眠が乱れたときに最初にすすめられる方法です。',
             ko:'켜면 매일 아침 ‘수면’ 단계에 짧은 수면 일지 질문 3개가 추가되고, 여기에는 잠들기 전 루틴이 나타나요. CBT-I 원칙에 기반한 방법으로, 수면이 흐트러졌을 때 가장 먼저 권장되는 접근이에요.'},
    btn_on: {ru:'Включить',uk:'Увімкнути',en:'Turn on',es:'Activar',de:'Einschalten',pt:'Ativar',fr:'Activer',pl:'Włącz',it:'Attiva',he:'הפעלה',ja:'オンにする',ko:'켜기'},
    btn_off: {ru:'Выключить блок «Сон»',uk:'Вимкнути блок «Сон»',en:'Turn off the Sleep block',es:'Desactivar el bloque «Sueño»',de:'Block „Schlaf“ ausschalten',pt:'Desativar o bloco «Sono»',fr:'Désactiver le bloc « Sommeil »',pl:'Wyłącz blok „Sen”',it:'Disattiva il blocco «Sonno»',he:'כיבוי בלוק «שינה»',ja:'「睡眠」をオフにする',ko:'‘수면’ 끄기'},
    // (i) в карточке — про голос и звук (2026-11-11, владелец: пути в настройках не называть — их меняют обновления)
    info: {ru:'Голос ритуала — встроенный голос вашего телефона, он работает без интернета. Его можно сменить или скачать более естественный в настройках телефона. Фон — тихая мелодия 60 ударов в минуту, она гаснет после ритуала.',uk:'Голос ритуалу — вбудований голос вашого телефона, він працює без інтернету. Його можна змінити або завантажити природніший у налаштуваннях телефона. Фон — тиха мелодія 60 ударів на хвилину, вона згасає після ритуалу.',en:'The ritual voice is your phone’s built-in voice and works offline. You can change it or download a more natural one in your phone’s settings. The background is a quiet melody at 60 beats per minute that fades after the ritual.',es:'La voz del ritual es la voz integrada de tu teléfono y funciona sin internet. Puedes cambiarla o descargar una más natural en los ajustes del teléfono. El fondo es una melodía suave de 60 pulsaciones por minuto que se apaga al terminar el ritual.',de:'Die Stimme im Ritual ist die eingebaute Stimme deines Telefons und funktioniert ohne Internet. Du kannst sie in den Einstellungen des Telefons ändern oder eine natürlichere herunterladen. Im Hintergrund läuft eine leise Melodie mit 60 Schlägen pro Minute, die nach dem Ritual ausklingt.',pt:'A voz do ritual é a voz embutida do seu celular e funciona sem internet. Você pode trocá-la ou baixar uma mais natural nas configurações do celular. O fundo é uma melodia suave de 60 batidas por minuto que se apaga depois do ritual.',fr:'La voix du rituel est la voix intégrée de votre téléphone et fonctionne sans internet. Vous pouvez la changer ou en télécharger une plus naturelle dans les réglages du téléphone. En fond, une mélodie douce à 60 battements par minute, qui s’éteint après le rituel.',pl:'Głos rytuału to wbudowany głos Twojego telefonu i działa bez internetu. Możesz go zmienić albo pobrać bardziej naturalny w ustawieniach telefonu. W tle gra cicha melodia 60 uderzeń na minutę, która wygasa po rytuale.',it:'La voce del rituale è la voce integrata del tuo telefono e funziona senza internet. Puoi cambiarla o scaricarne una più naturale nelle impostazioni del telefono. Lo sfondo è una melodia leggera a 60 battiti al minuto che si spegne dopo il rituale.',he:'הקול בטקס הוא הקול המובנה של הטלפון, והוא עובד בלי אינטרנט. אפשר להחליף אותו או להוריד קול טבעי יותר בהגדרות הטלפון. ברקע מתנגנת מנגינה שקטה של 60 פעימות לדקה, שדועכת בסוף הטקס.',ja:'習慣の声はスマートフォンに内蔵された音声で、インターネットなしで使えます。スマートフォンの設定で変更したり、より自然な音声をダウンロードしたりできます。背景は1分間60拍の静かなメロディで、習慣が終わると消えていきます。',ko:'루틴의 목소리는 휴대폰에 내장된 음성이라 인터넷 없이도 작동해요. 휴대폰 설정에서 바꾸거나 더 자연스러운 음성을 내려받을 수 있어요. 배경은 분당 60박의 조용한 멜로디이고, 루틴이 끝나면 사라져요.'},
    // «Читать о сне»: 5 статей «Основ» раздела «Сон: КПТ-И» (articles.js) + исследования о сне в Библиотеке VIA-L
    read: {ru:'Читать о сне',uk:'Читати про сон',en:'Read about sleep',es:'Leer sobre el sueño',de:'Über Schlaf lesen',pt:'Ler sobre o sono',fr:'Lire sur le sommeil',pl:'Czytaj o śnie',it:'Leggi sul sonno',he:'לקרוא על שינה',ja:'睡眠について読む',ko:'수면에 대해 읽기'},
    read_res: {ru:'Исследования о сне',uk:'Дослідження про сон',en:'Sleep research',es:'Estudios sobre el sueño',de:'Studien zum Schlaf',pt:'Estudos sobre o sono',fr:'Études sur le sommeil',pl:'Badania o śnie',it:'Studi sul sonno',he:'מחקרים על שינה',ja:'睡眠の研究',ko:'수면 연구'},
    // Дневник отдельно от ритуала (2026-11-11, владелец): ритуал, «Не спится», мысли, чтение — всем сразу; дневник (3 вопроса утром)
    // включается сам по сигналу (жалоба «Сон» / «Фокус недели» про сон / сон ≤4 в 3 из 7 дней), если человек сам его не выключал.
    d_lbl: {ru:'Дневник сна по утрам',uk:'Щоденник сну щоранку',en:'Morning sleep diary',es:'Diario de sueño por la mañana',de:'Schlaftagebuch am Morgen',pt:'Diário do sono pela manhã',fr:'Agenda du sommeil le matin',pl:'Poranny dziennik snu',it:'Diario del sonno al mattino',he:'יומן שינה בבוקר',ja:'朝の睡眠日誌',ko:'아침 수면 일지'},
    d_tx: {ru:'Три коротких вопроса в шаге «Сон» утром: когда легли, сколько засыпали, когда встали. Из них считается эффективность сна — главная цифра КПТ-И.',uk:'Три короткі запитання в кроці «Сон» зранку: коли лягли, скільки засинали, коли встали. З них рахується ефективність сну — головна цифра КПТ-І.',en:'Three short questions in the morning Sleep step: when you went to bed, how long it took to fall asleep, when you got up. They give your sleep efficiency — the key number in CBT-I.',es:'Tres preguntas cortas en el paso «Sueño» de la mañana: a qué hora te acostaste, cuánto tardaste en dormirte, a qué hora te levantaste. Con ellas se calcula la eficiencia del sueño, la cifra clave de la TCC-I.',de:'Drei kurze Fragen im Schritt „Schlaf“ am Morgen: wann du ins Bett gegangen bist, wie lange das Einschlafen gedauert hat, wann du aufgestanden bist. Daraus ergibt sich die Schlafeffizienz — die zentrale Zahl der KVT-I.',pt:'Três perguntas curtas na etapa «Sono» da manhã: quando se deitou, quanto demorou para dormir, quando se levantou. Delas sai a eficiência do sono — o número-chave da TCC-I.',fr:'Trois questions courtes à l’étape « Sommeil » du matin : l’heure du coucher, le temps d’endormissement, l’heure du lever. Elles donnent l’efficacité du sommeil — le chiffre clé de la TCC-I.',pl:'Trzy krótkie pytania w porannym kroku „Sen”: kiedy kładziesz się spać, ile trwa zasypianie, kiedy wstajesz. Z nich liczy się wydajność snu — kluczowa liczba CBT-I.',it:'Tre brevi domande nel passaggio «Sonno» del mattino: quando vai a letto, quanto ci metti ad addormentarti, quando ti alzi. Da qui si calcola l’efficienza del sonno, il numero chiave della CBT-I.',he:'שלוש שאלות קצרות בשלב ״שינה״ בבוקר: מתי נכנסתם למיטה, כמה זמן לקח להירדם, מתי קמתם. מהן מחושבת יעילות השינה — המספר המרכזי של CBT-I.',ja:'朝の「睡眠」ステップに短い質問が3つ:床に就いた時刻、寝つくまでの時間、起きた時刻。ここからCBT-Iの大事な数字、睡眠効率を計算します。',ko:'아침 \'수면\' 단계에 짧은 질문 3개: 잠자리에 든 시간, 잠들기까지 걸린 시간, 일어난 시간. 여기서 CBT-I의 핵심 숫자인 수면 효율을 계산해요.'},
    d_on: {ru:'Включить дневник',uk:'Увімкнути щоденник',en:'Turn on the diary',es:'Activar el diario',de:'Tagebuch einschalten',pt:'Ativar o diário',fr:'Activer l’agenda',pl:'Włącz dziennik',it:'Attiva il diario',he:'הפעלת היומן',ja:'日誌をオンにする',ko:'일지 켜기'},
    d_off: {ru:'Выключить дневник',uk:'Вимкнути щоденник',en:'Turn off the diary',es:'Desactivar el diario',de:'Tagebuch ausschalten',pt:'Desativar o diário',fr:'Désactiver l’agenda',pl:'Wyłącz dziennik',it:'Disattiva il diario',he:'כיבוי היומן',ja:'日誌をオフにする',ko:'일지 끄기'},
    d_auto: {ru:'Дневник включился сам: {why}. Если не нужен — выключите.',uk:'Щоденник увімкнувся сам: {why}. Якщо не потрібен — вимкніть.',en:'The diary turned on by itself: {why}. If you don’t need it, turn it off.',es:'El diario se activó solo: {why}. Si no lo necesitas, desactívalo.',de:'Das Tagebuch hat sich selbst eingeschaltet: {why}. Wenn du es nicht brauchst, schalte es aus.',pt:'O diário foi ativado sozinho: {why}. Se não precisar, desative.',fr:'L’agenda s’est activé tout seul : {why}. S’il ne vous sert pas, désactivez-le.',pl:'Dziennik włączył się sam: {why}. Jeśli go nie potrzebujesz — wyłącz.',it:'Il diario si è attivato da solo: {why}. Se non ti serve, disattivalo.',he:'היומן הופעל מעצמו: {why}. אם אין בו צורך — כבו אותו.',ja:'日誌が自動でオンになりました:{why}。不要ならオフにしてください。',ko:'일지가 자동으로 켜졌어요: {why}. 필요 없으면 끄세요.'},
    why_cmp: {ru:'вы отметили, что беспокоит сон',uk:'ви відзначили, що турбує сон',en:'you said sleep is bothering you',es:'indicaste que te preocupa el sueño',de:'du hast Schlaf als Beschwerde angegeben',pt:'você indicou que o sono incomoda',fr:'vous avez indiqué que le sommeil vous gêne',pl:'zaznaczono, że dokucza sen',it:'hai indicato che il sonno ti disturba',he:'סימנתם שהשינה מטרידה',ja:'睡眠が気になると選ばれたため',ko:'수면이 신경 쓰인다고 표시하셨어요'},
    why_focus: {ru:'«Фокус недели» сейчас про сон',uk:'«Фокус тижня» зараз про сон',en:'this week’s focus is on sleep',es:'el foco de la semana es el sueño',de:'der Wochenfokus liegt auf dem Schlaf',pt:'o foco da semana é o sono',fr:'le focus de la semaine porte sur le sommeil',pl:'fokus tygodnia dotyczy snu',it:'il focus della settimana è il sonno',he:'מוקד השבוע הוא השינה',ja:'今週のフォーカスが睡眠のため',ko:'이번 주 포커스가 수면이에요'},
    why_q: {ru:'сон был плохим 3 из последних 7 дней',uk:'сон був поганим 3 з останніх 7 днів',en:'sleep was poor on 3 of the last 7 days',es:'el sueño fue malo 3 de los últimos 7 días',de:'der Schlaf war an 3 der letzten 7 Tage schlecht',pt:'o sono foi ruim em 3 dos últimos 7 dias',fr:'le sommeil a été mauvais 3 des 7 derniers jours',pl:'sen był słaby 3 z ostatnich 7 dni',it:'il sonno è stato scarso 3 degli ultimi 7 giorni',he:'השינה הייתה גרועה 3 מתוך 7 הימים האחרונים',ja:'直近7日のうち3日、睡眠がよくなかったため',ko:'최근 7일 중 3일 수면이 좋지 않았어요'},
    ritual: {ru:'Ритуал перед сном',uk:'Ритуал перед сном',en:'Wind-down ritual',es:'Ritual antes de dormir',de:'Ritual vor dem Schlafen',pt:'Ritual antes de dormir',fr:'Rituel avant le coucher',pl:'Rytuał przed snem',it:'Rituale prima di dormire',he:'טקס לפני השינה',ja:'寝る前の習慣',ko:'잠들기 전 루틴'},
    awake: {ru:'Не спится',uk:'Не спиться',en:'Can’t sleep',es:'No puedo dormir',de:'Kann nicht schlafen',pt:'Não consigo dormir',fr:'Je n’arrive pas à dormir',pl:'Nie mogę zasnąć',it:'Non riesco a dormire',he:'לא נרדמים',ja:'眠れない',ko:'잠이 안 와요'},
    worry: {ru:'Выгрузить мысли',uk:'Вивантажити думки',en:'Offload my thoughts',es:'Vaciar la mente',de:'Gedanken abladen',pt:'Despejar os pensamentos',fr:'Déposer mes pensées',pl:'Wyrzuć myśli z głowy',it:'Scaricare i pensieri',he:'לפרוק מחשבות',ja:'考えを書き出す',ko:'생각 내려놓기'},
    dur: {ru:'Длительность',uk:'Тривалість',en:'Length',es:'Duración',de:'Dauer',pt:'Duração',fr:'Durée',pl:'Czas',it:'Durata',he:'משך',ja:'長さ',ko:'길이'},
    min: {ru:'мин',uk:'хв',en:'min',es:'min',de:'Min',pt:'min',fr:'min',pl:'min',it:'min',he:'דק׳',ja:'分',ko:'분'},
    noise: {ru:'Фон',uk:'Фон',en:'Background',es:'Fondo',de:'Hintergrund',pt:'Fundo',fr:'Fond sonore',pl:'Tło',it:'Sottofondo',he:'רקע',ja:'背景音',ko:'배경음'},
    n_none: {ru:'Тишина',uk:'Тиша',en:'Silence',es:'Silencio',de:'Stille',pt:'Silêncio',fr:'Silence',pl:'Cisza',it:'Silenzio',he:'שקט',ja:'無音',ko:'무음'},
    n_music: {ru:'Мелодия для сна',uk:'Мелодія для сну',en:'Sleep melody',es:'Melodía para dormir',de:'Schlafmelodie',pt:'Melodia para dormir',fr:'Mélodie pour dormir',pl:'Melodia do snu',it:'Melodia per dormire',he:'מנגינה לשינה',ja:'眠りのメロディ',ko:'수면 멜로디'},
    remind: {ru:'Напомнить о ритуале',uk:'Нагадати про ритуал',en:'Remind me of the ritual',es:'Recordarme el ritual',de:'An das Ritual erinnern',pt:'Lembrar do ritual',fr:'Me rappeler le rituel',pl:'Przypomnij o rytuale',it:'Ricordami il rituale',he:'תזכורת לטקס',ja:'習慣のリマインダー',ko:'루틴 알림'},
    remind_off: {ru:'не напоминать',uk:'не нагадувати',en:'no reminder',es:'sin recordatorio',de:'keine Erinnerung',pt:'sem lembrete',fr:'pas de rappel',pl:'bez przypomnienia',it:'nessun promemoria',he:'ללא תזכורת',ja:'通知しない',ko:'알림 없음'},
    eff7: {ru:'Эффективность сна за 7 дней',uk:'Ефективність сну за 7 днів',en:'Sleep efficiency, last 7 days',es:'Eficiencia del sueño, 7 días',de:'Schlafeffizienz, 7 Tage',pt:'Eficiência do sono, 7 dias',fr:'Efficacité du sommeil, 7 jours',pl:'Efektywność snu, 7 dni',it:'Efficienza del sonno, 7 giorni',he:'יעילות שינה, 7 ימים',ja:'睡眠効率（7日間）',ko:'수면 효율 (7일)'},
    eff_hint: {ru:'Сколько из времени в постели вы спали. Ориентир — от 85%.',uk:'Скільки з часу в ліжку ви спали. Орієнтир — від 85%.',en:'How much of your time in bed you were asleep. Aim for 85% or more.',es:'Qué parte del tiempo en la cama dormiste. Referencia: 85 % o más.',de:'Wie viel der Zeit im Bett du geschlafen hast. Richtwert: ab 85 %.',pt:'Quanto do tempo na cama você dormiu. Referência: 85% ou mais.',fr:'Part du temps au lit passée à dormir. Repère : 85 % ou plus.',pl:'Ile czasu w łóżku przespałeś(-aś). Punkt odniesienia — od 85%.',it:'Quanta parte del tempo a letto hai dormito. Riferimento: dall’85%.',he:'כמה מהזמן במיטה ישנתם. היעד — 85% ומעלה.',ja:'ベッドにいた時間のうち眠っていた割合。目安は85%以上。',ko:'침대에 있던 시간 중 잠든 비율. 기준은 85% 이상.'},
    eff_none: {ru:'Отмечайте сон по утрам — здесь появится эффективность сна.',uk:'Позначайте сон щоранку — тут з’явиться ефективність сну.',en:'Log your sleep in the mornings and your sleep efficiency will show up here.',es:'Registra tu sueño por las mañanas y aquí aparecerá tu eficiencia del sueño.',de:'Trage morgens deinen Schlaf ein — dann erscheint hier deine Schlafeffizienz.',pt:'Registre o sono pela manhã e a eficiência do sono aparecerá aqui.',fr:'Notez votre sommeil le matin : votre efficacité du sommeil s’affichera ici.',pl:'Zapisuj sen rano — tutaj pojawi się efektywność snu.',it:'Registra il sonno al mattino e qui comparirà l’efficienza del sonno.',he:'סמנו את השינה בבקרים — וכאן תופיע יעילות השינה.',ja:'毎朝睡眠を記録すると、ここに睡眠効率が表示されます。',ko:'아침마다 수면을 기록하면 여기에 수면 효율이 표시돼요.'},
    // дневник в проходе
    d_t: {ru:'Дневник сна',uk:'Щоденник сну',en:'Sleep diary',es:'Diario de sueño',de:'Schlaftagebuch',pt:'Diário do sono',fr:'Journal du sommeil',pl:'Dziennik snu',it:'Diario del sonno',he:'יומן שינה',ja:'睡眠日誌',ko:'수면 일지'},
    d_bed: {ru:'Во сколько легли?',uk:'О котрій лягли?',en:'What time did you go to bed?',es:'¿A qué hora te acostaste?',de:'Wann bist du ins Bett gegangen?',pt:'A que horas se deitou?',fr:'À quelle heure vous êtes-vous couché(e) ?',pl:'O której się położyłeś(-aś)?',it:'A che ora sei andato/a a letto?',he:'מתי הלכתם לישון?',ja:'何時に布団に入りましたか？',ko:'몇 시에 잠자리에 들었나요?'},
    d_lat: {ru:'Сколько примерно засыпали?',uk:'Скільки приблизно засинали?',en:'Roughly how long did it take to fall asleep?',es:'¿Cuánto tardaste más o menos en dormirte?',de:'Wie lange hat das Einschlafen ungefähr gedauert?',pt:'Quanto tempo levou, mais ou menos, para adormecer?',fr:'Combien de temps environ pour vous endormir ?',pl:'Ile mniej więcej zasypiałeś(-aś)?',it:'Più o meno quanto ci hai messo ad addormentarti?',he:'בערך כמה זמן לקח להירדם?',ja:'寝つくまでにだいたいどのくらいかかりましたか？',ko:'잠들기까지 대략 얼마나 걸렸나요?'},
    d_rise: {ru:'Во сколько встали с кровати?',uk:'О котрій встали з ліжка?',en:'What time did you get out of bed?',es:'¿A qué hora te levantaste de la cama?',de:'Wann bist du aufgestanden?',pt:'A que horas saiu da cama?',fr:'À quelle heure vous êtes-vous levé(e) ?',pl:'O której wstałeś(-aś) z łóżka?',it:'A che ora ti sei alzato/a dal letto?',he:'מתי קמתם מהמיטה?',ja:'何時にベッドから出ましたか？',ko:'몇 시에 침대에서 일어났나요?'},
    d_prev: {ru:'Подставлено как в прошлый раз — поправьте, если было иначе.',uk:'Підставлено як минулого разу — виправте, якщо було інакше.',en:'Filled in as last time — change it if it was different.',es:'Rellenado como la última vez; cámbialo si fue distinto.',de:'Wie beim letzten Mal ausgefüllt — ändere es, wenn es anders war.',pt:'Preenchido como da última vez — altere se foi diferente.',fr:'Rempli comme la dernière fois — modifiez si c’était différent.',pl:'Wpisane jak ostatnio — popraw, jeśli było inaczej.',it:'Compilato come l’ultima volta: correggi se è andata diversamente.',he:'מולא כמו בפעם הקודמת — תקנו אם היה אחרת.',ja:'前回と同じ内容を入れています。違う場合は直してください。',ko:'지난번과 같게 채웠어요. 다르면 고쳐 주세요.'},
    lat_a: {ru:'до 15 мин',uk:'до 15 хв',en:'under 15 min',es:'menos de 15 min',de:'unter 15 Min',pt:'até 15 min',fr:'moins de 15 min',pl:'do 15 min',it:'meno di 15 min',he:'עד 15 דק׳',ja:'15分未満',ko:'15분 미만'},
    lat_b: {ru:'15–30 мин',uk:'15–30 хв',en:'15–30 min',es:'15–30 min',de:'15–30 Min',pt:'15–30 min',fr:'15–30 min',pl:'15–30 min',it:'15–30 min',he:'15–30 דק׳',ja:'15〜30分',ko:'15–30분'},
    lat_c: {ru:'30–60 мин',uk:'30–60 хв',en:'30–60 min',es:'30–60 min',de:'30–60 Min',pt:'30–60 min',fr:'30–60 min',pl:'30–60 min',it:'30–60 min',he:'30–60 דק׳',ja:'30〜60分',ko:'30–60분'},
    lat_d: {ru:'больше часа',uk:'понад годину',en:'over an hour',es:'más de una hora',de:'über eine Stunde',pt:'mais de uma hora',fr:'plus d’une heure',pl:'ponad godzinę',it:'più di un’ora',he:'יותר משעה',ja:'1時間以上',ko:'1시간 이상'},
    // красные флаги
    f_apnea: {ru:'Храп и замеченные паузы дыхания — повод показать сон врачу-сомнологу: так проверяют апноэ. Пока не проверили — не сокращайте время в постели.',
              uk:'Хропіння і помічені паузи дихання — привід показати сон лікарю-сомнологу: так перевіряють апное. Поки не перевірили — не скорочуйте час у ліжку.',
              en:'Snoring and noticed pauses in breathing are a reason to see a sleep doctor — that’s how sleep apnoea is checked. Until then, don’t cut your time in bed.',
              es:'Ronquidos y pausas de respiración observadas son motivo para consultar a un especialista del sueño: así se descarta la apnea. Hasta entonces, no reduzcas el tiempo en la cama.',
              de:'Schnarchen und bemerkte Atemaussetzer sind ein Grund für einen Schlafmediziner — so wird Schlafapnoe abgeklärt. Bis dahin die Zeit im Bett nicht verkürzen.',
              pt:'Ronco e pausas na respiração notadas são motivo para procurar um médico do sono — é assim que se verifica a apneia. Até lá, não reduza o tempo na cama.',
              fr:'Ronflements et pauses respiratoires remarquées : c’est une raison de consulter un médecin du sommeil, qui vérifiera l’apnée. D’ici là, ne réduisez pas le temps passé au lit.',
              pl:'Chrapanie i zauważone przerwy w oddychaniu to powód, by pokazać sen lekarzowi snu — tak sprawdza się bezdech. Do tego czasu nie skracaj czasu w łóżku.',
              it:'Russare e pause del respiro notate sono un motivo per rivolgersi a un medico del sonno: così si verifica l’apnea. Fino ad allora non ridurre il tempo a letto.',
              he:'נחירות והפסקות נשימה שנצפו — סיבה להראות את השינה לרופא שינה: כך בודקים דום נשימה. עד הבדיקה — לא לקצר את הזמן במיטה.',
              ja:'いびきと呼吸の停止に気づいたら、睡眠専門の医師に相談を。睡眠時無呼吸はそうして確認します。それまではベッドにいる時間を減らさないでください。',
              ko:'코골이와 숨이 멈추는 것이 관찰되면 수면 전문의에게 보여 주세요. 수면무호흡은 그렇게 확인해요. 그 전까지는 침대에 있는 시간을 줄이지 마세요.'},
    f_sleepy: {ru:'Сонливость днём — тоже скажите о ней врачу: при ней время в постели не сокращают.',uk:'Сонливість удень — теж скажіть про неї лікарю: за неї час у ліжку не скорочують.',en:'Daytime sleepiness is worth mentioning to a doctor too — with it, time in bed shouldn’t be cut.',es:'La somnolencia diurna también conviene comentarla al médico: con ella no se reduce el tiempo en la cama.',de:'Tagesmüdigkeit auch beim Arzt ansprechen — dann wird die Zeit im Bett nicht verkürzt.',pt:'Sonolência durante o dia também deve ser comentada com o médico — com ela não se reduz o tempo na cama.',fr:'La somnolence en journée mérite aussi d’être signalée au médecin : dans ce cas, on ne réduit pas le temps au lit.',pl:'Senność w ciągu dnia też zgłoś lekarzowi — przy niej nie skraca się czasu w łóżku.',it:'Anche la sonnolenza di giorno va riferita al medico: in questo caso il tempo a letto non si riduce.',he:'גם על ישנוניות ביום כדאי לספר לרופא — כשהיא קיימת לא מקצרים את הזמן במיטה.',ja:'日中の眠気も医師に伝えましょう。その場合、ベッドにいる時間は減らしません。',ko:'낮 졸림도 의사에게 말해 주세요. 이럴 때는 침대에 있는 시간을 줄이지 않아요.'},
    f_rls: {ru:'Беспокойные ноги мешают уснуть — стоит проверить ферритин (запасы железа).',uk:'Неспокійні ноги заважають заснути — варто перевірити феритин (запаси заліза).',en:'Restless legs keeping you awake — worth checking ferritin (your iron stores).',es:'Si las piernas inquietas no te dejan dormir, conviene revisar la ferritina (reservas de hierro).',de:'Unruhige Beine halten wach — es lohnt sich, Ferritin (Eisenspeicher) zu prüfen.',pt:'Pernas inquietas atrapalham o sono — vale verificar a ferritina (reservas de ferro).',fr:'Des jambes sans repos empêchent de dormir : il vaut la peine de vérifier la ferritine (réserves en fer).',pl:'Niespokojne nogi nie dają zasnąć — warto sprawdzić ferrytynę (zapasy żelaza).',it:'Le gambe senza riposo impediscono di dormire: conviene controllare la ferritina (riserve di ferro).',he:'רגליים חסרות מנוחה מפריעות להירדם — כדאי לבדוק פריטין (מאגרי ברזל).',ja:'脚のむずむずで眠れないなら、フェリチン（鉄の蓄え）を調べる価値があります。',ko:'다리가 불편해 잠들기 어렵다면 페리틴(철 저장량)을 확인해 볼 만해요.'},
    f_early: {ru:'Просыпаетесь в 4–5 утра и днём бодры? Похоже на сдвиг внутренних часов, а не на бессонницу: утренний свет и не ложиться слишком рано.',uk:'Прокидаєтеся о 4–5 ранку і вдень бадьорі? Схоже на зсув внутрішнього годинника, а не на безсоння: ранкове світло і не лягати надто рано.',en:'Waking at 4–5 am yet alert during the day? That looks like a shift in your body clock rather than insomnia: get morning light and don’t go to bed too early.',es:'¿Te despiertas a las 4–5 y de día estás bien? Parece un cambio del reloj interno, no insomnio: luz por la mañana y no acostarte demasiado pronto.',de:'Um 4–5 Uhr wach und tagsüber fit? Das sieht eher nach einer verschobenen inneren Uhr aus als nach Schlaflosigkeit: Morgenlicht und nicht zu früh ins Bett.',pt:'Acorda às 4–5 e de dia está bem disposto? Parece uma mudança do relógio interno, não insónia: luz de manhã e não deitar cedo demais.',fr:'Réveil à 4–5 h mais en forme la journée ? Cela ressemble plus à un décalage de l’horloge interne qu’à une insomnie : lumière du matin et ne pas se coucher trop tôt.',pl:'Budzisz się o 4–5 rano, a w dzień masz energię? To raczej przesunięcie zegara biologicznego niż bezsenność: poranne światło i nie kłaść się zbyt wcześnie.',it:'Ti svegli alle 4–5 ma di giorno sei in forma? Sembra uno spostamento dell’orologio interno, non insonnia: luce al mattino e non andare a letto troppo presto.',he:'מתעוררים ב־4–5 בבוקר ובמשך היום ערניים? זה נראה כמו הזזה של השעון הפנימי ולא נדודי שינה: אור בוקר ולא ללכת לישון מוקדם מדי.',ja:'朝4〜5時に目が覚めても日中は元気？不眠よりも体内時計のずれに近い状態です。朝の光を浴び、早すぎる就寝は避けましょう。',ko:'새벽 4–5시에 깨도 낮에 활기차다면? 불면보다는 생체 시계가 앞당겨진 것에 가까워요. 아침 햇빛을 쬐고 너무 일찍 눕지 마세요.'},
    // экраны
    start: {ru:'Начать',uk:'Почати',en:'Start',es:'Empezar',de:'Starten',pt:'Começar',fr:'Commencer',pl:'Zacznij',it:'Inizia',he:'התחלה',ja:'はじめる',ko:'시작'},
    stop: {ru:'Остановить',uk:'Зупинити',en:'Stop',es:'Detener',de:'Stoppen',pt:'Parar',fr:'Arrêter',pl:'Zatrzymaj',it:'Ferma',he:'עצירה',ja:'停止',ko:'정지'},
    close: {ru:'Закрыть',uk:'Закрити',en:'Close',es:'Cerrar',de:'Schließen',pt:'Fechar',fr:'Fermer',pl:'Zamknij',it:'Chiudi',he:'סגירה',ja:'閉じる',ko:'닫기'},
    b_in: {ru:'Вдох',uk:'Вдих',en:'Breathe in',es:'Inhala',de:'Einatmen',pt:'Inspire',fr:'Inspirez',pl:'Wdech',it:'Inspira',he:'שאיפה',ja:'吸って',ko:'들이쉬고'},
    b_out: {ru:'Выдох',uk:'Видих',en:'Breathe out',es:'Exhala',de:'Ausatmen',pt:'Expire',fr:'Expirez',pl:'Wydech',it:'Espira',he:'נשיפה',ja:'吐いて',ko:'내쉬고'},
    keep: {ru:'Экран останется тёмным. Не блокируйте телефон — просто положите рядом.',uk:'Екран залишиться темним. Не блокуйте телефон — просто покладіть поруч.',en:'The screen will stay dark. Don’t lock your phone — just put it down nearby.',es:'La pantalla quedará oscura. No bloquees el móvil; déjalo cerca.',de:'Der Bildschirm bleibt dunkel. Sperre das Handy nicht — leg es einfach neben dich.',pt:'O ecrã ficará escuro. Não bloqueie o telemóvel — pouse-o perto.',fr:'L’écran restera sombre. Ne verrouillez pas le téléphone, posez-le simplement à côté.',pl:'Ekran pozostanie ciemny. Nie blokuj telefonu — po prostu połóż go obok.',it:'Lo schermo resterà scuro. Non bloccare il telefono: appoggialo vicino.',he:'המסך יישאר כהה. אל תנעלו את הטלפון — פשוט הניחו אותו לידכם.',ja:'画面は暗いままです。ロックせず、そばに置いておいてください。',ko:'화면은 어둡게 유지돼요. 잠그지 말고 곁에 두세요.'},
    w_tx: {ru:'Запишите, что крутится в голове, и одно первое действие на завтра. Записи остаются только в телефоне.',uk:'Запишіть, що крутиться в голові, і одну першу дію на завтра. Записи залишаються лише в телефоні.',en:'Write down what’s going round in your head and one first step for tomorrow. Notes stay on your phone only.',es:'Escribe lo que te da vueltas en la cabeza y un primer paso para mañana. Las notas se quedan solo en tu móvil.',de:'Schreib auf, was dir durch den Kopf geht, und einen ersten Schritt für morgen. Die Notizen bleiben nur auf deinem Handy.',pt:'Escreva o que está a rodar na cabeça e um primeiro passo para amanhã. As notas ficam só no telemóvel.',fr:'Notez ce qui tourne dans votre tête et une première action pour demain. Les notes restent uniquement sur votre téléphone.',pl:'Zapisz, co krąży ci po głowie, i jeden pierwszy krok na jutro. Notatki zostają tylko w telefonie.',it:'Scrivi cosa ti gira in testa e un primo passo per domani. Le note restano solo sul telefono.',he:'כתבו מה מסתובב לכם בראש וצעד ראשון אחד למחר. הרשומות נשארות רק בטלפון.',ja:'頭の中をめぐっていることと、明日の最初の一歩をひとつ書き出しましょう。メモはスマホの中だけに残ります。',ko:'머릿속을 맴도는 생각과 내일의 첫 행동 하나를 적어 보세요. 메모는 휴대폰에만 남아요.'},
    w_ph: {ru:'Что не даёт покоя…',uk:'Що не дає спокою…',en:'What’s on your mind…',es:'Lo que me inquieta…',de:'Was mich beschäftigt …',pt:'O que me inquieta…',fr:'Ce qui me préoccupe…',pl:'Co nie daje spokoju…',it:'Cosa mi preoccupa…',he:'מה לא נותן מנוחה…',ja:'気になっていること…',ko:'마음에 걸리는 것…'},
    w_save: {ru:'Отложить до завтра',uk:'Відкласти до завтра',en:'Park it until tomorrow',es:'Dejarlo para mañana',de:'Auf morgen verschieben',pt:'Deixar para amanhã',fr:'Remettre à demain',pl:'Odłóż do jutra',it:'Rimandare a domani',he:'לדחות למחר',ja:'明日まで置いておく',ko:'내일로 미루기'},
    w_done: {ru:'Отложено. Утром вернётесь к этому — сейчас можно отпустить.',uk:'Відкладено. Уранці повернетеся до цього — зараз можна відпустити.',en:'Parked. You’ll come back to it in the morning — for now you can let it go.',es:'Guardado. Volverás a ello por la mañana; ahora puedes soltarlo.',de:'Verschoben. Morgen früh kommst du darauf zurück — jetzt darfst du loslassen.',pt:'Guardado. De manhã volta a isto — agora pode largar.',fr:'C’est noté. Vous y reviendrez demain matin — pour l’instant, vous pouvez lâcher prise.',pl:'Odłożone. Rano do tego wrócisz — teraz możesz odpuścić.',it:'Fatto. Ci tornerai domattina: ora puoi lasciar andare.',he:'נדחה. תחזרו לזה בבוקר — עכשיו אפשר לשחרר.',ja:'置いておきました。朝また向き合えばいいので、今は手放して大丈夫です。',ko:'미뤄 두었어요. 아침에 다시 보면 돼요. 지금은 내려놓아도 괜찮아요.'},
    w_prev: {ru:'Вчера вечером вы отложили:',uk:'Учора ввечері ви відклали:',en:'Last night you parked:',es:'Anoche dejaste para hoy:',de:'Gestern Abend verschoben:',pt:'Ontem à noite deixou para hoje:',fr:'Hier soir, vous avez remis :',pl:'Wczoraj wieczorem odłożyłeś(-aś):',it:'Ieri sera hai rimandato:',he:'אתמול בערב דחיתם:',ja:'昨夜置いておいたこと：',ko:'어젯밤 미뤄 둔 것:'}
  };

  // Сценарии голоса. Без цифр с единицами («5 с» голос читает плохо) — словами.
  var SAY = {
    intro: {ru:'Устройтесь удобно. Сейчас ничего не нужно делать правильно. Просто слушайте.',uk:'Влаштуйтеся зручно. Зараз нічого не треба робити правильно. Просто слухайте.',en:'Get comfortable. There’s nothing to get right now. Just listen.',es:'Ponte cómodo. Ahora no hay nada que hacer bien. Solo escucha.',de:'Mach es dir bequem. Jetzt musst du nichts richtig machen. Hör einfach zu.',pt:'Fique confortável. Agora não há nada a fazer bem. Apenas ouça.',fr:'Installez-vous confortablement. Il n’y a rien à réussir maintenant. Écoutez simplement.',pl:'Ułóż się wygodnie. Teraz nic nie musi być zrobione dobrze. Po prostu słuchaj.',it:'Mettiti comodo. Ora non c’è niente da fare bene. Ascolta e basta.',he:'התרווחו בנוחות. עכשיו אין שום דבר שצריך לעשות נכון. רק הקשיבו.',ja:'楽な姿勢になりましょう。今は何も上手にやる必要はありません。ただ聞いていてください。',ko:'편안하게 자리 잡으세요. 지금은 잘해야 할 것이 없어요. 그냥 들어 보세요.'},
    breath: {ru:'Дышим медленно: вдох на четыре счёта, выдох на шесть. Выдох длиннее вдоха.',uk:'Дихаємо повільно: вдих на чотири рахунки, видих на шість. Видих довший за вдих.',en:'Breathe slowly: in for four counts, out for six. The out-breath is longer than the in-breath.',es:'Respira despacio: inhala en cuatro tiempos, exhala en seis. La exhalación, más larga que la inhalación.',de:'Atme langsam: vier Zähler ein, sechs aus. Das Ausatmen ist länger als das Einatmen.',pt:'Respire devagar: inspire em quatro tempos, expire em seis. A expiração é mais longa que a inspiração.',fr:'Respirez lentement : inspirez sur quatre temps, expirez sur six. L’expiration est plus longue que l’inspiration.',pl:'Oddychaj powoli: wdech na cztery, wydech na sześć. Wydech dłuższy niż wdech.',it:'Respira lentamente: inspira in quattro tempi, espira in sei. L’espirazione è più lunga dell’inspirazione.',he:'נושמים לאט: שאיפה על ארבע, נשיפה על שש. הנשיפה ארוכה מהשאיפה.',ja:'ゆっくり呼吸します。4つ数えて吸い、6つ数えて吐きます。吐く息を長めに。',ko:'천천히 숨 쉬어요. 넷에 들이쉬고 여섯에 내쉬어요. 내쉬는 숨을 더 길게.'},
    pmr_in: {ru:'Теперь по очереди напрягаем и отпускаем мышцы. Напрягайте мягко, без боли.',uk:'Тепер по черзі напружуємо й відпускаємо м’язи. Напружуйте м’яко, без болю.',en:'Now we’ll tense and release the muscles one group at a time. Tense gently, never to the point of pain.',es:'Ahora tensamos y soltamos los músculos por turnos. Tensa con suavidad, sin dolor.',de:'Jetzt spannen wir nacheinander Muskeln an und lassen los. Sanft anspannen, ohne Schmerz.',pt:'Agora vamos tensionar e soltar os músculos, um grupo de cada vez. Tensione com suavidade, sem dor.',fr:'Maintenant, on contracte puis relâche les muscles, groupe après groupe. Contractez doucement, sans douleur.',pl:'Teraz po kolei napinamy i rozluźniamy mięśnie. Napinaj łagodnie, bez bólu.',it:'Ora tendiamo e rilassiamo i muscoli, un gruppo alla volta. Tendi con delicatezza, senza dolore.',he:'עכשיו נכווץ ונרפה שרירים, קבוצה אחר קבוצה. מכווצים בעדינות, בלי כאב.',ja:'次は筋肉を順番に力を入れてはゆるめます。痛くない程度に、やさしく力を入れてください。',ko:'이제 근육을 차례로 힘주었다가 풀어요. 아프지 않게 부드럽게 힘을 주세요.'},
    scan_in: {ru:'Теперь просто проходим вниманием по телу. Ничего не меняем — только замечаем.',uk:'Тепер просто проходимо увагою по тілу. Нічого не змінюємо — лише помічаємо.',en:'Now we simply move our attention through the body. Change nothing — just notice.',es:'Ahora solo recorremos el cuerpo con la atención. No cambies nada, solo observa.',de:'Jetzt wandern wir nur mit der Aufmerksamkeit durch den Körper. Nichts ändern — nur bemerken.',pt:'Agora apenas percorremos o corpo com a atenção. Não mude nada — só repare.',fr:'Maintenant, on parcourt simplement le corps avec l’attention. On ne change rien, on remarque.',pl:'Teraz po prostu przechodzimy uwagą przez ciało. Niczego nie zmieniamy — tylko zauważamy.',it:'Ora percorriamo semplicemente il corpo con l’attenzione. Non cambiare nulla, osserva soltanto.',he:'עכשיו פשוט עוברים בתשומת לב על הגוף. לא משנים כלום — רק שמים לב.',ja:'今度は注意を体に沿ってゆっくり移していきます。何も変えず、ただ気づくだけ。',ko:'이제 주의를 몸 구석구석으로 옮겨 가요. 아무것도 바꾸지 말고 알아차리기만 해요.'},
    outro: {ru:'Ложитесь, когда потянет в сон. Спокойной ночи.',uk:'Лягайте, коли потягне на сон. Добраніч.',en:'Lie down when you feel sleepy. Good night.',es:'Acuéstate cuando te entre el sueño. Buenas noches.',de:'Leg dich hin, wenn du müde wirst. Gute Nacht.',pt:'Deite-se quando sentir sono. Boa noite.',fr:'Couchez-vous quand le sommeil vient. Bonne nuit.',pl:'Połóż się, kiedy poczujesz senność. Dobranoc.',it:'Sdraiati quando ti viene sonno. Buonanotte.',he:'שכבו כשתרגישו שמתחיל להיות ישנוני. לילה טוב.',ja:'眠くなったら横になりましょう。おやすみなさい。',ko:'졸음이 오면 누우세요. 잘 자요.'}
  };
  var PMR = [
    {ru:'Сожмите кисти в кулаки. Держите… И отпустите. Почувствуйте разницу.',uk:'Стисніть кисті в кулаки. Тримайте… І відпустіть. Відчуйте різницю.',en:'Make fists with both hands. Hold… And let go. Notice the difference.',es:'Cierra las manos en puños. Mantén… Y suelta. Nota la diferencia.',de:'Balle beide Hände zu Fäusten. Halten … Und loslassen. Spüre den Unterschied.',pt:'Feche as mãos em punho. Segure… E solte. Sinta a diferença.',fr:'Serrez les poings. Tenez… Et relâchez. Sentez la différence.',pl:'Zaciśnij dłonie w pięści. Trzymaj… I puść. Poczuj różnicę.',it:'Stringi i pugni. Tieni… E lascia andare. Senti la differenza.',he:'קפצו את כפות הידיים לאגרופים. החזיקו… ושחררו. הרגישו את ההבדל.',ja:'両手を握りこぶしに。そのまま…はい、ゆるめて。違いを感じてください。',ko:'두 손을 주먹 쥐어요. 그대로… 이제 풀어요. 차이를 느껴 보세요.'},
    {ru:'Поднимите плечи к ушам. Держите… И уроните. Пусть тяжелеют.',uk:'Підніміть плечі до вух. Тримайте… І опустіть. Нехай важчають.',en:'Lift your shoulders up to your ears. Hold… And drop them. Let them grow heavy.',es:'Sube los hombros hacia las orejas. Mantén… Y déjalos caer. Que pesen.',de:'Zieh die Schultern zu den Ohren. Halten … Und fallen lassen. Lass sie schwer werden.',pt:'Suba os ombros até às orelhas. Segure… E deixe cair. Deixe-os pesar.',fr:'Montez les épaules vers les oreilles. Tenez… Et laissez-les tomber. Qu’elles deviennent lourdes.',pl:'Unieś ramiona do uszu. Trzymaj… I opuść. Niech stają się ciężkie.',it:'Alza le spalle verso le orecchie. Tieni… E lasciale cadere. Che diventino pesanti.',he:'הרימו את הכתפיים לאוזניים. החזיקו… והפילו. תנו להן להכביד.',ja:'肩を耳のほうへ持ち上げて。そのまま…ストンと下ろします。重くなるのにまかせて。',ko:'어깨를 귀 쪽으로 올려요. 그대로… 툭 떨어뜨려요. 무거워지게 두세요.'},
    {ru:'Наморщите лоб и зажмурьтесь. Держите… И расслабьте лицо. Челюсть свободна.',uk:'Наморщіть лоб і заплющіть очі міцно. Тримайте… І розслабте обличчя. Щелепа вільна.',en:'Frown and squeeze your eyes shut. Hold… And soften your face. Let your jaw go loose.',es:'Frunce la frente y aprieta los ojos. Mantén… Y relaja la cara. La mandíbula, suelta.',de:'Runzle die Stirn und kneif die Augen zu. Halten … Und das Gesicht entspannen. Der Kiefer locker.',pt:'Franza a testa e feche os olhos com força. Segure… E relaxe o rosto. O maxilar solto.',fr:'Froncez le front et plissez les yeux. Tenez… Et détendez le visage. La mâchoire libre.',pl:'Zmarszcz czoło i zaciśnij powieki. Trzymaj… I rozluźnij twarz. Szczęka swobodna.',it:'Aggrotta la fronte e strizza gli occhi. Tieni… E rilassa il viso. La mascella libera.',he:'קמטו את המצח ועצמו חזק את העיניים. החזיקו… והרפו את הפנים. הלסת משוחררת.',ja:'眉間にしわを寄せ、目をぎゅっと閉じて。そのまま…顔をゆるめます。あごも楽に。',ko:'이마를 찡그리고 눈을 꼭 감아요. 그대로… 얼굴을 풀어요. 턱도 편하게.'},
    {ru:'Втяните живот и напрягите. Держите… И отпустите. Дыхание свободное.',uk:'Втягніть живіт і напружте. Тримайте… І відпустіть. Дихання вільне.',en:'Pull your belly in and tighten it. Hold… And release. Let your breath flow freely.',es:'Mete el abdomen y ténsalo. Mantén… Y suelta. La respiración, libre.',de:'Zieh den Bauch ein und spann an. Halten … Und loslassen. Der Atem fließt frei.',pt:'Encolha a barriga e contraia. Segure… E solte. A respiração livre.',fr:'Rentrez le ventre et contractez. Tenez… Et relâchez. La respiration est libre.',pl:'Wciągnij brzuch i napnij. Trzymaj… I puść. Oddech swobodny.',it:'Tira dentro la pancia e contrai. Tieni… E lascia. Il respiro libero.',he:'אספו את הבטן פנימה וכווצו. החזיקו… ושחררו. הנשימה חופשית.',ja:'お腹を引き込んで力を入れて。そのまま…ゆるめます。呼吸は自由に。',ko:'배를 당겨 힘을 줘요. 그대로… 풀어요. 숨은 자연스럽게.'},
    {ru:'Напрягите бёдра и ягодицы. Держите… И отпустите.',uk:'Напружте стегна і сідниці. Тримайте… І відпустіть.',en:'Tighten your thighs and buttocks. Hold… And let go.',es:'Tensa muslos y glúteos. Mantén… Y suelta.',de:'Spann Oberschenkel und Gesäß an. Halten … Und loslassen.',pt:'Contraia coxas e glúteos. Segure… E solte.',fr:'Contractez les cuisses et les fessiers. Tenez… Et relâchez.',pl:'Napnij uda i pośladki. Trzymaj… I puść.',it:'Contrai cosce e glutei. Tieni… E lascia andare.',he:'כווצו את הירכיים והישבן. החזיקו… ושחררו.',ja:'太ももとお尻に力を入れて。そのまま…ゆるめます。',ko:'허벅지와 엉덩이에 힘을 줘요. 그대로… 풀어요.'},
    {ru:'Потяните носки на себя, напрягите икры. Держите… И отпустите. Ноги тяжёлые и тёплые.',uk:'Потягніть носки на себе, напружте литки. Тримайте… І відпустіть. Ноги важкі й теплі.',en:'Pull your toes towards you and tighten your calves. Hold… And let go. Your legs are heavy and warm.',es:'Lleva las puntas de los pies hacia ti y tensa las pantorrillas. Mantén… Y suelta. Las piernas, pesadas y cálidas.',de:'Zieh die Zehen zu dir und spann die Waden an. Halten … Und loslassen. Die Beine sind schwer und warm.',pt:'Puxe as pontas dos pés para si e contraia as panturrilhas. Segure… E solte. As pernas pesadas e quentes.',fr:'Ramenez les orteils vers vous, contractez les mollets. Tenez… Et relâchez. Les jambes sont lourdes et chaudes.',pl:'Przyciągnij palce stóp do siebie, napnij łydki. Trzymaj… I puść. Nogi ciężkie i ciepłe.',it:'Porta le punte dei piedi verso di te e contrai i polpacci. Tieni… E lascia. Le gambe pesanti e calde.',he:'משכו את כפות הרגליים אליכם וכווצו את השוקיים. החזיקו… ושחררו. הרגליים כבדות וחמות.',ja:'つま先を手前に引き、ふくらはぎに力を入れて。そのまま…ゆるめます。脚が重く、温かくなります。',ko:'발끝을 몸 쪽으로 당기고 종아리에 힘을 줘요. 그대로… 풀어요. 다리가 무겁고 따뜻해요.'}
  ];
  var SCAN = [
    {ru:'Внимание — на стопы. Просто заметьте, что они чувствуют.',uk:'Увага — на стопи. Просто помітьте, що вони відчувають.',en:'Bring your attention to your feet. Just notice what they feel.',es:'Lleva la atención a los pies. Solo nota lo que sienten.',de:'Richte die Aufmerksamkeit auf die Füße. Nimm einfach wahr, was sie spüren.',pt:'Leve a atenção aos pés. Apenas repare no que sentem.',fr:'Portez l’attention sur vos pieds. Remarquez simplement ce qu’ils ressentent.',pl:'Uwaga na stopy. Po prostu zauważ, co czują.',it:'Porta l’attenzione ai piedi. Nota soltanto cosa sentono.',he:'תשומת הלב — לכפות הרגליים. רק שימו לב מה הן מרגישות.',ja:'足の裏に注意を向けます。何を感じているか、ただ気づいてください。',ko:'발에 주의를 두세요. 무엇이 느껴지는지 알아차리기만 해요.'},
    {ru:'Голени и колени. Ничего не меняйте — только замечайте.',uk:'Гомілки й коліна. Нічого не змінюйте — лише помічайте.',en:'Your shins and knees. Change nothing — just notice.',es:'Las espinillas y las rodillas. No cambies nada, solo observa.',de:'Schienbeine und Knie. Nichts ändern — nur wahrnehmen.',pt:'Canelas e joelhos. Não mude nada — só repare.',fr:'Les tibias et les genoux. Ne changez rien, remarquez.',pl:'Golenie i kolana. Niczego nie zmieniaj — tylko zauważaj.',it:'Stinchi e ginocchia. Non cambiare nulla, osserva.',he:'השוקיים והברכיים. לא משנים כלום — רק שמים לב.',ja:'すねとひざ。何も変えず、ただ気づくだけ。',ko:'정강이와 무릎. 아무것도 바꾸지 말고 알아차리기만.'},
    {ru:'Бёдра и таз. Тело тяжелеет и опирается на кровать.',uk:'Стегна й таз. Тіло важчає і спирається на ліжко.',en:'Your thighs and hips. Your body grows heavy and sinks into the bed.',es:'Muslos y pelvis. El cuerpo se vuelve pesado y descansa sobre la cama.',de:'Oberschenkel und Becken. Der Körper wird schwer und sinkt ins Bett.',pt:'Coxas e bacia. O corpo fica pesado e apoia-se na cama.',fr:'Les cuisses et le bassin. Le corps s’alourdit et repose sur le lit.',pl:'Uda i miednica. Ciało staje się ciężkie i opiera się na łóżku.',it:'Cosce e bacino. Il corpo si fa pesante e si appoggia al letto.',he:'הירכיים והאגן. הגוף מכביד ונשען על המיטה.',ja:'太ももと骨盤。体が重くなり、ベッドに身をあずけます。',ko:'허벅지와 골반. 몸이 무거워지며 침대에 기대요.'},
    {ru:'Живот и грудь. Дыхание идёт само.',uk:'Живіт і груди. Дихання йде само.',en:'Your belly and chest. Your breath moves on its own.',es:'Abdomen y pecho. La respiración va sola.',de:'Bauch und Brust. Der Atem geht von selbst.',pt:'Barriga e peito. A respiração acontece sozinha.',fr:'Le ventre et la poitrine. La respiration se fait toute seule.',pl:'Brzuch i klatka piersiowa. Oddech płynie sam.',it:'Pancia e petto. Il respiro va da solo.',he:'הבטן והחזה. הנשימה זורמת מעצמה.',ja:'お腹と胸。呼吸は自然に続いています。',ko:'배와 가슴. 숨은 저절로 쉬어져요.'},
    {ru:'Руки — от плеч до кончиков пальцев. Тёплые и тяжёлые.',uk:'Руки — від плечей до кінчиків пальців. Теплі й важкі.',en:'Your arms, from shoulders to fingertips. Warm and heavy.',es:'Los brazos, de los hombros a la punta de los dedos. Cálidos y pesados.',de:'Die Arme, von den Schultern bis in die Fingerspitzen. Warm und schwer.',pt:'Os braços, dos ombros às pontas dos dedos. Quentes e pesados.',fr:'Les bras, des épaules au bout des doigts. Chauds et lourds.',pl:'Ręce — od ramion po czubki palców. Ciepłe i ciężkie.',it:'Le braccia, dalle spalle alla punta delle dita. Calde e pesanti.',he:'הידיים — מהכתפיים ועד קצות האצבעות. חמות וכבדות.',ja:'腕、肩から指先まで。温かく、重く。',ko:'팔, 어깨부터 손끝까지. 따뜻하고 무거워요.'},
    {ru:'Шея, лицо, лоб. Пришла мысль — заметьте её и вернитесь к дыханию.',uk:'Шия, обличчя, лоб. Прийшла думка — помітьте її і поверніться до дихання.',en:'Your neck, face, forehead. If a thought comes, notice it and come back to your breath.',es:'Cuello, cara, frente. Si llega un pensamiento, obsérvalo y vuelve a la respiración.',de:'Nacken, Gesicht, Stirn. Kommt ein Gedanke, bemerke ihn und kehre zum Atem zurück.',pt:'Pescoço, rosto, testa. Se vier um pensamento, repare nele e volte à respiração.',fr:'La nuque, le visage, le front. Si une pensée vient, remarquez-la et revenez à la respiration.',pl:'Szyja, twarz, czoło. Przyszła myśl — zauważ ją i wróć do oddechu.',it:'Collo, viso, fronte. Se arriva un pensiero, notalo e torna al respiro.',he:'הצוואר, הפנים, המצח. הגיעה מחשבה — שימו לב אליה וחזרו לנשימה.',ja:'首、顔、額。考えが浮かんだら、それに気づいて呼吸に戻りましょう。',ko:'목, 얼굴, 이마. 생각이 떠오르면 알아차리고 다시 숨으로 돌아와요.'}
  ];
  var AWAKE = [
    {ru:'Не спится — так бывает у всех. Одна ночь ничего не решает.',uk:'Не спиться — так буває в усіх. Одна ніч нічого не вирішує.',en:'Can’t sleep — it happens to everyone. One night decides nothing.',es:'No puedes dormir: le pasa a todo el mundo. Una noche no decide nada.',de:'Nicht schlafen können — das passiert jedem. Eine Nacht entscheidet nichts.',pt:'Não consegue dormir — acontece a toda a gente. Uma noite não decide nada.',fr:'Pas de sommeil — cela arrive à tout le monde. Une nuit ne décide de rien.',pl:'Nie możesz zasnąć — każdemu się to zdarza. Jedna noc niczego nie przesądza.',it:'Non riesci a dormire: capita a tutti. Una notte non decide nulla.',he:'לא נרדמים — זה קורה לכולם. לילה אחד לא מכריע דבר.',ja:'眠れないのは誰にでもあることです。一晩で何かが決まるわけではありません。',ko:'잠이 안 오는 건 누구에게나 있어요. 하룻밤이 결정하는 건 없어요.'},
    {ru:'Не лежите в ожидании сна. Встаньте и перейдите в другую комнату.',uk:'Не лежіть в очікуванні сну. Встаньте і перейдіть до іншої кімнати.',en:'Don’t lie there waiting for sleep. Get up and go to another room.',es:'No te quedes tumbado esperando el sueño. Levántate y ve a otra habitación.',de:'Bleib nicht liegen und warte auf den Schlaf. Steh auf und geh in ein anderes Zimmer.',pt:'Não fique deitado à espera do sono. Levante-se e vá para outra divisão.',fr:'Ne restez pas allongé à attendre le sommeil. Levez-vous et allez dans une autre pièce.',pl:'Nie leż, czekając na sen. Wstań i przejdź do innego pokoju.',it:'Non restare sdraiato ad aspettare il sonno. Alzati e vai in un’altra stanza.',he:'אל תשכבו ותחכו לשינה. קומו ועברו לחדר אחר.',ja:'眠りを待って横になり続けないで。起きて別の部屋へ移りましょう。',ko:'잠을 기다리며 누워 있지 마세요. 일어나서 다른 방으로 가세요.'},
    {ru:'Свет приглушённый. Без новостей и соцсетей: книга, тихая музыка, тёплый напиток без кофеина.',uk:'Світло приглушене. Без новин і соцмереж: книжка, тиха музика, теплий напій без кофеїну.',en:'Keep the light dim. No news or social media: a book, quiet music, a warm caffeine-free drink.',es:'Luz tenue. Sin noticias ni redes: un libro, música suave, una bebida caliente sin cafeína.',de:'Gedämpftes Licht. Keine Nachrichten, keine sozialen Medien: ein Buch, leise Musik, ein warmes Getränk ohne Koffein.',pt:'Luz baixa. Sem notícias nem redes sociais: um livro, música calma, uma bebida quente sem cafeína.',fr:'Lumière tamisée. Pas d’actualités ni de réseaux sociaux : un livre, une musique douce, une boisson chaude sans caféine.',pl:'Przyciemnione światło. Bez wiadomości i mediów społecznościowych: książka, cicha muzyka, ciepły napój bez kofeiny.',it:'Luce soffusa. Niente notizie né social: un libro, musica tranquilla, una bevanda calda senza caffeina.',he:'אור עמום. בלי חדשות ורשתות חברתיות: ספר, מוזיקה שקטה, משקה חם בלי קפאין.',ja:'明かりは暗めに。ニュースやSNSは見ずに、本や静かな音楽、カフェインのない温かい飲み物を。',ko:'불빛은 은은하게. 뉴스나 SNS 말고 책, 잔잔한 음악, 카페인 없는 따뜻한 음료를.'},
    {ru:'Вернитесь в кровать, когда веки начнут тяжелеть. Не раньше.',uk:'Поверніться в ліжко, коли повіки почнуть важчати. Не раніше.',en:'Go back to bed when your eyelids start to feel heavy. Not before.',es:'Vuelve a la cama cuando los párpados empiecen a pesar. No antes.',de:'Geh zurück ins Bett, wenn die Lider schwer werden. Nicht früher.',pt:'Volte para a cama quando as pálpebras começarem a pesar. Não antes.',fr:'Retournez au lit quand les paupières deviennent lourdes. Pas avant.',pl:'Wróć do łóżka, gdy powieki zaczną ciążyć. Nie wcześniej.',it:'Torna a letto quando le palpebre cominciano a pesare. Non prima.',he:'חזרו למיטה כשהעפעפיים יתחילו להכביד. לא לפני.',ja:'まぶたが重くなってきたらベッドに戻りましょう。それより前には戻らないで。',ko:'눈꺼풀이 무거워지기 시작하면 침대로 돌아가세요. 그 전에는 말고요.'},
    {ru:'Не считайте часы до утра. Подышите со мной: длинный, медленный выдох.',uk:'Не рахуйте години до ранку. Подихайте зі мною: довгий, повільний видих.',en:'Don’t count the hours until morning. Breathe with me: a long, slow out-breath.',es:'No cuentes las horas hasta la mañana. Respira conmigo: una exhalación larga y lenta.',de:'Zähl nicht die Stunden bis zum Morgen. Atme mit mir: ein langes, langsames Ausatmen.',pt:'Não conte as horas até de manhã. Respire comigo: uma expiração longa e lenta.',fr:'Ne comptez pas les heures jusqu’au matin. Respirez avec moi : une longue expiration lente.',pl:'Nie licz godzin do rana. Pooddychaj ze mną: długi, powolny wydech.',it:'Non contare le ore fino al mattino. Respira con me: un’espirazione lunga e lenta.',he:'אל תספרו את השעות עד הבוקר. נשמו איתי: נשיפה ארוכה ואיטית.',ja:'朝までの時間を数えないで。一緒に呼吸しましょう。長く、ゆっくり吐いて。',ko:'아침까지 남은 시간을 세지 마세요. 함께 숨 쉬어요. 길고 천천히 내쉬며.'}
  ];

  // ── дневник: разметка в #step16 ──
  function diaryHtml() {
    var lat = [['lt15', 'lat_a'], ['15_30', 'lat_b'], ['30_60', 'lat_c'], ['gt60', 'lat_d']];
    return '<div class="divider"></div><div class="input-group">'
      + '<label><span data-sl="d_t">' + esc(t('d_t')) + '</span></label>'
      + '<div class="sl-d-row"><div class="q-prompt" data-sl="d_bed">' + esc(t('d_bed')) + '</div><input type="time" class="manual-input sl-time" id="sl_bed" step="300"></div>'
      + '<div class="q-prompt" data-sl="d_lat" style="margin-top:12px;">' + esc(t('d_lat')) + '</div>'
      + '<div class="chips sleep-chips">' + lat.map(function (x, i) {
          return '<div class="chip"><input type="radio" name="sl_lat" id="sl_lat' + i + '" value="' + x[0] + '"><label for="sl_lat' + i + '" data-sl="' + x[1] + '">' + esc(t(x[1])) + '</label></div>';
        }).join('') + '</div>'
      + '<div class="sl-d-row" style="margin-top:12px;"><div class="q-prompt" data-sl="d_rise">' + esc(t('d_rise')) + '</div><input type="time" class="manual-input sl-time" id="sl_rise" step="300"></div>'
      + '<div class="sl-hint" id="sl_prev" data-sl="d_prev" style="display:none;">' + esc(t('d_prev')) + '</div>'
      + '</div>';
  }
  // ── автовключение дневника (2026-11-11) ──
  // Только если человек сам ни разу не включал/не выключал (KEY_ON ещё не записан): его «выключить» — навсегда.
  var KEY_AUTO = 'vial_sleep_auto';
  function sleepSignal() {
    try { if (typeof _cmpKeysAll === 'function' && _cmpKeysAll().indexOf('sleep') > -1) return 'why_cmp'; } catch (e) {}
    try { var ex = JSON.parse(localStorage.getItem('vialp_experiment') || 'null'); if (ex && ['evening', 'wake', 'bed', 'cool'].indexOf(ex.lever) > -1) return 'why_focus'; } catch (e) {}
    try {
      var arr = JSON.parse(localStorage.getItem('vialp_daily') || '[]') || [], cut = Date.now() - 7 * 86400000;
      if (arr.filter(function (r) { return r && r.ts >= cut && r.sleep_qual != null && r.sleep_qual <= 4; }).length >= 3) return 'why_q';
    } catch (e) {}
    return '';
  }
  function autoCheck() {
    if (get(KEY_ON, null) !== null) return;
    var why = sleepSignal(); if (!why) return;
    put(KEY_ON, true); put(KEY_AUTO, why);
    var box = $('sl-diary'); if (box) box.style.display = '';   // включился из карточки — вопросы в шаге «Сон» сразу видны
  }
  function mountDiary() {
    autoCheck();
    var anchor = $('sq-wake'); if (!anchor) return;
    var box = $('sl-diary');
    if (!box) { box = document.createElement('div'); box.id = 'sl-diary'; box.innerHTML = diaryHtml(); anchor.parentNode.insertBefore(box, anchor.nextSibling); prefill(); }
    box.style.display = on() ? '' : 'none';
  }
  function prefill() {
    var p = get(KEY_LAST, null); if (!p) return;
    var b = $('sl_bed'), r = $('sl_rise');
    if (b && !b.value && p.bed) b.value = p.bed;
    if (r && !r.value && p.rise) r.value = p.rise;
    if (p.lat) { var el = document.querySelector('input[name="sl_lat"][value="' + p.lat + '"]'); if (el) el.checked = true; }
    var h = $('sl_prev'); if (h) h.style.display = '';
  }
  function mins(hhmm) { var m = /^(\d{1,2}):(\d{2})/.exec(hhmm || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; }
  function sleepHours() {
    var e = $('sleep_hours'), v = e ? parseFloat(e.value) : NaN;
    if (!(v > 0)) { try { v = Number(importedData && importedData.sleepHours); } catch (x) { v = NaN; } }
    return v > 0 ? v : null;
  }
  // Запись дневника на сегодня (или null, если блок выключен / ничего не отмечено).
  function rec() {
    if (!on()) return null;
    var bed = ($('sl_bed') || {}).value || '', rise = ($('sl_rise') || {}).value || '';
    var l = document.querySelector('input[name="sl_lat"]:checked'), lat = l ? l.value : '';
    if (!bed && !rise && !lat) return null;
    var out = { bed: bed || null, rise: rise || null, lat: lat || null, tib: null, eff: null };
    var b = mins(bed), r = mins(rise);
    if (b != null && r != null) {
      var tib = r - b; if (tib <= 0) tib += 1440;
      if (tib >= 180 && tib <= 900) {
        out.tib = Math.round(tib / 6) / 10;   // часы с десятыми
        var sh = sleepHours(); if (sh) out.eff = Math.max(0, Math.min(100, Math.round(sh * 60 / tib * 100)));
      }
    }
    put(KEY_LAST, { bed: out.bed, rise: out.rise, lat: out.lat });
    return out;
  }
  // Красные флаги: из отметок прохода (дыхание во сне, беспокойные ноги) + ранний подъём при хорошем сне.
  function flagsNow(r) {
    var ck = function (id) { var e = $(id); return !!(e && e.checked); };
    var f = [];
    if (ck('slb2') || (ck('slb1') && ck('slb3'))) f.push('apnea');
    if (ck('slb3')) f.push('sleepy');
    if (ck('sym10')) f.push('rls');
    var rm = r && mins(r.rise), q = parseFloat(($('sleep_qual') || {}).value);
    if (rm != null && rm >= 180 && rm <= 315 && q >= 6) f.push('early');
    return f;
  }
  function payload() {
    var u = stats(7);
    if (!on()) return used(u) ? { on: false, use: u } : null;   // дневник выключен, но ритуалом пользуется — ИИ должен это видеть
    var r = rec(), f = flagsNow(r);
    try { put(KEY_FLAGS, { day: (typeof _dayKey === 'function' ? _dayKey() : ''), ts: Date.now(), f: f }); } catch (e) {}
    return { on: true, bed: r && r.bed, rise: r && r.rise, lat: r && r.lat, tib: r && r.tib, eff: r && r.eff, flags: f, use: u };
  }

  // ── эффективность за 7 дней из vialp_daily (поле sl, пишет _saveDaily) ──
  function eff7() {
    var arr = []; try { arr = JSON.parse(localStorage.getItem('vialp_daily') || '[]') || []; } catch (e) {}
    var cut = Date.now() - 7 * 86400000, v = arr.filter(function (x) { return x && x.ts >= cut && x.sl && x.sl.eff != null; }).map(function (x) { return x.sl.eff; });
    if (!v.length) return null;
    return { n: v.length, avg: Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length) };
  }

  // ── журнал использования и сводка за окно (2026-11-11) — в дневной/недельный/месячный разбор ──
  // Только факты «что делал»: дни ритуала (начат / дослушан), «Не спится», «Выгрузить мысли». Текст мыслей не уходит никуда.
  var KEY_LOG = 'vial_sleep_log', curKind = '';
  function logUse(k, full) {
    var a = get(KEY_LOG, []) || [], d = dayKey();
    if (full) { for (var i = 0; i < a.length; i++) if (a[i].k === k && a[i].day === d) { a[i].full = true; break; } }
    else a.unshift({ day: d, k: k, ts: Date.now(), full: false });
    put(KEY_LOG, a.slice(0, 200));
  }
  function stats(win) {
    win = win || 7;
    var now = Date.now(), DAY = 86400000, a = get(KEY_LOG, []) || [], arr = [];
    try { arr = JSON.parse(localStorage.getItem('vialp_daily') || '[]') || []; } catch (e) {}
    var inW = function (ts, k) { return ts && now - ts >= (k - 1) * win * DAY && now - ts < k * win * DAY; };
    var days = function (k, full) { var o = {}; a.forEach(function (x) { if (x.k === k && inW(x.ts, 1) && (!full || x.full)) o[x.day] = 1; }); return Object.keys(o).length; };
    var cntK = function (k) { return a.filter(function (x) { return x.k === k && inW(x.ts, 1); }).length; };
    var effOf = function (k) { var v = arr.filter(function (r) { return r && inW(r.ts, k) && r.sl && r.sl.eff != null; }).map(function (r) { return r.sl.eff; });
      return v.length ? { avg: Math.round(v.reduce(function (x, y) { return x + y; }, 0) / v.length), n: v.length } : null; };
    var lc = {}, lb = '', ln = 0;
    arr.forEach(function (r) { var l = r && inW(r.ts, 1) && r.sl && r.sl.lat; if (l) { lc[l] = (lc[l] || 0) + 1; if (lc[l] > ln) { ln = lc[l]; lb = l; } } });
    var e1 = effOf(1), e0 = effOf(2);
    return { win: win, diaryOn: on(), diaryDays: e1 ? e1.n : 0, eff: e1 ? e1.avg : null, effPrev: e0 ? e0.avg : null, lat: lb || null,
             ritualDays: days('r'), ritualFull: days('r', true), awake: cntK('a'), worry: cntK('w') };
  }
  function used(st) { return !!(st && (st.diaryOn || st.ritualDays || st.awake || st.worry)); }

  // ── карточка в «Мой вечерний ритуал» ──
  // Фон: мелодия (по умолчанию) или тишина. Шум убран 2026-11-11: доказательства в его пользу слабые, розовый шум
  // в работах сокращал быстрый сон; медленная инструментальная музыка улучшает сон (Cochrane 2022, мета-анализы 50+).
  function settings() { var s = get(KEY_SET, {}) || {}; return { dur: s.dur || 10, noise: s.noise === 'none' ? 'none' : 'music', remind: s.remind || '' }; }
  function setSet(k, v) { var s = settings(); s[k] = v; put(KEY_SET, s); }
  function card() {
    var box = $('rdSleep'); if (!box) return;
    autoCheck();
    var s = settings(), e = eff7(), fl = (get(KEY_FLAGS, null) || {}), flags = (fl.ts && Date.now() - fl.ts < 14 * 86400000) ? (fl.f || []) : [];
    var durs = [5, 10, 15].map(function (d) { return '<button type="button" class="sl-pill' + (s.dur === d ? ' on' : '') + '" onclick="vialSleep.set(\'dur\',' + d + ')">' + d + ' ' + esc(t('min')) + '</button>'; }).join('');
    var nz = [['music', 'n_music'], ['none', 'n_none']].map(function (x) { return '<button type="button" class="sl-pill' + (s.noise === x[0] ? ' on' : '') + '" onclick="vialSleep.set(\'noise\',\'' + x[0] + '\')">' + esc(t(x[1])) + '</button>'; }).join('');
    var times = ['', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
    var rm = '<select class="sl-sel" onchange="vialSleep.remind(this.value)">' + times.map(function (x) { return '<option value="' + x + '"' + (s.remind === x ? ' selected' : '') + '>' + (x ? x : esc(t('remind_off'))) + '</option>'; }).join('') + '</select>';
    var w = get(KEY_WORRY, null), wPrev = (w && w.text && w.day && w.day !== dayKey()) ? '<div class="sl-note"><b>' + esc(t('w_prev')) + '</b> ' + esc(w.text.slice(0, 280)) + '</div>' : '';
    box.innerHTML = '<div class="sl-card"><div class="sl-h"><button type="button" class="help-btn-inline" aria-label="info" onclick="vialSleep.info()">ℹ</button>🌙 ' + esc(t('card_t')) + '</div>'
      + '<div id="sl-info" class="sl-note"' + (infoOpen ? '' : ' hidden') + '>' + esc(t('info')) + '</div>'
      + '<button type="button" class="sl-btn sl-main" onclick="vialSleep.ritual()">▶ ' + esc(t('ritual')) + '</button>'
      + '<div class="sl-lbl">' + esc(t('dur')) + '</div><div class="sl-pills">' + durs + '</div>'
      + '<div class="sl-lbl">' + esc(t('noise')) + '</div><div class="sl-pills">' + nz + '</div>'
      + '<div class="sl-two"><button type="button" class="sl-btn" onclick="vialSleep.awake()">' + esc(t('awake')) + '</button>'
      + '<button type="button" class="sl-btn" onclick="vialSleep.worry()">' + esc(t('worry')) + '</button></div>'
      + wPrev
      + '<div class="sl-lbl">' + esc(t('remind')) + '</div>' + rm
      + readHtml()
      + '<div class="sl-lbl">' + esc(t('d_lbl')) + '</div>'
      + (on()
        ? (get(KEY_AUTO, '') && S[get(KEY_AUTO, '')] ? '<div class="sl-note">' + esc(t('d_auto').replace('{why}', t(get(KEY_AUTO, '')))) + '</div>' : '')
          + '<div class="sl-tx" style="margin-top:4px;">' + esc(t('eff7')) + '</div>'
          + (e ? '<div class="sl-eff"><b>' + e.avg + '%</b> <span>' + esc(t('eff_hint')) + '</span></div>' : '<div class="sl-tx">' + esc(t('eff_none')) + '</div>')
          + flags.filter(function (k) { return S['f_' + k]; }).map(function (k) { return '<div class="sl-flag">⚠️ ' + esc(t('f_' + k)) + '</div>'; }).join('')
          + '<button type="button" class="sl-off" onclick="vialSleep.toggle(false)">' + esc(t('d_off')) + '</button>'
        : '<div class="sl-tx">' + esc(t('d_tx')) + '</div><button type="button" class="sl-btn" onclick="vialSleep.toggle(true)">' + esc(t('d_on')) + '</button>')
      + '</div>';
  }
  // ── (i) и «Читать о сне» (2026-11-11) ──
  // Статьи — раздел «Основ» «Всё о сне» (articles.js; лекция — только у женщины, 5 статей КПТ-И без рода); исследования — тема «Сон»
  // Библиотеки VIA-L (у мужчины — m_sleep; без подписки там анонс и замок, как везде).
  var infoOpen = false, readOpen = false;
  function info() { infoOpen = !infoOpen; var el = $('sl-info'); if (el) el.hidden = !infoOpen; }
  function readHtml() {
    var Lb = window.vialLibrary, lang = L();
    var arts = (Lb && Lb.sectionKeys) ? Lb.sectionKeys('sleepcbt', lang) : [];   // раздел «Всё о сне»: у женщины с лекцией, у мужчины — свои статьи
    var res = !!(Lb && Lb.research);
    if (!arts.length && !res) return '';
    var rows = !readOpen ? '' : '<div class="sl-read">' + arts.map(function (k) {
        return '<button type="button" class="sl-rd" onclick="vialSleep.open(\'' + k + '\')"><span>' + esc(Lb.title(k, lang)) + '</span><span class="sl-chev">›</span></button>';
      }).join('') + (res ? '<button type="button" class="sl-rd" onclick="vialSleep.open(\'@res\')"><span>🔬 ' + esc(t('read_res')) + '</span><span class="sl-chev">›</span></button>' : '') + '</div>';
    return '<button type="button" class="sl-btn" onclick="vialSleep.read()">📖 ' + esc(t('read')) + ' ' + (readOpen ? '▴' : '▾') + '</button>' + rows;
  }
  function read() { readOpen = !readOpen; card(); }
  function open(k) {
    var Lb = window.vialLibrary; if (!Lb) return;
    if (k === '@res') { if (Lb.research) Lb.research('sleep'); return; }
    if (Lb.go) Lb.go(k);
  }
  // Перейти к карточке «Работаю над сном» (вкладка «Сегодня», шаг 5) — из жалобы «Сон» и шагов сна «Фокуса недели»
  function goCard() {
    try { if (typeof window.closeCircModal === 'function') window.closeCircModal(); } catch (e) {}
    try { if (window.vialLibrary && vialLibrary.sheetClose) vialLibrary.sheetClose(); } catch (e) {}
    try { if (typeof window.navTo === 'function') window.navTo('today'); } catch (e) {}
    setTimeout(function () {
      try { if (typeof _rdStep === 'function' && window._rdOpen !== 5) _rdStep(5); } catch (e) {}
      var el = $('rdSleep'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 120);
  }
  function dayKey() { try { return (typeof _dayKey === 'function') ? _dayKey() : new Date().toISOString().slice(0, 10); } catch (e) { return ''; } }
  function toggle(v) {
    put(KEY_ON, !!v); put(KEY_AUTO, '');   // решение человека — автовключение больше не трогает
    mountDiary(); card();
  }

  // ── напоминание (локальное уведомление id 2; текст — только 🌙: ничего о здоровье на экране блокировки) ──
  function schedule() {
    var s = settings();
    try { if (typeof window.notifySleep === 'function') window.notifySleep(s.remind ? s.remind : null, brand()); } catch (e) {}
  }
  function remind(v) {
    setSet('remind', v || '');
    if (v && typeof window.notifyAsk === 'function') window.notifyAsk().then(schedule); else schedule();
  }

  // ── голос ──
  function isIOS() { try { return window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'ios'; } catch (e) { return false; } }
  function plug() { if (window.speechSynthesis && (isIOS() || !window.Capacitor)) return null; return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) || null; }
  function loc() { try { return (typeof window._locale === 'function') ? window._locale() : 'en-GB'; } catch (e) { return 'en-GB'; } }
  var FEMALE = /milena|katya|lesya|samantha|karen|moira|serena|kate|tessa|fiona|victoria|allison|ava|susan|zoe|m[oó]nica|paulina|marisol|anna|petra|helena|luciana|joana|amelie|audrey|zosia|ewa|alice|federica|carmit|kyoko|yuna|female/i;
  var voice = null;
  function pickVoice() {
    var ss = window.speechSynthesis; if (!ss) return;
    var pre = loc().slice(0, 2);
    var v = (ss.getVoices() || []).filter(function (x) { return (x.lang || '').replace('_', '-').slice(0, 2) === pre; });
    var sc = function (x) { var n = x.name + ' ' + (x.voiceURI || ''); return (FEMALE.test(n) ? 4 : 0) + (/enhanced|premium|улучш|neural/i.test(n) ? 2 : 0); };
    voice = v.sort(function (a, b) { return sc(b) - sc(a); })[0] || null;
  }
  if (window.speechSynthesis) { try { window.speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) {} }
  function say(text) {
    if (!text) return;
    var p = plug();
    if (p) { p.stop().catch(function () {}).then(function () { return p.speak({ text: text, lang: loc(), rate: 0.8, pitch: 0.95, volume: 0.9, category: 'playback' }); }).catch(function () {}); return; }
    var ss = window.speechSynthesis; if (!ss) return;
    if (!voice) pickVoice();
    var u = new SpeechSynthesisUtterance(text); u.lang = loc(); u.rate = 0.8; u.pitch = 0.95; u.volume = 0.9; if (voice) u.voice = voice;
    if (ss.speaking || ss.pending) { ss.cancel(); setTimeout(function () { ss.speak(u); }, 80); } else ss.speak(u);
  }
  function hush() { var p = plug(); if (p) p.stop().catch(function () {}); else if (window.speechSynthesis) window.speechSynthesis.cancel(); }

  // ── фон: «мелодия для сна», собранная на лету (OfflineAudioContext → WAV → <audio>; файлов нет) ──
  // Канон «седативной музыки» из исследований сна: медленно (60 ударов в минуту), без ударных и резких акцентов,
  // мягкие тембры, плавная мелодия, тихо. Аккорды D–Bm–G–A по 16 с, редкие ноты пентатоники, мягкий бас,
  // реверберация. Петля 64 с склеена без шва (хвост доливается в начало). Мелодия своя на каждый день (сид = день).
  // <audio>, а не живой WebAudio: iPhone с выключенным звонком глушит WebAudio, а <audio> в режиме playback — нет.
  var audio = null, audioUrl = null, musicCache = {};
  function wavUrl(x, sr) {
    var n = x.length, b = new ArrayBuffer(44 + n * 2), d = new DataView(b), ws = function (o, s) { for (var k = 0; k < s.length; k++) d.setUint8(o + k, s.charCodeAt(k)); };
    ws(0, 'RIFF'); d.setUint32(4, 36 + n * 2, true); ws(8, 'WAVEfmt '); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true);
    d.setUint32(24, sr, true); d.setUint32(28, sr * 2, true); d.setUint16(32, 2, true); d.setUint16(34, 16, true); ws(36, 'data'); d.setUint32(40, n * 2, true);
    for (var m = 0; m < n; m++) { var v = Math.max(-1, Math.min(1, x[m])); d.setInt16(44 + m * 2, v * 0x7fff, true); }
    return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
  }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t2 = Math.imul(a ^ (a >>> 15), 1 | a); t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2; return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296; }; }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function makeMusic(seed) {
    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) return Promise.resolve(null);
    var sr = 22050, LOOP = 64, TAIL = 8, ctx = new OAC(1, sr * (LOOP + TAIL), sr), R = rng(seed);
    var master = ctx.createGain(); master.gain.value = 0.9;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.3;
    // реверберация: импульс из затухающего шума ~3,5 с
    var ir = ctx.createBuffer(1, Math.floor(sr * 3.5), sr), irD = ir.getChannelData(0);
    for (var i = 0; i < irD.length; i++) irD[i] = (R() * 2 - 1) * Math.pow(1 - i / irD.length, 2.6);
    var rev = ctx.createConvolver(); rev.buffer = ir; var wet = ctx.createGain(); wet.gain.value = 0.32; var dry = ctx.createGain(); dry.gain.value = 0.75;
    master.connect(lp); lp.connect(dry); lp.connect(rev); rev.connect(wet); dry.connect(ctx.destination); wet.connect(ctx.destination);
    var CH = [[50, 57, 61, 64], [47, 54, 57, 61], [43, 50, 54, 59], [45, 52, 54, 59]];   // Dmaj9 · Bm9 · Gmaj7 · A6sus
    var PENTA = [62, 64, 66, 69, 71, 74, 76, 78];                                    // ре-мажорная пентатоника
    function tone(f, at, dur, vol, type, atk, rel) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(vol, at + atk);
      g.gain.setValueAtTime(vol, Math.max(at + atk, at + dur - rel)); g.gain.linearRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(master); o.start(at); o.stop(at + dur + 0.05);
    }
    function bell(f, at, vol) {
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o2.type = 'sine';
      o.frequency.value = f; o2.frequency.value = f * 2.001;
      var g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(g); o.connect(g);
      g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(vol, at + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, at + 4.5);
      g.connect(master); o.start(at); o2.start(at); o.stop(at + 4.6); o2.stop(at + 4.6);
    }
    CH.forEach(function (c, k) {
      var t0 = k * 16;
      c.forEach(function (m, j) { tone(hz(m), Math.max(0, t0 - 1.5), 19, j ? 0.045 : 0.06, j % 2 ? 'triangle' : 'sine', 3.5, 4.5); tone(hz(m) * 1.003, Math.max(0, t0 - 1.5), 19, 0.02, 'sine', 4, 5); });
      tone(hz(c[0] - 12), Math.max(0, t0 - 1), 18, 0.07, 'sine', 3, 4);             // мягкий бас
      for (var bar = 0; bar < 4; bar++) {                                           // 4 такта по 4 с
        if (R() < 0.7) { var beat = Math.floor(R() * 4), note = PENTA[Math.floor(R() * PENTA.length)]; bell(hz(note), t0 + bar * 4 + beat + 0.5, 0.05 + R() * 0.03); }
      }
    });
    if (ctx.length) tone(hz(50), LOOP - 1.5, TAIL + 1.5, 0.045, 'sine', 3.5, 4.5);  // начало первого аккорда для бесшовной склейки
    return ctx.startRendering().then(function (buf) {
      var d = buf.getChannelData(0), n = sr * LOOP, out = new Float32Array(n), peak = 0;
      for (var a2 = 0; a2 < n; a2++) out[a2] = d[a2];
      for (var t3 = n; t3 < d.length; t3++) out[t3 - n] += d[t3];                 // хвост — в начало петли
      for (var p = 0; p < n; p++) peak = Math.max(peak, Math.abs(out[p]));
      if (peak > 0) for (var q = 0; q < n; q++) out[q] = out[q] / peak * 0.8;
      return wavUrl(out, sr);
    }).catch(function () { return null; });
  }
  var SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
  function playUrl(url, vol) {
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
      audio = new Audio(url || SILENT); audio.loop = true; audio.setAttribute('playsinline', '');
      audio.volume = url ? 0 : 0.01;
      var pr = audio.play(); if (pr && pr.catch) pr.catch(function () {});
      if (url) { var a3 = audio, v = 0, st = setInterval(function () { if (audio !== a3) return clearInterval(st); v = Math.min(vol, v + vol / 10); a3.volume = v; if (v >= vol) clearInterval(st); }, 800); }   // мягкое начало ~8 с
    } catch (e) {}
  }
  function noiseStart(kind) {
    noiseStop(true);
    var my = run;
    playUrl(null, 0);                                    // сразу тихий звук: держит режим воспроизведения, пока мелодия собирается
    if (kind !== 'music') return;
    var seed = parseInt(String(dayKey()).replace(/\D/g, ''), 10) || 1;
    var p = musicCache[seed] ? Promise.resolve(musicCache[seed]) : makeMusic(seed).then(function (u) { if (u) musicCache[seed] = u; return u; });
    p.then(function (u) { if (!u || my !== run) return; var old = audio; audio = null; try { if (old) old.pause(); } catch (e) {} playUrl(u, 0.3); });
  }
  function noiseStop(now) {
    var a = audio; audio = null; if (!a) return;
    var end = function () { try { a.pause(); } catch (e) {} };   // URL мелодии не отзываем — кэш на вечер
    if (now) return end();
    var v = a.volume, st = setInterval(function () { v -= 0.015; if (v <= 0.01) { clearInterval(st); end(); } else a.volume = v; }, 1000);   // гаснет ~20 с
  }

  // ── не дать экрану погаснуть: плагин KeepAwake (если стоит) → Wake Lock API → ничего (подсказка на экране) ──
  var lock = null;
  function awakeOn() {
    var ka = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.KeepAwake;
    if (ka && ka.keepAwake) { ka.keepAwake().catch(function () {}); return; }
    try { if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request('screen').then(function (l) { lock = l; }).catch(function () {}); } catch (e) {}
  }
  function awakeOff() {
    var ka = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.KeepAwake;
    if (ka && ka.allowSleep) ka.allowSleep().catch(function () {});
    try { if (lock) lock.release(); } catch (e) {} lock = null;
  }

  // ── экран-плеер (общий для ритуала и «Не спится») ──
  var run = 0, timers = [];
  function later(fn, ms) { var my = run; timers.push(setTimeout(function () { if (my === run) fn(); }, ms)); }
  function overlay(title) {
    var o = $('sl-ov');
    if (!o) { o = document.createElement('div'); o.id = 'sl-ov'; document.body.appendChild(o); }
    o.innerHTML = '<div class="sl-ov-in"><div class="sl-ov-t">' + esc(title) + '</div>'
      + '<div class="sl-circle" id="sl-circle"></div><div class="sl-ov-tx" id="sl-tx"></div>'
      + '<div class="sl-ov-keep">' + esc(t('keep')) + '</div>'
      + '<button type="button" class="sl-btn" onclick="vialSleep.stop()">' + esc(t('stop')) + '</button></div>';
    o.style.display = 'flex';
    return o;
  }
  function show(text) { var e = $('sl-tx'); if (e) e.textContent = text; }
  // Пул фраз (sleep-phrases.js): каждый вечер — свой сдвиг по кругу, внутри ритуала фразы не повторяются.
  var cursor = {};
  function pool(cat) {
    var P = window.VIAL_SLEEP_PHRASES, a = (P && P[cat] && (P[cat][L()] || P[cat].en)) || [];
    if (!a.length) return '';
    if (cursor[cat] == null) { var d = Math.floor(Date.now() / 86400000); cursor[cat] = (d * 17 + (cat.length * 7)) % a.length; }
    var x = a[cursor[cat] % a.length]; cursor[cat]++; return x;
  }
  function line(text) { if (text) { show(text); say(text); } }
  // Дыхание 4/6 на sec секунд. Первые три цикла — голосом «вдох/выдох»; дальше через цикл: фраза из пула
  // (дыхание или мысли), между ними — снова тихие «вдох/выдох». Тишины длиннее одного цикла (10 с) нет.
  function breathe(at, sec, mindToo) {
    var cyc = Math.floor(sec / 10);
    for (var i = 0; i < cyc; i++) (function (i) {
      var talk = i >= 3 && i % 2 === 1;
      later(function () { var c = $('sl-circle'); if (c) { c.style.transition = 'transform 4s ease-in-out'; c.style.transform = 'scale(1.35)'; }
        if (talk) line(pool(mindToo && i % 4 === 3 ? 'mind' : 'breath')); else { show(t('b_in')); say(t('b_in')); } }, (at + i * 10) * 1000);
      later(function () { var c = $('sl-circle'); if (c) { c.style.transition = 'transform 6s ease-in-out'; c.style.transform = 'scale(1)'; }
        if (!talk) { show(t('b_out')); say(t('b_out')); } }, (at + i * 10 + 4) * 1000);
    })(i);
    return at + cyc * 10;
  }
  // Блок практики: вступление, затем пункты списка; между ними — фразы из пула каждые ~11 с (тело и мысли по очереди).
  function phrases(at, sec, intro, list) {
    later(function () { line(tr(intro)); }, at * 1000);
    var slot = (sec - 10) / list.length;
    list.forEach(function (p, i) {
      var t0 = at + 10 + i * slot;
      later(function () { line(tr(p)); }, t0 * 1000);
      for (var k = 1, f = t0 + 12; f < t0 + slot - 4; k++, f += 11) (function (k, f) {
        later(function () { line(pool(k % 2 ? 'body' : 'mind')); }, f * 1000);
      })(k, f);
    });
    return at + sec;
  }
  // Блокировка кнопкой / сворачивание во время ритуала (2026-11-11): iOS замораживает таймеры, и после разблокировки
  // накопившиеся фразы прозвучали бы разом. Поэтому при скрытии страницы ритуал останавливается целиком: голос, мелодия,
  // «не гасить экран». В беззвучном режиме звук идёт: сессия iOS «playback» (плагин голоса ставит её при запуске,
  // плюс navigator.audioSession), на Android голос и мелодия — медиапоток, его режим «без звука» не глушит.
  var active = false;
  document.addEventListener('visibilitychange', function () { if (document.hidden && active) stop(); });
  function begin(title) {
    stop(true); run++; cursor = {}; overlay(title); awakeOn(); pickVoice(); active = true;
  }
  function ritual() {
    var s = settings(), plan = { 5: [120, 0, 180], 10: [120, 240, 240], 15: [180, 360, 360] }[s.dur] || [120, 240, 240];
    begin(t('ritual')); noiseStart(s.noise); curKind = 'r'; logUse('r');
    var at = 0;
    later(function () { show(tr(SAY.intro)); say(tr(SAY.intro)); }, 300); at = 8;
    later(function () { show(tr(SAY.breath)); say(tr(SAY.breath)); }, at * 1000); at += 9;
    at = breathe(at, plan[0], true);
    if (plan[1]) at = phrases(at, plan[1], SAY.pmr_in, PMR);
    at = phrases(at, plan[2], SAY.scan_in, SCAN);
    later(function () { show(tr(SAY.outro)); say(tr(SAY.outro)); }, at * 1000);
    later(function () { finish(); }, (at + 12) * 1000);
  }
  function awake() {
    begin(t('awake')); noiseStart('none'); curKind = 'a'; logUse('a');
    var at = 0;
    AWAKE.forEach(function (p, i) { later(function () { show(tr(p)); say(tr(p)); }, (at + i * 11) * 1000 + 300); });
    at = AWAKE.length * 11;
    at = breathe(at, 150, true);
    later(function () { finish(); }, (at + 2) * 1000);
  }
  function finish() { if (curKind) logUse(curKind, true); curKind = ''; active = false; noiseStop(false); awakeOff(); var o = $('sl-ov'); if (o) o.style.display = 'none'; run++; }
  function stop(quiet) {
    active = false; curKind = ""; run++; timers.forEach(clearTimeout); timers = []; hush(); noiseStop(true); awakeOff();
    var o = $('sl-ov'); if (o && !quiet) o.style.display = 'none';
  }

  // ── «Выгрузить мысли» ──
  function worry() {
    var o = $('sl-ov'); if (!o) { o = document.createElement('div'); o.id = 'sl-ov'; document.body.appendChild(o); }
    var w = get(KEY_WORRY, null), cur = (w && w.day === dayKey()) ? w.text : '';
    o.innerHTML = '<div class="sl-ov-in"><div class="sl-ov-t">' + esc(t('worry')) + '</div><div class="sl-ov-tx" style="min-height:0;">' + esc(t('w_tx')) + '</div>'
      + '<textarea id="sl-w" class="sl-ta" maxlength="1500" placeholder="' + esc(t('w_ph')) + '">' + esc(cur) + '</textarea>'
      + '<button type="button" class="sl-btn sl-main" onclick="vialSleep.worrySave()">' + esc(t('w_save')) + '</button>'
      + '<button type="button" class="sl-off" onclick="vialSleep.stop()">' + esc(t('close')) + '</button></div>';
    o.style.display = 'flex';
  }
  function worrySave() {
    var v = (($('sl-w') || {}).value || '').trim();
    put(KEY_WORRY, v ? { day: dayKey(), text: v } : null);
    if (v) logUse('w');
    var o = $('sl-ov'); if (o) o.querySelector('.sl-ov-in').innerHTML = '<div class="sl-ov-tx">' + esc(t('w_done')) + '</div><button type="button" class="sl-btn" onclick="vialSleep.stop()">' + esc(t('close')) + '</button>';
  }

  // ── язык: перевести то, что уже нарисовано ──
  function relang() {
    document.querySelectorAll('[data-sl]').forEach(function (el) { el.textContent = t(el.getAttribute('data-sl')); });
    card();
  }

  // ── стили (только токены дизайн-системы) ──
  var css = document.createElement('style');
  css.textContent =
    '#rdSleep:empty{display:none;}#rdSleep{margin-bottom:12px;}'
    + '.sl-card{background:linear-gradient(160deg,#1c2230,#121722);border:1px solid rgba(226,185,90,.20);border-radius:20px;padding:14px 16px;color:var(--t1);}'
    + '.sl-h{font-family:"Playfair Display",serif;font-size:var(--fs-title,18px);color:var(--gold-lt);margin-bottom:8px;}'
    + '.sl-tx{font-size:var(--fs-body);color:var(--t2);line-height:1.45;margin:6px 0;}'
    + '.sl-lbl{font-size:var(--fs-cap);color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin:14px 0 6px;}'
    + '.sl-pills{display:flex;flex-wrap:wrap;gap:8px;}'
    + '.sl-pill{flex:1 1 auto;min-height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:transparent;color:var(--t1);font-size:var(--fs-cap);font-family:inherit;padding:6px 10px;}'
    + '.sl-pill.on{border-color:var(--gold-lt);color:var(--gold-lt);background:rgba(238,175,84,.10);}'
    + '.sl-btn{width:100%;min-height:46px;border-radius:14px;border:1px solid var(--gold-lt);background:transparent;color:var(--gold-lt);font-size:var(--fs-body);font-weight:600;font-family:inherit;margin-top:10px;}'
    + '.sl-btn.sl-main{background:linear-gradient(180deg,#F2D27A,#D9A441);color:#1a1610;border:none;}'
    + '.sl-two{display:flex;gap:8px;}.sl-two .sl-btn{flex:1;}'
    + '.sl-sel{width:100%;min-height:42px;border-radius:12px;background:transparent;color:var(--t1);border:1px solid rgba(255,255,255,.14);font-size:var(--fs-body);padding:0 10px;font-family:inherit;}'
    + '.sl-sel option{color:#111;}'
    + '.sl-eff{font-size:var(--fs-cap);color:var(--t2);line-height:1.4;}.sl-eff b{font-size:22px;color:var(--gold-lt);margin-right:6px;}'
    + '.sl-flag{font-size:var(--fs-cap);color:var(--t1);background:rgba(224,107,107,.10);border:1px solid rgba(224,107,107,.30);border-radius:12px;padding:8px 10px;margin-top:10px;line-height:1.4;}'
    + '.sl-note{font-size:var(--fs-cap);color:var(--t2);border-left:2px solid var(--gold-lt);padding:4px 10px;margin-top:10px;white-space:pre-wrap;}'
    + '.sl-h .help-btn-inline{margin-top:-2px;}'
    + '.sl-read{display:grid;gap:6px;margin-top:8px;}'
    + '.sl-rd{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:44px;padding:8px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(6,9,18,.35);color:var(--t1);font-size:var(--fs-cap);font-family:inherit;text-align:start;line-height:1.35;}'
    + '.sl-chev{color:var(--gold-lt);font-size:18px;flex:0 0 auto;}'
    + '.sl-off{display:block;margin:14px auto 0;background:none;border:none;color:var(--t3);font-size:var(--fs-cap);text-decoration:underline;font-family:inherit;}'
    + '.sl-d-row{display:flex;align-items:center;justify-content:space-between;gap:10px;}.sl-d-row .q-prompt{margin:0;}'
    + '.sl-time{max-width:120px;text-align:center;font-size:18px;font-weight:700;}'
    + '.sl-hint{font-size:var(--fs-cap);color:var(--t3);margin-top:8px;}'
    + '#sl-ov{position:fixed;inset:0;z-index:100000;background:#000;display:none;align-items:center;justify-content:center;padding:24px 16px calc(24px + env(safe-area-inset-bottom));}'
    + '.sl-ov-in{width:100%;max-width:420px;text-align:center;}'
    + '.sl-ov-t{font-family:"Playfair Display",serif;color:rgba(238,175,84,.55);font-size:20px;margin-bottom:28px;}'
    + '.sl-circle{width:120px;height:120px;margin:0 auto 28px;border-radius:50%;border:1px solid rgba(238,175,84,.35);background:radial-gradient(circle,rgba(238,175,84,.10),rgba(238,175,84,0) 70%);}'
    + '.sl-ov-tx{min-height:96px;color:rgba(255,255,255,.55);font-size:var(--fs-body);line-height:1.5;}'
    + '.sl-ov-keep{font-size:12px;color:rgba(255,255,255,.28);margin:18px 0 6px;}'
    + '#sl-ov .sl-btn{opacity:.6;}'
    + '.sl-ta{width:100%;min-height:140px;margin-top:14px;border-radius:14px;background:#0d0d0d;color:var(--t1);border:1px solid rgba(255,255,255,.14);padding:10px;font-size:var(--fs-body);font-family:inherit;box-sizing:border-box;}';
  document.head.appendChild(css);

  window.vialSleep = {
    on: on, toggle: toggle, card: card, rec: rec, payload: payload, relang: relang,
    set: function (k, v) { setSet(k, v); card(); },
    remind: remind, ritual: ritual, awake: awake, stop: function () { stop(false); },
    worry: worry, worrySave: worrySave, mountDiary: mountDiary, info: info, read: read, open: open, goCard: goCard, stats: stats, label: function (k) { return t(k); },
    _music: makeMusic   // отладка: собрать мелодию дня (вернёт blob-URL)
  };
  mountDiary(); card(); schedule();
})();
