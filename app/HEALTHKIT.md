# HealthKit — чтение Apple Health / Apple Watch (iOS)

Главный смысл нативного приложения: у Apple **нет веб-API**, Apple Health читается только через
**HealthKit**, доступный только нативному iOS-приложению. Этот мост читает показатели из Apple
Health и авто-заполняет ими карточку «Apple Health» в веб-ИП.

Плагин: **`@perfood/capacitor-healthkit`** (объявлен в `package.json`). Веб-сторона —
[`../interpreter/healthkit-bridge.js`](../interpreter/healthkit-bridge.js).

## Как это работает

1. Приложение грузит изолированный локальный бандл `app/www` (собран `sync-web.sh`, без `server.url` —
   см. «Архитектура» в `README.md`). Capacitor инжектит в webview
   `window.Capacitor.Plugins.CapacitorHealthkit`.
2. В карточке Apple Health появляется кнопка **«📲 Apple Health»** (только внутри приложения —
   на обычном вебе скрыта, т.к. `window.Capacitor` отсутствует).
3. Тап → запрос разрешений Apple Health → чтение HRV / пульс покоя / сон / deep / VO2 max за
   последние дни → запись в поля `m-hrv/m-rhr/m-sleep/m-deep/m-vo2` → `applyManual()`.

## Какие типы читаем (15, список — `READ_TYPES` в мосте)

Базовые (7): пульс, пульс покоя, HRV (SDNN), шаги, сон, VO₂max, SpO₂.
Полный приём (7): тренировки (разрешение `activity`, чтение `workoutType`), частота дыхания, вес,
давление верхнее и нижнее, процент жира (`bodyFat`, с 2026-09-20), глюкоза (`bloodGlucose`, с 2026-09-20).
Опциональный (1): ночная температура запястья (Watch Series 8+/Ultra).

Авторизация каскадом: опциональный тип → без него → только базовые, чтобы один неизвестный тип не
закрыл доступ целиком. Единицы задаёт плагин: `bodyFat` и SpO₂ приходят долей 0–1 (→ ×100),
`bloodGlucose` — в ммоль/л. Плагин поддерживает ещё 8 типов, которые мы не берём: `flightsClimbed`,
`appleExerciseTime`, `activeEnergyBurned`, `basalEnergyBurned`, `distanceWalkingRunning`,
`distanceCycling`, `basalBodyTemperature`, `bodyTemperature`. Категорийных симптомов (приливы и др.)
в плагине нет вовсе — потребовалась бы правка Swift.

⚠️ Новый тип в списке = новые строки в политике приватности (`legal-app/privacy.html`, 12 языков)
и в декларации Play/ASC. Список типов там перечислен явно.

## Что нужно сделать после `npx cap add ios` (на Mac)

> ⚠️ `ios/` в `.gitignore` (генерится локально), поэтому при каждом пересоздании Capacitor пишет
> чистые Info.plist / App.entitlements **без наших ключей** → HealthKit/Oura ломается. Чтобы это
> не приходилось чинить руками, есть скрипт **`npm run setup:ios`** (`app/scripts/setup-ios.js`) —
> идемпотентно дописывает оба `NSHealth*`-ключа и entitlement `com.apple.developer.healthkit`.
> Он **автоматически запускается** после `npm run add:ios`. Пункты 1–2 ниже он закрывает сам.

1. **Capability HealthKit** → entitlement `com.apple.developer.healthkit` (скрипт добавляет; в Xcode
   останется только подписать target своим Apple Developer аккаунтом).
2. **Права в Info.plist** — `NSHealthShareUsageDescription` и `NSHealthUpdateUsageDescription`
   (скрипт добавляет оба; второй нужен, т.к. некоторые версии плагина требуют ключ записи).
3. `LANG=en_US.UTF-8 npx cap sync ios` после установки плагина.

## ⚠️ Проверить на устройстве (симулятор Health не отдаёт данные)

- Точные **имена типов** HealthKit и **форма ответа** плагина (`resultData`, `value`, `sleepState`)
  могут отличаться по версии — сверить с актуальными доками `@perfood/capacitor-healthkit` и
  поправить `READ_TYPES`/парсинг в `healthkit-bridge.js`.
- Apple Health работает **только на реальном iPhone** (с данными с Apple Watch) — для теста нужен
  Apple Developer ($99) и устройство.

## Дальше

- Replicate кнопку на `interpreter-pro-expert.html` и `interpreter-elite.html` (после проверки на pro).
- Локализовать подписи (сейчас кнопка — нейтральная «📲 Apple Health»).
- Android: аналогичный мост через Health Connect (отдельный плагин).
