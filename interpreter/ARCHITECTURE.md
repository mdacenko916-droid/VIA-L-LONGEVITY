# VIA-L · Интерпретатор — Архитектура проекта

> Документ описывает бизнес-логику, структуру файлов и технические решения
> подсистемы `interpreter/` проекта VIA-L LONGEVITY.
> Дата: май 2026.

---

## 1. ОБЩАЯ КОНЦЕПЦИЯ

**Интерпретатор** — это веб-приложение для нутрициологической интерпретации данных носимых устройств (Oura Ring, Apple Watch, Garmin, Polar, WHOOP и др.). Пользователь вводит биометрические показатели пошагово, система генерирует персонализированный нутритивный анализ на основе клинической базы знаний и AI (Claude Haiku).

**Целевая аудитория:** женщины 35+ (пременопауза / менопауза / постменопауза) и мужчины 40+ (андропауза / предандропауза). Контент, скоринг, KB-паттерны и LAB MODULE спроектированы под гормональное здоровье после 35/40.

**Бизнес-модель:** доступ по коду (выдаётся при оплате на Hotmart). Четыре уровня тарифов с нарастающей глубиной анализа. ИП — мировой продукт (12 языков) и одновременно воронка в программы ведения нутрициолога (`via-l.com`, 4 языка, см. корневой `ARCHITECTURE.md`).

**Языковая модель (важно, не путать с сайтом):** ИП рассчитан на **ВЕСЬ МИР**, основной язык — **английский (EN)** (базовый язык продукта и fallback по умолчанию). Все 12 языков (uk, ru, en, es, de, pt, fr, pl, it, he, ja, ko) — равноценная глобальная аудитория. ИП НЕ привязан к 4 рынкам и НЕ сводится к EN/ES/UK/RU — это сайт VIA-L рассчитан на 4 языка, а ИП глобальный. Любая новая `data-t`-строка добавляется сразу во все 12 секций T.

**Основной email проекта:** `viaelcom@gmail.com` (он же аккаунт Cloudflare и адрес нутрициолога).

---

## 2. КАРТА ФАЙЛОВ

```
interpreter/
│
├── index.html                  # Лендинг: галерея устройств + планы
├── methodology.html            # «Научная база» (noindex) — публичная страница
│
├── interpreter-vio.html        # Интерпретатор VIO  — базовый (free/paywall)
├── interpreter-pro.html        # Интерпретатор PRO  — 16 шагов + AI
├── interpreter-pro-expert.html # Интерпретатор PRO-EXPERT — 17 шагов (16 + Анкета) + AI + Expert
├── interpreter-elite.html      # Интерпретатор ELITE — 17 шагов (16 + Анкета) + AI + Elite консультация
│
├── cloudflare-worker.js        # AI-прокси: Claude API + клиническая база знаний
├── wrangler.jsonc              # Конфиг деплоя Cloudflare Worker
│
├── apps-script.js              # Google Apps Script: валидация кодов + Expert-запросы
├── code-generator.html         # Внутренний инструмент генерации кодов доступа
│
├── knowledge-base.md           # Научная база (P-F1–P-F15, P-M1–P-M10) — MD-формат
│
├── Infa Cloude/
│   ├── P-F/P-F1.txt … P-F15.txt   # Источники: женские паттерны (evidence-based)
│   ├── P-M/P-M1.txt … P-M10.txt   # Источники: мужские паттерны
│   └── LAB MODULE /
│       ├── LAB MODULE 1.txt        # Женские гормоны
│       ├── LAB MODULE 2.txt        # Мужские гормоны
│       ├── LAB MODULE 3.txt        # Метаболическая панель
│       └── LAB MODULE 4.txt        # Щитовидная железа
│
├── images-bg/                  # Фоновые изображения (galaxy-тема, по тарифу)
│   ├── galaxy-index.jpg / galaxy-mobile.jpg
│   ├── galaxy-vio.jpg / galaxy-vio-mobile.jpg
│   ├── galaxy-pro.jpg / galaxy-pro-mobile.jpg
│   ├── galaxy-expert.jpg / galaxy-expert-mobile.jpg
│   └── galaxy-elite.jpg / galaxy-elite-mobile.jpg
│
├── images-in/                  # Фото устройств (PNG, золотая тема)
│   ├── Oura Ring Gen 4 gold.PNG
│   ├── Apple Watch Series 11 gold.PNG
│   ├── Garmin Fenix 8 gold titanium.PNG
│   ├── Samsung Galaxy Watch 8 gold.PNG
│   ├── Fitbit Charge 6 gold.PNG
│   ├── Polar Vantage V3 gold.PNG
│   ├── WHOOP 5.0 gold.PNG
│   ├── Xiaomi Smart Band 9 gold.PNG
│   ├── Withings ScanWatch 2 gold.PNG
│   └── Amazfit GTR 5 gold.PNG
│
├── Logo/                       # SVG-монограмма VIA-L (альтернативные варианты)
└── скрин/                      # Скриншоты (рабочие материалы)
```

---

## 3. ТАРИФНАЯ СТРУКТУРА И ДОСТУП

### 3.1 Уровни тарифов

| Тариф        | Файл                        | Шагов          | AI-анализ | Expert-PDF                         | Zoom 1:1               | Цена       |
|--------------|-----------------------------|----------------|-----------|------------------------------------|------------------------|------------|
| VIO (Basic)  | interpreter-vio.html        | 7              | —         | —                                  | —                      | Бесплатно  |
| PRO          | interpreter-pro.html        | 16             | ✓ Claude  | —                                  | —                      | €29/мес    |
| PRO+EXPERT   | interpreter-pro-expert.html | 17 (16+Анкета) | ✓ Claude  | 2 PDF в 30 дней (cooldown 7 дней) | —                      | €79/мес    |
| ELITE-8W     | interpreter-elite.html      | 17 (16+Анкета) | ✓ Claude  | до 8 PDF за 8 недель (еженедельно) | опц. для uk/ru, ≈1/3 нед | €390       |
| ELITE-12W    | interpreter-elite.html      | 17 (16+Анкета) | ✓ Claude  | до 12 PDF за 12 недель (еженедельно) | опц. для uk/ru, ≈1/3 нед | €590       |

ELITE Zoom-встречи доступны только клиентам uk/ru (язык работы нутрициолога). Клиенты на других языках получают только PDF-разборы и переписку.

### 3.2 Коды доступа

