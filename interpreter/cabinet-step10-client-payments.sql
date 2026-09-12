-- ─────────────────────────────────────────────────────────────
-- VIA·L — Кабинет, ШАГ 10: ОПЛАТА КЛИЕНТОМ ПРИЛОЖЕНИЯ VIA-L EXPERT.
--
-- Зачем. Решение владельца 2026-09-12: пользование PWA VIA-L EXPERT оплачивает
-- КЛИЕНТ — €30/мес, сверх цены ведения, и не обязательно через Hotmart (чаще —
-- на карту специалисту). На лендинге это уже написано (ключ `app_fee`, 12 языков),
-- но в кабинете фиксировать такую оплату было негде.
--
-- Почему отдельная таблица, а не существующая `payments`. Там деньги идут в другую
-- сторону: специалист → платформа (kind='software'|'platform'), и суммы оттуда
-- ГАСЯТ долг специалиста в расчёте /cabinet/billing. Если положить туда же платёж
-- клиента, долг специалиста молча обнулится чужими деньгами. Направление денег
-- разное — значит и журнал разный.
--
-- Применение (ОДИН раз, на боевой БД):
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=cabinet-step10-client-payments.sql
--
-- АДДИТИВНО: одна новая таблица. Готовое не ломается.
-- ─────────────────────────────────────────────────────────────

-- ── ЖУРНАЛ ОПЛАТ КЛИЕНТА ЗА ПРИЛОЖЕНИЕ ───────────────────────
-- Одна строка = один платёж клиента за период пользования PWA.
-- Вносит специалист (или владелец) руками в карточке клиента: платёжной интеграции
-- для этих денег нет и не планируется — они идут мимо платформы, на счёт специалиста.
CREATE TABLE IF NOT EXISTS client_payments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  card_code     TEXT,               -- код карточки клиента (ключ связи со всем остальным)
  specialist_id INTEGER,            -- кто принял деньги (он же владелец карточки на момент оплаты)
  amount_eur    REAL,               -- сколько заплачено
  method        TEXT,               -- 'card' | 'hotmart' | 'cash' | 'other'
  paid_at       TEXT,               -- YYYY-MM-DD, когда деньги получены
  period_from   TEXT,               -- YYYY-MM-DD, с какого дня оплачено
  period_to     TEXT,               -- YYYY-MM-DD, по какой день оплачено (из него считается «оплачено до»)
  note          TEXT,
  created_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_cpay_card ON client_payments(card_code);
CREATE INDEX IF NOT EXISTS idx_cpay_spec ON client_payments(specialist_id);

-- ── ПРОВЕРОЧНЫЕ ЗАПРОСЫ ──────────────────────────────────────
--   SELECT COUNT(*) FROM client_payments;
--   SELECT card_code, MAX(period_to) paid_until, ROUND(SUM(amount_eur),2) total
--     FROM client_payments GROUP BY card_code;
