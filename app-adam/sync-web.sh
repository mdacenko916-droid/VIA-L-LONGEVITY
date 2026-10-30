#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# sync-web.sh — собирает app-adam/www (бандл ADAM-L) из веб-ИП. Образец — app/sync-web.sh (VIA-L).
#
# ADAM-L = interpreter/adam-l.html (копия VIA-L с мужскими правками) + те же общие модули.
# Общие модули в interpreter/ НЕ правим (они живут в VIA-L): всё, что отличается у ADAM-L,
# делается здесь, только в копиях внутри www:
#   • имя «VIA·L / VIA-L» → «ADAM-L» в текстах модулей и вспомогательных страниц (в т.ч. тексты
#     нативных уведомлений — их перекрасчик на странице не видит);
#   • ключи RevenueCat — свои у ADAM-L (app-adam/iap-keys.json, см. ниже).
# Запускать перед каждой сборкой, после того как веб-правки готовы и запушены.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IP="$ROOT/interpreter"
WWW="$ROOT/app-adam/www"

echo "→ Пересобираю $WWW из веб-ИП…"
rm -rf "$WWW"
mkdir -p "$WWW"

# Точка входа: страница ADAM-L → index.html
cp "$IP/adam-l.html" "$WWW/index.html"

# Скрипты и вспомогательные страницы — тот же набор, что у VIA-L (app/sync-web.sh)
for f in app-mode.js healthkit-bridge.js healthconnect-bridge.js iap-bridge.js device-id.js notify-bridge.js \
         push-bridge.js tts-bridge.js review-bridge.js intake.js help.js bottom-nav.js levers.js duo.js sports.js \
         workouts.js move-player.js courses.js complaint-table.js articles.js library.js evidence.js \
         evidence-registry.json my-specialist.html specialist.js research-consent.html science.html; do
  cp "$IP/$f" "$WWW/"
done
cp -R "$IP/clips" "$WWW/clips"

# Перенаправители: подстраницы ссылаются на веб-имена инструмента
for name in interpreter-via-l.html adam-l.html; do
  cat > "$WWW/$name" <<'REDIRECT'
<!doctype html><meta charset="utf-8"><title>ADAM-L</title>
<script>location.replace('./index.html' + location.search + location.hash);</script>
REDIRECT
done

# Ассеты
for d in Logo images-in phosphor icons food art; do cp -R "$IP/$d" "$WWW/$d"; done

# Юр-страницы ADAM-L (legal-adam/ ×12, 2026-10-30: копия legal-app с именем ADAM-L и пакетом com.viael.adaml).
cp -R "$ROOT/legal-adam" "$WWW/legal"
sed -i '' -e 's#\.\./legal/#legal/#g' -e 's#\.\./legal-app/#legal/#g' -e 's#\.\./legal-adam/#legal/#g' "$WWW/index.html"
sed -i '' -e 's#href="\.\./index\.html"#href="../index.html?tab=card" onclick="if(history.length>1){history.back();return false;}"#g' "$WWW"/legal/*.html
sed -i '' -e 's#interpreter-via-l\.html#index.html#g' "$WWW/my-specialist.html" "$WWW/research-consent.html"

# Имя приложения в копиях модулей и подстраниц (index.html уже переименован в исходнике)
for f in "$WWW"/*.js "$WWW"/my-specialist.html "$WWW"/research-consent.html "$WWW"/science.html "$WWW"/legal/*.html; do
  sed -i '' -E 's/VIA[·‑-]L EXPERT/ADAM-L/g; s/VIA[·‑-]L/ADAM-L/g' "$f"
done

# Ключи RevenueCat ADAM-L: app-adam/iap-keys.json вида {"ios":"appl_…","android":"goog_…"}.
# Нет файла → ключи обнуляются: покупка не работает, но и не уходит в проект VIA-L.
KEYS="$ROOT/app-adam/iap-keys.json"
if [ -f "$KEYS" ]; then
  IOSK=$(python3 -c "import json;print(json.load(open('$KEYS'))['ios'])")
  ANDK=$(python3 -c "import json;print(json.load(open('$KEYS'))['android'])")
else
  echo "⚠️  Нет app-adam/iap-keys.json — подписка в сборке выключена (ключи пустые)."
  IOSK=""; ANDK=""
fi
sed -i '' -E "s/android: *'goog_[A-Za-z0-9]+'/android: '$ANDK'/; s/ios: *'appl_[A-Za-z0-9]+'/ios:     '$IOSK'/" "$WWW/iap-bridge.js"
if grep -q -E "goog_BHsIdg|appl_otTgm" "$WWW/iap-bridge.js"; then echo "✗ В бандле остались ключи VIA-L"; exit 1; fi
# Разовый разбор со специалистом у ADAM-L — свой товар в сторе (adam_l_specialist_review). Право доступа
# подписки — общее с VIA-L (via_l_pro): ADAM-L заведён приложениями в ТОМ ЖЕ проекте RevenueCat, иначе
# воркер не увидит покупки (библиотека, /review/claim). Воркер должен принимать оба id разбора — TODO.
sed -i '' "s/var REVIEW_PRODUCT_ID = 'via_l_specialist_review'/var REVIEW_PRODUCT_ID = 'adam_l_specialist_review'/" "$WWW/iap-bridge.js"
grep -q "REVIEW_PRODUCT_ID = 'adam_l_specialist_review'" "$WWW/iap-bridge.js" || { echo "✗ Не подменился id разбора"; exit 1; }

echo "✓ Готово. Размер www: $(du -sh "$WWW" | cut -f1)"
echo "  Дальше: cd app-adam && npx cap sync && открыть в Xcode / Android Studio."
