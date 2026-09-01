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

## ⚠️ Ловушка названий (критично)
- **Health Connect** (Android, на устройстве) = аналог Apple Health, **без CASA**. ✅ Это наш путь.
- **«Google Health» / Google Health API** (`health.googleapis.com`, `googlehealth.*`) = ОБЛАКО,
  Restricted-скоуп, **CASA**. ❌ Кнопку «Google Health» НЕ делаем. Android-кнопка = **Health Connect**.

## Affiliate / referral ≠ API-коды
Владелец хочет affiliate-соглашение с Oura/Ultrahuman. Это **маркетинг**, не техника:
регистрируешься в их партнёрской программе → трекинг-ссылка → на сайт → комиссия с покупок.
**Доступа к данным нет, CASA нет, лимитов нет, коды импорта НЕ нужны.** Affiliate-ссылку можно
вписать прямо в витрину устройств («Нет трекера? Oura → [реф-ссылка]»). За API-кодами Oura/Ultrahuman
гоняться НЕ нужно: и для данных (их отдают Apple Health/Health Connect), и для affiliate — не требуются.

## ⚠️ ПЕРЕСМОТР 2026-08-26 — Oura одобрена, лимит снят (читать ПЕРЕД разделом ниже)

Решения от 2026-07-21 принимались в предположении, что у каждого вендора стена масштаба, и
в первую очередь — что у Oura потолок 10 подключённых пользователей. **Это больше не так.**

- **2026-08-26, тикет #7815321 (Helder, Oura Member Care):** «Your Oura developer application has
  been approved, and we've lifted the ten-user limit.» Ответ пришёл через ~45 минут после подачи
  заявки. В коде менять ничего не потребовалось — Client ID/Secret те же, роуты
  `/oura/start|callback|metrics` работают как работали. Подробности и подача — `OURA-APP-REVIEW-SUBMISSION.md` §5–6.
- **Условия Oura** (тоже из письма): работа по API Agreement; одобрение НЕ даёт прав на имя,
  марки и логотипы Oura; марки — только для атрибуции источника данных и только по Branding
  Guidelines; запрещено использовать их в имени/иконке/брендинге приложения. У нас чисто:
  приложение «VIA·L», «Oura» встречается только как название источника. Сверка — `OURA-COMPLIANCE-REVIEW.md`.
- **Открытый пункт оттуда же (не закрыт):** API Agreement §4(a)(iii)/§6(g) безусловно запрещает
  использовать User Data для улучшения любых AI-моделей — а `handleResearchDay` кладёт метрики
  трекера в D1 `research_days` с колонкой `src`. Для `src='oura'` метрики трекера принимать нельзя.
  Решение владельца не принято, правка не внесена.

**Что из-за этого меняется в решениях ниже:** п. 2 (прятать вендор-OAuth из публичной панели)
**отменён** — кнопка «Синхронизация устройства» публичная, Oura в ней приоритетный канал. Пп. 1,
3, 4, 5, 6 в силе: Apple Health / Health Connect остаётся широким приёмником и единственным путём
без CASA для остальных трекеров, Fitbit Web API по-прежнему депрекейтится 09.2026.

---

## Решения (приняты 2026-07-21 — см. пересмотр выше)
1. **Публичный путь = Apple Health (iOS) · Health Connect (Android) · Ручной ввод.** Три «кнопки».
2. ~~**4 вендор-OAuth-карточки (Oura/Polar/Fitbit/Withings) прячем из публичной панели**, код спящий
   (для личного теста владельца).~~ **ОТМЕНЕНО 2026-08-26** (см. пересмотр выше): панель публичная,
   `_chooseSource('device')` → `openImport('full')` — рабочий пользовательский путь, Oura в приоритете.
3. **11 фото-гаджетов** (`interpreter/images-in/*.PNG`: Oura/Fitbit/Garmin/WHOOP/Polar/Withings/
   Samsung/Xiaomi/Amazfit/Ultrahuman + Apple Watch) → **витрина совместимости** «работает с этими
   через приложение здоровья на телефоне». Не OAuth-кнопки.
4. **Прямой Fitbit Web API — НЕ делаем (закрыто 2026-07-21).** На `dev.fitbit.com` объявлено:
   legacy Fitbit Web API **депрекейтится в сентябре 2026** и мигрирует в **Google Health API** — т.е.
   в тот самый облачный CASA-путь. Строить на умирающем API, ведущем в CASA, бессмысленно.
   - **Fitbit на Android** → через Health Connect (Fitbit-приложение туда пишет). Устойчиво, без CASA.
   - **Fitbit на iOS** → ручной ввод (Fitbit не пишет в Apple Health) или сторонний мост Fitbit→Apple Health.
     Узкая дырка «Fitbit + iPhone»; прочие трекеры в Apple Health пишут штатно.
5. Облачный Google-Health-путь (`/fitbit/*`, `GH_*` в воркере) — оставить спящим за флагом, не удалять
   (для личного теста владельца, 1 юзер в Testing).
6. **Итог:** on-device Apple Health / Health Connect — единственный устойчивый путь без CASA.
   Любой облачный путь к носимым = стена вендора или Google Health/CASA.
