# Тексты для App Store — черновик (EN)

**Дата:** 2026-08-25, **переписан 2026-09-09** под верное позиционирование. Продукт: **VIA-L**
(`interpreter/interpreter-via-l.html` + обёртка `app/`). Рынок старта: США → язык листинга
**English (U.S.)** основной. Смежное: [`APP-STORE-SUBMISSION-CHECKLIST.md`](APP-STORE-SUBMISSION-CHECKLIST.md),
[`APP-REVIEW-LAB-NAMING-RATIONALE.md`](APP-REVIEW-LAB-NAMING-RATIONALE.md),
[`PLAY-LISTING-EN.md`](PLAY-LISTING-EN.md) (эталон линии).

> ⚠️ **Что изменилось и почему.** Прежний черновик продавал механику прибора: «Your tracker
> measures. VIA-L explains», имя «Your Daily Metrics», ручной ввод — как уступка («Prefer not
> to?»). Владелец поправил 2026-09-09: приложение **не объяснялка метрик**, а помощь человеку с
> его **состоянием** — перименопауза у женщин 35+, андропауза у мужчин 40+. Трекер **не
> обязателен**: данные вводятся руками, и приложение работает полностью без гаджета, поэтому
> старая рамка отсекала половину аудитории и вдобавок неверно описывала продукт. Линия найдена
> владельцем и Мариной 2026-09-06/07 и уже стоит в Google Play. Канон — память
> `feedback_via_l_positioning`.
>
> Остальные правила прежние: не обещать лечения, диагноза и **результата** (2.3.7); ни одной
> ссылки на сайт нутрициолога и на витрину специалистов; цифру цены в тексты не ставим — она
> живёт только в сторе (база €29,99, США $34,99), стор показывает её сам, а пейволл берёт из
> `priceString`.
>
> **Про слово «menopause».** В **имени, подзаголовке и ключевых словах** его нет намеренно: эти
> три поля индексируются и тянут карточку в медицинскую категорию, а с ней под Guideline 1.4.1.
> В **теле описания** оно есть и должно быть — там оно называет этап и тему, ничего не утверждая
> о конкретном человеке. Это не осторожность вообще, а разница между полями.

---

## 1. Name (30 знаков макс)

```
VIA-L: Midlife, Explained
```
(25 знаков.) Запасные: `VIA-L: What Is Changing` (23), `VIA-L Midlife Companion` (23).
Имя говорит об **этапе жизни**, а не о метриках и не о приборе.

## 2. Subtitle (30 знаков макс)

```
Sleep, energy, mood after 40
```
(28.) Запасные: `Your body at 40+, explained` (27), `When 'it's just age' isn't` (26).

## 3. Promotional text (170 знаков, меняется без ревью)

```
Perimenopause, andropause: sleep breaks up, energy drops, mood swings — and everyone says it's age. VIA-L explains what is changing and what helps, one step at a time.
```
(167.)

## 4. Description

```
Finally, someone explains what is changing.

Sleep breaks up around four in the morning. Energy disappears by midday. Mood swings for no
reason, the body responds differently to the same food and the same training. And in reply you
hear: it's just age, be patient.

VIA-L is for that period — perimenopause in women from 35, andropause in men from 40. It does
not tell you to be patient. It helps you see what is actually changing in your days, and gives
you one thing to try, in a size you can actually do.

HOW IT WORKS

You describe how you slept, how much energy you had, how you felt. It takes a couple of minutes.
In return you get a plain-language read of your day: what looks connected to what, what is worth
trying tonight, and what to watch over the coming week. Every week there is a longer review that
looks at the whole week and tells you what actually moved.

NO WEARABLE REQUIRED

The app works fully by hand — you can type everything in and never connect a device. If you do
wear one, connect Apple Health and sleep, resting heart rate, HRV and steps arrive on their own,
so there is less to fill in. A supported wearable account can also be connected directly. Either
way, the numbers are a means, not the point.

WHAT YOU GET

• A daily read of your state in plain words, and one small thing to try — not a score you cannot
  act on.
• A weekly review of what changed and what it followed.
• Your own baseline: after a couple of weeks VIA-L compares you with you, not with a norm.
• Practical ground: sleep and evening light, meal timing, movement you can sustain, how the
  week is planned around your energy rather than against it.
• Twelve interface languages, including English, Spanish, German, French, Portuguese, Italian,
  Polish, Ukrainian, Russian, Hebrew, Japanese and Korean.

WHO IT IS FOR

Women from 35 and men from 40 whose sleep, energy, mood and recovery have started behaving
differently, and who want to understand what is going on instead of waiting it out.

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

Full access is an auto-renewable monthly subscription, billed through your Apple ID and renewing
automatically until you cancel. The current price is shown on this page and in the app before you
subscribe. Manage or cancel any time in iPhone Settings. Terms: https://via-l.com/legal-app/terms.html
Privacy Policy: https://via-l.com/legal-app/privacy.html
```

