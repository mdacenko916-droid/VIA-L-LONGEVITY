// ══════════════════════════════════════════════════════════════
// VIA-L · Google Apps Script v3.2
// — валидация кодов доступа (doGet без action)
// — приём Expert-запросов (doGet?action=expert) — image beacon
// — приём Expert-запросов (doPost) — fallback
// ══════════════════════════════════════════════════════════════
//
// СТРУКТУРА ТАБЛИЦЫ (лист 1, строка 1 = заголовки):
// A: Код  B: Тариф  C: Статус  D: Дата активации
// E: Дата истечения  F: JSON-массив дат Expert-запросов от клиента
//                       (legacy: одна ISO-дата строкой — конвертируется автоматически)
// G: JSON-массив дат отправленных клиенту PDF-отчётов (этап 7 backstage-бота)
// H: ELITE Onboarding — JSON-объект ответов на onboarding-анкету,
//    null/пусто = анкета ещё не пройдена. Используется для PRO+EXPERT и ELITE
//    (любой тариф, у которого hasExpert=true в getPlanLimits — то есть с доступом
//    к Expert-разборам нутрициолога). Анкета даёт нутрициологу контекст для PDF.
//
// Статусы: FREE → ACTIVE → EXPIRED
//
// ТАРИФЫ (значения колонки B; регистр не важен, проверяется по подстроке):
//   PRO       — Pro, без Expert-запросов; срок 30 дней.
//   ELITE-8W  — VIA-L EXPERT 8 недель (€390): 56 дней, до 8 отчётов всего, cooldown 7 дней.
//   ELITE-12W — VIA-L EXPERT 12 недель (€590): 84 дня, до 12 отчётов всего, cooldown 7 дней.
//   (Тариф EXPERT €79 «Pro+Expert» РЕТАЙРНУТ при слиянии 2026-07-25 → преемник ELITE-8W; см.
//    docs/VIA-L-EXPERT-MERGE-PLAN.md. Внутр. код тарифа остаётся ELITE-8W/12W.)
// ══════════════════════════════════════════════════════════════

var SUBSCRIPTION_DAYS = 30;                         // дефолт срока подписки PRO
var EXPERT_WIN_MS     = 30 * 24 * 60 * 60 * 1000;   // окно PRO (30 дней; исторически для расчёта)
var EXPERT_COOL_MS    = 7  * 24 * 60 * 60 * 1000;   // cooldown между разборами (7 дней; ELITE)

// ELITE — две вариации программы
var ELITE_8W_DAYS  = 56;   // 8 недель
var ELITE_12W_DAYS = 84;   // 12 недель
var ELITE_8W_MAX   = 8;    // 8 отчётов за программу
var ELITE_12W_MAX  = 12;   // 12 отчётов за программу

var MARINA_EMAIL = 'viaelcom@gmail.com';

// Backstage Telegram-бот: после каждого Expert-запроса Apps Script зовёт
// этот endpoint Cloudflare Worker, который шлёт карточку клиента нутрициологу.
var BACKSTAGE_DRAFT_URL = 'https://interpreter.viaelcom.workers.dev/draft';

// Dev-коды — обходят проверку по таблице, не ограничены лимитом.
// Используем только для разработки/тестирования бота.
var DEV_CODES = ['VIAL-PRO-2024',
                 'VIAL-ELITE-2024', 'VIAL-ELITE-8W', 'VIAL-ELITE-12W'];

// ── GET: валидация кода ИЛИ приём Expert-запроса ─────────────
function doGet(e) {
  try {
    var action = (e.parameter && e.parameter.action) || '';

    if (action === 'expert') {
      return handleExpertRequest(e.parameter);
    }

    var code = ((e.parameter && e.parameter.code) || '').toString().toUpperCase().trim();
    if (!code) return respond({ ok: false, reason: 'no_code' });
    return validateCode(code);
  } catch (err) {
    return respond({ ok: false, reason: 'error', message: err.toString() });
  }
}

// ── POST: приём Expert-запроса или отправка готового отчёта клиенту ─────
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action  = (payload && payload.action) || '';
    if (action === 'send_report')  return handleSendReport(payload);
    if (action === 'assign_code')  return handleAssignCode(payload);
    // Onboarding-анкета теперь приходит как поле `onboarding` в обычном
    // Expert-запросе (см. handleExpertRequest). Отдельного action нет.
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
  var onboarding = null;

  try {
    // GET передаёт data как строку, POST — как объект
    data = typeof p.data === 'string'         ? JSON.parse(p.data) :
           typeof p.analysisData === 'string' ? JSON.parse(p.analysisData) :
           (p.data || p.analysisData || {});
  } catch(e) { data = {}; }

  // ELITE onboarding — анкета-анамнез приходит с первым отчётом ELITE-клиента.
  try {
    onboarding = typeof p.onboarding === 'string'
      ? JSON.parse(p.onboarding)
      : (p.onboarding || null);
  } catch(e) { onboarding = null; }

  if (!code) return respond({ ok: false, reason: 'no_code' });

  // Dev-коды: отправляем письмо без проверки таблицы
  if (DEV_CODES.indexOf(code) !== -1) {
    sendExpertEmail(name, email, question, data, lang, code + ' [DEV]', onboarding);
    notifyBackstageBot({
      client_name: name, client_email: email, code: code + ' [DEV]',
      lang: lang, plan: 'DEV', week_no: null,
      question: question, data: data, onboarding: onboarding
    });
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

    // Лимиты по тарифу (см. getPlanLimits):
    //   PRO        — Expert-запросы НЕДОСТУПНЫ (отказ no_expert_access).
    //   EXPERT     — 2 разбора в окне 30 дней + cooldown 7 дней.
    //   ELITE-8W   — 8 отчётов на программу (56 дней)  + cooldown 7 дней.
    //   ELITE-12W  — 12 отчётов на программу (84 дня) + cooldown 7 дней.
    var limits = getPlanLimits(rowPlan);
    if (!limits.hasExpert) {
      return respond({ ok: false, reason: 'no_expert_access', plan: limits.plan });
    }
    var historyAll = parseExpertHistory(lastExpert);
    var recent     = limits.windowMs === Infinity
      ? historyAll.slice()
      : historyAll.filter(function (d) { return (now - d) < limits.windowMs; });

    // ① лимит исчерпан
    if (recent.length >= limits.max) {
      var nextAvailIso = null;
      var reason = limits.windowMs === Infinity ? 'program_limit' : 'monthly_limit';
      if (limits.windowMs !== Infinity) {
        var earliest = recent.reduce(function (a, b) { return a < b ? a : b; });
        nextAvailIso = new Date(earliest.getTime() + limits.windowMs).toISOString();
      }
      return respond({
        ok: false, reason: reason,
        next_date: nextAvailIso,
        used: recent.length, max: limits.max
      });
    }

    // ② cooldown между запросами — для всех тарифов
    if (recent.length >= 1) {
      var last = recent.reduce(function (a, b) { return a > b ? a : b; });
      if ((now - last) < limits.cooldownMs) {
        var nextCool = new Date(last.getTime() + limits.cooldownMs);
        return respond({
          ok: false, reason: 'cooldown_7d',
          next_date: nextCool.toISOString(),
          used: recent.length, max: limits.max
        });
      }
    }

    // ③ запрос принят — добавляем в полную историю, сохраняем массив, шлём письмо
    historyAll.push(now);
    recent.push(now);
    sheet.getRange(i + 1, 6).setValue(JSON.stringify(
      historyAll.map(function (d) { return d.toISOString(); })
    ));
    // Onboarding (PRO+EXPERT и ELITE): если анкета пришла с этим отчётом —
    // сохраняем в колонку H один раз; повторные отчёты не перетирают первую анкету.
    if (onboarding && !(rows[i][7] && rows[i][7].toString().trim())) {
      sheet.getRange(i + 1, 8).setValue(JSON.stringify({
        completed_at: now.toISOString(),
        lang: lang, client_name: name, client_email: email,
        answers: onboarding
      }));
    }
    sendExpertEmail(name, email, question, data, lang, code, onboarding);
    notifyBackstageBot({
      client_name: name, client_email: email, code: code,
      lang: lang, plan: limits.plan, week_no: recent.length,
      question: question, data: data, onboarding: onboarding
    });
    return respond({
      ok: true,
      used: recent.length,
      max: limits.max,
      next_available_at: new Date(now.getTime() + limits.cooldownMs).toISOString()
    });
  }

  return respond({ ok: false, reason: 'invalid' });
}

