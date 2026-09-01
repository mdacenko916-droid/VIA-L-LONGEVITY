#!/usr/bin/env node
/**
 * setup-android.js — восстанавливает настройки Health Connect и возврата из OAuth
 * в нативном Android-проекте. Брат-близнец setup-ios.js.
 *
 * Зачем: папка `android/` в .gitignore и генерится локально (`cap add android`). При каждом
 * пересоздании Capacitor пишет ЧИСТЫЕ AndroidManifest.xml / variables.gradle — без наших
 * правок, и Health Connect перестаёт работать. Причём молча: приложение соберётся и
 * запустится, просто разрешения не выдадут. Скрипт идемпотентно дописывает недостающее.
 * Запускать после `cap add android` (подключён к npm-скрипту `add:android`)
 * или вручную: `npm run setup:android`.
 *
 * Что именно правится и почему:
 *
 * 1. minSdkVersion 22 → 26. Capacitor ставит 22, а androidx.health.connect требует 26
 *    (см. app/plugins/health-connect/android/build.gradle). Без этого Gradle не соберёт.
 *
 * 2. Экран обоснования доступа. Health Connect ОТКАЗЫВАЕТСЯ выдавать разрешения приложению,
 *    которое не умеет показать свою политику приватности по системному запросу. Нужны два
 *    объявления: `androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE` для Android 13 и ниже
 *    и `VIEW_PERMISSION_USAGE` + категория HEALTH_PERMISSIONS для Android 14+, где Health
 *    Connect встроен в систему. Без них весь остальной код бесполезен.
 *
 * 3. Схема `com.viael.vial://` — возврат в приложение после OAuth трекера. Та же беда, что
 *    была на iOS (см. setup-ios.js и коммит fc30240): вход уходит во внешний браузер, и без
 *    зарегистрированной схемы вернуться некуда. Схема заведена в белый список воркера.
 *
 * Сами разрешения Health Connect объявлять здесь НЕ нужно: они лежат в манифесте плагина
 * (app/plugins/health-connect/android/src/main/AndroidManifest.xml) и подмешиваются Gradle.
 *
 * Чистый Node, без зависимостей.
 */
const fs = require('fs');
const path = require('path');

const APP_DIR   = path.resolve(__dirname, '..');
const ANDROID   = path.join(APP_DIR, 'android');
const GRADLE    = path.join(ANDROID, 'variables.gradle');
const MANIFEST  = path.join(ANDROID, 'app', 'src', 'main', 'AndroidManifest.xml');
const STYLES    = path.join(ANDROID, 'app', 'src', 'main', 'res', 'values', 'styles.xml');
const MAIN_ACT  = path.join(ANDROID, 'app', 'src', 'main', 'java', 'com', 'viael', 'vial', 'MainActivity.java');

// Цвет нижней панели навигации Android (кнопки «назад/домой/обзор»). Без него система красит
// её по умолчанию — на EMUI получилась БЕЛАЯ полоса под нашей тёмной навигацией, будто
// приложение открыто не на весь экран (фото владельца 2026-09-01). Берём нижний цвет градиента
// .bottom-nav (#171d27), чтобы панель системы продолжала нашу.
// Панель системы делаем ПРОЗРАЧНОЙ и рисуем приложение под ней (edge-to-edge, как на iOS).
// Раньше здесь стоял непрозрачный #FF171D27 — он убирал белую полосу EMUI, но приложение всё
// равно заканчивалось выше края экрана. Прозрачность + setDecorFitsSystemWindows(false)
// в MainActivity дают то же, что на iPhone: наша нижняя навигация доходит до самого низа,
// а системные кнопки лежат поверх неё. Отступ под них у .bottom-nav уже прописан
// (env(safe-area-inset-bottom)) — на iOS он уводит панель из-под жеста «домой», на Android
// заработает ровно так же. 2026-09-01.
const NAV_BAR_COLOR = '#00000000';
const NAV_ITEMS =
  `        <item name="android:navigationBarColor">${NAV_BAR_COLOR}</item>\n` +
  `        <item name="android:windowLightNavigationBar">false</item>\n`;

const MIN_SDK = 26;

