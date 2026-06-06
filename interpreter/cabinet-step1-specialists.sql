-- ─────────────────────────────────────────────────────────────
-- VIA·L — Платформа, ШАГ 1: специалисты + привязка клиента.
-- См. docs/PLATFORM-MODEL.md §2, §3, §8.
--
-- Применение (ОДИН раз, на боевой БД):
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=cabinet-step1-specialists.sql
-- (локально для теста — без --remote)
--
-- АДДИТИВНО и безопасно: новая таблица + новая колонка с DEFAULT 1. Существующие
-- клиенты автоматически получают specialist_id=1 (= основатель). Готовое не ломается.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS specialists (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT,
  login             TEXT UNIQUE,
  pass_hash         TEXT,
  lang              TEXT DEFAULT 'ru',          -- рабочий язык (интерфейс + ИИ-черновик)
  specialty         TEXT DEFAULT 'nutritionist',-- gynecologist | endocrinologist | nutritionist | …
  role              TEXT DEFAULT 'specialist',  -- specialist | owner
  ref_code          TEXT UNIQUE,                -- реферальный код (PRO-клиент привязывается по нему)
  access_status     TEXT DEFAULT 'active',      -- active | lapsed (оплачена ли абонплата)
  access_paid_until TEXT,
  status            TEXT DEFAULT 'active',      -- active | disabled
  created_at        INTEGER
);

-- Специалист №1 = основатель (текущий нутрициолог). Без личных имён — нейтральная метка.
INSERT OR IGNORE INTO specialists
  (id, name, lang, specialty, role, ref_code, access_status, status, created_at)
VALUES
  (1, 'Основатель', 'ru', 'nutritionist', 'owner', 'FOUNDER', 'active', 'active',
   CAST(strftime('%s','now') AS INTEGER) * 1000);

-- Привязка клиента к специалисту. DEFAULT 1 → существующие карточки сразу за основателем.
ALTER TABLE clients ADD COLUMN specialist_id INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_clients_specialist ON clients(specialist_id);
