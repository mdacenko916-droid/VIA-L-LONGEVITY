-- ─────────────────────────────────────────────────────────────
-- VIA·L — Платформа, ШАГ 9: БУХГАЛТЕРИЯ ВЛАДЕЛЬЦА.
--
-- Зачем. Механика выдачи доступа EXPERT есть, а бухгалтерской основы не было:
-- сумма к оплате (`owed` = дни ÷ 30 × €20) считалась при выдаче и жила ТОЛЬКО в KV
-- `expert_access:<GRANTCODE>` с TTL «срок + 60 дней» — то есть запись о деньгах
-- самоуничтожалась через два месяца после окончания ведения. Плюс KV нельзя перебрать
-- и сгруппировать по специалисту. Отчёт «сколько мне должен специалист за полгода»
-- на таком фундаменте не построить.
--
-- Решение: KV остаётся рабочим механизмом ДОСТУПА (быстрая проверка кода),
-- D1 становится бухгалтерской ПРАВДОЙ — журнал выдач и журнал оплат.
--
-- Применение (ОДИН раз, на боевой БД):
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=cabinet-step9-billing.sql
--
-- АДДИТИВНО: две новые таблицы + одна колонка с DEFAULT. Готовое не ломается.
-- ─────────────────────────────────────────────────────────────

-- ── ЖУРНАЛ ВЫДАЧ (начисления за софт) ────────────────────────
-- Одна строка = один выданный доступ EXPERT. Продление меняет days/owed/expiry,
-- отзыв ставит revoked=1 (строка НЕ удаляется — начисление за отработанное остаётся).
CREATE TABLE IF NOT EXISTS grants (
  code          TEXT PRIMARY KEY,   -- GRANTCODE (тот же, что в KV)
  card_code     TEXT,               -- код карточки клиента
  specialist_id INTEGER,            -- кто выдал = кто платит за софт
  plan          TEXT,
  days          INTEGER,
  owed_eur      REAL,               -- начислено: days/30 × €20
  issued        TEXT,               -- YYYY-MM-DD (дата выдачи; по ней попадает в месяц отчёта)
  expiry        TEXT,               -- YYYY-MM-DD
  revoked       INTEGER DEFAULT 0,
  revoked_at    TEXT,
  created_at    INTEGER,
  updated_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_grants_spec   ON grants(specialist_id);
CREATE INDEX IF NOT EXISTS idx_grants_issued ON grants(issued);

-- ── ЖУРНАЛ ОПЛАТ (что специалист реально заплатил) ───────────
-- Вносит ВЛАДЕЛЕЦ вручную. Платёжной интеграции для специалистов нет и не планируется
-- (канон: доверие + счёт, деньги приходят на карту вне платформы).
CREATE TABLE IF NOT EXISTS payments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  specialist_id INTEGER,
  amount_eur    REAL,
  kind          TEXT,               -- 'software' (€20/мес за клиента) | 'platform' (€30/мес за Кабинет)
  period        TEXT,               -- YYYY-MM, за какой месяц платёж
  paid_at       TEXT,               -- YYYY-MM-DD
  note          TEXT,
  created_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_payments_spec ON payments(specialist_id);

-- ── С КАКОГО МЕСЯЦА СПЕЦИАЛИСТ НА ПЛАТФОРМЕ ──────────────────
-- Абонплата €30/мес начисляется с этой даты. Раньше в базе был только
-- `access_paid_until` (до какого числа оплачено) — то есть «сколько всего должен»
-- посчитать было не от чего.
ALTER TABLE specialists ADD COLUMN platform_since TEXT;

-- Уже заведённым специалистам — с даты создания (created_at в мс), владельцу не начисляем.
UPDATE specialists
   SET platform_since = COALESCE(platform_since, date(created_at/1000, 'unixepoch'))
 WHERE platform_since IS NULL AND role <> 'owner' AND created_at IS NOT NULL;

-- ── БЭКФИЛЛ ЖУРНАЛА ИЗ КАРТОЧЕК ──────────────────────────────
-- Прошлые выдачи в KV частью уже истекли, но дубль сохранялся в карточке клиента
-- (`clients.data.expert_grant` — код, дни, сумма, дата, срок) — оттуда и восстанавливаем.
INSERT OR IGNORE INTO grants (code, card_code, specialist_id, plan, days, owed_eur, issued, expiry, revoked, created_at, updated_at)
SELECT json_extract(data,'$.expert_grant.code'),
       code,
       specialist_id,
       NULL,
       json_extract(data,'$.expert_grant.days'),
       COALESCE(json_extract(data,'$.expert_grant.owed'), 0),
       json_extract(data,'$.expert_grant.issued'),
       json_extract(data,'$.expert_grant.expiry'),
       CASE WHEN json_extract(data,'$.expert_grant.revoked') IN (1,'true') THEN 1 ELSE 0 END,
       COALESCE(created_at, 0),
       COALESCE(updated_at, 0)
  FROM clients
 WHERE json_extract(data,'$.expert_grant.code') IS NOT NULL;

-- ── ПРОВЕРОЧНЫЕ ЗАПРОСЫ ──────────────────────────────────────
--   SELECT COUNT(*) FROM grants;
--   SELECT specialist_id, COUNT(*) n, ROUND(SUM(owed_eur),2) owed FROM grants GROUP BY specialist_id;
