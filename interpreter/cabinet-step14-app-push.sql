-- Пуш клиенту в приложение VIA-L об ответе специалиста (2026-09-27, docs/CABINET-PUSH-MOBILE-PLAN.md §3).
-- Токен устройства (APNs на iOS; позже FCM на Android) привязан к коду карточки клиента — той же, что у
-- переписки. Приложение шлёт токен в /push/app-register после подключения к наставнику; сервер шлёт пуш
-- при /cabinet/chat-send. env — production | sandbox: сборки из Xcode напрямую получают токены песочницы.
CREATE TABLE IF NOT EXISTS app_push (
  token    TEXT PRIMARY KEY,
  code     TEXT NOT NULL,
  platform TEXT NOT NULL,           -- ios | android
  env      TEXT DEFAULT 'production',
  lang     TEXT,
  created  INTEGER,
  fails    INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS app_push_code ON app_push(code);
