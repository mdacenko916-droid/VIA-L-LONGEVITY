-- ─────────────────────────────────────────────────────────────
-- VIA·L — УЧЁТ РАСХОДА ТОКЕНОВ.
--
-- Зачем: API в каждом ответе возвращает фактический расход, а мы его выбрасывали.
-- Без него экономика тарифа обсуждается на оценках («примерно €0.10 за разбор»),
-- а оптимизация делается вслепую — непонятно, кто съедает бюджет: дневной разбор,
-- памятка дня, недельный или чат.
--
-- Приватность: строка НЕ содержит ни кода доступа, ни идентификатора клиента, ни
-- текстов. Только: когда, какой маршрут, какая модель, тариф, язык и сколько токенов.
--
-- Применение (ОДИН раз, на боевой БД):
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=ai-usage-schema.sql
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_usage (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ts        INTEGER,        -- Date.now()
  endpoint  TEXT,           -- analyze | day-plan | weekly-report | ai-memory | guardrail | expert-chat
  model     TEXT,
  tier      TEXT,           -- pro (VIA-L) | elite/expert (VIA-L EXPERT) | ''
  lang      TEXT,
  in_tok    INTEGER,        -- обычный вход (не кэш)
  out_tok   INTEGER,
  cache_w   INTEGER,        -- запись в кэш (дороже обычного входа на 25%)
  cache_r   INTEGER,        -- чтение из кэша (в 10 раз дешевле входа)
  cost_usd  REAL            -- посчитано по прайсу на момент вызова
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_ts ON ai_usage(ts);

-- ── ГОТОВЫЕ ЗАПРОСЫ (wrangler d1 execute vial-cabinet --remote --command="…") ──
--
-- Сколько и на что потрачено за 7 дней, по маршрутам:
--   SELECT endpoint, COUNT(*) n, ROUND(SUM(cost_usd),3) usd,
--          ROUND(AVG(cost_usd),4) avg_call, SUM(cache_w) cw, SUM(cache_r) cr
--   FROM ai_usage WHERE ts > (strftime('%s','now')-7*86400)*1000
--   GROUP BY endpoint ORDER BY usd DESC;
--
-- Работает ли кэш вообще (если cache_r почти ноль — платим надбавку за запись
-- и ни разу не получаем скидку, ради которой она платится):
--   SELECT SUM(cache_w) written, SUM(cache_r) read FROM ai_usage;
--
-- Расход по тарифам за 30 дней (сравнить с выручкой на клиента):
--   SELECT tier, COUNT(*) n, ROUND(SUM(cost_usd),2) usd FROM ai_usage
--   WHERE ts > (strftime('%s','now')-30*86400)*1000 GROUP BY tier;
