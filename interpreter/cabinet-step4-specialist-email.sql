-- ─────────────────────────────────────────────────────────────
-- VIA·L — Платформа, ШАГ 4: email специалиста (матчинг абонплаты).
-- См. docs/PLATFORM-MODEL.md §5. Аддитивно: одна новая колонка.
--
-- Применение (ОДИН раз, на боевой БД):
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=cabinet-step4-specialist-email.sql
-- ─────────────────────────────────────────────────────────────

ALTER TABLE specialists ADD COLUMN email TEXT;
