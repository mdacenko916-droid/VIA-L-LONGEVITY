# Ultrahuman (кольцо)

**Краткий статус (2026-09-10):** ✅ **ключи получены самостоятельно, код написан** — ⏳ ждёт
`wrangler deploy` и первой живой проверки на кольце.
- Заявки в partnerships (три, последняя 27.08) оказались не нужны: OAuth-приложение заводится
  само в кабинете **`vision.ultrahuman.com/developer`** → «Create OAuth application», Client ID и
  Secret выдаются сразу. Название VIA-L, redirect `…/ultrahuman/callback`, сохранилось только право
  `ring_data` (profile не записался — не нужен).
- Секреты `ULTRAHUMAN_CLIENT_ID` / `ULTRAHUMAN_CLIENT_SECRET` в воркере, ключи у владельца в менеджере паролей.
- Воркер: `/ultrahuman/start|callback|metrics`. Авторизация `auth.ultrahuman.com/authorise`, токен
  `partner.ultrahuman.com/api/partners/oauth/token` (токен живёт сутки, refresh есть), метрики
  `…/api/partners/v1/user_data/metrics?date=YYYY-MM-DD` — по дню, берём 7 дней параллельно.
- ⚠️ Форма ответа в доке не описана — ключи взяты из открытого клиента (raycast ultrahuman-insights).
  На первом живом ответе смотреть `wrangler tail`: строка `ultrahuman types …` (только имена типов).
- Фронт (оба тарифа): в карточке блок «🔗 Подключить Ultrahuman» над ручным вводом, общий
  `connectWearable('ultrahuman')`, строки `_ultrahumanT` × 12 языков.
- ⚠️ `ultrahuman` в `WEARABLE_RESEARCH_BLOCK` из осторожности — API Agreement (notion) не прочитан, сверить.
- Аффилиатный трек у них ОТДЕЛЬНЫЙ от partnerships, реферальная ссылка — владельцу кольца в приложении.

## Сейчас (как есть)
- ✅ **Карточка Ultrahuman добавлена на экран импорта (2026-06-11)** во всех 4 инструментах
  (vio/pro/pro-expert/elite): ручной ввод метрик кольца (HRV, пульс покоя, сон, глубокий сон,
  темп. отклонение, восстановление→readiness), ключ `desc_ultrahuman` на 12 языков, иконка 💍.
  В тексте честно: в приложении кольцо тянется само через Apple Health / Health Connect, прямой
  веб-OAuth — когда придут коды. Вкладок файл/подключить НЕТ намеренно (нет файлового экспорта,
  нет кодов).
- Авто-OAuth-подключения пока нет (нет кодов, нет роутов в воркере).
- ✅ **Фото-карточка Ultrahuman добавлена в пикер устройств** `interpreter/index.html`
  (2026-06-08) — теперь на сайте 11 устройств, ряд колец (Oura + Ultrahuman).
- Письмо отправляли на `partnerships@ultrahuman.com` — **ответа нет**. Возможно, ушло
  не по тому каналу.

## Сделано
- 1-я попытка: письмо на `partnerships@ultrahuman.com` — без ответа.
- ✅ **2026-06-08: повторно подано через форму на ultrahuman.com** (прошли все шаги,
  контакт `integration@via-l.com`). Финальный экран: «Our team will be in touch within
  24 hours».

## В процессе
- ✅ **2026-06-08: Ultrahuman ОТВЕТИЛ** (в тот же день!). Письмо от **Vighnesh, Partnerships
  Team** (`partners@ultrahuman.com` → на `integration@via-l.com`). Ответ тёплый, позитивный:
  идея нравится, хотят **30-мин discovery-звонок на след. неделе**, отметили GDPR (Испания),
  просят рассказать про тех-возможности, таймлайн, базу клиентов и планы роста.
- Ответ (reply с gmail): вместо живого звонка — вежливо предложить **письменный формат**
  (владелец/команда не говорят по-английски, работают на UA/RU), и сразу дать в письме все
  ответы (OAuth/redirect/scopes ring_data, GDPR-готовность, описание базы, таймлайн).
  Если Vighnesh настоит на звонке — подключить переводчика. Все письма Vighnesh ↔ владелец
  переводит Claude (англ↔рус).

## В ожидании
- Звонок с Vighnesh → далее коды (Client ID/Secret) + onboarding Partnership API.

## Что нужно сделать
1. **Переподать заявку** через форму на `partnerships.ultrahuman.com` (а не просто письмом),
   и **обязательно указать email того Ultrahuman-аккаунта**, к которому привязано кольцо —
   они прямо пишут, что это ускоряет ответ.
2. Документация для интеграции: `vision.ultrahuman.com/developer-docs?type=oauth`.
   Базовый адрес API: `partner.ultrahuman.com`. Нужные права: `ring_data` (и при желании
   `cgm_data`, `profile`).
3. После получения кодов — **я** пишу адреса `/ultrahuman/start`, `/callback`, `/metrics`.
4. ✅ **Карточка Ultrahuman на экране импорта добавлена (2026-06-11, ручной ввод).** После кодов —
   доточить: добавить в карточку вкладку «🔗 Подключить» (OAuth), как у Polar/Withings.
5. **Владелец:** заложить секреты, `wrangler deploy`.

## Важно знать
- Если ответа снова не будет — запасной путь через агрегатор (см. README).
- ⚠️ **Не блокер.** Ultrahuman пишет в Apple Health / Health Connect → для пользователей
  будущего приложения кольцо подключится **без кодов** (см. [app-health-store.md](app-health-store.md)).
  Веб-коды нужны лишь для веб-клиентов и чтобы добрать HRV. Переподать по разу — и спокойно ждать.

## Готовый текст заявки (на 2026-06-08, повторная подача)
Куда: форма **partnerships.ultrahuman.com** (надёжнее) или письмо на
`partnerships@ultrahuman.com`. Контакт: **integration@via-l.com**. Если есть аккаунт
Ultrahuman — указать его e-mail (ускоряет ответ).

Subject: `Partnership API access — VIA-L (longevity & nutrition app)`
```
Hello Ultrahuman Partnerships team,

We are VIA-L (via-l.com), a digital longevity and clinical-nutrition service
that interprets wearable biomarkers into personalized nutrition guidance.

We'd like to integrate the Ultrahuman Partnership API so our users can connect
their Ultrahuman Ring and import their data (sleep, HRV, temperature, heart
rate, recovery; optionally CGM) to generate their own nutritional interpretation.

Could you help us onboard and issue a Client ID / Client Secret?
- OAuth redirect URI: https://interpreter.viaelcom.workers.dev/ultrahuman/callback
- Requested scopes: ring_data (optionally cgm_data, profile)

Data is processed server-side and used only for the user's own analysis — not resold.

Our Ultrahuman account email: [email аккаунта Ultrahuman, если есть]
Business contact: integration@via-l.com — website https://via-l.com

Thank you!
[Имя], VIA-L
```
