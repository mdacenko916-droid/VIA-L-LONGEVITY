#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# sync-web.sh — собирает app/www из веб-ИП для ИЗОЛИРОВАННОГО приложения (вариант 1).
#
# Зачем: приложение больше НЕ грузит контент с via-l.com (убрали server.url из
# capacitor.config.json). Вместо этого веб-ассеты зашиты локально в app/www.
# Store-ревьюер не видит домен; ИИ-анализ по-прежнему идёт по сети в воркер.
#
# КОГДА запускать: перед КАЖДОЙ сборкой приложения, ПОСЛЕ того как веб-правки готовы
# и запушены. Затем: `npx cap sync` → сборка в Xcode / Android Studio.
#
# Точка входа приложения = interpreter-pro.html (у неё нативные health-бриджи).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IP="$ROOT/interpreter"
WWW="$ROOT/app/www"

echo "→ Пересобираю $WWW из веб-ИП…"
rm -rf "$WWW"
mkdir -p "$WWW"

# Точка входа: PRO-страница → index.html (Capacitor грузит webDir/index.html)
cp "$IP/interpreter-pro.html" "$WWW/index.html"

# Скрипты и вспомогательные страницы
cp "$IP/app-mode.js"              "$WWW/"
cp "$IP/healthkit-bridge.js"      "$WWW/"
cp "$IP/healthconnect-bridge.js"  "$WWW/"
cp "$IP/my-specialist.html"       "$WWW/"

# Ассеты (Logo/ включает Logo/metrics/*.png, images-in/ — картинки устройств)
cp -R "$IP/Logo"       "$WWW/Logo"
cp -R "$IP/images-in"  "$WWW/images-in"

# Юр-страницы: в вебе лежат в ../legal → в изолированном бандле кладём в www/legal
cp -R "$ROOT/legal"    "$WWW/legal"

# Переписать пути ../legal/ → legal/ (в бандле нет родительской папки)
sed -i '' 's#\.\./legal/#legal/#g' "$WWW/index.html"

echo "✓ Готово. Размер www: $(du -sh "$WWW" | cut -f1)"
echo "  Дальше: cd app && npx cap sync && открыть в Xcode / Android Studio."
