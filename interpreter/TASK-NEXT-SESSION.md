# Задание на следующую сессию

> **Для:** Claude, который начнёт следующую сессию (без памяти этой).
> **Дата создания:** 2026-05-24.
> **Пользователь:** Игорь (`dacigor@gmail.com`).
> **Состояние:** серверная логика счётчика разборов готова и запушена. UI и логика ELITE — впереди.

---

## 1. Контекст проекта в одной картинке

VIA-L Longevity — две связки:

| Продукт | Где | Кому | Платежи |
|---|---|---|---|
| **Нутрициолог** `via-l.com` | главный сайт (4 языка) | 4 программы ведения, 7 гайдов | Hotmart |
| **Интерпретатор (ИП)** `interpreter/` | поддомен (12 языков) | VIO / PRO / PRO-EXPERT / ELITE | пока ничего — Hotmart на потом |

Клиент покупает гайд/программу нутрициолога → получает код → активирует доступ к ИП. **ИП не уводит клиента на via-l.com для покупок** — кнопки ведут на собственный лендинг тарифов (`./index.html#plans`). Это жёсткое правило.

Полное описание архитектуры: [interpreter/ARCHITECTURE.md](interpreter/ARCHITECTURE.md).

---

## 2. Что сделано в текущей сессии (24 мая)

### Финал VIO
- `interpreter-vio.html`: кнопка «Записаться → via-l.com» заменена на «Просмотреть тарифы → ./index.html#plans». Ключ `book` → `view_plans` во всех 12 языках.
- Удалена кнопка «💬 Консультация» из bottom-nav (вела на via-l.com).

### Финал PRO (`interpreter-pro.html`)
- Те же замены utечек на via-l.com (3 точки: кнопка, футер, bottom-nav).
- **Удалён мёртвый блок `#cta-max`** (был `display:none` навсегда — никогда не активировался JS).
- В блоке `#cta-marina` убрано имя «Марина» в `cta_desc` всех 12 языков, заменено на «нутрициолог».
- Переписан текст под аудиторию: **женщины 40+ перименопауза/менопауза, мужчины 45+ андропауза**.
- Кнопки апсейла перестроены: ряд 1 — `Пройти заново` + `📄 PDF`, ряд 2 — **PRO+EXPERT · €79/мес** + **ELITE · €390 / €590** (рядом).

### Финал PRO-EXPERT (`interpreter-pro-expert.html`)
- **Минимальные правки** (после revert агрессивных изменений): удалены 3 утечки на via-l.com (кнопка, футер, bottom-nav). Кнопка переименована «Записаться → Просмотреть тарифы», ключ `book` → `view_plans` в 12 языках.
- `#cta-max` и текст `cta_desc` НЕ трогали — пользователь сказал оставить.

### Серверная логика счётчика разборов (`apps-script.js` v3.1)
- Колонка F в Google Sheet теперь — **JSON-массив дат запросов** (с обратной совместимостью к старой одиночной ISO-дате).
- **EXPERT (PRO+EXPERT)**: 2 разбора в скользящем окне 30 дней + cooldown 7 дней между запросами.
- **ELITE**: только cooldown 7 дней, **без лимита окна** (детальная логика 8/12 разборов на программу — TODO).
- `validateCode` теперь возвращает `expert_used` / `expert_max` / `expert_next_at` — UI знает счётчик сразу при входе.
- Различение тарифа по колонке B: `MAX` → EXPERT, любая строка с подстрокой `ELITE` → ELITE.
- Хелперы: `parseExpertHistory`, `isElitePlan`, `expertStateFromHistory`.

**Деплой:** код залить в существующий Apps Script Web App `AKfycbyWirCAJ...` (обслуживает PRO-EXPERT + ELITE). Деплой PRO (`AKfycbxa...`) не трогать — там Expert-запросов нет.

### Документы задач
- [TASK-EXPERT-COUNTER.md](interpreter/TASK-EXPERT-COUNTER.md) — счётчик 2/30 + cooldown 7 (бизнес-правила, API-контракт, миграция Sheet, дизайн UI).
- [TASK-EXPERT-BOT.md](interpreter/TASK-EXPERT-BOT.md) — Telegram-бот «backstage» для нутрициолога (AI-черновик через Claude → редактирование в боте → PDF клиенту email-ом).

### Коммиты сегодня
```
290502d  feat(apps-script): Expert counter 2/30 + cooldown 7d, tariff-aware
471c039  fix(interpreter-pro-expert): remove via-l.com leaks, rekey book → view_plans
2ea7781  Revert "fix(interpreter-pro-expert): rebuild final CTA — ..."
7bde853  fix(interpreter-pro-expert): rebuild final CTA — ...   (← откачен!)
53865eb  fix(interpreter-vio): remove «💬 Консультация» from bottom-nav
4d8a9a0  fix(interpreter-pro): rebuild final CTA — drop dead cta-max, add upsells
c6e41bf  fix(interpreter-vio): replace «Записаться» with «Просмотреть тарифы»
```

---

## 3. Что нужно сделать дальше (по приоритету)

### 🎯 Приоритет 1 — UI индикатора счётчика в `interpreter-pro-expert.html`

Серверная часть готова и отдаёт `expert_used` / `expert_max` / `expert_next_at`. UI должен:

**Где:** рядом с формой `#maxQuestion` + `#maxSendBtn` (≈ строки 2904–2908).

