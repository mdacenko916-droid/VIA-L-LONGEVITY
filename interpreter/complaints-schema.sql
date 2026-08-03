-- ─────────────────────────────────────────────────────────────
-- VIA·L — ЖАЛОБЫ КЛИЕНТОВ (A5, 2026-08-03).
--
-- Зачем: проверка при подключении отсекает случайных людей, но не тех, кто прошёл проверку и
-- повёл себя плохо. Без канала жалобы сигнал доходит до владельца через отзывы в интернете —
-- то есть слишком поздно, когда репутация уже задета. Один клик из приложения = минуты.
--
-- Храним минимум: кто (код карточки), на кого (специалист), что написал, когда, статус.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS complaints (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  card_code     TEXT,
  specialist_id INTEGER,
  topic         TEXT,      -- no_reply | quality | money | other
  text          TEXT,
  lang          TEXT,
  status        TEXT DEFAULT 'new',   -- new | seen | closed
  created_at    INTEGER,
  closed_at     INTEGER,
  owner_note    TEXT
);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_spec   ON complaints(specialist_id);
