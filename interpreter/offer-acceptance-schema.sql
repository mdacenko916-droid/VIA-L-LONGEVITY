-- ─────────────────────────────────────────────────────────────
-- VIA·L — ЖУРНАЛ АКЦЕПТА ОФЕРТЫ (A2, 2026-08-03).
--
-- Зачем: договор клиента со специалистом заключается ДО оплаты, а формой служит публичная
-- оферта с акцептом действием. Полноценная ЭЦП для сумм €390–500 избыточна и режет конверсию;
-- юридически достаточно доказать МОМЕНТ принятия условий. Этот журнал и есть доказательство.
--
-- Что храним и чего НЕ храним: время, версию текста оферты, специалиста, язык, страну и
-- усечённый user-agent. Сырой IP и персональные данные НЕ пишем — для доказательства события
-- они не нужны, а обязательств добавляют.
--
-- Связка с клиентом: акцепт происходит ДО оплаты, когда клиента ещё нет в системе. Поэтому
-- выдаётся токен, он ложится в localStorage браузера и позже, при подтверждении почты в
-- VIA-L EXPERT, привязывается к карточке (card_code). my-specialist.html и приложение живут
-- на одном домене, поэтому localStorage общий.
--
-- Применение (ОДИН раз, на боевой БД):
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=offer-acceptance-schema.sql
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS offer_acceptances (
  token         TEXT PRIMARY KEY,
  specialist_id INTEGER,
  offer_version TEXT,
  lang          TEXT,
  country       TEXT,
  ua            TEXT,
  card_code     TEXT,
  created_at    INTEGER,
  linked_at     INTEGER
);
CREATE INDEX IF NOT EXISTS idx_offer_spec ON offer_acceptances(specialist_id);
CREATE INDEX IF NOT EXISTS idx_offer_card ON offer_acceptances(card_code);

-- Проверка:
--   SELECT token, specialist_id, offer_version, lang, country, card_code,
--          datetime(created_at/1000,'unixepoch') AS accepted
--     FROM offer_acceptances ORDER BY created_at DESC LIMIT 20;
