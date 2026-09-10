# Письмо Ultrahuman — метрики отдают 403 (2026-09-10)

**Куда:** `support@ultrahuman.com` — именно туда Ultrahuman направляет вопросы по API-доступу
(ключи, Partner ID). Если в кабинете `vision.ultrahuman.com/developer` открывается чат поддержки
(значок гарнитуры справа внизу) — тот же текст можно вставить туда.
Не в `partners@` / Vighnesh: этот тред молчит с июня, и вопрос технический, а не партнёрский.
**От кого:** `integration@via-l.com`
**Перед отправкой:** вписать e-mail того аккаунта Ultrahuman, под которым входили при проверке.

**Контекст:** OAuth-приложение заведено самостоятельно, вход и согласие работают, токен выдаётся
(`/oauth/token/info` → 200, наш uid, scope `ring_data`), но `/api/partners/v1/user_data/metrics` → 403
с пустым телом. Непонятно: у аккаунта нет кольца или приложению не включён доступ к данным.
Разбор — `interpreter/wearables/ultrahuman.md`.

---

## EN — отправляем

Subject: `Partner API: /user_data/metrics returns 403 for a valid OAuth token — VIA-L`

```
Hello Ultrahuman team,

We registered an OAuth application in the developer portal (vision.ultrahuman.com/developer)
and are integrating the Partner API into VIA-L, a wellness app (https://via-l.com).

Application: VIA-L
Client ID: I81dd-z7GP0pw9xrDzdkwmYgBaXb6aoBllPepqiKkRQ
Redirect URI: https://interpreter.viaelcom.workers.dev/ultrahuman/callback
Scope: ring_data

The OAuth flow works end to end: the user signs in, sees the consent screen
"VIA-L wants to access your Ultrahuman account — Ring Data", approves, and our server
exchanges the code for an access token. The token checks out: GET /oauth/token/info returns
200 with our application uid and scope ring_data (resource_owner_id 5385273).

However, every data request with that token returns HTTP 403 with an empty body:
GET https://partner.ultrahuman.com/api/partners/v1/user_data/metrics?date=2026-09-09
Authorization: Bearer <access_token>

We tried several dates and the start_epoch / end_epoch parameters — always 403.
Without the "Bearer" prefix the API returns 401 invalid_token, so the token itself is accepted.

The account we tested with does not have a ring paired yet. Could you tell us which of these it is:
1. 403 is expected because the account has no ring data, or
2. our application still needs data access to be enabled on your side — and if so,
   what we need to do?

If there is a test account or sample data we could use to verify the integration before our
first members connect their rings, that would help a lot.

Test account email: [e-mail аккаунта Ultrahuman]
Privacy Policy: https://via-l.com/legal/privacy.html
Terms: https://via-l.com/legal/terms.html

Thank you,
Ihor Datsenko
VIA-L — integration@via-l.com
```

---

## RU — перевод для себя, не отправляем

Тема: «Partner API: /user_data/metrics отвечает 403 на действующий OAuth-токен — VIA-L»

Здравствуйте, команда Ultrahuman!

Мы зарегистрировали OAuth-приложение в кабинете разработчика и подключаем Partner API к
велнес-приложению VIA-L. Приложение VIA-L, Client ID, адрес возврата, право `ring_data`.

Вход работает полностью: человек входит, видит экран «VIA-L хочет доступ к вашему аккаунту
Ultrahuman — данные кольца», соглашается, наш сервер получает токен. Проверка `/oauth/token/info`
подтверждает токен: наше приложение, право ring_data, пользователь 5385273.

Но любой запрос данных с этим токеном возвращает 403 с пустым ответом (адрес метрик за дату).
Пробовали разные даты и параметры start_epoch / end_epoch — всегда 403. Без слова «Bearer» API
отвечает 401 «неверный токен», значит сам токен принимается.

У тестового аккаунта кольца пока нет. Подскажите, что из двух:
1. 403 — нормально, потому что у аккаунта нет данных кольца;
2. нашему приложению ещё нужно включить доступ к данным у вас — и что для этого сделать?

Если есть тестовый аккаунт или пример данных, чтобы проверить подключение до того, как первые
клиенты подключат кольца, это очень помогло бы.

E-mail тестового аккаунта, ссылки на политику и условия.
Спасибо, Ihor Datsenko, VIA-L — integration@via-l.com
