# Библиотека фраз клиентского бота VIA-L (сид)

> **Статус реализации (2026-06-04).** В прод (`CARE_PHRASES`, 12 языков) заведены и
> подключены к реальным триггерам **7 ключей**: `hello_welcome`, `anketa_invite`,
> `passed_to_specialist`, `got_attachment` (клиент прислал фото/файл/голосовое — копируем
> в топик), `zoom_invite` (нутрициолог дал `/zoom <ссылка>`), `error_unsupported` (стикер/
> без текста), `error_generic` (релей не прошёл). Остальные ключи ниже — **спека/TODO**:
> заводить только когда появится реальный триггер (доставка разбора, напоминания о Zoom,
> классификатор FAQ), иначе мёртвые фразы. Динамический FAQ уже закрыт FAQ-памятью
> «эталон» (ARCHITECTURE §16), поэтому статические `faq_*` — низкий приоритет.

> Статический словарь — НЕ гонять через Claude. Перевести один раз на 12 языков
> (uk/ru/en/es/de/pt/fr/pl/it/he/ja/ko) и хранить как `T`-объект в воркере (паттерн
> интерпретаторов, §4.3 ARCHITECTURE). Выбор по языку клиента из draft.
> Канон ниже — **ru** (рабочий язык) + **en**. uk/es/остальные — шаг перевода.
>
> **Прайм-директива тона:** забота. Тёплое обращение, поддержка, никакого
> обесценивания и менторства. Клиент пришёл за помощью в уязвимый период (мено/
> андропауза) — он должен чувствовать, что о нём заботятся, а не «обрабатывают».
> Любой медицинский вопрос — мягко переадресовать врачу/нутрициологу, бот не ставит
> диагнозов и не назначает дозировки сам.

---

## 1. Приветствие / онбординг канала
- `hello_welcome`
  - ru: «Здравствуйте! Я бот заботы VIA-L 🌿 Я рядом, чтобы вы не остались с вопросами один на один. Передаю всё нутрициологу и возвращаю ответы — на вашем языке.»
  - en: «Hello! I'm the VIA-L care assistant 🌿 I'm here so you're never left alone with your questions. I pass everything to your nutritionist and bring answers back — in your language.»
- `hello_lang_set`
  - ru: «Пишите на удобном вам языке — я переведу для специалиста и отвечу вам так же.»
  - en: «Write in whatever language is comfortable — I'll translate for the specialist and reply to you the same way.»

## 2. Доставка разбора
- `report_ready`
  - ru: «Ваш персональный разбор готов 💛 Нутрициолог изучил ваши данные. Файл — во вложении. Прочитайте спокойно, а все вопросы задайте здесь — я передам.»
  - en: «Your personal analysis is ready 💛 The nutritionist has reviewed your data. The file is attached. Take your time, and ask anything here — I'll pass it on.»
- `report_followup`
  - ru: «Как вам разбор? Если что-то непонятно или хочется уточнить под себя — напишите, это нормально и важно.»
  - en: «How does the analysis feel? If anything is unclear or you'd like it tailored further — just write, that's normal and welcome.»

## 3. Приглашение на полную анкету + анализы
- `anketa_invite`
  - ru: «Чтобы вести вас точно, нутрициологу нужна полная картина. Вот анкета здоровья — спокойно, по чуть-чуть, можно в несколько заходов: {link}. Это о вас, и всё строго конфиденциально.»
  - en: «To guide you precisely, the nutritionist needs the full picture. Here's the health questionnaire — take it slowly, in several sittings if needed: {link}. It's about you, and fully confidential.»
- `anketa_labs_note`
  - ru: «Если есть свежие анализы — впишите значения или приложите фото/PDF. Нет под рукой? Не переживайте: на знакомстве подскажем, что именно сдать, и время на это будет.»
  - en: «If you have recent lab results — enter the values or attach a photo/PDF. Don't have them yet? No worries: we'll tell you exactly what to take, with time to do it.»
- `anketa_deadline`
  - ru: «Хорошо бы заполнить за 2–3 дня до встречи — чтобы специалист пришёл уже подготовленным именно по вам. Если не успеваете — напишите, подстроимся.»
  - en: «It helps to fill it in 2–3 days before the session — so the specialist comes prepared for you specifically. Running late? Tell us, we'll adjust.»

## 4. Получение анкеты
- `anketa_received`
  - ru: «Спасибо, что доверили нам это 🌿 Анкета у нутрициолога. Я подготовил(а) её структурировано, специалисту останется дошлифовать — к встрече всё будет готово.»
  - en: «Thank you for trusting us with this 🌿 Your questionnaire is with the nutritionist. I've organised it, the specialist will refine it — everything will be ready for your session.»

## 5. Zoom
- `zoom_invite` ✅ **в проде** — выдаётся командой нутрициолога `/zoom <ссылка>` в топике
  - ru: «Ваша онлайн-консультация 🌿 Ссылка для подключения:\n{link}\n\nПодключитесь, пожалуйста, за пару минут до начала. До встречи!»
  - en: «Your online consultation 🌿 Link to join:\n{link}\n\nPlease join a couple of minutes before the start. See you!»