Формат кодов (генерируются в `code-generator.html`):
- **PRO:** `VL-P-XXXXXXXX` (символы A–Z, 2–9, без O/0/I/1/L)
- **MAX/Expert:** `VL-M-XXXXXXXX`
- **Dev-коды (обход таблицы):** `VIAL-EXPERT-2024`, `VIAL-PRO-2024`, `VL-DEV-MAX`, `VIAL-ELITE-2024`

### 3.3 Жизненный цикл кода

```
FREE → (первый вход) → ACTIVE (30 дней) → EXPIRED
```

Коды хранятся в Google Sheets (колонки: A=Код, B=Тариф, C=Статус, D=Дата активации, E=Дата истечения, F=Дата последнего Expert-запроса). Валидация — через Google Apps Script (`apps-script.js`).

### 3.4 Expert-запрос (PRO-EXPERT / ELITE)

Лимит: 1 запрос в 30 дней. Apps Script проверяет дату в колонке F, затем:
1. Записывает дату запроса в таблицу
2. Отправляет письмо нутрициологу (`viaelcom@gmail.com`) с полным профилем клиента
3. Отправляет подтверждение клиенту (если указан email)

---

## 4. АРХИТЕКТУРА ИНТЕРПРЕТАТОРОВ (HTML-файлы)

### 4.1 Общая структура каждого файла

Каждый `interpreter-*.html` — самодостаточный файл (~5–6.5 тыс. строк) со встроенными CSS, JS, переводами. Никакого сборщика нет.

```
Структура HTML:
  <head>
    Fonts (Google Fonts: Cormorant Garamond, DM Sans, Oswald)
    CSS (всё inline, ~1000–1500 строк)
  </head>
  <body>
    <header>    — топ-бар: логотип, кнопка «← На главную», выбор языка
    <main>
      <div id="stepProf">  — шаг 0: профиль (пол, фаза, устройство, возраст/вес/рост)
      <div id="step0">     — шаг 1: HRV
      <div id="step1">     — шаг 2: Температура
      … и далее по шагам …
      <div id="stepResult"> — экран результата
    </main>
    <footer>    — VIA-L tagline + ссылка назад

    <script>
      const T = { ru:{...}, uk:{...}, en:{...}, ... }   — объект переводов
      const LANG_FLAGS = { ru:'🇷🇺 RU', ... }
      let lang = 'uk';
      function setLang(l) { ... }    — переключение языка
      function t(k) { ... }          — получение ключа с fallback
      function goNext(id) { ... }    — навигация по шагам
      function showStep(id) { ... }
      function showResults() { ... } — сборка данных и вызов AI/локального анализа
      function _showResultsInner() { — рендеринг результата
      function downloadPDF() { ... } — генерация PDF через print
      function restart() { ... }     — сброс и начало заново
      const importedData = { ... }   — данные из импорта устройства
      // ... импорт данных, аналитика L({}), sessionStorage
    </script>
  </body>
```

### 4.2 Шаги по тарифам

**VIO (6 шагов):**

| Шаг      | Тема                          |
|----------|-------------------------------|
| stepProf | 00/06 · Профиль               |
| step0    | 01/06 · HRV                   |
| step1    | 02/06 · Температура           |
| step2    | 03/06 · Сон                   |
| step3    | 04/06 · Пульс + симптомы      |
| step4    | 05/06 · Энергия + образ жизни |
| step5    | 06/06 · Биоимпеданс (опц.)    |
| stepResult | Результат + paywall         |

**PRO (16 шагов, step0–step15 + stepResult); PRO+EXPERT и ELITE (17 шагов = те же 16 + Анкета-анамнез как онбординг после оплаты):**

stepProf (профиль) → step0 HRV → step1 Температура → step2 Сон → step3 Пульс/симптомы → step4 Когнитивные функции → step5 Питание → step6 Энергия/образ жизни → step7 Гормональный профиль → step8 Стресс/кортизол → step9 Физическая активность → step10 Лабораторные показатели → step11 Цикл (женщины) / Стресс → step12 Биоимпеданс / Цикл → step13 Тренд недели → step14 Углублённые показатели → step15 Динамика недели → stepResult AI-анализ.

Конкретные подписи шагов (badge / data-t-ключ) могут различаться между файлами `interpreter-pro.html` / `-pro-expert.html` / `-elite.html` — структура общая, наполнение конкретного шага зависит от тарифа. ELITE дополнительно показывает `stepOnboarding` (Анкета-анамнез) при первой активации кода — это отдельный экран до основной воронки. **PRO+EXPERT** по решению 2026-05-30 тоже должен получить Анкету по тому же паттерну (даёт нутрициологу контекст для 2 PDF в окне 30 дней) — на 2026-05-30 в коде `interpreter-pro-expert.html` ещё не реализовано, но в маркетинге уже заявлено как 17 шагов.

### 4.3 Система i18n (переводы)

Все интерпретаторы используют единую систему `data-t` + объект `T`:

```javascript
// В HTML:
<span data-t="next">Далее →</span>

// В JS:
const T = {
  ru: { next: 'Далее →', ... },
  uk: { next: 'Далі →',  ... },
  en: { next: 'Next →',  ... },
  // ...
};

function setLang(l) {
  lang = l;
  document.querySelectorAll('[data-t]').forEach(el => {
    const k = el.getAttribute('data-t');
    if (T[l][k] !== undefined) el.innerHTML = T[l][k];
  });
}

function t(k) { return T[lang][k] || T.ru[k] || k; } // fallback на ru
```

**Поддерживаемые языки (12):** `uk`, `ru`, `en`, `es`, `de`, `pt`, `fr`, `pl`, `it`, `he`, `ja`, `ko`

**Правило локализации:** ИП — продукт для всего мира. Любая новая строка с `data-t=`/`data-t-placeholder=` должна **сразу** появиться во всех 12 секциях объекта `T` того же файла. «Сделаю uk/ru/en, остальные потом» — недопустимо: клиент из Германии или Японии не должен видеть русский текст в премиум-тарифе ELITE €390/€590. Если на нормальный перевод нет ресурсов — лучше не добавлять строку, чем оставлять её только на одном языке. **Украинский (uk) всегда первый** в порядке секций T, в dropdown переключателя языка и в любых списках — это рабочий язык продукта.

Языковые предпочтения хранятся в `localStorage` (`vial_lang`).

### 4.4 Импорт данных устройств

Каждый интерпретатор поддерживает импорт из 10 устройств:

