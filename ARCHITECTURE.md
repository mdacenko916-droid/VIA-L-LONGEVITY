# VIA-L LONGEVITY — Архитектура всего проекта

> Полная карта проекта: маркетинговый сайт + Интерпретатор (ИП) + бэкенд
> (Cloudflare Worker + Google Apps Script) + интеграции (Hotmart, Google,
> Telegram, Claude, Brevo).
> Документ описывает **фактическое** состояние кода на дату ревизии.
> Дата: 2026-05-29.
>
> Узкая документация по подсистеме интерпретатора — в
> [`interpreter/ARCHITECTURE.md`](interpreter/ARCHITECTURE.md). Этот файл —
> верхнеуровневая карта всего репозитория.

---

## 0. Два продукта в одном репозитории

**Целевая аудитория (общая для обоих продуктов):** женщины 35+
(пременопауза / менопауза / постменопауза) и мужчины 40+ (андропауза /
предандропауза). Это сужает контент, скоринг и KB-паттерны: фокус — на
гормональном здоровье после 35/40, а не на общем wellness.

Проект состоит из двух независимых, но связанных продуктов:

| Продукт | Что это | География | Точка входа | Оплата |
|---|---|---|---|---|
| **Программы ведения** | Сопровождение нутрициолога (Менопауза / Андропауза / Антивозрастное / Эстроген) | Европа, 4 языка (uk+ru ядро, en/es) | Лендинг + 4 program-страницы | Hotmart → анкета → сессии |
| **Интерпретатор (ИП)** | Веб-приложение для расшифровки данных носимых устройств (Oura и др.) | Мир, 12 языков (EN-fallback) | `interpreter/` | Hotmart → код доступа |

ИП работает как **воронка** в программы ведения: пользователь из любой
страны интерпретирует свои показатели → конвертируется в платное
сопровождение (uk/ru/en/es).

Оба продукта используют **один** Cloudflare Worker и **один** Google Apps
Script, **один** Telegram-бот (`@viael_backstage_bot`) и **один** аккаунт
рассылки.

Хостинг сайта: **GitHub Pages** (статика, домен `via-l.com`, см. `CNAME`).
Бэкенд-логика: **Cloudflare Worker** + **Google Apps Script** (serverless).

---

## 1. Карта всех страниц (сайт и ИП)

### 1.1 Маркетинговый сайт (корень репозитория)

| Файл | Назначение | i18n | В sitemap |
|---|---|---|---|
| `index.html` | Лендинг (HERO → ABOUT → HOW → PROGRAMS → GUIDES → FOR-WHOM → REVIEWS → ME → FAQ → BOOKING) | `data-i18n` (uk/ru/es/en) | ✓ |
| `Menopauza-program.html` | Программа «Менопауза» | `.lang-content` CSS (uk=`ua`) | ✓ |
| `Andropauza-program.html` | Программа «Андропауза» | `.lang-content` CSS (uk=`ua`) | ✓ |
| `Antivikove-program.html` | Программа «Антивозрастное питание» | `data-i18n` | ✓ |
| `Estrogen-program.html` | Программа «Эстрогеновый метаболизм» | смешанная | ✓ |
| `program-intake.html` | Анкета-опросник после оплаты программы (токен в URL) | uk/ru | — (noindex по смыслу) |
| `cabinet/index.html` | **Внутренний** кабинет нутрициолога — локальный CRM клиентов в `localStorage` | — | — |
| `legal/{cookies,legal,privacy,terms}.html` | Юридические страницы | — | — |
| `monogram/index .html` | SVG-монограмма (логотип-ассет, пробел в имени) | — | — |
| `404.html` | Заглушка 404 | — | — |
| `google4a96f72a66a53cca.html` | Подтверждение владения для Google Search Console | — | — |
| `robots.txt`, `sitemap.xml`, `.nojekyll`, `CNAME` | Служебные файлы GitHub Pages | — | — |

### 1.2 Книги-гайды (`book/`)

Флипбук-система: `index.html#guides` → iframe `book/carousel.html` → один из
семи `book/*_index.html` (Hormones, Testosteron, Blood_Tests, Longevity,
Sugar_40, Inflammation, Beauty). Протокол `postMessage` (`openBook` /
`bookReady`). Десктоп — turn.js; мобильный — кастомный свайп-ридер (продублирован
во всех 7 файлах). Подробно — в [`CLAUDE.md`](CLAUDE.md).

### 1.3 Интерпретатор (`interpreter/`, отдаётся как `via-l.com/interpreter`)

| Файл | Назначение | Шагов | AI | Expert-PDF | Zoom | i18n |
|---|---|---|---|---|---|---|
| `index.html` | Лендинг ИП: галерея устройств (3D) + тарифы | — | — | — | — | 12 яз. |
| `methodology.html` | «Научная база» (`noindex`) | — | — | — | — | 12 яз. |
| `interpreter-vio.html` | VIO — платный, €9.90 | 7 | ✓ | — | — | 12 яз. |
| `interpreter-via-l.html` | PRO | 16 | ✓ | — | — | 12 яз. |
| `interpreter-pro-expert.html` | PRO + EXPERT | 17 (16 + Анкета) | ✓ | 2 в 30 дней | — | 12 яз. |
| `interpreter-elite.html` | ELITE (8w / 12w) | 17 (16 + Анкета) | ✓ | 8 за 8 нед / 12 за 12 нед (еженедельный) | опц. для uk/ru, 1:1 ≈ раз в 1–3 нед | 12 яз. |
| `code-generator.html` | **Внутренний** генератор кодов доступа | — | — | — | — | — |
| `Logo/`, `images-bg/`, `images-in/` | Ассеты (логотип, фоны-галактики, фото устройств) | — | — | — | — | — |

### 1.4 Бэкенд (исходники в репозитории, исполняются вне его)

| Файл | Где исполняется | Назначение |
|---|---|---|
| `interpreter/cloudflare-worker.js` | Cloudflare Workers (edge) | AI-прокси + Hotmart-webhook + Telegram-бот + intake-поток |
| `interpreter/wrangler.jsonc` | Конфиг деплоя Worker | имя `interpreter`, KV-биндинги, vars |
| `interpreter/apps-script.js` | Google Apps Script (web app) | валидация кодов, Expert-запросы, генерация PDF-отчётов |
| `interpreter/knowledge-base.md` + `Infa Cloude/*.txt` | — (источник для промпта) | клиническая база (25 паттернов + LAB MODULE) |

---

## 2. Поток пользователя (от входа до результата)

### 2.1 Поток A — Интерпретатор (ИП)

```
1. Покупка на Hotmart (тариф PRO / EXPERT / ELITE-8W / ELITE-12W)
        │
        ▼ Hotmart Webhook (PURCHASE_APPROVED) → Worker /hotmart-webhook
        │   product.type === 'interpreter'
        ▼ handleInterpreterPurchase()
        │   → Apps Script {action:'assign_code', tier} → резервирует FREE-код
        │   → Telegram нутрициологу: «🧬 Интерпретатор — TIER + код»
        │   → Email покупателю с кодом (Brevo, 12 языков)
        │
2. Клиент открывает /interpreter → выбирает тариф → открывает interpreter-*.html
        │
        ▼ Вводит код → checkCode() → GET Apps Script ?code=XXX → validateCode()
        │   FREE/ASSIGNED → ACTIVE (ставит срок) | ACTIVE → проверка срока/лимитов
        │   Ответ: {ok, plan, expiry, expert_used, expert_max, onboarding_required}
        │
        ▼ (ELITE, первый вход) onboarding_required=true → анкета-анамнез stepOnboarding
        │
3. Пошаговый ввод биометрии (7 / 16 / 17 шагов — VIO / PRO / EXPERT+ELITE) — вручную или импортом устройства
        │   (Oura API-токен, Apple Watch XML, Garmin/Polar/Samsung/Fitbit/WHOOP/Xiaomi CSV…)
        │
        ▼ showResults() собирает объект `data`
        │   VIO  → локальный скоринг (без AI) + paywall
        │   PRO+ → fetch(AI_WORKER) POST {data, lang} → handleAnalyze() → Claude Haiku
        │
4. Результат рендерится на экране (#aiResult, Markdown→HTML)
        │
        ▼ downloadPDF() → печатное окно → window.print() → клиент сохраняет PDF
        │
5. (EXPERT / ELITE) Кнопка «Expert-разбор» → Apps Script ?action=expert
        │   проверка лимитов (см. §6) → письмо нутрициологу (Gmail)
        │   + подтверждение клиенту (Gmail, 12 яз.) + Worker /draft (карточка в TG)
        │
        ▼ Нутрициолог в Telegram: ✏️ пишет ответ → ✅ «Отправить клиенту»
        │   Worker translateReply() (на язык клиента) → Apps Script {action:'send_report'}
        │   → Google Doc → PDF → Gmail клиенту с вложением
```

### 2.2 Поток B — Программа ведения

```
1. Покупка программы на Hotmart (Разовая €120 / Базова 8 тиж €390 / Повна 12 тиж €590)
        │
        ▼ Hotmart Webhook → Worker /hotmart-webhook (product.type !== 'interpreter')
        │   → KV PROGRAM_INTAKES: {token → {email, name, program, plan, lang, status:'pending'}} (TTL 90 дней)
        │   → Telegram нутрициологу: «💳 Новая оплата» + ссылка на анкету
        │   → Email клиенту (Brevo): ссылка program-intake.html?t=TOKEN
        │
2. Клиент открывает program-intake.html?t=TOKEN
        │   ▼ GET Worker /intake-validate?t=TOKEN → {program, name, plan, lang}
        │   ▼ Заполняет анкету (4 секции, ~20 вопросов)
        │   ▼ POST Worker /intake-submit {token, answers, lang}
        │       → KV status='submitted'
        │       → Claude: перевод на ru + AI-bullets (buildIntakeAiBlock)
        │       → Telegram карточка нутрициологу + кнопка [📅 Назначить сессию]
        │       → Email клиенту: «анкета получена»
        │
3. Нутрициолог жмёт [📅 Назначить сессию] → бот САМ шлёт клиенту письмо
        │   (calinvite_*) со ссылкой на Cal.com 60-мин (cal.com/marynaviael/консультация-60-мин)
        │   и дублирует ссылку нутрициологу в TG. Это gate: ссылка уходит,
        │   только когда нутрициолог посмотрел анкету.
        │
4. Клиент бронирует в Cal.com → Cal.com шлёт письма/видео обеим сторонам
        │   + webhook BOOKING_CREATED → Worker /cal-webhook → TG-карточка нутрициологу
```

---

### Запись на консультации: ФИНАЛЬНАЯ архитектура (Cal.com + webhook → TG)

> Подтверждено end-to-end 2026-06-01. **Основная система записи — Cal.com** (account `marynaviael`). Cal.com сам ведёт календарь, проверяет занятость (free/busy из Google Calendar), создаёт видео (Cal Video), шлёт письма организатору и клиенту, даёт перенос/отмену. Worker лишь добавляет то, чего Cal.com не делает, — **уведомление в Telegram-бот**.

**A. Публичная 15-мин «бесплатная консультация» (знакомство) — через Cal.com.**
- Event type: `cal.com/marynaviael/бесплатная-консультация` (URL-encoded в коде).
- Встроен **inline-эмбедом** (`<iframe ...?embed=true&embedType=inline&theme=light>`) в модалку `#calModal`.
- Точки входа (все открывают одну и ту же модалку):
  - **index.html** — `openCalModal()`: hero, блок 5 (FOR WHOM), блок 6 (REVIEWS/истории), блок 9 (booking card), футер (иконка), guides-modal. **⚠️ Для `en`/`es` все 6 точек скрыты — см. §5.2a.**
  - **4 `*-program.html`** — кнопки «знакомство» → `openModal('calModal')` (тело модалки = тот же Cal.com-iframe). **⚠️ Для `en`/`es` кнопки intro и hero-note скрыты — см. §5.2a.**
- Клиент бронирует прямо в Cal.com → Cal.com шлёт письма (организатору `viaelcom@gmail.com` + клиенту) и **webhook** (см. ниже).

**B. Telegram-уведомление о брони Cal.com — `POST /cal-webhook` → `handleCalWebhook`.**
- Cal.com (Settings → Developer → Webhooks) шлёт `BOOKING_CREATED` (опц. rescheduled/cancelled) на `https://interpreter.viaelcom.workers.dev/cal-webhook`.
- Worker парсит payload (`payload.attendees[0]`, `startTime`, `videoCallUrl`/`metadata.videoCallUrl`/`location`, `organizer.timeZone`), форматирует время через `Intl.DateTimeFormat` в TZ участника, шлёт TG-карточку «📅 Новая запись (Cal.com)».
- Webhook **привязан к event type, а НЕ к странице** — Worker не знает, с какой страницы пришла бронь (и не должен). Путь один для всех точек входа A.
- Подпись HMAC-SHA256 проверяется, если задан секрет `CAL_WEBHOOK_SECRET` (`verifyCalSig`, header `x-cal-signature-256`); не задан → пропускаем.
- `sendTelegramTo` делает **ретрай при 429/5xx** (учитывая `retry_after`) — иначе серия броней теряла карточки из-за flood-лимита Telegram.

**C. 60-мин первая сессия программы (ПОСЛЕ оплаты, по токену) — через Cal.com 60-мин event, с gate.**
1. Оплата Hotmart → `/hotmart-webhook` → KV `PROGRAM_INTAKES:intake:{token}` + письмо со ссылкой на анкету + TG.
2. Анкета → `/intake-submit` → `handleIntakeSubmit`: AI-bullets → TG-карточка с кнопкой **[📅 Назначить сессию]** + письмо «анкета получена».
3. **Gate:** нутрициолог жмёт кнопку → `handleTgCallback` ветка `sched` → бот **сам шлёт клиенту письмо** `calinvite_*` со ссылкой на **Cal.com 60-мин** (`cal.com/marynaviael/консультация-60-мин`) + дублирует ссылку себе в TG. Календарь открывается только после просмотра анкеты.
4. Клиент бронирует в Cal.com → Cal.com шлёт письма/видео + webhook `BOOKING_CREATED` → `/cal-webhook` → TG-карточка нутрициологу.

**D. 60-мин ELITE-видеоконсультация (внутри ИП, только uk/ru) — через Cal.com 60-мин event.**
- Блок `#zoomBlock` в `interpreter-elite.html` (виден только uk/ru, управляется в `setLang`) — **inline-эмбед** того же Cal.com 60-мин event. Бронь → письма Cal.com + TG через `/cal-webhook`. (Кастом-пикер и `bookEliteCall()` удалены.)

**Event types Cal.com (account `marynaviael`):**
- `бесплатная-консультация` — 15 мин (поток A).
- `консультация-60-мин` — 60 мин (потоки C и D, один event на оба).

**Эндпоинты Worker (`cloudflare-worker.js`):**

| Назначение | Эндпоинт | Хендлер |
|---|---|---|
| Cal.com webhook → TG (ВСЕ брони: A, C, D) | `POST /cal-webhook` | `handleCalWebhook` (+ `verifyCalSig`, `fmtCalTime`) |
| Gate-кнопка «Назначить сессию» (поток C) | TG callback `sched:` | `handleTgCallback` → письмо `calinvite_*` со ссылкой на Cal.com 60-мин |
| Покупка/анкета программы | `/hotmart-webhook`, `/intake-submit` | `handleHotmartWebhook`, `handleIntakeSubmit` |

- **Удалено 2026-06-01 (Worker):** `/book-call` + `handleBookCall`, `/schedule-session` + `handleScheduleSession`, `zoomEmailBlock`/`zoomTgLine`/`ZOOM_T`, ключи `EMAIL_T.sched_*`/`intro_*`/`elite_*`. Осталась inert (никуда не ведёт) только фронт-разметка: кастом-календарь в `program-intake.html?calendar=1` и мёртвый calendar-JS в 4 `*-program.html` — переплетены с живой анкетой/лендингами, оставлены намеренно.
- KV `PROGRAM_INTAKES`: `intake:<token>` (анкета программы), TTL 180д.
- Секреты: `CAL_WEBHOOK_SECRET` (опц., подпись Cal.com). `ZOOM_LINK` больше НЕ используется (можно удалить: `wrangler secret delete ZOOM_LINK`). Деплой: `wrangler deploy`.
- Cal.com webhook URL: `https://interpreter.viaelcom.workers.dev/cal-webhook`, событие `Booking created`.

**Итог: единая система — Cal.com везде** (15-мин знакомство + 60-мин сессии/ELITE), TG через `/cal-webhook`. Cal.com даёт реальную занятость, видео и письма; Worker — только уведомление в бот.

---

## 3. Система оплат и получение кодов доступа

### 3.1 Hotmart как касса

Все продукты продаются через Hotmart. Сопоставление `product_id → продукт`
зашито в Worker (`HOTMART_PRODUCTS`, `cloudflare-worker.js`):

**Программы ведения** (по €120 / €390 / €590 каждая):

| program_id | Программа · план |
|---|---|
| 7706092 / 7705959 / 7706047 | Menopauza · Разовая / 8 тиж / 12 тиж |
| 7706220 / 7706135 / 7706176 | Andropauza · Разовая / 8 тиж / 12 тиж |
| 7706301 / 7706250 / 7706270 | Antivikove · Разовая / 8 тиж / 12 тиж |
| 7706424 / 7706337 / 7706370 | Estrogen · Разовая / 8 тиж / 12 тиж |

