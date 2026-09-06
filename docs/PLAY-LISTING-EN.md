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
Your body is changing after 35. Finally, an app that explains it clearly.
```
(73 из 80.)

> **Почему так.** Прежние варианты («Your tracker measures. VIA-L explains…») описывали механику
> прибора, а не причину скачать. Настоящая боль аудитории — не «непонятные цифры», а
> обесценивание: «это просто возраст, потерпите». Позиция текста — союзник, который наконец
> объясняет, а не спорит с обществом. Формулировка найдена владельцем и Мариной 2026-09-06.

Запасные: `After 35, your body changes. VIA-L finally explains what is going on.` (69),
`Your body changes after 35. VIA-L explains it — clearly, without dismissing you.` (80)

## Полное описание (4000)

```
Your body is changing. That deserves an explanation.

Perimenopause. Andropause. A stage few people talk about plainly. Sleep, energy, weight and mood shift — and the answer you usually get is "it's your age, give it time." VIA-L exists to give you clarity instead of waiting.

It takes the data you already collect and puts it into the language of how you actually feel — specific, plain, no generic advice.

WHAT YOU GET

• Overall Day Index — one daily read of where your body is: recovering, or asking for attention.
• Personal reference points — sleep, movement and evening habits framed for your age and stage, not for an average adult.
• 30-day trends — what is actually changing: resting pulse, blood oxygen, energy, sleep, stress, and the blood pressure you log yourself.
• Food and supplements — suggestions built around your own entries, not "eat more vegetables."
• Your own baseline — after a couple of weeks VIA-L compares you with you, not with a norm.
• Twelve interface languages, including English, Spanish, German, French, Portuguese, Italian, Polish, Ukrainian, Russian, Hebrew, Japanese and Korean.

WHERE THE DATA COMES FROM

Connect Health Connect and your metrics arrive on their own. Prefer not to? Type them in — the app works fully by hand as well. You can also connect a supported wearable account directly.

WHO IT IS FOR

Women from 35 and men from 40 — the years when sleep, energy and recovery start to shift, and explanations are hard to come by. On a short appointment there is rarely time for this conversation.

YOUR DATA STAYS YOURS

Your entries live on this device. There is no account and no sign-up. When an analysis is prepared, the text is held for up to 72 hours under a random device identifier so you never lose a result, and then it is deleted. You can export an encrypted backup, restore it on a new phone, and erase everything with one button. Helping to improve the app by sharing anonymised days is optional and off by default.

IMPORTANT

VIA-L is a wellness and lifestyle app. It is not a diagnosis and not a replacement for your doctor: it does not diagnose, treat or prevent any condition and is not a medical device. It is support and clarity for a stage that deserves attention rather than silence. If something in your wellbeing worries you, talk to a clinician.

SUBSCRIPTION

Full access is €30 per month, billed through Google Play and renewing automatically until you cancel. Manage or cancel any time in the Play Store subscriptions screen.
Terms: https://via-l.com/legal-app/terms.html
Privacy Policy: https://via-l.com/legal-app/privacy.html
```
(2606 из 4000.)

> ⚠️ Три вещи, которые НЕЛЬЗЯ вернуть в текст:
> 1. **Названия трекеров** (Oura и др.) — условие Oura: имя и логотипы не используются в брендинге
>    и маркетинге, только атрибуция источника внутри продукта. Описание в сторе = маркетинг.
> 2. **Противопоставление врачу** («ни один врач не найдёт 40 минут») — читается ревью как
>    «приложение вместо медицины». Ту же мысль несёт нейтральное «на коротком приёме редко хватает
>    времени на этот разговор».
> 3. **Давление как измеряемый показатель** — мы его не меряем, человек вводит сам. В тексте это
>    сказано прямо («the blood pressure you log yourself»), иначе описание расходится с функциями.

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
