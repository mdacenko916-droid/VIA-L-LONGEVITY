# Тексты для App Store — черновик (EN)

**Дата:** 2026-08-25. Продукт: **VIA-L** (`interpreter/interpreter-via-l.html` + обёртка `app/`).
Рынок старта: США → язык листинга **English (U.S.)** основной. Смежное:
[`APP-STORE-SUBMISSION-CHECKLIST.md`](APP-STORE-SUBMISSION-CHECKLIST.md),
[`APP-REVIEW-LAB-NAMING-RATIONALE.md`](APP-REVIEW-LAB-NAMING-RATIONALE.md).

> Правила, по которым писался текст: не обещать лечения, диагноза и результата; глагол —
> «explains / helps you read», а не «assesses your health»; ни одной ссылки на сайт нутрициолога
> и на витрину специалистов ([[feedback_via_l_appstore_isolation]]); цена и условия подписки —
> ровно как в IAP (€30/мес, авто-продление).

---

## 1. Name (30 знаков макс)

```
VIA-L: Your Daily Metrics
```
(25 знаков.) Запасные: `VIA-L Lifestyle Metrics` (23), `VIA-L: Wearable Insights` (24).
⚠️ Слов «health», «medical», «menopause» в имени нет намеренно — имя индексируется и цепляет
1.4.1/2.3.7 сильнее, чем тело описания.

## 2. Subtitle (30 знаков макс)

```
Understand what your data says
```
(30 ровно.) Запасные: `Your wearable data, explained` (29), `Make sense of your metrics` (26).

## 3. Promotional text (170 знаков, меняется без ревью)

```
Your watch shows numbers. VIA-L explains what they mean for you — sleep, recovery, energy — and turns them into one small thing to try today.
```
(139.)

## 4. Description

```
Your tracker measures. VIA-L explains.

Sleep score, HRV, resting heart rate, steps — every wearable shows numbers, and almost none of
them tell you what those numbers mean for you personally. VIA-L reads your day the way an
attentive coach would: it looks at how you slept, how you recovered and how you felt, compares
today with your own history rather than with a population average, and puts it into plain
language.

WHAT YOU GET

• A daily read of your own metrics, in plain words — not a score you cannot act on.
• One focused suggestion at a time: a change in evening light, in the timing of your meals, in
  how you plan your training week. Small, testable, yours.
• A weekly review that looks at the whole week and tells you what actually moved.
• Your own baseline: after a couple of weeks VIA-L compares you with you, not with a norm.
• Twelve interface languages, including English, Spanish, German, French, Portuguese, Italian,
  Polish, Ukrainian, Russian, Hebrew, Japanese and Korean.

WHERE THE DATA COMES FROM

Connect Apple Health and your metrics arrive on their own. Prefer not to? Type them in — the app
works fully by hand as well. You can also connect a supported wearable account directly.

WHO IT IS FOR

Adults who track their sleep, recovery and activity and want to understand the numbers instead of
collecting them — in particular women from 35 and men from 40, whose sleep, energy and recovery
shift with age.

YOUR DATA STAYS YOURS

Your entries live on this device. There is no account and no sign-up. When an analysis is
prepared, the text is held for up to 72 hours under a random device identifier so you never lose
a result, and then it is deleted. You can export an encrypted backup, restore it on a new phone,
and erase everything with one button. Helping to improve the app by sharing anonymised days is
optional and off by default.

IMPORTANT

VIA-L is a wellness and lifestyle app. It does not diagnose, treat or prevent any condition, does
not replace your doctor, and is not a medical device. If something in your wellbeing worries you,
talk to a clinician.

SUBSCRIPTION

Full access is €30 per month, billed through your Apple ID and renewing automatically until you
cancel. Manage or cancel any time in iPhone Settings. Terms: https://via-l.com/legal-app/terms.html
Privacy Policy: https://via-l.com/legal-app/privacy.html
```

## 5. Keywords (100 знаков, через запятую, без пробелов, без слов из имени/подзаголовка)

```
hrv,sleep,recovery,tracker,wearable,habits,energy,wellness,journal,routine,baseline,longevity
```
(92 знака.) ⚠️ НЕ ставить `menopause`, `hormone`, `diagnosis`, `treatment` — это ключевые слова,
по которым листинг попадает в медицинскую категорию, а с ней в 1.4.1.

## 6. What's New (первая версия)

```
First release. VIA-L reads your daily metrics — sleep, recovery, activity — and explains what they
mean for you, with one small thing to try. Apple Health or manual entry, twelve languages, your
data stays on your device.
```

## 7. App Review Information — заметка ревьюеру

```
VIA-L is a wellness app: it interprets the user's own lifestyle and wearable metrics in plain
language. It does not diagnose, treat or prevent disease and is not a medical device; the
disclaimer is shown before first use and repeated on every result.

Content is behind an auto-renewable subscription (€30/month) purchased with In-App Purchase.
"Restore Purchases" is on the paywall. There is no login and no way to buy access to the app or
its content outside the app.

The "My mentor" screen lets a user connect, free of charge, to an independent nutrition
specialist and book a free 15-minute introductory call. Nothing on that screen is sold: there is
no price, no checkout and no purchase link of any kind.

To review without a purchase, please use the sandbox account below, or contact us and we will
provide a promo code.
Sandbox Apple ID: <заполнить>
Health data: HealthKit is requested only after the user is told what it is used for, and only for
reading sleep, heart-rate and activity metrics. Data is stored on the device.
Support: support@via-l.com
```

## 8. Возрастной рейтинг и категории

- Category: **Health & Fitness** (secondary: Lifestyle).
- Age rating: **17+**, «Medical/Treatment Information: **None**», «Unrestricted Web Access: No».
- Copyright: `2026 <ФОП, имя как в Apple Developer>`.

## 9. Скриншоты — подписи (6 штук, iPhone 6.9" + 6.5")

1. `Your watch measures. VIA-L explains.` — экран дня с плитками метрик.
2. `Today, in plain words` — карточка разбора.
3. `One small thing to try` — блок эксперимента/памятки дня.
4. `Your week, reviewed` — недельный разбор.
5. `Apple Health or by hand` — экран импорта.
6. `Your data stays on your device` — экран приватности/бэкапа.

⚠️ На скриншотах не должно быть: слова «diagnosis», названий анализов, витрины специалистов,
логотипа/адреса сайта нутрициолога, чужих торговых марок трекеров крупным планом.

## 10. Что ещё нужно заполнить

- [ ] Sandbox-аккаунт для ревью (появится после Paid Apps Agreement).
- [ ] Хостинг `legal-app/` по адресам из описания — проверить, что оба URL открываются.
- [ ] Локализация листинга: после EN — ES, затем остальные (не блокер для подачи).
