# Apple IAP — подписка VIA·L €30/мес (RevenueCat)

Требование Apple (Guideline 3.1.1): платный контент, потребляемый внутри приложения, обязан
продаваться через Apple In-App Purchase — не через код доступа с сайта и не через Hotmart.
Hotmart как канал продаж для этого продукта отвязан (владелец, ~2026-07-01) — VIA·L в App Store
продаётся ТОЛЬКО через IAP.

Плагин: **`@revenuecat/purchases-capacitor`** (версия `9.2.2` — последняя, совместимая с текущим
Capacitor 6.x в `app/package.json`; версии 10.x+ требуют Capacitor 7). Веб-сторона —
[`../interpreter/iap-bridge.js`](../interpreter/iap-bridge.js). Почему RevenueCat, а не своя
серверная валидация Apple Server API: RevenueCat берёт на себя валидацию чеков/StoreKit 2,
кросс-платформенность и sandbox-тестирование — избавляет от непроверенного нативного Swift-кода.

## Как это работает

1. Приложение грузит изолированный локальный бандл `app/www`. Capacitor инжектит в webview
   `window.Capacitor.Plugins.Purchases`.
2. После экрана согласия (`#consent-gate`) `iap-bridge.js` проверяет активную подписку
   (`getCustomerInfo()` → `entitlements.active['via_l_pro']`). Если её нет — показывается
   пейволл `#iap-gate` (гейт **блокирующий**, поверх контента, как `#consent-gate`).
3. Кнопка «Оформить подписку» → `getOfferings()` → `purchasePackage()`. Кнопка «Восстановить
   покупки» → `restorePurchases()` (обязательна для Apple review любой не-consumable/подписки).
4. Проверка повторяется на КАЖДЫЙ запуск приложения (не только при первом согласии) — подписка
   могла закончиться/быть отменена между сессиями (см. `_afterConsent`/init-IIFE в
   `interpreter-via-l.html`).
5. **Fail-closed по дизайну:** пока API-ключ не вставлен (placeholder `YOUR_REVENUECAT_IOS_API_KEY`),
   `ensureConfigured()` возвращает `false`, и пейволл показывается всегда — это правильно: лучше
   заблокировать доступ, чем случайно открыть платный контент бесплатно из-за незаконченной настройки.
6. На обычном вебе (`via-l.com`, нет `window.Capacitor`) — весь модуль no-op, страница остаётся
   открытой, как сейчас (веб-версия не продаётся, это dev/preview-канал).

## Что нужно сделать владельцу перед сборкой/подачей

1. **RevenueCat.** Создать проект на [app.revenuecat.com](https://app.revenuecat.com) → добавить
   iOS-приложение с bundle id `com.viael.vial` → получить **iOS API key** (публичный,
   `appl_...`).
2. **App Store Connect.** Создать auto-renewable subscription продукт (€30/мес), привязать к
   RevenueCat (RevenueCat даёт пошаговую интеграцию через App Store Connect API key/shared secret —
   см. их онбординг).
3. **RevenueCat dashboard:**
   - Entitlement с идентификатором **`via_l_pro`** (должен буквально совпадать с константой
     `ENTITLEMENT_ID` в `iap-bridge.js` — если меняете одно, меняйте и другое).
   - Offering **`default`** с одним Package (Monthly) на этот продукт.
4. **Код:** вставить полученный iOS API key в `interpreter/iap-bridge.js`, константа
   `RC_API_KEY_IOS` (сейчас `'YOUR_REVENUECAT_IOS_API_KEY'`).
5. Пересобрать веб (`bash app/sync-web.sh`) → `npx cap sync` → тест в **StoreKit-песочнице**
   (Xcode: Product → Scheme → добавить `.storekit`-конфиг или тестовый Sandbox Apple ID) —
   пройти сценарий подписки И восстановления покупок на реальном/симулированном устройстве.

## Не сделано в этой сессии (нужен Xcode / живой аккаунт)

- Настройка самого RevenueCat-проекта и App Store Connect продукта (шаги 1–3 выше) — доступ есть
  только у владельца.
- Live-тест покупки/восстановления в StoreKit sandbox.
- Возможна доработка нативной стороны, если поведение плагина 9.2.2 на реальном устройстве
  отличается от документации (см. предупреждение в `healthkit-bridge.js` про то же самое с
  HealthKit-плагином — версии плагинов иногда расходятся с доками).
