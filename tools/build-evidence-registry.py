#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Реестр источников VIA-L: собирает список научных работ, на которые опирается база знаний.

ГЛАВНЫЙ ПРИНЦИП: скрипт НИЧЕГО не придумывает. Он читает библиографию, которая уже есть
в выгрузках OpenEvidence (`interpreter/Infa Cloude/`), и раскладывает её по темам. Ни одна
ссылка здесь не сочинена моделью — каждая строка физически лежит в файле выгрузки, из
которой писался соответствующий паттерн базы знаний. Поэтому реестр можно показывать
клиенту: за каждой строкой стоит настоящая публикация с DOI.

Что на выходе:
  interpreter/evidence-registry.json — машинный реестр ТОЛЬКО по паттернам P-F*/P-M*
      (их показывает приложение: разбор знает, какие паттерны сработали → показывает их работы).
  docs/EVIDENCE-REGISTRY.md          — человеческая сводка: метод, цифры, пробелы.

Запуск: python3 tools/build-evidence-registry.py
Пересобирать после пополнения выгрузок.
"""
import os, re, json, collections, datetime

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUMPS = os.path.join(REPO, 'interpreter', 'Infa Cloude')
OUT_JSON = os.path.join(REPO, 'interpreter', 'evidence-registry.json')
OUT_MD = os.path.join(REPO, 'docs', 'EVIDENCE-REGISTRY.md')

# Строка библиографии OpenEvidence:
#   «12. Заголовок. Авторы. Журнал. 2020;142(25):e506-e532. doi:10.1161/CIR.0000000000000912.»
DOI = re.compile(r'doi:\s*(10\.\d{4,9}/[^\s,;]+?)\.?\s*$', re.I)
YEAR_SEG = re.compile(r'^\(?((?:19|20)\d{2})\b')
YEAR_ANY = re.compile(r'\b((?:19|20)\d{2})\b')
NUM_PREFIX = re.compile(r'^\d{1,3}\.\s*')


def topic_of(rel_path):
    """Файл выгрузки → тема. P-F/P-M дают id паттерна, остальные папки — своё имя."""
    parts = rel_path.split(os.sep)
    top = parts[0]
    if top in ('P-F', 'P-M'):
        m = re.match(r'(P-[FM]\d+)', os.path.basename(rel_path))
        return m.group(1) if m else top
    if top == 'N':                       # N/N-5/«вопрос».txt → N-5
        return parts[1] if len(parts) > 1 else 'N'
    return top


def parse_citation(line):
    """Строка → (doi, заголовок, журнал, год) или None. Разбираем С КОНЦА: doi → год → журнал."""
    m = DOI.search(line)
    if not m:
        return None
    doi = m.group(1).rstrip('.').lower()
    body = NUM_PREFIX.sub('', line[:m.start()].strip())
    segs = [s.strip() for s in body.split('. ') if s.strip()]
    title = segs[0] if segs else ''
    journal, year = '', ''
    for i, s in enumerate(segs):
        ym = YEAR_SEG.match(s)          # сегмент, НАЧИНАЮЩИЙСЯ с года — это «2020;142(25):…»
        if ym:
            year = ym.group(1)
            if i > 0:
                journal = segs[i - 1].strip(' .;')
            break
    if not year:
        ya = YEAR_ANY.search(body)
        year = ya.group(1) if ya else ''
    return doi, title, journal, year


def collect():
    sources = {}
    by_topic = collections.defaultdict(set)
    files = lines = 0
    for dirpath, _, filenames in os.walk(DUMPS):
        for fn in filenames:
            if not fn.lower().endswith('.txt'):
                continue
            files += 1
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, DUMPS)
            topic = topic_of(rel)
            for line in open(full, encoding='utf-8', errors='replace'):
                line = line.strip()
                if 'doi:' not in line.lower():
                    continue
                parsed = parse_citation(line)
                if not parsed:
                    continue
                doi, title, journal, year = parsed
                lines += 1
                rec = sources.setdefault(doi, {'doi': doi, 'title': title,
                                               'journal': journal, 'year': year,
                                               'topics': set()})
                # из нескольких вхождений берём самое полное описание
                if len(title) > len(rec['title']):
                    rec['title'] = title
                if not rec['journal']:
                    rec['journal'] = journal
                if not rec['year']:
                    rec['year'] = year
                rec['topics'].add(topic)
                by_topic[topic].add(doi)
    return sources, by_topic, files, lines


def main():
    sources, by_topic, files, lines = collect()
    pat_key = lambda k: (k[2], int(k[3:]))
    patterns = sorted([k for k in by_topic if re.match(r'^P-[FM]\d+$', k)], key=pat_key)

    # ── Машинный реестр: только паттерны (их показывает приложение) ──
    used = sorted({d for p in patterns for d in by_topic[p]})
    registry = {
        'generated': datetime.date.today().isoformat(),
        'note': 'Собрано tools/build-evidence-registry.py из выгрузок OpenEvidence. Руками не править.',
        'sources': {d: {'t': sources[d]['title'], 'j': sources[d]['journal'],
                        'y': sources[d]['year']} for d in used},
        'byPattern': {p: sorted(by_topic[p]) for p in patterns},
    }
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(registry, f, ensure_ascii=False, separators=(',', ':'))

    # ── Человеческая сводка ──
    themes = sorted([k for k in by_topic if k not in patterns], key=lambda k: -len(by_topic[k]))
    total = len(sources)
    md = []
    md.append('# Реестр источников VIA-L\n')
    md.append(f'**Собран автоматически {datetime.date.today().isoformat()}** '
              '— `python3 tools/build-evidence-registry.py`. Руками не править: пересобирается.\n')
    md.append('## Что это\n')
    md.append('Список научных работ, на которые опирается база знаний. Скрипт не сочиняет ссылок: '
              'он вытаскивает библиографию из выгрузок OpenEvidence в `interpreter/Infa Cloude/` — '
              'тех самых, из которых писались паттерны. Каждая строка реестра физически лежит '
              'в файле выгрузки, у каждой есть DOI.\n')
    md.append('## Цифры\n')
    md.append(f'- Файлов выгрузок прочитано: **{files}**')
    md.append(f'- Строк библиографии с DOI: **{lines}**')
    md.append(f'- **Уникальных работ: {total}**')
    md.append(f'- Из них привязано к клиническим паттернам (P-F*/P-M*): **{len(used)}**')
    md.append(f'- Паттернов с источниками: **{len(patterns)}**\n')
    md.append('## По паттернам (это видит клиент)\n')
    for p in patterns:
        md.append(f'- `{p}` — {len(by_topic[p])}')
    # Список паттернов берём из самой базы знаний, а не из «диапазона» — иначе при добавлении
    # P-F24 документ молча перестанет замечать пробел.
    kb = open(os.path.join(REPO, 'interpreter', 'cloudflare-worker.js'),
              encoding='utf-8', errors='replace').read()
    known = sorted(set(re.findall(r'\[(P-[FM]\d+)\]', kb)), key=pat_key)
    missing = [c for c in known if c not in patterns]
    md.append('\n### ⚠️ Паттерны БЕЗ своей выгрузки\n')
    md.append('Эти паттерны в базе знаний есть, а отдельной выгрузки под них нет — показывать '
              'источники по ним пока нечего. Либо собрать выгрузку, либо привязать вручную '
              'к темам ниже.\n')
    md.append(', '.join('`%s`' % c for c in missing) if missing else '_нет — все закрыты_')
    md.append('\n## По темам исследований (в приложение не идёт, это рабочая база)\n')
    for t in themes:
        md.append(f'- `{t}` — {len(by_topic[t])}')
    md.append('\n## Как показываем клиенту\n')
    md.append('Привязать конкретную ФРАЗУ разбора к конкретной работе нельзя — текст пишет модель, '
              'а не шаблон, и такая привязка была бы выдумкой. Честная единица — **паттерн**: '
              'разбор знает, какие паттерны сработали (`selectKBPatterns`), и показывает работы '
              'именно за ними. Это правда, которую можно проверить.\n')
    with open(OUT_MD, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md) + '\n')

    print(f'Файлов: {files} | строк с DOI: {lines} | уникальных работ: {total}')
    print(f'По паттернам: {len(used)} работ на {len(patterns)} паттернов')
    print(f'→ {os.path.relpath(OUT_JSON, REPO)}')
    print(f'→ {os.path.relpath(OUT_MD, REPO)}')


if __name__ == '__main__':
    main()
