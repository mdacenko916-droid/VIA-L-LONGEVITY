# VIA·L — нативное приложение пациента (Capacitor)

Папка `app/` = **исходники нативного приложения**, отдельно от статического сайта в корне репо.
Сайт остаётся без сборочной системы; npm/Capacitor живут только здесь и на деплой сайта не влияют.

Спека и замысел: [`../docs/MOBILE-APP-MODEL.md`](../docs/MOBILE-APP-MODEL.md).

## Архитектура: ИЗОЛИРОВАННЫЙ бандл (вариант 1) — веб-ассеты зашиты локально

Приложение НЕ грузит контент с via-l.com. Веб-ИП зашит локально в `app/www` (нет `server.url`
в конфиге). Причина: (1) store-ревьюер не видит домен и оценивает приложение как отдельный
изолированный велнес-продукт; (2) Apple не любит вебвью на удалённый URL (Guideline 4.2).
Нативная польза (HealthKit/Health Connect/push) — ради неё Apple одобряет, а не отклоняет как
«завёрнутый сайт».

**Важно:** `app/www` СОБИРАЕТСЯ скриптом [`./sync-web.sh`](./sync-web.sh) из веб-ИП и в git НЕ
коммитится (генерится локально, как node_modules/ios/android). Точка входа = `interpreter-via-l.html`
→ копируется в `www/index.html`.

**ИИ-анализ по-прежнему живой:** приложение дергает воркер по сети
(`interpreter.viaelcom.workers.dev`, CORS `*`) — правки промпта/знаний долетают БЕЗ пересборки.
Пересборка нужна только для изменений UI/HTML-оболочки.

- `package.json` — зависимости Capacitor (core/cli/ios/android).
- `capacitor.config.json` — `appId=com.viael.interpreter`, `appName=VIA·L`, `webDir=www` (без server).
- `sync-web.sh` — собирает `www` из веб-ИП. **Запускать перед каждой сборкой**, после готовых веб-правок.

### Рабочий цикл (веб → приложение)
1. Все правки делаются в вебе (`interpreter/*.html`, воркер), тестируются в браузере на via-l.com.
2. Когда веб готов → `bash app/sync-web.sh` (пересобрать `www`).
3. `cd app && npx cap sync` → открыть в Xcode / Android Studio → собрать и протестировать нативно.
4. ⚠️ На первой сборке проверить, что все пути резолвятся локально (Logo, images-in, legal, бриджи)
   и что ссылка «домой» (`./index.html`) ведёт куда нужно — в бандле index.html это сама PRO-страница.

> Для live-reload при разработке можно временно вернуть в конфиг `"server": { "url": "…" }` —
> но для стор-сборки его быть НЕ должно.

## Первый запуск (на машине разработчика — Mac)

Требуется: Node.js, Xcode (iOS), Android Studio (Android).

```bash
cd app
npm install
npx cap add ios          # создаст app/ios (нативный проект Xcode)
npx cap add android      # создаст app/android (нативный проект Android Studio)
npx cap sync
npx cap open ios         # открыть в Xcode → Run на симуляторе/устройстве
npx cap open android     # открыть в Android Studio → Run
```

`ios/` и `android/` сейчас в `.gitignore` (генерятся локально). Когда начнём править нативный код
(мосты HealthKit и т.п.) — снимем из игнора и закоммитим осознанно.

> ⚠️ **Известный блокер `pod install`** (`npx cap sync` падает): `Encoding::CompatibilityError` —
> связка Ruby/CocoaPods, Unicode Normalization для ASCII-8BIT. Обход:
> `cd app/ios/App && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install`. Веб-контент в
> `ios/App/App/public/` копируется и без `pod install` — он нужен только при смене нативных плагинов.

## Дорожная карта (этапы из MOBILE-APP-MODEL.md §5)

- [x] **Слой 0 — скаффолд**: Capacitor-обёртка, изолированный бандл (`app/www`, собирается `sync-web.sh` из веб-ИП — см. «Архитектура» выше).
- [x] **Режим приложения** (`../interpreter/app-mode.js`, на всех ИП-страницах): внутри обёртки
  прячет EXPERT/ELITE + любые Hotmart-ссылки (anti-steering) + «← Сайт»/«Кабінет»; остаются VIO+PRO.
  На вебе — no-op. ⏳ дальше: ввод кода доступа (EXPERT/ELITE с сайта) + IAP для PRO.
- [~] **HealthKit (iOS)** — код готов, ждёт сборки+теста на устройстве (см. `HEALTHKIT.md`):
  плагин `@perfood/capacitor-healthkit` + мост `../interpreter/healthkit-bridge.js` (читает HRV/пульс/
  сон/VO2 → поля карточки Apple) + кнопка «📲 Apple Health» на `interpreter-via-l.html` (видна только
  в приложении). Осталось: Xcode-capability + Info.plist, проверка на iPhone, перенос на pro-expert/elite.
- [ ] **Health Connect (Android)** — Samsung/Xiaomi и пр.
- [ ] **Push-уведомления** (напоминалка в телефоне).
- [ ] **Вход по коду доступа** — уже есть в вебе (экран «Мой специалист»); проверить в обёртке.
- [~] **IAP для VIA·L** (€15/мес, RevenueCat, см. `IAP.md`) — код готов, ждёт настройки владельцем
  (RevenueCat-проект + App Store Connect продукт + реальный API key) и сборки/теста на устройстве.
- [ ] **Публикация** — аккаунты Apple ($99/год) / Google ($25), листинги, политика, ревью.

## Открытые решения (см. MOBILE-APP-MODEL.md §6)

- **Источник веба:** РЕШЕНО (см. «Архитектура» выше, 2026-07) — изолированный бандл `www/`
  (`sync-web.sh`), не `server.url` на живой сайт. ИИ-анализ всё равно живой (воркер по сети).
- **HealthKit ↔ веб-ИП:** данные из натива надо прокинуть в веб-слой (Capacitor-плагин + вызов из
  JS ИП). Это основная интеграционная работа следующего этапа.
- **PRO в приложении:** РЕШЕНО (2026-07-15) — только Apple IAP (auto-renewable subscription,
  €15/мес), НЕ код с сайта/Hotmart (Hotmart как канал продаж отвязан). Код готов — см. `IAP.md`
  для настройки RevenueCat/App Store Connect и остатка.
