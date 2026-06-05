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
| `interpreter-vio.html` | VIO — бесплатный | 7 | — | — | — | 12 яз. |
| `interpreter-pro.html` | PRO | 16 | ✓ | — | — | 12 яз. |
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
| `interpreter/interpreter-pro.html` | `AI_WORKER` | `https://interpreter.viaelcom.workers.dev` |
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
| **PRO** (`interpreter-pro.html`) | `restart` · `downloadPDF` · `navTo(history/home)` · `checkCode` (re-auth) · `toggleGateVis` · `sendMaxRequest` (показывается?) | те же + Expert-блок если код активен | то же + кнопка «Pro+Expert» — апсейл-форма (запрос разбора нутрициолога), отправляет на Apps Script `?action=expert` |
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

## 11. КАБИНЕТ НУТРИЦИОЛОГА (CRM на D1)

Рабочее место специалиста — «1С, только лёгкое». **Всё досье клиента собирается и
разбирается В КАБИНЕТЕ, а не в Telegram.** Источник правды = кабинет; Telegram = слой
уведомлений. Модель-спека: [`docs/CABINET-MODEL.md`](docs/CABINET-MODEL.md).

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
анкетные карточки не открывались (баг закрыт). В базу попадают **только оплаченные**:
сайт-программы (Разовая/8нед/12нед) + ИП **EXPERT/ELITE**. НЕ попадают VIO и PRO.

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
| `/cabinet-auth` | вход по `CABINET_PASS` → токен в `cabinet_sess:*` (TTL 12ч, rate-limit 8/10мин/IP) |
| `/cabinet/clients` | список карточек (D1 `SELECT … ORDER BY updated_at DESC`) |
| `/cabinet/save` | upsert карточки по `code` |
| `/cabinet/delete` | удалить карточку |
| `/cabinet/ai-draft` | ИИ-черновик ответа клиенту (Claude Haiku, контекст из анкеты+биометрики+сообщений) |
| `/cabinet/tg-send` | отправить текст клиенту в ТГ-топик (`code_topic` → `careSend`) |
| `/cabinet/leads` | будущие знакомства-лиды (Cal.com без карточки) для календаря |

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
- **Секреты** (репо публичный, только `wrangler secret put NAME`): `CABINET_PASS` (пароль
  входа). Остальные общие с ИП — см. §10.7. БД-миграции: `wrangler d1 execute vial-cabinet
  --remote --file=interpreter/cabinet-schema.sql`.

---

*Связанные документы: [`CLAUDE.md`](CLAUDE.md) (правила работы с репозиторием),
[`docs/CABINET-MODEL.md`](docs/CABINET-MODEL.md) (модель кабинета),
[`interpreter/ARCHITECTURE.md`](interpreter/ARCHITECTURE.md) (детали ИП),
[`interpreter/knowledge-base.md`](interpreter/knowledge-base.md) (клиническая база).*
