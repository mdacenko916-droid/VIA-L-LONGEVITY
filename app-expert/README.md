# VIA·L EXPERT — нативная обёртка (Capacitor)

Устанавливаемое приложение VIA·L EXPERT с иконкой, **вне App Store**
(в EXPERT клинический контент — обычная модерация магазина не подходит;
распространение через TestFlight / прямую установку). Обёртка **тонкая**:
грузит живой PWA по `server.url` из `capacitor.config.json`, поэтому **всегда
показывает актуальную версию без пересборки** — правки на сайте видны сразу.

Отдельный проект от `app/` (это VIA·L, тариф с App Store + IAP + HealthKit).
Здесь другой bundle id: `com.viael.expert`.

## Что даёт
- Иконка на экране, запуск как приложение (не «сайт в браузере»).
- Вход по коду доступа — как в вебе (гейт PWA внутри).

## Чего пока НЕ даёт (осознанно)
- **Нативный HealthKit / Health Connect** — не подключён. Авто-синхро гаджета в
  EXPERT уже есть через вендор-OAuth (Oura/Polar/Withings) прямо в PWA, поэтому
  для старта нативные health-плагины не нужны. Если понадобится Apple Watch
  (только HealthKit) — добавить `@perfood/capacitor-healthkit` + мост, как в `app/`.
- **IAP** — не нужен: оплата EXPERT идёт через специалиста (код доступа), не через Apple.

## Сборка (на Mac)
```bash
cd app-expert
npm install
npx cap add ios          # и/или: npx cap add android
npx cap sync
npx cap open ios         # откроет Xcode → выбрать команду подписи → Run на устройстве/симуляторе
```
Для iPhone по кабелю/TestFlight нужен Apple Developer ($99/год). Симулятор — без него.

## Обновление
Правок в этом проекте почти не бывает: контент грузится с сайта (`server.url`).
Меняется адрес/иконка → правишь `capacitor.config.json` / ассеты, затем `npx cap sync`.

## Заметки
- `ios/`, `android/`, `node_modules/` — генерируются локально, в git не коммитятся.
- Если Apple/Google отклонят «webview-приложение» (правило minimum functionality) —
  это ожидаемо для магазина; EXPERT распространяется вне стора (TestFlight/ссылка).