**Тарифы интерпретатора:**

| product_id | Тариф | Цена |
|---|---|---|
| 7838739 | PRO | €29/мес |
| 7838826 | EXPERT | €79/мес |
| 7838876 | ELITE-8W | €390 |
| 7838925 | ELITE-12W | €590 |

> Гайды-книги (`book/`) продаются по отдельной матрице Hotmart-ссылок —
> хардкод в `index.html` (~стр. 3371), источник истины — `адреса гайдов.xlsx`.

### 3.2 Webhook аутентификация

Hotmart шлёт `POST /hotmart-webhook` с заголовком `x-hotmart-hottok`. Worker
сверяет его с `env.HOTMART_TOKEN` (`vial-hotmart-2026`, см. `wrangler.jsonc`
→ `vars`). Обрабатывается только событие `PURCHASE_APPROVED`. Язык клиента
определяется `detectLangFromHotmart()` (locale → страна → домен email → `en`).

### 3.3 Коды доступа интерпретатора

- Формат (генерируются в `code-generator.html`): `VL-P-XXXXXXXX` (PRO),
  `VL-M-XXXXXXXX` (MAX/Expert). Символы A–Z без `O/I/L`, цифры 2–9 без `0/1`.
- Хранятся в Google Sheets (см. §4.1). Колонка B = тариф.
- **Выдача автоматическая**: после оплаты интерпретатора Worker зовёт Apps
  Script `assign_code` → берёт первый `FREE`-код нужного тарифа → помечает
  `ASSIGNED` → возвращает Worker → код уходит покупателю письмом.
- **Dev-коды** (обход таблицы, без лимитов): `VIAL-PRO-2024`,
  `VIAL-EXPERT-2024`, `VIAL-ELITE-2024`, `VIAL-ELITE-8W`, `VIAL-ELITE-12W`.

### 3.4 Жизненный цикл кода

```
FREE → (assign_code после оплаты) → ASSIGNED → (первый вход, validateCode) → ACTIVE → (срок вышел) → EXPIRED
```

При активации (`validateCode`, статус FREE/ASSIGNED) ставится дата активации и
дата истечения по сроку тарифа (см. §6).

---

## 4. Google Apps Script (`apps-script.js`) — что делает каждая функция

### 4.1 Структура Google Sheet (лист 1, строка 1 — заголовки)

| Кол. | Поле |
|---|---|
| A | Код доступа |
| B | Тариф (PRO / EXPERT / ELITE-8W / ELITE-12W) |
| C | Статус (FREE → ASSIGNED → ACTIVE → EXPIRED) |
| D | Дата активации (ISO) |
| E | Дата истечения (ISO) |
| F | JSON-массив дат Expert-запросов клиента (legacy: одна ISO-строка) |
| G | JSON-массив дат отправленных клиенту PDF-отчётов |
| H | ELITE Onboarding — JSON-объект ответов анкеты-анамнеза (пусто = не пройдена) |

### 4.2 Эндпоинты и функции

| Функция | Триггер | Что делает |
|---|---|---|
| `doGet(e)` | GET | `?action=expert` → Expert-запрос; иначе `?code=` → `validateCode` |
| `doPost(e)` | POST | роутер: `send_report` / `assign_code` / иначе Expert-запрос |
| `doOptions(e)` | OPTIONS | CORS-preflight (пустой ответ) |
| `validateCode(code)` | вход в ИП | FREE/ASSIGNED → ACTIVE (+срок); ACTIVE → проверка срока и лимитов; EXPIRED → отказ. Возвращает `{plan, expiry, expert_used, expert_max, expert_next_at, onboarding_required}` |
| `handleAssignCode(p)` | после оплаты ИП | резервирует первый `FREE`-код нужного тарифа → `ASSIGNED` |
| `handleExpertRequest(p)` | Expert-разбор | проверяет лимиты тарифа → пишет дату в кол. F → письмо нутрициологу + клиенту → `notifyBackstageBot` |
| `getPlanLimits(plan)` | helper | параметры тарифа (срок, max, окно, cooldown, isElite, hasExpert) |
| `isElitePlan(plan)` | helper (legacy alias) | `getPlanLimits(plan).isElite` |
| `parseExpertHistory(value)` | helper | парсит кол. F: JSON-массив дат **или** legacy одиночную ISO |
| `expertStateFromHistory(h, now, plan)` | helper | `{used, max, next_at}` для отображения счётчика |
| `sendExpertEmail(...)` | — | письмо нутрициологу (всегда ru, plain-text) + подтверждение клиенту (12 яз., `CLIENT_CONFIRM`) |
| `handleSendReport(p)` | финал backstage | строит Google Doc → PDF → шлёт клиенту вложением, лог в кол. G |
| `reportLabels(lang)` / `jsLocale(lang)` / `safeFilename(...)` | helpers PDF | локализация и имя файла отчёта |
| `notifyBackstageBot(payload)` | — | `POST` на Worker `/draft` (fail-safe, ошибки не пробрасываются) |
| `respond(data)` | helper | JSON-ответ через `ContentService` |

Константы: `SUBSCRIPTION_DAYS=30`, `EXPERT_MAX=2`, `EXPERT_WIN_MS=30д`,
`EXPERT_COOL_MS=7д`, `ELITE_8W_DAYS=56`, `ELITE_12W_DAYS=84`,
`ELITE_8W_MAX=8`, `ELITE_12W_MAX=12`, `MARINA_EMAIL='viaelcom@gmail.com'`,
`BACKSTAGE_DRAFT_URL`, `DEV_CODES`.

### 4.3 Cloudflare Worker (`cloudflare-worker.js`) — функции

| Функция | Маршрут / роль |
|---|---|
| `fetch()` | роутер: GET `/intake-validate`; POST `/tg-test`, `/draft`, `/tg-webhook`, `/hotmart-webhook`, `/intake-submit`, `/cal-webhook`, иначе → `handleAnalyze` |
| `handleAnalyze` | POST `{data, lang}` → Claude Haiku (`SYSTEM_PROMPT` + `buildUserMessage`, prompt caching) → `{analysis}` |
| `buildUserMessage` / `selectKBPatterns` | сборка контекста (нормы, паттерны A–G, ИМТ/WHtR, анализы, KB-паттерны) |
| `handleHotmartWebhook` / `detectLangFromHotmart` | приём оплаты → ветка программы или интерпретатора |
| `handleInterpreterPurchase` / `buildInterpreterEmailBody` | выдача кода (Apps Script) + письмо покупателю (12 яз.) |
| `handleIntakeValidate` / `handleIntakeSubmit` / `buildIntakeAiBlock` / `handleScheduleSession` | поток анкеты программы (KV `PROGRAM_INTAKES`) |
| `handleTgTest` / `handleDraft` / `generateAiBullets` / `renderDraftCard` / `buildDraftKeyboard` | backstage-бот: карточка Expert-разбора + AI-подсказки |
| `handleTgWebhook` / `handleTgCallback` / `handleTgMessage` | обработка кнопок и реплаев нутрициолога (KV `EXPERT_DRAFTS`) |
| `translateReply` | перевод ответа нутрициолога на язык клиента (Claude) |
| `sendEmail` | рассылка через **Brevo** API |
| `sendTelegram*` / `tg*` / `esc` / `jsonResponse` | Telegram- и HTTP-хелперы |

---

## 5. Система переводов (12 языков)

### 5.1 Фронтенд интерпретатора — единая система `data-t` + объект `T`

```html
<span data-t="next">Далее →</span>
```
```js
const T = { uk:{…}, ru:{…}, en:{…}, es:{…}, de:{…}, pt:{…}, fr:{…}, pl:{…}, it:{…}, he:{…}, ja:{…}, ko:{…} };
function setLang(l){ document.querySelectorAll('[data-t]').forEach(el => { if(T[l][k]!==undefined) el.innerHTML = T[l][k]; }); }
function t(k){ return T[lang][k] || T.ru[k] || k; }   // fallback на ru
```

- **12 языков:** `uk ru en es de pt fr pl it he ja ko`. Украинский (`uk`) — первый.
- Хранение выбора: `localStorage.vial_lang`. RTL включается для `he`.
- **Правило:** любой новый `data-t` / `data-t-placeholder` добавляется сразу во
  все 12 секций `T` (ИП — мировой продукт). Плейсхолдеры вида `{n}` заменяются в JS.

### 5.2 Фронтенд сайта — ДВЕ несовместимые системы (не смешивать)

1. **`data-i18n` + словарь `translations`** — `index.html`,
   `Antivikove-program.html`, `accompaniment-block.html`.
2. **`.lang-content[data-lang]` + CSS-видимость** — `Andropauza-program.html`,
   `Menopauza-program.html` (там Ukrainian = `ua`, не `uk`!).

Сайт поддерживает 4 языка: `uk/ru/es/en`. Выбор в `localStorage.selectedLang`.

### 5.2a Языковое разграничение доступа к записи (uk/ru vs en/es)

**Логика:** 15-минутная бесплатная консультация (`#calModal`) — сервис только для украино- и русскоязычной аудитории. Англоязычные и испаноязычные пользователи её не видят. Реализовано двумя слоями: **CSS `!important`** (надёжно даже если JS не отработал) + правильный `id` на каждом элементе.

#### Что видит uk/ru — полный доступ к записи

| Страница | Элемент | id |
|---|---|---|
| `index.html` | Кнопка героя «Записатися на безкоштовну консультацію» | `heroCalBtn` |
| `index.html` | Бейдж героя «✦ 15 хв · безкоштовно, без зобов'язань ✦» | `heroNote2` |
| `index.html` | Кнопка блока «Для кого» | `forWhomCalBtn` |
| `index.html` | Кнопка блока «Відгуки / Client stories» | `reviewsCalBtn` |
| `index.html` | Карточка записи в блоке 9 (Booking) | `b9CalCard` |
| `index.html` | Иконка-календарь в футере | `footerCalBtn` |
| `index.html` | Кнопка в модалке гайдов «Coming soon» | `gmodalCalBtn` |
| `Menopauza-program.html` | Кнопка знакомства в герое + в аккомпанименте + hero note | `heroBtnSlots`, `acc_btn1`, `heroNote` |
| `Andropauza-program.html` | Кнопка знакомства в герое + в аккомпанименте + hero note | `heroBtnSlots`, `accBtnSlots`, `heroNote` |
| `Antivikove-program.html` | Кнопка знакомства в герое + в аккомпанименте + hero note | `heroBtnSlots`, `accBtnSlots`, `.hero-note[data-i18n="hero_note"]` |
| `Estrogen-program.html` | Кнопка знакомства в герое + в аккомпанименте + hero note | `heroBtnSlots`, `accBtnSlots`, `hero_note` |

#### Что НЕ видит en/es — всё перечисленное выше скрыто

#### Реализация CSS (по файлам)

**`index.html`** — блок `<style>` перед `</body>`:
```css
html[lang="en"] #heroCalBtn,   html[lang="es"] #heroCalBtn,
html[lang="en"] #heroNote2,    html[lang="es"] #heroNote2,
html[lang="en"] #forWhomCalBtn,html[lang="es"] #forWhomCalBtn,
html[lang="en"] #reviewsCalBtn,html[lang="es"] #reviewsCalBtn,
html[lang="en"] #b9CalCard,    html[lang="es"] #b9CalCard,
html[lang="en"] #footerCalBtn, html[lang="es"] #footerCalBtn,
html[lang="en"] #gmodalCalBtn, html[lang="es"] #gmodalCalBtn { display:none !important; }
```
Селектор — `html[lang]` (устанавливается через `document.documentElement.lang = lang` в `applyLang()`).

**`Menopauza-program.html`**, **`Andropauza-program.html`** — те же id, но **селектор `html[data-current-lang]`** (у этих двух страниц Ukrainian = `ua`, не `uk`):
```css
html[data-current-lang="en"] #heroBtnSlots, html[data-current-lang="es"] #heroBtnSlots, ...
```

**`Antivikove-program.html`**, **`Estrogen-program.html`** — селектор `html[lang]` (как index.html).

> ⚠️ Смешивать `html[lang]` и `html[data-current-lang]` нельзя — это разные атрибуты разных систем i18n. Перед добавлением нового правила grep страницу на `setLang\|applyLang\|data-current-lang`.

### 5.3 Бэкенд-локализация (письма и отчёты)

| Источник | Языков | Где |
|---|---|---|
| `buildInterpreterEmailBody` (письмо с кодом) | 12 | Worker |
| `EMAIL_T` (письма потока программы) | **4** (uk/ru/es/en) | Worker |
| `CLIENT_CONFIRM` (подтверждение Expert-запроса) | 12 | Apps Script |
| `REPORT_LABELS` (PDF-отчёт) | 12 | Apps Script |

> ⚠️ `EMAIL_T` в Worker имеет только 4 языка — для писем потока программы
> (см. §9). Клиент на de/ja/ko получит письма-анкеты на английском (fallback `EMAIL_T.en`).

---

## 6. Счётчики и лимиты по тарифам

Источник истины — `getPlanLimits()` в `apps-script.js`. Тариф определяется по
содержимому колонки B (по подстроке, регистр не важен).

| Тариф | Срок подписки | Expert/отчётов | Окно лимита | Cooldown | Onboarding |
|---|---|---|---|---|---|
| **PRO** | 30 дней | ❌ нет доступа | — | — | нет |
| **EXPERT** | 30 дней | 2 разбора | скользящие 30 дней | 7 дней | нет |
| **ELITE-8W** | 56 дней (8 нед) | 8 отчётов | вся программа (`Infinity`) | 7 дней | **обязателен** |
| **ELITE-12W** | 84 дня (12 нед) | 12 отчётов | вся программа (`Infinity`) | 7 дней | **обязателен** |

Логика проверки в `handleExpertRequest`:
1. `EXPIRED` → отказ.
2. `!hasExpert` (PRO) → `no_expert_access`.
3. `recent.length >= max` → `monthly_limit` (EXPERT) или `program_limit` (ELITE).
4. Между запросами действует cooldown 7 дней → `cooldown_7d`.
5. Иначе — запрос принят, дата дописывается в кол. F.

Счётчик пользователю (`expert_used` / `expert_max` / `expert_next_at`)
приходит из `validateCode` при входе и обновляется после каждого запроса.
Отправленные PDF-отчёты логируются отдельно в кол. G (`handleSendReport`).

---

## 7. PDF-генерация и отправка

Два независимых механизма:

### 7.1 Клиентский PDF (самостоятельно, в браузере)

`downloadPDF()` → `_downloadPDFInner()` во всех `interpreter-*.html`:
открывает новое окно с версткой результата и CSS `@media print`, вызывает
`window.print()`. Пользователь сохраняет как PDF через системный диалог печати.
Без библиотек (нет jsPDF/html2pdf).

### 7.2 Серверный PDF-отчёт (backstage, EXPERT/ELITE)

