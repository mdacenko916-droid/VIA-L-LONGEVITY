# Витрина Google Play — тексты (en-US, по умолчанию)

**Дата:** 2026-09-03. Продукт: **VIA-L**, пакет `com.viael.vial`.
Источник: [`APP-STORE-LISTING-DRAFT.md`](APP-STORE-LISTING-DRAFT.md) — здесь та же линия,
переписанная под Android (Health Connect вместо Apple Health, оплата через Google Play).

> Те же правила: не обещать лечения, диагноза и результата; ни одной ссылки на сайт нутрициолога
> и на клиническую methodology.html (память `feedback_via_l_appstore_isolation`).

---

## Название приложения (30)

```
VIA-L
```
В консоли уже стоит. Если захочется полнее — `VIA-L: Your Daily Metrics` (25).

## Краткое описание (80)

```
Your tracker measures. VIA-L explains what your sleep and recovery mean.
```
(71 знак.) Запасное: `Understand what your wearable data actually says about your day.` (64)

## Полное описание (4000)

```
Your tracker measures. VIA-L explains.

Sleep score, HRV, resting heart rate, steps — every wearable shows numbers, and almost none of them tell you what those numbers mean for you personally. VIA-L reads your day the way an attentive coach would: it looks at how you slept, how you recovered and how you felt, compares today with your own history rather than with a population average, and puts it into plain language.

WHAT YOU GET

• A daily read of your own metrics, in plain words — not a score you cannot act on.
• One focused suggestion at a time: a change in evening light, in the timing of your meals, in how you plan your training week. Small, testable, yours.
• A weekly review that looks at the whole week and tells you what actually moved.
• Your own baseline: after a couple of weeks VIA-L compares you with you, not with a norm.
• Twelve interface languages, including English, Spanish, German, French, Portuguese, Italian, Polish, Ukrainian, Russian, Hebrew, Japanese and Korean.

WHERE THE DATA COMES FROM

Connect Health Connect and your metrics arrive on their own. Prefer not to? Type them in — the app works fully by hand as well. You can also connect a supported wearable account directly.

WHO IT IS FOR

Adults who track their sleep, recovery and activity and want to understand the numbers instead of collecting them — in particular women from 35 and men from 40, whose sleep, energy and recovery shift with age.

YOUR DATA STAYS YOURS

Your entries live on this device. There is no account and no sign-up. When an analysis is prepared, the text is held for up to 72 hours under a random device identifier so you never lose a result, and then it is deleted. You can export an encrypted backup, restore it on a new phone, and erase everything with one button. Helping to improve the app by sharing anonymised days is optional and off by default.

IMPORTANT

VIA-L is a wellness and lifestyle app. It does not diagnose, treat or prevent any condition, does not replace your doctor, and is not a medical device. If something in your wellbeing worries you, talk to a clinician.

SUBSCRIPTION

Full access is €30 per month, billed through Google Play and renewing automatically until you cancel. Manage or cancel any time in the Play Store subscriptions screen.
Terms: https://via-l.com/legal-app/terms.html
Privacy Policy: https://via-l.com/legal-app/privacy.html
```

## Визуальные ресурсы

| Что | Требование Play | Где взять |
|---|---|---|
| Значок 512×512 PNG ≤1 МБ | обязателен | `interpreter/pwa/vial-icon-512.png` — уже 512×512, 479 КБ, годится как есть |
| Картинка для описания 1024×500 | обязательна | ✅ `app/store/play-feature-graphic-1024x500.png` — фон сгенерирован (исходник `play-feature-bg-source.png`), монограмма и текст наложены локально |
| Скриншоты телефона, 2–8 шт, 16:9 или 9:16, сторона 320–3840 px | обязательны | **нет** — снимать с реального Android (эмулятор на этой машине тупик) |
| Видео | нет | пропустить |
| Планшет / Chromebook / XR | нет | пропустить |

Подписи к скриншотам — те же шесть, что для App Store (`APP-STORE-LISTING-DRAFT.md` §9).
На кадрах не должно быть: слова «diagnosis», названий анализов, витрины специалистов,
логотипа/адреса сайта нутрициолога, чужих торговых марок трекеров крупным планом.

## Контактная информация (Настройки для Google Play)

- Электронный адрес: `support@via-l.com`
- Номер телефона: не заполнять (поле публичное, необязательное)
- Веб-сайт: `https://via-l.com/legal-app/support.html`