| Устройство       | Метод импорта                    | Поддерживаемые поля         |
|------------------|----------------------------------|-----------------------------|
| Oura Ring        | API-токен (cloud.ouraring.com)   | HRV, Sleep, Temp, RHR, Ready|
| Apple Watch      | export.xml / .zip                | HRV, RHR, Sleep, Steps, VO2 |
| Garmin           | CSV из Garmin Connect            | HRV, RHR, Sleep, Stress     |
| Polar            | CSV из flow.polar.com            | HRV, RHR, Sleep, NightRecharge|
| Samsung          | CSV из Samsung Health            | HR, Sleep, Stress, ECG, SpO2|
| Fitbit           | API-токен / JSON из Takeout      | HRV, RHR, Sleep, Steps      |
| WHOOP            | CSV (recovery/sleeps/workouts)   | HRV, Recovery, RHR, Strain  |
| Xiaomi           | CSV (HEARTRATE_AUTO, SLEEP)      | HR, Sleep, Steps, SpO2      |
| Withings         | (ручной ввод)                    | HR, сон, вес                |
| Amazfit          | (ручной ввод)                    | HR, HRV, сон                |

Импортированные данные записываются в объект `importedData` и автоматически подставляются в поля шагов. Ручной ввод всегда доступен как альтернатива.

### 4.5 Результат и AI-анализ

**VIO (без AI):** Локальный скоринг на основе введённых значений → текстовые рекомендации из T-объекта → paywall-блок с предложением перейти на PRO/ELITE.

**PRO / ELITE / PRO-EXPERT (с AI):**
1. `showResults()` собирает все введённые данные в объект `data`
2. `fetch('/api/analyze', ...)` → запрос к Cloudflare Worker
3. Worker выбирает 1–2 клинических паттерна → строит `userMessage` → отправляет в Claude Haiku
4. AI-ответ рендерится в `#aiResult` как разметка Markdown → простой HTML

**PDF:** `downloadPDF()` открывает `window.print()` — браузер сохраняет как PDF через стандартный диалог печати. Специальный CSS `@media print` скрывает лишние элементы.

### 4.6 Аналитика (inline L({}))

В коде встречаются вызовы вида:
```javascript
L({ event: 'step_complete', step: 'step3', lang, device });
```
Функция `L()` — встроенный аналитический beacon (отправляет события в систему аналитики). **Не трогать:** эти вызовы не связаны с переводами.

### 4.7 SessionStorage

Прогресс пользователя сохраняется в `sessionStorage` (не `localStorage`) — данные не переживают закрытие вкладки. История завершённых сессий хранится в `localStorage` (`vial_history`) как JSON-массив.

---

## 5. CLOUDFLARE WORKER (`cloudflare-worker.js`)

### 5.1 Назначение

HTTP-прокси между интерпретатором (браузер) и Claude API (Anthropic). Скрывает API-ключ от клиента, обогащает запрос клинической базой знаний, форматирует промпт.

### 5.2 Конфигурация

```json
// wrangler.jsonc
{
  "name": "interpreter",
  "compatibility_date": "2026-05-24",
  "main": "cloudflare-worker.js"
}
```

Секреты (все через `wrangler secret put`, НЕ в `vars`): `CLAUDE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `NUTRITIONIST_CHAT_ID`, `BREVO_API_KEY`, `APPS_SCRIPT_URL`, `HOTMART_TOKEN`.

KV-биндинги: `EXPERT_DRAFTS` (TTL 7д), `PROGRAM_INTAKES` (TTL 180д).

Деплой: `cd interpreter && wrangler deploy` (Cloudflare Workers, edge-сеть).

### 5.2.1 Канонический URL воркера

> Зафиксировано 2026-05-30 по дашборду Cloudflare. Полная картина инфраструктуры — в корневом [ARCHITECTURE.md § «Cloudflare-инфраструктура»](../ARCHITECTURE.md).

Аккаунт: `Viaelcom@gmail.com`, **account subdomain — `viaelcom`** (НЕ `viaelcom-gmail-s-a`). Воркер `interpreter` живёт на:

```
https://interpreter.viaelcom.workers.dev
```

Все fetch'и из `interpreter-pro.html`, `interpreter-pro-expert.html`, `interpreter-elite.html`, `program-intake.html` (`AI_WORKER` / `WORKER` константа) и Apps Script (`BACKSTAGE_DRAFT_URL`) указывают на этот хостнейм. Любая другая форма (`viaelcom-gmail-s-a`, `vial-claude-proxy`) — устарела или ошибочна.

### 5.3 Модель

`claude-haiku-4-5-20251001` — выбрана за скорость и стоимость. Включён prompt caching (`anthropic-beta: 'prompt-caching-2024-07-31'`) — SYSTEM_PROMPT кэшируется на стороне Anthropic, экономит токены.

`max_tokens: 1600` — достаточно для ответа до ~400 слов.

### 5.4 SYSTEM_PROMPT (структура)

```
РОЛЬ: нутрициолог-консультант, НЕ врач
ПРАВОВЫЕ РАМКИ: только нутрицевтики, направлять к врачу при необходимости

КЛИНИЧЕСКАЯ БАЗА ЗНАНИЙ (25 паттернов):
  Женские (P-F1–P-F15):
    P-F1  Дефицит эстрогена (менопауза/постменопауза)
    P-F2  Доминирование эстрогена (перименопауза)
    P-F3  Дефицит прогестерона
    P-F4  Инсулинорезистентность
    P-F5  Дисфункция щитовидной железы
    P-F6  Надпочечниковая усталость / HPA
    P-F7  Здоровье костей / остеопороз
    P-F8  Кардиоваскулярный риск
    P-F9  Здоровье кишечника / микробиом
    P-F10 Аутоиммунные триггеры
    P-F11 Когнитивный туман
    P-F12 Нарушения сна
    P-F13 Хроническое воспаление
    P-F14 Детоксикация / метаболизм эстрогена
    P-F15 Дефицит B12 / метаболизм фолата

  Мужские (P-M1–P-M10):
    P-M1  Дефицит тестостерона
    P-M2  Дисрегуляция HPA
    P-M3  Метаболический синдром / ИР
    P-M4  Хроническое воспаление
    P-M5  Дисфункция щитовидной железы
    P-M6  Здоровье кишечника / микробиом
    P-M7  Кардиоваскулярный риск
    P-M8  Когнитивный туман
    P-M9  Нарушения сна / СОАС + тестостерон
    P-M10 Здоровье простаты / ДГПЖ