**Состояния:**
1. **Доступен** (used < max, нет cooldown): `Использовано {used} из {max} разборов · следующий доступен {date}`.
2. **Cooldown** (есть запросы, last < 7 дней назад): `⏳ Накопите свежие данные за 7 дней · следующий разбор {date}`. **Кнопка `#maxSendBtn` — disabled.**
3. **Лимит исчерпан** (used >= max, EXPERT): `✕ Лимит {max} / 30 дней исчерпан · следующий {date}`. **Кнопка disabled.**

**Подтягивать состояние:**
- При входе по коду — из ответа `validateCode` (поля `expert_used` / `expert_max` / `expert_next_at`).
- Хранить локально в JS-переменной (`expertState`) и обновлять при успехе отправки (`used++`).
- Если API вернул `reason: 'cooldown_7d'` или `'monthly_limit'` — обновить локально и дисаблить кнопку до `next_date`.

**i18n:** добавить 4 ключа во все 12 языков объекта `T`:
```
counter_used     = "Использовано {used} из {max}"
counter_next     = "Следующий доступен {date}"
counter_cooldown = "⏳ Накопите данные за 7 дней · следующий разбор {date}"
counter_limit    = "✕ Лимит {max} / 30 дней исчерпан · следующий {date}"
```

**ELITE-нюанс:** для ELITE `max === null` (приходит с сервера). UI должен это понимать — не показывать «из max», только cooldown-состояние. Сейчас pro-expert.html не для ELITE, но логика хелпера должна быть готова для повторного использования в `interpreter-elite.html`.

### 🎯 Приоритет 2 — то же самое в `interpreter-elite.html`

После того как UI отлажен в pro-expert. ELITE использует тот же Apps Script, тот же контракт. Текст индикатора чуть другой («премиум»-тон), но логика та же.

### 🎯 Приоритет 3 — ELITE: точная логика 8/12 разборов

Сейчас в `apps-script.js`:
- `isElitePlan(plan)` — `true` если в колонке B есть подстрока `ELITE`.
- Лимит окна для ELITE отключён, только cooldown.

Нужно:
- Определиться с **именами тарифов** в колонке B: `ELITE-8W` (€390, 8 нед = 56 дней) и `ELITE-12W` (€590, 12 нед = 84 дня).
- Срок действия (колонка E): сейчас `SUBSCRIPTION_DAYS = 30` для всех. Для ELITE-8W должно быть 56, для ELITE-12W — 84.
- Лимит разборов: ELITE-8W → 8 за программу, ELITE-12W → 12. Считать **всю историю**, а не окно.
- Когда программа истекла — статус EXPIRED.

Это требует:
- Обновить генерацию кодов (`code-generator.html`) — добавить ELITE-8W и ELITE-12W как отдельные типы.
- Обновить `validateCode` и `handleExpertRequest` — читать тариф и подставлять правильные лимиты.

### 🎯 Приоритет 4 — Telegram-бот для нутрициолога (AI-черновик + PDF)

См. полный план в [TASK-EXPERT-BOT.md](interpreter/TASK-EXPERT-BOT.md). Это отдельный модуль, поэтапно:
1. Скелет бота → подтверждение что Worker → Telegram → нутрициолог работает.
2. Endpoint `/draft` в Cloudflare Worker → Claude API → текст в Telegram.
3. Inline-keyboard кнопки утверждения.
4. PDF-рендер (рекомендую `pdf-lib`).
5. Gmail OAuth → отправка PDF клиенту.

---

## 4. Правила работы с пользователем (ВАЖНО)

Все правила сохранены в [memory](/Users/foxmaster/.claude/projects/-Users-foxmaster-Library-Mobile-Documents-com-apple-CloudDocs-VIA-L-LONGEVITY/memory/) — обязательно прочитать `MEMORY.md` в начале сессии.

Кратко:
- **Никаких AskUserQuestion опросников** — пользователь раздражается. Излагай свою логику прозой, давай одно конкретное предложение.
- **Короткие ответы** — 3–8 строк прозы. Никаких больших таблиц/диаграмм/блоков кода без явной просьбы.
- **Approval per-file** — никогда не применяй паттерн, утверждённый для одного файла/тарифа, к следующему без отдельного «ок». Был инцидент: применил схему PRO к PRO-EXPERT без спроса — пришлось делать revert.
- **«дальше» / «продолжай»** = «перейди к следующему пункту обсуждения», НЕ «применяй предыдущий паттерн автоматически».
- **Перед изменением кода**: коротко опиши что меняешь, дождись «ок».

---

## 5. Полезные файлы для старта

- [interpreter/ARCHITECTURE.md](interpreter/ARCHITECTURE.md) — полная архитектура.
- [interpreter/apps-script.js](interpreter/apps-script.js) — серверная логика счётчика.
- [interpreter/TASK-EXPERT-COUNTER.md](interpreter/TASK-EXPERT-COUNTER.md) — детали текущей задачи.
- [interpreter/TASK-EXPERT-BOT.md](interpreter/TASK-EXPERT-BOT.md) — следующий модуль.
- `/Users/foxmaster/.claude/projects/-Users-foxmaster-Library-Mobile-Documents-com-apple-CloudDocs-VIA-L-LONGEVITY/memory/MEMORY.md` — правила работы с пользователем.

---

## 6. С чего начать новую сессию

1. Прочитать `MEMORY.md` (правила работы).
2. Прочитать этот файл (контекст).
3. Спросить пользователя: «Готов? Начнём с UI счётчика в pro-expert?» (одна строка, без длинных приветствий).
4. Дождаться его «да» — потом приступать.
