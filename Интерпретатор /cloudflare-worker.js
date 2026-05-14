// VIA-L · Claude AI Proxy Worker
// Deploy to Cloudflare Workers
// Secret: CLAUDE_API_KEY = sk-ant-api03-...

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { data, lang } = await request.json();
      const prompt = buildPrompt(data, lang);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const result = await response.json();
      const text = result.content?.[0]?.text || result.error?.message || 'Ошибка генерации';

      return new Response(JSON.stringify({ analysis: text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

function buildPrompt(data, lang) {
  const langMap = {
    ru: 'русском', uk: 'украинском', en: 'English', es: 'español',
    de: 'Deutsch', pt: 'português', fr: 'français', pl: 'polski',
    it: 'italiano', he: 'עברית', ja: '日本語', ko: '한국어',
  };
  const langName = langMap[lang] || 'русском';
  const isFem = data.gender !== 'male';
  const phaseMap = {
    peri: 'Перименопауза', meno: 'Менопауза', post: 'Постменопауза',
    andro: 'Андропауза', preandro: 'Предандропауза', other: 'Другое',
  };
  const phase = data.phase || 'other';
  const phaseName = phaseMap[phase] || phase;

  // ── REFERENCE NORMS ──────────────────────────────────────────
  const age = data.age || 50;
  const hrvNormLow = age < 45 ? 40 : age < 55 ? 30 : 25;
  const hrvNormHigh = age < 45 ? 80 : age < 55 ? 65 : 55;
  const hrvVal = parseInt(data.hrv) || 50;
  const hrvStatus = hrvVal < hrvNormLow ? 'низкий (стресс/перегрузка)' : hrvVal > hrvNormHigh ? 'высокий (отличное восстановление)' : 'в норме для возраста';
  const rhrVal = parseInt(data.rhr) || 68;
  const rhrNorm = isFem ? '60–75' : '55–70';
  const rhrStatus = rhrVal > (isFem ? 75 : 70) ? 'повышен (симпатическая активация)' : rhrVal < (isFem ? 55 : 50) ? 'низкий (отличная кардиофитнес)' : 'в норме';

  // ── PHASE PROTOCOLS ──────────────────────────────────────────
  let phaseProtocol = '';
  if (phase === 'peri') {
    phaseProtocol = 'ПРОТОКОЛ ПЕРИМЕНОПАУЗЫ: Ключевые нутриенты — магний глицинат 300–400 мг (вечером), DIM 100–200 мг (поддержка метаболизма эстрогена), льняное семя 30 г/день (лигнаны = мягкие фитоэстрогены), витамин D3 2000–4000 МЕ + K2 100 мкг. Приоритет в питании: крестоцветные (брокколи, капуста), ферментированная соя (мисо, темпе), жирная рыба 3×/нед. Адаптоген: ашваганда 300–600 мг (помогает с HRV и кортизолом). Избегать: алкоголь, рафинированный сахар, кофе >1 чашки вечером (усиливают приливы и снижают HRV).';
  } else if (phase === 'meno') {
    phaseProtocol = 'ПРОТОКОЛ МЕНОПАУЗЫ: Ключевые нутриенты — кальций 1000–1200 мг (из еды + цитрат кальция), D3 2000–4000 МЕ + K2 200 мкг (защита костей), магний глицинат 400 мг, омега-3 2–4 г EPA/DHA, коллаген 10–15 г (тип I/III). При приливах: шалфей 300 мг или цимицифуга 20–40 мг. Приоритет в питании: кунжут (фитоэстрогены), листовая зелень (Ca), жирная рыба, ягоды (антиоксиданты). Белок ≥1.4 г/кг веса (защита мышечной массы).';
  } else if (phase === 'post') {
    phaseProtocol = 'ПРОТОКОЛ ПОСТМЕНОПАУЗЫ: Приоритет — кости + сердечно-сосудистая система + когнитивное здоровье. Ключевые нутриенты — D3 3000–5000 МЕ + K2 200 мкг, Ca 1200 мг, омега-3 3–4 г EPA/DHA, CoQ10 100–200 мг (митохондрии и сердце), коллаген 15 г/день, магний 400 мг. Питание: MIND-диета (рыба, оливковое масло, орехи, ягоды, листовая зелень). Особое внимание: белок ≥1.6 г/кг — саркопения реальный риск.';
  } else if (phase === 'preandro') {
    phaseProtocol = 'ПРОТОКОЛ ПРЕДАНДРОПАУЗЫ: Ключевые нутриенты — цинк 15–25 мг (синтез тестостерона), D3 2000–3000 МЕ + K2 100 мкг, омега-3 2–3 г EPA/DHA, магний 300–400 мг (снижает SHBG, освобождает тестостерон), витамины группы B (B6, B12, фолат). Питание: тыквенные семечки (цинк), устрицы, крестоцветные, яйца, авокадо. Адаптоген: ашваганда 600 мг (поддерживает тестостерон и снижает кортизол).';
  } else if (phase === 'andro') {
    phaseProtocol = 'ПРОТОКОЛ АНДРОПАУЗЫ: Ключевые нутриенты — цинк 25–30 мг, D3 3000–5000 МЕ + K2 200 мкг, омега-3 3–4 г EPA/DHA, CoQ10 150–200 мг (энергия и сердце), магний 400 мг, витамин B12 + активный фолат. При низком либидо/энергии: ашваганда 600 мг + панакс женьшень 200 мг. Питание: жирная рыба, говядина травяного откорма, бразильский орех (2 шт/день = селен), авокадо. Белок ≥1.6 г/кг.';
  } else {
    phaseProtocol = 'БАЗОВЫЙ ПРОТОКОЛ: Магний глицинат 300–400 мг, D3 2000–3000 МЕ + K2 100 мкг, омега-3 2–3 г EPA/DHA, адаптоген (ашваганда 300–600 мг). Питание: средиземноморская диета, приоритет белку ≥1.4 г/кг, крестоцветные ежедневно.';
  }

  // ── SYMPTOM → NUTRIENT RULES ─────────────────────────────────
  const symptoms = data.symptoms || [];
  let symptomRules = '';
  if (symptoms.length) {
    const rules = [];
    if (symptoms.some(s => /приlив|жар|жаrop|flash|calor|hitzewallun|bouffée|uderzenie|vampata|גלי חום|ほてり|열감/i.test(s))) {
      rules.push('Приливы → шалфей 300 мг утром, магний глицинат 400 мг вечером, исключить алкоголь и острое');
    }
    if (symptoms.some(s => /сустав|боль|joint|dolor|Gelenk|douleur|ból|dolore|כאב|関節|관절/i.test(s))) {
      rules.push('Боли в суставах → коллаген тип II 40 мг или тип I/III 10–15 г, босвеллия 500 мг, омега-3 3–4 г');
    }
    if (symptoms.some(s => /туман|память|brain|cogn|Gehirn|мозг|céréb|pamięć|memoria|מוח|脳|뇌/i.test(s))) {
      rules.push('Когнитивный туман → омега-3 DHA приоритет 1–2 г/день, фосфатидилсерин 300 мг, Lion\'s Mane 500–1000 мг');
    }
    if (symptoms.some(s => /волос|выпад|hair|cabello|Haar|cheveux|włosy|capelli|שיער|髪|탈모/i.test(s))) {
      rules.push('Выпадение волос → биотин 5000 мкг, железо (проверить ферритин >70), цинк 15–25 мг, кремний');
    }
    if (symptoms.some(s => /вес|набор|weight|peso|Gewicht|poids|waga|peso|משקל|体重|체중/i.test(s))) {
      rules.push('Набор веса → берберин 500 мг 2×/день (чувствительность к инсулину), хром 200 мкг, ограничить рафинированные углеводы');
    }
    if (rules.length) {
      symptomRules = '\nПРАВИЛА ПО СИМПТОМАМ (применить если релевантно): ' + rules.join('; ') + '.';
    }
  }

  // ── HOT FLASH CONTEXT ────────────────────────────────────────
  let hfContext = '';
  if (isFem && data.hf_count && data.hf_count !== 'none') {
    const hfSeverity = data.hf_count === 'high' ? 'тяжёлые (6+/ночь)' : data.hf_count === 'mid' ? 'умеренные (3–5/ночь)' : 'лёгкие (1–2/ночь)';
    hfContext = '\n- Приливы: ' + hfSeverity + (data.hf_intensity ? ', интенсивность: ' + data.hf_intensity : '') + ' → основной триггер нарушения сна и повышения RHR';
  }

  // ── SLEEP CONTEXT ────────────────────────────────────────────
  const sleepQual = parseInt(data.sleep_qual) || 5;
  const sleepStatus = sleepQual <= 4 ? 'неудовлетворительный' : sleepQual <= 6 ? 'нарушенный' : sleepQual <= 8 ? 'удовлетворительный' : 'хороший';
  const deepSleep = data.deep || 'не указан';
  // Deep sleep norm: 15-25% from total, for 7h sleep = 63-105 min
  const deepContext = deepSleep === 'good' ? '(норма ≥90 мин)' : deepSleep === 'low' ? '(дефицит: 30–90 мин — нарушение восстановления GH и памяти)' : deepSleep === 'none' ? '(критически мало: <30 мин — приоритет №1)' : '';

  // ── LABS CONTEXT ─────────────────────────────────────────────
  let labsContext = '';
  if (data.labs) {
    const l = data.labs;
    const labNotes = [];
    if (l.vitd) {
      const vd = parseFloat(l.vitd);
      labNotes.push('Витамин D: ' + l.vitd + ' нмоль/л ' + (vd < 50 ? '[ДЕФИЦИТ — приоритет коррекция 4000–6000 МЕ/день]' : vd < 75 ? '[недостаточность — 2000–4000 МЕ/день]' : '[норма]'));
    }
    if (l.ferr) {
      const f = parseFloat(l.ferr);
      labNotes.push('Ферритин: ' + l.ferr + ' мкг/л ' + (f < 30 ? '[ДЕФИЦИТ железа — усталость, выпадение волос, снижение когниции]' : f < 70 ? '[субоптимально для женщин — целевой >70]' : '[норма]'));
    }
    if (l.tsh) {
      const t = parseFloat(l.tsh);
      labNotes.push('ТТГ: ' + l.tsh + ' мМЕ/л ' + (t > 2.5 ? '[субоптимально — усиливает симптомы менопаузы, проверить FT4/FT3]' : t < 0.5 ? '[низкий — риск гипертиреоза]' : '[норма]'));
    }
    if (l.e2) {
      const e = parseFloat(l.e2);
      labNotes.push('Эстрадиол: ' + l.e2 + ' пг/мл ' + (e < 20 ? '[постменопаузальный уровень — классические симптомы ожидаемы]' : e < 50 ? '[низкий]' : '[в диапазоне]'));
    }
    if (labNotes.length) labsContext = '\nЛАБОРАТОРНЫЕ ДАННЫЕ С ИНТЕРПРЕТАЦИЕЙ:\n' + labNotes.join('\n');
  }

  // ── BIOCOMPOSITION CONTEXT ───────────────────────────────────
  let bioContext = '';
  if (data.bio) {
    const b = data.bio;
    const bioNotes = [];
    if (b.fat) {
      const f = parseFloat(b.fat);
      const fatNorm = isFem ? (age > 50 ? '28–38%' : '23–33%') : (age > 50 ? '18–28%' : '15–25%');
      bioNotes.push('Жир: ' + b.fat + '% (норма ' + fatNorm + ')');
    }
    if (b.muscle) bioNotes.push('Мышцы: ' + b.muscle + '% ' + (parseFloat(b.muscle) < (isFem ? 25 : 33) ? '[сниженная масса — риск саркопении, приоритет белок + силовые]' : '[норма]'));
    if (b.visceral) bioNotes.push('Висцеральный жир: уровень ' + b.visceral + ' ' + (parseInt(b.visceral) > 9 ? '[повышен — метаболический риск, берберин + интервальное голодание]' : '[норма]'));
    if (b.bioage) bioNotes.push('Биологический возраст: ' + b.bioage + ' лет');
    if (bioNotes.length) bioContext = '\nСОСТАВ ТЕЛА: ' + bioNotes.join('; ');
  }

  // ── ASSEMBLE PROMPT ──────────────────────────────────────────
  return 'Ты — Марина, нутрициолог-специалист по гормональному здоровью (перименопауза, менопауза, андропауза). '
    + 'Ты работаешь с данными носимых устройств и умеешь переводить биометрию в конкретные нутрициологические действия. '
    + 'Стиль: тёплый, уверенный, конкретный — как письмо от заботливого эксперта, а не медицинская справка.\n\n'
    + 'Отвечай ТОЛЬКО на языке: ' + langName + '.\n\n'

    + '══ КЛИНИЧЕСКИЕ НОРМЫ (используй для интерпретации) ══\n'
    + 'HRV для возраста ' + age + ' лет: норма ' + hrvNormLow + '–' + hrvNormHigh + ' мс | у клиента: ' + data.hrv + ' мс → ' + hrvStatus + '\n'
    + 'ЧСС покоя: норма ' + rhrNorm + ' уд/мин | у клиента: ' + rhrVal + ' уд/мин → ' + rhrStatus + '\n'
    + 'Глубокий сон: норма 90–110 мин/ночь | у клиента: ' + deepSleep + ' ' + deepContext + '\n'
    + 'Качество сна: ' + sleepQual + '/10 → ' + sleepStatus + '\n'
    + 'Частота дыхания: норма 12–18 вд/мин | у клиента: ' + data.resp_rate + ' вд/мин\n\n'

    + '══ ' + phaseName.toUpperCase() + ' — НУТРИЦИОЛОГИЧЕСКИЙ ПРОТОКОЛ ══\n'
    + phaseProtocol + '\n'
    + (symptomRules ? symptomRules + '\n' : '')
    + '\n'

    + '══ ДАННЫЕ КЛИЕНТА ══\n'
    + '- Пол: ' + (isFem ? 'Женщина' : 'Мужчина') + ' | Фаза: ' + phaseName + '\n'
    + (data.age ? '- Возраст: ' + data.age + ' лет\n' : '')
    + (data.weight ? '- Вес: ' + data.weight + ' кг' : '') + (data.height ? ' | Рост: ' + data.height + ' см\n' : (data.weight ? '\n' : ''))
    + '- HRV: ' + data.hrv + ' мс (' + hrvStatus + ') | Тренд: ' + (data.hrv_trend === 'below' ? 'ниже нормы' : data.hrv_trend === 'above' ? 'выше нормы' : 'в норме') + '\n'
    + '- Сон: ' + data.sleep_qual + '/10 (' + sleepStatus + ') | Глубокий: ' + deepSleep + ' ' + deepContext + ' | Пробуждения: ' + data.wake + '\n'
    + hfContext
    + '\n- Частота дыхания: ' + data.resp_rate + ' вд/мин | Пульс покоя: ' + rhrVal + ' уд/мин (' + rhrStatus + ')\n'
    + '- Энергия: ' + data.energy + '/10 | Настроение: ' + data.mood + ' | Тревожность: ' + data.anxiety + '/10 | Раздражительность: ' + data.irritability + '\n'
    + '- Симптомы: ' + (symptoms.length ? symptoms.join(', ') : 'не указаны') + '\n'
    + '- Температура ночью: ' + data.temp + ' | Стресс: ' + data.stress + ' | Алкоголь: ' + data.alc + '\n'
    + bioContext
    + labsContext
    + '\n\n'

    + '══ СТРУКТУРА ОТВЕТА (строго соблюдай) ══\n'
    + '**Общая картина** — 2–3 предложения: что происходит с гормональным балансом, как биометрия это отражает. Назови самый тревожный показатель если есть.\n\n'
    + '**Приоритет сейчас** — одно конкретное действие которое даст максимальный результат за 7 дней. Объясни почему именно оно.\n\n'
    + '**Питание** — 3–4 конкретных продукта или нутриента с дозировкой и механизмом действия (1 строка на каждый).\n\n'
    + '**Добавки** — 2–3 добавки с точной дозировкой и временем приёма. Только те что нужны этому профилю.\n\n'
    + '**На сегодня** — 2 конкретных действия которые клиент может сделать в ближайшие 24 часа.\n\n'
    + 'Максимум 380 слов. Не повторяй данные клиента. Говори с заботой но конкретно — каждое слово должно быть полезным.';
}
