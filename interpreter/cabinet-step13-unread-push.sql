-- Непрочитанные и пуш специалисту (2026-09-25, docs/CABINET-PUSH-MOBILE-PLAN.md).
-- Клиент из приложения пишет — специалист не узнавал: пинг шёл только в Telegram-топик,
-- а у клиентов приложения топика нет. Почту владелец отклонил (спам при многих клиентах).
--
-- unread: +1 на каждое сообщение клиента (handleExpertMessage), 0 — специалист открыл переписку
-- (/cabinet/chat-read). Отдельная колонка, а не счёт по data.messages: список клиентов читает
-- лёгкие колонки (CABINET_LIST_COLS), тяжёлый data там не разбирается.
ALTER TABLE clients ADD COLUMN unread INTEGER DEFAULT 0;

-- Подписки веб-пуша специалиста (кабинет в браузере или на экране «Домой»). Пуш без тела, как у
-- EXPERT; надпись service worker берёт по секрету peek (/cabinet/push-peek) — имя клиента и вид
-- сообщения, ничего о здоровье. Отдельно от push_subs: там подписки клиентов EXPERT по часам.
CREATE TABLE IF NOT EXISTS spec_push (
  endpoint TEXT PRIMARY KEY,
  spec_id  INTEGER NOT NULL,
  peek     TEXT NOT NULL,
  lang     TEXT,
  created  INTEGER,
  fails    INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS spec_push_spec ON spec_push(spec_id);
