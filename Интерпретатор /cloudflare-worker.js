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
          max_tokens: 1024,
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

  return 'Ты — Марина, нутрициолог-специалист по гормональному здоровью в период перименопаузы, менопаузы и андропаузы. Стиль: тёплый, профессиональный, конкретный.\n\n'
    + 'Отвечай ТОЛЬКО на языке: ' + langName + '.\n\n'
    + 'ДАННЫЕ КЛИЕНТА:\n'
    + '- Пол: ' + (isFem ? 'Женщина' : 'Мужчина') + ', Фаза: ' + (phaseMap[data.phase] || data.phase) + '\n'
    + (data.age ? '- Возраст: ' + data.age + ' лет\n' : '')
    + (data.weight ? '- Вес: ' + data.weight + ' кг' : '') + (data.height ? ' | Рост: ' + data.height + ' см\n' : (data.weight ? '\n' : ''))
    + '- HRV: ' + data.hrv + ' мс (тренд: ' + (data.hrv_trend === 'below' ? 'ниже нормы' : data.hrv_trend === 'above' ? 'выше нормы' : 'в норме') + ')\n'
    + '- Сон: ' + data.sleep_qual + '/10 | Глубокий: ' + data.deep + ' | Пробуждения: ' + data.wake + '\n'
    + (data.hf_count && data.hf_count !== 'none' ? '- Приливы за ночь: ' + (data.hf_count === 'low' ? '1–2' : data.hf_count === 'mid' ? '3–5' : '6+') + (data.hf_intensity ? ' | Интенсивность: ' + data.hf_intensity : '') + '\n' : '')
    + '- Частота дыхания: ' + data.resp_rate + ' вд/мин\n'
    + '- Пульс покоя: ' + data.rhr + ' уд/мин\n'
    + '- Энергия: ' + data.energy + '/10\n'
    + '- Настроение: ' + data.mood + ' | Тревожность: ' + data.anxiety + '/10 | Раздражительность: ' + data.irritability + '\n'
    + '- Симптомы: ' + (data.symptoms && data.symptoms.length ? data.symptoms.join(', ') : 'не указаны') + '\n'
    + '- Температура ночью: ' + data.temp + ' | Стресс: ' + data.stress + ' | Алкоголь: ' + data.alc + '\n'
    + (data.bio && data.bio.muscle ? '- Мышечная масса: ' + data.bio.muscle + '%\n' : '')
    + (data.bio && data.bio.fat ? '- Жир: ' + data.bio.fat + '%\n' : '')
    + (data.bio && data.bio.visceral ? '- Висцеральный жир: уровень ' + data.bio.visceral + '\n' : '')
    + (data.bio && data.bio.bioage ? '- Биологический возраст: ' + data.bio.bioage + ' лет\n' : '')
    + (data.labs && data.labs.vitd ? '- Витамин D: ' + data.labs.vitd + ' нмоль/л\n' : '')
    + (data.labs && data.labs.ferr ? '- Ферритин: ' + data.labs.ferr + ' мкг/л\n' : '')
    + (data.labs && data.labs.tsh ? '- ТТГ: ' + data.labs.tsh + ' мМЕ/л\n' : '')
    + (data.labs && data.labs.e2 ? '- Эстрадиол: ' + data.labs.e2 + ' пг/мл\n' : '')
    + '\nДай персональный анализ строго по структуре (без лишних заголовков):\n\n'
    + '**Общая картина** — 2–3 предложения о текущем состоянии гормонального баланса.\n\n'
    + '**Приоритет сейчас** — самое важное одно действие которое изменит ситуацию.\n\n'
    + '**Питание** — 3–4 конкретных продукта или нутриента с дозировкой.\n\n'
    + '**Добавки** — 2–3 если необходимы, с дозировкой.\n\n'
    + '**На сегодня** — 1–2 конкретных действия на ближайшие 24 часа.\n\n'
    + 'Максимум 280 слов. Не повторяй данные клиента обратно.';
}
