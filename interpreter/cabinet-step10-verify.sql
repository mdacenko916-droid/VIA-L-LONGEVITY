-- ─────────────────────────────────────────────────────────────
-- VIA·L — ПРОВЕРКА СПЕЦИАЛИСТА ДО ПУБЛИКАЦИИ (A3, 2026-08-03).
--
-- Зачем: платформа не должна становиться рассадником — специалист попадает в витрину и
-- получает право выдавать доступы ТОЛЬКО после проверки документов. Это отсекает случайных
-- людей на входе, а не после жалоб.
--
-- Два набора с разной юридической ценой:
--  • ПУБЛИЧНЫЕ — видит клиент: образование, квалификация, номер регистрации (ФОП — открытый
--    реестр, проверяется за минуту), сайт, город. Ради этого человек и открывает карточку.
--  • СЛУЖЕБНЫЕ — видит только владелец: юр. имя, налоговый номер, адрес для корреспонденции,
--    телефон, дата и способ проверки, ссылка на подписанный договор.
--
-- ⚠️ ПАСПОРТНЫЕ ДАННЫЕ НЕ ХРАНИМ. Сверх ФОП/налогового номера они не дают ничего для
-- идентификации, но резко поднимают нашу ответственность (чувствительные данные: основание,
-- срок хранения, защита, уведомление при утечке). Документы показываются один раз при
-- подключении — в системе остаётся ФАКТ проверки.
--
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=cabinet-step10-verify.sql
-- ─────────────────────────────────────────────────────────────

ALTER TABLE specialists ADD COLUMN education     TEXT;   -- публично: образование/квалификация
ALTER TABLE specialists ADD COLUMN reg_number    TEXT;   -- публично: ФОП/лицензия (проверяемо в реестре)
ALTER TABLE specialists ADD COLUMN website       TEXT;   -- публично: сайт или соцсеть
ALTER TABLE specialists ADD COLUMN city          TEXT;   -- публично: город, страна
ALTER TABLE specialists ADD COLUMN legal_name    TEXT;   -- служебно: полное юридическое имя
ALTER TABLE specialists ADD COLUMN tax_id        TEXT;   -- служебно: налоговый номер
ALTER TABLE specialists ADD COLUMN address       TEXT;   -- служебно: адрес для корреспонденции
ALTER TABLE specialists ADD COLUMN phone         TEXT;   -- служебно: телефон
ALTER TABLE specialists ADD COLUMN contract_url  TEXT;   -- служебно: ссылка на подписанный договор
ALTER TABLE specialists ADD COLUMN verified      INTEGER DEFAULT 0;  -- ГЕЙТ: 0 — не в витрине и не выдаёт доступы
ALTER TABLE specialists ADD COLUMN verified_at   TEXT;   -- когда проверен
ALTER TABLE specialists ADD COLUMN verify_note   TEXT;   -- что именно проверено (какие документы видели)
ALTER TABLE specialists ADD COLUMN publish_consent_at TEXT;  -- согласие показывать данные клиентам

-- Основатель (id=1) считается проверенным: договор с самим собой не нужен.
UPDATE specialists SET verified=1, verified_at=date('now'), verify_note='основатель платформы'
 WHERE id=1 AND COALESCE(verified,0)=0;
