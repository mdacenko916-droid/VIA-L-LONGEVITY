# Ultrahuman (кольцо)

**Краткий статус:** ждём вендора. Письмо отправлено, ответа нет. Кода в воркере ещё нет.

## Сейчас (как есть)
- Авто-подключения нет (нет кодов, нет роутов в воркере, нет import-карточки с вкладками
  файл/ручной/подключить в interpreter-pro/elite).
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
- Ждём ответ команды Ultrahuman — обещали **в течение 24 часов** (т.е. ~к 2026-06-09).
  Следить за входящими на `integration@via-l.com` (→ пересылка в gmail). Если тишина >2 дней
  — пинг через ту же форму / partnerships@ultrahuman.com.

## В ожидании
- Коды от Ultrahuman (Client ID / Client Secret) с их «partner onboarding».

## Что нужно сделать
1. **Переподать заявку** через форму на `partnerships.ultrahuman.com` (а не просто письмом),
   и **обязательно указать email того Ultrahuman-аккаунта**, к которому привязано кольцо —
   они прямо пишут, что это ускоряет ответ.
2. Документация для интеграции: `vision.ultrahuman.com/developer-docs?type=oauth`.
   Базовый адрес API: `partner.ultrahuman.com`. Нужные права: `ring_data` (и при желании
   `cgm_data`, `profile`).
3. После получения кодов — **я** пишу адреса `/ultrahuman/start`, `/callback`, `/metrics`.
4. **Я:** добавить карточку Ultrahuman на экран импорта (станет 11-м устройством).
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
