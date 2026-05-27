# Задача: уведомление нутрициологу в Telegram при оплате программы ведения

> **Статус:** не начато.
> **Страницы:** `Menopauza-program.html`, `Andropauza-program.html`, `Antivikove-program.html`, `Estrogen-program.html`.
> **Цель:** при нажатии «Оплатити супровід →» нутрициолог мгновенно получает карточку в `@viael_backstage_bot` с именем, email, программой и тарифом клиента.

---

## 1. Триггер

Функция `confirmPayment()` в каждой из 4 страниц. Уже собирает:
- `name` — из `#payName`
- `email` — из `#payEmail`
- `selOpt` — выбранный вариант (1 / 2 / 3)
- `lang` — текущий язык
- Hotmart-ссылка открывается параллельно — уведомление не блокирует переход.

---

## 2. Карточка в Telegram

```
🌿 Новая заявка — Менопауза
Имя:     Анна Иванова
Email:   anna@example.com
Тариф:   Супровід 3 міс · € 590
Мова:    uk
Час:     27 May 2026, 22:45 UTC
```

Программа:
- `Menopauza-program.html` → `🌿 Менопауза`
- `Andropauza-program.html` → `⚡ Андропауза`
- `Antivikove-program.html` → `✦ Антивіковий`
- `Estrogen-program.html` → `🌸 Естроген`

---

## 3. Реализация

### 3.1 Cloudflare Worker — новый endpoint `/program-notify`

```
POST /program-notify
{
  "program": "Menopauza",
  "name": "Анна",
  "email": "anna@example.com",
  "option": 2,
  "price": "€ 590",
  "lang": "uk"
}
```

Worker формирует текст карточки и отправляет `sendMessage` в `NUTRITIONIST_CHAT_ID` (уже есть в secrets).

Ответ `{ ok: true }` — клиентский JS его игнорирует (fire-and-forget).

### 3.2 Изменение в каждой из 4 страниц

В `confirmPayment()` — добавить `fetch` к Worker **до** `window.open`:

```js
// fire-and-forget — не ждём ответа
fetch('https://vial-claude-proxy.viaelcom.workers.dev/program-notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    program: 'Menopauza',   // строка-константа, разная для каждой страницы
    name:    name,
    email:   email,
    option:  selOpt,
    price:   PRICES[selOpt],
    lang:    lang
  })
}).catch(() => {});  // ошибки сети не показываем клиенту

window.open(url + '...', '_blank');
```

---

## 4. Что менять и где

| Файл | Что | Метод |
|---|---|---|
| `cloudflare-worker.js` | Новый `case '/program-notify'` | добавить |
| `Menopauza-program.html` | `confirmPayment()` | +fetch, program='Menopauza' |
| `Andropauza-program.html` | `confirmPayment()` | +fetch, program='Andropauza' |
| `Antivikove-program.html` | `confirmPayment()` | +fetch, program='Antivikove' |
| `Estrogen-program.html` | `confirmPayment()` | +fetch, program='Estrogen' |

---

## 5. Порядок реализации

1. Worker: добавить `/program-notify` endpoint → задеплоить → протестировать curl.
2. `Menopauza-program.html`: добавить fetch → проверить в браузере (открывается Hotmart + уведомление в боте).
3. Остальные 3 страницы — по одной, после ок на каждую.