`handleSendReport()` в Apps Script (вызывается Worker'ом после подтверждения
нутрициолога):
1. `DocumentApp.create()` — временный Google Doc.
2. Заполняет: заголовок, дата/тариф/неделя, профиль, биометрия, симптомы,
   вопрос клиента, текст разбора (уже переведён Worker'ом на язык клиента),
   подпись, дисклеймер. Заголовки локализованы (`REPORT_LABELS`, 12 яз.).
3. `docFile.getAs('application/pdf')` → экспорт в PDF.
4. `GmailApp.sendEmail()` клиенту с PDF-вложением.
5. `docFile.setTrashed(true)` — временный Doc удаляется.
6. Лог даты отправки в колонку G таблицы.

---

## 8. Внешние интеграции

| Сервис | Где | Что делает | Секреты / идентификаторы |
|---|---|---|---|
| **Hotmart** | Worker `/hotmart-webhook` | касса; webhook `PURCHASE_APPROVED`; матрица `product_id` | `HOTMART_TOKEN=vial-hotmart-2026` (заголовок `x-hotmart-hottok`) |
| **Anthropic Claude** | Worker | анализ ИП, AI-bullets, intake-разбор, перевод | `CLAUDE_API_KEY`; модель `claude-haiku-4-5-20251001`; prompt caching |
| **Google Apps Script** | web app | БД кодов (Sheets), письма (Gmail), PDF (Docs/Drive) | URL `…/AKfycbxaATfqaJoGYbLJcKnMX_450Sojm_tlfTIzY5mtUsshbPNnIZui00J-QRz0AZl50dkj/exec` |
| **Telegram** | Worker `/tg-webhook`, `/draft` | бот нутрициолога: карточки Expert/intake, inline-кнопки | `@viael_backstage_bot`; `TELEGRAM_BOT_TOKEN`; `NUTRITIONIST_CHAT_ID=383599103` |
| **Brevo** (Sendinblue) | Worker `sendEmail` | транзакционные письма (код, анкета, расписание) | `BREVO_API_KEY`; sender `viaelcom@gmail.com` |
| **Gmail** (Apps Script) | `GmailApp` | письма нутрициологу, подтверждения, PDF-отчёты | аккаунт `viaelcom@gmail.com` |
| **Cloudflare Workers + KV** | edge | хостинг Worker; KV `EXPERT_DRAFTS` (TTL 7д) и `PROGRAM_INTAKES` (TTL 90д) | wrangler `interpreter` |
| **Oura / Fitbit API** | фронт ИП | импорт биометрии (OAuth-токен в браузере) | токен вводит пользователь |
| **Google Fonts / Search Console** | сайт | шрифты; верификация `google4a96f72a66a53cca.html` | — |
| **GitHub Pages** | хостинг сайта | статика, домен `via-l.com` | `CNAME`, `.nojekyll` |

### Деплой

- **Сайт / ИП-страницы:** `git push origin main` → GitHub Pages (~1–2 мин).
- **Worker:** `cd interpreter && wrangler deploy`.
- **Apps Script:** вручную через script.google.com (автодеплоя нет).

### Cloudflare-инфраструктура — единый источник истины

> Зафиксировано 2026-05-30 после проверки дашборда Cloudflare (`dash.cloudflare.com` → Workers & Pages).

**Аккаунт:** `Viaelcom@gmail.com` (account subdomain: **`viaelcom`**, НЕ `viaelcom-gmail-s-a` — этот субдомен не существует и был ошибочно записан в одной из прошлых сессий).

**Активные воркеры:**

| Воркер | Production URL | Назначение | Деплоится из |
|---|---|---|---|
| **`interpreter`** | `https://interpreter.viaelcom.workers.dev` | основной: AI-прокси (`POST /`), Hotmart webhook (`/hotmart-webhook`), TG-бот (`/tg-webhook`, `/draft`), intake-API (`/intake-validate`, `/intake-submit`, `/schedule-session`) | `interpreter/cloudflare-worker.js` (+ `wrangler.jsonc`) |
| `vial-claude-proxy` | `https://vial-claude-proxy.viaelcom.workers.dev` | **legacy**, отдаёт 404. Никто из кода на него не ходит. Оставлен как есть, чтобы случайно не сломать что-то скрытое (можно удалить через `wrangler delete vial-claude-proxy` если решишь почистить) | — |

**Кто куда стучится** (после фикса 2026-05-30):

| Файл | Константа | URL |
|---|---|---|
| `interpreter/interpreter-via-l.html` | `AI_WORKER` | `https://interpreter.viaelcom.workers.dev` |
| `interpreter/interpreter-pro-expert.html` | `AI_WORKER` | `https://interpreter.viaelcom.workers.dev` |
| `interpreter/interpreter-elite.html` | `AI_WORKER` | `https://interpreter.viaelcom.workers.dev` |
| `program-intake.html` | `WORKER` | `https://interpreter.viaelcom.workers.dev` |
| `interpreter/apps-script.js` (Google Apps Script) | `BACKSTAGE_DRAFT_URL` | `https://interpreter.viaelcom.workers.dev/draft` |
| Hotmart panel (webhook на 4 интерпретатор-продуктах и 4 программы-продуктах) | — | `https://interpreter.viaelcom.workers.dev/hotmart-webhook` |

**Worker secrets** (через `wrangler secret put`, НЕ в `vars`): `CLAUDE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `NUTRITIONIST_CHAT_ID`, `BREVO_API_KEY`, `APPS_SCRIPT_URL`, `HOTMART_TOKEN`, `CAL_WEBHOOK_SECRET` (опц. — проверка подписи Cal.com webhook). `ZOOM_LINK` — БОЛЬШЕ НЕ ИСПОЛЬЗУЕТСЯ (legacy-код удалён 2026-06-01, секрет можно удалить).

**Worker KV bindings:** `EXPERT_DRAFTS` (TTL 7д), `PROGRAM_INTAKES` (TTL 180д).

> ⚠️ **Apps Script не деплоится автоматически** из репозитория. После любой правки `interpreter/apps-script.js` нужно: открыть `script.google.com` → проект интерпретатора → вставить новую версию → **Deploy → Manage deployments → New version**. Иначе backend будет работать на старом коде, а файл в репо — расходиться с реальностью.

---

## 9. Задачи и журнал выполненного

**Открытые задачи живут в ОДНОМ файле — [`tasks/TODO.md`](tasks/TODO.md).** Это единственный
живой список; закрытая задача удаляется оттуда, а факт выполнения фиксируется здесь (журнал
ниже) + детальная механика в соответствующем § `interpreter/ARCHITECTURE.md`. Прочитай
`tasks/TODO.md` в начале сессии, чтобы знать, что ещё не сделано.

### Журнал выполненного (что уже в проде + `main`)

- **2026-08-04** — **Эксперимент недели в EXPERT замыкает специалист, а не приложение.** Развилка:
  либо портировать петлю эксперимента в EXPERT, либо убрать обещание. Выбрано третье и, по-моему,
  верное: в EXPERT петлю и так замыкает человек — но специалист не видел, что клиенту предложено,
  и предложение повисало. Теперь воркер парсит `[[EXP]]` и дописывает к тексту, уходящему в карточку,
  строку «Эксперимент, предложенный клиенту на неделю: … (смотреть: sleepHours, hrv, stress)».
  Клиенту хвост по-прежнему не виден. В VIA-L всё как было: петлю ведёт приложение.
  Тогда же в обоих приложениях у секции «Анализы» появилась своя иконка (`_CAT.labs`,
  `ph-test-tube`, холодный лабораторный акцент) — ключа не было, и вместо иконки печаталось слово.

- **2026-08-04** — **Недельный разбор в EXPERT показывал служебный хвост.** Воркер добавляет к
  недельному разбору машинную строку `[[EXP]]{...}` — её читает петля эксперимента в VIA-L, и VIA-L
  её вырезает у себя (`_expCapture`). В EXPERT петли нет, и хвост с JSON уходил прямо в текст,
  который видит клиент. Теперь EXPERT режет его на входе (до записи в `viae_weekly_text`, иначе
  оседает в кэше), плюс одноразовая чистка уже сохранённых текстов. Заодно `_wrMd` в обоих
  приложениях: одиночные `*HRV*` превращаются в курсив (модель ставит их регулярно, раньше
  звёздочки были видны) и переводы строк — в абзацы, текст шёл одной простынёй.

- **2026-08-04** — **Карточка темы: «Что сделать» наверх, объяснения — под стрелку.** Действия лежали
  внутри [[D]] вместе с «Что происходит»/«Что в ваших данных», и человек, открыв тему, получал
  простыню, где то, ради чего он пришёл, было в конце. Теперь `_splitActions()` режет [[D]] по самому
  символу «☐» (не по переведённому заголовку — он на 12 языках): действия рисуются сразу под краткой
  мыслью в золотой рамке `.ai-sec-act` с собственной подписью `_actLbl()`, остальное — под «Подробнее».
  Осиротевшие подзаголовки («На этой неделе» без своей ☐) вычищаются. Гармошка «одна открыта» была и
  осталась. Проверено рендером живого разбора: 6 карточек, 6 блоков действий, 0 раскрытых по умолчанию.
  Тогда же: убран финал «Ваш анализ завершён + Скачать PDF-отчёт» (вопрос владельца «кому это нужно?») —
  функция `downloadPDF()` жива, блок вернуть из git; баннер импорта получил сплошной тёмный фон,
  подпись «Скорректируйте вручную» была нечитаемой на полупрозрачном.

- **2026-08-04** — **«Обсудить с человеком» под дневным результатом.** Из предложения соседнего чата
  взята идея, но не исполнение: кнопку в КАЖДОЙ шторке не делаем — показатели превратились бы в
  витрину, а медицински выглядящий вывод заканчивался бы продажей услуги (первое, к чему цепляется
  App Review). Сделан один сдержанный блок внизу результата, `_renderHumanCta()` рядом с `#aiDisc`.
  Порог — набранная личная база: **14 дней** (наш реальный порог `_pbTile`/`_hrvTileBase`, а не
  «17 дней» из того чата — цифра там взята с потолка). В **VIA-L** ведёт на внутреннюю витрину
  `my-specialist.html` («15 минут, бесплатно — знакомство»), в **EXPERT** — в чат со своим
  специалистом («он видит эти же данные»), витрина там бессмысленна. 12 языков, без обещаний
  результата. Причинные формулировки вида «это связано с пиками кортизола» отвергнуты: канон —
  паттерн, а не причина, привязанная к человеку.

- **2026-08-04** — **Перенесённые ответы больше не считаются пройденным блоком.** `_restoreAnswers()`
  подтягивает ответы прошлой сессии и клал их в `window.__touched` — а гейт заполнения смотрит ровно
  туда, поэтому блок («Энергия и образ жизни» и любой другой) горел зелёным, хотя человек сегодня
  ничего не вводил; кнопка разбора могла разблокироваться на вчерашних данных. Баннер «данные
  перенесены» убран в июле, механизм стал невидимым. Теперь перенесённые ключи дублируются в
  `window.__carried`: в разбор значения по-прежнему уходят (иначе стали бы «не указано»), но
  `_blockAnswered` требует поле, тронутое сегодня и не помеченное как перенесённое; реальный ввод
  снимает пометку. ⚠️ Грабли: восстановление текстовых полей диспатчит синтетический `input`, и
  слушатель снимал метку сразу после установки — метка ставится ПОСЛЕ dispatch. Оба приложения.
  Аудит блоков: единственный шаг без обычных полей — step15 «Пульс покоя» (только hidden `#rhr`,
  виджет сам зовёт `__touched.add('rhr')`), остальные 14 гейт видит.

- **2026-08-04** — **Возврат из OAuth для Polar/Withings/WHOOP.** У Oura (и в EXPERT у Fitbit) он
  был, у остальных — нет: в установленном приложении вход уходит в системный браузер и обратно не
  редиректит, поэтому обработчик `?polar=connected` не срабатывал и подключение зависало на
  «Подключаем…» навсегда. Теперь `connectWearable()` ставит метку `*_pending`, общий слушатель
  `visibilitychange` при возврате открывает вендор-панель и до-тягивает метрики по `sid`
  (токен уже в KV воркера), окно 10 минут; `fetchWearableLive()` метку снимает. Сделано в обоих
  приложениях (`vialp_*` / `viae_*`).

- **2026-08-04** — **Все три вендора отвечают.** После заведения секретов Polar владельцем и починки
  Withings проверка `/{oura,polar,withings}/start` даёт 302 на страницу входа вендора у всех трёх.
  Polar: секреты применились не сразу — первые запросы ~40 секунд отдавали `polar_secrets_missing`,
  это пропагация, а не ошибка. Живой приход данных не проверялся ни у одного вендора.

- **2026-08-04** — **Polar и Withings: «готово» в доках ≠ работает.** Проверка живыми запросами
  показала: `/withings/start` и `/polar/start` отдавали 500. Withings — секрет был залит **со
  значением в ИМЕНИ** (`WITHINGS_CLIENT_SECRET8d82…`), а у `WITHINGS_CLIENT_ID` в начале стоял
  пробел (в URL уезжал как `+83fe…`); перезаписаны правильно, кривой удалён, теперь 302 на вход
  Withings. ⚠️ Секрет засветился в имени — перевыпустить в кабинете Withings. Polar — секретов
  в воркере **нет вовсе**, нужен client_id/secret от владельца. В воркер добавлен `_sec()`:
  все вендорские секреты тримятся на входе (34 места) — пробел в секрете больше не ломает OAuth молча.
  Статусы в `interpreter/wearables/{polar,withings}.md` исправлены на фактические.

- **2026-08-04** — **Подготовка к App Store: support-страница, privacy manifest, США на витрине.**
  (1) `legal-app/support.html` под обязательный Support URL — 4 языка, `support@via-l.com`, FAQ,
  ссылка на политику; ни одной ссылки на сайт нутрициолога и на витрину (изоляция VIA-L).
  (2) `PrivacyInfo.xcprivacy` теперь создаётся `app/scripts/setup-ios.js` (папка `app/ios` в
  .gitignore, иначе теряется): tracking=false, собираемых типов нет, `UserDefaults`/CA92.1;
  файл надо один раз добавить в таргет App в Xcode. (3) Из `legal-app/privacy.html` вычищены
  несуществующие тарифы VIO/PRO во всех 12 языках. (4) **США на витрине:** `_isUS()` по часовому
  поясу — скрыты кнопка оплаты, сайт и контакты специалиста, остаётся бесплатное 15-минутное
  знакомство + строка `us_note` (12 языков) про лицензирование нутрициологов по штатам. Причина
  не в Apple, а в законах штатов; побочно снимает вопрос «продажа услуг мимо IAP».
  Чек-лист подачи — `docs/APP-STORE-SUBMISSION-CHECKLIST.md`.

- **2026-08-04** — **Политики разведены по продуктам (E3-хвост).** Раньше и VIA-L, и EXPERT вели на
  `legal-app/privacy.html` с обещанием «device-only, велнес-историю на серверах не храним» — для
  EXPERT это неправда, там данные лежат в карточке. Теперь: **VIA-L → `legal-app/privacy.html`**
  (device-only, туда добавлен абзац про MHMDA штата Вашингтон и про кнопку удаления, 12 языков);
  **EXPERT → `legal/privacy.html`**, куда добавлен раздел «7-бис. Данные о здоровье: хранение,
  выгрузка и удаление» (12 языков): два режима хранения, 90 дней после ведения, факт услуги 3 года,
  экспорт зашифрованной копией, удаление кнопкой. Под кнопкой удаления в обоих приложениях —
  ссылка «Как мы обращаемся с данными» на свою политику.

- **2026-08-04** — **Cron: данные о здоровье удаляются через 90 дней после ведения (E3 §5).**
  `eraseExpiredHealthData()` в `scheduled` (ежедневно 09:00 UTC, к уже висевшим `runDailyReminders`
  и `expireSpecialistAccess`): берёт карточки, у которых ВСЕ выдачи доступа закончились раньше
  отсечки `-90 дней`, и стирает разборы, биометрию, переписку, анкету, профиль, анализы, импорт —
  оставляя `erased`-снимок со счётчиками и пометкой `auto:1`. Карточки без выдач не трогает,
  повторно не обрабатывает (`if(d.erased) continue`). Факт услуги живёт 3 года и остаётся виден в
  акте `/service-act`. Проверка на проде до деплоя: под удаление сегодня 0 карточек.
  Смысл: политика обещает срок — его должен исполнять код, иначе обещание хуже отсутствия.

- **2026-08-04** — **Кнопка оплаты закрыта на языках без оферты.** Потребитель вправе получить
  условия на языке, на котором ему сделали предложение, а витрина работает на 12 языках, тогда как
  текст оферты будет на четырёх. `OFFER_LANGS = ['uk','en','es','ru']` в `my-specialist.html`:
  вне списка вместо кнопки — строка «условия пока на этих языках, переключите язык или запишитесь
  на знакомство» (12 языков). Список расширяется по мере перевода. Политика данных —
  черновик `docs/DATA-POLICY-CLIENT-DRAFT.md` (E3).

- **2026-08-04** — **Удаление данных о здоровье по требованию (GDPR ст.17 / CCPA / MHMDA).**
  Закон штата Вашингтон требует удаления именно ДАННЫХ О ЗДОРОВЬЕ, а не «аккаунта», поэтому кнопка
  отдельная. Воркер `POST /client/erase`: стирает из карточки разборы, биометрию, переписку, анкету,
  анализы, профиль — но записывает `data.erased` со снимком счётчиков (сколько разборов, сообщений,
  дата последнего). Акт `/service-act` берёт цифры из снимка, если данных больше нет: удаление не
  должно стирать доказательство оказанной услуги. Хранение «5 лет на всякий случай» этому праву
  противоречит — так не делаем.
  В приложениях кнопка «Удалить мои данные о здоровье» в секции «Резервная копия и удаление данных»,
  два подтверждения, 12 языков: **VIA-L** (`vlEraseHealth`) чистит всё пространство `vialp_*` на
  устройстве — серверной копии нет; **VIA-L EXPERT** сначала зовёт `/client/erase`, потом чистит
  `viae_*`/`vialp_*`, и при ошибке сервера ничего не удаляет локально.
  Тарифов два: VIA-L и VIA-L EXPERT — легаси-имя «PRO» в старых документах помечено баннером.

- **2026-08-03** — **Правовой контур в интерфейсе.** По разбору вопросов E4: кнопка оплаты теперь
  называет специалиста («Оплатить ведение у {Имя} →», 12 языков) — клиент не должен думать, что платит
  платформе; строка `catIndep` в каталоге переписана в оговорку в рамке (независимые подрядчики,
  платформа даёт софт и каталог, не гарантирует результат, не отвечает за действия специалистов);
  в галочку акцепта до оплаты влито подтверждение «мне есть 18», `OFFER_VERSION` → `offer-v2`;
  добавлено поле `specialists.insurance` (миграция `cabinet-step12-insurance.sql`) — страховка
  профответственности как преимущество в карточке, а не условие допуска (для украинского ФОП она
  недоступна), самодекларация. Разбор ответов и мои возражения — `docs/LEGAL-QUESTIONS.md`.

- **2026-08-03** — **Черновики договоров (E1+E2).** `docs/OFFER-CLIENT-SPECIALIST-DRAFT.md` —
  рамочная оферта маркетплейса: специалист поручает платформе транслировать типовые условия,
  клиент принимает их до оплаты, договор возникает между ними напрямую, платформа не сторона.
  `docs/AGREEMENT-PLATFORM-SPECIALIST-DRAFT.md` — платформа↔специалист: лицензия на КАБИНЕТ и право
  выдавать EXPERT, деньги (€30/мес абонплата `PLATFORM_FEE_EUR` + €20/мес софт за клиента из `grants`),
  стадии неплатежа `_accessStage`, indemnity, прямой запрет называться работником платформы,
  обязательство НЕ отключать уже выданные клиентские доступы при долге специалиста, DPA-раздел.
  Оба — черновики для юриста, вопросы ему собраны списком в конце каждого файла.

- **2026-08-03** — **Страна и юр. статус специалиста (основа международной схемы).** Договор
  клиент↔специалист заключается по праву страны специалиста, значит страна должна быть машинно-читаемой:
  миграция `cabinet-step11-jurisdiction.sql` добавила `specialists.country` (ISO-2) и `legal_form`
  («ФОП 3 гр.», «Autónomo»). Свободная строка «Город, страна» для этого не годилась. Поля правятся в
  карточке кабинета (публичный раздел), отдаются в `/specialists/public` и в акт `/service-act`.
  На витрине в «Подробнее о специалисте» — строка «Страна и статус» плюс пояснение: применяется право
  страны специалиста, но для резидента ЕС сохраняются императивные потребительские нормы его страны
  (Rome I ст. 6(2)). Клиент видит это ДО оплаты. Канон — `docs/OFFER-CLIENT-SPECIALIST-DRAFT.md`
  (рамочная оферта маркетплейса + динамическое Приложение №1). Там же зафиксировано, что оговорка
  «суд по месту ответчика» для потребителей ЕС ничтожна (Brussels I bis ст. 17–19) и барьером служат
  досудебная стадия, жалоба владельцу, акт и страхование профответственности.

- **2026-08-03** — **Акт-выгрузка по клиенту (D3).** В споре нужен не рассказ, а документ; данные и так
  логировались, не хватало сборки. Воркер `POST /service-act {code}` → `handleServiceAct`: `grants`
  (когда выдан доступ, срок, дней, отозван), KV `expert_access:<CODE>` (использовано/квота), карточка
  (`breakdowns`, `biometrics`, сообщений всего и от специалиста, дата последнего), `transfers` и данные
  специалиста с публично проверяемым регистрационным номером. Доступ: клиент — по своему коду карточки,
  специалист — только по своим клиентам, владелец — по любым. В кабинете кнопка «↓ Акт» в карточке
  клиента (`downloadAct()` собирает .txt и скачивает), i18n ×12. В хвосте акта зафиксировано разделение
  ответственности: платформа даёт программу, консультирует специалист.

- **2026-08-02** — **Добавки и анализы: модуль целиком.** *Анализы:* селектор паттернов давно читал
  `data.labs` (ТТГ, B12, глюкоза, HbA1c, CRP, ЛПНП, ApoB, ТГ, кортизол, витамин D), а вводить их было
  негде — карточка «LAB TESTS» осталась пустой заглушкой. Достроено: 11 полей в «Моём профиле» (не в
  дневной ленте — анализы сдают раз в полгода), переключатель единиц с пересчётом в каноническую
  (у витамина D шкалы расходятся в 2.5 раза, у глюкозы в 18 — иначе «глюкоза 100» читается как
  катастрофа), дата у каждого значения → в промпт уходит давность в месяцах, отсев опечаток на
  порядок. Хранение `vialp_labs`/`viae_labs`, в резервную копию. **Ферритин добавлен в селектор** —
  его не было вовсе, хотя для нашей аудитории он самый ценный (железо падает раньше анемии).
  *Добавки:* сквозной `KB_SUPPLEMENTS` (практика приёма, взаимодействия с лекарствами, вред без
  показаний, суммирование, чтение этикетки, анти-вуду, три ситуации «без анализов», потолок вместо
  дозы) + тема «Добавки» в разборе при поводе + **`_suppCrossChecks()`** — сверки считаются КОДОМ
  (чек-лист в промпте исполнялся через раз: 2–3 условия из 6, каждый прогон разные; кодом — 7 из 7).
  Источник: OpenEvidence N-11, `interpreter/Infa Cloude/E`. Канон вопросов и аудита —
  `docs/SUPPLEMENTS-EVIDENCE-QUESTIONS.md`. **Отвергнуто:** «пиши не дозу, а сколько раз по порции с
  упаковки» — порция на этикетке решение производителя, содержание её систематически превышает,
  потолок перебирают именно добавками. Даём частоту/время/разнесение (это не доза) + чтение строки
  «в одной порции» + потолок.
  *Три бага, каждый убивал безопасность молча:* де-медикализация превращала `thyroid` в «фактор
  энергии/обмена» → проверки взаимодействий были невозможны в принципе (класс лекарства теперь
  называем прямо); фильтр доз не знал B12/биотина/B-комплекса/железа; фильтр трав вырезал не только
  рекомендации, но и **предупреждения** об ашваганде, оставляя заголовок без текста.
  *EXPERT:* травы с дозой разрешены (фильтр туда и не заходил — глушила ложная строка «фильтр всё
  равно вырежет»), но только в связке с противопоказаниями; при противопоказании в данных клиента —
  не рекомендовать вовсе.

- **2026-08-02** — **Guardrail: перегенерация 9 из 10 была следствием собственного дисклеймера.**
  Очистка перед проверкой знала форму «не ЯВЛЯЕТСЯ медицинским диагнозом», а в дисклеймере стоит
  «не ЯВЛЯЮТСЯ» — одна буква, и слово-триггер «диагноз» оставалось в КАЖДОМ ответе: платный
  self-check на каждом разборе, треть расхода на переписывание уже написанного. Починено: дисклеймер
  вырезается предложением целиком по юр-маркерам; каузальные маркеры («означает», «прямое следствие»,
  «приводит к», «является причиной») гейтятся объектом-диагнозом — связывать метрики клиента между
  собой это задача разбора, а не claim; псевдо-формула «A + B = C» ловится только с медицинским
  объектом (под неё попадала наша же арифметика суммирования добавок). **`ai_usage.note`** пишет,
  какой фрагмент сработал и с каким контекстом → причина перегенерации перестала быть невидимой.

- **2026-08-02** — **App Review: плашка про дозировки и прозрачность источника.** «Не является
  медицинским диагнозом. Проконсультируйтесь с врачом перед изменением дозировки лекарств или
  добавок» дописывается **кодом**, когда разбор задел лекарства/добавки/анализы (инструкция в
  промпте для такого не годится — на строке «На чём это основано» видели, как она молча теряется на
  неделю). Прозрачность: каждая сверка обязана называть источник словами клиента («вы указали, что
  принимаете…», «по введённому вами анализу ТТГ»). Маркеры плашки внесены в очистку guardrail.
  Сторож дубликата сперва искал слово «дозировка» и глушил плашку, когда модель употребляла его в
  обычном тексте — теперь проверяется маркер самой плашки.

- **2026-08-02** — **EXPERT: строка «На чём это основано» не выводилась в проде НИ РАЗУ.**
  `_STRUCTURED_FMT` жёстко задаёт разделы внутри `[[D]]` и объявлен перекрывающим — требование из
  `EXPERT_EVIDENCE_MODE` молча терялось. Приписка в конец промпта тоже игнорировалась (два прогона —
  ноль строк). Сработало вживление требования **внутрь описания структуры** (`_structuredFmtExpert()`):
  6 тем из 6. Правило на будущее — [[project_prompt_rules_placement]].

- **2026-08-01/02** — **Кабинет: бухгалтерия владельца.** Сумма к оплате жила только в KV-записи
  доступа с TTL «срок + 60 дней» — запись о деньгах самоуничтожалась через два месяца после ведения,
  и перебрать её по специалисту было нельзя. Теперь KV отвечает за доступ, D1 — за деньги: журнал
  выдач `grants` (пишется при выдаче/продлении/отзыве; отозванные остаются — за отработанное
  начислено), журнал оплат `payments` (владелец вносит руками), `specialists.platform_since` (пусто =
  абонплату не начисляем) + **поле для его правки в карточке специалиста**, бэкфилл журнала из
  карточек клиентов. Вкладка «Бухгалтерия» (owner-only): клиенты, ведения, дни, начислено за софт и
  платформу, оплачено, долг, расшифровка построчно, отметка оплаты, CSV. Месяцы в селекторе — от
  реального начала платформы, а не «минус год от сегодня». Схема: `interpreter/cabinet-step9-billing.sql`.

- **2026-08-01** — **Экономика токенов: учёт расхода + KB по паттернам.** Две части.
  *Учёт:* API возвращает фактический расход в каждом ответе, мы его выбрасывали — экономика тарифа
  обсуждалась на оценках. `logUsage()` пишет в D1 `ai_usage` (схема и готовые запросы —
  `interpreter/ai-usage-schema.sql`, применена на боевой БД): маршрут, модель, тариф, язык, входные/
  выходные токены, запись и чтение кэша, стоимость по прайсу. Строка обезличена (ни кода, ни
  клиента, ни текстов), пишется в фоне и не имеет права ронять ответ. Подключено к `analyze`,
  `day-plan`, `weekly/monthly-report`, `ai-memory`, обоим вызовам guardrail, `advisor-chat`,
  `care-translate`. *KB по паттернам:* раньше в КАЖДЫЙ разбор уходила вся библиотека (~160k симв,
  порядка 60–70k токенов), хотя `selectKBPatterns` уже определял 2–4 темы этого человека — девять
  десятых модель не использовала, а платили мы за всё, ещё и с надбавкой за запись в кэш, который к
  следующему визиту (раз в день) протухал. Монолит разбирается regex-ом на карту `id → блок` один
  раз на изолят (34 темы), `buildWellnessKB(ids)` вкладывает шапку с правилами + только выбранное.
  На живых профилях выходит **6–18%** прежнего объёма. Ни одного узнанного id → фолбэк на полную
  базу. Ссылки «см. P-F17» на невложенные темы объявлены игнорируемыми (не додумывать). `/ai-memory`
  получает только шапку: там на выходе короткий JSON, содержимое тем не цитируется.

- **2026-08-01** — **Цепочка и «почему это обычно работает» (VIA-L).** Три входа в дневной разбор:
  (1) накопленная AI-память (`vialp_ai_memory` → `data.ai_memory`, как в EXPERT) — разбор опирается
  на закреплённое, не предлагает заново то, что человек делает, и называет ОДИН следующий шаг;
  память теперь обновляется и на **недельном** каденсе (раньше только месячный — цепочка просыпалась
  слишком редко, чтобы дневной разбор её видел); (2) активный эксперимент недели (`data.experiment`,
  «идёт N-й день») — дневной разбор не советует параллельное в ту же сторону и не подводит итог сам,
  это дело недельного; (3) `VIAL_MECHANISM_MODE` — зеркало `EXPERT_EVIDENCE_MODE` для тарифа, где
  называть доказательную базу нельзя: к каждой рекомендации короткое «почему это обычно работает»,
  механизм бытовым языком, как общее правило про людей («еда позже даёт телу переваривать ночью, и
  сон чаще становится рваным»), без исследований, процентов, сроков и без превращения механизма в
  замер/диагноз. Подключается при `isWellness` в `/analyze` и `/day-plan` (в `/ai-memory` не нужен — там JSON).

- **2026-08-01** — **Личная база на плитках дня (VIA-L).** Механика «вы против вас» в приложении
  была (`_pBase`/`_pNorm`/`_pFreq`, `docs/PERSONAL-BASELINE-RECON.md`), но клиенту почти не
  показывалась: плитки говорили языком возрастных таблиц. Добавлен `_pbTile(field)` — медиана
  последних 30 записей `vialp_daily` БЕЗ сегодняшней, минимум 14 значений — и строка `_pbLine`
  под плитками «Восстановление» (HRV), «Качество сна» и «Пульс покоя»: «обычно у вас 59 · сегодня +4».
  Пульс покоя при набранной базе **перестаёт мериться возрастным диапазоном**: вместо «в пределах
  нормы» (ничего не говорит человеку с постоянным пульсом 48 или 72) — «как обычно у вас / выше /
  ниже вашего обычного», порог max(3 уд, 5% базы); без базы остаётся прежняя таблица. Балл и индекс
  не тронуты. i18n `_PB_T` ×12.

- **2026-08-01** — **Петля эксперимента (VIA-L).** Недельный разбор и раньше кончался ОДНИМ
  экспериментом, но к нему никто не возвращался: каждый день начинался с нуля, человек не видел
  последствий собственных действий. Теперь разбор отдаёт последней строкой служебный
  `[[EXP]]{"what","metrics"}` (только недельный, не месячный; ключи из белого списка
  `sleepHours/deepMin/rhr/hrv/spo2/energy/stress/hf`) — клиент вырезает её из текста, запоминает
  формулировку и **снимок личной базы за 7 дней до**. Через 7 дней карточка `#rd-exp` на экране дня
  (над трендами) показывает «до → после» по его же `vialp_daily`: «Сон 6:24 → 7:01, +37 мин».
  Пока идёт — одна строка «день 3 из 7» + какие метрики смотрим. Δ по-человечески: сон в минутах,
  приливы в днях/неделю. Итог уходит в следующий разбор (`exp` в `/weekly-report`), и модель обязана
  **открыть** им разбор: назвать, что человек делал и что сделали его цифры, не предлагать то же
  повторно, а строить следующее звено. Юридически чисто: описание собственных чисел клиента,
  без вывода о здоровье (подпись под итогом это и говорит). Хранение `vialp_experiment` +
  журнал закрытых `vialp_exp_log` (12), оба в резервную копию. Специалисту в кабинет разбор
  уходит уже без служебного хвоста.

- **2026-07-20** — **Тренды за 30 дней + чистка профиля + фиксы смены языка (VIA-L).**
  *Тренды:* новая карточка на экране разбора под лентой недели — строка на метрику
  (иконка · значение · Δ к среднему словами · спарклайн · % справа), источник `vialp_daily`,
  окно считается на показываемый день. Метрика с <3 точками не рисуется, нет данных — карточки нет.
  Полярность зашита (рост пульса покоя = ухудшение), температура нейтральна и без процентов
  (процент от отклонения около нуля бессмыслен). Линии единым золотом — цветом говорит только
  дельта (зелёный / янтарный «внимание» до 5% / красный), всегда рядом со знаком, не цветом одним.
  Тап по строке — крупный график с осью и мин/макс. Всё inline-SVG, без библиотек.
  *Профиль:* «По дням» лишилась приборных плиток (их заменили тренды), осталась строка
  субъективных ответов — того, чего в трендах нет; блок стал обычной сворачиваемой секцией
  `_vcSec` (`_renderDaily` → `_dailyInner`, отдельный `#dailyList` удалён) и встал перед
  «Правовой информацией», которая снова последняя.
  *Фиксы:* смена языка на разборе перерисовывает день **из снимка** `vialp_days`
  (`window.__snapDay` + `_renderDayFromSnap`), а не пересчитывает из полей формы — из-за этого
  разбор «переезжал» на вчера; панель «Данные с трекера» при смене языка обновляется только
  если уже видима (`renderGadgetPanel()` сам ставит `display:block` и всплывал поверх утренней
  карточки); утренняя карточка — статичный экран, футер и «Конфиденциальность · Условия»
  прижаты к низу (`body:has(#morning-gate)`, без класса и его снятия в трёх местах);
  ✕ в «Мой профиль» вызывал `navTo('home')` = `startFunnel()`, т.е. закрытие профиля запускало
  проход — теперь `navTo('today')`. Коммит `2d2efed`.

- **2026-07-20 (b)** — **Экспорт: «Скачать памятку дня» убрана, в разбор добавлено имя клиента.**
  Кнопка удалена в обоих местах вместе с `downloadDayPlan()`: она не скачивала, а открывала окно
  на печать (`window.open`+`print` — в WebView не работает), дублировала то, что и так на экране,
  и была однодневной. Сама памятка на месте. «Скачать разбор» (недельный + месячный) оставлен —
  настоящий Blob `.txt`, markdown зачищается, заголовок на языке интерфейса, ключ `dl` во всех
  12 языках (месячный наследует его от недельного через `Object.assign`). Добавлено имя клиента
  из профиля — и в имя файла (`VIA-L-weekly-Игорь-Даценко-2026-07-20.txt`), и первой строкой
  внутри: специалист видит, чей файл. В имени файла чистятся `/ \ : * ? " < > |` и управляющие
  символы, внутри имя как есть; без профиля — прежний формат без пустых дефисов. Обе выгрузки
  сведены на общую `_dlReport()`. Коммит `196bbd9`.

- **2026-07-14 (d)** — **Единый App-Store-safe модал «Важно» (consent) в VIO+PRO, 12 языков.** Текст владельца
  (нейтральный, юридически корректный): информационный характер → назначение (здоровые привычки, анализ
  образа жизни, персонализация по данным пользователя и «при наличии» совместимых устройств) → «не
  медицинское изделие, не для диагностики/лечения/профилактики/мониторинга, не заменяет врача, не для
  медицинских решений» → «консультируйтесь перед изменениями, не игнорируйте врача». Правки при вшивке:
  ¶4+¶5 склеены, в EN добавлено «cure» (боилерплейт diagnose/treat/cure/prevent), чекбокс → «Я ознакомился(ась)…
  и принимаю условия использования». Абзацы через `<br><br>` (data-t применяется innerHTML). В PRO удалён
  поздний _APP-оверрайд consent_body («основаны на масштабных научных исследованиях» — красный флаг
  модерации), канон живёт в D-IIFE; тот же текст автоматом в секции «Правовая» карточки (`t('consent_body')`).
  EXPERT/ELITE модала согласия не имеют (гейт кода Hotmart, вне App Store) — не трогались.

- **2026-07-14 (c)** — **Разделение localStorage тарифов (баг владельца: проход в PRO появился в карточке
  VIO).** Все четыре продукта живут на одном origin (via-l.com) и делили ключи `vial_*` — данные текли между
  тарифами. Теперь: **VIO остаётся на `vial_*`** (вся накопленная история у него), **PRO → `vialp_*`**
  (чистый старт, без миграции — смесь VIO/PRO в старых ключах не тащим; старые .vlbackup с ключами `vial_*`
  импорт принимает через legacy-маппинг), **EXPERT → `vialx_*`**, **ELITE → `viale_*`** (+ одноразовая
  миграция-IIFE перед `const T={`: копирует старые `vial_*` → новые, клиентские данные/история целы; гейт
  кода — sessionStorage, вводится за сессию как раньше). Общими намеренно остались только `vial_lang` /
  `vial_lang_manual` (их читает shared `app-mode.js`) и имя файла экспорта `vial_history_*.json`.
  ⚠️ Канон на будущее: **новые ключи хранения в PRO/EXPERT/ELITE — только с префиксом тарифа**
  (vialp_/vialx_/viale_); `vial_*` = зона VIO.

- **2026-07-14 (b)** — **PRO: полнота импорта гаджетов — «каждый гаджет отдаёт ВСЁ, что умеет» (принцип
  владельца).** Дотянуты наши разрывы: **Fitbit OAuth** (воркер `handleFitbitMetrics`: + skin-temperature
  → tempDev, cardio-fitness-score → vo2; типы терпимы к отказу — gh() при 4xx отдаёт []; ⚠️ воркер требует
  отдельного `wrangler deploy`); **Fitbit токен-путь** (+ SpO₂/temp-skin/cardioscore за 7 дней, каждый fetch
  терпим — нужны scopes у Personal App); **Fitbit Takeout-JSON** (+ spo2/tempSkin/cardioScore);
  **Apple XML** (+ SpO₂ HKQuantityTypeIdentifierOxygenSaturation ×100; + температура запястья
  AppleSleepingWristTemperature — абсолютные °C → tempDev = последняя ночь минус медиана выгрузки);
  **Whoop CSV** (+ Blood oxygen % → spo2, Skin temp → tempDev-девиация; ⚡фикс реального бага: селекторы
  колонок были с точками `heart.rate.variability`, а заголовки Whoop с пробелами — HRV/пульс/готовность
  вообще не матчились; smoke node: парсится); **Xiaomi JSON** (+ spo2 — доровнён до CSV-пути);
  **Oura файл** (+ daily_spo2). Превью импорта: добавлен слот SpO₂ (не показывался). Подписи всех карточек
  источников приведены к тому, что реально импортируется (fitbit/apple/whoop/samsung −ЭКГ/withings −Вес/
  garmin, 12 языков + инлайн-дефолты). Труба до ИИ проверена: все 8 метрик в `device{}` анализа + `_saveDaily`.
  Вендорские пределы (не наши): Samsung не экспортирует HRV; Fitbit Daily Readiness — только их премиум-API.
  **Зеркало EXPERT/ELITE СДЕЛАНО в тот же день** (interpreter-pro-expert.html + interpreter-elite.html:
  код-якоря совпали 1:1, подписи адаптированы под их формулировки (ЧСС/ВСР); node-чек + smoke парсеров ок;
  SpO₂-слот в превью там уже был). **Воркер задеплоен** (`wrangler deploy`, версия f5928b6d, /fitbit/metrics
  отвечает). Остаток: живой прогон OAuth-путей владельцем (поля Google Health API по temp/vo2 подобраны
  терпимо, точную форму покажет FITBIT-DEBUG в логах воркера).

- **2026-07-14** — **PRO: карточка «Мой профиль» = внутренности VIO (interpreter-via-l.html).** Порт
  `renderCard` VIO 1:1 (золото вместо фиолета, localStorage вместо `_SEC`): hero (имя Oswald 600/24 +
  пол·возраст + прогресс-бар заполнения + «В программе с») + энергетический ориентир ккал; 13 раскрывающихся
  секций `_vcSec`/`_CAT` (Phosphor-иконки, все закрыты, порядок профиль→инструменты); Baseline и мини-тренды
  Динамики на гаджет-метриках (`hrv`/`sleepHours`/`rhr`/`energy` + вес/талия — добавлены в `_saveDaily`);
  «Памятка дня» в карточке (те же `_bpChapters`); «История разборов» из `vial_ai_daily` (рендер `_aiMd`,
  структурный `_renderAnalysis` — остаток); месячный AI-разбор + AI-память «Что ИИ запомнил»/«Зоны внимания»
  (`weeklyTrend(win)`, `/weekly-report period:'month'`, `/ai-memory tier:'pro'`); «Изменить профиль» →
  полная лента в `__editMode` (обход гейта 1/день, футер «Сохранить и вернуться»); `saveProfile` переведён
  на VIO-стиль keep-prev (пустой DOM на перезагрузке больше не перетирает профиль) + дособраны act/стресс/
  gsm/cort/lifestyle_notes/goal/priorities/created. Панель карточки = порядок VIO (weekly/monthly/aiMemory
  над cardBody), PRO-специфика «По дням» (`_renderDaily`) сохранена, экспорт/импорт JSON заменён vlBackup.
  `node --check` всех блоков ок, дублей функций нет.

- **2026-07-13** — **PRO = строение VIO (interpreter-via-l.html, сессия «задача PRO»).** (1) Единая лента
  с зонами каденса VIO (`FLOW_ALL=[0,7,9,2,3,5,6,1,8,14,10]`, `_NOW=[1]`, двухстрочные `_flowHead` 12 яз,
  flow-intro); мёртвый 2-стадийный `showDaily/showWeekly` удалён. (2) Гаджет-приоритет: `_AUTO_STEP_METRIC=
  {1:'hrv',3:'sleepHours'}` — приборные шаги HRV/Сон вернулись в ленту и авто-скрываются при импорте
  (`_reflowSteps` из `closeImport`/`_gRefresh`). (3) Гейт «1 проход/день» + ЛОКАЛЬНЫЙ `_dayKey` (6 UTC-ключей
  заменены; Fitbit API — внешний, оставлен). (4) Памятка дня: порт blueprint-стека VIO (главы, `_DISH`+фото
  `[dish:KEY]`, тарелка+«Принцип VIA·L», кэш `vial_day_plan` 1×/день, печать) на `tier:'pro'`, localStorage
  вместо шифрослоя, золотая палитра; кэш разбора `vial_ai_daily` подключён к fetchAIAnalysis. (5) Нав-паритет:
  топбар без ссылок на маркетинг-index (App Store), лого=«домой», футер 4 таба Подход·Сегодня·Наставник·Карточка
  (phosphor), модалы approachPanel/dayplanPanel/circModal. (6) Косметика: убраны pulse-rings+ECG-анимации,
  фикс step6 (шапка «Когниция» вместо «Биоимпеданс»), step14 undefined-статики. Память: project-pro-vio-parity.

- **2026-07-13** — **VIO «Памятка дня»: фото блюд (a97486f, воркер `1d8ed8d4`).** 22 webp
  (`interpreter/food/`, 512px ~23КБ, из PNG владельца по `docs/FOOD-PHOTO-SPEC.md`); воркер `/day-plan`
  получил каталог в промпте и метит variants-пункты `[dish:KEY]` (в пост-фильтре метка снимается ДО
  `_stripCodeTokens` — иначе он выгрызал `bf_*` — и возвращается); клиент: `_DISH`+`_dishOf` →
  карточка варианта = фото 74px + текст ИИ + строка ≈Б/Ж/У; метка счищена в обычных пунктах и печати.
  Фолбэк без метки — текстом. Живой smoke: 17/17 вариантов с метками. Хвост: паритет PRO.
- **2026-06-20 (b)** — **ELITE: приём+анализ данных = PRO (A1–A4 + дневной агрегатор, зеркало expert).**
  A1 гаджет-панель (золото) → A2 редактируемые плитки + `vial_imported` → A3 когниция pro-формат
  (`_mapMem`/`_mapFog`, cogndur убран) → A4 убран лишний `hotfreq` (у elite `hf_count`/`hf_intensity`
  уже эмитились → pro-ветки приливов были живыми) → `_saveDaily`/`_weeklyDaily` + `daily` в `/weekly-report`.
  Обкатанная связка ELITE (Zoom/Cal.com-эмбед, PDF `generatePDF`, Google Apps Script заявки) — НЕ тронута.
  `node`-чек ок, баланс div ровный. Остаётся VIO (отдельная модель) + общий дизайн-проход A5.
- **2026-06-20** — **EXPERT: приём+анализ данных доведён до паритета с PRO (A2–A4 + дневной агрегатор).**
  Канон: EXPERT = PRO + слой специалиста; обкатанные пост-шаговые кнопки (заявка `sendMaxRequest`,
  гейт `APPS_SCRIPT_URL`, CTA) НЕ трогали. **A2:** гаджет-панель → редактируемые плитки (`_gEdit`/`_gSave`)
  + персистентность `vial_imported` (восстановление при перезагрузке). **A3:** когниция → pro-формат
  (память 1–10, туман Да/Нет) через `_mapMem`/`_mapFog`; вход упрощён, но инсайт-ветки
  (`data.memory==='severe'`, `data.fog==='constant'`) матчатся без изменений; `cogndur` убран. **A4:**
  приливы — в payload добавлены `hf_count`/`hf_intensity` (ожили дремавшие pro-ветки `data.hf_count==='high'`),
  убран лишний `hotfreq`. **Дневной агрегатор:** `_saveDaily`(хук в `saveSession`) + `_weeklyDaily`
  (идентичен pro — поля сошлись), `daily` прокинут в `/weekly-report` (воркер уже принимает). Каждый
  юнит: бэкап + `node`-чек + тест владельцем на живом → пуш. Родословная: expert = старый pro (один
  коммит 17.05), pro ушёл вперёд в июне. План — `tasks/TODO.md` §0 Этап A (A5 каденс — опц.). Дальше: ELITE.
- **2026-06-19 (b)** — **EXPERT, юнит 1 порта из PRO: read-only гаджет-панель.** Установлена
  родословная: `interpreter-via-l.html` и `interpreter-pro-expert.html` родились одним коммитом
  (`f9ed143`, 17.05), различались 57 строк; pro пересобран в июне (гаджет-панель/каденс/`vial_daily`),
  expert застрял на старой базе + получил онбординг/счётчик. Метод — **forward-port интейка pro в
  expert, результат-экран/кнопки (заявка `sendMaxRequest`, гейт, CTA, Cal.com у elite) не трогаем.**
  A1: панель «Данные с трекера» (8 окошек, read-only зеркало `importedData`, синий акцент, ×12 языков,
  сверху потока, видна только при наличии данных) — CSS `.gp-*`, `_GMETA`/`_GLAB`/`renderGadgetPanel`,
  рендер в `applyImportedToSliders`/`updateImportSummary`/`setLang`. Чисто аддитивно, движок анкеты не
  тронут. `node`-чек ок, в проде. План — `tasks/TODO.md` §0 Этап A.
- **2026-06-19** — **Недельный AI-разбор расширен на `vial_daily` + профиль (PRO).** Раньше разбор
  опирался только на 7 числовых полей `vial_history` (`weeklyTrend`), не видя половины внесённого за
  неделю. Добавлен клиентский агрегатор `_weeklyDaily()` (`interpreter-via-l.html`): за 7 дней из
  `vial_daily` — приливы (дней + модальная частота/интенсивность), `tempDev`/`spo2`/`stress`/`memory`
  средние, дни тумана/алкоголя; + контекст `vial_profile` (фаза/ПМС/диета/режим питания). Прокинут в
  `/weekly-report` как `daily` рядом с `summary`. Воркер `buildWeeklyUserMessage(summary, daily, lang)`
  дописывает «Daily detail» + «Client context», строка в `weeklySystem`. Обратно совместимо (без
  `daily` — прежнее сообщение, EXPERT-кабинет не задет). `node --check` обоих, воркер задеплоен
  (Version `750c4fd1`), клиент запушен. Детали — `interpreter/ARCHITECTURE.md` §4.8/§5.7. ⏳ при
  желании — перенести `_weeklyDaily` в expert/elite (когда туда приедет дневной сбор vial_daily).
- **2026-06-12 (c)** — **Прямая интеграция Oura Ring (OAuth2) построена и задеплоена.** Выяснилось
  (офиц. доки), что партнёрство для кодов НЕ нужно — регистрация приложения самообслуживающая
  (дефолт 10 польз.; одобрение только для >10, его Becky отклонила). Владелец зарегистрировал
  приложение, Client ID заложен (`wrangler secret put OURA_CLIENT_ID`). В воркере — роуты
  `/oura/start|callback|metrics` (`handleOura*`, по образцу WHOOP: OAuth2 + refresh, KV `oura:<sid>`,
  scopes `personal daily heartrate workout spo2`). Метрики 7-дн: HRV=`average_hrv` (ночной RMSSD —
  «настоящая» цифра кольца), RHR=`lowest_heart_rate`, сон/deep, SpO2, readiness→energy, +
  **тренировки** (`/v2/usercollection/workout`). Фронт (pro/pro-expert/elite): кнопка «🔗 Подключить
  кольцо Oura» в карточке Oura — self-contained `_ouraUI`/`connectOura`/`fetchOuraLive` (12 языков,
  синхрон в `setLang`), generic-флоу `connectWearable` не трогали. Воркер `c3cb99c0`, `node --check`
  ОК на воркере + 3 JS-блоках. ⏳ Остаётся: владелец кладёт `OURA_CLIENT_SECRET`, живой OAuth-тест +
  сверка имён полей Oura v2; фаст-фоллоу — завести тренировки в `buildUserMessage`. Детали —
  `interpreter/wearables/oura.md`.
- **2026-06-12 (b)** — **KB-дообогащение N-3: андропауза × носимые метрики (честность вывода).**
  Из подборки `interpreter/Infa Cloude/N-3` (20 txt по тестостерону) вытянут самый продукт-релевантный
  пласт — связка HRV / пульса покоя / восстановления / стресса с тестостероном, которой в KB не было.
  Новый раздел П-М1 §7 в `knowledge-base.md` + сжатая «честная рамка» в `SYSTEM_PROMPT` воркера (P-M1):
  пульс покоя с T НЕ связан (менделевская рандомизация); HRV — НЕспецифический маркёр (при дефиците T
  снижен, но через воспаление, не напрямую; нет популяционных данных, связь U-образная) → трактовать
  как поддерживающий сигнал, не диагноз; стресс-связанное падение T (стресс/дефицит энергии/недосып/
  перетрен) ОБРАТИМО (центральная адаптация, лаг кортизол→T ~0.5–3 дня) → сначала чинить сон/энергию/
  стресс, потом оценивать T; HRV-направленная нагрузка (тяжёлое только по восстановленному ночному
  RMSSD). Воркер задеплоен (version `22e42d38`), `node --check` ОК. Также: лёгкие текстовые подборки
  N-1/N-2/N-3 выведены из-под `.gitignore` (исключения; тяжёлый провенанс типа «Perry Academi» ~882 МБ
  остаётся локальным) — чтобы не терялись при переносе репо.
- **2026-06-12** — **Недельный AI-разбор динамики (PRO/EXPERT/ELITE) + его доставка специалисту.**
  Новый эндпоинт воркера `/weekly-report` (`handleWeeklyReport`): принимает 7-дневную сводку
  (`weeklyTrend()` → средние + дельты к прошлой неделе), отдаёт связный разбор 4–6 фраз (что
  улучшилось / просело / вероятная причина / один фокус-эксперимент), образовательная рамка, без
  диагнозов и личных имён; роутинг модели как в `/analyze`. На клиенте (pro/pro-expert/elite, блок
  `_wrUI`/`_wrGate`/`renderWeeklyReportUI`/`genWeeklyReport` под `#weeklyReport`) — кнопка «Получить
  разбор» с гейтом **1 раз/нед** на localStorage (`vial_weekly_last/text/date`), строки во всех 12
  языках. В EXPERT/ELITE запрос идёт с `code` → `cabinetIngestWeekly` кладёт тот же разбор в карточку
  как `breakdowns[type:'weekly']` (дедуп «не чаще 6 дней», UPDATE существующей карточки); в кабинете
  добавлен тип `weekly` в выпадашку (`bd_weekly` ×12). Механика — `interpreter/ARCHITECTURE.md` §4.8 +
  §5.7. Воркер задеплоен (version `13d68fff`), `node --check` ОК на воркере и на трёх извлечённых
  JS-блоках. Также в эту сессию: фикс HRV в `healthkit-bridge.js` — ночное усреднение SDNN в окне сна
  вместо «последнего сэмпла за 7 дней» (коммит `19025ea`).
- **2026-06-08** — **Платформа, Шаг 2 (хвост): веб-экран пациента «Мой специалист».** Новый
  самостоятельный файл `interpreter/my-specialist.html` (галактика/золото, 12 языков, дефолт
  EN/`vial_lang`, RTL для he): поле кода специалиста → debounce-превью «Вы подключитесь к …»
  через `/specialist-by-ref`; email (валидация) + имя (опц.) + чекбокс GDPR-согласия, текст
  которого подставляет имя специалиста (как `consentText()` в анкете при `?ref`); привязка —
  `POST /specialist/connect` (`ref_code`+`email`+`consent`), при `specialist_not_found` —
  отдельная ошибка; экран «подключено» + отзыв согласия `POST /specialist/unlink`; статус в
  `localStorage.vial_spec_link`. Бэкенд не трогали — ручки `/specialist/*` уже были в проде.
  Вход «🩺 Мой специалист» добавлен в топбар 4 интерпретаторов (`topbar_specialist`) и меню
  лендинга ИП (`nav_specialist`) — ключ во всех 12 языках на каждой странице (порядок языков
  разный: ru-первый в интерпретаторах, uk-первый в лендинге). Проверки: inline-JS
  `vm.Script` на 5 страницах, паритет 26 ключей×12 языков в новом файле. Это же — первый
  экран будущего app пациента (Capacitor). Коммит `6980867`.
- **2026-06-07** — **KB-дообогащение: партия `Infa Cloude/books new` (Perry Academy) влита в `knowledge-base.md` + `SYSTEM_PROMPT` воркера.** Из 40 PDF реально новых — 9 (остальное дубли `books/`). Темы: **скелетно-мышечный синдром менопаузы** (Wittstein, *Climacteric* 2024 — расширен P-F12: артралгия/замороженное плечо/тендиниты/саркопения, эстроген=регулятор воспаления, креатин 5 г, Fortibone-коллаген, DEXA на менопаузе/FRAX; кросс-связь в P-F8); **аллостатическая нагрузка/«weathering»** (J. Morgan, ACC 2024 — P-F13); **волосы/телесные изменения + SPF50** (Barbara Dehn — P-F14); **меноожирение/биология возврата веса** (Megha Poddar — P-F7); **здоровье груди и питание** (Cappuccino — новый KB-раздел REF-F + профилактический фрейминг в P-F2: алкоголь — сильнейший пищевой фактор риска, безопасной дозы нет). Атрибуция честная, дозы только из первоисточника. Воркер задеплоен (`wrangler deploy`), `node --check` ОК. Все хвосты закрыты в ту же сессию: (1) **P-F21 «Здоровье груди» → полноценный детектор-паттерн** (`add()` в `selectKBPatterns`, блок в `SYSTEM_PROMPT`, канон KB П-Ж21, PATTERN-REGISTRY) + новый вопрос Шага 12 «Здоровье груди» (масталгия/уплотнение/семейный анамнез, `data.breast`) в PRO+pro-expert+elite на 12 языках; (2) **OCR 354-МБ скана** (`ocrmypdf`, лекция E. Ward, ~90% дубль) → влиты только новые крупицы: холин 425 мг + мультивитамин/COSMOS (P-F10), NEAT + порог 1800 ккал (P-F7), железо 18→8 мг + танины чая (P-F18); (3) **WHI-transdermal** (NAMS *Menopause* 2014) → KB-блок «МГТ — рамка направления» (путь введения/тип прогестагена/тайминг; только KB — роль воркера запрещает обсуждать препараты). Воркер-версии: `9e05649d`→`5c49d33a`→`a138e354`→`1c3b3951`. Источники-PDF — провенанс в gitignore `Infa Cloude/`.
- **2026-06-06 (большая сессия)** — **Кабинет → ПЛАТФОРМА для многих специалистов + локализация
  (12 языков) + PWA + вид под профиль.** Всё в проде. Детали — обновлённый §11 + спеки
  [`docs/PLATFORM-MODEL.md`](docs/PLATFORM-MODEL.md), [`docs/MOBILE-APP-MODEL.md`](docs/MOBILE-APP-MODEL.md).
  - *Мелкие фиксы кабинета:* `deleteClient` шлёт `code` (не `id`) → удаление ручных карточек;
    `autoGenSchedule` спрашивает подтверждение (не стирает Cal-брони); `/cabinet/leads` прячет
    знакомства тех, у кого уже есть оплаченная карточка (по email) + guard `d.sharing===false` в ингесте.
  - *Платформа (Шаги 1–6, спека §8 PLATFORM-MODEL):* таблица **`specialists`** + колонка
    **`clients.specialist_id`** (миграции `cabinet-step1-specialists.sql`, `cabinet-step4-specialist-email.sql`,
    применены к боевой D1, бэкфилл на №1=основатель). Подключение пациента **по реф-коду + согласие**
    (`/specialist/connect|unlink`, `data.sharing/consent`). Многопользовательский **вход** (логин+пароль
    PBKDF2 `salt:hash`, сессия `{id,role}`, **видимость по `specialist_id`**, `cabinetOwns` → 403 на чужого,
    лиды только owner). **Абонплата специалиста** (`specialists.email`, `/specialist-access-webhook`
    Hotmart, cron `expireSpecialistAccess`). **Панель владельца** (`/cabinet/specialists|specialist-save|
    specialist-delete`, вид «🩺 Специалисты»). **Мост перевода** (`/cabinet/translate`, ИИ-черновик на
    языке специалиста, авто-перевод ответа на язык клиента при отправке, кнопки «🌐 Перевести»).
  - *Локализация кабинета — **12 языков*** (uk/ru/en/es/de/pt/fr/pl/it/he/ja/ko): движок i18n (словарь
    `T` key-major, `t()`/`tl()`, `applyI18n()` по `data-i18n`/`-ph`/`-title`, переключатель языка,
    `localStorage`). Локализованы вход, навигация, окна, боковая панель, все 9 вкладок, Календарь,
    панель Специалисты, статусы, confirm/alert и **PDF-отчёт на языке пациента** (`generatePDF`+`PDF_LOCALE`).
    ~275 ключей. he/ja/ko в переводе контента — через Sonnet. Язык кабинета = язык специалиста
    (`/cabinet-auth`→`lang`), владелец-ru не замечает миграции (фолбэк на ru).
  - *PWA:* кабинет — **устанавливаемое приложение** (`cabinet/manifest.json`, `cabinet/icon.svg`,
    `cabinet/sw.js` — офлайн-оболочка, network-first HTML, POST/cross-origin не трогает; кнопка
    «📲 Установить» на Android/десктоп + iOS-подсказка «Поделиться→На экран Домой»). iOS-значок пока SVG.
  - *Вид под профиль:* не-нутрициологам скрыты вкладки «Протокол»/«Анализы» (`applyTabProfile`,
    `specialty` из `/cabinet-auth` и `/cabinet/clients`).
- **2026-06-06** — Кабинет нутрициолога, **Этапы 2–5 + аудит + «полный функционал»** —
  ПОЛНОСТЬЮ в проде. Подробности и схема работы — новый **§11 «Кабинет нутрициолога»**.
  Кратко: ингест анкет в D1 (Этап 2); вкладки Биометрия/Сессии/Разборы (Этап 3);
  Переписка + ИИ-черновик + отправка в ТГ (Этап 4); поиск/группировка/статусы/мобайл (Этап 5);
  фикс `id=code` (анкетные карточки не открывались); живой «Обзор» вместо мёртвого
  прототипа; **карточка рождается при оплате** (Hotmart→D1); **автоингест данных ИП**
  (биометрика+ИИ-разбор по коду); **вид Календарь**; **бот-напоминалка (Cron 09:00 UTC)**
  с заботливым тоном, зовущим пройти ИП; **Cal.com-брони→карточка** + секция «Знакомства»
  (лиды). Ключевая ценность бота — **ЗАБОТА** (прописана в клиентских текстах).
- **2026-06-05** — Кабинет нутрициолога, **Этап 1 (фундамент)** — закрыты обе дыры прототипа.
  Хранилище: новый **D1** `vial-cabinet` (id `b4ee9324…`, биндинг `env.DB`), схема
  `interpreter/cabinet-schema.sql` (таблица `clients`: поля шапки новой модели + JSON-колонка
  `data` под досье вкладок до Этапов 2–4). Авторизация: пароль ушёл из HTML в секрет
  `CABINET_PASS`; воркер-маршруты `/cabinet-auth` (токен в `EXPERT_DRAFTS` `cabinet_sess:*`,
  TTL 12ч, rate-limit 8/10мин по IP) + `/cabinet/clients|save|delete` (Bearer-проверка, D1
  upsert по `code`); в CORS добавлен `Authorization`. Фронт `cabinet/index.html`: gate бьёт в
  воркер, CRUD через D1, кнопка «⇪ Імпорт» для разовой миграции из localStorage. Воркер
  задеплоен, эндпоинты прогнаны живым смоук-тестом (auth/list/save/delete). Спека —
  `docs/CABINET-MODEL.md`; следующий — Этап 2 (ингест анкет в D1).
- **2026-06-05** — KB мягкое обогащение из библиотеки Perry Academy (`Infa Cloude/books/`,
  план `LIBRARY-MAP.md`) — ВЫПОЛНЕНО полностью: физиология/образ-жизни/поведенческий фрейминг
  без новых доз/DOI, честная атрибуция (Shelby Harris, Laurie Mintz, Stacy Sims, Jayne Morgan,
  Barbie Boules, Mary Jane Minkin). Главы: P-F17 (КПТ-И + дифдиагноз СБН/СОАС/циркадный),
  P-F15 §5c (self-care + партнёрские, Mintz), P-F7 (критика диет-трендов), P-F12 (нагрузки как
  «внешний эстроген», иерархия интенсивности), P-F13 (связь сердце↔мозг), P-F11 (второй проход
  гормонов) + два кросс-блока: «Питание — частые мифы» и «МГТ — рамка направления». KB воркером
  не грузится — деплой не требовался, только `git push`.
- **2026-06-05** — KB нутри-кластер: всё имеющееся сырьё `Infa Cloude/N-1…N-5`
  переработано в `interpreter/knowledge-base.md` и сверено по первоисточникам.
  N-1→P-M1/M5/M6/M7/M8/M9; N-2→P-F2/F3/F4/F14/F16/F18; N-3→новые P-F19/P-F20/P-M11 +
  функц-ЖКТ в P-F11; N-4→P-F6/P-M5; N-5→P-F8/P-M4. Дальнейшее обогащение ждёт НОВЫХ
  выверенных обзоров от Игоря (необяз. мягкая ветка — Perry Academy `books/`, см. `LIBRARY-MAP.md`).
- **2026-06-05** — Reject-ветка Expert-разбора: при «❌ Отклонить» клиенту уходит вежливое
  письмо «нужна доработка» (`EMAIL_T.reject_subj/body`, uk/ru/es/en, ост.→EN); `sendEmail`
  возвращает результат; TG показывает статус отправки. Воркер задеплоен (version f1c26ebc).
- **2026-06-05** — Форма анкеты `book/anketa/index.html` переведена на все 12 языков
  (объект `TR`: en/es/uk/de/pt/fr/pl/it/he/ja/ko + ru=оригинал, 464 ключа × язык; pt —
  бразильский под флаг 🇧🇷). Валидация — Node-парсинг `TR` + сверка ключей с эталоном `en`.
- **2026-06-05** — Анкета: связка «один топик» через код доступа; анкета доставляется
  в письме-подтверждении EXPERT/ELITE (механика — `interpreter/ARCHITECTURE.md` §18.11).
  Это закрыло задачу «PRO+EXPERT анкета» (старый дизайн «тариф EXPERT в колонке B»
  откатан 0670dd5 и заменён доставкой по коду; обкатано вживую PRO+EXPERT + ELITE).
- **Аудит ИП — единый канон паттернов** — ветка `audit/ip-pattern-taxonomy` полностью
  влита в `main` (tip 2026-06-02, 0 уникальных коммитов): унификация таксономии, фикс
  KB-детектора, закрытие входных дыр и зеркалирование шагов в PRO-EXPERT/ELITE — в проде.
- **2026-06-04** — Цифровая анкета здоровья (форма `book/anketa`, 110 Q, ИИ-сводка,
  доставка нутрициологу + email; §18, §18.10). FAQ-память `faq:db` засеяна (409 пар, §16).
  Словарь фраз `CARE_PHRASES` расширен (7 ключей × 12 яз). Cal.com → письмо с анкетой
  при брони 60-мин (§18.10).
- **2026-06-03** — Канал ведения `@viael_care_bot` + Topics-супергруппа, автоперевод,
  `/anketa`, `/zoom` (§17). Честность вывода ИП (QoL, sanity биоимпеданса, чекбоксы,
  карточка биозагрузки). VIO Pro-апселл на 12 языков.
- **Программный бот онбординга** (в проде с 2026-05-30): Hotmart webhook → email →
  анкета → TG-карточка нутрициологу. Поток программ переведён на `book/anketa`;
  `program-intake.html` оставлен дремлющим намеренно.
- **Носимые:** Fitbit (Google Health API), Polar, Withings — в проде (§16).

---

## 10. Механика работы Интерпретатора — operational handbook

> Зафиксировано 2026-05-30 чтением `cloudflare-worker.js`, `apps-script.js`,
> `code-generator.html` и 4 интерпретатор-HTML. Все цифры/URL/обработчики
> сверены с актуальным кодом. **Этот раздел читается каждой новой сессией —
> не выдумывай альтернатив, ground truth здесь.**

### 10.1 Кнопки на результирующей странице — по тарифам

| Тариф | Кнопки в `stepResult` | JS-обработчик | Что делает |
|---|---|---|---|
| **VIO** (`interpreter-vio.html`) | `restart` · `downloadPDF` · `navTo('history')` · `navTo('home')` | стандартные | пройти заново · скачать PDF · перейти в историю · перейти на главную |
| **PRO** (`interpreter-via-l.html`) | `restart` · `downloadPDF` · `navTo(history/home)` · `checkCode` (re-auth) · `toggleGateVis` · `sendMaxRequest` (показывается?) | те же + Expert-блок если код активен | то же + кнопка «Pro+Expert» — апсейл-форма (запрос разбора нутрициолога), отправляет на Apps Script `?action=expert` |
| **PRO+EXPERT** (`interpreter-pro-expert.html`) | `restart` · `downloadPDF` · `navTo(history/home)` · `sendMaxRequest` | те же | то же + основная функция: `sendMaxRequest()` шлёт письменный запрос разбора (до 2 в окне 30 дней, cooldown 7 дней) |
| **ELITE** (`interpreter-elite.html`) | `restart` · `downloadPDF` · `navTo(history/home)` · `sendMaxRequest` · **`requestZoom`** · `window.location='index.html'` | те же + Zoom-блок | + еженедельный PDF (до 8 для 8w / 12 для 12w) + Zoom-запрос (только uk/ru — см. §10.6) |

**Общий поток для всех тарифов** (после прохождения шагов):
- кнопка «Показать результат →» вызывает `showResults()` (или `proceedFromStep15()` для PRO+EXPERT/ELITE — гейтит на Анкету при `_onboardingPending=true`)
- `showResults` запускает `fetchAIAnalysis(data, lang)` → POST на Cloudflare Worker
- параллельно отображаются клинические паттерны (KB) и блок Expert (если тариф позволяет)

### 10.2 Анкета (Onboarding) — flow

Применима к **ELITE** (живёт давно) и **PRO+EXPERT** (frontend закоммичен в `5124cca`, backend ещё нужно дописать в Apps Script).

```
Клиент жмёт «Показать результат» на step15
        │
        ▼ proceedFromStep15() → если _onboardingPending=true:
        │   • прячет все .step, показывает stepOnboarding (HTML-блок ~140 строк)
        │   • 3 секции, ~14 полей: Контакты / Цели / История здоровья
        │
        ▼ Клиент жмёт «Показать мой результат →» (submitOnboarding)
        │   • валидация email
        │   • window._onboardingAnswers = {...все поля...}
        │   • переход на stepResult
        │
        ▼ Клиент жмёт «Отправить запрос нутрициологу →» (sendMaxRequest)
        │   • POST на APPS_SCRIPT_URL?action=expert
        │     params: action, code, name, email, question, lang,
        │             data (биометрия), onboarding (JSON-строка ответов анкеты)
        │
        ▼ Apps Script handleExpert (apps-script.js:88+)
            • сохраняет анкету в колонку H Sheet (один раз — повторно не пишет)
            • вызывает POST BACKSTAGE_DRAFT_URL (= interpreter.viaelcom.workers.dev/draft)
            • Worker handleDraft: пишет в KV EXPERT_DRAFTS (TTL 7д), генерирует AI-bullets, шлёт TG-карточку нутрициологу
```

- **Endpoint:** `https://script.google.com/.../exec?action=expert` (POST через URLSearchParams)
- **Поля в payload:** `code`, `name`, `email`, `question`, `lang`, `data` (JSON биометрии), `onboarding` (JSON-строка) опционально
- **Хранилище:** Sheet (Google Sheets) колонка H = JSON-объект ответов анкеты + lang + ts. Storage один раз — повторная анкета игнорируется
- **Язык:** Анкета хранится на языке, на котором заполнялась (поле `lang` сохраняется). Сообщение нутрициологу в TG — на русском (нутрициолог работает на ru/uk, Worker не переводит анкету)
- **Дублирование:** клиент видит/заполняет 1 раз за всю подписку (флаг `onboarding_required` из validateCode становится false после сохранения)

### 10.3 Telegram-бот `@viael_backstage_bot`

**Один бот для нутрициолога** — никаких клиентских ботов. Только back-stage.

| Событие | Триггер | Сообщение генерируется | Куда | Как (Worker handler) |
|---|---|---|---|---|
| **Покупка ИП** | Hotmart `PURCHASE_APPROVED` → `/hotmart-webhook` | `🧬 Интерпретатор — TIER\n👤 имя\n📧 email\n💰 цена\n🇺🇦 язык\n🔑 Код` | `NUTRITIONIST_CHAT_ID` | `handleHotmartWebhook` → `handleInterpreterPurchase` → `sendTelegram` |
| **Закончились коды тарифа** | Apps Script вернул `no_codes_available` | `🚨 КОДЫ {TIER} ЗАКОНЧИЛИСЬ` + инструкция | `NUTRITIONIST_CHAT_ID` | тот же `handleInterpreterPurchase` шлёт отдельный алерт |
| **Покупка программы** | Hotmart `PURCHASE_APPROVED` для product_id программы | `🧬 Менопауза / Andro / Anti / Estro\n👤\n📧\n💰\n🇺🇦 + token-link на анкету` | `NUTRITIONIST_CHAT_ID` | `handleHotmartWebhook` (ветка programs) → KV `PROGRAM_INTAKES:intake:{token}` |
| **Заполнена анкета программы** | клиент сабмитит `program-intake.html` → `/intake-submit` | блок «Программа: ... · Анкета 4 секции» с inline-кнопкой «📅 Назначить сессию» | `NUTRITIONIST_CHAT_ID` | `handleIntakeSubmit` |
| **Выбрана дата сессии** | клиент жмёт календарь → `/schedule-session` | `📅 Клиент выбрал время · дата · время UTC+2` + Zoom-ссылка | `NUTRITIONIST_CHAT_ID` | `handleScheduleSession` |
| **Бронь Cal.com** (ВСЁ: 15-мин знакомство + 60-мин сессия/ELITE) | Cal.com webhook `BOOKING_CREATED` → `/cal-webhook` | `📅 Новая запись (Cal.com) · имя · email · TZ · время · видео-ссылка` | `NUTRITIONIST_CHAT_ID` | `handleCalWebhook` |
| **Expert-запрос (PRO+EXPERT / ELITE)** | Apps Script → POST `/draft` | детальная карточка: биометрия + симптомы + AI-bullets (5–7) + Anketa-блок (если ELITE) + inline-кнопки `📝 Ответить` `🔄 Перевести` | `NUTRITIONIST_CHAT_ID` | `handleDraft` → renders + sendTelegram + KV `EXPERT_DRAFTS:draft:{request_id}` TTL 7д |
| **Inline-кнопка нажата нутрициологом** | Telegram callback_query → `/tg-webhook` | edit message + сохраняет состояние редактирования в KV `EXPERT_DRAFTS:editing:{chat_id}` (10 мин) | сам нутрициолог | `handleTgWebhook` → `handleTgCallback` |
| **Нутрициолог ответил текстом** | `handleTgMessage` (text after «📝 Ответить») | `translateReply()` → Apps Script `{action:'send_report'}` → клиенту email с PDF | клиент (через Apps Script + Brevo) | `handleTgMessage` |

**Идентификаторы:**
- Bot username: `@viael_backstage_bot`
- `NUTRITIONIST_CHAT_ID = 383599103` (хранится в Worker env, не в коде)
- Webhook URL Telegram → Worker: `https://interpreter.viaelcom.workers.dev/tg-webhook`

### 10.4 AI-анализ (handleAnalyze)

| Параметр | Значение |
|---|---|
| **URL** | `POST https://interpreter.viaelcom.workers.dev/` (root, без префикса) |
| **Method** | POST `application/json` |
| **Body** | `{ data: {…биометрия…}, lang: 'en'\|... }` |
| **Модель** | `claude-haiku-4-5-20251001` (Anthropic) |
| **max_tokens** | 1600 |
| **Cache control** | `cache_control: { type: 'ephemeral' }` на system-сообщение (5-минутный кэш) |
| **System prompt структура** | `SYSTEM_PROMPT` (статичная клиническая KB, ~1500 строк на русском) + per-request language directive: «весь твой ответ на {langName}» + glossary 12 языков + BMI/IMC/ИМТ маппинг |
| **User message** | `buildUserMessage(data, lang)` — структурированный summary биометрии и симптомов на русском |
| **Response** | `{ analysis: "..." }` — markdown текст на языке пользователя |
| **Запрос инициирует** | `fetchAIAnalysis(data, lang)` во всех 4 интерпретаторах (VIO + PRO + PRO+EXPERT + ELITE) после `showResults()` |
| **Fallback** | Если Claude упал — UI показывает «⚠ Не удалось получить анализ. Попробуйте позже» |

### 10.5 PDF-отчёт

**Локальный PDF (генерируется в браузере):**
- Кнопка `downloadPDF()` есть в `stepResult` всех 4 интерпретаторов
- Использует `html2pdf.js` или встроенный механизм печати браузера (см. конкретный файл)
- Сохраняется клиентом локально, на сервер не уходит

**PDF от нутрициолога (PRO+EXPERT / ELITE):**
- Не генерируется автоматически. Нутрициолог получает Expert-запрос (см. §10.3, ряд «Expert-запрос»), пишет ответ в TG-боте
- Ответ через `handleTgMessage` → Apps Script `action=send_report` → Apps Script собирает HTML/PDF (используя `GmailApp` + Docs) и отправляет клиенту через Gmail/Brevo
- Apps Script колонка G — JSON-массив дат отправленных PDF (счётчик лимита)

### 10.6 Zoom и календарь

**Zoom (ELITE-эксклюзив):**
- Кнопка `Запросить Zoom →` в блоке `#zoomBlock` (line 3098 `interpreter-elite.html`)
- Обработчик `requestZoom()` (line 3228) — отправляет запрос нутрициологу в TG
- **Условие показа:** блок скрыт по умолчанию (`display:none`), показывается по логике приложения (вероятно только для uk/ru — `[[project_ip_tariffs]]` память подтверждает «ELITE Zoom-встречи опц. для uk/ru»). **Проверить** реальную условную логику в JS — флаг к доразбору
- Zoom-ссылку и время нутрициолог отправляет вручную через TG/email — **не автоматизировано** (см. TODO §9)

**Календарь (программы, не ИП):**
- В `program-intake.html` есть `?calendar=1` режим с 21-дневной сеткой и слотами 09–19 UTC+2
- Клиент выбирает дату/время → POST `/schedule-session` → KV PROGRAM_INTAKES обновляется + TG-уведомление нутрициологу

### 10.7 Все секреты Worker'a (env variables)

> Задаются через `wrangler secret put <NAME>` — никогда не в `vars`/файлах. Список из `wrangler.jsonc` комментариев + grep по коду:

| Secret | Назначение | Используется в |
|---|---|---|
| `CLAUDE_API_KEY` | API-ключ Anthropic Claude для AI-анализа и AI-bullets | `handleAnalyze`, `generateAiBullets`, `translateReply` |
| `TELEGRAM_BOT_TOKEN` | Токен @viael_backstage_bot | `sendTelegram*`, `tg*` функции |
| `NUTRITIONIST_CHAT_ID` | `383599103` — chat нутрициолога для backstage-уведомлений | `sendTelegram` (default chat) |
| `BREVO_API_KEY` | API Brevo (ex-Sendinblue) для транзакционных писем | `sendEmail` |
| `APPS_SCRIPT_URL` | URL Google Apps Script web-app (валидация кодов, Expert-разборы, send_report) | `handleInterpreterPurchase`, `handleTgMessage`, и др. |
| `HOTMART_TOKEN` | Ожидаемое значение заголовка `x-hotmart-hottok` для проверки подлинности webhook'а | `handleHotmartWebhook` |

**KV namespaces** (заданы в `wrangler.jsonc`, не secret):
- `EXPERT_DRAFTS` (id `646385ffc4d445f2b530dc8270249765`) — TTL 7д для draft'ов + 10 мин для editing-state
- `PROGRAM_INTAKES` (id `f7e717d9bd6d4304aac8a28302b1dbfd`) — TTL 180д для intake-токенов программ

### 10.8 Проверка доставки (health check от 2026-05-30)

| Endpoint / Service | Тест | Результат |
|---|---|---|
| Worker root `https://interpreter.viaelcom.workers.dev/` | `GET /` | 404 (норма — root принимает только POST для AI) |
| `POST /` AI-анализ | `curl POST {data,lang:'en'}` | ✅ 200, возвращает живой Claude markdown |
| `POST /hotmart-webhook` | POST с пустым body + правильным token | 200 `{ok:true}` (skipped — нет event) |
| `POST /hotmart-webhook` с заведомо НЕВЕРНЫМ `x-hotmart-hottok` | `curl -H 'x-hotmart-hottok: wrong' …` | ✅ 401 `{ok:false,error:'invalid_token'}` (после установки секрета 2026-05-30 21:35) |
| `POST /hotmart-webhook` без заголовка `x-hotmart-hottok` | `curl …` | ✅ 401 — токен-валидация защищает endpoint |
| KV `PROGRAM_INTAKES.put` | косвенно — через `/intake-submit` (не тестировано через curl) | предполагается ОК — KV namespace привязан |
| KV `EXPERT_DRAFTS.put` | косвенно — через `/draft` | предполагается ОК |
| Brevo email | косвенно — через `handleInterpreterPurchase` после выдачи кода | предполагается ОК (BREVO_API_KEY должен быть установлен) |
| Telegram bot | не тестировано напрямую (требует токен) | предполагается ОК (бот в продакшне работает per [[project-program-bot]]) |

#### Заметки

1. ✅ **HOTMART_TOKEN секрет установлен и работает** (подтверждено 2026-05-30 21:35 серией curl-тестов: левый токен → 401, правильный `vial-hotmart-2026` → 200). Webhook защищён от спуфинга.

2. **`vial-claude-proxy` legacy worker всё ещё активен** (см. §8). Никто из кода на него не ходит, но он живёт. Можно удалить `wrangler delete vial-claude-proxy` для чистоты, если хочешь.

3. **Apps Script BACKSTAGE_DRAFT_URL** в `apps-script.js:40` — захардкожен. После любого изменения URL воркера нужно **вручную** пересохранить и задеплоить Apps Script (нет автодеплоя из репо). На 2026-05-30 значение корректное: `https://interpreter.viaelcom.workers.dev/draft`.

4. **Тестовые curl-запросы к `/hotmart-webhook` могут шуметь в TG-боте** если они проходят token-валидацию: с правильным `x-hotmart-hottok` + body `{"event":"PURCHASE_APPROVED"}` без productId Worker отправит «⚠ Hotmart: неизвестный product_id» нутрициологу. При диагностических curl-тестах либо посылай пустой body `{}` (skipped, без TG), либо предупреди нутрициолога.

### 10.10 Google Apps Script — проект и деплой

> Зафиксировано 2026-05-30 по скриншоту панели script.google.com.

| Параметр | Значение |
|---|---|
| **Имя проекта** | `Проект без названия` (untitled — не переименован) |
| **URL проекта** | `https://script.google.com/u/0/home/projects/1DY7E8HEMxBxAMAiR73F0fr0CY32X0qMp7N4pPg2HTVB_AUNZ_wCbJHE/edit` |
| **Project ID** | `1DY7E8HEMxBxAMAiR73F0fr0CY32X0qMp7N4pPg2HTVB_AUNZ_wCbJHE` |
| **Файл кода** | `Код.gs` (одна вкладка, ~всё содержимое `interpreter/apps-script.js` из репо) |
| **Манифест** | `appsscript.json` — см. ниже |
| **Библиотеки** | пусто (`Бібліотеки` слева — без записей) |
| **Сервисы** | пусто (`Сервіси` слева — без записей) |
| **Web-app URL (deploy)** | Хранится в Worker secret `APPS_SCRIPT_URL` (значение вида `https://script.google.com/macros/s/AKfycb…/exec`) |

**`appsscript.json` — манифест проекта:**

```json
{
  "timeZone": "Europe/Kyiv",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request",
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive"
  ],
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

**Что значит этот манифест:**
- `timeZone: Europe/Kyiv` — все даты в Sheet (активация, истечение, история) записываются в киевском поясе
- `oauthScopes` — права аккаунта владельца, которые скрипт использует:
  - `/spreadsheets` — читать/писать в Google Sheet с кодами доступа
  - `/script.external_request` — `UrlFetchApp` для вызова Cloudflare Worker (`BACKSTAGE_DRAFT_URL`)
  - `mail.google.com/` — отправка писем через `GmailApp` (письма нутрициологу + клиенту)
  - `/documents` + `/drive` — генерация и сохранение PDF (Google Docs → PDF в Drive → ссылка в письме)
- `executeAs: USER_DEPLOYING` — скрипт выполняется от имени аккаунта, который сделал deploy (= владельца ящика `viaelcom@gmail.com`). Все письма уходят с этого ящика
- `access: ANYONE_ANONYMOUS` — endpoint Apps Script публичный, без токена. Защита — через токены в URL (validateCode принимает только зарегистрированные коды из Sheet)

**Процедура деплоя после правки `interpreter/apps-script.js` в репо:**

1. Скопировать всё содержимое `interpreter/apps-script.js` (из git репо)
2. Открыть проект: <https://script.google.com/u/0/home/projects/1DY7E8HEMxBxAMAiR73F0fr0CY32X0qMp7N4pPg2HTVB_AUNZ_wCbJHE/edit>
3. Открыть файл `Код.gs` → выделить всё (Cmd+A) → вставить
4. **Deploy → Manage deployments → выбрать существующий deployment → ✏ Edit → Version: New version → Deploy**
5. URL deployment не меняется (тот же `APPS_SCRIPT_URL` в Worker остаётся валидным)

> ⚠ Если случайно создашь **новый** deployment вместо «New version» существующего — получишь новый URL, и нужно будет обновить `APPS_SCRIPT_URL` секрет в Worker (`wrangler secret put APPS_SCRIPT_URL`). Всегда выбирай «New version» у уже существующего deployment.

### 10.9 Оплата Hotmart → код доступа

**1. Webhook URL** (настраивается в Hotmart panel для каждого product_id):
```
https://interpreter.viaelcom.workers.dev/hotmart-webhook
```
Header: `x-hotmart-hottok: vial-hotmart-2026` (на 2026-05-30 проверка может быть отключена — см. красный флаг §10.8).

**2. product_id → tier mapping** (Worker `HOTMART_PRODUCTS`, lines 252–270):

| product_id | Тариф | Цена | Code prefix (из `code-generator.html`) |
|---|---|---|---|
| `7838739` | PRO | $29/мес | **`VL-P-XXXXXXXX`** |
| `7838826` | EXPERT | €79/мес | **`VL-X-XXXXXXXX`** |
| `7838876` | ELITE-8W | €390 | **`VL-8-XXXXXXXX`** |
| `7838925` | ELITE-12W | €590 | **`VL-12-XXXXXXXX`** |

> Префиксы — `VL-P`, `VL-X`, `VL-8`, `VL-12` (НЕ `VL-E-`/`VL-L8-`/`VL-L12-` — последние были предположением, не реальностью). См. `interpreter/code-generator.html:157`.

**3. Что происходит после успешной оплаты ИП:**

```
Hotmart POST /hotmart-webhook  (x-hotmart-hottok)
        │
        ▼ handleHotmartWebhook валидирует токен (если HOTMART_TOKEN установлен)
        │   проверяет event === 'PURCHASE_APPROVED'
        │   detectLangFromHotmart(data) — определяет язык клиента (12 опций)
        │   HOTMART_PRODUCTS[productId] → tier
        │
        ▼ handleInterpreterPurchase  (если product.type === 'interpreter')
        │   1) POST APPS_SCRIPT_URL {action:'assign_code', tier:'PRO'}
        │   2) Apps Script handleAssignCode — ищет первую FREE-строку с этим tier
        │      → меняет статус на ASSIGNED, ставит timestamp
        │      → возвращает {ok:true, code:'VL-P-AB12CD34'}
        │      → если нет FREE кодов: {ok:false, reason:'no_codes_available'}
        │
        ▼ Если код выдан:
        │   • sendTelegram → карточка покупки нутрициологу
        │   • sendEmail (Brevo) → клиенту: тариф, код, ссылка на ИП
        │
        ▼ Если кодов нет:
            • sendTelegram → 🚨 алерт «КОДЫ {TIER} ЗАКОНЧИЛИСЬ»
            • email клиенту НЕ отправляется (клиент платит, но кода нет — критично!)
