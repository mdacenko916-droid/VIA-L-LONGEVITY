// ══════════════════════════════════════════════════════════════
// VIA-L · Google Apps Script v2.0
// — валидация кодов доступа (doGet)
// — приём Expert-запросов с данными анализа (doPost)
// ══════════════════════════════════════════════════════════════
//
// СТРУКТУРА ТАБЛИЦЫ (лист 1, строка 1 = заголовки):
// A: Код  B: Тариф  C: Статус  D: Дата активации
// E: Дата истечения  F: Дата последнего Expert-запроса
//
// Статусы: FREE → ACTIVE → EXPIRED
// ══════════════════════════════════════════════════════════════

var SUBSCRIPTION_DAYS = 30;
var MARINA_EMAIL = 'viaelcom@gmail.com';

// ── GET: валидация кода при входе ─────────────────────────────
function doGet(e) {
  var code = ((e.parameter && e.parameter.code) || '').toString().toUpperCase().trim();
  if (!code) return respond({ ok: false, reason: 'no_code' });
  return validateCode(code);
}

// ── POST: приём Expert-запроса ─────────────────────────────────
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var code    = (payload.code     || '').toString().toUpperCase().trim();
    var name    = payload.name      || '';
    var email   = payload.email     || '';
    var question = payload.question || '';
    var data    = payload.analysisData || {};
    var lang    = payload.lang      || 'ru';

    if (!code) return respond({ ok: false, reason: 'no_code' });

    var sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var rows   = sheet.getDataRange().getValues();
    var now    = new Date();

    for (var i = 1; i < rows.length; i++) {
      var rowCode   = (rows[i][0] || '').toString().toUpperCase().trim();
      var rowStatus = (rows[i][2] || '').toString().toUpperCase().trim();
      var rowExpiry = rows[i][4];
      var lastExpert = rows[i][5]; // колонка F

      if (rowCode !== code) continue;

      if (rowStatus === 'EXPIRED') return respond({ ok: false, reason: 'expired' });

      // Проверка: не более 1 Expert-запроса в 30 дней
      if (lastExpert) {
        var lastDate   = new Date(lastExpert);
        var daysSince  = (now - lastDate) / (1000 * 60 * 60 * 24);
        if (daysSince < 30) {
          var nextAvail = new Date(lastDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          return respond({ ok: false, reason: 'monthly_limit', next_date: nextAvail.toISOString() });
        }
      }

      // Сохраняем дату запроса
      sheet.getRange(i + 1, 6).setValue(now.toISOString());

      // Отправляем письма
      sendExpertEmail(name, email, question, data, lang, code);

      return respond({ ok: true });
    }

    return respond({ ok: false, reason: 'invalid' });

  } catch (err) {
    return respond({ ok: false, reason: 'error', message: err.toString() });
  }
}

// ── Валидация кода (общая) ─────────────────────────────────────
function validateCode(code) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data  = sheet.getDataRange().getValues();
  var now   = new Date();

  for (var i = 1; i < data.length; i++) {
    var rowCode   = (data[i][0] || '').toString().toUpperCase().trim();
    var rowPlan   = (data[i][1] || '').toString().toUpperCase().trim();
    var rowStatus = (data[i][2] || '').toString().toUpperCase().trim();
    var rowExpiry = data[i][4];

    if (rowCode !== code) continue;

    if (rowStatus === 'FREE') {
      var expiry = new Date(now.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);
      sheet.getRange(i + 1, 3).setValue('ACTIVE');
      sheet.getRange(i + 1, 4).setValue(now.toISOString());
      sheet.getRange(i + 1, 5).setValue(expiry.toISOString());
      return respond({ ok: true, plan: rowPlan, expiry: expiry.toISOString() });
    }

    if (rowStatus === 'ACTIVE') {
      var expiryDate = new Date(rowExpiry);
      if (now < expiryDate) return respond({ ok: true, plan: rowPlan, expiry: expiryDate.toISOString() });
      sheet.getRange(i + 1, 3).setValue('EXPIRED');
      return respond({ ok: false, reason: 'expired' });
    }

    if (rowStatus === 'EXPIRED') return respond({ ok: false, reason: 'expired' });

    return respond({ ok: false, reason: 'invalid' });
  }

  return respond({ ok: false, reason: 'invalid' });
}

