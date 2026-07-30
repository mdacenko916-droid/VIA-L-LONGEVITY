-- ─────────────────────────────────────────────────────────────
-- VIA·L — Витрина, фаза 1: направление специалиста (фильтр каталога).
-- category ∈ nutrition | psychology | fitness | medical (NULL = не задано).
-- Специалист выбирает в «Моей витрине»; каталог фильтрует по нему + по языкам.
--
-- Применение (ОДИН раз, на боевой БД):
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=cabinet-step8-category.sql
-- ─────────────────────────────────────────────────────────────

ALTER TABLE specialists ADD COLUMN category TEXT;   -- направление для фильтра витрины

-- Основатель-нутрициолог → Нутрициология (остальные зададут сами)
UPDATE specialists SET category='nutrition' WHERE specialty='nutritionist' AND (category IS NULL OR category='');
