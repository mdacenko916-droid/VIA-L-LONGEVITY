#!/usr/bin/env node
/**
 * setup-ios.js — восстанавливает HealthKit-настройки в нативном iOS-проекте.
 *
 * Зачем: папка `ios/` в .gitignore и генерится локально (`cap add ios`). При каждом
 * пересоздании Capacitor пишет чистые Info.plist / App.entitlements — БЕЗ наших ключей,
 * и HealthKit/Oura перестаёт работать (нет описаний доступа → iOS не даёт авторизацию).
 * Этот скрипт идемпотентно дописывает недостающее. Запускать после `cap add ios`
 * (подключён к npm-скрипту `add:ios`) или вручную: `npm run setup:ios`.
 *
 * Чистый Node, без зависимостей — простая вставка в XML-plist перед закрывающим </dict>.
 */
const fs = require('fs');
const path = require('path');

const APP_DIR = path.resolve(__dirname, '..');
const INFO_PLIST = path.join(APP_DIR, 'ios', 'App', 'App', 'Info.plist');
const ENTITLEMENTS = path.join(APP_DIR, 'ios', 'App', 'App', 'App.entitlements');

const HEALTH_USAGE =
  'VIA·L читает показатели здоровья (HRV, пульс покоя, сон, VO2 max), чтобы дать ' +
  'нутрициологическую интерпретацию. Данные не покидают ваше устройство без вашего согласия.';

// Блоки, которые должны присутствовать в <dict>…</dict>. Ключ → готовый XML.
const INFO_KEYS = {
  NSHealthShareUsageDescription: `\t<key>NSHealthShareUsageDescription</key>\n\t<string>${HEALTH_USAGE}</string>`,
  NSHealthUpdateUsageDescription: `\t<key>NSHealthUpdateUsageDescription</key>\n\t<string>${HEALTH_USAGE}</string>`,
};
const ENTITLEMENT_KEYS = {
  'com.apple.developer.healthkit': `\t<key>com.apple.developer.healthkit</key>\n\t<true/>`,
};

/** Вставляет недостающие блоки перед последним </dict>. Возвращает [новыйТекст, добавленныеКлючи]. */
function ensureKeys(xml, keys) {
  const added = [];
  let insert = '';
  for (const [key, block] of Object.entries(keys)) {
    if (xml.includes(`<key>${key}</key>`)) continue;
    insert += block + '\n';
    added.push(key);
  }
  if (!insert) return [xml, added];
  const idx = xml.lastIndexOf('</dict>');
  if (idx === -1) throw new Error('Не найден закрывающий </dict> — неожиданный формат plist');
  const next = xml.slice(0, idx) + insert + xml.slice(idx);
  return [next, added];
}

// Privacy manifest (Apple требует с весны 2024). Два содержательных блока:
// NSPrivacyAccessedAPITypes — «required reason API»: приложение читает и пишет UserDefaults
// (Capacitor/WebView хранят там состояние), причина CA92.1 — доступ только к собственным данным;
// NSPrivacyCollectedDataTypes — что мы собираем. У VIA-L данные о здоровье НЕ уходят с устройства,
// поэтому здесь пусто: манифест описывает сбор разработчиком, а его нет. Если появится синк
// («Помочь улучшить приложение») — сюда добавляется NSPrivacyCollectedDataTypeHealth.
const PRIVACY_MANIFEST = path.join(APP_DIR, 'ios', 'App', 'App', 'PrivacyInfo.xcprivacy');
const PRIVACY_XML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>NSPrivacyTracking</key>
\t<false/>
\t<key>NSPrivacyTrackingDomains</key>
\t<array/>
\t<key>NSPrivacyCollectedDataTypes</key>
\t<array/>
\t<key>NSPrivacyAccessedAPITypes</key>
\t<array>
\t\t<dict>
\t\t\t<key>NSPrivacyAccessedAPIType</key>
\t\t\t<string>NSPrivacyAccessedAPICategoryUserDefaults</string>
\t\t\t<key>NSPrivacyAccessedAPITypeReasons</key>
\t\t\t<array>
\t\t\t\t<string>CA92.1</string>
\t\t\t</array>
\t\t</dict>
\t</array>
</dict>
</plist>
`;

function ensurePrivacyManifest() {
  if (fs.existsSync(PRIVACY_MANIFEST)) { console.log('✓ PrivacyInfo.xcprivacy: на месте.'); return; }
  if (!fs.existsSync(path.dirname(PRIVACY_MANIFEST))) {
    console.warn('⚠️  Нет папки ios/App/App — сначала `npx cap add ios`.');
    return;
  }
  fs.writeFileSync(PRIVACY_MANIFEST, PRIVACY_XML);
  console.log('✚ PrivacyInfo.xcprivacy: создан. ВАЖНО: добавить файл в таргет App в Xcode ' +
    '(перетащить в проект, галочка Target Membership) — сам по себе он в бандл не попадёт.');
}

function patchFile(file, keys, label) {
  if (!fs.existsSync(file)) {
    console.warn(`⚠️  ${label} не найден (${path.relative(APP_DIR, file)}). ` +
      `Сначала выполни \`npx cap add ios\`, затем \`npm run setup:ios\`.`);
    return;
  }
  const xml = fs.readFileSync(file, 'utf8');
  const [next, added] = ensureKeys(xml, keys);
  if (added.length === 0) {
    console.log(`✓ ${label}: всё на месте.`);
    return;
  }
  fs.writeFileSync(file, next);
  console.log(`✚ ${label}: добавлено ${added.length} — ${added.join(', ')}`);
}

console.log('— setup-ios: HealthKit + privacy manifest —');
patchFile(INFO_PLIST, INFO_KEYS, 'Info.plist');
patchFile(ENTITLEMENTS, ENTITLEMENT_KEYS, 'App.entitlements');
ensurePrivacyManifest();
console.log('Готово. Дальше: `LANG=en_US.UTF-8 npx cap sync ios`.');
