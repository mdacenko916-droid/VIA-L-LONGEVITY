-- ─────────────────────────────────────────────────────────────
-- VIA·L — Кабинет нутрициолога. Схема D1 (Этап 1 — фундамент).
-- См. docs/CABINET-MODEL.md §4, §6, §7.1.
--
-- Применение:
--   wrangler d1 execute vial-cabinet --remote --file=cabinet-schema.sql
-- (локально для теста — без --remote).
--
-- Этап 1 заводит ОДНУ таблицу clients. Связанные таблицы вкладок
-- (анкета, биометрия по неделям, разборы, сессии, план, переписка)
-- появятся в Этапах 2–4 — пока досье вкладок живёт в JSON-колонке `data`.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
  code           TEXT PRIMARY KEY,   -- код доступа = ключ клиента (тот же, что у анкеты и ТГ-топика)
  name           TEXT,
  email          TEXT,
  tg             TEXT,               -- telegram-контакт / username
  phone          TEXT,
  lang           TEXT,

  -- продукт / тариф (шапка карточки, §4)
  product        TEXT,               -- 'site' | 'interpreter'
  program        TEXT,               -- для сайта: Menopauza | Andropauza | Antivikove | Estrogen
  tier           TEXT,               -- Разовая | Ведение-8W | Ведение-12W | VIAL-EXPERT-8W | VIAL-EXPERT-12W
  duration_weeks INTEGER,
  price          TEXT,
  format         TEXT,               -- 'zoom' | 'pdf' | 'expert' | 'once' (производное «формат сопровождения»)
  start_date     TEXT,               -- ISO yyyy-mm-dd
  end_date       TEXT,               -- расчёт от start_date + длительности
  status         TEXT DEFAULT 'active', -- active | done | paused

  -- legacy-поля прототипа (используются текущими вкладками)
  gender         TEXT,
  age            INTEGER,
  phase          TEXT,

  data           TEXT,               -- JSON: полное досье клиента (sessions/protocol/labs/notes/…) до Этапов 2–4

  -- Платформа, Шаг 1: чей это клиент (см. docs/PLATFORM-MODEL.md §3, миграция cabinet-step1-specialists.sql).
  -- DEFAULT 1 = основатель; для свежей БД таблицу specialists и запись №1 создаёт та же миграция.
  specialist_id  INTEGER DEFAULT 1,

  created_at     INTEGER,
  updated_at     INTEGER
);

CREATE INDEX IF NOT EXISTS idx_clients_status     ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email      ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_specialist ON clients(specialist_id);
CREATE INDEX IF NOT EXISTS idx_clients_updated ON clients(updated_at DESC);
