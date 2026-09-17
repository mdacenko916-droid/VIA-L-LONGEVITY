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

# Node — готовым архивом с nodejs.org, НЕ через brew. 2026-09-17: образ Xcode 26.6 оказался на Intel,
# а Homebrew с сентября 2026 не выпускает для Intel готовых пакетов и собирает node из исходников —
# сборка падала в ci_post_clone на «C compiler cannot create executables».
export HOMEBREW_NO_AUTO_UPDATE=1
if ! command -v node >/dev/null 2>&1; then
  NODE_V=v22.12.0
  case "$(uname -m)" in arm64) NODE_ARCH=arm64 ;; *) NODE_ARCH=x64 ;; esac
  echo "→ Ставлю node $NODE_V ($NODE_ARCH) с nodejs.org…"
  curl -fsSL "https://nodejs.org/dist/$NODE_V/node-$NODE_V-darwin-$NODE_ARCH.tar.gz" | tar -xz -C "${TMPDIR:-/tmp}"
  export PATH="${TMPDIR:-/tmp}/node-$NODE_V-darwin-$NODE_ARCH/bin:$PATH"
fi
node -v

# CocoaPods — через системный Ruby (gem), а не brew, по той же причине.
if ! command -v pod >/dev/null 2>&1; then
  echo "→ Ставлю cocoapods через gem…"
  gem install cocoapods -v 1.16.2 --user-install --no-document
  export PATH="$(ruby -e 'print Gem.user_dir')/bin:$PATH"
fi
pod --version

cd "$ROOT/app"

# --legacy-peer-deps обязателен: @perfood/capacitor-healthkit объявляет peer на
# Capacitor 5, а у нас 6 — без флага npm обрывается на конфликте зависимостей.
#
# ⚠️ Именно `npm ci`, а НЕ `npm install`. С `npm install` и кареткой в package.json
# облако ставило свежую версию плагина RevenueCat (11.3.2), а закоммиченный Podfile.lock
# был собран под другую — и `pod install` падал на несовместимости PurchasesHybridCommon.
# Каждая сборка Xcode Cloud валилась на ci_post_clone.sh, и это было незаметно: локально
# всё собиралось, потому что в node_modules лежала правильная версия. `npm ci` ставит
# РОВНО то, что записано в package-lock.json, поэтому облако и машина больше не расходятся.
# 2026-09-09.
echo "→ npm ci…"
npm ci --legacy-peer-deps

# Собирает app/www из веб-ИП (interpreter/interpreter-via-l.html + ассеты + legal-app).
echo "→ sync-web.sh…"
./sync-web.sh

# Копирует www в ios/App/App/public, генерит capacitor.config.json и зовёт pod install.
echo "→ cap sync ios…"
npx cap sync ios

echo "✓ Окружение готово."
