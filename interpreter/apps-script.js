// ══════════════════════════════════════════════════════════════
// VIA-L · Google Apps Script v3.1
// — валидация кодов доступа (doGet без action)
// — приём Expert-запросов (doGet?action=expert) — image beacon
// — приём Expert-запросов (doPost) — fallback
// ══════════════════════════════════════════════════════════════
//
// СТРУКТУРА ТАБЛИЦЫ (лист 1, строка 1 = заголовки):
// A: Код  B: Тариф  C: Статус  D: Дата активации
// E: Дата истечения  F: JSON-массив дат Expert-запросов
//                       (legacy: одна ISO-дата строкой — конвертируется автоматически)
//
// Статусы: FREE → ACTIVE → EXPIRED
//
// Лимиты Expert (PRO-EXPERT / ELITE): 2 разбора в скользящем окне 30 дней,
//                                     минимум 7 дней между запросами.
// ══════════════════════════════════════════════════════════════

var SUBSCRIPTION_DAYS = 30;
var EXPERT_MAX        = 2;                          // максимум разборов в окне
var EXPERT_WIN_MS     = 30 * 24 * 60 * 60 * 1000;   // размер окна (30 дней)
var EXPERT_COOL_MS    = 7  * 24 * 60 * 60 * 1000;   // cooldown между запросами (7 дней)
var MARINA_EMAIL = 'viaelcom@gmail.com';

// Dev-коды — обходят проверку по таблице, не ограничены лимитом
var DEV_CODES = ['VIAL-EXPERT-2024', 'VIAL-PRO-2024', 'VL-DEV-MAX', 'VIAL-ELITE-2024'];

// ── GET: валидация кода ИЛИ приём Expert-запроса ─────────────
function doGet(e) {
  var action = (e.parameter && e.parameter.action) || '';

  if (action === 'expert') {
    return handleExpertRequest(e.parameter);
  }

  var code = ((e.parameter && e.parameter.code) || '').toString().toUpperCase().trim();
  if (!code) return respond({ ok: false, reason: 'no_code' });
  return validateCode(code);
}

// ── POST: fallback приём Expert-запроса ───────────────────────
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    return handleExpertRequest(payload);
  } catch (err) {
    return respond({ ok: false, reason: 'error', message: err.toString() });
  }
}

