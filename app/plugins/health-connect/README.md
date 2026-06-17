# @viael/health-connect — локальный плагин Health Connect (Android)

Зеркало Apple-моста для Android. Читает из **Google Health Connect** метрики и отдаёт их
ИП в те же поля, что и Apple Health: **HRV (RMSSD) · пульс покоя · VO2max · SpO₂ · сон (стадии) · шаги**.

- Натив: `android/src/main/java/com/viael/healthconnect/HealthConnectVialPlugin.kt`
- JS-мост (в веб-ИП): `interpreter/healthconnect-bridge.js` → кнопка `#hc-btn` в карточке импорта.
- Только Android. На iOS/web — no-op (на iOS работает `@perfood/capacitor-healthkit`).

## API плагина
- `isAvailable()` → `{available, status}` — установлен ли провайдер Health Connect.
- `requestPermissions()` → `{granted}` — системный экран разрешений HC.
- `readMetrics()` → `{hrv, rhr, vo2, spo2, sleepHours, deepMin, steps}` (нормализовано в нативе).

## Что должен сделать владелец, чтобы заработало (на Mac/Android Studio)

> ⚠️ Health Connect требует **Android 9+** и приложение-провайдер «Health Connect»
> (на Android 14+ встроено; на 13 и ниже — поставить из Google Play).
> На Huawei работает только при наличии **Google Play** (GMS). Без GMS HC недоступен.

1. **Подтянуть плагин и платформу:**
   ```bash
   cd ~/Developer/VIA-L-LONGEVITY/app
   npm install
   npx cap add android        # если папки android/ ещё нет
   npx cap sync android
   ```

2. **minSdk ≥ 26.** В `android/variables.gradle` поставить:
   ```gradle
   minSdkVersion = 26
   ```
   (Capacitor по умолчанию 23 — иначе сборка упадёт на merge манифеста: модуль требует 26.)

3. **Активити-обоснование прав** — Health Connect это требует. В
   `android/app/src/main/AndroidManifest.xml` внутри `<activity ... MainActivity>` добавить
   intent-filter (Android 13 и ниже):
   ```xml
   <intent-filter>
     <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
   </intent-filter>
   ```
   и для Android 14+ — activity-alias рядом с `<activity>`:
   ```xml
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
   ```

4. **Собрать и запустить:**
   ```bash
   npx cap open android   # Android Studio → Run на телефоне
   ```

5. На телефоне: открыть PRO → панель импорта (кнопка «Apple Health / Health Connect») →
   карточка → кнопка **«⌚ Health Connect»** → дать разрешения. Поля заполнятся, если в
   Health Connect есть данные (их туда должен писать источник — Fitbit/Samsung/Garmin/…).

## Заметки
- Версия `androidx.health.connect:connect-client` в `android/build.gradle` — `1.1.0-rc01`.
  Если Gradle её не найдёт, поставить актуальную (developer.android.com/health-and-fitness/health-connect).
- Папка `android/` приложения — в `.gitignore` (генерится). Поэтому шаги 2–3 (правки app-манифеста
  и variables.gradle) делаются на машине после `cap add android` и в репо не коммитятся.
- Температуры запястья в Health Connect нет (в отличие от пропатченного Apple-моста) — поле tempDev
  через этот путь не заполняется.
