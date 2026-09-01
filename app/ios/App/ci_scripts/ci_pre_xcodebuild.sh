#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Xcode Cloud — уникальный номер сборки перед архивацией.
#
# Зачем: в проекте номер сборки зашит намертво (CURRENT_PROJECT_VERSION = 1), то
# есть КАЖДЫЙ архив выходит как 1.0 (1). App Store Connect принимает такой номер
# ровно один раз: первый билд уходит в TestFlight, а все следующие падают на шаге
# «Prepare Build for App Store Connect» — компиляция при этом успешна, отклоняется
# именно загрузка дубликата. Поймано на Build 18, 2026-09-01.
#
# Решение: подставляем номер сборки Xcode Cloud ($CI_BUILD_NUMBER). Он уникален и
# монотонно растёт, поэтому дубликатов больше не будет. Версию для магазина
# (MARKETING_VERSION, «1.0») не трогаем — её меняем руками, когда выпускаем
# новую версию продукта.
#
# Файл обязан лежать рядом с App.xcworkspace в ci_scripts/ и быть исполняемым.
# ─────────────────────────────────────────────────────────────────────────────
set -e

PBX="$CI_PRIMARY_REPOSITORY_PATH/app/ios/App/App.xcodeproj/project.pbxproj"

if [ -z "$CI_BUILD_NUMBER" ]; then
  echo "→ CI_BUILD_NUMBER пуст (запуск вне Xcode Cloud) — номер сборки не меняю."
  exit 0
fi

if [ ! -f "$PBX" ]; then
  echo "✗ Не найден $PBX"
  exit 1
fi

# Правим обе конфигурации (Debug и Release) одной заменой.
sed -i '' "s/CURRENT_PROJECT_VERSION = .*/CURRENT_PROJECT_VERSION = $CI_BUILD_NUMBER;/g" "$PBX"

echo "✓ Номер сборки: $CI_BUILD_NUMBER"
grep -m2 "CURRENT_PROJECT_VERSION" "$PBX"
