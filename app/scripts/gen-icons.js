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
const SRC_SVG = path.join(APP, 'assets', 'icon-source.svg');
const SRC_PNG = path.join(APP, 'assets', 'icon-source.png');
const PREVIEW = path.join(APP, 'assets', 'icon-1024.png');
const IOS_ICON = path.join(APP, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
const BG = { r: 0, g: 0, b: 0 }; // чёрный — под космический фон Logo-IP (углы iOS скругляет сама)

async function main() {
  // SVG приоритетнее — вектор рисуется чётко в любом размере (без апскейл-мыла).
  const isSvg = fs.existsSync(SRC_SVG);
  const SRC = isSvg ? SRC_SVG : SRC_PNG;
  if (!fs.existsSync(SRC)) {
    console.error('Нет мастера: положи app/assets/icon-source.svg (вектор, лучше всего) ' +
      'или icon-source.png (1024×1024).');
    process.exit(1);
  }
  if (!isSvg) {
    const meta = await sharp(SRC).metadata();
    if (meta.width < 1024 || meta.height < 1024) {
      console.warn(`⚠️  PNG-источник ${meta.width}×${meta.height} < 1024 — иконка будет мягкой. ` +
        `Дай SVG (app/assets/icon-source.svg) или PNG 1024×1024+.`);
    }
  }
  // density высокий — чтобы вектор растеризовался резко под 1024.
  const buf = await sharp(SRC, isSvg ? { density: 512 } : undefined)
    .resize(1024, 1024, { fit: 'cover', kernel: 'lanczos3' })
    .flatten({ background: BG })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  fs.writeFileSync(PREVIEW, buf);
  console.log('✓ app/assets/icon-1024.png (опаковый мастер 1024×1024)');

  if (fs.existsSync(path.dirname(IOS_ICON))) {
    fs.writeFileSync(IOS_ICON, buf);
    console.log('✓ iOS AppIcon обновлён (' + path.relative(APP, IOS_ICON) + ')');
  } else {
    console.warn('iOS не сгенерирован — нет ios/. Сначала `npm run add:ios`, потом `npm run icons`.');
  }

  // ── Splash (заставка запуска): лого по центру на чёрном, 2732×2732 ──
  const logoOnSplash = await sharp(SRC, isSvg ? { density: 512 } : undefined)
    .resize(1100, 1100, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  const splash = await sharp({ create: { width: 2732, height: 2732, channels: 3, background: BG } })
    .composite([{ input: logoOnSplash, gravity: 'centre' }])
    .png({ compressionLevel: 9, effort: 10 }).toBuffer();
  fs.writeFileSync(path.join(APP, 'assets', 'splash-2732.png'), splash);
  console.log('✓ app/assets/splash-2732.png');
  const SPLASH_DIR = path.join(APP, 'ios/App/App/Assets.xcassets/Splash.imageset');
  if (fs.existsSync(SPLASH_DIR)) {
    for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'])
      fs.writeFileSync(path.join(SPLASH_DIR, f), splash);
    console.log('✓ iOS Splash обновлён (3 файла)');
  }
  console.log('Готово.');
}
main().catch(e => { console.error('Ошибка:', e.message); process.exit(1); });