## 5. Keywords (100 знаков, через запятую, без пробелов, без слов из имени/подзаголовка)

```
hot flashes,night sweats,hormones,wellbeing,habits,hrv,recovery,tracker,journal,baseline,women
```
(94 знака.) ⚠️ По-прежнему НЕ ставить `menopause`, `perimenopause`, `andropause`, `diagnosis`,
`treatment`, `symptoms` — ключевые слова индексируются и тянут в медицинскую категорию под 1.4.1.
`hot flashes` / `night sweats` — пограничные: это бытовые описания ощущений, не диагноз; если
ревью придерётся, убрать их первыми, остальное не трогать.

## 6. What's New (первая версия)

```
First release. VIA-L is for the years when sleep, energy and mood start behaving differently —
perimenopause and andropause. It explains what is changing and gives you one thing to try, day by
day. Works by hand or with Apple Health, in twelve languages, with your data kept on your device.
```

## 7. App Review Information — заметка ревьюеру

```
VIA-L is a wellness app for adults going through midlife hormonal change — perimenopause in
women from 35, andropause in men from 40. The user records how they slept, how much energy they
had and how they felt; the app describes, in plain language, what appears connected to what and
suggests one lifestyle change to try. A wearable is optional: the app works entirely on
manually entered data, and Apple Health is only a convenience for filling those fields in.

It does not diagnose, treat or prevent disease and is not a medical device. It never states or
implies that the user has a condition; the disclaimer is shown before first use and repeated on
every result.

Content is behind an auto-renewable monthly subscription purchased with In-App Purchase.
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
- Age rating: **18+** (шкала Apple с 2026: 4+/9+/13+/16+/18+, прежнего «17+» больше нет; 18+ совпадает
  с декларацией в Google Play), «Medical/Treatment Information: **None**», «Unrestricted Web Access: No».
- Copyright: `2026 Kyrylo Selivanov` — как в Apple Developer. Статус ФОП не указываем
  (ответственное лицо — физлицо, см. канон в памяти).

## 9. Скриншоты — подписи (6 штук, iPhone 6.9" + 6.5")

1. `Finally, someone explains what is changing.` — первый экран/анкета состояния.
2. `Your day, in plain words` — карточка разбора.
3. `One small thing to try` — блок эксперимента/памятки дня.
4. `Your week, reviewed` — недельный разбор.
5. `No wearable required` — экран ввода: ручной ввод и Apple Health рядом, равноправно.
6. `Your data stays on your device` — экран приватности/бэкапа.

⚠️ На скриншотах не должно быть: слова «diagnosis», названий анализов, витрины специалистов,
логотипа/адреса сайта нутрициолога, чужих торговых марок трекеров крупным планом.

## 10. Что ещё нужно заполнить

- [ ] Sandbox-аккаунт для ревью (App Store Connect → Users and Access → Sandbox).
- [x] Продукт подписки заведён: `via_l_pro_monthly`, группа «VIA-L Subscriptions», база €29,99,
      США/Канада $34,99 (2026-09-09). ⚠️ Проверить локализованное **Display Name** продукта —
      оно видно покупателю; «VIA-L Pro Monthly» нарушает канон имён (тарифа PRO не существует),
      нужно «VIA-L Monthly». Идентификатор `via_l_pro_monthly` менять нельзя — он совпадает с Play.
- [ ] Хостинг `legal-app/` по адресам из описания — проверить, что оба URL открываются.
- [ ] Локализация листинга: после EN — ES, затем остальные (не блокер для подачи).
- [ ] Сверить с Play: краткое описание там — `Perimenopause, andropause: finally someone explains
      what is changing.` (69). Линия одна, поля разные: у Apple эта мысль живёт в promotional text
      и в первой строке описания, а не в имени и подзаголовке (1.4.1).