// Блок для MainActivity: обоснование доступа (Android ≤13) + возврат из OAuth по схеме.
const ACTIVITY_BLOCK = `
            <!-- Health Connect (Android 13 и ниже): по этому запросу система открывает наше
                 объяснение, зачем нужны данные. Без обработчика разрешения не выдаются. -->
            <intent-filter>
                <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
            </intent-filter>

            <!-- Возврат в приложение после OAuth трекера (Fitbit/Oura/Polar/Withings).
                 Схема заведена в белый список воркера, см. FITBIT_RETURN_ALLOW. -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="com.viael.vial" />
            </intent-filter>
`;

// Отдельный псевдоним активности для Android 14+, где Health Connect встроен в систему.
const ALIAS_BLOCK = `
        <!-- Health Connect (Android 14+): системный экран разрешений ведёт сюда.
             Требуется именно activity-alias с этим разрешением — иначе система его игнорирует. -->
        <activity-alias
            android:name="ViewPermissionUsageActivity"
            android:exported="true"
            android:targetActivity=".MainActivity"
            android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
            <intent-filter>
                <action android:name="android.intent.action.VIEW_PERMISSION_USAGE" />
                <category android:name="android.intent.category.HEALTH_PERMISSIONS" />
            </intent-filter>
        </activity-alias>
`;

function fail(msg) { console.error('✗ ' + msg); process.exitCode = 1; }

function patchGradle() {
  if (!fs.existsSync(GRADLE)) {
    console.warn(`⚠️  variables.gradle не найден. Сначала выполни \`npx cap add android\`, затем \`npm run setup:android\`.`);
    return;
  }
  const src = fs.readFileSync(GRADLE, 'utf8');
  const m = src.match(/minSdkVersion\s*=\s*(\d+)/);
  if (!m) return fail('в variables.gradle не найден minSdkVersion — неожиданный формат');
  if (Number(m[1]) >= MIN_SDK) { console.log(`✓ variables.gradle: minSdkVersion ${m[1]} — уже ≥ ${MIN_SDK}.`); return; }
  fs.writeFileSync(GRADLE, src.replace(/minSdkVersion\s*=\s*\d+/, `minSdkVersion = ${MIN_SDK}`));
  console.log(`✚ variables.gradle: minSdkVersion ${m[1]} → ${MIN_SDK} (требование androidx.health.connect).`);
}

function patchManifest() {
  if (!fs.existsSync(MANIFEST)) {
    console.warn(`⚠️  AndroidManifest.xml не найден. Сначала выполни \`npx cap add android\`.`);
    return;
  }
  let xml = fs.readFileSync(MANIFEST, 'utf8');
  const added = [];

  // 1. Блок внутри <activity …MainActivity …> — перед её закрывающим тегом.
  if (!xml.includes('ACTION_SHOW_PERMISSIONS_RATIONALE')) {
    const start = xml.indexOf('<activity');
    const end = start === -1 ? -1 : xml.indexOf('</activity>', start);
    if (end === -1) return fail('в манифесте не найдена <activity> — неожиданный формат');
    xml = xml.slice(0, end) + ACTIVITY_BLOCK + '\n        ' + xml.slice(end);
    added.push('rationale + схема com.viael.vial');
  }

  // 2. activity-alias — сразу после закрывающего тега MainActivity.
  if (!xml.includes('VIEW_PERMISSION_USAGE')) {
    const end = xml.indexOf('</activity>');
    if (end === -1) return fail('в манифесте не найдена </activity>');
    const after = end + '</activity>'.length;
    xml = xml.slice(0, after) + '\n' + ALIAS_BLOCK + xml.slice(after);
    added.push('activity-alias для Android 14+');
  }

  if (!added.length) { console.log('✓ AndroidManifest.xml: всё на месте.'); return; }
  fs.writeFileSync(MANIFEST, xml);
  console.log(`✚ AndroidManifest.xml: добавлено — ${added.join('; ')}`);
}