LAB MODULE — клинические референсы:
  - Женские гормоны (эстрадиол, прогестерон, ФСГ, ЛГ, пролактин)
  - Мужские гормоны (ТТ, сТ, SHBG, ЛГ/ФСГ, пролактин) с численными нормами
  - Метаболическая панель (глюкоза, инсулин, HOMA-IR, HbA1c, ЛПНП, ЛПВП, ТГ, hs-CRP)
  - Щитовидная железа (ТТГ возраст-специфичный, сТ4, сТ3, rT3, АТ-ТПО, АТ-ТГ)

ТАЙМИНГ НУТРИЕНТОВ (утро/вечер/с едой)

ФОРМАТ ОТВЕТА:
  Общая картина → Нутритивный приоритет → Питание → Добавки → На сегодня
  Лимит 400 слов. Завершать: «⚕️ Этот анализ носит информационный характер...»
```

### 5.5 Логика `selectKBPatterns(data)`

Функция на основе биометрии и профиля пользователя отбирает 1–2 наиболее релевантных паттерна из базы знаний. Правила:

```javascript
// Примеры (женщины):
if (phase === 'post' || (phase === 'meno' && hf_count === 'high')) → P-F1
if (multiWake && anxiety >= 5 && (phase === 'peri' || 'meno'))    → P-F3
if (deepSleep === 'none')                                          → P-F12
if (hrv < 30 && stress && anxiety >= 6 && energy <= 4)            → P-F6

// Примеры (мужчины):
if (phase === 'andro' || hasSym('libido') && energy <= 5)         → P-M1
if (age >= 45 && hasSym('urin', 'prostat'))                        → P-M10
if (sleep <= 4 || hasSym('snor', 'apnea'))                         → P-M9
```

### 5.6 Логика `buildUserMessage(data, lang)`

Собирает детальный контекстный запрос:
1. Референсные нормы HRV / RHR / сна для возраста клиента
2. Биометрические паттерны (A–G) — автоматически определяются из данных
3. Паттерны сна (ранние пробуждения, частота дыхания)
4. Симптом → нутритивная поддержка (приливы, суставы, когнитивный туман и др.)
5. Фазовый протокол (перименопауза / менопауза / постменопауза / андропауза и др.)
6. Нутритивный контекст лабораторных показателей (если введены)
7. Состав тела из биоимпеданса (если введён)
8. Активные KB-паттерны из `selectKBPatterns()`

---

## 6. GOOGLE APPS SCRIPT (`apps-script.js`)

### 6.1 Эндпоинты

| Метод | Параметры         | Действие                                       |
|-------|-------------------|------------------------------------------------|
| GET   | `?code=XXX`       | Валидация кода доступа                         |
| GET   | `?action=expert&...` | Приём Expert-запроса (image beacon)         |
| POST  | body JSON         | Fallback приём Expert-запроса                  |

### 6.2 Жизненный цикл Expert-запроса

```
Клиент нажимает «Expert-разбор»
  → Apps Script: проверяет статус кода → проверяет лимит 30 дней
  → Пишет дату в колонку F таблицы
  → Отправляет письмо нутрициологу с полным профилем клиента
  → Отправляет подтверждение клиенту (если есть email)
```

Письмо нутрициологу содержит: профиль, биометрику, симптомы, когницию, питание, активность, добавки, стресс, цикл, биоимпеданс, анализы.

### 6.3 Механизм ответа нутрициолога — Backstage-бот (приём → правка → отправка → доставка)

Полный цикл «заявка клиента → персональный ответ нутрициолога → PDF клиенту».
Логика бота живёт в **`cloudflare-worker.js`** (Telegram webhook), доставка PDF — в
**`apps-script.js`** (`handleSendReport`). Состояние — в KV-неймспейсе `EXPERT_DRAFTS`.

**Действующие лица**
- **Backstage-бот** в Telegram, чат нутрициолога = секрет `NUTRITIONIST_CHAT_ID`.
- **Worker**: `notifyBackstageBot()` (создаёт заявку), обработчик callback-кнопок
  (`approve` / `reject` / `edit`), `handleTgMessage()` (ловит текст ответа).
- **KV `EXPERT_DRAFTS`** — два вида ключей:
  - `draft:<requestId>` — JSON заявки (профиль, вопрос, lang, nutritionist_reply, status). **TTL 7 дней.**
  - `editing:<chatId>` — какой `requestId` сейчас редактируется этим чатом. **TTL 48 часов.**
- **Apps Script `send_report`** — генерит Google Doc → PDF → шлёт письмо клиенту через
  `GmailApp`, логирует дату в колонку **G** Sheet; вызывается воркером по `APPS_SCRIPT_URL`.

**Поток**
```
1. Клиент шлёт Expert-заявку (action=expert → Apps Script handleExpertRequest)
     → notifyBackstageBot(): worker кладёт draft:<id> (TTL 7д) и постит карточку
       нутрициологу с кнопками [✍ Написать ответ] [❌ Отклонить].
2. «Написать ответ» (callback edit):
     → editing:<chatId> = requestId (TTL 48ч); бот шлёт «Режим редактирования… 48 часов на правку».
3. Нутрициолог пишет текст разбора одним сообщением в чат:
     → handleTgMessage(): читает editing:<chatId>, кладёт текст в draft.nutritionist_reply,
       удаляет editing:<chatId>, возвращает превью с кнопками [✅ Отправить клиенту] [❌ Отклонить].
4. «Отправить клиенту» (callback approve):
     → МГНОВЕННЫЙ ответ кнопке «⏳ Отправляю…» (до тяжёлой работы — нет дабл-клика);
     → замок status=sending + sending_at (авто-снятие через 120с);
     → перевод ru→язык клиента через Claude (translateReply), если lang ∉ {ru,uk};
     → fetch APPS_SCRIPT_URL action=send_report → PDF + письмо клиенту;
     → УСПЕХ: карточка «✅ Отправлено клиенту», draft удаляется;
     → СБОЙ: draft СОХРАНЯЕТСЯ, карточка «⚠ сбой» + причина + кнопка [🔄 Повторить отправку].
