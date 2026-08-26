# Подача приложения Oura на production review (>10 пользователей)

**Куда:** `https://cloud.ouraring.com/oauth/applications` → наше приложение → *Submit for review*
**Аккаунт:** тот, к которому привязано кольцо владельца
**Контакт для Oura:** `integration@via-l.com`
**Основание:** ответ Dante, тикет #7814075 (2026-08-26) — см. `docs/OURA-FOLLOWUP-LETTER.md`
**Срок ответа Oura:** до 2 недель после подачи

---

## 1. Что вписать в поля приложения

**Application name**
```
VIA-L — Wearable Data Interpreter
```

**Short description** (одна строка, если поле короткое)
```
Turns your Oura sleep, HRV and activity data into plain-language weekly wellness guidance.
```

**Full description** (если есть большое поле)
```
VIA-L is a wellness platform for adults in their late thirties and beyond. It reads the
data an Oura Ring already collects — sleep stages and duration, HRV, resting heart rate,
body temperature trend, activity and workouts — and explains what changed and why, in
plain language, in twelve languages.

Members connect their Oura account themselves via OAuth. The data is used to generate a
daily summary and a weekly review for that member, and, if the member chooses to work
with a wellness specialist, to show the same numbers to that specialist. We do not sell
data, do not use it for advertising, and do not share it with third parties beyond the
model provider that generates the written summary.

VIA-L is a wellness product. It does not diagnose, treat or prevent disease and is not a
medical device.
```

**Homepage URL**
```
https://via-l.com
```

**Terms of Service URL**
```
https://via-l.com/legal/terms.html
```

**Privacy Policy URL**
```
https://via-l.com/legal/privacy.html
```

**Redirect URL(s)**
```
https://interpreter.viaelcom.workers.dev/oura/callback
```

**Scopes** (уже используются в воркере, `OURA_SCOPES`)
```
personal daily heartrate workout spo2
```

**Connected user** — кольцо владельца, подключение подтверждено вживую 2026-06-12
(браузер + нативное приложение). Требование «at least one connected user» закрыто.

---

## 2. Если попросят описать use case словами (EN)

```
Our members already wear an Oura Ring and want our platform to interpret the data they
are generating. After connecting, we read daily sleep, readiness, HRV, resting heart
rate, SpO2 and workout summaries for that member and turn them into a written daily and
weekly wellness review — what moved, what likely explains it, and one small experiment to
try next.

Two products use the same connection. Our App Store application can also read this data
through Apple Health / Health Connect. Our specialist-guided programme runs as a web app
outside the app stores, where no health-platform bridge exists — there the direct Oura
connection is the only way for a member to avoid typing numbers in by hand every day.

We are asking to move beyond the 10-user development limit because the integration is
built, tested and working; the cap is what prevents us from offering it to members who
already own a ring.
```

---

## 3. ✅ ЗАКРЫТО 2026-08-26 — политика приватности дополнена

`legal/privacy.html` (раздел 3.2) перечисляет Oura среди источников биометрии, но говорит,
что данные приходят **вручную или файлом экспорта**: «You provide this data manually or by
importing an export file in your browser».

Про **прямое подключение по OAuth к Oura API** в политике не сказано ни слова. Ревьюер
Oura смотрит политику именно на предмет «как вы обращаетесь с данными, полученными через
наш API» — это первое, за что могут вернуть заявку.

**Предлагаемая правка** — добавить в 3.2 после существующего пункта про носимые:

```
<li><strong>Connected device accounts:</strong> if you choose to connect an account such
as Oura, we receive daily sleep, readiness, heart-rate variability, resting heart rate,
SpO2 and workout summaries through that provider's API, using access you grant and can
revoke at any time. We use this data only to produce your own wellness summaries, never
for advertising or resale, and you can disconnect the account or delete the data from
within the app.</li>
```

✅ **Внесено 2026-08-26 во все 12 языков** `legal/privacy.html` (EN — развёрнутый пункт в 3.2,
остальные языки — пункт в разделе «Данные, которые мы собираем», в стиле своей версии).
Формулировка покрывает то, что смотрит ревьюер: какие поля приходят через API, что доступ
даёт и отзывает сам пользователь, что данные идут только на его сводки — не в рекламу,
профилирование или перепродажу, и что отключить/удалить можно из приложения.

---

## 4. Порядок действий

1. ✅ Правка политики внесена и задеплоена (п. 3).
2. Открыть портал под аккаунтом с кольцом, привести имя/описание к тексту из п. 1.
3. Проверить, что redirect URL в портале совпадает с воркером **посимвольно**.
4. Submit for review → ждать до 2 недель, ответ придёт на почту аккаунта.
5. Результат записать сюда и в `interpreter/wearables/oura.md`.

---

## 5. ✅ ПОДАНО 2026-08-26 — статус «In Review» (скрины `скрин/2/IMG_4360…4365`)

Оказалось, что приложение уже было заведено и **все поля заполнены заранее** — подача
свелась к кнопке «Request more users» → «Submit».

