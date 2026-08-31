#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Xcode Cloud — подготовка окружения перед сборкой.
#
# Зачем: репозиторий не хранит ни node_modules, ни app/www, ни Pods — всё это
# генерится. Xcode Cloud клонирует чистый репозиторий, поэтому собрать нужно
# здесь, до того как он вызовет xcodebuild.
#
# Почему вообще Xcode Cloud: Apple требует сборку с iOS 26 SDK (Xcode 26+), а он
# не ставится на MacBook Air 2018 (потолок — macOS Sonoma). Локально архив
# собирается, но валидация в App Store Connect отклоняет его по версии SDK.
#
# Файл обязан лежать рядом с App.xcworkspace и быть исполняемым (chmod +x).
# ─────────────────────────────────────────────────────────────────────────────
set -e

# CocoaPods падает с Encoding::CompatibilityError, если локаль не UTF-8.
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

ROOT="$CI_PRIMARY_REPOSITORY_PATH"
echo "→ Репозиторий: $ROOT"

command -v node >/dev/null 2>&1 || { echo "→ Ставлю node…"; brew install node; }
command -v pod  >/dev/null 2>&1 || { echo "→ Ставлю cocoapods…"; brew install cocoapods; }

cd "$ROOT/app"

# --legacy-peer-deps обязателен: @perfood/capacitor-healthkit объявляет peer на
# Capacitor 5, а у нас 6 — без флага npm обрывается на конфликте зависимостей.
echo "→ npm install…"
npm install --legacy-peer-deps

# Собирает app/www из веб-ИП (interpreter/interpreter-via-l.html + ассеты + legal-app).
echo "→ sync-web.sh…"
./sync-web.sh

# Копирует www в ios/App/App/public, генерит capacitor.config.json и зовёт pod install.
echo "→ cap sync ios…"
npx cap sync ios

echo "✓ Окружение готово."