5. «Отклонить» (callback reject): карточка «❌ Отклонено», draft удаляется.
```

**Таймеры (важно не путать)**
- `draft:` **7 дней** — сколько заявка ждёт в боте. Это запас, не дедлайн.
- `editing:` **48 часов** — окно «я сейчас печатаю этот разбор» после нажатия «Написать
  ответ». Переживает ночь/выходные. **Это НЕ срок ответа клиенту.**
- Замок `sending` **120 секунд** — защита от двойного клика на «Отправить».
- **SLA клиенту = 48 часов** (продуктовое обещание). Нутрициолог НЕ обязан отвечать в
  течение `editing`-окна; заявка спокойно ждёт до 7 дней, отвечать можно в рабочее время.

**Конкурентность**
`editing:<chatId>` — один слот на чат → один разбор в работе за раз, привязанный к той
карточке, где нажали «Написать ответ». Новая входящая заявка ключ `editing:` НЕ трогает —
она просто висит со своими кнопками. Переключиться = нажать «Написать ответ» на другой
карточке. Сообщение в чат без активного режима правки игнорируется (`not_editing`).

**Dev-коды (тест без Sheet)**: `VIAL-*-2024` обходят таблицу. Должны быть прописаны в
ДВУХ местах: фронт `checkCode()` (в каждом `interpreter-*.html`) И `apps-script.js`
`DEV_CODES`. Рассинхрон = вход работает, но Expert-заявка падает в `invalid`
(так было с `VIAL-EXPERT-ONB-2024`).

**Известные TODO**: reject не шлёт клиенту «нужно уточнение»; целевой апгрейд — заменить
таймерный `editing:`-режим на привязку через Telegram `reply_to_message` (свайп-ответ на
карточку) → снимет таймер, лимит «один за раз» и любую путаницу порядка.

---

## 7. ЛЕНДИНГ ИНТЕРПРЕТАТОРА (`index.html`)

### 7.1 Назначение

Точка входа в экосистему интерпретатора. Отображает:
- Галерею поддерживаемых устройств с 3D-анимацией (CSS transform-style: preserve-3d)
- Раздел с планами (VIO / PRO / EXPERT / ELITE) — `id="plans"`
- Кнопки перехода в конкретный интерпретатор

### 7.2 Устройства на главной

10 устройств с золотыми PNG-фото (из `images-in/`):
Oura Ring, Apple Watch, Garmin Fenix 8, Samsung Galaxy Watch, Fitbit Charge 6, Polar Vantage V3, WHOOP 5.0, Xiaomi Smart Band 9, Withings ScanWatch 2, Amazfit GTR 5.

Анимация: каждое устройство крутится по оси Y (`animation: spinY 7s linear infinite`). При hover — glow-эффект через `drop-shadow`.

### 7.3 Раздел планов (`#plans`)

3-колоночная grid-сетка с карточками:
- **VIO** (бесплатно) — базовый, 6 шагов
- **PRO** — 14 шагов, AI-анализ, история
- **EXPERT** — всё PRO + нутрициолог 2×/мес (письменный разбор за 48 ч) + лаборатория
- **ELITE** — всё EXPERT + ежедневный Telegram-чат + Zoom 1×/нед + еженедельный PDF

---

## 8. СТРАНИЦА МЕТОДОЛОГИИ (`methodology.html`)

- `noindex, nofollow` — не индексируется
- Публичная страница с описанием научной базы интерпретатора
- Содержит T-объект переводов (аналогичный интерпретаторам), поддерживает 12 языков
- Описывает принципы работы нутрициолога-консультанта, правовые рамки, источники

---

## 9. КЛИНИЧЕСКАЯ БАЗА ЗНАНИЙ

### 9.1 Структура

Хранится в двух форматах:
- **`knowledge-base.md`** — сводный MD-файл для разработки/ревью
- **`Infa Cloude/P-F/*.txt` и `P-M/*.txt`** — детальные источники (полный текст исследований, цитаты, метаанализы)
- **`Infa Cloude/LAB MODULE/*.txt`** — клинические референсы лабораторных показателей
- **Инлайн в `cloudflare-worker.js`** — SYSTEM_PROMPT содержит компактную, готовую к промптингу версию всех 25 паттернов

### 9.2 Структура каждого паттерна (в .txt файлах)

```
Триггеры (биометрические признаки) → условие активации паттерна
Физиология (краткое объяснение механизма)
Питание (конкретные продукты + механизм + количество)
Нутрицевтики (таблица: добавка / доза / тайминг)
Строго исключить (продукты/вещества с механизмом)
Лабораторные маркеры (что проверить, почему)
Образ жизни
```

Каждый паттерн имеет код `P-F{N}` (женский) или `P-M{N}` (мужской), на который ссылается `selectKBPatterns()` в Worker.

---

## 10. ИНСТРУМЕНТ ГЕНЕРАЦИИ КОДОВ (`code-generator.html`)

Внутренний инструмент (не привязан к домену, открывается локально):
- Генерирует N кодов PRO (`VL-P-XXXXXXXX`) и N кодов MAX (`VL-M-XXXXXXXX`)
- Символы: A–Z без O/I/L, цифры 2–9 без 0/1 (исключены визуально похожие)
- Экспорт: CSV для Google Sheets, TXT для Hotmart (Pro и Max отдельно)

**Workflow:**
1. Сгенерировать коды → скачать CSV → загрузить в Google Sheets (Apps Script)
2. Загрузить TXT-файл в Hotmart как пароли доступа к продукту
3. Hotmart автоматически выдаёт код покупателю после оплаты

---

## 11. ДИЗАЙН-СИСТЕМА

### CSS-переменные (единые для всего проекта)

```css
--gold:      #c4963c   /* основной золотой */
--gold-lt:   #e2b96a   /* светлый золотой */
--gold-dim:  rgba(196,150,60,.18)  /* полупрозрачный золотой */
--dark:      #08090c   /* основной фон */
--dark2:     #0f1014
--dark3:     #161820
--t1:        #f0ede8   /* основной текст */
--t2:        #a8a49e   /* вторичный текст */
--t3:        #5c5854   /* третичный текст / заглушки */
--b2:        (border color)
```

### Шрифты

| Семейство              | Применение                                |
|------------------------|-------------------------------------------|
| Cormorant Garamond     | Заголовки, hero, цены                     |
| DM Sans                | Основной body-текст                       |
| Oswald                 | Капслок-лейблы, бейджи, кнопки           |
| Playfair Display       | Результаты, крупные цифры в интерпретаторе|
| Noto Sans JP/KR        | Подгружается динамически для ja/ko        |

### Фоны

