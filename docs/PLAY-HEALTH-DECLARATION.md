# Декларация «Приложения для здоровья» (Google Play) — тексты

**Дата:** 2026-09-04. Приложение: VIA-L (`com.viael.vial`).
Семь разрешений Health Connect, объявленных в `app/plugins/health-connect/android/src/main/AndroidManifest.xml`.

> Линия ответов: только ЧТЕНИЕ; данные показываются пользователю и используются для
> текстового разбора; ничего не продаётся и не используется для рекламы; хранение
> на устройстве, на сервере — не дольше 72 часов под случайным идентификатором.

---

## Общее описание приложения (верхнее поле)

```
VIA-L is a wellness app that reads the user's own wearable and lifestyle metrics and explains, in plain language, what those numbers mean for them. Health Connect is used only to read data the user already collects with their own device, so they do not have to type it in by hand. All Health Connect data is read-only; the app never writes to Health Connect. Data stays on the device; when the user asks for an analysis, the relevant values are sent to our server to generate the explanation and are deleted within 72 hours. Health data is never sold, never shared with third parties for advertising, and is not used for any purpose other than showing the user their own metrics and the explanation they requested.
```

## Сон — `READ_SLEEP`

```
Sleep duration and sleep stages are shown on the user's daily screen and are used to explain how the night relates to how they feel — energy, recovery, restlessness. The app compares today with the user's own history, not with a population norm. Read-only; the value is never written back to Health Connect.
```

## Жизненные показатели

### Пульс — `READ_HEART_RATE`
```
Heart rate is shown on the daily screen and used as context for the recovery part of the explanation, together with sleep and activity. Read-only.
```

### Вариабельность пульса — `READ_HEART_RATE_VARIABILITY`
```
HRV is shown on the daily screen and used to describe recovery trends against the user's own baseline over the previous days. Read-only.
```

### Пульс в покое — `READ_RESTING_HEART_RATE`
```
Resting heart rate is shown on the daily screen and used in the weekly review to describe whether recovery is trending up or down compared with the user's own previous weeks. Read-only.
```

### Насыщение крови кислородом — `READ_OXYGEN_SATURATION`
```
Blood oxygen is shown on the daily screen as context for sleep quality. It is presented descriptively, with the device's measurement uncertainty stated, and never as a diagnosis. Read-only.
```

### VO2 max — `READ_VO2_MAX`
```
VO2 max is shown on the daily screen and used as context when the app suggests how to plan the week's aerobic activity. Read-only.
```

## Активность

### Шаги — `READ_STEPS`
```
Daily step count is shown on the daily screen and used to relate movement to sleep and energy in the explanation, and to suggest small, testable changes to the user's routine. Read-only.
```
