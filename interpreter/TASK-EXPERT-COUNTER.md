# Счётчик «2 PDF-разбора / 30 дней» для PRO-EXPERT

> **Статус:** реализуется.
> **Тариф:** PRO-EXPERT (€79/мес).
> **Цель:** клиент может заказать 2 письменных разбора нутрициолога в течение 30 дней, с обязательным cooldown 7 дней между запросами.

---

## 1. Бизнес-правила

| Правило | Значение |
|---|---|
| Максимум разборов в окне | **2** |
| Размер окна | **30 дней, скользящее** |
| Минимальный интервал между запросами | **7 дней** |
| Что хранится на сервере | JSON-массив дат запросов в колонке F Google Sheet |

**Почему 7 дней между запросами:** клиент за неделю накопит свежие показатели с трекера → второй разбор будет содержательным, а не дублировать первый.

---

## 2. Структура хранения (Google Sheet)

| Кол. | Что | Старый формат | Новый формат |
|---|---|---|---|
| A | Код доступа | `VL-M-XXXXXXXX` | без изменений |
| B | Тариф | `MAX` | без изменений |
| C | Статус | `FREE / ACTIVE / EXPIRED` | без изменений |
| D | Дата активации | ISO | без изменений |
| E | Дата истечения (30 дней от активации) | ISO | без изменений |
| F | **Expert-запросы** | одна ISO-дата строкой | **JSON-массив дат** `["2026-05-01T...","2026-05-12T..."]` |

**Обратная совместимость:** если в F лежит старая одиночная ISO-строка (от прошлой логики 1/30) — при первом чтении автоматически конвертируется в массив `[date]`. Ручная миграция Sheet не нужна.

---

## 3. Алгоритм проверки (Apps Script)

```
on Expert-request(code, ...):
  row ← findRow(code)
  if row.status === EXPIRED       → reject('expired')

  history ← parseHistory(row.F)   // массив дат
  now ← Date.now()

  // фильтруем окно
  recent ← history.filter(d => (now - d) < 30 дней)

  // ① лимит окна
  if recent.length >= 2:
    next_date ← min(recent) + 30 дней
    return reject('monthly_limit', next_date)

  // ② cooldown
  if recent.length >= 1:
    last ← max(recent)
    if (now - last) < 7 дней:
      next_date ← last + 7 дней
      return reject('cooldown_7d', next_date)

  // ③ запись
  recent.push(now)
  row.F ← JSON.stringify(recent)
  sendEmailToNutritionist(...)
  return ok({ used: recent.length, max: 2, next_date: hint })
```

---

## 4. API-контракт

### Endpoint: `?action=expert` (POST/GET)

**Success:**
```json
{
  "ok": true,
  "used": 1,
  "max": 2,
  "next_available_at": "2026-05-12T..."   // когда станет доступен следующий разбор (now + 7 дней)
}
```

**Reject — лимит исчерпан:**
```json
{ "ok": false, "reason": "monthly_limit", "next_date": "2026-06-01T..." }
```

**Reject — cooldown:**
```json
{ "ok": false, "reason": "cooldown_7d", "next_date": "2026-05-08T..." }
```

**Reject — код истёк / неверный:**
```json
{ "ok": false, "reason": "expired" }
{ "ok": false, "reason": "invalid" }
```

### Endpoint: `?code=XXX` (валидация при входе) — расширяется

К существующему ответу `{ ok, status, expires }` добавляется:
```json
{ "expert_used": 1, "expert_max": 2, "expert_next_at": "2026-05-12T..." }
```
Чтобы UI сразу знал состояние счётчика без отдельного запроса.

---

## 5. UI в `interpreter-pro-expert.html`

Рядом с формой запроса (`#maxQuestion` + `#maxSendBtn`) — индикатор:

**Доступен:**
```
[ Использовано 1 из 2 разборов · следующий доступен 12.05 ]
```

**Cooldown:**
```
[ ⏳ Следующий разбор будет доступен 12.05 — клиент накопит свежие данные за 7 дней ]
(кнопка #maxSendBtn — disabled)
```

**Лимит исчерпан:**
```
[ ✕ Лимит 2 / 30 дней исчерпан · следующий доступен 01.06 ]
(кнопка #maxSendBtn — disabled)
```

Состояние подтягивается из ответа валидации кода. После успешного запроса — обновляется локально (`used += 1`) + дисабл кнопки до новой даты.

i18n: ключи `counter_used` (`Использовано {n} из {max}`), `counter_next` (`следующий доступен {date}`), `counter_cooldown` (`⏳ Накопите данные за 7 дней · следующий разбор {date}`), `counter_limit` (`✕ Лимит {max} / 30 дней исчерпан · следующий {date}`).

---

## 6. Изменяемые файлы

| Файл | Что меняется |
|---|---|
| [interpreter/apps-script.js](interpreter/apps-script.js) | блок `expert` (≈ строки 81–91) + расширение validate-эндпоинта |
| [interpreter/interpreter-pro-expert.html](interpreter/interpreter-pro-expert.html) | вёрстка индикатора + обработка нового ответа + 4 ключа i18n × 12 языков |

Cloudflare Worker и interpreter-vio/pro/elite — НЕ затрагиваются.

---

## 7. Что НЕ делаем сейчас (следующие этапы)

- Telegram-бот для нутрициолога с AI-черновиком и PDF-генерацией → см. [TASK-EXPERT-BOT.md](interpreter/TASK-EXPERT-BOT.md).
- PDF-шаблон ответа нутрициолога — пока ответ остаётся email-ом.
- Хранение исторических данных биометрии на сервере — пока используем данные с трекера в момент запроса.
