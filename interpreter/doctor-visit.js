/* VIA·L — «Подготовка к визиту» (2026-11-06, решение владельца: «это должен быть акцент»).
   Золотая карточка-акцент над шагами «Сегодня», когда есть повод показаться врачу:
   жалоба пери/менопаузы держится 6+ недель, приливы 8+ дней из 28, цикл стал нерегулярным
   или давление в среднем ≥140/90. Внутри — к кому идти, «что сказать» от первого лица из её же
   отметок, её цифры за 4 недели, вопросы врачу, что взять с собой.
   Собирает КОД, без ИИ и без сети. Рамка: адресат + её данные + вопросы. Ни диагноза («у вас
   перименопауза»), ни назначения («вам нужна гормональная терапия»), ни препаратов.
   «Уже была у врача» прячет карточку на 90 дней. VIA-L — женщины 35+. ADAM-L (window.DV_SEX='male') — мужчины 40+:
   жалобы андропаузы, вопросы про тестостерон. Куда идти — всегда семейный врач + «частно — сразу к гинекологу/урологу». В VIA-L мужчинам карточки нет.
   Рисует блок #rd-doctor перед шагом 1; зовётся из renderFocusUI (страница).
   Правишь русский — правь все 12 языков. В строках только типографские кавычки и апостроф ’. */
