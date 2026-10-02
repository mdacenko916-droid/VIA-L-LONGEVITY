-- ─────────────────────────────────────────────────────────────
-- VIA·L — Кабинет, ШАГ 15: РАЗОВЫЙ РАЗБОР СО СПЕЦИАЛИСТОМ (2026-10-02,
-- docs/SPECIALIST-REVIEW-PLAN.md).
--
-- Зачем. Клиент приложения VIA-L без своего специалиста покупает письменный разбор
-- разовой встроенной покупкой (App Store / Google Play, через RevenueCat). Покупка
-- подключает его к дежурному специалисту; в кабинете карточка получает пометку
-- «Разовый разбор — оплачен».
--
-- Почему отдельная таблица, а не только поле в карточке. Одна покупка = один разбор.
-- Без журнала с UNIQUE по номеру транзакции тот же чек можно предъявить дважды и
-- получить второй разбор бесплатно — а это время живого человека. Состояние заказа
-- для экрана дублируется в `clients.data.review` (кабинет читает его без JOIN).
--
-- Применение (ОДИН раз, на боевой БД):
--   cd interpreter && wrangler d1 execute vial-cabinet --remote --file=cabinet-step15-review-orders.sql
--
-- АДДИТИВНО: одна новая таблица. Готовое не ломается.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tx_id         TEXT NOT NULL UNIQUE,   -- номер транзакции RevenueCat: один чек — один разбор
  rc_user       TEXT NOT NULL,          -- анонимный идентификатор покупателя в RevenueCat
  store         TEXT,                   -- app_store | play_store
  sandbox       INTEGER DEFAULT 0,      -- 1 = тестовая покупка (TestFlight, ревью стора) — в деньги не считать
  card_code     TEXT NOT NULL,          -- карточка клиента в кабинете
  specialist_id INTEGER,                -- кому ушёл разбор
  status        TEXT DEFAULT 'open',    -- open | answered | overdue (не ответили и после продления)
  created_at    INTEGER,                -- когда покупка предъявлена
  due_at        TEXT,                   -- ISO-время, срок ответа (48 часов с покупки)
  closes_at     TEXT,                   -- YYYY-MM-DD, до какого дня клиент задаёт уточняющие вопросы (7 дней от выдачи)
  answered_at   INTEGER,
  extended      INTEGER DEFAULT 0,      -- 1 = срок уже продлевался на 48 часов (продление одно)
  push_at       INTEGER,                -- когда специалисту ушёл последний пуш по заказу
  push_kind     TEXT                    -- review | review_late | review_overdue — что написать в уведомлении
);
CREATE INDEX IF NOT EXISTS idx_review_card ON review_orders(card_code);
CREATE INDEX IF NOT EXISTS idx_review_user ON review_orders(rc_user);

-- ── ПРОВЕРОЧНЫЕ ЗАПРОСЫ ──────────────────────────────────────
-- Открытые разборы (кому и до какого дня отвечать):
--   SELECT card_code, specialist_id, due_at, sandbox FROM review_orders WHERE status='open' ORDER BY due_at;
-- Продажи без тестовых:
--   SELECT count(*) FROM review_orders WHERE sandbox=0;