**Портал переехал:** новые приложения создаются на **`developer.ouraring.com`**, старый
`cloud.ouraring.com/oauth/applications` с 15.10.2025 только редактирует существующие
(в наших заметках раньше фигурировал именно старый адрес — поправлено).

**Что стоит в карточке приложения (проверено по скринам):**
- имя **VIA·L**, Client Id `65bcca60-12ef-467e-a52a-7cd600021344` (не секрет, светится
  в authorize-URL; секрет — только в `wrangler secret`);
- описание: wearable-biomarker interpreter + nutrition-support platform for healthy aging
  (menopause, andropause, longevity), читает sleep/readiness/HRV/heart rate/SpO2 →
  personalized **educational wellbeing review**;
- Contact Email `integration@via-l.com`, Website `https://via-l.com`,
  ToS `https://via-l.com/legal/terms.html`, Privacy `https://via-l.com/legal/privacy.html`;
- Redirect URI `https://interpreter.viaelcom.workers.dev/oura/callback` — совпадает с воркером;
- Scopes в портале: Personal, Heartrate, SpO2, Heart Health, Daily, Workout, Stress
  (воркер запрашивает подмножество: `personal daily heartrate workout spo2` — это нормально).

**Статус:** `Development` → **`In Review`**. Ответ Oura обещан в течение ~2 недель, придёт
на почту аккаунта. Пункт «≥1 подключённый пользователь» закрыт кольцом владельца.

⏱ Правка политики приватности (п. 3) задеплоена в тот же день — на момент, когда ревьюер
откроет `legal/privacy.html`, там уже есть пункт про подключённые аккаунты и Oura API.

**Дальше:** ждём письма. Одобрят — лимит 10 снимается, ничего в коде менять не нужно
(Client ID/Secret те же). Вернут на доработку — повод в тексте письма.

---

## 6. 🎉 ОДОБРЕНО 2026-08-26 — лимит 10 пользователей снят (тикет #7815321, Helder)

Ответ пришёл **в тот же день, через ~45 минут после подачи** (обещали до 2 недель).
Дословно: «Your Oura developer application has been approved, and we've lifted the
ten-user limit. You should be all set with your integration.»

**Что это значит технически:** ничего менять не нужно — Client ID и Secret те же, роуты
`/oura/start|callback|metrics` в воркере работают как работали, просто исчез потолок в
10 подключённых пользователей. Прямая интеграция Oura готова к продакшену.

**Условия, которые Helder подчеркнул (важно для интерфейса и маркетинга):**
1. Использование API подчинено **API Agreement**; нарушение = немедленный отзыв доступа
   без предупреждения.
2. Одобрение **НЕ даёт** права на имя Oura, торговые марки, знаки обслуживания и логотипы.
3. Марки Oura можно использовать **только** для обязательной атрибуции данных и только так,
   как описано в **Oura Branding Guidelines**.
4. **Запрещено** использовать марки Oura (или похожие до смешения) как имя/часть имени,
   иконку, логотип или брендинг нашего приложения.

**Наш текущий расклад (проверено по коду):**
- имя приложения — «VIA·L», слова Oura в нём нет ✅;
- в интерфейсе «Oura» встречается как **название источника данных** (`_SRC_NAMES`,
  подписи «Oura Ring», кнопка «🔗 Oura», лента совместимости) — это атрибуция, разрешённый
  сценарий ✅;
- картинки `interpreter/images-in/oura.png` и `Oura Ring Gen 4 gold.PNG` — **фото самого
  кольца, не логотип и не вордмарк** ✅ (логотипов Oura в репо нет).

⚠️ **Что стоит сделать (не срочно, но до широкого запуска):** прочитать Oura Branding
Guidelines и API Agreement и сверить два момента — (а) требуемую формулировку атрибуции
(«Data provided by Oura» или как они предпишут) рядом с показанными цифрами; (б) допустимо
ли наше использование фото кольца в ленте совместимости — фото продукта обычно требует
отдельного разрешения, хотя маркой не является. Если чего-то не хватает — правка
косметическая.

## 7. Ответ на благодарность — автоответ бота (2026-08-26, тикет #7815466)

Ответил **Finn, Oura Virtual Assistant** (не человек). Содержание: наши обязательства
приняты и зафиксированы — работа по API Agreement, имя/марки/логотипы Oura не
используются в имени, иконке и брендинге VIA-L, «Oura» только как обозначение источника
данных с атрибуцией по Branding Guidelines.

⚠️ **Наш вопрос «скажите, если формулировка не соответствует гайдлайнам» остался без
ответа** — бот его не рассматривал. Значит хвост по атрибуции закрываем сами: читаем Oura
Branding Guidelines и сверяем (а) формулировку атрибуции рядом с цифрами, (б) право
показывать фото кольца в ленте совместимости.

📮 **Канал не мониторится.** Дальнейшие вопросы — живой чат в `support.ouraring.com` в
рабочие часы. Отвечать в этот тикет бессмысленно.