(function () {
  var K_HIDE = 'vialp_dv_hide', HIDE_DAYS = 90, DAY = 86400000;
  var CMP_KEYS = ['hf', 'sleep', 'mood', 'cycle', 'libido', 'fog'];   // жалобы, с которыми идут к гинекологу в 35+
  var CMP_KEYS_M = ['energy', 'sleep', 'mood', 'fog', 'libido', 'drive', 'muscle'];   // ADAM-L: андропауза 40+

  var S = {
    badge:{ru:'Пора к врачу',uk:'Час до лікаря',en:'Time to see a doctor',es:'Momento de ir al médico',de:'Zeit für einen Arztbesuch',pt:'Hora de ir ao médico',fr:'Le moment de consulter',pl:'Czas na wizytę u lekarza',it:'È il momento del medico',he:'הגיע הזמן לרופא',ja:'受診のタイミングです',ko:'진료받을 때예요'},
    title:{ru:'Подготовка к визиту',uk:'Підготовка до візиту',en:'Getting ready for your appointment',es:'Prepara tu consulta',de:'Vorbereitung auf den Arzttermin',pt:'Preparação para a consulta',fr:'Préparer votre rendez-vous',pl:'Przygotowanie do wizyty',it:'Prepararsi alla visita',he:'הכנה לביקור אצל הרופא',ja:'受診の準備',ko:'진료 준비'},
    why_long:{ru:'То, что вас беспокоит, держится больше месяца.',uk:'Те, що вас турбує, триває понад місяць.',en:'What’s been bothering you has lasted more than a month.',es:'Lo que te preocupa dura ya más de un mes.',de:'Was Sie belastet, hält schon über einen Monat an.',pt:'O que incomoda você já dura mais de um mês.',fr:'Ce qui vous gêne dure depuis plus d’un mois.',pl:'To, co Cię niepokoi, trwa już ponad miesiąc.',it:'Ciò che ti disturba dura da più di un mese.',he:'מה שמטריד אתכם נמשך כבר יותר מחודש.',ja:'気になる症状が1か月以上続いています。',ko:'불편한 증상이 한 달 넘게 이어지고 있어요.'},
    why_hf:{ru:'Приливы были в {n} из последних 28 дней.',uk:'Припливи були в {n} з останніх 28 днів.',en:'You had hot flashes on {n} of the last 28 days.',es:'Has tenido sofocos {n} de los últimos 28 días.',de:'Hitzewallungen an {n} der letzten 28 Tage.',pt:'Você teve ondas de calor em {n} dos últimos 28 dias.',fr:'Des bouffées de chaleur {n} jours sur les 28 derniers.',pl:'Uderzenia gorąca w {n} z ostatnich 28 dni.',it:'Vampate in {n} degli ultimi 28 giorni.',he:'גלי חום ב־{n} מתוך 28 הימים האחרונים.',ja:'直近28日のうち{n}日にホットフラッシュがありました。',ko:'최근 28일 중 {n}일 안면홍조가 있었어요.'},
    why_cyc:{ru:'Цикл стал нерегулярным.',uk:'Цикл став нерегулярним.',en:'Your cycle has become irregular.',es:'Tu ciclo se ha vuelto irregular.',de:'Ihr Zyklus ist unregelmäßig geworden.',pt:'Seu ciclo ficou irregular.',fr:'Votre cycle est devenu irrégulier.',pl:'Cykl stał się nieregularny.',it:'Il ciclo è diventato irregolare.',he:'המחזור הפך ללא סדיר.',ja:'月経周期が不規則になっています。',ko:'생리 주기가 불규칙해졌어요.'},
    why_bp:{ru:'Давление в среднем {v} — выше домашнего ориентира 140/90.',uk:'Тиск у середньому {v} — вище домашнього орієнтира 140/90.',en:'Your average blood pressure is {v}, above the home reference of 140/90.',es:'Tu presión media es {v}, por encima de la referencia doméstica de 140/90.',de:'Ihr Blutdruck liegt im Schnitt bei {v}, über dem häuslichen Richtwert 140/90.',pt:'Sua pressão média é {v}, acima da referência doméstica de 140/90.',fr:'Votre tension moyenne est de {v}, au-dessus du repère à domicile de 140/90.',pl:'Średnie ciśnienie to {v} — powyżej domowego punktu odniesienia 140/90.',it:'La pressione media è {v}, sopra il riferimento domestico di 140/90.',he:'לחץ הדם הממוצע {v} — מעל טווח הייחוס הביתי 140/90.',ja:'血圧の平均は{v}で、家庭での目安140/90を上回っています。',ko:'평균 혈압이 {v}로 가정 기준치 140/90보다 높아요.'},
    lead_gp:{ru:'Это стоит показать семейному врачу — мы собрали, что сказать на приёме и что спросить.',uk:'Це варто показати сімейному лікарю — ми зібрали, що сказати на прийомі й що запитати.',en:'It’s worth showing to your family doctor — we’ve put together what to say and what to ask.',es:'Merece la pena enseñárselo a tu médico de cabecera: hemos preparado qué contar en la consulta y qué preguntar.',de:'Das sollten Sie Ihrer Hausärztin oder Ihrem Hausarzt zeigen — wir haben zusammengestellt, was Sie sagen und fragen können.',pt:'Vale a pena mostrar ao seu médico de família — reunimos o que dizer na consulta e o que perguntar.',fr:'Cela mérite d’être montré à votre médecin traitant — nous avons préparé quoi dire et quoi demander.',pl:'Warto pokazać to lekarzowi rodzinnemu — zebraliśmy, co powiedzieć na wizycie i o co zapytać.',it:'Vale la pena mostrarlo al medico di famiglia: abbiamo preparato cosa dire alla visita e cosa chiedere.',he:'כדאי להראות את זה לרופא/ת המשפחה — אספנו מה לומר בביקור ומה לשאול.',ja:'かかりつけ医に見せる価値があります。受診時に伝えることと質問をまとめました。',ko:'가정의학과 의사에게 보여 줄 만해요. 진료 때 말할 내용과 물어볼 질문을 정리했어요.'},
    open:{ru:'Открыть карточку',uk:'Відкрити картку',en:'Open the card',es:'Abrir la tarjeta',de:'Karte öffnen',pt:'Abrir o cartão',fr:'Ouvrir la fiche',pl:'Otwórz kartę',it:'Apri la scheda',he:'לפתוח את הכרטיס',ja:'カードを開く',ko:'카드 열기'},
    dismiss:{ru:'Уже была у врача',uk:'Уже була в лікаря',en:'I’ve already seen a doctor',es:'Ya he ido al médico',de:'Ich war schon beim Arzt',pt:'Já fui ao médico',fr:'J’ai déjà consulté',pl:'Byłam już u lekarza',it:'Sono già stata dal medico',he:'כבר הייתי אצל רופא',ja:'もう受診しました',ko:'이미 진료받았어요'},
    who_gp:{ru:'Семейный врач',uk:'Сімейний лікар',en:'Family doctor',es:'Médico de cabecera',de:'Hausärztin / Hausarzt',pt:'Médico de família',fr:'Médecin traitant',pl:'Lekarz rodzinny',it:'Medico di famiglia',he:'רופא/ת משפחה',ja:'かかりつけ医',ko:'가정의학과'},
    who_gp_sub:{ru:'или терапевт',uk:'або терапевт',en:'or a general practitioner',es:'o medicina general',de:'oder Allgemeinmedizin',pt:'ou clínico geral',fr:'ou un généraliste',pl:'lub internista',it:'o un internista',he:'או רופא/ת פנימית',ja:'または内科',ko:'또는 내과'},
    h_say:{ru:'Что сказать',uk:'Що сказати',en:'What to say',es:'Qué contar',de:'Was Sie sagen können',pt:'O que dizer',fr:'Quoi dire',pl:'Co powiedzieć',it:'Cosa dire',he:'מה לומר',ja:'伝えること',ko:'말할 내용'},
    h_data:{ru:'Мои данные · 4 недели',uk:'Мої дані · 4 тижні',en:'My data · 4 weeks',es:'Mis datos · 4 semanas',de:'Meine Daten · 4 Wochen',pt:'Meus dados · 4 semanas',fr:'Mes données · 4 semaines',pl:'Moje dane · 4 tygodnie',it:'I miei dati · 4 settimane',he:'הנתונים שלי · 4 שבועות',ja:'私のデータ・4週間',ko:'내 데이터 · 4주'},
    h_data_sub:{ru:'Среднее; рядом — изменение к 4 неделям до этого.',uk:'Середнє; поруч — зміна щодо 4 тижнів до цього.',en:'Averages; next to them, the change from the 4 weeks before.',es:'Medias; al lado, el cambio respecto a las 4 semanas anteriores.',de:'Durchschnitt; daneben die Veränderung zu den 4 Wochen davor.',pt:'Médias; ao lado, a mudança em relação às 4 semanas anteriores.',fr:'Moyennes ; à côté, l’écart avec les 4 semaines précédentes.',pl:'Średnie; obok — zmiana względem 4 wcześniejszych tygodni.',it:'Medie; accanto, la variazione rispetto alle 4 settimane prima.',he:'ממוצעים; לידם — השינוי לעומת 4 השבועות שלפני.',ja:'平均値。横はその前の4週間との差です。',ko:'평균값이며, 옆은 그 전 4주와 비교한 변화예요.'},
    who_gp_meno_sub:{ru:'с менопаузой обычно начинают с него: он может сам подобрать лечение и направит к гинекологу, если нужно',uk:'з менопаузою зазвичай починають із нього: він може сам підібрати лікування й направить до гінеколога, якщо потрібно',en:'menopause care usually starts here: your family doctor can offer treatment and refer you to a gynecologist if needed',es:'con la menopausia se suele empezar por aquí: puede proponerte tratamiento y derivarte a ginecología si hace falta',de:'in den Wechseljahren ist die Hausarztpraxis oft die erste Anlaufstelle: Sie kann behandeln und bei Bedarf zur Frauenärztin überweisen',pt:'na menopausa costuma-se começar por aqui: o médico de família pode propor tratamento e encaminhar ao ginecologista, se for preciso',fr:'pour la ménopause, on commence souvent par lui : il peut proposer un traitement et vous orienter vers un gynécologue si besoin',pl:'z menopauzą zwykle zaczyna się od niego: może sam dobrać leczenie i skierować do ginekologa, jeśli trzeba',it:'per la menopausa di solito si parte da qui: il medico di famiglia può proporre una cura e indirizzarti dal ginecologo se serve',he:'בגיל המעבר בדרך כלל מתחילים כאן: רופא/ת המשפחה יכול/ה להציע טיפול ולהפנות לרופא/ת נשים במידת הצורך',ja:'更年期の相談は、まずかかりつけ医からが一般的です。治療を提案し、必要なら婦人科を紹介してくれます',ko:'갱년기 상담은 보통 여기서 시작해요. 가정의학과에서 치료를 권하고 필요하면 산부인과로 의뢰해 줘요'},
    note_private:{ru:'К частному гинекологу обычно можно записаться и без направления.',uk:'До приватного гінеколога зазвичай можна записатися й без направлення.',en:'A private gynecologist will usually see you without a referral.',es:'En la sanidad privada, a ginecología se suele poder ir sin derivación.',de:'Private Frauenarztpraxen nehmen meist auch ohne Überweisung Termine an.',pt:'No privado, normalmente pode marcar com um ginecologista sem encaminhamento.',fr:'Dans le privé, on peut en général consulter un gynécologue sans orientation.',pl:'Do prywatnego ginekologa zwykle można zapisać się bez skierowania.',it:'Privatamente, dal ginecologo di solito si può andare senza impegnativa.',he:'לרופא/ת נשים פרטי/ת אפשר בדרך כלל לקבוע תור גם בלי הפניה.',ja:'自費の婦人科なら、紹介状なしで受診できることが多いです。',ko:'개인 산부인과는 보통 의뢰서 없이도 예약할 수 있어요.'},
    q_ref:{ru:'Нужна ли мне консультация гинеколога?',uk:'Чи потрібна мені консультація гінеколога?',en:'Should I also see a gynecologist?',es:'¿Necesito que me vea ginecología?',de:'Sollte ich zusätzlich zur Frauenärztin gehen?',pt:'Preciso de uma consulta de ginecologia?',fr:'Dois-je aussi consulter un gynécologue ?',pl:'Czy potrzebuję konsultacji ginekologa?',it:'Ho bisogno di una visita ginecologica?',he:'האם כדאי שאפנה גם לרופא/ת נשים?',ja:'婦人科も受診したほうがよいですか？',ko:'산부인과 진료도 받아야 할까요?'},
    h_labs:{ru:'Мои анализы',uk:'Мої аналізи',en:'My lab results',es:'Mis análisis',de:'Meine Laborwerte',pt:'Meus exames',fr:'Mes analyses',pl:'Moje badania',it:'I miei esami',he:'הבדיקות שלי',ja:'私の検査結果',ko:'내 검사 결과'},
    h_labs_sub:{ru:'Как вписаны в приложение; дата — день сдачи.',uk:'Як вписані в застосунок; дата — день здачі.',en:'As entered in the app; the date is when the test was taken.',es:'Tal como se anotaron en la app; la fecha es la del análisis.',de:'Wie in der App eingetragen; das Datum ist der Tag der Blutabnahme.',pt:'Como registrados no app; a data é a do exame.',fr:'Tels que saisis dans l’app ; la date est celle du prélèvement.',pl:'Tak jak wpisane w aplikacji; data — dzień pobrania.',it:'Come inseriti nell’app; la data è quella del prelievo.',he:'כפי שהוזנו באפליקציה; התאריך — יום הבדיקה.',ja:'アプリに入力した値です。日付は検査日です。',ko:'앱에 입력한 값이며, 날짜는 검사한 날이에요.'},
    // ── ADAM-L (мужчины 40+, 2026-11-06) ──
    gp_men_sub:{ru:'с такими жалобами обычно начинают с него: он назначит анализы, в том числе тестостерон, и направит к урологу или эндокринологу, если нужно',uk:'з такими скаргами зазвичай починають із нього: він призначить аналізи, зокрема тестостерон, і направить до уролога чи ендокринолога, якщо потрібно',en:'this is the usual first stop: your family doctor can order tests, including testosterone, and refer you to a urologist or endocrinologist if needed',es:'con estas molestias se suele empezar por aquí: puede pedir análisis, incluida la testosterona, y derivarte a urología o endocrinología si hace falta',de:'bei solchen Beschwerden ist die Hausarztpraxis meist die erste Anlaufstelle: Sie veranlasst Laborwerte, auch Testosteron, und überweist bei Bedarf zur Urologie oder Endokrinologie',pt:'com estas queixas costuma-se começar por aqui: o médico de família pede exames, incluindo testosterona, e encaminha ao urologista ou endocrinologista, se for preciso',fr:'pour ces symptômes, on commence souvent par lui : il prescrit des analyses, dont la testostérone, et vous oriente vers un urologue ou un endocrinologue si besoin',pl:'z takimi dolegliwościami zwykle zaczyna się od niego: zleci badania, w tym testosteron, i skieruje do urologa lub endokrynologa, jeśli trzeba',it:'con questi disturbi di solito si parte da qui: il medico di famiglia prescrive gli esami, compreso il testosterone, e ti indirizza dall’urologo o dall’endocrinologo se serve',he:'עם תלונות כאלה בדרך כלל מתחילים כאן: רופא/ת המשפחה יפנה לבדיקות, כולל טסטוסטרון, ולאורולוג או לאנדוקרינולוג במידת הצורך',ja:'こうした症状はまずかかりつけ医からが一般的です。テストステロンを含む検査を出し、必要なら泌尿器科や内分泌内科を紹介してくれます',ko:'이런 증상은 보통 가정의학과에서 시작해요. 테스토스테론을 포함한 검사를 하고, 필요하면 비뇨의학과나 내분비내과로 의뢰해 줘요'},
    note_private_uro:{ru:'К частному урологу обычно можно записаться и без направления.',uk:'До приватного уролога зазвичай можна записатися й без направлення.',en:'A private urologist will usually see you without a referral.',es:'En la sanidad privada, a urología se suele poder ir sin derivación.',de:'Private Urologiepraxen nehmen meist auch ohne Überweisung Termine an.',pt:'No privado, normalmente pode marcar com um urologista sem encaminhamento.',fr:'Dans le privé, on peut en général consulter un urologue sans orientation.',pl:'Do prywatnego urologa zwykle można zapisać się bez skierowania.',it:'Privatamente, dall’urologo di solito si può andare senza impegnativa.',he:'לאורולוג פרטי אפשר בדרך כלל לקבוע תור גם בלי הפניה.',ja:'自費の泌尿器科なら、紹介状なしで受診できることが多いです。',ko:'개인 비뇨의학과는 보통 의뢰서 없이도 예약할 수 있어요.'},
    q_m2:{ru:'Стоит ли мне проверить тестостерон — и в какое время его сдавать?',uk:'Чи варто мені перевірити тестостерон — і в який час його здавати?',en:'Should I have my testosterone checked — and at what time of day?',es:'¿Debería medirme la testosterona? ¿A qué hora conviene hacerse el análisis?',de:'Sollte ich meinen Testosteronwert bestimmen lassen — und zu welcher Tageszeit?',pt:'Devo verificar a testosterona — e a que horas fazer o exame?',fr:'Dois-je faire doser ma testostérone — et à quelle heure ?',pl:'Czy powinienem sprawdzić testosteron — i o jakiej porze go badać?',it:'Dovrei controllare il testosterone? E a che ora fare il prelievo?',he:'האם כדאי לי לבדוק טסטוסטרון — ובאיזו שעה ביום?',ja:'テストステロンを測ったほうがよいですか？検査は何時ごろがよいですか？',ko:'테스토스테론을 검사해 봐야 할까요? 하루 중 언제 검사하면 좋을까요?'},
    q_m4:{ru:'Если тестостерон окажется низким — какие есть варианты и их за и против в моём случае?',uk:'Якщо тестостерон виявиться низьким — які є варіанти та їхні за і проти в моєму випадку?',en:'If my testosterone turns out low, what are the options and their pros and cons in my case?',es:'Si la testosterona sale baja, ¿qué opciones hay y qué pros y contras tienen en mi caso?',de:'Falls der Testosteronwert niedrig ist: Welche Möglichkeiten gibt es, und was spricht in meinem Fall dafür und dagegen?',pt:'Se a testosterona estiver baixa, quais são as opções e os prós e contras no meu caso?',fr:'Si ma testostérone est basse, quelles sont les options et leurs pour et contre dans mon cas ?',pl:'Jeśli testosteron okaże się niski — jakie są możliwości i ich za i przeciw w moim przypadku?',it:'Se il testosterone risulta basso, quali opzioni ci sono e con quali pro e contro nel mio caso?',he:'אם הטסטוסטרון יתברר כנמוך — מה האפשרויות ומה היתרונות והחסרונות במקרה שלי?',ja:'テストステロンが低かった場合、どんな選択肢があり、私の場合の利点と欠点は？',ko:'테스토스테론이 낮게 나오면 어떤 방법이 있고, 제 경우 장단점은 무엇인가요?'},
    q_ref_uro:{ru:'Нужна ли мне консультация уролога или эндокринолога?',uk:'Чи потрібна мені консультація уролога або ендокринолога?',en:'Should I also see a urologist or endocrinologist?',es:'¿Necesito que me vea urología o endocrinología?',de:'Sollte ich zusätzlich zur Urologie oder Endokrinologie gehen?',pt:'Preciso de uma consulta de urologia ou endocrinologia?',fr:'Dois-je aussi consulter un urologue ou un endocrinologue ?',pl:'Czy potrzebuję konsultacji urologa lub endokrynologa?',it:'Ho bisogno di una visita urologica o endocrinologica?',he:'האם כדאי שאפנה גם לאורולוג או לאנדוקרינולוג?',ja:'泌尿器科や内分泌内科も受診したほうがよいですか？',ko:'비뇨의학과나 내분비내과 진료도 받아야 할까요?'},
    h_ask:{ru:'Спросите врача',uk:'Запитайте лікаря',en:'Ask your doctor',es:'Pregunta en la consulta',de:'Fragen Sie nach',pt:'Pergunte ao médico',fr:'Demandez au médecin',pl:'Zapytaj lekarza',it:'Chiedi al medico',he:'שאלו את הרופא/ה',ja:'医師への質問',ko:'의사에게 물어보세요'},
    h_take:{ru:'Возьмите с собой',uk:'Візьміть із собою',en:'Bring with you',es:'Lleva contigo',de:'Nehmen Sie mit',pt:'Leve com você',fr:'À apporter',pl:'Zabierz ze sobą',it:'Porta con te',he:'קחו איתכם',ja:'持っていくもの',ko:'챙겨 갈 것'},
    say_age:{ru:'Мне {a}.',uk:'Мені {a}.',en:'I’m {a}.',es:'Tengo {a} años.',de:'Ich bin {a}.',pt:'Tenho {a} anos.',fr:'J’ai {a} ans.',pl:'Mam {a} lat.',it:'Ho {a} anni.',he:'אני בת {a}.',ja:'{a}歳です。',ko:'{a}세예요.'},
    say_cmp:{ru:'Больше всего беспокоит: {x}.',uk:'Найбільше турбує: {x}.',en:'What bothers me most: {x}.',es:'Lo que más me preocupa: {x}.',de:'Am meisten belastet mich: {x}.',pt:'O que mais me incomoda: {x}.',fr:'Ce qui me gêne le plus : {x}.',pl:'Najbardziej niepokoi mnie: {x}.',it:'Ciò che mi disturba di più: {x}.',he:'מה שהכי מטריד אותי: {x}.',ja:'いちばん気になるのは{x}です。',ko:'가장 불편한 점: {x}.'},
    say_since:{ru:'Отмечаю это с {d}.',uk:'Помічаю це з {d}.',en:'I’ve noticed it since {d}.',es:'Lo noto desde el {d}.',de:'Ich bemerke das seit dem {d}.',pt:'Percebo isso desde {d}.',fr:'Je le remarque depuis le {d}.',pl:'Zauważam to od {d}.',it:'Lo noto dal {d}.',he:'אני שמה לב לזה מאז {d}.',ja:'{d}から気づいています。',ko:'{d}부터 느끼고 있어요.'},
    say_cyc_rng:{ru:'Цикл стал нерегулярным: от {a} до {b} дней.',uk:'Цикл став нерегулярним: від {a} до {b} днів.',en:'My cycle has become irregular: from {a} to {b} days.',es:'Mi ciclo se ha vuelto irregular: de {a} a {b} días.',de:'Mein Zyklus ist unregelmäßig geworden: {a} bis {b} Tage.',pt:'Meu ciclo ficou irregular: de {a} a {b} dias.',fr:'Mon cycle est devenu irrégulier : de {a} à {b} jours.',pl:'Cykl stał się nieregularny: od {a} do {b} dni.',it:'Il ciclo è diventato irregolare: da {a} a {b} giorni.',he:'המחזור שלי הפך ללא סדיר: בין {a} ל־{b} ימים.',ja:'周期が不規則になりました（{a}〜{b}日）。',ko:'주기가 불규칙해졌어요: {a}~{b}일.'},
    say_cyc:{ru:'Цикл стал нерегулярным.',uk:'Цикл став нерегулярним.',en:'My cycle has become irregular.',es:'Mi ciclo se ha vuelto irregular.',de:'Mein Zyklus ist unregelmäßig geworden.',pt:'Meu ciclo ficou irregular.',fr:'Mon cycle est devenu irrégulier.',pl:'Mój cykl stał się nieregularny.',it:'Il mio ciclo è diventato irregolare.',he:'המחזור שלי הפך ללא סדיר.',ja:'周期が不規則になりました。',ko:'주기가 불규칙해졌어요.'},
    say_nocyc_d:{ru:'Месячных больше нет, последние были {d}.',uk:'Місячних більше немає, останні були {d}.',en:'My periods have stopped; the last one was on {d}.',es:'Ya no tengo la regla; la última fue el {d}.',de:'Meine Periode ist ausgeblieben; die letzte war am {d}.',pt:'Minha menstruação parou; a última foi em {d}.',fr:'Je n’ai plus de règles ; les dernières remontent au {d}.',pl:'Nie mam już miesiączki; ostatnia była {d}.',it:'Non ho più il ciclo; l’ultimo è stato il {d}.',he:'אין לי יותר וסת; האחרונה הייתה ב־{d}.',ja:'月経はもうありません。最後は{d}でした。',ko:'생리가 끊겼어요. 마지막은 {d}이었어요.'},
    say_nocyc:{ru:'Месячных больше нет.',uk:'Місячних більше немає.',en:'My periods have stopped.',es:'Ya no tengo la regla.',de:'Meine Periode ist ausgeblieben.',pt:'Minha menstruação parou.',fr:'Je n’ai plus de règles.',pl:'Nie mam już miesiączki.',it:'Non ho più il ciclo.',he:'אין לי יותר וסת.',ja:'月経はもうありません。',ko:'생리가 끊겼어요.'},
    say_hf:{ru:'Приливы были в {n} из последних 28 дней.',uk:'Припливи були в {n} з останніх 28 днів.',en:'I’ve had hot flashes on {n} of the last 28 days.',es:'He tenido sofocos {n} de los últimos 28 días.',de:'Ich hatte an {n} der letzten 28 Tage Hitzewallungen.',pt:'Tive ondas de calor em {n} dos últimos 28 dias.',fr:'J’ai eu des bouffées de chaleur {n} jours sur les 28 derniers.',pl:'Uderzenia gorąca miałam w {n} z ostatnich 28 dni.',it:'Ho avuto vampate in {n} degli ultimi 28 giorni.',he:'היו לי גלי חום ב־{n} מתוך 28 הימים האחרונים.',ja:'直近28日のうち{n}日にホットフラッシュがありました。',ko:'최근 28일 중 {n}일 안면홍조가 있었어요.'},
    say_hf_f:{ru:'Обычно {f} за день.',uk:'Зазвичай {f} за день.',en:'Usually {f} a day.',es:'Normalmente {f} al día.',de:'Meist {f} am Tag.',pt:'Normalmente {f} por dia.',fr:'En général {f} par jour.',pl:'Zwykle {f} dziennie.',it:'Di solito {f} al giorno.',he:'בדרך כלל {f} ביום.',ja:'たいてい1日{f}回です。',ko:'보통 하루 {f}번이에요.'},
    say_sleep:{ru:'Сплю в среднем {h} — на {m} мин меньше, чем месяцем раньше.',uk:'Сплю в середньому {h} — на {m} хв менше, ніж місяцем раніше.',en:'I sleep {h} on average — {m} min less than a month earlier.',es:'Duermo de media {h}, {m} min menos que un mes antes.',de:'Ich schlafe im Schnitt {h} — {m} Min weniger als einen Monat davor.',pt:'Durmo em média {h} — {m} min a menos que um mês antes.',fr:'Je dors en moyenne {h}, soit {m} min de moins qu’un mois plus tôt.',pl:'Śpię średnio {h} — o {m} min krócej niż miesiąc wcześniej.',it:'Dormo in media {h}, {m} min in meno di un mese prima.',he:'אני ישנה בממוצע {h} — {m} דק׳ פחות מחודש קודם.',ja:'平均睡眠は{h}で、1か月前より{m}分短くなっています。',ko:'평균 {h} 자는데, 한 달 전보다 {m}분 줄었어요.'},
    d_sleep:{ru:'Сон',uk:'Сон',en:'Sleep',es:'Sueño',de:'Schlaf',pt:'Sono',fr:'Sommeil',pl:'Sen',it:'Sonno',he:'שינה',ja:'睡眠',ko:'수면'},
    d_rhr:{ru:'Пульс покоя',uk:'Пульс спокою',en:'Resting heart rate',es:'Pulso en reposo',de:'Ruhepuls',pt:'Frequência em repouso',fr:'Fréquence au repos',pl:'Tętno spoczynkowe',it:'Frequenza a riposo',he:'דופק במנוחה',ja:'安静時心拍数',ko:'안정 시 심박수'},
    d_hrv:{ru:'Вариабельность пульса',uk:'Варіабельність пульсу',en:'Heart rate variability',es:'Variabilidad cardiaca',de:'Herzfrequenzvariabilität',pt:'Variabilidade cardíaca',fr:'Variabilité cardiaque',pl:'Zmienność rytmu serca',it:'Variabilità cardiaca',he:'שונות קצב הלב',ja:'心拍変動',ko:'심박 변이도'},
    d_hf:{ru:'Дни с приливами',uk:'Дні з припливами',en:'Days with hot flashes',es:'Días con sofocos',de:'Tage mit Hitzewallungen',pt:'Dias com ondas de calor',fr:'Jours avec bouffées',pl:'Dni z uderzeniami gorąca',it:'Giorni con vampate',he:'ימים עם גלי חום',ja:'ホットフラッシュの日数',ko:'안면홍조가 있던 날'},
    d_bp:{ru:'Давление, среднее',uk:'Тиск, середній',en:'Blood pressure, average',es:'Presión, media',de:'Blutdruck, Schnitt',pt:'Pressão, média',fr:'Tension, moyenne',pl:'Ciśnienie, średnie',it:'Pressione, media',he:'לחץ דם, ממוצע',ja:'血圧（平均）',ko:'혈압(평균)'},
    u_h:{ru:'ч',uk:'год',en:'h',es:'h',de:'Std',pt:'h',fr:'h',pl:'godz.',it:'h',he:'ש׳',ja:'時間',ko:'시간'},
    u_min:{ru:'мин',uk:'хв',en:'min',es:'min',de:'Min',pt:'min',fr:'min',pl:'min',it:'min',he:'דק׳',ja:'分',ko:'분'},
    u_ms:{ru:'мс',uk:'мс',en:'ms',es:'ms',de:'ms',pt:'ms',fr:'ms',pl:'ms',it:'ms',he:'מ״ש',ja:'ms',ko:'ms'},
    q1:{ru:'С чем могут быть связаны эти изменения?',uk:'З чим можуть бути пов’язані ці зміни?',en:'What could be behind these changes?',es:'¿Con qué pueden estar relacionados estos cambios?',de:'Womit können diese Veränderungen zusammenhängen?',pt:'Com o que essas mudanças podem estar relacionadas?',fr:'À quoi ces changements peuvent-ils être liés ?',pl:'Z czym mogą być związane te zmiany?',it:'A cosa possono essere legati questi cambiamenti?',he:'במה השינויים האלה יכולים להיות קשורים?',ja:'これらの変化は何と関係している可能性がありますか？',ko:'이런 변화는 무엇과 관련이 있을까요?'},
    q2:{ru:'Подходит ли мне гормональная терапия — какие за и против в моём случае?',uk:'Чи підходить мені гормональна терапія — які за і проти в моєму випадку?',en:'Is hormone therapy an option for me — what are the pros and cons in my case?',es:'¿La terapia hormonal es una opción para mí? ¿Qué pros y contras tiene en mi caso?',de:'Kommt eine Hormontherapie für mich infrage — was spricht in meinem Fall dafür und dagegen?',pt:'A terapia hormonal é uma opção para mim — quais os prós e contras no meu caso?',fr:'Le traitement hormonal est-il envisageable pour moi — quels sont les pour et les contre dans mon cas ?',pl:'Czy terapia hormonalna jest dla mnie — jakie są za i przeciw w moim przypadku?',it:'La terapia ormonale è un’opzione per me? Quali pro e contro nel mio caso?',he:'האם טיפול הורמונלי מתאים לי — מה היתרונות והחסרונות במקרה שלי?',ja:'ホルモン療法は私に合いますか？私の場合の利点と欠点は？',ko:'호르몬 치료가 저에게 맞을까요? 제 경우 장단점은 무엇인가요?'},
    q3:{ru:'Какие анализы мне стоит сдать?',uk:'Які аналізи мені варто здати?',en:'Which tests should I have?',es:'¿Qué análisis debería hacerme?',de:'Welche Untersuchungen sollte ich machen lassen?',pt:'Quais exames devo fazer?',fr:'Quels examens devrais-je faire ?',pl:'Jakie badania powinnam zrobić?',it:'Quali esami dovrei fare?',he:'אילו בדיקות כדאי לי לעשות?',ja:'どんな検査を受けるとよいですか？',ko:'어떤 검사를 받아야 할까요?'},
    q4:{ru:'Что может помочь, если гормональная терапия мне не подходит?',uk:'Що може допомогти, якщо гормональна терапія мені не підходить?',en:'What could help if hormone therapy isn’t right for me?',es:'¿Qué puede ayudarme si la terapia hormonal no es para mí?',de:'Was kann helfen, wenn eine Hormontherapie für mich nicht passt?',pt:'O que pode ajudar se a terapia hormonal não for adequada para mim?',fr:'Qu’est-ce qui peut aider si le traitement hormonal ne me convient pas ?',pl:'Co może pomóc, jeśli terapia hormonalna nie jest dla mnie?',it:'Cosa può aiutare se la terapia ormonale non fa per me?',he:'מה יכול לעזור אם טיפול הורמונלי לא מתאים לי?',ja:'ホルモン療法が合わない場合、何が役立ちますか？',ko:'호르몬 치료가 맞지 않으면 무엇이 도움이 될까요?'},
    q_bp:{ru:'Что мне делать с давлением?',uk:'Що мені робити з тиском?',en:'What should I do about my blood pressure?',es:'¿Qué debo hacer con mi presión?',de:'Was sollte ich wegen meines Blutdrucks tun?',pt:'O que devo fazer com a minha pressão?',fr:'Que dois-je faire pour ma tension ?',pl:'Co powinnam zrobić z ciśnieniem?',it:'Cosa devo fare per la pressione?',he:'מה עליי לעשות עם לחץ הדם?',ja:'血圧についてどうすればよいですか？',ko:'혈압은 어떻게 해야 할까요?'},
    take_meds:{ru:'Список лекарств и добавок:',uk:'Список ліків і добавок:',en:'Your list of medicines and supplements:',es:'La lista de medicamentos y suplementos:',de:'Ihre Liste der Medikamente und Nahrungsergänzungen:',pt:'A lista de remédios e suplementos:',fr:'La liste de vos médicaments et compléments :',pl:'Listę leków i suplementów:',it:'L’elenco di farmaci e integratori:',he:'רשימת התרופות והתוספים:',ja:'薬とサプリメントのリスト：',ko:'복용 중인 약과 영양제 목록:'},
    take_meds0:{ru:'Список лекарств и добавок, которые принимаете.',uk:'Список ліків і добавок, які приймаєте.',en:'A list of the medicines and supplements you take.',es:'La lista de medicamentos y suplementos que tomas.',de:'Eine Liste der Medikamente und Nahrungsergänzungen, die Sie nehmen.',pt:'A lista de remédios e suplementos que você toma.',fr:'La liste des médicaments et compléments que vous prenez.',pl:'Listę leków i suplementów, które przyjmujesz.',it:'L’elenco di farmaci e integratori che prendi.',he:'רשימה של התרופות והתוספים שאתם נוטלים.',ja:'服用中の薬とサプリメントのリスト。',ko:'복용 중인 약과 영양제 목록.'},
    take_cyc:{ru:'Даты начала последних месячных:',uk:'Дати початку останніх місячних:',en:'Start dates of your recent periods:',es:'Fechas de inicio de tus últimas reglas:',de:'Beginn Ihrer letzten Perioden:',pt:'Datas de início das últimas menstruações:',fr:'Dates de début de vos dernières règles :',pl:'Daty początku ostatnich miesiączek:',it:'Date di inizio degli ultimi cicli:',he:'תאריכי תחילת הווסתות האחרונות:',ja:'最近の月経開始日：',ko:'최근 생리 시작일:'},
    take_cyc0:{ru:'Даты последних месячных.',uk:'Дати останніх місячних.',en:'The dates of your recent periods.',es:'Las fechas de tus últimas reglas.',de:'Die Daten Ihrer letzten Perioden.',pt:'As datas das últimas menstruações.',fr:'Les dates de vos dernières règles.',pl:'Daty ostatnich miesiączek.',it:'Le date degli ultimi cicli.',he:'התאריכים של הווסתות האחרונות.',ja:'最近の月経の日付。',ko:'최근 생리 날짜.'},
    take_bp:{ru:'Свои записи давления — или тонометр.',uk:'Свої записи тиску — або тонометр.',en:'Your blood pressure log — or your monitor.',es:'Tus registros de presión, o el tensiómetro.',de:'Ihre Blutdruckwerte — oder das Messgerät.',pt:'Seus registros de pressão — ou o aparelho.',fr:'Vos relevés de tension, ou votre tensiomètre.',pl:'Swoje zapisy ciśnienia — albo ciśnieniomierz.',it:'I tuoi valori di pressione, o il misuratore.',he:'רישומי לחץ הדם שלכם — או את המכשיר.',ja:'血圧の記録、または血圧計。',ko:'혈압 기록이나 혈압계.'},
    show:{ru:'Показать врачу',uk:'Показати лікарю',en:'Show the doctor',es:'Enseñar en consulta',de:'Ärztin/Arzt zeigen',pt:'Mostrar ao médico',fr:'Montrer au médecin',pl:'Pokaż lekarzowi',it:'Mostra al medico',he:'להראות לרופא/ה',ja:'医師に見せる',ko:'의사에게 보여 주기'},
    show_off:{ru:'Обычный размер',uk:'Звичайний розмір',en:'Normal size',es:'Tamaño normal',de:'Normale Größe',pt:'Tamanho normal',fr:'Taille normale',pl:'Zwykły rozmiar',it:'Dimensione normale',he:'גודל רגיל',ja:'通常サイズ',ko:'기본 크기'},
    share:{ru:'Поделиться',uk:'Поділитися',en:'Share',es:'Compartir',de:'Teilen',pt:'Compartilhar',fr:'Partager',pl:'Udostępnij',it:'Condividi',he:'שיתוף',ja:'共有',ko:'공유'},
    copied:{ru:'Текст скопирован — вставьте его в сообщение или заметки.',uk:'Текст скопійовано — вставте його в повідомлення чи нотатки.',en:'Text copied — paste it into a message or your notes.',es:'Texto copiado: pégalo en un mensaje o en tus notas.',de:'Text kopiert — fügen Sie ihn in eine Nachricht oder Notiz ein.',pt:'Texto copiado — cole numa mensagem ou nas suas notas.',fr:'Texte copié — collez-le dans un message ou vos notes.',pl:'Tekst skopiowany — wklej go do wiadomości lub notatek.',it:'Testo copiato: incollalo in un messaggio o nelle note.',he:'הטקסט הועתק — הדביקו אותו בהודעה או בפתקים.',ja:'テキストをコピーしました。メッセージやメモに貼り付けてください。',ko:'텍스트를 복사했어요. 메시지나 메모에 붙여 넣으세요.'},
    note:{ru:'Это не диагноз — ваши данные и вопросы для разговора с врачом.',uk:'Це не діагноз — ваші дані й запитання для розмови з лікарем.',en:'This isn’t a diagnosis — it’s your data and questions for a conversation with your doctor.',es:'No es un diagnóstico: son tus datos y preguntas para hablar con tu médico.',de:'Das ist keine Diagnose — es sind Ihre Daten und Fragen für das Gespräch in der Praxis.',pt:'Isto não é um diagnóstico — são seus dados e perguntas para conversar com o médico.',fr:'Ce n’est pas un diagnostic : ce sont vos données et vos questions pour en parler avec votre médecin.',pl:'To nie diagnoza — to Twoje dane i pytania do rozmowy z lekarzem.',it:'Non è una diagnosi: sono i tuoi dati e le domande per parlarne con il medico.',he:'זו לא אבחנה — אלה הנתונים שלכם ושאלות לשיחה עם הרופא/ה.',ja:'これは診断ではありません。医師と話すためのあなたのデータと質問です。',ko:'진단이 아니에요. 의사와 이야기할 내 데이터와 질문이에요.'}
  };
  // Мужские формы там, где фраза от первого лица зависит от рода (ru/uk/pl/it/he); остальное общее.
  var MALE = {
    dismiss:{ru:'Уже был у врача',uk:'Уже був у лікаря',pl:'Byłem już u lekarza',it:'Sono già stato dal medico'},
    say_age:{he:'אני בן {a}.'},
    say_since:{he:'אני שם לב לזה מאז {d}.'},
    say_sleep:{he:'אני ישן בממוצע {h} — {m} דק׳ פחות מחודש קודם.'},
    q3:{pl:'Jakie badania powinienem zrobić?'},
    q_bp:{pl:'Co powinienem zrobić z ciśnieniem?'}
  };
  var QUO = { ru:['«','»'], uk:['«','»'], es:['«','»'], fr:['« ',' »'], pt:['“','”'], it:['«','»'], pl:['„','”'], de:['„','“'], en:['“','”'], he:['״','״'], ja:['「','」'], ko:['“','”'] };
  var HF_F = { low:'1–2', mid:'3–5', high:'6–10', veryhigh:'10+' };

  function lg() { return (typeof lang !== 'undefined' && lang) || 'en'; }
  var _male = false;   // ставит collect(): ADAM-L → мужские формы
  function T(k) { var m = _male && MALE[k] && MALE[k][lg()]; if (m) return m; var o = S[k]; return o ? (o[lg()] || o.en) : k; }
  function SP() { return lg() === 'ja' ? '' : ' '; }               // японский пишет фразы без пробелов
  function END() { return lg() === 'ja' ? '。' : '.'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
  function J(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function fmtDate(ymd) {
    try { var d = new Date(ymd + 'T12:00:00'); if (isNaN(d)) return ymd;
      var o = { day:'numeric', month:'long' }; if (d.getFullYear() !== new Date().getFullYear()) o.year = 'numeric';   // год — только если не текущий (ru «2026 г.» давал «г..» в конце фразы)
      return d.toLocaleDateString(lg() === 'uk' ? 'uk-UA' : lg(), o).replace(/\.$/, ''); } catch (e) { return ymd; }
  }
  function fmtH(h) { var m = Math.round(h * 60), hh = Math.floor(m / 60), mm = m % 60; return hh + ' ' + T('u_h') + ' ' + (mm < 10 ? '0' : '') + mm + ' ' + T('u_min'); }

  // ── что знаем о ней: всё с устройства, без сети ──
  function collect() {
    var P = J('vialp_profile', {}) || {};
    var male = P.gender === 'male' || (typeof getRadio === 'function' && getRadio('gender') === 'male');
    if (male && window.DV_SEX !== 'male') return null;   // VIA-L: мужчинам карточку не показываем (решение — только по ADAM-L)
    _male = male;
    var age = parseInt(P.age) || 0;
    if (age && age < (male ? 40 : 35)) return null;
    var arr = J('vialp_daily', []) || [], now = Date.now();
    var cur = arr.filter(function (r) { return r && r.ts && now - r.ts < 28 * DAY; });
    var prev = arr.filter(function (r) { return r && r.ts && now - r.ts >= 28 * DAY && now - r.ts < 56 * DAY; });
    var avg = function (list, k, min) { var v = list.map(function (r) { return r[k]; }).filter(function (x) { return x != null && x !== '' && !isNaN(x) && +x > 0; });
      return v.length >= (min || 5) ? v.reduce(function (a, b) { return a + (+b); }, 0) / v.length : null; };
    var hfDays = cur.filter(function (r) { return r.hf_count && r.hf_count !== 'none'; }).length;
    var hfMode = (function () { var c = {}, best = null, n = 0; cur.forEach(function (r) { var x = r.hf_count; if (!x || x === 'none') return; c[x] = (c[x] || 0) + 1; if (c[x] > n) { n = c[x]; best = x; } }); return best; })();
    var bpS = avg(cur, 'bp_sys', 3), bpD = avg(cur, 'bp_dia', 3);
    // цикл: длины по журналу начал (последние 5 промежутков)
    var st = (J('vialp_cycle_starts', []) || []).filter(function (d) { return /^\d{4}-\d{2}-\d{2}$/.test(d); }).sort();
    var gaps = []; for (var i = 1; i < st.length; i++) { var g = Math.round((new Date(st[i]) - new Date(st[i - 1])) / DAY); if (g >= 15 && g <= 120) gaps.push(g); }
    gaps = gaps.slice(-5);
    var cs = (typeof getRadio === 'function' && getRadio('cycle_status')) || P.cycle_status || '';
    var spread = gaps.length >= 3 ? Math.max.apply(null, gaps) - Math.min.apply(null, gaps) : 0;
    var c = P.complaint || null, cItems = (c && Array.isArray(c.items)) ? c.items : [], KEYS = male ? CMP_KEYS_M : CMP_KEYS;
    var cDays = (c && /^\d{4}-\d{2}-\d{2}$/.test(c.since || '')) ? Math.floor((now - new Date(c.since + 'T00:00:00')) / DAY) : 0;
    return {
      P:P, age:age, cs:cs, gaps:gaps, starts:st,
      cItems:cItems, cSince:(c && c.since) || '', cRel:cItems.filter(function (k) { return KEYS.indexOf(k) >= 0; }),
      long:cDays >= 42 && cItems.some(function (k) { return KEYS.indexOf(k) >= 0; }),
      male:male,
      hfDays:male ? 0 : hfDays, hfMode:hfMode,
      irr:!male && (cs === 'irregular' || spread >= 7),
      bp:(bpS != null && bpD != null && (bpS >= 140 || bpD >= 90)) ? Math.round(bpS) + '/' + Math.round(bpD) : '',
      bpAvg:(bpS != null && bpD != null) ? Math.round(bpS) + '/' + Math.round(bpD) : '',
      sleep:[avg(cur, 'sleepHours'), avg(prev, 'sleepHours')],
      rhr:[avg(cur, 'rhr'), avg(prev, 'rhr')],
      hrv:[avg(cur, 'hrv'), avg(prev, 'hrv')]
    };
  }
  function reasons(d) {
    var r = [];
    if (d.long) r.push(T('why_long'));
    if (d.hfDays >= 8) r.push(T('why_hf').replace('{n}', d.hfDays));
    if (d.irr && d.cs !== 'absent') r.push(T('why_cyc'));
    if (d.bp) r.push(T('why_bp').replace('{v}', d.bp));
    return r;
  }
  function gynNeeded(d) { return d.long || d.hfDays >= 8 || (d.irr && d.cs !== 'absent'); }   // «есть повод к профильному» (у мужчин — к урологу)
  // ── куда идти (2026-11-07, слово владельца): в госсистеме любой страны к профильному врачу направляет семейный,
  // частно в любой стране можно сразу к любому специалисту. Поэтому всегда семейный врач + строка «частно — напрямую»;
  // таблиц стран нет (было по часовому поясу — снято).
  function hidden() { var t = +J(K_HIDE, 0) || 0; return t && Date.now() - t < HIDE_DAYS * DAY; }

  // ── «что сказать» от первого лица ──
  function sayLines(d) {
    var s = [];
    if (d.age) s.push(T('say_age').replace('{a}', d.age));
    if (d.cRel.length) {
      var lbl = d.cRel.map(function (k) { return typeof _cmpLbl === 'function' ? _cmpLbl(k) : k; });
      var x = lbl.join(', '); if (['ru','uk','en','es','pt','fr','it','pl'].indexOf(lg()) >= 0) x = x.toLowerCase();   // de — существительные с заглавной; he/ja/ko — регистра нет
      s.push(T('say_cmp').replace('{x}', x) + (d.cSince ? SP() + T('say_since').replace('{d}', fmtDate(d.cSince)) : ''));
    }
    if (d.male) {}
    else if (d.cs === 'absent') s.push(d.P.lastperiod ? T('say_nocyc_d').replace('{d}', fmtDate(d.P.lastperiod)) : T('say_nocyc'));
    else if (d.irr) s.push(d.gaps.length >= 3 ? T('say_cyc_rng').replace('{a}', Math.min.apply(null, d.gaps)).replace('{b}', Math.max.apply(null, d.gaps)) : T('say_cyc'));
    if (d.hfDays) s.push(T('say_hf').replace('{n}', d.hfDays) + (HF_F[d.hfMode] ? SP() + T('say_hf_f').replace('{f}', HF_F[d.hfMode]) : ''));
    if (d.sleep[0] && d.sleep[1] && d.sleep[1] - d.sleep[0] >= 1 / 3) s.push(T('say_sleep').replace('{h}', fmtH(d.sleep[0])).replace('{m}', Math.round((d.sleep[1] - d.sleep[0]) * 60)));
    return s;
  }
  function dataRows(d) {
    var rows = [], sg = function (x) { return (x > 0 ? '+' : x < 0 ? '−' : '±') + Math.abs(x); };
    if (d.sleep[0]) rows.push([T('d_sleep'), fmtH(d.sleep[0]), d.sleep[1] ? sg(Math.round((d.sleep[0] - d.sleep[1]) * 60)) + ' ' + T('u_min') : '']);
    if (d.rhr[0]) rows.push([T('d_rhr'), String(Math.round(d.rhr[0])), d.rhr[1] ? sg(Math.round(d.rhr[0] - d.rhr[1])) : '']);
    if (d.hrv[0]) rows.push([T('d_hrv'), Math.round(d.hrv[0]) + ' ' + T('u_ms'), d.hrv[1] ? sg(Math.round((d.hrv[0] / d.hrv[1] - 1) * 100)) + '%' : '']);
    if (d.hfDays) rows.push([T('d_hf'), d.hfDays + ' / 28', '']);
    if (d.bpAvg) rows.push([T('d_bp'), d.bpAvg, '']);
    return rows;
  }
  // Анализы, вписанные в приложение (vialp_labs: {k:{v,u,raw,d}}) — как на бланке: число, единица, дата.
  function labRows() {
    var a = J('vialp_labs', {}) || {}, defs = (typeof LAB_DEFS !== 'undefined' && LAB_DEFS) || [], out = [];
    defs.forEach(function (df) { var x = a[df.k]; if (!x || x.raw == null || isNaN(x.raw)) return;
      out.push([ (df.n && (df.n[lg()] || df.n.en)) || df.k, String(x.raw).replace('.', (lg() === 'en' || lg() === 'ja' || lg() === 'ko' || lg() === 'he') ? '.' : ',') + ' ' + (x.u || df.c || ''), x.d ? fmtDate(x.d) : '' ]); });
    return out.slice(0, 25);
  }
  function questions(d) {
    var q = [];
    if (gynNeeded(d)) { if (d.male) q.push(T('q1'), T('q_m2'), T('q3'), T('q_m4')); else q.push(T('q1'), T('q2'), T('q3'), T('q4')); }
    else q.push(T('q3'));
    if (gynNeeded(d)) q.push(T(d.male ? 'q_ref_uro' : 'q_ref'));
    if (d.bp) q.push(T('q_bp'));
    return q;
  }
  function takeLines(d) {
    var t = [], meds = [];
    try { if (typeof _ikActiveOn === 'function') meds = _ikActiveOn().map(function (it) { return String(it.name || '').trim(); }).filter(Boolean); } catch (e) {}
    meds = meds.filter(function (m, i) { return meds.indexOf(m) === i; }).slice(0, 15);
    t.push(meds.length ? T('take_meds') + ' ' + meds.join(lg() === 'ja' ? '、' : ', ') + END() : T('take_meds0'));
    if (!d.male && d.cs !== 'absent') t.push(d.starts.length ? T('take_cyc') + ' ' + d.starts.slice(-4).map(fmtDate).join(lg() === 'ja' ? '、' : '; ') + END() : T('take_cyc0'));
    if (d.bp) t.push(T('take_bp'));
    return t;
  }

  // ── стиль: золотой акцент; сплошная золотая кнопка — только здесь (решение владельца 2026-11-06) ──
  function css() {
    if (document.getElementById('dv-css')) return;
    var s = document.createElement('style'); s.id = 'dv-css';
    s.textContent =
      '#rd-doctor{margin:0 0 14px;border:1.5px solid var(--gold-lt);box-shadow:0 0 0 4px rgba(238,175,84,.08),0 0 40px rgba(238,175,84,.18),0 12px 40px rgba(0,0,0,.5);}'
    + '#rd-doctor::before{content:"";position:absolute;top:-60px;left:-60px;width:280px;height:280px;border-radius:50%;pointer-events:none;filter:blur(55px);opacity:.32;background:radial-gradient(circle,#e2b95a,transparent 70%);}'
    + '#rd-doctor>*{position:relative;}'
    + '.dv-badge{display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-cap);font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#F3C066;background:linear-gradient(180deg,rgba(238,175,84,.14),rgba(200,140,52,.06));border:1px solid rgba(238,175,84,.5);padding:7px 14px;border-radius:50px;margin-bottom:12px;}'
    + '.dv-title{font-family:"Playfair Display",serif;font-weight:400;font-size:var(--fs-hero);color:var(--t1);line-height:1.2;margin:0 0 10px;}'
    + '.dv-lead{font-size:var(--fs-body);line-height:1.55;color:var(--t2);margin:0;}'
    + '.dv-solid{display:block;width:100%;margin-top:16px;padding:15px 18px;border:none;border-radius:14px;cursor:pointer;font-family:var(--font-ui);font-size:var(--fs-cap);font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#10131A;background:linear-gradient(180deg,#EEAF54,#C68C34);box-shadow:0 8px 24px rgba(198,140,52,.35);}'
    + '.dv-solid:active{transform:scale(.98);}'
    + '.dv-ghost{display:block;width:100%;margin-top:8px;padding:10px;background:none;border:none;cursor:pointer;font-family:var(--font-ui);font-size:var(--fs-cap);color:var(--t3);text-decoration:underline;text-underline-offset:3px;}'
    + '.dv-who{display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:14px;background:rgba(238,175,84,.08);border:1px solid rgba(238,175,84,.3);margin:4px 0 8px;}'
    + '.dv-who b{font-size:var(--fs-title);color:var(--t1);font-weight:500;display:block;}'
    + '.dv-ico{width:38px;height:38px;border-radius:50%;border:1px solid var(--gold-lt);display:flex;align-items:center;justify-content:center;color:var(--gold-lt);font-size:20px;flex:none;}'
    + '.dv-small{font-size:var(--fs-cap);color:var(--t3);line-height:1.45;}'
    + '.dv-sec{margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);}'
    + '.dv-h{font-family:"Playfair Display",serif;font-size:var(--fs-title);color:var(--gold-lt);margin:0 0 8px;}'
    + '.dv-quote{border-left:2px solid var(--gold-lt);padding:2px 0 2px 12px;font-style:italic;font-size:var(--fs-body);line-height:1.6;color:var(--t1);}'
    + '.dv-tbl{width:100%;border-collapse:collapse;font-size:var(--fs-body);}'
    + '.dv-tbl td{padding:7px 0;border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top;}'
    + '.dv-tbl td:nth-child(2){text-align:right;color:var(--t1);white-space:nowrap;padding-left:8px;}'
    + '.dv-tbl td:nth-child(3){text-align:right;color:var(--gold-lt);font-size:var(--fs-cap);white-space:nowrap;padding-left:8px;width:1%;}'
    + '.dv-ol{padding-left:20px;margin:0;font-size:var(--fs-body);line-height:1.5;color:var(--t1);}.dv-ol li{margin-bottom:6px;}'
    + '.dv-row{display:flex;gap:10px;margin-top:18px;}.dv-row .dv-solid{margin-top:0;flex:1;}'
    + '.dv-out{flex:1;padding:15px 14px;border-radius:14px;cursor:pointer;font-family:var(--font-ui);font-size:var(--fs-cap);letter-spacing:.12em;text-transform:uppercase;color:var(--gold-lt);background:#1E2335;border:1px solid rgba(238,175,84,.55);}'
    + '#dv-sheet.dv-big .dv-quote,#dv-sheet.dv-big .dv-ol,#dv-sheet.dv-big .dv-tbl{font-size:21px;line-height:1.55;}'
    + '#dv-sheet.dv-big .dv-h{font-size:22px;}';
    document.head.appendChild(s);
  }

  function cardHTML(d) {
    var r = reasons(d);
    return '<div class="dv-badge">✦ ' + esc(T('badge')) + '</div>'
      + '<h2 class="dv-title">' + esc(T('title')) + '</h2>'
      + '<p class="dv-lead">' + esc(r.join(SP()) + SP() + T('lead_gp')) + '</p>'
      + '<button type="button" class="dv-solid" onclick="vialDoctor.open()">' + esc(T('open')) + '</button>'
      + '<button type="button" class="dv-ghost" onclick="vialDoctor.hide()">' + esc(T('dismiss')) + '</button>';
  }
  // К кому идти: заголовок, подпись, значок — по маршруту и полу
  function who(d) {
    var meno = gynNeeded(d);
    return { t:T('who_gp'), s:T(meno ? (d.male ? 'gp_men_sub' : 'who_gp_meno_sub') : 'who_gp_sub'), ico:'♥' };
  }
  function sheetHTML(d) {
    var meno = gynNeeded(d), h = '<div id="dv-sheet">', w = who(d);
    h += '<div class="dv-who"><div class="dv-ico">' + w.ico + '</div><div><b>' + esc(w.t) + '</b>'
      + '<div class="dv-small">' + esc(w.s) + '</div></div></div>';
    var nt = meno ? T(d.male ? 'note_private_uro' : 'note_private') : '';   // частно — напрямую, в любой стране
    if (nt) h += '<div class="dv-small">' + esc(nt) + '</div>';
    var say = sayLines(d), q = QUO[lg()] || QUO.en;
    if (say.length) h += '<div class="dv-sec"><div class="dv-h">' + esc(T('h_say')) + '</div><div class="dv-quote">' + esc(q[0] + say.join(SP()) + q[1]) + '</div></div>';
    var rows = dataRows(d);
    if (rows.length) h += '<div class="dv-sec"><div class="dv-h">' + esc(T('h_data')) + '</div><table class="dv-tbl">'
      + rows.map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td>' + esc(x[1]) + '</td><td>' + esc(x[2]) + '</td></tr>'; }).join('')
      + '</table><div class="dv-small" style="margin-top:6px;">' + esc(T('h_data_sub')) + '</div></div>';
    var labs = labRows();
    if (labs.length) h += '<div class="dv-sec"><div class="dv-h">' + esc(T('h_labs')) + '</div><table class="dv-tbl">'
      + labs.map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td>' + esc(x[1]) + '</td><td>' + esc(x[2]) + '</td></tr>'; }).join('')
      + '</table><div class="dv-small" style="margin-top:6px;">' + esc(T('h_labs_sub')) + '</div></div>';
    h += '<div class="dv-sec"><div class="dv-h">' + esc(T('h_ask')) + '</div><ol class="dv-ol">'
      + questions(d).map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol></div>';
    h += '<div class="dv-sec"><div class="dv-h">' + esc(T('h_take')) + '</div><ul class="dv-ol" style="list-style:disc;">'
      + takeLines(d).map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="dv-row"><button type="button" class="dv-solid" id="dv-showbtn" onclick="vialDoctor.big()">' + esc(T('show')) + '</button>'
      + '<button type="button" class="dv-out" onclick="vialDoctor.share()">' + esc(T('share')) + '</button></div>';
    h += '<div class="dv-small" style="text-align:center;margin-top:12px;">' + esc(T('note')) + '</div></div>';
    return h;
  }
  function plainText(d) {
    var w = who(d), out = [T('title'), '', w.t + ' — ' + w.s];
    var say = sayLines(d); if (say.length) out.push('', T('h_say') + ':', say.join(SP()));
    var rows = dataRows(d); if (rows.length) { out.push('', T('h_data') + ':'); rows.forEach(function (x) { out.push('• ' + x[0] + ': ' + x[1] + (x[2] ? ' (' + x[2] + ')' : '')); }); }
    var labs = labRows(); if (labs.length) { out.push('', T('h_labs') + ':'); labs.forEach(function (x) { out.push('• ' + x[0] + ': ' + x[1] + (x[2] ? ' (' + x[2] + ')' : '')); }); }
    out.push('', T('h_ask') + ':'); questions(d).forEach(function (q, i) { out.push((i + 1) + '. ' + q); });
    out.push('', T('h_take') + ':'); takeLines(d).forEach(function (q) { out.push('• ' + q); });
    out.push('', T('note'));
    return out.join('\n');
  }

  window.vialDoctor = {
    // Есть ли сейчас повод к врачу (без учёта «Уже была у врача»): страница по нему включает предложение
    // разбора со специалистом ПОД разбором дня (_reviewReason). В саму карточку продажу не ставим —
    // медицинский вывод не должен заканчиваться покупкой (правило ревью, см. _reviewReason).
    active: function () { try { var d = collect(); return !!(d && reasons(d).length); } catch (e) { return false; } },
    // activeKey — день на экране: карточка только на сегодняшнем, не в истории
    render: function (activeKey) {
      var rd = document.querySelector('#stepResult > .rd'); if (!rd) return;
      var box = document.getElementById('rd-doctor');
      var today = (typeof _dayKey === 'function') ? _dayKey() : '';
      var d = (!activeKey || activeKey === today) && !hidden() ? collect() : null;
      if (!d || !reasons(d).length) { if (box) { box.style.display = 'none'; box.innerHTML = ''; } return; }
      css();
      if (!box) {
        box = document.createElement('div'); box.id = 'rd-doctor'; box.className = 'rd-card';
        var s1 = document.getElementById('rdStep1'); rd.insertBefore(box, s1 || rd.firstChild);
      }
      box.innerHTML = cardHTML(d); box.style.display = 'block';
    },
    open: function () {
      var d = collect(); if (!d) return; css();
      if (typeof openSheet === 'function') openSheet('<i class="ph ph-stethoscope"></i>', T('title'), sheetHTML(d));
    },
    big: function () {
      var s = document.getElementById('dv-sheet'), b = document.getElementById('dv-showbtn'); if (!s) return;
      var on = s.classList.toggle('dv-big'); if (b) b.textContent = T(on ? 'show_off' : 'show');
    },
    share: async function () {
      var d = collect(); if (!d) return; var text = plainText(d);
      try { if (navigator.share) { await navigator.share({ text:text }); return; } } catch (e) { return; }
      try { await navigator.clipboard.writeText(text); alert(T('copied')); } catch (e) { prompt('', text); }
    },
    hide: function () {
      try { localStorage.setItem(K_HIDE, JSON.stringify(Date.now())); } catch (e) {}
      var box = document.getElementById('rd-doctor'); if (box) { box.style.display = 'none'; box.innerHTML = ''; }
    }
  };
})();