- `zoom_booked`
  - ru: «Встреча забронирована ✅ Ссылка придёт на почту. Перед созвоном гляну, всё ли есть у специалиста — и напомню вам.»
  - en: «Your session is booked ✅ The link will arrive by email. Before the call I'll make sure the specialist has everything — and remind you.»
- `zoom_reminder`
  - ru: «Напоминаю о встрече завтра 💛 Если появились новые вопросы — скиньте заранее, специалист учтёт.»
  - en: «A gentle reminder about tomorrow's session 💛 New questions? Send them ahead and the specialist will include them.»

## 6. Переписка — сервисные реплики
- `got_attachment` ✅ **в проде** — клиент прислал фото/файл/голосовое/видео (оригинал копируется в топик)
  - ru: «Спасибо 🌿 Получили ваше вложение и передали нутрициологу. Вернёмся с ответом на вашем языке.»
  - en: «Thank you 🌿 We've received your attachment and passed it to your nutritionist. We'll come back with an answer in your language.»
- `passed_to_specialist`
  - ru: «Передал(а) ваш вопрос нутрициологу. Отвечаем в рабочее время, обычно в течение 48 часов — вы точно не потеряетесь.»
  - en: «I've passed your question to the nutritionist. We reply during working hours, usually within 48 hours — you won't be forgotten.»
- `waiting_empathy`
  - ru: «Спасибо за терпение 🙏 Специалист готовит вдумчивый ответ — нам важно не отписаться, а помочь по-настоящему.»
  - en: «Thank you for your patience 🙏 The specialist is preparing a thoughtful answer — we'd rather help properly than reply in haste.»
- `reply_delivered`
  - ru: «Вот ответ нутрициолога 💛 Если что-то ещё кольнуло вопросом — пишите, я рядом.»
  - en: «Here's the nutritionist's reply 💛 If anything still nags at you — write, I'm here.»

## 7. FAQ-затравка (растёт из подтверждённых ответов нутрициолога)
> Бот НЕ выдумывает медицину. Пока ответ не подтверждён нутрициологом — переадресует.
- `faq_dosage`
  - ru: «Дозировки и схемы — только индивидуально: нутрициолог подберёт под ваши данные и анализы. Я уже передал(а) вопрос, чтобы ответ был именно ваш, а не общий.»
  - en: «Dosages and protocols are always individual: the nutritionist will tailor them to your data and labs. I've passed this on so the answer is yours, not generic.»
- `faq_when_result`
  - ru: «Разбор готовится вдумчиво, обычно до 48 часов в рабочие дни. Как только будет — пришлю сюда первым делом.»
  - en: «Your analysis is prepared carefully, usually within 48 hours on working days. The moment it's ready, I'll send it here first.»
- `faq_pdf_missing`
  - ru: «Жаль, что файл не дошёл — давайте поправим. Проверьте, пожалуйста, папку «Спам». Не нашли? Напишите «нет PDF» — продублирую.»
  - en: «Sorry the file didn't arrive — let's fix that. Please check your Spam folder. Still missing? Reply “no PDF” and I'll resend.»
- `faq_how_labs`
  - ru: «Какие анализы сдать — подскажет нутрициолог под вашу фазу (обычно гормоны, витамин D, ферритин, щитовидная). Сдать можно в любой лаборатории, натощак утром. Подробный список будет в анкете.»
  - en: «The nutritionist will tell you which labs to take for your phase (usually hormones, vitamin D, ferritin, thyroid). Any lab works, fasting in the morning. A detailed list comes with the questionnaire.»
- `faq_medical_redirect`
  - ru: «Это важный медицинский вопрос — здесь нужен врач, и я бережно отношусь к вашему здоровью, чтобы не навредить советом наугад. Нутрициолог тоже подскажет, к какому специалисту обратиться.»
  - en: «This is an important medical question — it needs a doctor, and I care about your health too much to guess. The nutritionist can also point you to the right specialist.»

## 8. Сервис / ошибки
- `error_generic` ✅ **в проде** — релей вопроса не прошёл (не создался топик)
  - ru: «Кажется, что-то подвисло на моей стороне 🙈 Повторите, пожалуйста, через минуту — я никуда не денусь.»
  - en: «Something seems to have hiccuped on my side 🙈 Please try again in a minute — I'm not going anywhere.»
- `error_unsupported` ✅ **в проде** — сообщение без текста и без релеящегося медиа (стикер/локация/контакт)
  - ru: «Пока я понимаю текст, фото и файлы. Напишите, пожалуйста, словами — и я всё передам нутрициологу 🌿»
  - en: «For now I understand text, photos and files. Please write it in words — and I'll pass everything to your nutritionist 🌿»

---

## Реализация (см. ARCHITECTURE §16)
- Хранить как `T`-объект в воркере; ключи выше — стабильные.
- `{link}` и пр. — плейсхолдеры, подставляются воркером.
- FAQ-ключи (раздел 7) — стартовые; новые добавляются ТОЛЬКО из ответов, помеченных
  нутрициологом как «эталон» (KV-FAQ). Бот не пополняет память сам.
- Переводить сразу на все 12 языков (правило §4.3) перед заведением в прод.