// ── Отправка письма Марине + подтверждение клиенту ────────────
function sendExpertEmail(name, email, question, d, lang, code) {
  var date = new Date().toLocaleString('uk-UA');
  var subject = '★ Expert-розбір · ' + (name || 'Клієнт') + ' · ' + new Date().toLocaleDateString('uk-UA');

  var b = '═══════════════════════════════════════\n';
  b += '  VIA-L · EXPERT-РОЗБІР · Pro + Expert\n';
  b += '═══════════════════════════════════════\n\n';
  b += 'Клієнт:       ' + (name  || '—') + '\n';
  b += 'Email:        ' + (email || '—') + '\n';
  b += 'Мова:         ' + lang.toUpperCase() + '\n';
  b += 'Код доступу:  ' + code + '\n';
  b += 'Дата запиту:  ' + date + '\n\n';

  if (question) {
    b += '─── ПИТАННЯ КЛІЄНТА ─────────────────\n';
    b += question + '\n\n';
  }

  b += '─── ПРОФІЛЬ ─────────────────────────\n';
  b += 'Стать: ' + (d.gender === 'male' ? 'Чоловік ♂' : 'Жінка ♀') + '\n';
  b += 'Фаза:  ' + (d.phase || '—') + '\n';
  if (d.age)    b += 'Вік:   ' + d.age    + ' р.\n';
  if (d.weight) b += 'Вага:  ' + d.weight + ' кг\n';
  if (d.height) b += 'Зріст: ' + d.height + ' см\n';

  b += '\n─── ОСНОВНІ ПОКАЗНИКИ ───────────────\n';
  b += 'HRV:          ' + d.hrv + ' мс';
  if (d.hrv_trend) b += '  (тренд: ' + d.hrv_trend + (d.hrv_dur ? ', ' + d.hrv_dur : '') + ')';
  b += '\n';
  b += 'ЧСС спокою:   ' + d.rhr + ' уд/хв';
  if (d.rhr_comp) b += '  (' + d.rhr_comp + ')';
  b += '\n';
  b += 'Якість сну:   ' + d.sleep_qual + '/10\n';
  if (d.deep)  b += 'Глибокий сон: ' + d.deep + '\n';
  if (d.wake)  b += 'Пробудження:  ' + d.wake + '\n';
  b += 'Енергія:      ' + d.energy  + '/10\n';
  b += 'Тривога:      ' + d.anxiety + '/10\n';
  if (d.resp_rate) b += 'ЧД:           ' + d.resp_rate + ' дих/хв\n';

  if (d.temp || d.hotflash) {
    b += '\n─── ТЕМПЕРАТУРА / ПРИПЛИВИ ──────────\n';
    if (d.temp)       b += 'Нічна т-ра:   ' + d.temp       + '\n';
    if (d.hotflash)   b += 'Припливи:     ' + d.hotflash   + '\n';
    if (d.hotfreq)    b += 'Частота:      ' + d.hotfreq    + '\n';
    if (d.hf_count)   b += 'Кількість:    ' + d.hf_count   + '\n';
    if (d.hf_intensity) b += 'Інтенсивність:' + d.hf_intensity + '\n';
    if (d.hf_time)    b += 'Час:          ' + d.hf_time    + '\n';
  }

  if (d.symptoms && d.symptoms.length) {
    b += '\n─── СИМПТОМИ ────────────────────────\n';
    b += d.symptoms.join(', ') + '\n';
  }
  if (d.horm_symptoms && d.horm_symptoms.length) {
    b += 'Гормональні:  ' + d.horm_symptoms.join(', ') + '\n';
    if (d.horm_intensity) b += 'Інтенсивність:' + d.horm_intensity + '\n';
  }

  b += '\n─── КОГНІЦІЯ ────────────────────────\n';
  if (d.memory)  b += 'Пам\'ять:      ' + d.memory  + '\n';
  if (d.fog)     b += 'Туман:        ' + d.fog     + '\n';
  if (d.cogndur) b += 'Тривалість:   ' + d.cogndur + '\n';

  b += '\n─── ХАРЧУВАННЯ ──────────────────────\n';
  if (d.appetite)       b += 'Апетит:       ' + d.appetite       + '\n';
  if (d.eating_pattern) b += 'Режим:        ' + d.eating_pattern + '\n';
  if (d.protein_intake) b += 'Білок:        ' + d.protein_intake + '\n';
  if (d.alc)            b += 'Алкоголь:     ' + d.alc            + '\n';

  b += '\n─── АКТИВНІСТЬ ──────────────────────\n';
  if (d.act_types && d.act_types.length) b += 'Типи:         ' + d.act_types.join(', ') + '\n';
  if (d.act_freq)     b += 'Частота:      ' + d.act_freq     + '\n';
  if (d.act_recovery) b += 'Відновлення:  ' + d.act_recovery + '\n';

  if (d.supplements && d.supplements.length) {
    b += '\n─── ДОБАВКИ ─────────────────────────\n';
    b += d.supplements.join(', ') + '\n';
  }
  if (d.meds) b += 'Медикаменти:  ' + d.meds + '\n';

  b += '\n─── СТРЕС / НАСТРІЙ ─────────────────\n';
  if (d.stress)        b += 'Стрес:        ' + d.stress        + '\n';
  if (d.chronic_stress) b += 'Хрон. стрес:  ' + d.chronic_stress + '\n';
  if (d.cortisol_symp && d.cortisol_symp.length) b += 'Кортизол:     ' + d.cortisol_symp.join(', ') + '\n';
  if (d.mood)        b += 'Настрій:      ' + d.mood        + '\n';
  if (d.irritability) b += 'Дратівливість:' + d.irritability + '\n';

  if (d.cycle_status || d.last_period) {
    b += '\n─── ЦИКЛ ────────────────────────────\n';
    if (d.cycle_status) b += 'Цикл:         ' + d.cycle_status + '\n';
    if (d.last_period)  b += 'Остання м-я:  ' + d.last_period  + '\n';
    if (d.pms)          b += 'ПМС:          ' + d.pms          + '\n';
  }

  if (d.vitality || d.weekly_trend) {
    b += '\n─── ТИЖНЕВИЙ ТРЕНД ──────────────────\n';
    if (d.vitality)     b += 'Вітальність:  ' + d.vitality     + '\n';
    if (d.weekly_trend) b += 'Тренд:        ' + d.weekly_trend + '\n';
    if (d.weekly_changes && d.weekly_changes.length) b += 'Зміни:        ' + d.weekly_changes.join(', ') + '\n';
    if (d.events && d.events.length)                 b += 'Події:        ' + d.events.join(', ')          + '\n';
  }

  if (d.bio) {
    var bio = d.bio;
    if (bio.fat || bio.muscle || bio.bmi || bio.bioage) {
      b += '\n─── БІОІМПЕДАНС ─────────────────────\n';
      if (bio.fat)      b += 'Жир:          ' + bio.fat      + '%\n';
      if (bio.muscle)   b += 'М\'язи:        ' + bio.muscle   + '%\n';
      if (bio.visceral) b += 'Вісцер. жир:  ' + bio.visceral + '\n';
      if (bio.water)    b += 'Вода:         ' + bio.water    + '%\n';
      if (bio.bmi)      b += 'ІМТ:          ' + bio.bmi      + '\n';
      if (bio.bmr)      b += 'ОО:           ' + bio.bmr      + ' ккал\n';
      if (bio.bioage)   b += 'Біовік:       ' + bio.bioage   + '\n';
    }
  }

  if (d.labs) {
    var labs = d.labs;
    if (labs.vitd || labs.ferr || labs.tsh || labs.e2 || labs.prog || labs.test || labs.cort || labs.b12) {
      b += '\n─── АНАЛІЗИ ─────────────────────────\n';
      if (labs.vitd) b += 'Віт. D:       ' + labs.vitd + ' нг/мл\n';
      if (labs.ferr) b += 'Феритин:      ' + labs.ferr + ' нг/мл\n';
      if (labs.tsh)  b += 'ТТГ:          ' + labs.tsh  + ' мОд/л\n';
      if (labs.e2)   b += 'Естрадіол:    ' + labs.e2   + ' пмоль/л\n';
      if (labs.prog) b += 'Прогестерон:  ' + labs.prog + '\n';
      if (labs.test) b += 'Тестостерон:  ' + labs.test + '\n';
      if (labs.cort) b += 'Кортизол:     ' + labs.cort + '\n';
      if (labs.b12)  b += 'Віт. B12:     ' + labs.b12  + '\n';
    }
  }

  b += '\n═══════════════════════════════════════\n';
  b += 'Відповідь клієнту надіслати на: ' + (email || '—') + '\n';
  b += '═══════════════════════════════════════\n';

  GmailApp.sendEmail(MARINA_EMAIL, subject, b);

  // Підтвердження клієнту
  if (email) {
    var cs = lang === 'ru' ? 'Ваш Expert-разбор принят · VIA-L' :
             lang === 'uk' ? 'Ваш Expert-розбір прийнято · VIA-L' :
                             'Your Expert Review received · VIA-L';
    var cb = lang === 'ru' ?
      'Здравствуйте' + (name ? ', ' + name : '') + '!\n\nМы получили ваш запрос на Expert-разбор. Нутрициолог подготовит персональный письменный анализ в течение 48 часов.\n\nС уважением,\nMarina · VIA-L' :
      lang === 'uk' ?
      'Вітаємо' + (name ? ', ' + name : '') + '!\n\nМи отримали ваш запит на Expert-розбір. Нутриціолог підготує персональний письмовий аналіз протягом 48 годин.\n\nЗ повагою,\nMarina · VIA-L' :
      'Hello' + (name ? ', ' + name : '') + '!\n\nWe received your Expert review request. Your nutritionist will prepare a personalised written analysis within 48 hours.\n\nBest regards,\nMarina · VIA-L';
    GmailApp.sendEmail(email, cs, cb);
  }
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
