#!/usr/bin/env node
/**
 * gen-icons.js (ADAM-L) — раскладывает готовую иконку по платформам. Образец — app/scripts/gen-icons.js.
 *
 * Отличие от VIA-L: мастер ADAM-L уже собран (плитка с серебряным AL, без прозрачности,
 * interpreter/Logo/adam-l-icon-1024.png → assets/icon-source.png), его не нормализуем, а кладём как есть.
 * Знак без фона (assets/icon-mark-alpha.png) — для адаптивной иконки Android и заставки.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const APP = path.resolve(__dirname, '..');
const SRC = path.join(APP, 'assets', 'icon-source.png');
const MARK = path.join(APP, 'assets', 'icon-mark-alpha.png');
const IOS_ICON = path.join(APP, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
const BG = { r: 0x21, g: 0x14, b: 0x34 };   // индиго ADAM-L (#211434)

async function main() {
  const buf = await sharp(SRC).resize(1024, 1024, { kernel: 'lanczos3' }).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(APP, 'assets', 'icon-1024.png'), buf);
  if (fs.existsSync(path.dirname(IOS_ICON))) { fs.writeFileSync(IOS_ICON, buf); console.log('✓ iOS AppIcon'); }

  const splash = await sharp({ create: { width: 2732, height: 2732, channels: 3, background: BG } })
    .composite([{ input: await sharp(MARK).resize(1100, 1100).png().toBuffer(), gravity: 'centre' }])
    .png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(APP, 'assets', 'splash-2732.png'), splash);
  const SPLASH_DIR = path.join(APP, 'ios/App/App/Assets.xcassets/Splash.imageset');
  if (fs.existsSync(SPLASH_DIR)) {
    for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png'])
      fs.writeFileSync(path.join(SPLASH_DIR, f), splash);
    console.log('✓ iOS Splash');
  }

  const ANDROID_RES = path.join(APP, 'android/app/src/main/res');
  if (fs.existsSync(ANDROID_RES)) {
    const DPI = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
    for (const [dpi, size] of Object.entries(DPI)) {
      const dir = path.join(ANDROID_RES, 'mipmap-' + dpi);
      if (!fs.existsSync(dir)) continue;
      const square = await sharp(buf).resize(size, size, { kernel: 'lanczos3' }).png().toBuffer();
      fs.writeFileSync(path.join(dir, 'ic_launcher.png'), square);
      fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), square);
      const fgSize = Math.round(size * 108 / 48), inner = Math.round(fgSize * 0.66);
      const fg = await sharp({ create: { width: fgSize, height: fgSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: await sharp(MARK).resize(inner, inner, { kernel: 'lanczos3' }).png().toBuffer(), gravity: 'centre' }])
        .png().toBuffer();
      fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), fg);
    }
    const bgXml = path.join(ANDROID_RES, 'values/ic_launcher_background.xml');
    if (fs.existsSync(bgXml)) fs.writeFileSync(bgXml, '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#211434</color>\n</resources>\n');
    const stubFg = path.join(ANDROID_RES, 'drawable-v24/ic_launcher_foreground.xml');
    if (fs.existsSync(stubFg)) fs.unlinkSync(stubFg);
    console.log('✓ Android-иконки (mipmap ×5, фон #211434)');
  } else {
    console.warn('Android не сгенерирован — нет android/. Сначала `npm run add:android`, потом `npm run icons`.');
  }
  console.log('Готово.');
}
main().catch(e => { console.error('Ошибка:', e.message); process.exit(1); });
