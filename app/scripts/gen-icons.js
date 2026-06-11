#!/usr/bin/env node
/**
 * gen-icons.js — генерирует иконку приложения из app/assets/icon-source.png.
 *
 * ios/ и android/ в .gitignore (генерятся локально) → иконки теряются при пересоздании.
 * Поэтому МАСТЕР держим в app/assets/ (закоммичен) и регенерим: `npm run icons`.
 * Требует sharp (devDependency). Источник лучше 1024×1024+ (иначе апскейл будет мягким).
 *
 * iOS AppIcon у Capacitor 6 — единый файл 1024×1024 (AppIcon-512@2x.png). Иконка iOS
 * должна быть БЕЗ прозрачности → флэттим на чёрный фон (углы всё равно скругляет сама iOS).
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const APP = path.resolve(__dirname, '..');
const SRC = path.join(APP, 'assets', 'icon-source.png');
const PREVIEW = path.join(APP, 'assets', 'icon-1024.png');
const IOS_ICON = path.join(APP, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
const BG = { r: 0, g: 0, b: 0 }; // фон под прозрачными углами эмблемы

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error('Нет ' + path.relative(APP, SRC) + ' — положи мастер-иконку (1024×1024 PNG).');
    process.exit(1);
  }
  const meta = await sharp(SRC).metadata();
  if (meta.width < 1024 || meta.height < 1024) {
    console.warn(`⚠️  Источник ${meta.width}×${meta.height} < 1024 — иконка будет мягкой. ` +
      `Замени app/assets/icon-source.png на 1024×1024 (лучше 2048) и перезапусти.`);
  }
  const buf = await sharp(SRC)
    .resize(1024, 1024, { fit: 'cover', kernel: 'lanczos3' })
    .flatten({ background: BG })
    .png()
    .toBuffer();

  fs.writeFileSync(PREVIEW, buf);
  console.log('✓ app/assets/icon-1024.png (опаковый мастер 1024×1024)');

  if (fs.existsSync(path.dirname(IOS_ICON))) {
    fs.writeFileSync(IOS_ICON, buf);
    console.log('✓ iOS AppIcon обновлён (' + path.relative(APP, IOS_ICON) + ')');
  } else {
    console.warn('iOS не сгенерирован — нет ios/. Сначала `npm run add:ios`, потом `npm run icons`.');
  }
  console.log('Готово.');
}
main().catch(e => { console.error('Ошибка:', e.message); process.exit(1); });
