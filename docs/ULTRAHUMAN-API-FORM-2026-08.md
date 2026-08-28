# Заявка Ultrahuman Partnership API — третья подача (форма, 2026-08-27)

**Куда:** форма **`partnerships.ultrahuman.com`** (не письмо — три письма в
`partnerships@` / `partners@` остались без ответа).
**Контакт:** `integration@via-l.com`
**Что нового с июня:** одобренный production-доступ Oura, приложение на пути в App Store,
политика приватности с разделом про подключённые аккаунты. Плюс в этот раз **не отказываемся
от звонка** — в июне Vighnesh предлагал 30-минутный discovery-созвон, мы попросили письменный
формат, и на этом всё заглохло (`interpreter/wearables/ultrahuman.md`).

---

## 1. Короткие поля формы

| Поле | Что вписать |
|---|---|
| Company / Product | VIA-L |
| Website | https://via-l.com |
| Contact email | integration@via-l.com |
| Contact name | Ihor Datsenko |
| Region | EU (team based in Spain), members worldwide |
| Integration type | Partnership API — OAuth, read-only |
| Scopes requested | `ring_data` (primary), `profile`; `cgm_data` not needed for now |
| Redirect URI | `https://interpreter.viaelcom.workers.dev/ultrahuman/callback` |
| Privacy Policy | https://via-l.com/legal/privacy.html |
| Terms of Service | https://via-l.com/legal/terms.html |
| Timeline | Routes can be live within days of receiving Client ID / Secret |
| Ultrahuman account email | ⚠️ указать e-mail аккаунта Ultrahuman, если кольцо будет куплено — они прямо пишут, что это ускоряет ответ |

---

## 2. Основной текст (EN) — в поле «tell us about your use case»

```
VIA-L is a wellness platform for adults in their late thirties and beyond. It reads what a
tracker already measures — sleep, HRV, resting heart rate, recovery, activity, temperature
trend — and explains, in plain language and in twelve languages, what changed and why. Members
either use it on their own or work through the same data with a specialist.

We would like to connect Ultrahuman Ring through the Partnership API, read-only, with
`ring_data` and `profile`. Our members buy their own rings; what they ask us for is that our
platform read the data they are already generating instead of asking them to type numbers in by
hand every morning. Our App Store application can read ring data through Apple Health and Health
Connect, but our specialist-guided programme runs as a web app outside the app stores, and there
no health-platform bridge exists — a direct connection is the only thing that solves it.

Two things have changed since we first wrote to you in June, and both are the reason we are
applying again rather than waiting.

First, Oura approved our production API access this month and lifted their ten-user cap. The
same platform, the same privacy policy, the same OAuth implementation — reviewed by a ring
manufacturer and accepted. We are not asking you to take a first-time developer on trust.

Second, our integration work is finished on our side. We run OAuth flows for Oura, Fitbit, Polar
and Withings through a Cloudflare Worker; tokens live in encrypted storage, never in the browser.
The Ultrahuman routes are a day's work once we have a Client ID and Secret — the redirect URI
above is already reserved.

On data handling: we do not sell data, do not use it for advertising, do not train models on it,
and do not share it beyond the model provider that generates a member's own written summary.
Health data is processed on explicit consent (GDPR Art. 9(2)(a)), members can export or delete
everything from inside the app, and stored health records are deleted automatically 90 days
after a coaching period ends.

One correction to our earlier exchange. In June Vighnesh kindly offered a 30-minute discovery
call and we asked for a written format instead, because our team works in Ukrainian and Russian
and English is not our first language. That was probably a mistake on our part, and we suspect
it is where the conversation stopped. We are glad to take the call — please offer any slot that
suits you, and we will arrange interpretation on our side. A short written summary afterwards
would help us follow up accurately.
```

---

## 3. Тот же текст по-русски (для себя, не отправляем)

VIA-L — велнес-платформа для людей от 35–40. Читаем то, что трекер и так измеряет (сон, HRV,
пульс покоя, восстановление, активность, температурный тренд), и объясняем понятным языком на
двенадцати языках, что изменилось и почему. Человек либо занимается сам, либо разбирает те же
данные вместе со специалистом.

Хотим подключить Ultrahuman Ring через Partnership API, только чтение, права `ring_data` и
`profile`. Кольца люди покупают сами; просят они другое — чтобы платформа читала уже
собираемые данные, а не заставляла вбивать цифры руками каждое утро. Приложение из App Store
читает кольцо через Apple Health и Health Connect, но программа со специалистом живёт вне
сторов как веб-приложение, где моста здоровья нет — там помогает только прямое подключение.

С июня изменились две вещи, и именно поэтому мы подаём заявку снова, а не ждём.

Первое: в этом месяце Oura одобрила нам production-доступ и сняла лимит в десять пользователей.
Та же платформа, та же политика, та же реализация OAuth — проверена производителем колец и
принята. Мы не просим поверить на слово новичку.

Второе: с нашей стороны работа закончена. OAuth для Oura, Fitbit, Polar и Withings работает
через Cloudflare Worker, токены лежат в защищённом хранилище, а не в браузере. Маршруты для
Ultrahuman — работа на день после получения Client ID и Secret, redirect URI уже зарезервирован.

Про данные: не продаём, не используем для рекламы, не обучаем на них модели и не передаём
никому, кроме поставщика модели, которая пишет человеку его собственную сводку. Данные здоровья
обрабатываем на явном согласии (ст. 9(2)(a) GDPR), выгрузить и удалить всё можно из приложения,
записи в досье удаляются автоматически через 90 дней после окончания ведения.

И поправка к июньской переписке. Тогда Vighnesh предложил 30-минутный discovery-звонок, а мы
попросили письменный формат, потому что команда работает на украинском и русском, английский
нам не родной. Похоже, это была наша ошибка, и разговор остановился именно там. На звонок мы
готовы — предложите любое удобное время, перевод обеспечим со своей стороны. Короткое
письменное резюме после звонка помогло бы нам ничего не упустить.

---

## 4. Если ответа снова нет

- Аффилиатный трек у них **отдельный** от partnerships (своя заявка, одобрение за несколько
  дней) — туда можно идти независимо;
- реферальная ссылка выдаётся владельцу кольца прямо в приложении Ultrahuman (условие —
  быть покупателем), это единственный путь, который не зависит от их ответа вообще;
- запасной путь для данных — агрегатор (см. `interpreter/wearables/README.md`);
- ⚠️ и главное: **это не блокер.** Ultrahuman пишет в Apple Health / Health Connect, поэтому в
  приложении кольцо подключается без всяких кодов. Веб-коды нужны только для веб-клиентов
  (EXPERT PWA) и чтобы добрать HRV.
