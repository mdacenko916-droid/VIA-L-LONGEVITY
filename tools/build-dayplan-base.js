#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// build-dayplan-base.js — переносит базовые главы «Памятки дня» из КЛИЕНТА в воркер.
//
// Зачем: движок памятки (docs/DAY-PLAN-DETERMINISTIC-PLAN.md) собирает разделы
// «Утро/День/Вечер» сам, без ИИ. Тексты для них УЖЕ написаны и уже на 12 языках —
// это _bpChapterData в interpreter-via-l.html, та самая базовая памятка, которую
// человек видит, пока ИИ считает. Переписывать их в воркер руками = завести вторую
// копию и получить дрейф. Поэтому копию ГЕНЕРИРУЕМ из клиента этим скриптом.
//
// Запуск: node tools/build-dayplan-base.js   (после любой правки _bpChapterData)
// Результат: interpreter/dayplan-base.js (в git, воркер его импортирует).
// ─────────────────────────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC  = path.join(ROOT, 'interpreter', 'interpreter-via-l.html');
const OUT  = path.join(ROOT, 'interpreter', 'dayplan-base.js');

const html = fs.readFileSync(SRC, 'utf8');

function cut(name, startsWith) {
  const i = html.indexOf(startsWith);
  if (i < 0) throw new Error('не найдено в клиенте: ' + name + ' («' + startsWith + '»)');
  const j = html.indexOf('\nfunction ', i + 10);
  if (j < 0) throw new Error('не найден конец функции: ' + name);
  return html.slice(i, j).trimEnd();
}

const fnChapters = cut('_bpChapterData', 'function _bpChapterData(id, data)');
const fnActFactor = cut('_actFactor', 'function _actFactor(data)');

// Сверка ожиданий: если клиент переименует разделы, движок должен упасть ЗДЕСЬ,
// а не молча отдать половину памятки.
['morning', 'lunch', 'evening', 'activity', 'water', 'sleep'].forEach(id => {
  if (!fnChapters.includes("id==='" + id + "'")) throw new Error('в _bpChapterData пропал раздел ' + id);
});

const out = `// СГЕНЕРИРОВАНО tools/build-dayplan-base.js — РУКАМИ НЕ ПРАВИТЬ.
// Источник: interpreter/interpreter-via-l.html, функции _bpChapterData и _actFactor
// (базовая «Памятка дня», уже на 12 языках). Правка текстов — в клиенте, затем
// \`node tools/build-dayplan-base.js\`. Зачем так — docs/DAY-PLAN-DETERMINISTIC-PLAN.md §5.
// Дата генерации: ${new Date().toISOString().slice(0, 10)}

// L() клиента отдаёт строку текущего языка; здесь язык приходит параметром.
let _L_LANG = 'en';
const L = o => (o && typeof o === 'object') ? (o[_L_LANG] || o.en || o.ru || '') : o;

${fnActFactor}

${fnChapters}

// Разделы базовой памятки на нужном языке. id: morning|lunch|evening|activity|water|sleep
export function bpChapterData(id, data, lang) {
  _L_LANG = String(lang || 'en');
  try { return _bpChapterData(id, data || {}) || []; } catch (e) { return []; }
}
`;
fs.writeFileSync(OUT, out, 'utf8');
console.log('готово:', path.relative(ROOT, OUT), '—', out.split('\n').length, 'строк');