// Красим системную панель навигации в цвет нашей нижней панели. Тем оба: NoActionBarLaunch —
// стартовая (splash), NoActionBar — та, на которую приложение переключается после старта.
function patchStyles() {
  if (!fs.existsSync(STYLES)) {
    console.warn('⚠️  styles.xml не найден. Сначала выполни `npx cap add android`.');
    return;
  }
  let xml = fs.readFileSync(STYLES, 'utf8');
  // Значение могло остаться от прошлой версии скрипта (был непрозрачный цвет) — приводим к текущему.
  if (xml.includes('android:navigationBarColor')) {
    const fixed = xml.replace(/(<item name="android:navigationBarColor">)[^<]*(<\/item>)/g, `$1${NAV_BAR_COLOR}$2`);
    if (fixed === xml) { console.log('✓ styles.xml: панель навигации уже настроена.'); return; }
    fs.writeFileSync(STYLES, fixed);
    console.log(`✚ styles.xml: цвет панели навигации обновлён → ${NAV_BAR_COLOR} (прозрачная).`);
    return;
  }
  let touched = 0;
  xml = xml.replace(/(<style name="AppTheme\.NoActionBar(?:Launch)?"[^>]*>\n)/g, (m) => { touched++; return m + NAV_ITEMS; });
  if (!touched) { console.warn('⚠️  styles.xml: не найдены темы AppTheme.NoActionBar* — формат изменился, проверь вручную.'); return; }
  fs.writeFileSync(STYLES, xml);
  console.log(`✚ styles.xml: цвет системной панели навигации задан в ${touched} теме(ах) — ${NAV_BAR_COLOR}.`);
}

// Edge-to-edge: приложение рисует себя ПОД системными панелями. Без этого WebView заканчивается
// над панелью кнопок, и снизу остаётся чужая полоса (белая на EMUI). Файл генерируемый —
// `cap add android` пишет пустой BridgeActivity, поэтому правку держим здесь.
const MAIN_ACT_SRC = `package com.viael.vial;

import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // Цвет нижней панели приложения (низ градиента .bottom-nav). Под кнопками системы видно
    // именно фон окна, поэтому он должен совпадать — иначе снизу чужая полоса.
    private static final int BAR_COLOR = 0xFF171D27;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Окно рисует себя под системными панелями (как на iOS).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setBackgroundDrawable(new ColorDrawable(BAR_COLOR));

        // Панель системных кнопок не должна ложиться поверх нашей навигации. Через CSS это не
        // решается: Android WebView не отдаёт env(safe-area-inset-*), там всегда 0 (в отличие от
        // iOS). Прокидывать высоту в CSS-переменную тоже ненадёжно — значение теряется при
        // загрузке страницы. Поэтому поджимаем сам WebView: под ним остаётся полоса фона окна
        // ровно по высоте панели, и кнопки лежат на ней. Слушатель, а не разовое чтение: высота
        // меняется при повороте и при переключении кнопочной/жестовой навигации. 2026-09-01.
        // Слушатель вешаем на КОРНЕВОЙ контейнер, а не на WebView: до самого WebView отступы
        // системы не доходят — родитель их не пробрасывает, и первая попытка (padding прямо на
        // WebView) молча ничего не дала. requestApplyInsets нужен, чтобы отступы пришли сразу,
        // а не только после первого поворота экрана.
        final android.view.View root = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(0, 0, 0, bars.bottom);
            return insets;
        });
        ViewCompat.requestApplyInsets(root);
    }
}
`;

function patchMainActivity() {
  // Файл пишем целиком, поэтому его отсутствие — не ошибка, а просто «создадим».
  if (!fs.existsSync(path.dirname(MAIN_ACT))) {
    console.warn('⚠️  Папка исходников Android не найдена. Сначала выполни `npx cap add android`.');
    return;
  }
  const cur = fs.existsSync(MAIN_ACT) ? fs.readFileSync(MAIN_ACT, 'utf8') : '';
  if (cur.includes('setDecorFitsSystemWindows')) { console.log('✓ MainActivity.java: edge-to-edge уже включён.'); return; }
  fs.writeFileSync(MAIN_ACT, MAIN_ACT_SRC);
  console.log('✚ MainActivity.java: включён edge-to-edge (рисуем под системными панелями).');
}

console.log('— setup-android: Health Connect + возврат из OAuth —');
patchGradle();
patchManifest();
patchStyles();
patchMainActivity();
console.log('Готово. Дальше: `npx cap sync android`, затем открыть в Android Studio.');
