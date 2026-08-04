# Polar

**Краткий статус:** 🔴 НЕ РАБОТАЕТ. Код готов, но **секретов в воркере нет вовсе** — проверено
2026-08-04: `wrangler secret list` не содержит ни `POLAR_CLIENT_ID`, ни `POLAR_CLIENT_SECRET`,
`/polar/start` отвечает `polar_secrets_missing`. Запись «заведены 2026-06-04» была неверной.

**Что нужно от владельца:** client_id и client_secret из кабинета Polar AccessLink
(admin.polaraccesslink.com) → `wrangler secret put POLAR_CLIENT_ID` и `POLAR_CLIENT_SECRET`.
Redirect URI в кабинете Polar: `https://interpreter.viaelcom.workers.dev/polar/callback`.

## Сейчас (как есть)
- Кнопка «🔗 Подключить» есть во всех трёх платных тарифах.
- Доступ самостоятельный (Polar AccessLink) — вендора ждать не нужно.

## Сделано
- Серверные адреса в воркере: `/polar/start`, `/polar/callback`, `/polar/metrics`.
- Кнопка и тексты во всех платных тарифах.

## В процессе
- Ничего активного.

## В ожидании
- Нет.

## Что нужно сделать
- Ничего по запуску — всё заведено и задеплоено.
- Желательно проверить на живом устройстве Polar, когда появится возможность.

## Важно знать
- Тот же общий каркас «Подключить», что у WHOOP/Withings.