```

**4. Где хранится код** (после генерации в `code-generator.html` → CSV → Google Sheets):
- Google Sheet (один лист), колонки: `A=Код · B=Тариф · C=Статус · D=Дата активации · E=Истечение · F=Expert-history · G=PDF-history · H=Onboarding-JSON`
- Статусы: `FREE` (свободен) → `ASSIGNED` (выдан клиенту, ещё не активен) → `ACTIVE` (клиент ввёл) → `EXPIRED` (срок вышел)

**5. Доставка клиенту:**
- Email от Brevo с темой типа `VIA-L Interpreter PRO — your access code` (12-язычные шаблоны в `buildInterpreterEmailBody`)
- Sender: `viaelcom@gmail.com` (через Brevo)
- Письмо содержит: код, ссылку «Open Interpreter», базовые инструкции
- Hotmart также показывает страницу подтверждения после оплаты — это отдельный канал, не от нас

**6. Ввод кода клиентом:**
- На любой странице интерпретатора (`interpreter-vio/pro/pro-expert/elite.html`) первый экран — gate с полем `gateInput`
- Кнопка «Увійти →» вызывает `checkCode()`:
  ```
  POST APPS_SCRIPT_URL?code=VL-P-AB12CD34
  → Apps Script validateCode (apps-script.js:229+)
    • FREE/ASSIGNED → переводит в ACTIVE, ставит expiry (30/56/84 дня)
    • ACTIVE + срок не вышел → возвращает meta (плана, лимиты, onboarding_required)
    • ACTIVE + истёк → переводит в EXPIRED, возвращает reason:'expired'
    • EXPIRED → reason:'expired'
    • нет в Sheet → reason:'invalid'
  ```
- На основе ответа: либо `gateUnlock(plan, code)` (показывает рабочий экран), либо `gateError(reason)` (показывает локализованное сообщение об ошибке — `gate_err_invalid`/`gate_err_used`/`gate_err_expired`/`gate_err_network`)

**7. DEV-коды для тестирования** (обходят Apps Script, не записываются в Sheet):

| Интерпретатор | DEV-коды |
|---|---|
| PRO | `VIAL-PRO-2024` |
| PRO+EXPERT | `VIAL-EXPERT-2024` (без Анкеты) · `VIAL-EXPERT-ONB-2024` (с Анкетой) |
| ELITE | `VIAL-ELITE-2024` · `VIAL-ELITE-8W` · `VIAL-ELITE-12W` |

DEV-коды также допущены в Apps Script (`apps-script.js:43`) — там они получают плейсхолдер-email для send_report flow.

**8. Что если код:**
- **Неверный** (нет в Sheet) → `reason:'invalid'` → UI показывает «Code not found. Check your email.» (локализовано на 12 языках, ключ `gate_err_invalid`)
- **Уже использован** (status=ACTIVE с истёкшим сроком) → `reason:'expired'` → «Your subscription has expired. Please renew.» (`gate_err_expired`)
- **Истёк срок** (status=EXPIRED) → то же сообщение `gate_err_expired`
- **Сетевая ошибка** → `reason:'network'` → «Connection error. Please try again.» (`gate_err_network`)

(Кейса «уже использован но активен» нет — код переходит из FREE/ASSIGNED сразу в ACTIVE при первом входе, повторный вход с тем же кодом работает пока ACTIVE.)

---

## 11. КАБИНЕТ СПЕЦИАЛИСТА → ПЛАТФОРМА (CRM на D1)

Рабочее место специалиста — «1С, только лёгкое». **Всё досье клиента собирается и
разбирается В КАБИНЕТЕ, а не в Telegram.** Источник правды = кабинет; Telegram = слой
уведомлений. Модель-спека кабинета: [`docs/CABINET-MODEL.md`](docs/CABINET-MODEL.md).

С 2026-06-06 кабинет вырос в **платформу для многих профильных специалистов** (нутрициолог,
гинеколог, эндокринолог, андролог…). Один кабинет, у каждого специалиста — свой вход, свои
пациенты, свой язык. Интерфейс на **12 языках**, ставится как приложение (**PWA**), подстроен
под профиль. **Источник правды и все детали платформы (офлайн §1–9 + онлайн §10) — в одной
папке [`docs/`](docs/README.md), файл [`docs/PLATFORM-MODEL.md`](docs/PLATFORM-MODEL.md).**
Здесь, в архитектуре, держим только указатель — детали не дублируем.

### 11.1 Где что лежит

| Что | Где |
|---|---|
| Фронт кабинета (1 файл, всё inline) | [`cabinet/index.html`](cabinet/index.html) |
| Бэкенд (маршруты `/cabinet/*`, ингесты, cron) | [`interpreter/cloudflare-worker.js`](interpreter/cloudflare-worker.js) |
| Схема БД | [`interpreter/cabinet-schema.sql`](interpreter/cabinet-schema.sql) |
| Хранилище | Cloudflare **D1** `vial-cabinet` (id `b4ee9324…`, биндинг `env.DB`) |
| Сессии входа / лиды / связки | KV `EXPERT_DRAFTS` (`cabinet_sess:*`, `cal_lead:*`, `code_topic:*`, `care_client:*`) |
| URL воркера | `https://interpreter.viaelcom.workers.dev` |
| URL кабинета | `https://via-l.com/cabinet/` (GitHub Pages) |

### 11.2 Модель данных (D1 `clients`)

Одна таблица `clients`: колонки-«шапка» (`code` PK, `name`, `email`, `tg`, `phone`,
`lang`, `product`, `program`, `tier`, `price`, `format`, `duration_weeks`, `start_date`,
`end_date`, `status`, `gender`, `age`, `phase`, `created_at`, `updated_at`) + **JSON-колонка
`data`** со всем досье вкладок: `data.anketa`, `data.biometrics[]`, `data.schedule[]`,
`data.breakdowns[]`, `data.messages[]`, `data.protocol[]`, `data.labs`, `data.notes[]`,
`data.marks`, `data.payment`, `data.last_data_nudge`.

**`code` — сквозной ключ** (тот же у оплаты, анкеты, ТГ-топика). Фронт оперирует `c.id`;
для карточек из воронки `cabinetRowToClient` подставляет `id = data.id || code` — иначе
анкетные карточки не открывались (баг закрыт). В базу основателя попадают **оплаченные**:
сайт-программы (Разовая/8нед/12нед) + ИП **EXPERT/ELITE** (НЕ VIO/PRO). **Платформа добавила**:
колонку **`specialist_id`** (чей это пациент; DEFAULT 1 = основатель) — и пациент внешнего
специалиста заводит карточку, когда **подключается по реф-коду** (§11.8). Отдельная таблица
**`specialists`** (см. §11.8). Поля платформы в `data`: `data.sharing`/`data.consent` (согласие
пациента на передачу данных).

### 11.3 Как клиент попадает в кабинет (3 источника, все по `code`)

1. **Оплата** (Hotmart webhook) → `cabinetUpsertFromPayment`: карточка рождается сразу,
   `status='new'`. Формат/длительность выводятся из тарифа+языка (`cabinetTariffMeta`):
   разовая=`once`/1нед; 8-12нед uk/ru=`zoom`, иначе `pdf`; EXPERT=`pdf`/4нед;
   ELITE uk/ru=`zoom`, иначе `pdf`. Ключ: token (программы) / код доступа (ИП).
   Реальная сумма — в `data.payment`.
2. **Анкета** (`deliverAnketa` / `deliverAnketaProgram`) → до-обогащает ту же карточку:
   `data.anketa = {answers, summary (ИИ-сводка), submitted_at, lang}`.
3. **Прохождение ИП** (`handleAnalyze`, фронты pro-expert/elite шлют `code`) →
   `cabinetIngestIpAnalysis` (фоном, `ctx.waitUntil`): добавляет недельный срез
   биометрики (hrv/rhr/weight) + лог ИИ-разбора (`source:'ip'`, текст+метрики).
   **UPDATE-only** — если карточки нет (VIO/PRO/аноним), запись пропускается.

Плюс **Cal.com** (`handleCalWebhook`): реальная бронь по email → `cabinetIngestCalBooking`
пишет в `data.schedule` (`source:'cal'`, `cal_uid`; перенос обновляет, отмена помечает
`cancelled`). Бронь без карточки (15-мин знакомство до оплаты) → лид в KV `cal_lead:*`.

### 11.4 Маршруты воркера (все POST, Bearer-токен кроме auth)

| Маршрут | Назначение |
|---|---|
| `/cabinet-auth` | вход: **логин+пароль** по `specialists` (PBKDF2) ИЛИ владелец по `CABINET_PASS` (логин пустой) → токен `cabinet_sess:*` `{id,role}` (TTL 12ч, rate-limit 8/10мин/IP); отдаёт `role`,`lang`,`specialty` |
| `/cabinet/clients` | список карточек: владелец — все, специалист — только `specialist_id=свой`; отдаёт `role`,`specialty` |
| `/cabinet/save` | upsert карточки по `code` (специалист сохраняет только своих; пишет `specialist_id`) |
| `/cabinet/delete` | удалить карточку (проверка `cabinetOwns` — чужого нельзя) |
| `/cabinet/ai-draft` | ИИ-черновик ответа на **языке специалиста** (Haiku/Sonnet по языку), контекст анкета+биометрика+сообщения; `cabinetOwns` |
| `/cabinet/tg-send` | отправить клиенту в ТГ-топик (`code_topic`→`careSend`); **авто-перевод на язык клиента**, если отличается |
| `/cabinet/translate` | перевод текста на язык вошедшего (кнопки «Перевести»; движок `careTranslate`) |
| `/cabinet/leads` | будущие знакомства-лиды (Cal.com без карточки) — **только owner** |
| `/cabinet/specialists` | **(owner)** список специалистов + счётчик пациентов |
| `/cabinet/specialist-save` | **(owner)** создать/править специалиста (пароль→PBKDF2; уникальность login/ref_code) |
| `/cabinet/specialist-delete` | **(owner)** удалить (нельзя №1; нельзя с пациентами) |
| `/specialist/connect` | **(публичный)** пациент: реф-код+email+согласие → карточка под `specialist_id`, код пациента `P+6` |
| `/specialist/unlink` | **(публичный)** пациент отзывает согласие (`sharing=false`, `specialist_id=NULL`) |
| `/specialist-access-webhook` | **(Hotmart)** абонплата специалиста по email → `access_status`/`access_paid_until` |

### 11.5 Интерфейс кабинета (`cabinet/index.html`)

Два **вида** (переключатель в шапке, БЕЗ отдельных страниц — общий вход/данные):
- **👥 Клиенты** — sidebar (поиск имя/email/код/программа + фильтр статуса + сортировка,
  группировка по статусу с счётчиками, пагинация 25) и карточка с вкладками:
  **Обзор** (живая сводка: прогресс сессий, недель биометрики, анкета, переписка + «нужен
  ответ»; профиль с расчётным окончанием; ближайшая точка; последняя биометрика; ИИ-сводка),
  **Протокол**, **Анализы**, **Заметки**, **Анкета**, **Биометрия** (нед 1/4/8 выделены),
  **Сессии** (план+факт, авто-расписание от start_date, метка 📅 Cal у реальных броней),
  **Разборы** (ручные + 📲 ИП с раскрывающимся текстом), **Переписка** (лог + ⚡ИИ-черновик
  + отправка в ТГ). Глобальный маркер-инструмент (заливка/цвет текста) в шапке.
- **📅 Календарь** — агенда всех встреч (Сегодня/Завтра/Неделя/Позже) из расписаний всех
  карточек, клик → карточка; отдельная секция **🤝 Знакомства** (лиды Cal.com).
- **🩺 Специалисты** (только владелец) — управление специалистами (см. §11.8).

**Локализация (12 языков):** переключатель языка в шапке; движок i18n — словарь `T`
(key-major), `t()`/`tl()`, `applyI18n()` по атрибутам `data-i18n`/`-ph`/`-title`; язык по
умолчанию = язык вошедшего специалиста (`localStorage` помнит ручной выбор), фолбэк на ru.
Локализованы интерфейс, все вкладки и **PDF-отчёт** (`generatePDF` — на языке пациента).
**Вид под профиль:** `applyTabProfile()` скрывает «Протокол»/«Анализы» всем, кроме нутрициолога.
**PWA:** `cabinet/manifest.json` + `icon.svg` + `sw.js` → кабинет ставится как приложение
(кнопка «📲 Установить» / iOS-подсказка на входе).

### 11.6 Бот: автоматизация (Cron + забота)

**Cron Trigger** `0 9 * * *` (09:00 UTC ≈ 11–12 ЕС), `scheduled()` → `runDailyReminders`:
обходит активные карточки, шлёт клиенту в ТГ-личку (через care-бота, с переводом
`careTranslate` на язык клиента) + копию в топик нутрициолога. Триггеры: Zoom за 24ч и в
день встречи; для ИП — заботливо зовёт **пройти шаги в интерпретаторе** со ссылкой по
тарифу (`ipLinkFor`); «нет данных ≥5 дней» — мягкий пинг. Дедуп — пометки в карточке
(`reminded_24h`/`reminded_day`/`last_data_nudge`). Писать можно только тем, кто нажал
`/start` у care-бота (правило Telegram).

**ЗАБОТА — главная ценность бота VIA-L.** Все КЛИЕНТСКИЕ тексты (напоминания +
`/cabinet/ai-draft`) — тёплые, поддерживающие, без давления. Внутренние тексты для
нутрициолога (сводки/аналитика) — сухая конкретика.

### 11.7 Деплой и push (важно!)

- **Фронт кабинета** `cabinet/index.html` → деплоится как весь сайт: **`git push origin main`**
  = деплой на `via-l.com/cabinet/` (GitHub Pages, ~1–2 мин). Отдельного «залить» нет.
- **Воркер** `interpreter/cloudflare-worker.js` (вся логика `/cabinet/*`, ингесты, cron) →
  **`cd interpreter && wrangler deploy`** (домен `interpreter.viaelcom.workers.dev`). Push в
  git воркер НЕ деплоит — нужен `wrangler deploy` отдельно. Cron-триггер регистрируется при
  деплое (в выводе видно `schedule: 0 9 * * *`).
- **Порядок при правке обоих:** правка → `node --input-type=module < cloudflare-worker.js`
  (синтаксис-чек воркера) и проверка inline-JS кабинета → `wrangler deploy` → `git push`.
- **Секреты** (репо публичный, только `wrangler secret put NAME`): `CABINET_PASS` (запасной
  вход владельца). Остальные общие с ИП — см. §10.7. БД-миграции (`wrangler d1 execute
  vial-cabinet --remote --file=…`): `cabinet-schema.sql` (база `clients`), `cabinet-step1-specialists.sql`
  (таблица `specialists` + `specialist_id` + запись №1), `cabinet-step4-specialist-email.sql` (email).

### 11.8 Платформа для многих специалистов — ОФЛАЙН-модель

**Замысел.** ИП — инструмент для **смежных специалистов офлайн-приёма** (гинеколог,
эндокринолог, андролог…), которые ведут СВОИХ местных пациентов. Специалист рекомендует
пациенту гаджет → пациент покупает **подписку на приложение ИП** (App Store / Google Play) →
**подключается к специалисту** → специалист ведёт его из кабинета (биометрия + ИИ-разборы).
Живой эксперт для пациента = его собственный врач; платформа даёт инструмент. **EXPERT/ELITE
остаются личной воронкой основателя** (иначе два эксперта на одном пациенте).

**Три денежных потока — через платформу идёт только один:** пациент платит магазину за
приложение; пациент платит специалисту напрямую по его расценкам (мимо нас); **специалист
платит нам абонплату за доступ** (`/specialist-access-webhook` → `access_status`; cron
`expireSpecialistAccess` закрывает вход при просрочке, данные сохраняются).

**Сущность `specialists`** (D1): `id`, `name`, `login`, `email`, `pass_hash` (PBKDF2 `salt:hash`),
`lang` (рабочий язык = язык интерфейса), `specialty` (профиль → какие вкладки видны), `role`
(`specialist`/`owner`), `ref_code` («код клиники»), `access_status`/`access_paid_until`, `status`.
Запись №1 = основатель (`owner`, `nutritionist`, `ref_code` FOUNDER). Создаются/правятся из
панели «🩺 Специалисты» (только owner).

**Алгоритм «специалист заводит пациента» (по согласию):** у пациента уже куплено приложение ИП
→ он вводит **код специалиста** (`ref_code`) и даёт **согласие на передачу данных** → в кабинете
специалиста авто-появляется карточка (`specialist_id`, `data.consent`), а каждый ИП-разбор пациента
сам течёт в неё по уже работающему ингесту (`cabinetIngestIpAnalysis` по коду). Отзыв согласия
(`/specialist/unlink`) → `sharing=false` (новые разборы не пишутся), `specialist_id=NULL`.

**Вход и видимость:** `/cabinet-auth` принимает логин+пароль специалиста (или `CABINET_PASS` =
владелец); сессия помнит `{id,role}`; `/cabinet/clients` отдаёт владельцу всех, специалисту —
только своих (`specialist_id`); `cabinetOwns` не даёт открыть/править/удалить чужого. Лиды
знакомств — только владельцу.

**Мост перевода (для офлайн почти не нужен — врач и пациент чаще на одном языке; станет ядром
в онлайн-модели):** анкета/входящие переводятся на язык специалиста кнопкой «🌐 Перевести»
(`/cabinet/translate`); ИИ-черновик генерится на языке специалиста; при отправке текст
авто-переводится на язык пациента. Движок — `careTranslate` (he/ja/ko через Sonnet).

**Что осталось (не в проде):** экран в приложении, где пациент вводит код специалиста (бэкенд
`/specialist/connect` готов — ждёт UI приложения пациента, спека [`docs/MOBILE-APP-MODEL.md`]
(docs/MOBILE-APP-MODEL.md)); подключить реальный платёжный продукт абонплаты в Hotmart на
`/specialist-access-webhook` (пока абонплата управляется вручную в панели). **Онлайн-модель**
(специалист ведёт пациентов по миру удалённо, как основатель в EXPERT/ELITE; пациент на PRO,
оба платят нам) — описана в [`docs/PLATFORM-MODEL.md` §10](docs/PLATFORM-MODEL.md).

---

*Связанные документы: [`CLAUDE.md`](CLAUDE.md) (правила работы с репозиторием),
[`docs/CABINET-MODEL.md`](docs/CABINET-MODEL.md) (модель кабинета),
[`docs/PLATFORM-MODEL.md`](docs/PLATFORM-MODEL.md) (платформа для многих специалистов),
[`docs/MOBILE-APP-MODEL.md`](docs/MOBILE-APP-MODEL.md) (приложение пациента — слепок 1),
[`interpreter/ARCHITECTURE.md`](interpreter/ARCHITECTURE.md) (детали ИП),
[`interpreter/knowledge-base.md`](interpreter/knowledge-base.md) (клиническая база).*
