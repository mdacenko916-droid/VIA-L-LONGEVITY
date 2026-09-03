#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# make-keystore.sh — создаёт ключ подписи Android и файл app/keystore.properties.
#
# Зачем: Play принимает только подписанный AAB. Ключ и пароли НЕ хранятся в репозитории
# (см. app/.gitignore) — Gradle читает их из keystore.properties, который создаёт этот скрипт.
#
# Ключ действует 30 лет (Play требует срок до 2033+ как минимум) и НЕ подлежит замене:
# сменить ключ у опубликованного приложения нельзя. Единственная страховка — Play App Signing,
# его надо принять при создании приложения в консоли (Google хранит копию у себя).
#
# ⚠️ После запуска: сделайте резервную копию app/vial-release.jks и пароля в надёжном месте
# (менеджер паролей + внешний диск). Потеря ключа без Play App Signing = потеря приложения.
#
# Запуск:  cd app && ./scripts/make-keystore.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
KS="$APP_DIR/vial-release.jks"
PROPS="$APP_DIR/keystore.properties"
ALIAS="vial"

KEYTOOL="$(command -v keytool || true)"
if [ -z "$KEYTOOL" ]; then
  JH="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  [ -x "$JH/bin/keytool" ] && KEYTOOL="$JH/bin/keytool"
fi
[ -n "$KEYTOOL" ] || { echo "✗ keytool не найден (нужен JDK или Android Studio)"; exit 1; }

if [ -f "$KS" ]; then
  echo "✗ $KS уже существует. Если это рабочий ключ — не пересоздавайте его."
  exit 1
fi

echo "Придумайте пароль хранилища (минимум 6 символов). Он будет запрошен дважды."
echo "ЗАПИШИТЕ его — восстановить нельзя."
echo

"$KEYTOOL" -genkeypair -v \
  -keystore "$KS" \
  -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 \
  -validity 10950 \
  -dname "CN=VIA-L, OU=VIA-L, O=Kyrylo Selivanov, L=, ST=, C=ES"

# Пароль ключа = пароль хранилища (keytool при -genkeypair так и делает, если не задавать иной).
printf 'Повторите тот же пароль для записи в keystore.properties: '
read -rs PW
echo

umask 077
cat > "$PROPS" <<CONF
storeFile=$KS
storePassword=$PW
keyAlias=$ALIAS
keyPassword=$PW
CONF

echo "✓ Ключ:  $KS"
echo "✓ Пароли: $PROPS (в .gitignore, права 600)"
echo
echo "Отпечаток ключа (пригодится для настроек Google):"
"$KEYTOOL" -list -v -keystore "$KS" -alias "$ALIAS" -storepass "$PW" 2>/dev/null | grep -E "SHA1|SHA-256" | sed 's/^/  /'
echo
echo "⚠️  Сделайте резервную копию .jks и пароля ПРЯМО СЕЙЧАС."
