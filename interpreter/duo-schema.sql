-- «Вдвоём» (2026-10-15): D1, а не KV — KV кэширует чтение до 60 с, и пара «распадалась» на устаревшей записи.
CREATE TABLE IF NOT EXISTS duo_m (
  id    TEXT PRIMARY KEY,      -- случайный секрет устройства (партнёр его не знает)
  name  TEXT NOT NULL DEFAULT '',
  peer  TEXT,                  -- id партнёра или NULL
  lever TEXT,                  -- ключ шага недели (levers.js)
  day   INTEGER NOT NULL DEFAULT 0,
  marks TEXT NOT NULL DEFAULT '[]',
  upd   INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS duo_inv (
  code TEXT PRIMARY KEY,       -- 6 знаков, одноразовый, 7 дней
  a    TEXT NOT NULL,
  ts   INTEGER NOT NULL
);