// ── Выдача кода для тарифа (вызывается Cloudflare Worker после оплаты) ───
function handleAssignCode(p) {
  var tier = (p.tier || '').toString().toUpperCase().trim();
  if (!tier) return respond({ ok: false, reason: 'no_tier' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data  = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var rowCode   = (data[i][0] || '').toString().trim();
    var rowTier   = (data[i][1] || '').toString().toUpperCase().trim();
    var rowStatus = (data[i][2] || '').toString().toUpperCase().trim();

    if (rowTier !== tier)    continue;
    if (rowStatus !== 'FREE') continue;

    sheet.getRange(i + 1, 3).setValue('ASSIGNED');
    sheet.getRange(i + 1, 4).setValue(new Date().toISOString());
    return respond({ ok: true, code: rowCode, tier: rowTier });
  }

  return respond({ ok: false, reason: 'no_codes_available', tier: tier });
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

    if (rowStatus === 'FREE' || rowStatus === 'ASSIGNED') {
      var limitsFree = getPlanLimits(rowPlan);
      var expiry = new Date(now.getTime() + limitsFree.subscriptionDays * 24 * 60 * 60 * 1000);
      sheet.getRange(i + 1, 3).setValue('ACTIVE');
      sheet.getRange(i + 1, 4).setValue(now.toISOString());
      sheet.getRange(i + 1, 5).setValue(expiry.toISOString());
      return respond({
        ok: true, plan: rowPlan, expiry: expiry.toISOString(),
        expert_used: 0, expert_max: limitsFree.max, expert_next_at: null,
        // При первой активации для тарифов с Expert-разборами (PRO+EXPERT, ELITE) —
        // анкета обязательна, чтобы нутрициолог получил контекст до первого PDF.
        onboarding_required: limitsFree.hasExpert
      });
    }

    if (rowStatus === 'ACTIVE') {
      var expiryDate = new Date(rowExpiry);
      if (now < expiryDate) {
        var meta = expertStateFromHistory(parseExpertHistory(data[i][5]), now, rowPlan);
        var planLimits = getPlanLimits(rowPlan);
        // Колонка H (index 7) — JSON-объект onboarding-ответов; пусто = ещё не пройден.
        var onboardingDone = !!(data[i][7] && data[i][7].toString().trim());
        return respond({
          ok: true, plan: rowPlan, expiry: expiryDate.toISOString(),
          expert_used: meta.used, expert_max: meta.max, expert_next_at: meta.next_at,
          onboarding_required: planLimits.hasExpert && !onboardingDone
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

// ── Отправка письма нутрициологу + подтверждение клиенту ─────
// Принцип языков:
//   • Письмо нутрициологу (MARINA_EMAIL) — ВСЕГДА на русском, без эмодзи
//     (Gmail в plain-text портит некоторые эмодзи на ряде клиентов).
//   • Подтверждение клиенту — на ЕГО языке (12 языков из CLIENT_CONFIRM).
//
// onboarding (опционально) — JSON-объект ELITE-анкеты-анамнеза, приходит
// один раз с первым отчётом ELITE-клиента.
function sendExpertEmail(name, email, question, d, lang, code, onboarding) {
  var date = new Date().toLocaleString('ru-RU');
  var isElite = code.indexOf('ELITE') !== -1;
  var subject = 'VIA-L EXPERT-разбор · ' + (name || 'Клиент') + ' · ' + new Date().toLocaleDateString('ru-RU');

  var b = '═══════════════════════════════════════\n';
  b += '  VIA-L · VIA-L EXPERT-РАЗБОР\n';
  b += '═══════════════════════════════════════\n\n';
  b += 'Клиент:       ' + (name  || '—') + '\n';
  b += 'Email:        ' + (email || '—') + '\n';
  b += 'Язык:         ' + lang.toUpperCase() + '\n';
  b += 'Код доступа:  ' + code + '\n';
  b += 'Дата запроса: ' + date + '\n';
  if (d.device) b += 'Гаджет:       ' + d.device + '\n';
  b += '\n';

  if (question) {
    b += '─── ВОПРОС КЛИЕНТА ──────────────────\n';
    b += question + '\n\n';
  }

  b += '─── ПРОФИЛЬ ─────────────────────────\n';
  b += 'Пол:   ' + (d.gender === 'male' ? 'Мужчина' : 'Женщина') + '\n';
  b += 'Фаза:  ' + (d.phase || '—') + '\n';
  if (d.age)    b += 'Возраст: ' + d.age    + ' лет\n';
  if (d.weight) b += 'Вес:     ' + d.weight + ' кг\n';
  if (d.height) b += 'Рост:    ' + d.height + ' см\n';

  b += '\n─── ОСНОВНЫЕ ПОКАЗАТЕЛИ ─────────────\n';
  b += 'HRV:          ' + d.hrv + ' мс';
  if (d.hrv_trend) b += '  (тренд: ' + d.hrv_trend + (d.hrv_dur ? ', ' + d.hrv_dur : '') + ')';
  b += '\n';
  b += 'ЧСС покоя:    ' + d.rhr + ' уд/мин';
  if (d.rhr_comp) b += '  (' + d.rhr_comp + ')';
  b += '\n';
  b += 'Качество сна: ' + d.sleep_qual + '/10\n';
  if (d.deep)  b += 'Глубокий сон: ' + d.deep + '\n';
  if (d.wake)  b += 'Пробуждения:  ' + d.wake + '\n';
  b += 'Энергия:      ' + d.energy  + '/10\n';
  b += 'Тревога:      ' + d.anxiety + '/10\n';
  if (d.resp_rate) b += 'ЧД:           ' + d.resp_rate + ' дых/мин\n';

  if (d.temp || d.hotflash) {
    b += '\n─── ТЕМПЕРАТУРА / ПРИЛИВЫ ───────────\n';
    if (d.temp)         b += 'Ночная т-ра:  ' + d.temp       + '\n';
    if (d.hotflash)     b += 'Приливы:      ' + d.hotflash   + '\n';
    if (d.hotfreq)      b += 'Частота:      ' + d.hotfreq    + '\n';
    if (d.hf_count)     b += 'Количество:   ' + d.hf_count   + '\n';
    if (d.hf_intensity) b += 'Интенсивность:' + d.hf_intensity + '\n';
    if (d.hf_time)      b += 'Время:        ' + d.hf_time    + '\n';
  }

  if (d.symptoms && d.symptoms.length) {
    b += '\n─── СИМПТОМЫ ────────────────────────\n';
    b += d.symptoms.join(', ') + '\n';
  }
  if (d.horm_symptoms && d.horm_symptoms.length) {
    b += 'Гормональные: ' + d.horm_symptoms.join(', ') + '\n';
    if (d.horm_intensity) b += 'Интенсивность:' + d.horm_intensity + '\n';
  }

  b += '\n─── КОГНИЦИЯ ────────────────────────\n';
  if (d.memory)  b += 'Память:       ' + d.memory  + '\n';
  if (d.fog)     b += 'Туман:        ' + d.fog     + '\n';
  if (d.cogndur) b += 'Длительность: ' + d.cogndur + '\n';

  b += '\n─── ПИТАНИЕ ─────────────────────────\n';
  if (d.appetite)       b += 'Аппетит:      ' + d.appetite       + '\n';
  if (d.eating_pattern) b += 'Режим:        ' + d.eating_pattern + '\n';
  if (d.protein_intake) b += 'Белок:        ' + d.protein_intake + '\n';
  if (d.alc)            b += 'Алкоголь:     ' + d.alc            + '\n';

  b += '\n─── АКТИВНОСТЬ ──────────────────────\n';
  if (d.act_types && d.act_types.length) b += 'Типы:         ' + d.act_types.join(', ') + '\n';
  if (d.act_freq)     b += 'Частота:      ' + d.act_freq     + '\n';
  if (d.act_recovery) b += 'Восстановление:' + d.act_recovery + '\n';

  if (d.supplements && d.supplements.length) {
    b += '\n─── ДОБАВКИ ─────────────────────────\n';
    b += d.supplements.join(', ') + '\n';
  }
  if (d.meds) b += 'Лекарства:    ' + d.meds + '\n';

  b += '\n─── СТРЕСС / НАСТРОЕНИЕ ─────────────\n';
  if (d.stress)         b += 'Стресс:       ' + d.stress         + '\n';
  if (d.chronic_stress) b += 'Хрон. стресс: ' + d.chronic_stress + '\n';
  if (d.cortisol_symp && d.cortisol_symp.length) b += 'Кортизол:     ' + d.cortisol_symp.join(', ') + '\n';
  if (d.mood)        b += 'Настроение:   ' + d.mood        + '\n';
  if (d.irritability) b += 'Раздражительность:' + d.irritability + '\n';

  if (d.cycle_status || d.last_period) {
    b += '\n─── ЦИКЛ ────────────────────────────\n';
    if (d.cycle_status) b += 'Цикл:         ' + d.cycle_status + '\n';
    if (d.last_period)  b += 'Последняя м-я:' + d.last_period  + '\n';
    if (d.pms)          b += 'ПМС:          ' + d.pms          + '\n';
  }

  if (d.vitality || d.weekly_trend) {
    b += '\n─── НЕДЕЛЬНЫЙ ТРЕНД ─────────────────\n';
    if (d.vitality)     b += 'Витальность:  ' + d.vitality     + '\n';
    if (d.weekly_trend) b += 'Тренд:        ' + d.weekly_trend + '\n';
    if (d.weekly_changes && d.weekly_changes.length) b += 'Изменения:    ' + d.weekly_changes.join(', ') + '\n';
    if (d.events && d.events.length)                 b += 'События:      ' + d.events.join(', ')          + '\n';
  }

  if (d.bio) {
    var bio = d.bio;
    if (bio.fat || bio.muscle || bio.bmi || bio.bioage) {
      b += '\n─── БИОИМПЕДАНС ─────────────────────\n';
      if (bio.fat)      b += 'Жир:          ' + bio.fat      + '%\n';
      if (bio.muscle)   b += 'Мышцы:        ' + bio.muscle   + '%\n';
      if (bio.visceral) b += 'Висцер. жир:  ' + bio.visceral + '\n';
      if (bio.water)    b += 'Вода:         ' + bio.water    + '%\n';
      if (bio.bmi)      b += 'ИМТ:          ' + bio.bmi      + '\n';
      if (bio.bmr)      b += 'ОО:           ' + bio.bmr      + ' ккал\n';
      if (bio.bioage)   b += 'Биовозраст:   ' + bio.bioage   + '\n';
    }
  }

  if (d.labs) {
    var labs = d.labs;
    if (labs.vitd || labs.ferr || labs.tsh || labs.e2 || labs.prog || labs.test || labs.cort || labs.b12) {
      b += '\n─── АНАЛИЗЫ ─────────────────────────\n';
      if (labs.vitd) b += 'Вит. D:       ' + labs.vitd + ' нг/мл\n';
      if (labs.ferr) b += 'Ферритин:     ' + labs.ferr + ' нг/мл\n';
      if (labs.tsh)  b += 'ТТГ:          ' + labs.tsh  + ' мМЕ/л\n';
      if (labs.e2)   b += 'Эстрадиол:    ' + labs.e2   + ' пмоль/л\n';
      if (labs.prog) b += 'Прогестерон:  ' + labs.prog + '\n';
      if (labs.test) b += 'Тестостерон:  ' + labs.test + '\n';
      if (labs.cort) b += 'Кортизол:     ' + labs.cort + '\n';
      if (labs.b12)  b += 'Вит. B12:     ' + labs.b12  + '\n';
    }
  }

  // ELITE onboarding — анкета приходит ОДИН РАЗ с первым отчётом ELITE-клиента.
  if (onboarding) {
    b += '\n═══════════════════════════════════════\n';
    b += '  ELITE ONBOARDING · НАЧАЛЬНАЯ АНКЕТА\n';
    b += '═══════════════════════════════════════\n';
    var addOnb = function (label, val) {
      if (val === null || val === undefined || val === '') return;
      if (Array.isArray(val)) val = val.join(', ');
      b += '\n─── ' + label + ' ───\n' + val + '\n';
    };
    addOnb('ГЛАВНАЯ ЦЕЛЬ',                onboarding.goal);
    addOnb('ОПЫТ (что пробовали)',        onboarding.experience);
    addOnb('ПРИОРИТЕТ',                   onboarding.priority);
    addOnb('TELEGRAM',                    onboarding.telegram);
    addOnb('ЧАСОВОЙ ПОЯС',                onboarding.timezone);
    addOnb('ХРОНИЧЕСКИЕ ЗАБОЛЕВАНИЯ',     onboarding.chronic);
    addOnb('ЛЕКАРСТВА',                   onboarding.medications);
    addOnb('АЛЛЕРГИИ',                    onboarding.allergies);
    addOnb('АУТОИММУННЫЕ ЗАБОЛЕВАНИЯ',    onboarding.autoimmune);
    addOnb('ИЗЖОГА / ТЯЖЕСТЬ ПОСЛЕ ЕДЫ',  onboarding.heartburn);
    addOnb('ИПП (омепразол и др.)',       onboarding.ppi);
    addOnb('ИПП — препарат и дозировка',  onboarding.ppi_detail);
    addOnb('АНТИБИОТИКИ за 6 мес',        onboarding.antibiotics);
    addOnb('УДАЛЁН ЖЕЛЧНЫЙ ПУЗЫРЬ',       onboarding.gallbladder);
    addOnb('ОПЫТ С БАДами',               onboarding.supplements_history);
    b += '\n';
  }

  b += '\n═══════════════════════════════════════\n';
  b += 'Ответ клиенту отправить на: ' + (email || '—') + '\n';
  b += '═══════════════════════════════════════\n';

  GmailApp.sendEmail(MARINA_EMAIL, subject, b);

  // ── Подтверждение клиенту на ЕГО языке + ссылка на полную анкету ──
  if (email) {
    var conf = CLIENT_CONFIRM[lang] || CLIENT_CONFIRM.en;
    var greet = conf.greet + (name ? ', ' + name : '') + '!';
    // Полная анкета здоровья: клиент получает её СРАЗУ, на своём языке. Код «приклеен»
    // к ссылке (?code=<код>) — чтобы заполненная анкета и переписка в Telegram сошлись
    // в ОДИН топик у нутрициолога. Доходит сюда только EXPERT/ELITE (у PRO нет доступа).
    var cleanCode = code.replace(/\s*\[DEV\]\s*/i, '').trim();
    var anketaUrl = 'https://via-l.com/book/anketa/?code=' + encodeURIComponent(cleanCode) + '&lang=' + encodeURIComponent(lang);
    var inv = ANKETA_INVITE[lang] || ANKETA_INVITE.en;
    var cb = greet + '\n\n' + conf.body + '\n\n' + inv + '\n' + anketaUrl + '\n\n' + conf.signoff + '\nКоманда VIA-L · viaelcom@gmail.com';
    GmailApp.sendEmail(email, conf.subject, cb);
  }
}

// ── Подтверждение клиенту: 12 языков ─────────────────────────
// Получает клиент сразу после отправки Expert/ELITE-запроса.
// Подпись намеренно обезличенная: «Команда VIA-L», без личного имени.
var CLIENT_CONFIRM = {
  ru: { subject: 'Ваш запрос принят · VIA-L', greet: 'Здравствуйте',           body: 'Мы получили ваш запрос. Нутрициолог подготовит персональный письменный разбор в течение 48 часов.',                       signoff: 'С уважением,' },
  uk: { subject: 'Ваш запит прийнято · VIA-L', greet: 'Вітаємо',                body: 'Ми отримали ваш запит. Нутриціолог підготує персональний письмовий розбір протягом 48 годин.',                            signoff: 'З повагою,' },
  en: { subject: 'Your request received · VIA-L', greet: 'Hello',               body: 'We received your request. Your nutritionist will prepare a personalised written review within 48 hours.',                  signoff: 'Best regards,' },
  es: { subject: 'Tu solicitud recibida · VIA-L', greet: 'Hola',                body: 'Hemos recibido tu solicitud. El nutricionista preparará un análisis personalizado por escrito en un plazo de 48 horas.',  signoff: 'Un saludo,' },
  de: { subject: 'Ihre Anfrage erhalten · VIA-L', greet: 'Hallo',               body: 'Wir haben Ihre Anfrage erhalten. Die Ernährungsberaterin erstellt innerhalb von 48 Stunden eine persönliche Analyse.',     signoff: 'Mit freundlichen Grüßen,' },
  pt: { subject: 'Sua solicitação recebida · VIA-L', greet: 'Olá',              body: 'Recebemos sua solicitação. A nutricionista preparará uma análise personalizada por escrito em até 48 horas.',              signoff: 'Atenciosamente,' },
  fr: { subject: 'Votre demande reçue · VIA-L', greet: 'Bonjour',               body: 'Nous avons reçu votre demande. La nutritionniste préparera une analyse personnalisée par écrit sous 48 heures.',            signoff: 'Cordialement,' },
  pl: { subject: 'Otrzymaliśmy Twoje zgłoszenie · VIA-L', greet: 'Witaj',       body: 'Otrzymaliśmy Twoje zgłoszenie. Dietetyk przygotuje osobistą pisemną analizę w ciągu 48 godzin.',                          signoff: 'Z poważaniem,' },
  it: { subject: 'La tua richiesta ricevuta · VIA-L', greet: 'Ciao',            body: 'Abbiamo ricevuto la tua richiesta. La nutrizionista preparerà un\'analisi personalizzata per iscritto entro 48 ore.',     signoff: 'Cordiali saluti,' },
  he: { subject: 'בקשתך התקבלה · VIA-L', greet: 'שלום',                          body: 'קיבלנו את בקשתך. התזונאית תכין ניתוח אישי בכתב תוך 48 שעות.',                                                          signoff: 'בברכה,' },
  ja: { subject: 'リクエストを受け付けました · VIA-L', greet: 'こんにちは',         body: 'リクエストを受け付けました。栄養士が48時間以内にパーソナルな書面分析を作成します。',                                signoff: '敬具' },
  ko: { subject: '요청이 접수되었습니다 · VIA-L', greet: '안녕하세요',              body: '요청을 받았습니다. 영양사가 48시간 이내에 개인 맞춤형 서면 분석을 준비할 것입니다.',                                signoff: '감사합니다,' }
};

// ── Приглашение заполнить полную анкету здоровья (12 языков) ──
// Идёт строкой в письме-подтверждении вместе со ссылкой ?code=<код>.
var ANKETA_INVITE = {
  ru: 'Чтобы разбор был максимально точным, заполните, пожалуйста, анкету здоровья (можно в несколько заходов):',
  uk: 'Щоб розбір був максимально точним, заповніть, будь ласка, анкету здоров’я (можна в кілька заходів):',
  en: 'To make your review as precise as possible, please fill in the health questionnaire (you can do it in several sittings):',
  es: 'Para que tu análisis sea lo más preciso posible, completa el cuestionario de salud (puedes hacerlo en varias veces):',
  de: 'Damit Ihre Analyse möglichst genau wird, füllen Sie bitte den Gesundheitsfragebogen aus (gern in mehreren Schritten):',
  pt: 'Para que sua análise seja a mais precisa possível, preencha o questionário de saúde (pode fazer em várias etapas):',
  fr: 'Pour que votre analyse soit la plus précise possible, remplissez le questionnaire de santé (vous pouvez le faire en plusieurs fois) :',
  pl: 'Aby analiza była jak najdokładniejsza, wypełnij ankietę zdrowia (możesz w kilku podejściach):',
  it: 'Per rendere la tua analisi il più precisa possibile, compila il questionario sulla salute (puoi farlo in più volte):',
  he: 'כדי שהניתוח יהיה מדויק ככל האפשר, אנא מלא/י את שאלון הבריאות (אפשר בכמה פעמים):',
  ja: '分析をできるだけ正確にするため、健康問診票のご記入をお願いします（数回に分けてもOKです）：',
  ko: '분석을 최대한 정확하게 하기 위해 건강 설문지를 작성해 주세요(여러 번에 나눠 작성해도 됩니다):'
};

// ── Helpers для тарифов и Expert-счётчика ─────────────────────
// Возвращает параметры тарифа по содержимому колонки B.
//   { plan, subscriptionDays, max, windowMs, cooldownMs, isElite, hasExpert }
// Все ELITE-программы используют windowMs=Infinity (лимит на всю программу).
// EXPERT использует windowMs=30 дней.
// PRO не имеет доступа к Expert-запросам (hasExpert=false).
function getPlanLimits(plan) {
  var p = (plan || '').toString().toUpperCase().trim();
  if (p.indexOf('ELITE-12') !== -1 || p === 'ELITE12W' || p === 'ELITE-12W') {
    return { plan: 'ELITE-12W', subscriptionDays: ELITE_12W_DAYS,
             max: ELITE_12W_MAX, windowMs: Infinity, cooldownMs: EXPERT_COOL_MS,
             isElite: true, hasExpert: true };
  }
  if (p.indexOf('ELITE') !== -1) {  // ELITE / ELITE-8W / ELITE8W → 8W
    return { plan: 'ELITE-8W', subscriptionDays: ELITE_8W_DAYS,
             max: ELITE_8W_MAX, windowMs: Infinity, cooldownMs: EXPERT_COOL_MS,
             isElite: true, hasExpert: true };
  }
  if (p === 'PRO') {
    return { plan: 'PRO', subscriptionDays: SUBSCRIPTION_DAYS,
             max: 0, windowMs: EXPERT_WIN_MS, cooldownMs: EXPERT_COOL_MS,
             isElite: false, hasExpert: false };
  }
  // По умолчанию (легаси EXPERT / старые MAX в существующих записях) → VIA-L EXPERT (ELITE-8W).
  // Тариф EXPERT €79 ретайрнут при слиянии → его преемник = ELITE-8W (см. docs/VIA-L-EXPERT-MERGE-PLAN.md).
  return { plan: 'ELITE-8W', subscriptionDays: ELITE_8W_DAYS,
           max: ELITE_8W_MAX, windowMs: Infinity, cooldownMs: EXPERT_COOL_MS,
           isElite: true, hasExpert: true };
}

// Старый алиас оставлен для совместимости с прежним кодом.
function isElitePlan(plan) { return getPlanLimits(plan).isElite; }

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

// Возвращает { used: N, max: M, next_at: ISO|null } с учётом тарифа.
function expertStateFromHistory(history, now, plan) {
  var limits = getPlanLimits(plan);
  var recent = limits.windowMs === Infinity
    ? history.slice()
    : history.filter(function (d) { return (now - d) < limits.windowMs; });
  var next_at = null;
  if (recent.length >= limits.max) {
    if (limits.windowMs === Infinity) {
      // Лимит программы исчерпан — следующая дата неприменима до окончания программы.
      next_at = null;
    } else {
      var earliest = recent.reduce(function (a, b) { return a < b ? a : b; });
      next_at = new Date(earliest.getTime() + limits.windowMs).toISOString();
    }
  } else if (recent.length >= 1) {
    var last = recent.reduce(function (a, b) { return a > b ? a : b; });
    next_at = new Date(last.getTime() + limits.cooldownMs).toISOString();
  }
  return { used: recent.length, max: limits.max, next_at: next_at };
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ════════════════════════════════════════════════════════════════
// SEND REPORT (этап 5–6 backstage-бота)
// ════════════════════════════════════════════════════════════════
// Принимает POST от Cloudflare Worker после того как нутрициолог нажал
// «✅ Отправить клиенту». Worker уже перевёл текст на язык клиента.
// Здесь: собираем Google Doc → PDF → отправляем клиенту email-ом.

// Локализованные заголовки PDF-отчёта.
var REPORT_LABELS = {
  ru: { subject: 'Ваш персональный разбор · VIA-L', greeting: 'Здравствуйте', intro: 'Ваш персональный разбор от нутрициолога VIA-L во вложении.', email_body: 'Ваш разбор готов. Подробности в PDF-файле во вложении.\n\nС уважением,\nКоманда VIA-L · viaelcom@gmail.com', title: 'Персональный разбор VIA-L', date: 'Дата', plan: 'Тариф', week: 'неделя', profile: 'Профиль', age: 'возраст', gender_f: 'женский', gender_m: 'мужской', phase: 'фаза', device: 'Источник данных', biometrics: 'Биометрия', symptoms: 'Симптомы', client_question: 'Ваш вопрос', report: 'Разбор нутрициолога', signature: 'С уважением, команда VIA-L · viaelcom@gmail.com', disclaimer: 'Этот документ носит информационный характер и не заменяет очную консультацию врача.', bio_hrv: 'ВСР', bio_rhr: 'ЧСС покоя', bio_sleep: 'Сон', bio_deep: 'Глубокий сон', bio_energy: 'Энергия', bio_anxiety: 'Тревога' },
  uk: { subject: 'Ваш персональний розбір · VIA-L', greeting: 'Вітаємо', intro: 'Ваш персональний розбір від нутриціолога VIA-L у вкладенні.', email_body: 'Ваш розбір готовий. Деталі в PDF-файлі у вкладенні.\n\nЗ повагою,\nКоманда VIA-L · viaelcom@gmail.com', title: 'Персональний розбір VIA-L', date: 'Дата', plan: 'Тариф', week: 'тиждень', profile: 'Профіль', age: 'вік', gender_f: 'жіноча', gender_m: 'чоловіча', phase: 'фаза', device: 'Джерело даних', biometrics: 'Біометрія', symptoms: 'Симптоми', client_question: 'Ваше питання', report: 'Розбір нутриціолога', signature: 'З повагою, команда VIA-L · viaelcom@gmail.com', disclaimer: 'Цей документ має інформаційний характер і не замінює очну консультацію лікаря.', bio_hrv: 'ВСР', bio_rhr: 'ЧСС спокою', bio_sleep: 'Сон', bio_deep: 'Глибокий сон', bio_energy: 'Енергія', bio_anxiety: 'Тривога' },
  en: { subject: 'Your personal report · VIA-L', greeting: 'Hello', intro: 'Your personal report from a VIA-L nutritionist is attached.', email_body: 'Your report is ready. See the attached PDF for details.\n\nBest regards,\nThe VIA-L team · viaelcom@gmail.com', title: 'VIA-L Personal Report', date: 'Date', plan: 'Plan', week: 'week', profile: 'Profile', age: 'age', gender_f: 'female', gender_m: 'male', phase: 'phase', device: 'Data source', biometrics: 'Biometrics', symptoms: 'Symptoms', client_question: 'Your question', report: 'Nutritionist report', signature: 'Best regards, the VIA-L team · viaelcom@gmail.com', disclaimer: 'This document is informational and does not replace an in-person medical consultation.', bio_hrv: 'HRV', bio_rhr: 'Resting HR', bio_sleep: 'Sleep', bio_deep: 'Deep sleep', bio_energy: 'Energy', bio_anxiety: 'Anxiety' },
  es: { subject: 'Tu informe personal · VIA-L', greeting: 'Hola', intro: 'Tu informe personal del nutricionista VIA-L está adjunto.', email_body: 'Tu informe está listo. Detalles en el PDF adjunto.\n\nUn saludo,\nEl equipo VIA-L · viaelcom@gmail.com', title: 'Informe personal VIA-L', date: 'Fecha', plan: 'Plan', week: 'semana', profile: 'Perfil', age: 'edad', gender_f: 'femenino', gender_m: 'masculino', phase: 'fase', device: 'Fuente de datos', biometrics: 'Biometría', symptoms: 'Síntomas', client_question: 'Tu pregunta', report: 'Informe del nutricionista', signature: 'Un saludo, el equipo VIA-L · viaelcom@gmail.com', disclaimer: 'Este documento es informativo y no sustituye una consulta médica presencial.', bio_hrv: 'VFC', bio_rhr: 'FC en reposo', bio_sleep: 'Sueño', bio_deep: 'Sueño profundo', bio_energy: 'Energía', bio_anxiety: 'Ansiedad' },
  de: { subject: 'Ihr persönlicher Bericht · VIA-L', greeting: 'Hallo', intro: 'Ihr persönlicher Bericht von der VIA-L Ernährungsberaterin ist beigefügt.', email_body: 'Ihr Bericht ist fertig. Details im angehängten PDF.\n\nMit freundlichen Grüßen,\nDas VIA-L Team · viaelcom@gmail.com', title: 'VIA-L Persönlicher Bericht', date: 'Datum', plan: 'Tarif', week: 'Woche', profile: 'Profil', age: 'Alter', gender_f: 'weiblich', gender_m: 'männlich', phase: 'Phase', device: 'Datenquelle', biometrics: 'Biometrie', symptoms: 'Symptome', client_question: 'Ihre Frage', report: 'Bericht der Ernährungsberaterin', signature: 'Mit freundlichen Grüßen, das VIA-L Team · viaelcom@gmail.com', disclaimer: 'Dieses Dokument ist informativ und ersetzt keine ärztliche Konsultation vor Ort.', bio_hrv: 'HRV', bio_rhr: 'Ruhepuls', bio_sleep: 'Schlaf', bio_deep: 'Tiefschlaf', bio_energy: 'Energie', bio_anxiety: 'Angst' },
  pt: { subject: 'Seu relatório pessoal · VIA-L', greeting: 'Olá', intro: 'Seu relatório pessoal da nutricionista VIA-L está em anexo.', email_body: 'Seu relatório está pronto. Detalhes no PDF em anexo.\n\nAtenciosamente,\nEquipe VIA-L · viaelcom@gmail.com', title: 'Relatório Pessoal VIA-L', date: 'Data', plan: 'Plano', week: 'semana', profile: 'Perfil', age: 'idade', gender_f: 'feminino', gender_m: 'masculino', phase: 'fase', device: 'Fonte de dados', biometrics: 'Biometria', symptoms: 'Sintomas', client_question: 'Sua pergunta', report: 'Relatório da nutricionista', signature: 'Atenciosamente, equipe VIA-L · viaelcom@gmail.com', disclaimer: 'Este documento é informativo e não substitui consulta médica presencial.', bio_hrv: 'VFC', bio_rhr: 'FC em repouso', bio_sleep: 'Sono', bio_deep: 'Sono profundo', bio_energy: 'Energia', bio_anxiety: 'Ansiedade' },
  fr: { subject: 'Votre bilan personnel · VIA-L', greeting: 'Bonjour', intro: 'Votre bilan personnel de la nutritionniste VIA-L est en pièce jointe.', email_body: "Votre bilan est prêt. Détails dans le PDF en pièce jointe.\n\nCordialement,\nL'équipe VIA-L · viaelcom@gmail.com", title: 'Bilan personnel VIA-L', date: 'Date', plan: 'Forfait', week: 'semaine', profile: 'Profil', age: 'âge', gender_f: 'féminin', gender_m: 'masculin', phase: 'phase', device: 'Source des données', biometrics: 'Biométrie', symptoms: 'Symptômes', client_question: 'Votre question', report: 'Bilan de la nutritionniste', signature: 'Cordialement, l\'équipe VIA-L · viaelcom@gmail.com', disclaimer: 'Ce document est informatif et ne remplace pas une consultation médicale en présentiel.', bio_hrv: 'VFC', bio_rhr: 'FC au repos', bio_sleep: 'Sommeil', bio_deep: 'Sommeil profond', bio_energy: 'Énergie', bio_anxiety: 'Anxiété' },
  pl: { subject: 'Twój osobisty raport · VIA-L', greeting: 'Witaj', intro: 'Twój osobisty raport od dietetyka VIA-L jest w załączniku.', email_body: 'Twój raport jest gotowy. Szczegóły w załączonym PDF.\n\nZ poważaniem,\nZespół VIA-L · viaelcom@gmail.com', title: 'Osobisty raport VIA-L', date: 'Data', plan: 'Plan', week: 'tydzień', profile: 'Profil', age: 'wiek', gender_f: 'kobieta', gender_m: 'mężczyzna', phase: 'faza', device: 'Źródło danych', biometrics: 'Biometria', symptoms: 'Objawy', client_question: 'Twoje pytanie', report: 'Raport dietetyka', signature: 'Z poważaniem, zespół VIA-L · viaelcom@gmail.com', disclaimer: 'Ten dokument ma charakter informacyjny i nie zastępuje konsultacji lekarskiej.', bio_hrv: 'HRV', bio_rhr: 'Tętno spoczynkowe', bio_sleep: 'Sen', bio_deep: 'Głęboki sen', bio_energy: 'Energia', bio_anxiety: 'Niepokój' },
  it: { subject: 'Il tuo report personale · VIA-L', greeting: 'Ciao', intro: 'Il tuo report personale della nutrizionista VIA-L è in allegato.', email_body: 'Il tuo report è pronto. Dettagli nel PDF allegato.\n\nCordiali saluti,\nIl team VIA-L · viaelcom@gmail.com', title: 'Report personale VIA-L', date: 'Data', plan: 'Piano', week: 'settimana', profile: 'Profilo', age: 'età', gender_f: 'femminile', gender_m: 'maschile', phase: 'fase', device: 'Fonte dei dati', biometrics: 'Biometria', symptoms: 'Sintomi', client_question: 'La tua domanda', report: 'Report della nutrizionista', signature: 'Cordiali saluti, il team VIA-L · viaelcom@gmail.com', disclaimer: 'Questo documento è informativo e non sostituisce una consultazione medica in presenza.', bio_hrv: 'VFC', bio_rhr: 'FC a riposo', bio_sleep: 'Sonno', bio_deep: 'Sonno profondo', bio_energy: 'Energia', bio_anxiety: 'Ansia' },
  he: { subject: 'הדוח האישי שלך · VIA-L', greeting: 'שלום', intro: 'הדוח האישי שלך מהתזונאית של VIA-L מצורף.', email_body: 'הדוח שלך מוכן. פרטים בקובץ PDF המצורף.\n\nבברכה,\nצוות VIA-L · viaelcom@gmail.com', title: 'דוח אישי VIA-L', date: 'תאריך', plan: 'תוכנית', week: 'שבוע', profile: 'פרופיל', age: 'גיל', gender_f: 'נקבה', gender_m: 'זכר', phase: 'שלב', device: 'מקור נתונים', biometrics: 'ביומטריה', symptoms: 'תסמינים', client_question: 'השאלה שלך', report: 'דוח התזונאית', signature: 'בברכה, צוות VIA-L · viaelcom@gmail.com', disclaimer: 'מסמך זה הוא מידעי בלבד ואינו מחליף ייעוץ רפואי פנים אל פנים.', bio_hrv: 'HRV', bio_rhr: 'דופק במנוחה', bio_sleep: 'שינה', bio_deep: 'שינה עמוקה', bio_energy: 'אנרגיה', bio_anxiety: 'חרדה' },
  ja: { subject: 'パーソナルレポート · VIA-L', greeting: 'こんにちは', intro: 'VIA-Lの栄養士からのパーソナルレポートが添付されています。', email_body: 'レポートの準備ができました。添付のPDFをご覧ください。\n\n敬具\nVIA-Lチーム · viaelcom@gmail.com', title: 'VIA-L パーソナルレポート', date: '日付', plan: 'プラン', week: '週', profile: 'プロフィール', age: '年齢', gender_f: '女性', gender_m: '男性', phase: '段階', device: 'データソース', biometrics: 'バイオメトリクス', symptoms: '症状', client_question: 'あなたの質問', report: '栄養士のレポート', signature: '敬具、VIA-Lチーム · viaelcom@gmail.com', disclaimer: 'この文書は情報提供のみを目的としており、対面での医療相談に代わるものではありません。', bio_hrv: 'HRV', bio_rhr: '安静時心拍', bio_sleep: '睡眠', bio_deep: '深い睡眠', bio_energy: 'エネルギー', bio_anxiety: '不安' },
  ko: { subject: '귀하의 개인 보고서 · VIA-L', greeting: '안녕하세요', intro: 'VIA-L 영양사의 개인 보고서가 첨부되어 있습니다.', email_body: '보고서가 준비되었습니다. 첨부된 PDF에서 자세한 내용을 확인하세요.\n\n감사합니다\nVIA-L 팀 · viaelcom@gmail.com', title: 'VIA-L 개인 보고서', date: '날짜', plan: '요금제', week: '주', profile: '프로필', age: '나이', gender_f: '여성', gender_m: '남성', phase: '단계', device: '데이터 소스', biometrics: '바이오메트릭', symptoms: '증상', client_question: '귀하의 질문', report: '영양사 보고서', signature: '감사합니다, VIA-L 팀 · viaelcom@gmail.com', disclaimer: '이 문서는 정보 제공용이며 대면 의료 상담을 대체하지 않습니다.', bio_hrv: 'HRV', bio_rhr: '안정 심박수', bio_sleep: '수면', bio_deep: '깊은 수면', bio_energy: '에너지', bio_anxiety: '불안' }
};

function reportLabels(lang) {
  return REPORT_LABELS[lang] || REPORT_LABELS.ru;
}

function handleSendReport(p) {
  var email = (p.client_email || '').toString().trim();
  if (!email) return respond({ ok: false, error: 'no_client_email' });
  var lang   = (p.lang || 'ru').toString().toLowerCase();
  var labels = reportLabels(lang);
  var d      = p.data || {};
  var name   = p.client_name || '';

  // 1. Создаём временный Google Doc.
  var docTitle = 'VIA-L · ' + (name || labels.title) + ' · ' + new Date().toLocaleDateString('uk-UA');
  var doc      = DocumentApp.create(docTitle);
  var body     = doc.getBody();

  // 2. Заполняем шапкой и метаданными.
  var heading = body.appendParagraph(labels.title);
  heading.setHeading(DocumentApp.ParagraphHeading.TITLE);

  var dateLine = labels.date + ': ' + new Date().toLocaleDateString(jsLocale(lang)) +
                 '   ·   ' + labels.plan + ': ' + (p.plan || '—') +
                 (p.week_no ? ' (' + labels.week + ' ' + p.week_no + ')' : '');
  body.appendParagraph(dateLine).setItalic(true);

  // 3. Профиль клиента.
  body.appendParagraph(labels.profile).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  var profileLine = (d.gender === 'male' ? labels.gender_m : labels.gender_f);
  if (d.age)   profileLine += '   ·   ' + labels.age + ': ' + d.age;
  if (d.phase) profileLine += '   ·   ' + labels.phase + ': ' + d.phase;
  body.appendParagraph(profileLine);

  if (d.device) body.appendParagraph(labels.device + ': ' + d.device);

  // 4. Биометрия (если есть).
  var bio = [];
  if (d.hrv)        bio.push(labels.bio_hrv     + ' ' + d.hrv + ' мс');
  if (d.rhr)        bio.push(labels.bio_rhr     + ' ' + d.rhr);
  if (d.sleep_qual) bio.push(labels.bio_sleep   + ' ' + d.sleep_qual + '/10');
  if (d.deep)       bio.push(labels.bio_deep    + ' ' + d.deep);
  if (d.energy)     bio.push(labels.bio_energy  + ' ' + d.energy + '/10');
  if (d.anxiety)    bio.push(labels.bio_anxiety + ' ' + d.anxiety + '/10');
  if (bio.length) {
    body.appendParagraph(labels.biometrics).setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph(bio.join('   ·   '));
  }
  if (Array.isArray(d.symptoms) && d.symptoms.length) {
    body.appendParagraph(labels.symptoms + ': ' + d.symptoms.join(', '));
  }

  // 5. Вопрос клиента (если был).
  if (p.question) {
    body.appendParagraph(labels.client_question).setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph(p.question);
  }

  // 6. Ответ нутрициолога (уже переведён Worker'ом на язык клиента).
  body.appendParagraph(labels.report).setHeading(DocumentApp.ParagraphHeading.HEADING2);
  var replyText = (p.reply_text || '').toString();
  // Разбиваем на абзацы по двойному переводу строки, сохраняя структуру.
  var paragraphs = replyText.split(/\n{2,}/);
  for (var i = 0; i < paragraphs.length; i++) {
    var para = paragraphs[i].trim();
    if (para) body.appendParagraph(para);
  }

  // 7. Подпись и дисклеймер.
  body.appendParagraph(''); // отступ
  body.appendParagraph(labels.signature).setItalic(true);
  body.appendParagraph(labels.disclaimer).setItalic(true).editAsText().setFontSize(9);

  // 8. Сохраняем, экспортируем в PDF.
  doc.saveAndClose();
  var docFile = DriveApp.getFileById(doc.getId());
  var pdfBlob = docFile.getAs('application/pdf').setName(safeFilename(name, lang) + '.pdf');

  // 9. Отправляем клиенту email с PDF-вложением.
  var subject = labels.subject;
  var greet   = labels.greeting + (name ? ', ' + name : '') + '!';
  var bodyTxt = greet + '\n\n' + labels.intro + '\n\n' + labels.email_body;
  GmailApp.sendEmail(email, subject, bodyTxt, {
    attachments: [pdfBlob],
    name: 'VIA-L'
  });

  // 10. Удаляем временный Google Doc.
  docFile.setTrashed(true);

  // 11. Логируем факт отправки отчёта в Sheet (колонка G — JSON-массив дат).
  //     Dev-коды (с суффиксом [DEV]) в таблице отсутствуют — пропускаем.
  var reportsCount = 0;
  var cleanCode = (p.code || '').toString().toUpperCase().trim().replace(/\s*\[DEV\]\s*$/, '');
  if (cleanCode && cleanCode.indexOf('[DEV]') === -1) {
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
      var rows  = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var rowCode = (rows[i][0] || '').toString().toUpperCase().trim();
        if (rowCode !== cleanCode) continue;
        var history = parseExpertHistory(rows[i][6]);  // колонка G (index 6)
        history.push(new Date());
        reportsCount = history.length;
        sheet.getRange(i + 1, 7).setValue(JSON.stringify(
          history.map(function (d) { return d.toISOString(); })
        ));
        break;
      }
    } catch (e) {
      Logger.log('sheet log failed: ' + e.toString());
    }
  }

  return respond({
    ok: true, sent_to: email, lang: lang,
    pdf_kb: Math.round(pdfBlob.getBytes().length / 1024),
    reports_sent_total: reportsCount,
    reply_chars: (p.reply_text || '').length
  });
}

function jsLocale(lang) {
  var map = { ru:'ru-RU', uk:'uk-UA', en:'en-GB', es:'es-ES', de:'de-DE',
              pt:'pt-PT', fr:'fr-FR', pl:'pl-PL', it:'it-IT', he:'he-IL',
              ja:'ja-JP', ko:'ko-KR' };
  return map[lang] || 'en-GB';
}

function safeFilename(name, lang) {
  var base = 'VIA-L_' + (lang || 'ru') + '_' + (name || 'client');
  return base.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').slice(0, 64);
}

// Backstage Telegram-бот: уведомление нутрициолога после Expert-запроса.
// Безопасно к ошибкам — если Worker недоступен или вернёт ошибку, основной
// поток (email на viaelcom@gmail.com) уже завершён успешно.
function notifyBackstageBot(payload) {
  try {
    UrlFetchApp.fetch(BACKSTAGE_DRAFT_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (e) {
    // Логируем для диагностики, но не пробрасываем — клиент уже получил подтверждение.
    Logger.log('notifyBackstageBot failed: ' + e.toString());
  }
}

function doOptions(e) {
  return ContentService.createTextOutput('');
}
