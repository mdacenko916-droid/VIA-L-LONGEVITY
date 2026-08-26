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
