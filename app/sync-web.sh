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
# Точка входа приложения = interpreter-via-l.html (renamed 2026-07-16 из interpreter-pro.html;
# у неё нативные health-бриджи). Старая redirect-заглушка interpreter-pro.html удалена 2026-07-21.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IP="$ROOT/interpreter"
WWW="$ROOT/app/www"

echo "→ Пересобираю $WWW из веб-ИП…"
rm -rf "$WWW"
mkdir -p "$WWW"

# Точка входа: VIA·L-страница → index.html (Capacitor грузит webDir/index.html)
cp "$IP/interpreter-via-l.html" "$WWW/index.html"

# Скрипты и вспомогательные страницы
cp "$IP/app-mode.js"              "$WWW/"
cp "$IP/healthkit-bridge.js"      "$WWW/"
cp "$IP/healthconnect-bridge.js"  "$WWW/"
cp "$IP/iap-bridge.js"            "$WWW/"
cp "$IP/my-specialist.html"       "$WWW/"
cp "$IP/research-consent.html"    "$WWW/"

# Ассеты (Logo/ включает Logo/metrics/*.png, images-in/ — картинки устройств,
# phosphor/ — иконочный шрифт + vio-phosphor.js (иконки ВЕЗДЕ), icons/ — прочие иконки,
# food/ — webp-фото тарелок для памятки дня)
cp -R "$IP/Logo"       "$WWW/Logo"
cp -R "$IP/images-in"  "$WWW/images-in"
cp -R "$IP/phosphor"   "$WWW/phosphor"
cp -R "$IP/icons"      "$WWW/icons"
cp -R "$IP/food"       "$WWW/food"

# Юр-страницы приложения: чистый app-only комплект legal-app/ (Privacy+Terms, 12 языков,
# без мед-бизнеса/медсайта/«Interpreter») → в бандл как www/legal. Старые legal/ — для сайта.
cp -R "$ROOT/legal-app" "$WWW/legal"

# Переписать пути ../legal/ и ../legal-app/ → legal/ (в бандле нет родительской папки;
# папка скопирована выше как legal-app→legal, поэтому оба варианта ссылок нужно унифицировать)
sed -i '' -e 's#\.\./legal/#legal/#g' -e 's#\.\./legal-app/#legal/#g' "$WWW/index.html"

# Точка входа в бандле называется index.html, а подстраницы ссылаются на веб-имя
# interpreter-via-l.html («назад» и «Открыть приложение →»). Такого файла в бандле нет —
# без подмены обе ссылки ведут на пустой экран.
sed -i '' -e 's#interpreter-via-l\.html#index.html#g' "$WWW/my-specialist.html" "$WWW/research-consent.html"

echo "✓ Готово. Размер www: $(du -sh "$WWW" | cut -f1)"
echo "  Дальше: cd app && npx cap sync && открыть в Xcode / Android Studio."
