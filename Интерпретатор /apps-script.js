// ══════════════════════════════════════════════════════════════
// VIA-L · Google Apps Script — валидация кодов доступа
// ══════════════════════════════════════════════════════════════
//
// УСТАНОВКА:
// 1. Открой Google Sheets → Extensions → Apps Script
// 2. Вставь этот код целиком
// 3. Deploy → New deployment → Web app
//    Execute as: Me
//    Who has access: Anyone
// 4. Скопируй URL вида:
//    https://script.google.com/macros/s/XXXXXXXXX/exec
// 5. Вставь URL в interpreter-pro.html (константа APPS_SCRIPT_URL)
//
// СТРУКТУРА ТАБЛИЦЫ (лист 1, строка 1 = заголовки):
// A: Код  B: Тариф  C: Статус  D: Дата активации  E: Дата истечения
//
// Статусы: FREE → ACTIVE → EXPIRED
// Период подписки: SUBSCRIPTION_DAYS дней с первого ввода кода
// ══════════════════════════════════════════════════════════════

var SUBSCRIPTION_DAYS = 30;

function doGet(e) {
  var code = ((e.parameter && e.parameter.code) || '').toString().toUpperCase().trim();

  if (!code) {
    return respond({ ok: false, reason: 'no_code' });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data  = sheet.getDataRange().getValues();
  var now   = new Date();

  for (var i = 1; i < data.length; i++) {
    var rowCode   = (data[i][0] || '').toString().toUpperCase().trim();
    var rowPlan   = (data[i][1] || '').toString().toUpperCase().trim();
    var rowStatus = (data[i][2] || '').toString().toUpperCase().trim();
    var rowExpiry = data[i][4]; // колонка E

    if (rowCode !== code) continue;

    // FREE — первый ввод: запускаем таймер
    if (rowStatus === 'FREE') {
      var expiry = new Date(now.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);
      sheet.getRange(i + 1, 3).setValue('ACTIVE');
      sheet.getRange(i + 1, 4).setValue(now.toISOString());
      sheet.getRange(i + 1, 5).setValue(expiry.toISOString());
      return respond({ ok: true, plan: rowPlan, expiry: expiry.toISOString() });
    }

    // ACTIVE — повторный вход: проверяем не истёк ли срок
    if (rowStatus === 'ACTIVE') {
      var expiryDate = new Date(rowExpiry);
      if (now < expiryDate) {
        return respond({ ok: true, plan: rowPlan, expiry: expiryDate.toISOString() });
      }
      // Срок вышел — помечаем EXPIRED
      sheet.getRange(i + 1, 3).setValue('EXPIRED');
      return respond({ ok: false, reason: 'expired' });
    }

    // EXPIRED
    if (rowStatus === 'EXPIRED') {
      return respond({ ok: false, reason: 'expired' });
    }

    // Неизвестный статус
    return respond({ ok: false, reason: 'invalid' });
  }

  return respond({ ok: false, reason: 'invalid' });
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
