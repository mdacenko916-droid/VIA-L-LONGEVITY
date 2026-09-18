-- «Мои приёмы» в VIA-L EXPERT (2026-09-18): напоминания о приёме добавок и препаратов.
-- PWA не умеет будить себя сама, поэтому будит ежечасный cron воркера (runPushIntake).
-- Одна строка = одно время приёма одной подписки. Названий препаратов здесь НЕТ и не будет:
-- сервер знает только час, до какой даты и куда слать. Пуш уходит пустым, надпись собирает
-- service worker на устройстве (см. sw-expert.js).
-- Применить: wrangler d1 execute vial-cabinet --remote --file=push-intake-schema.sql
CREATE TABLE IF NOT EXISTS push_intake (
  endpoint   TEXT    NOT NULL,
  hour_utc   INTEGER NOT NULL,   -- час UTC, в который наступает местное время приёма
  until_day  TEXT,               -- последний день курса (местная дата), NULL — бессрочно
  last_sent  TEXT,               -- дата UTC последней отправки — защита от дубля в тот же час
  fails      INTEGER DEFAULT 0,
  PRIMARY KEY (endpoint, hour_utc)
);
CREATE INDEX IF NOT EXISTS idx_push_intake_hour ON push_intake(hour_utc);
