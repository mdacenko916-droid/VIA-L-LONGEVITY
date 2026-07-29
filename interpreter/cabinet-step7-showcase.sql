-- ─────────────────────────────────────────────────────────────
-- VIA·L — Витрина специалистов («Мой наставник» в VIA-L app).
-- Публичный список наставников: клиент выбирает → записывается на зум.
-- См. tasks/TODO.md §«Воронка VIA-L → витрина → EXPERT PWA», docs/PLATFORM-MODEL.md §10.
-- Аддитивно: пять колонок. public=1 → карточка видна в витрине.
--
-- Применение (ОДИН раз, на боевой БД):
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=cabinet-step7-showcase.sql
-- ─────────────────────────────────────────────────────────────

ALTER TABLE specialists ADD COLUMN public   INTEGER DEFAULT 0;   -- 1 = показывать в витрине
ALTER TABLE specialists ADD COLUMN photo    TEXT;                -- URL/дата-URI фото (квадрат)
ALTER TABLE specialists ADD COLUMN bio      TEXT;                -- короткое описание для карточки
ALTER TABLE specialists ADD COLUMN cal_url  TEXT;                -- ссылка на 15-мин знакомство (Cal.com)
ALTER TABLE specialists ADD COLUMN langs    TEXT;                -- языки через запятую (напр. "uk,ru,en")
