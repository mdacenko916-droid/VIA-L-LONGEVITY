# ADAM-L — нативное приложение (Capacitor)

Мужское приложение. Веб-часть — `interpreter/adam-l.html` (копия VIA-L с мужскими правками, TODO «👨 ADAM-L»).
Эта папка — обёртка для App Store / Google Play, сделана по образцу `app/` (VIA-L); там же подробности
про изолированный бандл, Xcode Cloud и подводные камни (`app/README.md`).

| | VIA-L (`app/`) | ADAM-L (`app-adam/`) |
|---|---|---|
| bundle id / applicationId | `com.viael.vial` | `com.viael.adaml` |
| схема возврата после OAuth трекера | `com.viael.vial://` | `com.viael.adaml://` (воркер пока знает только VIA-L — TODO) |
| точка входа бандла | `interpreter-via-l.html` | `interpreter/adam-l.html` |
| ключи RevenueCat | в `interpreter/iap-bridge.js` | `app-adam/iap-keys.json` → подставляются в копию при сборке |

- `plugins/` и `patches/` — ссылки на `../app/` (плагин Health Connect и патч HealthKit общие).
- `ios/` в git: его собирает Xcode Cloud. `ci_scripts` ставят зависимости в `app-adam/`, запускают `sync-web.sh`
  и `cap sync ios`. Для ADAM-L нужен свой workflow в Xcode Cloud (продукт ADAM-L, путь `app-adam/ios/App`).
- `sync-web.sh` — бандл в `www/`: копирует `adam-l.html` → `index.html` и общие модули, меняет в копиях имя
  VIA-L → ADAM-L, подставляет ключи RevenueCat ADAM-L (нет `iap-keys.json` → подписка в сборке выключена, ключи
  VIA-L в бандл не попадают). ⚠️ Юр-страницы пока VIA-L (`legal-app/`) — до выпуска нужны свои ×12.
- `scripts/setup-ios.js`, `setup-android.js` — копии из `app/` с именем ADAM-L и `com.viael.adaml`.
  `scripts/gen-icons.js` — раскладывает готовую иконку (`assets/icon-source.png`) по iOS/Android.

Локально (`LANG=en_US.UTF-8` обязательно — иначе CocoaPods падает на кодировке):
```bash
cd app-adam && npm ci --legacy-peer-deps && ./sync-web.sh && LANG=en_US.UTF-8 npx cap sync ios
npm run add:android && npm run icons      # Android: генерируется локально, в git не идёт
```
