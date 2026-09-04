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
  // ── Нормализация мастера ───────────────────────────────────────────────
  // Знак в исходнике занимает ~80% плитки и сидит выше центра (поля 90 сверху / 165 снизу) —
  // на домашнем экране это читается как «круг задран кверху и упирается в края».
  // Поэтому знак вырезаем по яркости, находим его реальные границы и вписываем В ЦЕНТР
  // квадрата с полями: SIGN_RATIO — доля стороны, которую занимает знак. 2026-09-04.
  const SIGN_RATIO = 0.72;   // 72% — знак крупный, но с воздухом; iOS/Android скругляют углы
  const LO = 45, HI = 90;    // порог яркости: фон тёмный, золото яркое

  const srcMeta = await sharp(SRC, isSvg ? { density: 512 } : undefined).metadata();
  const SQ = Math.min(srcMeta.width, srcMeta.height);
  const flatRaw = await sharp(SRC, isSvg ? { density: 512 } : undefined)
    .resize(SQ, SQ, { fit: 'cover', kernel: 'lanczos3' }).removeAlpha().raw().toBuffer();
  const rgbaAll = Buffer.alloc(SQ * SQ * 4);
  let minX = SQ, maxX = -1, minY = SQ, maxY = -1;
  for (let i = 0, j = 0, px = 0; i < flatRaw.length; i += 3, j += 4, px++) {
    const lum = 0.299 * flatRaw[i] + 0.587 * flatRaw[i + 1] + 0.114 * flatRaw[i + 2];
    const a = Math.max(0, Math.min(255, Math.round((lum - LO) / (HI - LO) * 255)));
    rgbaAll[j] = flatRaw[i]; rgbaAll[j + 1] = flatRaw[i + 1]; rgbaAll[j + 2] = flatRaw[i + 2]; rgbaAll[j + 3] = a;
    if (lum > 70) { const x = px % SQ, y = (px / SQ) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  const signW = maxX - minX + 1, signH = maxY - minY + 1;
  console.log(`  · знак в исходнике: ${signW}×${signH} (${Math.round(signW / SQ * 100)}% ширины), центрирую`);

  // знак без фона, обрезанный по своим границам
  const markCrop = await sharp(rgbaAll, { raw: { width: SQ, height: SQ, channels: 4 } })
    .extract({ left: minX, top: minY, width: signW, height: signH }).png().toBuffer();

  // фон берём сырым пикселем из угла: sharp.stats() считает по всему кадру и .extract() игнорирует
  const corner = await sharp(SRC, isSvg ? { density: 512 } : undefined)
    .extract({ left: 4, top: 4, width: 2, height: 2 }).removeAlpha().raw().toBuffer();
  const BG_SRC = { r: corner[0], g: corner[1], b: corner[2] };

  const markAlpha = await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: await sharp(markCrop).resize(Math.round(1024 * SIGN_RATIO), Math.round(1024 * SIGN_RATIO),
      { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(), gravity: 'centre' }])
    .png().toBuffer();
  fs.writeFileSync(path.join(APP, 'assets', 'icon-mark-alpha.png'), markAlpha);

  // опаковый мастер: знак по центру на фирменном фоне
  const buf = await sharp({ create: { width: 1024, height: 1024, channels: 3, background: BG_SRC } })
    .composite([{ input: markAlpha, gravity: 'centre' }])
    .png({ compressionLevel: 9, effort: 10 }).toBuffer();

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
  // ── Android: mipmap + адаптивная иконка ──────────────────────────────────
  // Capacitor кладёт СВОИ дефолтные ic_launcher_*; без этого шага в APK уезжала
  // стандартная зелёная иконка. Фон адаптивной берём из угла мастера, а сам знак
  // ужимаем до 66% канвы: система обрезает края маской (круг/сквиркл). 2026-09-04.
  const ANDROID_RES = path.join(APP, 'android/app/src/main/res');
  if (fs.existsSync(ANDROID_RES)) {
    const { r, g, b } = BG_SRC;
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    const DPI = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
    // markAlpha (знак без фона, по центру) готовится выше — один источник на все платформы.
    for (const [dpi, size] of Object.entries(DPI)) {
      const dir = path.join(ANDROID_RES, 'mipmap-' + dpi);
      if (!fs.existsSync(dir)) continue;
      const square = await sharp(buf).resize(size, size, { kernel: 'lanczos3' }).png().toBuffer();
      fs.writeFileSync(path.join(dir, 'ic_launcher.png'), square);
      fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), square);
      // foreground для адаптивной: ЗНАК без фона, 66% канвы — фон даёт <background>.
      // Класть сюда мастер целиком нельзя: его тёмный квадрат виден внутри круглой маски.
      const fgSize = Math.round(size * 108 / 48);
      const inner = Math.round(fgSize * 0.66);
      const fg = await sharp({ create: { width: fgSize, height: fgSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: await sharp(markAlpha).resize(inner, inner, { kernel: 'lanczos3' }).png().toBuffer(), gravity: 'centre' }])
        .png().toBuffer();
      fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), fg);
    }
    const bgXml = path.join(ANDROID_RES, 'values/ic_launcher_background.xml');
    if (fs.existsSync(bgXml)) {
      fs.writeFileSync(bgXml, '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">' + hex + '</color>\n</resources>\n');
    }
    // Capacitor может держать вектор-заглушку, которая перекрывает наш PNG
    const stubFg = path.join(ANDROID_RES, 'drawable-v24/ic_launcher_foreground.xml');
    if (fs.existsSync(stubFg)) { fs.unlinkSync(stubFg); console.log('  · удалена вектор-заглушка drawable-v24/ic_launcher_foreground.xml'); }
    console.log('✓ Android-иконки обновлены (mipmap ×5, фон ' + hex + ')');
  } else {
    console.warn('Android не сгенерирован — нет android/. Сначала `npx cap add android`, потом `npm run icons`.');
  }

  console.log('Готово.');
}
main().catch(e => { console.error('Ошибка:', e.message); process.exit(1); });
