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
// Фон заставки = фон приложения и подложка WebView (capacitor.config.json, html в adam-l.html). 2026-11-10: был слива #211434,
// страница — #0A0527 → при запуске мелькала другая полоса. Цвета держать одинаковыми.
const BG = { r: 0x0A, g: 0x05, b: 0x27 };   // индиго ADAM-L (#0A0527)

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
  // Android: drawable*/splash.png — Capacitor кладёт белую заглушку; пишем знак на фоне приложения (40% короткой стороны). 2026-11-10.
  const RES = path.join(APP, 'android/app/src/main/res');
  if (fs.existsSync(RES)) {
    let n = 0;
    for (const d of fs.readdirSync(RES).filter(d => d.startsWith('drawable'))) {
      const f = path.join(RES, d, 'splash.png');
      if (!fs.existsSync(f)) continue;
      const m = await sharp(f).metadata();
      const side = Math.round(Math.min(m.width, m.height) * 0.4);
      const mark = await sharp(MARK).resize(side, side, { kernel: 'lanczos3' }).png().toBuffer();
      fs.writeFileSync(f, await sharp({ create: { width: m.width, height: m.height, channels: 3, background: BG } })
        .composite([{ input: mark, gravity: 'centre' }]).png().toBuffer());
      n++;
    }
    console.log('✓ Android splash (' + n + ')');
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