// ── Обработчик Expert-запроса (общий для GET и POST) ─────────
function handleExpertRequest(p) {
  var code     = (p.code     || '').toString().toUpperCase().trim();
  var name     = p.name      || '';
  var email    = p.email     || '';
  var question = p.question  || '';
  var lang     = p.lang      || 'ru';
  var data     = {};

  try {
    // GET передаёт data как строку, POST — как объект
    data = typeof p.data === 'string'         ? JSON.parse(p.data) :
           typeof p.analysisData === 'string' ? JSON.parse(p.analysisData) :
           (p.data || p.analysisData || {});
  } catch(e) { data = {}; }

  if (!code) return respond({ ok: false, reason: 'no_code' });

  // Dev-коды: отправляем письмо без проверки таблицы
  if (DEV_CODES.indexOf(code) !== -1) {
    sendExpertEmail(name, email, question, data, lang, code + ' [DEV]');
    return respond({ ok: true, dev: true });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var rows  = sheet.getDataRange().getValues();
  var now   = new Date();

  for (var i = 1; i < rows.length; i++) {
    var rowCode    = (rows[i][0] || '').toString().toUpperCase().trim();
    var rowPlan    = (rows[i][1] || '').toString().toUpperCase().trim();
    var rowStatus  = (rows[i][2] || '').toString().toUpperCase().trim();
    var lastExpert = rows[i][5];

    if (rowCode !== code) continue;

    if (rowStatus === 'EXPIRED') return respond({ ok: false, reason: 'expired' });

    // Лимиты по тарифу:
    //   EXPERT (MAX) — 2 разбора в окне 30 дней + cooldown 7 дней.
    //   ELITE        — без лимита окна, только cooldown 7 дней.
    //                  (Детальная логика «8/12 разборов на программу» добавим отдельно.)
    var elite      = isElitePlan(rowPlan);
    var historyAll = parseExpertHistory(lastExpert);
    var recent     = elite
      ? historyAll.slice()
      : historyAll.filter(function (d) { return (now - d) < EXPERT_WIN_MS; });

    // ① лимит окна — только для EXPERT
    if (!elite && recent.length >= EXPERT_MAX) {
      var earliest = recent.reduce(function (a, b) { return a < b ? a : b; });
      var nextAvail = new Date(earliest.getTime() + EXPERT_WIN_MS);
      return respond({
        ok: false, reason: 'monthly_limit',
        next_date: nextAvail.toISOString(),
        used: recent.length, max: EXPERT_MAX
      });
    }

    // ② cooldown между запросами — для всех тарифов
    if (recent.length >= 1) {
      var last = recent.reduce(function (a, b) { return a > b ? a : b; });
      if ((now - last) < EXPERT_COOL_MS) {
        var nextCool = new Date(last.getTime() + EXPERT_COOL_MS);
        return respond({
          ok: false, reason: 'cooldown_7d',
          next_date: nextCool.toISOString(),
          used: recent.length, max: elite ? null : EXPERT_MAX
        });
      }
    }

    // ③ запрос принят — добавляем в полную историю, сохраняем массив, шлём письмо
    historyAll.push(now);
    recent.push(now);
    sheet.getRange(i + 1, 6).setValue(JSON.stringify(
      historyAll.map(function (d) { return d.toISOString(); })
    ));
    sendExpertEmail(name, email, question, data, lang, code);
    return respond({
      ok: true,
      used: recent.length,
      max: elite ? null : EXPERT_MAX,
      next_available_at: new Date(now.getTime() + EXPERT_COOL_MS).toISOString()
    });
  }

  return respond({ ok: false, reason: 'invalid' });
}

// ── Валидация кода при входе ──────────────────────────────────
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
      return respond({
        ok: true, plan: rowPlan, expiry: expiry.toISOString(),
        expert_used: 0, expert_max: EXPERT_MAX, expert_next_at: null
      });
    }

    if (rowStatus === 'ACTIVE') {
      var expiryDate = new Date(rowExpiry);
      if (now < expiryDate) {
        var meta = expertStateFromHistory(parseExpertHistory(data[i][5]), now, rowPlan);
        return respond({
          ok: true, plan: rowPlan, expiry: expiryDate.toISOString(),
          expert_used: meta.used, expert_max: meta.max, expert_next_at: meta.next_at
        });
      }
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
  var isElite = code.indexOf('ELITE') !== -1;
  var tier = isElite ? 'ELITE' : 'Pro + Expert';
  var subject = (isElite ? '💎 ELITE-розбір · ' : '★ Expert-розбір · ') + (name || 'Клієнт') + ' · ' + new Date().toLocaleDateString('uk-UA');

  var b = '═══════════════════════════════════════\n';
  b += '  VIA-L · ' + (isElite ? 'ELITE-РОЗБІР · ELITE' : 'EXPERT-РОЗБІР · Pro + Expert') + '\n';
  b += '═══════════════════════════════════════\n\n';
  b += 'Клієнт:       ' + (name  || '—') + '\n';
  b += 'Email:        ' + (email || '—') + '\n';
  b += 'Мова:         ' + lang.toUpperCase() + '\n';
  b += 'Код доступу:  ' + code + '\n';
  b += 'Дата запиту:  ' + date + '\n';
  if (d.device) b += 'Гаджет:       ' + d.device + '\n';
  b += '\n';

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
    if (d.temp)         b += 'Нічна т-ра:   ' + d.temp       + '\n';
    if (d.hotflash)     b += 'Припливи:     ' + d.hotflash   + '\n';
    if (d.hotfreq)      b += 'Частота:      ' + d.hotfreq    + '\n';
    if (d.hf_count)     b += 'Кількість:    ' + d.hf_count   + '\n';
    if (d.hf_intensity) b += 'Інтенсивність:' + d.hf_intensity + '\n';
    if (d.hf_time)      b += 'Час:          ' + d.hf_time    + '\n';
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
  if (d.stress)         b += 'Стрес:        ' + d.stress         + '\n';
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

// ── Helpers для Expert-счётчика ───────────────────────────────
// ELITE определяется по содержимому колонки B (тариф). Допустимые значения
// для ELITE: 'ELITE', 'ELITE-8W', 'ELITE-12W' и т.п. — любая строка с подстрокой ELITE.
function isElitePlan(plan) {
  return (plan || '').toString().toUpperCase().indexOf('ELITE') !== -1;
}

// Парсит колонку F. Поддерживает два формата:
//   • новый: JSON-массив ISO-дат  →  ["2026-05-01T…","2026-05-12T…"]
//   • legacy: одна ISO-дата строкой (из старой логики 1/30) → [date]
// Невалидные/пустые значения → [].
function parseExpertHistory(value) {
  if (value === null || value === undefined || value === '') return [];
  var raw = value.toString().trim();
  if (!raw) return [];
  if (raw.charAt(0) === '[') {
    try {
      var arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr.map(function (d) { return new Date(d); })
                  .filter(function (d) { return !isNaN(d.getTime()); });
      }
    } catch (e) { /* fall through to legacy */ }
  }
  var single = new Date(raw);
  return isNaN(single.getTime()) ? [] : [single];
}

// Возвращает { used: N, max: M|null, next_at: ISO|null } с учётом тарифа.
// EXPERT: окно 30 дней, max=2.
// ELITE:  без окна (вся история), max=null (детальная логика 8/12 — отдельно).
function expertStateFromHistory(history, now, plan) {
  var elite  = isElitePlan(plan);
  var recent = elite
    ? history.slice()
    : history.filter(function (d) { return (now - d) < EXPERT_WIN_MS; });
  var next_at = null;
  if (!elite && recent.length >= EXPERT_MAX) {
    var earliest = recent.reduce(function (a, b) { return a < b ? a : b; });
    next_at = new Date(earliest.getTime() + EXPERT_WIN_MS).toISOString();
  } else if (recent.length >= 1) {
    var last = recent.reduce(function (a, b) { return a > b ? a : b; });
    next_at = new Date(last.getTime() + EXPERT_COOL_MS).toISOString();
  }
  return {
    used: recent.length,
    max:  elite ? null : EXPERT_MAX,
    next_at: next_at
  };
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput('');
}
