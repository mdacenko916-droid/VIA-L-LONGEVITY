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
3. Нутрициолог жмёт [📅 Назначить сессию] → бот формирует ссылку
        │   program-intake.html?t=TOKEN&calendar=1
        │
4. Клиент выбирает дату/время → POST Worker /schedule-session {token, date, time}
        │   → KV status='session_scheduled'
        │   → Telegram нутрициологу: «📅 Клиент выбрал время»
        │   → Email клиенту: подтверждение (Zoom-ссылку нутрициолог шлёт вручную)
```

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
| `fetch()` | роутер: GET `/intake-validate`; POST `/tg-test`, `/draft`, `/tg-webhook`, `/hotmart-webhook`, `/intake-submit`, `/schedule-session`, иначе → `handleAnalyze` |
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

**Worker secrets** (через `wrangler secret put`, НЕ в `vars`): `CLAUDE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `NUTRITIONIST_CHAT_ID`, `BREVO_API_KEY`, `APPS_SCRIPT_URL`, `HOTMART_TOKEN`.

**Worker KV bindings:** `EXPERT_DRAFTS` (TTL 7д), `PROGRAM_INTAKES` (TTL 180д).

> ⚠️ **Apps Script не деплоится автоматически** из репозитория. После любой правки `interpreter/apps-script.js` нужно: открыть `script.google.com` → проект интерпретатора → вставить новую версию → **Deploy → Manage deployments → New version**. Иначе backend будет работать на старом коде, а файл в репо — расходиться с реальностью.

---

## 9. Что ещё не реализовано (TODO)

Контекст — `interpreter/TASK-PROGRAM-BOT-NOTIFY.md` и `TASK-NEXT-SESSION.md`.

### Поток программы ведения (бот онбординга)
- [x] Worker `/hotmart-webhook`, `/intake-validate`, `/intake-submit`, `/schedule-session` — **написаны**.
- [x] `program-intake.html` (анкета 4 секции + календарь) — **есть**.
- [x] KV `PROGRAM_INTAKES` подключён.
- [ ] **Настроить Webhook URL в Hotmart** для 4 программ (в настройках каждого продукта).
- [ ] **End-to-end тест**: тестовая оплата → TG-уведомление → анкета → сессия.
- [ ] Кнопка «📋 Полная анкета» в TG-карточке (сейчас только «📅 Назначить сессию»).
- [ ] Анкета программы локализована только uk/ru (остальные языки — потом).

### Прочие хвосты
- [ ] `EMAIL_T` (письма потока программы) — только 4 языка; de/pt/fr/pl/it/he/ja/ko падают на en.
- [ ] Reject-ветка Expert-разбора: TODO «отправить клиенту вежливое сообщение `требуется уточнение`» (`cloudflare-worker.js`, ~стр. 1163) — не реализовано.
- [ ] Zoom-ссылка для сессии добавляется нутрициологом **вручную** (не автоматизировано).
- [ ] Подтвердить деплой Worker под одним именем (см. §8, два хостнейма).
- [ ] `cabinet/index.html` — данные только в `localStorage` одного браузера (нет синхронизации/бэкенда).
- [ ] Неиспользуемая константа `EMAIL_FROM` в Worker (sender захардкожен в `sendEmail`).

---

*Связанные документы: [`CLAUDE.md`](CLAUDE.md) (правила работы с репозиторием),
[`interpreter/ARCHITECTURE.md`](interpreter/ARCHITECTURE.md) (детали ИП),
[`interpreter/knowledge-base.md`](interpreter/knowledge-base.md) (клиническая база).*
