# План: сбор данных носимых БЕЗ Google CASA

**Цель:** не платить ~$1000/год за CASA-аудит и не сидеть в лимите Testing (100 юзеров),
при этом продавать в Google Play и App Store. Дата: 2026-07-21.

## Принцип

CASA включается **только** от Google-OAuth-скоупов класса **Restricted** — у нас это
облачный **Google Health API** (`health.googleapis.com`, скоупы `googlehealth.*`).
Всё остальное CASA не несёт. Значит: **убрать облачный Google-Health-путь из прода**
и брать данные тремя способами, которые к Google-OAuth не относятся:

1. **On-device (нативное приложение)** — HealthKit (iOS) / Health Connect (Android).
   Системное разрешение внутри приложения, Google-OAuth не участвует. Нет CASA, нет лимита 100.
2. **Веб — не-Google OAuth вендоров** — Oura / Polar / Withings (у каждого своя OAuth и своё ревью).
3. **Прямой Fitbit Web API** (`dev.fitbit.com`) — своя OAuth Fitbit, своё (лёгкое) ревью, минуя Google.
4. **Ручной / файловый импорт** — всегда.

Числа (HRV, сон и т.п.) по-прежнему уходят в воркер к ИИ на разбор — это разрешено
(основная функция, с согласия, задекларировано в privacy) и **не** триггерит CASA,
т.к. данные получены нативным разрешением Apple/Android, а не Google-скоупом.

## Что где уже есть (репо)

- **iOS-мост:** `interpreter/healthkit-bridge.js` + плагин `@perfood/capacitor-healthkit`.
  Функции `healthkitAvailable/Authorize/Read/FillApple`. No-op на вебе.
- **Android-мост:** `interpreter/healthconnect-bridge.js` + локальный плагин `@viael/health-connect`.
  Функции `healthConnectPresent/Available/Fill`. No-op на вебе/iOS.
- **Панель импорта:** два режима — `mode-all` (Apple Health/Health Connect + ручной) и
  `mode-full` (вендоры). Карточки: `#card-oura`, `#card-polar`, Withings, `#card-fitbit`.
- **Облачный Fitbit-Google-путь (CASA-триггер):** карточка `#card-fitbit`
  («Fitbit Air · Google Health», `interpreter-via-l.html:~1942`) → `connectFitbit()` (~8736) →
  воркер `/fitbit/start` → `/fitbit/callback` → `/metrics` (`handleFitbit*`, `GH_SCOPES`,
  `cloudflare-worker.js:~2064–2170`).

## Конкретные шаги

### A. Убрать облачный Google-Health-Fitbit из прода
- Спрятать/снять карточку `#card-fitbit` в её нынешнем виде («… · Google Health»,
  `connectFitbit`). Как минимум — не показывать на проде; код воркера (`/fitbit/*`, `GH_*`)
  можно оставить закомментированным/за флагом, но из UI убрать.
- Проверить, что в `openImport('full')` Fitbit-карточка больше не участвует.

### B. Fitbit без Google (если Fitbit нужен)
- **Прямой Fitbit Web API** — новый воркер-путь на OAuth `dev.fitbit.com` (свой client_id/secret,
  свои scopes activity/heartrate/sleep/spo2). Ревью Fitbit ≠ Google CASA. Работает и на вебе, и в webview.
- **Android натив:** Fitbit-приложение умеет писать в Health Connect → читаем через `healthConnectFill`.
- ⚠️ **iOS натив:** Fitbit НЕ пишет в Apple Health штатно → на iPhone Fitbit-данные только через
  прямой Fitbit Web API (пункт выше) или ручной ввод. Это причина сделать прямой Fitbit Web API
  основным Fitbit-путём (кроссплатформенно), а Health Connect — как бонус на Android.

### C. Натив = основной сбор в приложении
- В приложении (`window.Capacitor`) первым источником делать HealthKit / Health Connect
  (мосты уже готовы). Fitbit/Garmin/любой браслет, что синкается в платформенное хранилище,
  подтягивается оттуда.
- Веб (браузер) — HealthKit/Health Connect недоступны → там ручной импорт + Oura/Polar/Withings
  (+ прямой Fitbit при желании).

### D. Декларации (бесплатно, вместо CASA)
- **Google Play:** «Health Connect permissions declaration» + соответствие Health data policy +
  раздел Data Safety. Форма при публикации, ревью Play.
- **App Store:** usage-строки зачем нужны Health-данные (Info.plist), приватность в App Store Connect,
  соответствие Guideline 5.1.3 (нельзя использовать HealthKit-данные для рекламы/продажи).
- Политика конфиденциальности уже живёт: `https://via-l.com/legal/privacy.html`.

## Решения для владельца (нужны ответы)
1. Fitbit оставляем? Если да — делаем **прямой Fitbit Web API** (кроссплатформенно, без CASA)?
2. Облачный Google-Health-путь: полностью удалить из репо или оставить за флагом на будущее?
3. Приоритет платформ первого релиза: iOS (HealthKit) или Android (Health Connect)?