Каждый тариф имеет собственную фоновую картинку (`images-bg/galaxy-*.jpg`) — тёмная космическая тема с золотыми оттенками. Реализовано через `body::before { background-image: ...; position: fixed; }` для работы на iOS.

---

## 12. НАВИГАЦИЯ И ДЕПЛОЙ

### Деплой интерпретатора (HTML-файлы)

```bash
git add interpreter/interpreter-*.html
git commit -m "..."
git push origin main
# → GitHub Pages автоматически, ~1–2 мин
```

### Деплой Cloudflare Worker

```bash
cd interpreter
wrangler deploy
# → Cloudflare Workers, edge-деплой
```

### Apps Script

Обновляется вручную через интерфейс Google Apps Script (script.google.com). Нет автодеплоя.

---

## 13. ТИПИЧНЫЕ ЗАДАЧИ И ГДЕ ИСКАТЬ

| Задача                                     | Файл / место                                         |
|--------------------------------------------|------------------------------------------------------|
| Добавить перевод ключа                     | Объект T в нужном interpreter-*.html                 |
| Изменить шаг анализа                       | HTML-блок `id="stepN"` в нужном interpreter-*.html   |
| Изменить клиническую рекомендацию          | SYSTEM_PROMPT в cloudflare-worker.js                 |
| Добавить новый паттерн                     | SYSTEM_PROMPT + selectKBPatterns() в worker          |
| Изменить лимит Expert-запросов             | Переменная `SUBSCRIPTION_DAYS` в apps-script.js      |
| Добавить новое устройство                  | Раздел импорта в interpreter-*.html                  |
| Сгенерировать коды для нового тарифа       | code-generator.html → скачать CSV → Google Sheets    |
| Изменить цену в планах                     | index.html раздел `#plans`                           |
| Исправить ошибку TDZ (let/const)           | Перенести объявление выше первого вызова функции     |

---

## 14. ИЗВЕСТНЫЕ АРХИТЕКТУРНЫЕ ОСОБЕННОСТИ

1. **Нет сборщика.** Всё CSS, JS, переводы — inline в HTML. Изменять точечно через Edit.

2. **T-объект как единственный источник переводов.** Никаких внешних файлов локализации. При добавлении нового элемента с `data-t="key"` ключ `key` должен быть добавлен во все 12 языковых секций T.

3. **Fallback переводов:** функция `t(k)` возвращает `T[lang][k] || T.ru[k] || k`. То есть русский — дефолтный язык для отсутствующих ключей.

4. **Дублирование кода между файлами.** Все четыре интерпретатора содержат одинаковые блоки CSS, T-объекты (для базовых ключей), функции навигации и импорта. При изменении общего поведения нужно обновлять все файлы.

5. **Prompt caching в Worker.** SYSTEM_PROMPT помечен `cache_control: { type: 'ephemeral' }`. Anthropic кэширует его до 5 минут — экономит ~90% токенов на системный промпт при частых запросах.

6. **Переменные в T-значениях.** Некоторые строки содержат `{n}` как плейсхолдер (например, `step_of: 'Шаг {n} из 7'`). Замена происходит через `str.replace('{n}', value)` в JS.

7. **RTL для иврита.** `setLang('he')` переключает `document.documentElement.dir = 'rtl'`.

8. **Имя в промптах.** Cloudflare Worker использует имя «Марина» в системной роли. Все вхождения в UI-текстах интерпретаторов и methodology.html заменены на нейтральное «нутрициолог/специалист».

---

## 15. ИНТЕГРАЦИЯ OURA RING — PRODUCTION OAUTH (задача + план)

