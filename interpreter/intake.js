/* VIA·L — «Мои приёмы»: расписание добавок и препаратов с напоминаниями (2026-09-18).
   ОДИН файл на обе страницы (interpreter-via-l.html и interpreter-via-l-expert.html) — нарочно:
   EXPERT начинался клоном VIA-L и потом расходился с ним (см. память «дрейф клона»).
   Страница до подключения задаёт window.IK_CFG = { prefix, arm(list) }:
     prefix — префикс localStorage ('vialp' у VIA-L, 'viae' у EXPERT);
     arm    — как ставить напоминания: VIA-L — локальные уведомления (notify-bridge.js),
              EXPERT — пуш с сервера (PWA не умеет будить себя сама).
   Пользуется глобальными функциями страницы: L, _esc, openSheet, renderCard.

   Откуда берётся список: галочки «Добавки и препараты» в профиле + своё, вписанное клиентом
   (supp_other / meds_other) + добавленное вручную здесь. Время подставляется по правилам приёма
   (те же, что у воркера в _dayPlanSupps) и меняется клиентом. ДОЗ ЗДЕСЬ НЕТ и не будет: доза —
   решение врача или специалиста, приложение ведёт только время и сроки.

   ⚠️ Текст напоминания виден на заблокированном экране — никаких названий, только время. */
