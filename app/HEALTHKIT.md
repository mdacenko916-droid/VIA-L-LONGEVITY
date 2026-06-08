# HealthKit — чтение Apple Health / Apple Watch (iOS)

Главный смысл нативного приложения: у Apple **нет веб-API**, Apple Health читается только через
**HealthKit**, доступный только нативному iOS-приложению. Этот мост читает показатели из Apple
Health и авто-заполняет ими карточку «Apple Health» в веб-ИП.

Плагин: **`@perfood/capacitor-healthkit`** (объявлен в `package.json`). Веб-сторона —
[`../interpreter/healthkit-bridge.js`](../interpreter/healthkit-bridge.js).

## Как это работает

1. Приложение грузит живой ИП (`server.url`). Capacitor инжектит в webview
   `window.Capacitor.Plugins.CapacitorHealthkit`.
2. В карточке Apple Health появляется кнопка **«📲 Apple Health»** (только внутри приложения —
   на обычном вебе скрыта, т.к. `window.Capacitor` отсутствует).
3. Тап → запрос разрешений Apple Health → чтение HRV / пульс покоя / сон / deep / VO2 max за
   последние дни → запись в поля `m-hrv/m-rhr/m-sleep/m-deep/m-vo2` → `applyManual()`.

## Что нужно сделать в Xcode после `npx cap add ios` (на Mac)

1. **Capability HealthKit:** target → *Signing & Capabilities* → `+ Capability` → **HealthKit**.
   (добавит entitlement `com.apple.developer.healthkit`). Требует Apple Developer аккаунта.
2. **Права в Info.plist** (target → Info, или `ios/App/App/Info.plist`):
   - `NSHealthShareUsageDescription` — «VIA·L читает показатели здоровья (HRV, пульс, сон, VO2),
     чтобы дать нутрициологическую интерпретацию. Данные не покидают ваше устройство без вашего согласия.»
   - `NSHealthUpdateUsageDescription` — то же (некоторые версии плагина требуют ключ записи, даже
     если мы только читаем).
3. `npx cap sync` после установки плагина.

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