### 15.1 Статус (обновлено 2026-06-02)
- 2026-06-01: письмо на **api@ouraring.com** → ответ Becky (Oura Customer Success, ticket **#6994484**): прямого API-доступа нет, направили в partnership-трек.
- 2026-06-02: заполнена и отправлена бизнес-форма **ouraring.com/business** (трек «Партнёры и реселлеры»; организация = «Медицинские технологии»; причина = «Интеграция с данными Oura»; referral). Получен автоответ «онбордим партнёров, свяжемся».
- **Текущий статус: ждём, пока partnership/sales-команда Oura выйдет на связь** (ориентир Becky — до 10 рабочих дней, т.е. ~к середине июня 2026). Если тишина — писать напрямую Becky по тикету #6994484.
- **Ждём от Oura:** `client_id` + `client_secret` + подтверждение redirect URI + scopes + условия коммерческого/партнёрского доступа.
- Самостоятельно зарегистрировать OAuth-приложение «без покупки нельзя» → только через партнёрский трек.
- **До получения credentials:** на проде работает только VIO в режиме Sandbox-демо. Production-механизм спроектирован (§15.3–15.8), но не построен.

### 15.2 Разделение по тарифам (продуктовое решение)
- **VIO (free)** — Sandbox-демо: вкладка «✨ Demo» на карточке Oura → `fetchOuraSandbox()` тянет `api.ouraring.com/v2/sandbox/...` (auth — любая строка, шлём `Bearer demo`), усредняет 7 дней, при недоступности эндпоинта подставляет реалистичный fallback (`OURA_DEMO_FALLBACK`). VIO сам по сути демо — этого достаточно. `OURA_MODE='sandbox'`.
- **PRO / PRO-EXPERT / ELITE** — настоящий **OAuth2 Authorization Code flow** (production API, реальное кольцо пользователя). Token-paste («Токен API») остаётся как fallback для продвинутых.

### 15.3 Почему серверная часть обязательна
`client_secret`, обмен `code → access_token` и refresh-токенов нельзя держать во фронте (утечёт; CORS на token-эндпоинте). Всё это живёт на **Cloudflare Worker** (`interpreter.viaelcom.workers.dev`, см. §5.2.1), у которого уже есть роутер, KV, секреты через `wrangler secret`, CORS и HMAC-подпись (как в `/cal-webhook`).

### 15.4 Конфигурация (добавить при получении credentials)
- Секреты: `wrangler secret put OURA_CLIENT_ID`, `OURA_CLIENT_SECRET`.
- Новый KV namespace `OURA_TOKENS` (хранит `{access_token, refresh_token, expires_at}` по ключу `sid`).
- Redirect URI: `https://interpreter.viaelcom.workers.dev/oura/callback`.
- Scopes: `daily personal heartrate spo2` (+ детальный роут `sleep`).

### 15.5 Три роута Worker
- `GET /oura/start?sid=…` — собирает authorize-URL, `state` = HMAC(sid) (приём из `/cal-webhook`), 302 → `cloud.ouraring.com/oauth/authorize`.
- `GET /oura/callback?code=&state=` — проверяет state, POST `api.ouraring.com/oauth/token` (grant_type=authorization_code + секрет) → токены в KV под `sid`, 302 обратно на `interpreter-pro.html?oura=connected`.
- `GET /oura/metrics?sid=…` — берёт токен из KV (если `Date.now()>expires_at` → refresh через grant_type=refresh_token, обновляет KV), тянет v2-эндпоинты за 7 дней с **production** API, считает нормализованный `ex` (hrv, rhr, sleepHours, deepMin, tempDev, spo2, energy, readiness), отдаёт JSON. Access-token в браузер не попадает — Worker проксирует.

### 15.6 Фронт (pro / pro-expert / elite)
- Новая вкладка на карточке Oura «🔗 Подключить кольцо» → `connectOura()`: генерит/хранит `sid` (localStorage), открывает `/oura/start`.
- По возврату (`?oura=connected`) → `fetchOuraLive()` дёргает `/oura/metrics?sid`, получает `ex` и кормит в **тот же** `applyExtracted` + `applyImportedToSliders` (см. §4.4) — pipeline заполнения шагов уже готов, меняется только источник данных.
- `OURA_MODE` флипнуть с `'sandbox'` на `'production'`.
- Все новые строки — во все 12 языков T (см. §4.3).

### 15.7 Точность в production vs Sandbox
С реальным OAuth доступен детальный роут `sleep` → **настоящие** `average_hrv` (HRV в мс) и `lowest_heart_rate` (истинный пульс покоя) + `temperature_delta`. В Sandbox их нет — там HRV/RHR приближались из `daily_readiness`. В production приближения убрать, брать реальные поля.

### 15.8 Открытый вопрос
Привязывать ли `sid` к коду доступа тарифа: тогда у ELITE данные кольца можно прокидывать нутрициологу через TG-флоу (§6.3). Альтернатива — анонимный `sid`. Решить при реализации.

### 15.9 Известная проблема Sandbox
На 2026-06-01 Sandbox-эндпоинты `daily_*` и `sleep` возвращают `Internal Server Error`; отвечает только `heartrate`. Поэтому VIO-демо опирается на fallback. Вопрос задан Oura в письме.

---

## 16. ИНТЕГРАЦИИ ДРУГИХ УСТРОЙСТВ — КАРТА И СТАТУСЫ (вторая волна)

На лендинге 10 устройств (§7.2). Модель доступа у вендоров разная — три категории. Архитектура авто-сопряжения везде та же, что у Oura (§15.3–15.6): server-side OAuth на Worker + единый `applyExtracted`-pipeline (§4.4). Условия доступа перепроверять в момент сборки (меняются).

### 16.1 Требуют партнёрского/коммерческого запроса (заявка подана)
- **Oura** — партнёрский трек, см. §15. Заявка 2026-06-02, ждём sales.
- **Garmin** — Garmin Connect Developer Program (нужны **Health API** + **Women's Health API**: сон, HRV, пульс покоя, стресс, Body Battery, SpO₂, шаги + цикловые данные — важно для женской секции). **Коммерция платная (license fee), есть бесплатная eval-фаза.** Заявка отправлена 2026-06-02 через форму «Contact Garmin Health» (`garmin.com/en-US/forms/wellnesspartner/`) — «A Garmin associate will be in touch». Callback URI планируем `…workers.dev/garmin/callback`.

### 16.2 Self-serve OAuth — писать никому не нужно, строим сами
- **Fitbit** (dev.fitbit.com), **WHOOP** (developer.whoop.com), **Polar** (Polar AccessLink), **Withings** (developer.withings.com — для коммерции возможен платный тариф/ревью). Та же серверная схема, что в §15.

**Fitbit — РЕАЛИЗОВАНО через GOOGLE HEALTH API (2026-06-XX, эталон), ждёт настройки и деплоя:**
- ⚠️ Fitbit закрыл регистрацию новых приложений на старом Web API → данные Fitbit теперь только через **Google Health API** (облачный REST v4, host `health.googleapis.com`, OAuth 2.0 Google). Интеграция переписана под него. Карточка/роуты в UI остаются «Fitbit».
- **Worker** (`cloudflare-worker.js`): GET-роуты `/fitbit/start`, `/fitbit/callback`, `/fitbit/metrics` + `ghealthRefresh`. OAuth2 Google Authorization Code (auth `accounts.google.com/o/oauth2/v2/auth`, token `oauth2.googleapis.com/token`, `access_type=offline&prompt=consent` → refresh; client creds в теле). Scopes: `googlehealth.sleep.readonly` + `googlehealth.health_metrics_and_measurements.readonly`. `state` подписан HMAC(GHEALTH_CLIENT_SECRET) (приём из `/cal-webhook`). Токены в KV `WEARABLE_TOKENS` (`fitbit:<sid>`, TTL 2ч), Google refresh НЕ возвращает новый refresh_token → храним старый.
- `/metrics` тянет за 7 дней `GET /v4/users/me/dataTypes/{type}/dataPoints?filter=…` и усредняет: `heart-rate-variability`→`rmssdMillis` (мс), `daily-resting-heart-rate`→`beatsPerMinute`, `oxygen-saturation`→`percentSaturation`, `sleep`→`summary.minutesAsleep` + `stagesSummary[type=DEEP].minutes`. Отдаёт `{ok,ex}`. **tempDev опущен** — у Google только абсолютная `core-body-temperature`, а шаг tempDev ждёт ночную девиацию (~0±0.5); совать абсолют нельзя.
- **Фронт** — `interpreter-pro.html` (эталон, без изменений при смене API): вкладка «🔗 Подключить» → `connectFitbit()` (генерит `sid`, редирект на `/fitbit/start?sid&ret`). Возврат `?fitbit=connected&sid` → `fetchFitbitLive()` → `/fitbit/metrics` → существующий `applyExtracted`+`applyImportedToSliders` (§4.4). Строки на 12 языков. Token/File-вкладки сохранены как fallback.
- **Чтобы заработало (делает владелец):** (1) **Google Cloud Console** → создать проект, включить Google Health API, создать OAuth 2.0 Client ID типа **«Web application»**, authorized redirect URI `https://interpreter.viaelcom.workers.dev/fitbit/callback`, настроить OAuth consent screen + запросить нужные scopes (sleep + health_metrics_and_measurements, потребует verification для продакшна); (2) `wrangler secret put GHEALTH_CLIENT_ID` + `GHEALTH_CLIENT_SECRET`; (3) KV `WEARABLE_TOKENS` уже создан (id в `wrangler.jsonc`); (4) `wrangler deploy`.
- ⚠️ Точный синтаксис `filter=` и форма value сверены по докам/примерам (developers.google.com/health), но финально проверить на живом токене.
- **TODO после проверки PRO:** тиражировать вкладку на `interpreter-pro-expert.html` и `interpreter-elite.html` (ждёт ОК — правило «не размножать по тарифам без спроса»). VIO остаётся на Sandbox-демо.
- Остальные (WHOOP/Polar/Withings) — тем же каркасом, когда дойдут руки.

### 16.3 Нет публичного веб-API → только файл/ручной ввод (как сейчас)
- **Apple Watch / Health** — HealthKit на устройстве, облачного API нет. Веб-авто-сопряжение невозможно; только `export.xml` или отдельное iOS-приложение (большая отдельная задача).
- **Samsung Health** — партнёрский доступ закрыт/ограничен, SDK только Android.
- **Xiaomi / Amazfit (Zepp)** — публичного OAuth нет, только экспорт.

---

## Сессия 2026-06-02 — обогащение KB, честность вывода, тон, чистка ИП

Крупный апдейт ИП. Все механизмы ниже — в проде (последние деплои воркера) и в `main`.

**Клиническая база расширена до P-F1…P-F20 / P-M1…P-M11.** Из подготовленных
пользователем реферированных обзоров (`Infa Cloude/N-1…N-5`, gitignore):
- N-3: **новые паттерны** P-F19 (аноректальное/проктология), P-F20 (тазовое дно:
  пролапс/недержание мочи, PFMT), P-M11 (ЭД как ССС-сигнал); P-F11 §8 (функц. ЖКТ).
- N-4 (щитовидка): P-F6 §7 + P-M5 §7 (возрастной ТТГ NHANES, иерархия Хашимото,
  U-кривая йода, биотин-ловушка, LT4-взаимодействия). Исправлены огрубления.
- N-5 (воспаление): P-F8 §6 + P-M4 (VAT→IL-6→СРБ, миокин-парадокс, омега-3 индекс,
  GlycA/ферритин). Реестр — `PATTERN-REGISTRY.md`. Свёрнуто в SYSTEM_PROMPT воркера
  (сжатые блоки) + детектор `selectKBPatterns`; детект новых паттернов — на
  прокси-полях gsm/uro/gi/horm (+ спец-вопросы анкеты P-F19/20/M11, 12 языков).

**Верификация первоисточников (процесс).** Ключевые числа сверяются через
WebSearch/WebFetch и правятся. За сессию: PRIDE −47% (не −58%), Wu МетС «молодые
мужчины», рыбий жир медиана 600мг/255 продуктов, клетчатка RR 0.53, PFMT «8× чаще»,
ашваганда **+57.4 нг/дл ≈ +2.0 нмоль/л (НЕ путать единицы) / кортизол −27.9%**
(пиновано в P-M1/P-M9). Принцип: ссылки в KB — из вторых рук, кроме провёренных.

**Роутинг модели по языку** (вызов разбора ~стр. 905 воркера): **he/ar/ja/ko →
`claude-sonnet-4-6`** (Haiku галлюцинирует иврит), остальные → Haiku. `max_tokens`
разбора **2600** (he/ja/ko токеноёмки — иначе обрыв). См. memory `project_ip_model_routing`.

**Тон-голос (SYSTEM_PROMPT).** Блок «ТОН — ЗАБОТА» (валидация/нормализация/без стыда/
надежда/бережные красные флаги) + тёплое приветствие в начале и доброе пожелание
в конце разбора. Управляет выводом на всех 12 языках.

**Честность «не указано» (минимальный ввод).** Фронт (pro/pro-expert/elite): глобальный
трекер `window.__touched` (input/change листенеры) → payload `_skipped` (нетронутые
«мягкие» поля hrv/sleep_qual/stress/temp/…). Воркер: хелпер `SK(key,val)` показывает
«не указано» в РЕФЕРЕНСНЫХ НОРМАХ и ДАННЫХ КЛИЕНТА + `skipNote` запрещает ИИ
интерпретировать дефолты. Локальный слой: `seenF()` + пост-фильтр массива `ins`
(убирает `t:'ok'` карточки 💓🫁🌡️🔥📈🧠 для непройденных полей); `renderBioLoad`
показывает «—» вместо выдуманных %. vio без трекера → поведение не меняется.

**Биоимпеданс/BMR.** Удалены поля % воды / костная масса / BMR-инпут (BIA-неточны,
не использовались). BMR теперь **вычисляется в воркере (Mifflin-St Jeor)** из веса/
роста/возраста/пола → ИИ как калоражный якорь. Осталось: жир/мышцы/висцеральный/
биовозраст. Жёсткие поля биоимпеданса пока без подсказок-референсов (TODO).

**Прочие фиксы.** Баг «мужчина·перименопауза» (фронт авто-выбор андропаузы + guard
в воркере male+пери/мено/пост→андро); прокидка жалоб GSM/урология/ЖКТ-проктология
в сообщение ИИ; бэкстейдж AI-подсказки нутрициологу — мужская рамка (не «цикл/
приливы»); часовые пояса в анкете → латинские названия городов (было кириллицей);
мужской гормон-трекер «Другое»→андропауза (не «Пост»).

**АНАЛИЗЫ УБРАНЫ ИЗ ИП (2026-06-02).** Шаг «Анализы» (14 полей) удалён из pro/
pro-expert/elite — авто-читать анализы ответственно нельзя (референсы/единицы — зона
риска), их место — ELITE-анкета → живой нутрициолог. Перенумерованы шаги (step14/15→
13/14), навигация goTo, прогресс-точки (16→15), бейджи (→/14). ⚠️ pro-expert/elite
имели пред-баг бейджей (/16 у поздних шагов) — учтено. `data.labs` (→null),
`labsContext` воркера, лаб-условия детектора — **остаются спящими** (штатно
отрабатывают отсутствие). Карточка «рекомендованные анализы сдать» (getLabTests/
`labCard`) — СОХРАНЕНА. vio не затронут. Функция финала `proceedFromStep15` имеет
устаревшее имя, но работает.

---

*Конец документа.*
