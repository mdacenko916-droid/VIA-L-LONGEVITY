# Garmin

**Краткий статус:** ждём вендора. 3 заявки (последняя 2026-06-11, полные реквизиты юрлица
VIA-L/UA через developercontactus). Кода в воркере ещё нет. НЕ блокер — app читает Garmin
через Apple Health / Health Connect.

## Сейчас (как есть)
- Кнопка-карточка Garmin в списке устройств показывается, но авто-подключение не работает.
- Заявка подавалась через форму «Contact Garmin Health» — **ответа нет неделями**.

## Сделано
- 1-я попытка (раньше) — без ответа.
- ✅ **2026-06-08: подана повторно** (контакт `integration@via-l.com`, текст с OAuth 2.0
  PKCE, запрошены Health API + Women's Health API).
- ✅ **2026-06-11: 3-я подача — финальная, с полными реквизитами юрлица.** Через форму
  **`garmin.com/en-US/forms/developercontactus/`** (Name: Ihor Datsenko, Company: **VIA-L**,
  Email: integration@via-l.com, Country: **Ukraine / Zaporiz'ka Oblast'**, программа:
  **Garmin Connect Developer Program**, Message: use case с Health+Women's Health API, OAuth 2.0
  PKCE, redirect `…/garmin/callback`, GDPR). Ответ формы: «We'll be in touch soon».
  ⚠️ **Канал:** форма живёт ИМЕННО на `garmin.com/en-US/forms/developercontactus/` —
  на `developer.garmin.com/gc-developer-program/overview` формы НЕТ (только обзор).
  В выпадашке «developer program» наш пункт = **Garmin Connect Developer Program**
  (НЕ «Garmin Health SDKs» — то мобильные device-SDK).

## В процессе
- Ждём ответ/одобрение Garmin. Норма ответа — около **2 рабочих дней**. Следить за
  входящими на `integration@via-l.com`. Если тишина >1 недели — пинг или агрегатор (см. README).

## В ожидании
- Одобрение бизнес-аккаунта → приглашение на интеграционный звонок → доступ к порталу
  с кодами (Client ID/Secret).

## Что нужно сделать
1. **Переподать заявку** через `developer.garmin.com/gc-developer-program` — как
   **юридическое лицо** (клиника/компания; личное использование они не принимают).
   Запросные API: **Health API** + **Women's Health API** (цикловые данные — важно
   для женской секции). Адрес возврата запланировать `.../garmin/callback`.
2. После одобрения Garmin сами зовут на короткий звонок и открывают портал с кодами.
3. **Я:** написать в воркере адреса `/garmin/start`, `/garmin/callback`, `/garmin/metrics`.
4. **Владелец:** заложить секреты Garmin, `wrangler deploy`.

## Важно знать
- Доступ для бизнеса бесплатный, но **premium-метрики могут стоить денег** (license fee);
  есть бесплатная пробная фаза.
- Если Garmin продолжит молчать — есть запасной путь через агрегатор (см. README).
- ⚠️ **Не блокер.** Garmin пишет в Apple Health / Health Connect → для пользователей
  будущего приложения подключится **без кодов** (см. [app-health-store.md](app-health-store.md)).
  Веб-коды Garmin нужны лишь для веб-клиентов и чтобы добрать HRV. Переподать по разу — и
  спокойно ждать, без нервов.
- ℹ️ **OAuth:** Garmin перешёл на **OAuth 2.0 (PKCE)**; старый OAuth 1.0a отключается
  **31.12.2026**. В заявке указывать 2.0 (PKCE) — это актуально (миф про «только 1.0a» устарел).

## Готовый текст заявки (на 2026-06-08, для повторной подачи)
Куда: developer.garmin.com/gc-developer-program (как юрлицо), либо форма
garmin.com/en-US/forms/developercontactus/. Контактный e-mail: **integration@via-l.com**
(корпоративный домен — снижает риск авто-отказа; заведён на Namecheap-пересылке → gmail).

Поля: Company = `[юр. название]`, Website = `https://via-l.com`,
Email = `integration@via-l.com`, Country = `[страна]`, APIs = **Health API + Women's Health API**.

Use case (вставить целиком):
```
VIA-L (via-l.com) is a digital longevity and clinical-nutrition service that
interprets wearable biomarkers into personalized nutrition guidance, with a
strong focus on women's health (menopause) and men's health (andropause).

We would like to integrate the Garmin Health API and Women's Health API so our
users can connect their Garmin account and securely import sleep, HRV, resting
heart rate, stress, Body Battery, SpO2, steps and menstrual-cycle data. The
cycle data is important for our women's-health section.

All data is processed server-side via Garmin's OAuth 2.0 (PKCE) flow on our
Cloudflare Worker backend and used solely to generate the user's own nutritional
interpretation — never resold or shared with third parties.

OAuth redirect URI: https://interpreter.viaelcom.workers.dev/garmin/callback
Business email: integration@via-l.com
We are EU-based and ready for the integration call.
```