(function () {
  var CFG = function () { return window.IK_CFG || { prefix: 'vialp' }; };
  var KEY = function () { return CFG().prefix + '_intake'; };
  var PROF = function () { return CFG().prefix + '_profile'; };

  // Время по умолчанию и короткая подсказка — по правилам приёма (KB_SUPPLEMENTS / _dayPlanSupps).
  var RULES = {
    iron: { t: '07:00', tip: 'fast_iron' },
    energy_factor: { t: '06:30', tip: 'fast_thyroid' },
    vitd: { t: '13:00', tip: 'fat_meal' },
    omega3: { t: '13:00', tip: 'fat_meal' },
    magnesium: { t: '21:30', tip: 'evening' },
    zinc: { t: '11:00', tip: 'between' },
    b_complex: { t: '08:00', tip: 'breakfast' },
    collagen: { t: '08:00', tip: 'breakfast' },
    probiotics: { t: '08:00', tip: 'breakfast' },
    adaptogens: { t: '08:00', tip: 'breakfast' },
    hrt: { t: '08:00', tip: 'prescribed' },
    emotion_factor: { t: '08:00', tip: 'prescribed' },
    cycle_factor: { t: '08:00', tip: 'prescribed' },
  };
  var SUP_IDS = ['sup1', 'sup2', 'sup3', 'sup4', 'sup5', 'sup6', 'sup7', 'sup8', 'sup9', 'sup10'];
  var MED_IDS = ['med2', 'med3', 'med4'];

  var TX = {
    title: { ru: 'Мои приёмы', uk: 'Мої прийоми', en: 'My intake schedule', es: 'Mis tomas', de: 'Meine Einnahmen', pt: 'Minhas tomas', fr: 'Mes prises', pl: 'Moje przyjmowanie', it: 'Le mie assunzioni', he: 'לוח הנטילה שלי', ja: '服用スケジュール', ko: '내 복용 일정' },
    intro: { ru: 'Добавки и препараты, которые вы отметили или вписали. Время подобрано по правилам приёма — поменяйте, если врач или специалист назначил иначе. Даты нужны, если это курс или назначение.', uk: 'Добавки й препарати, які ви позначили або вписали. Час підібрано за правилами прийому — змініть, якщо лікар чи фахівець призначив інакше. Дати потрібні, якщо це курс або призначення.', en: 'Supplements and medications you ticked or added. Times follow common intake rules — change them if your doctor or specialist said otherwise. Add dates if it is a course or a prescription.', es: 'Suplementos y medicamentos que marcaste o añadiste. La hora sigue las reglas habituales de toma — cámbiala si tu médico o especialista indicó otra. Añade fechas si es un tratamiento o una pauta.', de: 'Präparate, die du angekreuzt oder eingetragen hast. Die Uhrzeit folgt üblichen Einnahmeregeln — ändere sie, wenn Ärztin, Arzt oder Fachperson es anders verordnet haben. Daten eintragen, wenn es eine Kur oder Verordnung ist.', pt: 'Suplementos e medicamentos que marcou ou adicionou. O horário segue as regras habituais de toma — altere se o médico ou especialista indicou outro. Datas, se for um tratamento ou prescrição.', fr: 'Compléments et médicaments cochés ou ajoutés. L’heure suit les règles de prise habituelles — modifiez-la si votre médecin ou spécialiste a prescrit autrement. Ajoutez des dates s’il s’agit d’une cure ou d’une prescription.', pl: 'Suplementy i leki, które zaznaczono lub wpisano. Godzina według typowych zasad przyjmowania — zmień, jeśli lekarz lub specjalista zalecił inaczej. Daty, jeśli to kuracja lub zalecenie.', it: 'Integratori e farmaci che hai selezionato o aggiunto. L’orario segue le regole di assunzione abituali — cambialo se medico o specialista hanno indicato altro. Aggiungi le date se è un ciclo o una prescrizione.', he: 'תוספים ותרופות שסימנתם או הוספתם. השעה נקבעה לפי כללי נטילה מקובלים — שנו אותה אם הרופא או המומחה הורו אחרת. הוסיפו תאריכים אם מדובר בקורס או במרשם.', ja: 'チェックまたは入力したサプリと薬です。時刻は一般的な服用ルールに沿っています。医師や専門家の指示が違う場合は変更してください。期間のある服用や処方なら日付を入れてください。', ko: '선택하거나 입력한 보충제와 약입니다. 시간은 일반적인 복용 원칙에 따라 정했습니다. 의사나 전문가의 지시가 다르면 바꿔 주세요. 기간이 있는 복용이나 처방이라면 날짜를 넣어 주세요.' },
    empty: { ru: 'Пока пусто. Отметьте добавки или препараты в разделе «Добавки и препараты» — или добавьте своё ниже.', uk: 'Поки порожньо. Позначте добавки чи препарати в розділі «Добавки й препарати» — або додайте своє нижче.', en: 'Nothing here yet. Tick supplements or medications in “Supplements and medications” — or add your own below.', es: 'Aún está vacío. Marca suplementos o medicamentos en «Suplementos y medicamentos» o añade los tuyos abajo.', de: 'Noch leer. Kreuze Präparate unter „Nahrungsergänzung und Präparate“ an — oder trage unten eigene ein.', pt: 'Ainda vazio. Marque suplementos ou medicamentos em «Suplementos e medicamentos» — ou adicione abaixo.', fr: 'Rien pour l’instant. Cochez des compléments ou médicaments dans « Compléments et médicaments » — ou ajoutez les vôtres ci-dessous.', pl: 'Na razie pusto. Zaznacz suplementy lub leki w sekcji „Suplementy i leki” — albo dodaj własne poniżej.', it: 'Ancora vuoto. Seleziona integratori o farmaci in «Integratori e farmaci» — oppure aggiungi i tuoi qui sotto.', he: 'עדיין ריק. סמנו תוספים או תרופות בחלק «תוספים ותרופות» — או הוסיפו משלכם למטה.', ja: 'まだ何もありません。「サプリと薬」でチェックするか、下から追加してください。', ko: '아직 비어 있습니다. «보충제와 약»에서 선택하거나 아래에서 직접 추가하세요.' },
    time: { ru: 'Время', uk: 'Час', en: 'Time', es: 'Hora', de: 'Uhrzeit', pt: 'Hora', fr: 'Heure', pl: 'Godzina', it: 'Ora', he: 'שעה', ja: '時刻', ko: '시간' },
    from: { ru: 'С', uk: 'З', en: 'From', es: 'Desde', de: 'Ab', pt: 'De', fr: 'Du', pl: 'Od', it: 'Dal', he: 'מ־', ja: '開始', ko: '시작' },
    to: { ru: 'По', uk: 'По', en: 'Until', es: 'Hasta', de: 'Bis', pt: 'Até', fr: 'Au', pl: 'Do', it: 'Al', he: 'עד', ja: '終了', ko: '종료' },
    open_end: { ru: 'пусто — бессрочно', uk: 'порожньо — безстроково', en: 'empty — no end date', es: 'vacío — sin fecha de fin', de: 'leer — unbefristet', pt: 'vazio — sem data de fim', fr: 'vide — sans date de fin', pl: 'puste — bez końca', it: 'vuoto — senza fine', he: 'ריק — ללא תאריך סיום', ja: '空欄＝終了日なし', ko: '비우면 종료일 없음' },
    remind: { ru: 'Напоминать', uk: 'Нагадувати', en: 'Remind me', es: 'Recordar', de: 'Erinnern', pt: 'Lembrar', fr: 'Me rappeler', pl: 'Przypominaj', it: 'Ricordamelo', he: 'להזכיר', ja: '通知する', ko: '알림' },
    del: { ru: 'Убрать', uk: 'Прибрати', en: 'Remove', es: 'Quitar', de: 'Entfernen', pt: 'Remover', fr: 'Retirer', pl: 'Usuń', it: 'Rimuovi', he: 'להסיר', ja: '削除', ko: '삭제' },
    add_ph: { ru: 'Название добавки или препарата', uk: 'Назва добавки чи препарату', en: 'Supplement or medication name', es: 'Nombre del suplemento o medicamento', de: 'Name des Präparats', pt: 'Nome do suplemento ou medicamento', fr: 'Nom du complément ou médicament', pl: 'Nazwa suplementu lub leku', it: 'Nome dell’integratore o farmaco', he: 'שם התוסף או התרופה', ja: 'サプリ・薬の名前', ko: '보충제 또는 약 이름' },
    add: { ru: '+ Добавить', uk: '+ Додати', en: '+ Add', es: '+ Añadir', de: '+ Hinzufügen', pt: '+ Adicionar', fr: '+ Ajouter', pl: '+ Dodaj', it: '+ Aggiungi', he: '+ הוספה', ja: '+ 追加', ko: '+ 추가' },
    master: { ru: 'Напоминания о приёме', uk: 'Нагадування про прийом', en: 'Intake reminders', es: 'Recordatorios de toma', de: 'Einnahme-Erinnerungen', pt: 'Lembretes de toma', fr: 'Rappels de prise', pl: 'Przypomnienia o przyjmowaniu', it: 'Promemoria di assunzione', he: 'תזכורות נטילה', ja: '服用の通知', ko: '복용 알림' },
    lock: { ru: 'На заблокированном экране — только время, без названий.', uk: 'На заблокованому екрані — лише час, без назв.', en: 'The lock screen shows only the time, never the names.', es: 'En la pantalla bloqueada solo se ve la hora, sin nombres.', de: 'Auf dem Sperrbildschirm steht nur die Uhrzeit, keine Namen.', pt: 'No ecrã bloqueado aparece só a hora, sem nomes.', fr: 'L’écran verrouillé n’affiche que l’heure, jamais les noms.', pl: 'Na ekranie blokady tylko godzina, bez nazw.', it: 'Sulla schermata di blocco solo l’ora, senza nomi.', he: 'במסך הנעול מוצגת רק השעה, בלי שמות.', ja: 'ロック画面には時刻だけを表示し、名前は出しません。', ko: '잠금 화면에는 이름 없이 시간만 표시됩니다.' },
    at_title: { ru: 'Приём в {t}', uk: 'Прийом о {t}', en: 'Your {t} intake', es: 'Tu toma de las {t}', de: 'Einnahme um {t}', pt: 'A sua toma das {t}', fr: 'Votre prise de {t}', pl: 'Przyjęcie o {t}', it: 'Assunzione delle {t}', he: 'הנטילה ב־{t}', ja: '{t} の服用', ko: '{t} 복용' },
    all_list: { ru: 'Весь список приёмов', uk: 'Весь список прийомів', en: 'See the whole schedule', es: 'Ver todas las tomas', de: 'Ganzen Plan ansehen', pt: 'Ver todas as tomas', fr: 'Voir toutes les prises', pl: 'Cała lista przyjmowania', it: 'Vedi tutte le assunzioni', he: 'כל לוח הנטילה', ja: '服用スケジュール全体', ko: '전체 복용 일정' },
    chapter: { ru: 'Приём сегодня', uk: 'Прийом сьогодні', en: 'Today’s intake', es: 'Tomas de hoy', de: 'Heutige Einnahme', pt: 'Tomas de hoje', fr: 'Prises du jour', pl: 'Dzisiejsze przyjmowanie', it: 'Assunzioni di oggi', he: 'נטילה היום', ja: '今日の服用', ko: '오늘의 복용' },
    teaser: { ru: 'Что и когда принять', uk: 'Що і коли прийняти', en: 'What to take and when', es: 'Qué tomar y cuándo', de: 'Was wann einnehmen', pt: 'O que tomar e quando', fr: 'Quoi prendre et quand', pl: 'Co i kiedy przyjąć', it: 'Cosa prendere e quando', he: 'מה ליטול ומתי', ja: '何をいつ飲むか', ko: '무엇을 언제 복용할지' },
    edit: { ru: 'Изменить время и сроки — «Мой профиль» → «Мои приёмы».', uk: 'Змінити час і терміни — «Мій профіль» → «Мої прийоми».', en: 'Change times and dates in My profile → My intake schedule.', es: 'Cambia horas y fechas en Mi perfil → Mis tomas.', de: 'Uhrzeiten und Daten änderst du unter Mein Profil → Meine Einnahmen.', pt: 'Altere horários e datas em Meu perfil → Minhas tomas.', fr: 'Modifiez heures et dates dans Mon profil → Mes prises.', pl: 'Godziny i daty zmienisz w Mój profil → Moje przyjmowanie.', it: 'Cambia orari e date in Il mio profilo → Le mie assunzioni.', he: 'שינוי שעות ותאריכים — «הפרופיל שלי» ← «לוח הנטילה שלי».', ja: '時刻や期間は「マイプロフィール」→「服用スケジュール」で変更できます。', ko: '시간과 기간은 «내 프로필» → «내 복용 일정»에서 바꿀 수 있습니다.' },
    offer_t: { ru: 'Напоминать о приёме?', uk: 'Нагадувати про прийом?', en: 'Remind you to take them?', es: '¿Te recordamos las tomas?', de: 'An die Einnahme erinnern?', pt: 'Lembrar das tomas?', fr: 'Vous rappeler les prises ?', pl: 'Przypominać o przyjmowaniu?', it: 'Ricordarti le assunzioni?', he: 'להזכיר לכם על הנטילה?', ja: '服用時刻に通知しますか？', ko: '복용 시간을 알려 드릴까요?' },
    offer_b: { ru: 'Пришлём короткое напоминание в указанное время. На заблокированном экране названий не будет — только время. Время и сроки можно поменять в профиле.', uk: 'Надішлемо коротке нагадування у вказаний час. На заблокованому екрані назв не буде — лише час. Час і терміни можна змінити в профілі.', en: 'We’ll send a short reminder at each time. The lock screen shows only the time, never the names. You can change times and dates in your profile.', es: 'Te enviaremos un recordatorio corto a cada hora. En la pantalla bloqueada solo se verá la hora, sin nombres. Puedes cambiar horas y fechas en tu perfil.', de: 'Wir senden zu jeder Uhrzeit eine kurze Erinnerung. Auf dem Sperrbildschirm steht nur die Uhrzeit, keine Namen. Uhrzeiten und Daten änderst du im Profil.', pt: 'Enviaremos um lembrete curto a cada hora. No ecrã bloqueado aparece só a hora, sem nomes. Pode alterar horários e datas no perfil.', fr: 'Nous enverrons un court rappel à chaque heure. L’écran verrouillé n’affiche que l’heure, jamais les noms. Heures et dates se modifient dans le profil.', pl: 'Wyślemy krótkie przypomnienie o każdej godzinie. Na ekranie blokady tylko godzina, bez nazw. Godziny i daty zmienisz w profilu.', it: 'Invieremo un breve promemoria a ogni orario. Sulla schermata di blocco solo l’ora, senza nomi. Orari e date si cambiano nel profilo.', he: 'נשלח תזכורת קצרה בכל שעה שנקבעה. במסך הנעול תופיע רק השעה, בלי שמות. אפשר לשנות שעות ותאריכים בפרופיל.', ja: '指定の時刻に短い通知を送ります。ロック画面には時刻だけで名前は出ません。時刻と期間はプロフィールで変更できます。', ko: '정해진 시간에 짧은 알림을 보냅니다. 잠금 화면에는 이름 없이 시간만 표시됩니다. 시간과 기간은 프로필에서 바꿀 수 있습니다.' },
    yes: { ru: 'Да, напоминать', uk: 'Так, нагадувати', en: 'Yes, remind me', es: 'Sí, recuérdame', de: 'Ja, erinnern', pt: 'Sim, lembrar', fr: 'Oui, me rappeler', pl: 'Tak, przypominaj', it: 'Sì, ricordamelo', he: 'כן, להזכיר', ja: 'はい、通知する', ko: '네, 알려 주세요' },
    no: { ru: 'Не нужно', uk: 'Не потрібно', en: 'No, thanks', es: 'No, gracias', de: 'Nein, danke', pt: 'Não, obrigado', fr: 'Non merci', pl: 'Nie, dziękuję', it: 'No, grazie', he: 'לא, תודה', ja: '不要', ko: '괜찮아요' },
    push: { ru: 'Ваш приём в {t} — откройте VIA·L', uk: 'Ваш прийом о {t} — відкрийте VIA·L', en: 'Your {t} intake — open VIA·L', es: 'Tu toma de las {t} — abre VIA·L', de: 'Deine Einnahme um {t} — öffne VIA·L', pt: 'A sua toma das {t} — abra a VIA·L', fr: 'Votre prise de {t} — ouvrez VIA·L', pl: 'Twoje przyjęcie o {t} — otwórz VIA·L', it: 'La tua assunzione delle {t} — apri VIA·L', he: 'הנטילה שלכם ב־{t} — פתחו את VIA·L', ja: '{t} の服用 — VIA·L を開く', ko: '{t} 복용 — VIA·L 열기' },
    step_l: { ru: 'Когда вы их принимаете', uk: 'Коли ви їх приймаєте', en: 'When you take them', es: 'Cuándo los tomas', de: 'Wann du sie einnimmst', pt: 'Quando os toma', fr: 'Quand vous les prenez', pl: 'Kiedy je przyjmujesz', it: 'Quando li prendi', he: 'מתי אתם נוטלים אותם', ja: '服用のタイミング', ko: '언제 복용하나요' },
    step_q: { ru: 'Время подставлено по правилам приёма — поменяйте под себя. Напоминания, сроки курса и отключение — в «Мой профиль» → «Мои приёмы».', uk: 'Час підставлено за правилами прийому — змініть під себе. Нагадування, терміни курсу й вимкнення — у «Мій профіль» → «Мої прийоми».', en: 'Times follow common intake rules — adjust them to your routine. Reminders, course dates and switching off are in My profile → My intake schedule.', es: 'La hora sigue las reglas habituales — ajústala a tu rutina. Recordatorios, fechas y desactivar: Mi perfil → Mis tomas.', de: 'Die Uhrzeit folgt üblichen Regeln — pass sie an deinen Alltag an. Erinnerungen, Kurdauer und Abschalten: Mein Profil → Meine Einnahmen.', pt: 'O horário segue as regras habituais — ajuste à sua rotina. Lembretes, datas e desligar: Meu perfil → Minhas tomas.', fr: 'L’heure suit les règles habituelles — adaptez-la à votre rythme. Rappels, dates de cure et désactivation : Mon profil → Mes prises.', pl: 'Godzina według typowych zasad — dopasuj do swojego dnia. Przypomnienia, daty i wyłączanie: Mój profil → Moje przyjmowanie.', it: 'L’orario segue le regole abituali — adattalo alla tua giornata. Promemoria, date e disattivazione: Il mio profilo → Le mie assunzioni.', he: 'השעה נקבעה לפי כללי נטילה מקובלים — התאימו אותה לשגרה שלכם. תזכורות, תאריכי קורס וכיבוי — ב«הפרופיל שלי» ← «לוח הנטילה שלי».', ja: '時刻は一般的な服用ルールに沿っています。生活に合わせて変更してください。通知・期間・オフは「マイプロフィール」→「服用スケジュール」で。', ko: '시간은 일반적인 복용 원칙에 따랐습니다. 생활에 맞게 바꿔 주세요. 알림·기간·끄기는 «내 프로필» → «내 복용 일정»에서.' },
    spec: { ru: 'от специалиста', uk: 'від фахівця', en: 'from your specialist', es: 'de tu especialista', de: 'von deiner Fachperson', pt: 'do seu especialista', fr: 'de votre spécialiste', pl: 'od specjalisty', it: 'dal tuo specialista', he: 'מהמומחה', ja: '専門家より', ko: '전문가 지정' },
  };
  var TIPS = {
    fast_iron: { ru: 'натощак, запить водой; врозь с кофе, чаем и кальцием', uk: 'натще, запити водою; окремо від кави, чаю та кальцію', en: 'on an empty stomach with water; apart from coffee, tea and calcium', es: 'en ayunas con agua; lejos del café, el té y el calcio', de: 'nüchtern mit Wasser; getrennt von Kaffee, Tee und Kalzium', pt: 'em jejum com água; longe de café, chá e cálcio', fr: 'à jeun avec de l’eau ; à distance du café, du thé et du calcium', pl: 'na czczo, popić wodą; osobno od kawy, herbaty i wapnia', it: 'a digiuno con acqua; lontano da caffè, tè e calcio', he: 'על קיבה ריקה עם מים; בנפרד מקפה, תה וסידן', ja: '空腹時に水で。コーヒー・お茶・カルシウムとは時間をずらす', ko: '공복에 물과 함께, 커피·차·칼슘과는 시간을 두고' },
    fast_thyroid: { ru: 'натощак, за 30–60 минут до завтрака, только вода; кофе — позже', uk: 'натще, за 30–60 хвилин до сніданку, лише вода; кава — пізніше', en: 'on an empty stomach, 30–60 min before breakfast, water only; coffee later', es: 'en ayunas, 30–60 min antes del desayuno, solo agua; el café, después', de: 'nüchtern, 30–60 Min. vor dem Frühstück, nur Wasser; Kaffee später', pt: 'em jejum, 30–60 min antes do pequeno-almoço, só água; café depois', fr: 'à jeun, 30–60 min avant le petit-déjeuner, eau seulement ; café plus tard', pl: 'na czczo, 30–60 min przed śniadaniem, tylko woda; kawa później', it: 'a digiuno, 30–60 min prima della colazione, solo acqua; caffè dopo', he: 'על קיבה ריקה, 30–60 דקות לפני ארוחת הבוקר, רק מים; קפה אחר כך', ja: '空腹時、朝食の30〜60分前に水だけで。コーヒーはあとで', ko: '공복에 아침 식사 30~60분 전, 물로만. 커피는 나중에' },
    fat_meal: { ru: 'с едой, где есть жир — обычно самый плотный приём пищи', uk: 'з їжею, де є жир — зазвичай найситніший прийом їжі', en: 'with a meal that contains fat — usually your main meal', es: 'con una comida que tenga grasa — normalmente la principal', de: 'zu einer fetthaltigen Mahlzeit — meist der Hauptmahlzeit', pt: 'com uma refeição com gordura — normalmente a principal', fr: 'avec un repas contenant des graisses — souvent le repas principal', pl: 'z posiłkiem zawierającym tłuszcz — zwykle głównym', it: 'con un pasto che contiene grassi — di solito il principale', he: 'עם ארוחה שיש בה שומן — בדרך כלל הארוחה העיקרית', ja: '脂質を含む食事と一緒に（多くは一日で一番しっかりした食事）', ko: '지방이 있는 식사와 함께(보통 가장 든든한 끼니)' },
    evening: { ru: 'вечером, за час-два до сна', uk: 'увечері, за годину-дві до сну', en: 'in the evening, 1–2 hours before bed', es: 'por la noche, 1–2 horas antes de dormir', de: 'abends, 1–2 Stunden vor dem Schlafen', pt: 'à noite, 1–2 horas antes de dormir', fr: 'le soir, 1 à 2 heures avant le coucher', pl: 'wieczorem, 1–2 godziny przed snem', it: 'la sera, 1–2 ore prima di dormire', he: 'בערב, שעה–שעתיים לפני השינה', ja: '夜、就寝の1〜2時間前', ko: '저녁, 잠들기 1~2시간 전' },
    between: { ru: 'между едой, если переносится; врозь с железом', uk: 'між їжею, якщо переноситься; окремо від заліза', en: 'between meals if tolerated; apart from iron', es: 'entre comidas si se tolera; lejos del hierro', de: 'zwischen den Mahlzeiten, wenn verträglich; getrennt von Eisen', pt: 'entre refeições, se tolerar; longe do ferro', fr: 'entre les repas si bien toléré ; à distance du fer', pl: 'między posiłkami, jeśli dobrze tolerowany; osobno od żelaza', it: 'lontano dai pasti se tollerato; separato dal ferro', he: 'בין הארוחות אם זה נסבל; בנפרד מברזל', ja: '胃に合えば食間に。鉄とは時間をずらす', ko: '속이 괜찮다면 식간에, 철분과는 시간을 두고' },
    breakfast: { ru: 'утром, с завтраком', uk: 'зранку, зі сніданком', en: 'in the morning, with breakfast', es: 'por la mañana, con el desayuno', de: 'morgens, zum Frühstück', pt: 'de manhã, com o pequeno-almoço', fr: 'le matin, avec le petit-déjeuner', pl: 'rano, ze śniadaniem', it: 'al mattino, con la colazione', he: 'בבוקר, עם ארוחת הבוקר', ja: '朝、朝食と一緒に', ko: '아침, 아침 식사와 함께' },
    prescribed: { ru: 'как назначил врач', uk: 'як призначив лікар', en: 'as your doctor prescribed', es: 'según indicó tu médico', de: 'wie ärztlich verordnet', pt: 'conforme o médico indicou', fr: 'selon la prescription du médecin', pl: 'zgodnie z zaleceniem lekarza', it: 'come prescritto dal medico', he: 'לפי הוראות הרופא', ja: '医師の指示どおりに', ko: '의사 처방대로' },
  };
  function T(k) { return L(TX[k]); }

  // ── хранилище ──
  window._ikGet = function () {
    try { var o = JSON.parse(localStorage.getItem(KEY()) || 'null'); if (o && Array.isArray(o.items)) return o; } catch (e) {}
    return { items: [], on: false, asked: false };
  };
  window._ikSave = function (o) { try { localStorage.setItem(KEY(), JSON.stringify(o)); } catch (e) {} };

  // Календарная дата (без сдвига «дня VIA·L» на 4:00 — курс кончается по календарю).
  function ymd(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function activeOn(it, day) { return (!it.start || it.start <= day) && (!it.end || it.end >= day); }
  window._ikActiveOn = function (day) {
    var d = day || ymd();
    return _ikGet().items.filter(function (it) { return activeOn(it, d); })
      .sort(function (a, b) { return String(a.time).localeCompare(String(b.time)); });
  };

  function chipName(id) {
    try {
      var lb = document.querySelector('label[for="' + id + '"]');
      // эмодзи в начале подписи («💊 Магний») в список не тащим
      return lb ? lb.textContent.replace(/^[^\p{L}\p{N}]+/u, '').trim() : '';
    } catch (e) { return ''; }
  }
  function splitNames(s) {
    return String(s || '').split(/[,;\n]+/).map(function (x) { return x.trim().slice(0, 60); }).filter(Boolean).slice(0, 15);
  }

  // Список из профиля. Строки, заведённые по галочке (src 'auto'), исчезают вместе с галочкой;
  // вписанное руками (src 'self') и назначенное специалистом (src 'spec') синхронизация не трогает.
  // Время, сроки и «напоминать» у уже существующей строки сохраняются — пересборка их не сбрасывает.
  function wantFrom(sup, meds, suppOther, medsOther) {
    var want = [];   // {key, name, rx}
    SUP_IDS.forEach(function (id) {
      var el = document.getElementById(id), v = el ? el.value : '';
      if (v && sup.indexOf(v) >= 0) want.push({ key: v, name: chipName(id) || v });
    });
    MED_IDS.forEach(function (id) {
      var el = document.getElementById(id), v = el ? el.value : '';
      if (v && meds.indexOf(v) >= 0) want.push({ key: v, name: chipName(id) || v, rx: 1 });
    });
    splitNames(suppOther).forEach(function (n) { want.push({ key: 'txt:' + n.toLowerCase(), name: n }); });
    splitNames(medsOther).forEach(function (n) { want.push({ key: 'txt:' + n.toLowerCase(), name: n, rx: 1 }); });
    return want;
  }
  function newItem(w, time) {
    var r = RULES[w.key] || { t: '08:00', tip: w.rx ? 'prescribed' : 'breakfast' };
    return { id: 'ik' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), key: w.key, name: w.name,
      time: time || r.t, tip: r.tip, start: ymd(), end: '', remind: true, src: 'auto' };
  }
  window._ikSync = function (P) {
    try {
      if (!P) { try { P = JSON.parse(localStorage.getItem(PROF()) || '{}') || {}; } catch (e) { P = {}; } }
      var want = wantFrom(Array.isArray(P.supplements) ? P.supplements : [], Array.isArray(P.meds) ? P.meds : [],
        P.supp_other, P.meds_other);

      var o = _ikGet(), keep = [], seen = {};
      o.items.forEach(function (it) {
        if (it.src !== 'auto') { keep.push(it); return; }
        var w = want.filter(function (x) { return x.key === it.key; })[0];
        if (w) { it.name = w.name; keep.push(it); seen[it.key] = 1; }   // имя обновляем: язык интерфейса мог смениться
      });
      want.forEach(function (w) {
        if (seen[w.key]) return;
        if (keep.some(function (it) { return it.key === w.key; })) return;
        keep.push(newItem(w)); seen[w.key] = 1;
      });
      o.items = keep; _ikSave(o);
    } catch (e) {}
  };

  // ── опросник: «Когда вы их принимаете» — время каждого прямо на шаге добавок ──
  // Строки строятся по ЖИВЫМ галочкам и полям шага, до сохранения профиля. Выбранное время сразу
  // пишется в «Мои приёмы» (строка заводится, если её ещё нет), и сохранение профиля его не сбросит.
  function liveChecked(ids) {
    return ids.map(function (id) { var el = document.getElementById(id); return (el && el.checked) ? el.value : ''; }).filter(Boolean);
  }
  function liveVal(id) { var el = document.getElementById(id); return el ? el.value : ''; }
  window._ikStepRender = function () {
    try {
      var box = document.getElementById('ik-step'); if (!box) return;
      var want = wantFrom(liveChecked(SUP_IDS), liveChecked(MED_IDS), liveVal('supp_other'),
        (document.getElementById('med5') && document.getElementById('med5').checked) ? liveVal('meds_other') : '');
      if (!want.length) { box.innerHTML = ''; box.style.display = 'none'; return; }
      var items = _ikGet().items, rows = '';
      want.forEach(function (w) {
        var it = items.filter(function (x) { return x.key === w.key; })[0];
        var tm = (it && it.time) || (RULES[w.key] ? RULES[w.key].t : '08:00');
        var ek = _esc(w.key).replace(/'/g, '');
        rows += '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--b1);">'
          + '<span style="font-size:var(--fs-body);color:var(--t1);flex:1 1 auto;min-width:0;overflow-wrap:anywhere;">' + _esc(w.name) + '</span>'
          + '<input type="time" class="manual-input" value="' + _esc(tm) + '" onchange="_ikSetTime(\'' + ek + '\',this.value)" style="width:118px;flex:0 0 auto;">'
          + '</div>';
      });
      box.style.display = 'block';
      box.innerHTML = '<div class="divider"></div><div class="input-group"><label>' + _esc(T('step_l')) + '</label>'
        + '<div class="q-prompt">' + _esc(T('step_q')) + '</div>' + rows + '</div>';
    } catch (e) {}
  };
  window._ikSetTime = function (key, v) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v || '')) return;
    var o = _ikGet(), it = o.items.filter(function (x) { return x.key === key; })[0];
    if (!it) {
      var w = wantFrom(liveChecked(SUP_IDS), liveChecked(MED_IDS), liveVal('supp_other'), liveVal('meds_other'))
        .filter(function (x) { return x.key === key; })[0];
      if (!w) return;
      it = newItem(w, v); o.items.push(it);
    }
    it.time = v; _ikSave(o); _ikArm();
  };

  // Протокол специалиста (только EXPERT, /expert/intake). Строки специалиста заменяются целиком
  // при каждой загрузке: специалист правит протокол в кабинете, клиент видит свежий. Клиент может
  // только выключить напоминание — этот выбор переживает обновление (сверка по названию).
  // Время: точное из кабинета, иначе по словам «утро/обед/вечер/перед сном» на любом из языков.
  function timeFromWords(s) {
    s = String(s || '').toLowerCase();
    if (/\b\d{1,2}:\d{2}\b/.test(s)) { var m = s.match(/\b(\d{1,2}):(\d{2})\b/); return String(m[1]).padStart(2, '0') + ':' + m[2]; }
    if (/сон|сну|sleep|bed|noche|schlaf|coucher|sen|dormir|notte/.test(s)) return '21:30';
    if (/веч|вечер|evening|tarde|abend|soir|wiecz|sera|noite/.test(s)) return '19:00';
    if (/обед|обід|день|lunch|midday|almuerzo|mittag|déjeuner|obiad|pranzo|almoço/.test(s)) return '13:00';
    return '08:00';
  }
  window._ikMergeSpec = function (rows) {
    try {
      var o = _ikGet(), muted = {};
      o.items.forEach(function (it) { if (it.src === 'spec' && it.remind === false) muted[String(it.name).toLowerCase()] = 1; });
      var keep = o.items.filter(function (it) { return it.src !== 'spec'; });
      (Array.isArray(rows) ? rows : []).slice(0, 30).forEach(function (r, i) {
        var n = String(r.name || '').trim().slice(0, 80); if (!n) return;
        keep.push({ id: 'sp' + i + '_' + n.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '').slice(0, 20), key: 'spec:' + n.toLowerCase(), name: n,
          dose: String(r.dose || '').slice(0, 60), note: String(r.note || '').slice(0, 200),
          time: /^([01]\d|2[0-3]):[0-5]\d$/.test(r.time || '') ? r.time : timeFromWords(r.timing),
          start: r.start || '', end: r.end || '', remind: r.remind !== false && !muted[n.toLowerCase()], src: 'spec' });
      });
      o.items = keep; _ikSave(o);
    } catch (e) {}
  };

  // Для ИИ-памятки: что и во сколько человек принимает сегодня — модель вплетает это в главы
  // утро/обед/вечер его же временем, а не придумывает своё. Только имя и время (без доз, без заметок).
  window._ikForAI = function () {
    try { return _ikActiveOn().slice(0, 15).map(function (it) { return { name: String(it.name).slice(0, 60), time: it.time }; }); }
    catch (e) { return []; }
  };

  // ── профиль: раздел «Мои приёмы» ──
  // Поля — общим классом приложения .manual-input (как дата цикла и анализов), не своим стилем.
  // _ikInner — только содержимое раздела: EXPERT вкладывает его внутрь «Добавок и препаратов» (одна вкладка).
  window._ikInner = function () {
    var o = _ikGet(), rows = '';
    o.items.forEach(function (it) {
      var id = _esc(it.id), fixed = it.src === 'spec';
      rows += '<div style="padding:12px 0;border-bottom:1px solid var(--b1);">'
        + '<div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline;">'
        + '<div style="font-size:var(--fs-body);color:var(--t1);font-weight:600;">' + _esc(it.name) + (fixed ? ' <span style="font-size:var(--fs-cap);color:var(--gold-lt);font-weight:400;">· ' + _esc(T('spec')) + '</span>' : '') + '</div>'
        + (fixed ? '' : '<button type="button" onclick="_ikDel(\'' + id + '\')" style="background:none;border:none;color:var(--t3);font-size:var(--fs-cap);text-decoration:underline;cursor:pointer;">' + _esc(T('del')) + '</button>')
        + '</div>'
        + (it.tip && TIPS[it.tip] ? '<div style="font-size:var(--fs-cap);color:var(--t3);margin-top:3px;">' + _esc(L(TIPS[it.tip])) + '</div>' : '')
        + (it.note ? '<div style="font-size:var(--fs-cap);color:var(--t2);margin-top:3px;">' + _esc(it.note) + '</div>' : '')
        // Сетка 2×2: время | напоминать, с | по. Узкий экран не вылезает за карточку (min-width:0).
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;margin-top:10px;align-items:end;">'
        + '<div style="min-width:0;"><div style="font-size:var(--fs-cap);color:var(--t3);margin-bottom:4px;">' + _esc(T('time')) + '</div>'
        + '<input type="time" class="manual-input" value="' + _esc(it.time || '08:00') + '" onchange="_ikUpd(\'' + id + '\',\'time\',this.value)"></div>'
        + '<label style="display:flex;align-items:center;gap:8px;min-height:44px;font-size:var(--fs-body);color:var(--t1);cursor:pointer;"><input type="checkbox" ' + (it.remind ? 'checked' : '') + ' onchange="_ikUpd(\'' + id + '\',\'remind\',this.checked)"> ' + _esc(T('remind')) + '</label>'
        + '<div style="min-width:0;"><div style="font-size:var(--fs-cap);color:var(--t3);margin-bottom:4px;">' + _esc(T('from')) + '</div>'
        + '<input type="date" class="manual-input" value="' + _esc(it.start || '') + '" onchange="_ikUpd(\'' + id + '\',\'start\',this.value)"></div>'
        + '<div style="min-width:0;"><div style="font-size:var(--fs-cap);color:var(--t3);margin-bottom:4px;">' + _esc(T('to')) + '</div>'
        + '<input type="date" class="manual-input" value="' + _esc(it.end || '') + '" onchange="_ikUpd(\'' + id + '\',\'end\',this.value)" title="' + _esc(T('open_end')) + '"></div>'
        + '</div></div>';
    });
    var inner = '<div style="font-size:var(--fs-cap);color:var(--t2);line-height:1.6;">' + _esc(T('intro')) + '</div>'
      + (rows || '<div style="font-size:var(--fs-cap);color:var(--t3);margin-top:10px;">' + _esc(T('empty')) + '</div>')
      + '<div style="display:flex;gap:8px;margin-top:12px;"><input type="text" id="ik-new" class="manual-input" maxlength="60" placeholder="' + _esc(T('add_ph')) + '" style="flex:1 1 auto;text-align:left;font-family:inherit;">'
      + '<button type="button" onclick="_ikAdd()" style="flex:0 0 auto;padding:10px 14px;border-radius:10px;border:1px solid rgba(226,185,90,.45);background:rgba(226,185,90,.10);color:var(--gold-lt);font-family:inherit;font-size:var(--fs-body);cursor:pointer;">' + _esc(T('add')) + '</button></div>'
      + (window.IK_CFG && window.IK_CFG.canRemind && window.IK_CFG.canRemind()
        ? '<label style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;font-size:var(--fs-body);color:var(--t1);cursor:pointer;">'
          + '<span>' + _esc(T('master')) + '</span><input type="checkbox" ' + (o.on ? 'checked' : '') + ' onchange="_ikToggle(this.checked)"></label>'
          + '<div style="font-size:var(--fs-cap);color:var(--t3);margin-top:4px;">' + _esc(T('lock')) + '</div>'
        : '');
    return inner;
  };
  window._ikSection = function () {
    return (typeof _vcSec === 'function') ? _vcSec('<i class="ph ph-pill"></i>', _esc(T('title')), _ikInner(), false) : '';
  };
  window._ikTitle = function () { return T('title'); };

  window._ikUpd = function (id, f, v) {
    var o = _ikGet(), it = o.items.filter(function (x) { return x.id === id; })[0]; if (!it) return;
    if (f === 'time') it.time = /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : it.time;
    else if (f === 'start' || f === 'end') it[f] = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
    else if (f === 'remind') it.remind = !!v;
    _ikSave(o); _ikArm();
  };
  window._ikDel = function (id) {
    var o = _ikGet(), it = o.items.filter(function (x) { return x.id === id; })[0];
    if (!it || it.src === 'spec') return;   // назначенное специалистом клиент не удаляет — только выключает напоминание
    // Строку «по галочке» удаляем вместе с галочкой в профиле, иначе синхронизация вернула бы её.
    if (it.src === 'auto' && it.key && it.key.indexOf('txt:') !== 0) {
      try {
        var P = JSON.parse(localStorage.getItem(PROF()) || '{}') || {};
        ['supplements', 'meds'].forEach(function (f) { if (Array.isArray(P[f])) P[f] = P[f].filter(function (v) { return v !== it.key; }); });
        localStorage.setItem(PROF(), JSON.stringify(P));
        var el = document.querySelector('input[value="' + it.key + '"]'); if (el) el.checked = false;
      } catch (e) {}
    } else if (it.src === 'auto') {
      // вписанное текстом: убираем имя из supp_other / meds_other
      try {
        var P2 = JSON.parse(localStorage.getItem(PROF()) || '{}') || {};
        ['supp_other', 'meds_other'].forEach(function (f) {
          if (P2[f]) P2[f] = splitNames(P2[f]).filter(function (n) { return 'txt:' + n.toLowerCase() !== it.key; }).join(', ');
          var inp = document.getElementById(f); if (inp) inp.value = P2[f] || '';
        });
        localStorage.setItem(PROF(), JSON.stringify(P2));
      } catch (e) {}
    }
    o.items = o.items.filter(function (x) { return x.id !== id; });
    _ikSave(o); _ikArm(); if (typeof renderCard === 'function') renderCard();
  };
  window._ikAdd = function () {
    var inp = document.getElementById('ik-new'), n = inp ? String(inp.value || '').trim().slice(0, 60) : '';
    if (!n) return;
    var o = _ikGet();
    o.items.push({ id: 'ik' + Date.now().toString(36), key: 'self:' + n.toLowerCase(), name: n, time: '08:00', tip: 'prescribed',
      start: ymd(), end: '', remind: true, src: 'self' });
    _ikSave(o); _ikArm(); if (typeof renderCard === 'function') renderCard();
  };
  window._ikToggle = function (on) {
    var o = _ikGet(); o.on = !!on; o.asked = true; _ikSave(o);
    var ask = (window.IK_CFG && window.IK_CFG.ask) || null;
    if (on && ask) {
      ask().then(function (ok) { if (!ok) { var o2 = _ikGet(); o2.on = false; _ikSave(o2); if (typeof renderCard === 'function') renderCard(); } _ikArm(); });
    } else _ikArm();
  };

  // ── памятка дня: глава «Приём сегодня» ──
  window._ikChapter = function () {
    if (!_ikActiveOn().length) return null;
    return { id: 'intake', icon: '<i class="ph ph-pill" style="color:var(--gold-lt);"></i>', pr: '💊', title: T('chapter'), teaser: T('teaser') };
  };
  // atTime ('HH:MM') — открыть ОДИН приём, о котором только что напомнили (клик по уведомлению).
  // Без аргумента — весь список, как раньше (глава памятки, кнопка в профиле).
  window._ikOpen = function (atTime) {
    var all = _ikActiveOn();
    var at = (typeof atTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(atTime)) ? atTime : '';
    var list = at ? all.filter(function (x) { return x.time === at; }) : all;
    if (at && !list.length) { at = ''; list = all; }   // приём убрали, а уведомление ещё висело
    var h = '';
    list.forEach(function (it) {
      h += '<div style="display:flex;gap:14px;padding:11px 0;border-bottom:1px solid var(--b1);">'
        + '<div style="font-family:var(--font-ui);font-weight:600;color:var(--gold-lt);min-width:52px;">' + _esc(it.time || '') + '</div>'
        + '<div><div style="color:var(--t1);font-weight:600;">' + _esc(it.name) + (it.src === 'spec' ? ' <span style="font-size:var(--fs-cap);color:var(--gold-lt);font-weight:400;">· ' + _esc(T('spec')) + '</span>' : '') + '</div>'
        + (it.dose ? '<div style="font-size:var(--fs-cap);color:var(--t2);">' + _esc(it.dose) + '</div>' : '')
        + (it.tip && TIPS[it.tip] ? '<div style="font-size:var(--fs-cap);color:var(--t3);">' + _esc(L(TIPS[it.tip])) + '</div>' : '')
        + (it.note ? '<div style="font-size:var(--fs-cap);color:var(--t2);">' + _esc(it.note) + '</div>' : '')
        + (it.end ? '<div style="font-size:var(--fs-cap);color:var(--t3);">' + _esc(T('to')) + ' ' + _esc(it.end) + '</div>' : '')
        + '</div></div>';
    });
    if (!h) h = '<div style="color:var(--t3);">' + _esc(T('empty')) + '</div>';
    // Из одного приёма — ход ко всему списку: человек мог открыть уведомление, чтобы свериться со всем днём.
    if (at && all.length > list.length) h += '<div onclick="_ikOpen()" style="margin-top:12px;font-size:var(--fs-cap);color:var(--gold-lt);cursor:pointer;">' + _esc(T('all_list')) + ' \u203a</div>';
    h += '<div style="font-size:var(--fs-cap);color:var(--t3);margin-top:12px;">' + _esc(T('edit')) + '</div>';
    if (typeof openSheet === 'function') openSheet('<i class="ph ph-pill" style="color:var(--gold-lt);"></i>',
      at ? T('at_title').replace('{t}', at) : T('chapter'), h);
  };
  // Пуш EXPERT знает только ЧАС (в нём нет названий — см. sw-expert.js). Находим приёмы этого часа.
  window._ikOpenHour = function (hour) {
    var hh = String(parseInt(hour, 10)).padStart(2, '0');
    var it = _ikActiveOn().filter(function (x) { return String(x.time || '').slice(0, 2) === hh; })[0];
    window._ikOpen(it ? it.time : undefined);
  };

  // ── один раз спросить про напоминания (после прохода, когда список уже есть) ──
  window._ikOffer = function () {
    try {
      var cfg = window.IK_CFG; if (!cfg || !cfg.canRemind || !cfg.canRemind()) return;
      var o = _ikGet(); if (o.asked || !_ikActiveOn().length) return;
      o.asked = true; _ikSave(o);
      var btn = 'display:block;width:100%;margin-top:10px;padding:13px;border-radius:12px;font-family:inherit;font-size:var(--fs-body);cursor:pointer;';
      openSheet('<i class="ph ph-bell" style="color:var(--gold-lt);"></i>', T('offer_t'),
        '<div style="font-size:var(--fs-body);color:var(--t2);line-height:1.7;">' + _esc(T('offer_b')) + '</div>'
        + '<button type="button" onclick="closeCircModal();_ikToggle(true)" style="' + btn + 'border:1px solid rgba(226,185,90,.45);background:rgba(226,185,90,.10);color:#fff;">' + _esc(T('yes')) + '</button>'
        + '<button type="button" onclick="closeCircModal()" style="' + btn + 'border:1px solid var(--b1);background:none;color:var(--t2);">' + _esc(T('no')) + '</button>');
    } catch (e) {}
  };

  // ── напоминания: собрать расписание и отдать странице ──
  // Одинаковое время → одно напоминание. Все строки без даты окончания → ежедневное повторяющееся;
  // есть курс с концом → разовые на каждый оставшийся день (до 14 вперёд, пересобираются при каждом
  // открытии приложения), иначе напоминание звенело бы после конца курса.
  window._ikSchedule = function () {
    var o = _ikGet(); if (!o.on) return [];
    var now = new Date(), today = ymd(now), byTime = {};
    o.items.forEach(function (it) {
      if (!it.remind || !/^([01]\d|2[0-3]):[0-5]\d$/.test(it.time || '')) return;
      if (it.end && it.end < today) return;
      (byTime[it.time] = byTime[it.time] || []).push(it);
    });
    var out = [], times = Object.keys(byTime).sort();
    times.forEach(function (t, i) {
      var its = byTime[t], hh = parseInt(t.slice(0, 2), 10), mm = parseInt(t.slice(3, 5), 10);
      var body = T('push').replace('{t}', t);
      var openEnded = its.every(function (it) { return !it.end && (!it.start || it.start <= today); });
      if (openEnded) { out.push({ id: 1000 + i, hh: hh, mm: mm, t: t, title: 'VIA·L', body: body }); return; }
      // Настоящий конец курса для этого времени (серверным напоминаниям EXPERT окно в 14 дней не нужно).
      var end = its.every(function (it) { return !!it.end; }) ? its.map(function (it) { return it.end; }).sort().pop() : null;
      for (var k = 0; k < 14; k++) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k, hh, mm, 0);
        if (d <= now) continue;
        var ds = ymd(d);
        if (!its.some(function (it) { return activeOn(it, ds); })) continue;
        out.push({ id: 2000 + i * 14 + k, at: d.getTime(), t: t, day: ds, end: end, title: 'VIA·L', body: body });
      }
    });
    return out.slice(0, 56);
  };
  window._ikArm = function () {
    try { var cfg = window.IK_CFG; if (cfg && cfg.arm) cfg.arm(_ikSchedule()); } catch (e) {}
  };
})();
