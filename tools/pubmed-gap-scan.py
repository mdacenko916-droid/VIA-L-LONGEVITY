#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Сверка базы знаний со свежим PubMed: чего из сильных работ 2023+ у нас нет.

По каждому паттерну P-F*/P-M* — один запрос в PubMed (бесплатный API NCBI E-utilities),
только сильные типы работ: систематические обзоры, метаанализы, РКИ, клинические рекомендации.
Найденные DOI сверяются со ВСЕМИ выгрузками OpenEvidence (`interpreter/Infa Cloude/`) —
тем же разбором, что у tools/build-evidence-registry.py.

Скрипт НИЧЕГО не меняет в базе знаний и в реестре. Результат — список «на прочтение»:
  docs/PUBMED-GAP-SCAN.md
Решение «меняет ли работа правило паттерна» принимает человек; если да — работа
попадает в выгрузку → пересборка реестра → правка KB воркера.

Запуск: python3 tools/pubmed-gap-scan.py            (все паттерны, ~1 мин)
        python3 tools/pubmed-gap-scan.py P-F1 P-M9  (выборочно)
"""
import os, sys, json, time, datetime, importlib.util, urllib.request, urllib.parse

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_MD = os.path.join(REPO, 'docs', 'PUBMED-GAP-SCAN.md')
EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'
RETMAX = 30          # сколько самых релевантных работ брать на паттерн
SHOW_NEW = 15        # сколько новых показывать в сводке на паттерн

# Общий фильтр: только сильные типы работ, свежие, не только на животных.
STRONG = ('(systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt] '
          'OR practice guideline[pt] OR guideline[pt] OR consensus development conference[pt])')
COMMON = f' AND {STRONG} AND 2023:3000[dp] NOT (animals[mh] NOT humans[mh])'

MENO = '(menopaus*[tiab] OR perimenopaus*[tiab] OR postmenopaus*[tiab] OR "midlife women"[tiab])'
# «androgen*» и «male[tiab]» не берём: тянут СПКЯ и всё подряд. СПКЯ отсекаем явно.
MID_MEN = ('(("middle-aged men"[tiab] OR "older men"[tiab] OR "aging men"[tiab] OR men[ti] '
           'OR testosterone[tiab] OR hypogonad*[tiab]) NOT (polycystic[tiab] OR PCOS[tiab]))')

QUERIES = {
    'P-F1': f'(estrogen*[tiab] OR oestrogen*[tiab] OR "vasomotor symptoms"[tiab] OR "hot flashes"[tiab] '
            f'OR "hot flushes"[tiab] OR "menopausal hormone therapy"[tiab]) AND {MENO}',
    'P-F2': '("estrogen metabolism"[tiab] OR "estrogen metabolites"[tiab] OR "2-hydroxyestrone"[tiab] '
            'OR estrobolome[tiab] OR "beta-glucuronidase"[tiab] OR diindolylmethane[tiab] '
            'OR "indole-3-carbinol"[tiab] OR "cruciferous vegetables"[tiab]) AND (women[tiab] OR female[tiab])',
    'P-F3': f'(progesterone[tiab] OR progestogen*[tiab] OR "luteal phase"[tiab]) AND {MENO}',
    'P-F4': f'(cortisol[tiab] OR "HPA axis"[tiab] OR "hypothalamic-pituitary-adrenal"[tiab] '
            f'OR "chronic stress"[tiab] OR burnout[tiab]) AND {MENO}',
    'P-F5': f'(mitochondri*[tiab] OR "coenzyme Q10"[tiab] OR creatine[tiab] OR "nicotinamide"[tiab] '
            f'OR fatigue[ti]) AND ({MENO} OR "middle-aged women"[tiab])',
    'P-F6': '(hypothyroid*[tiab] OR "subclinical hypothyroidism"[tiab] OR Hashimoto*[tiab] '
            'OR "thyroid function"[tiab]) AND (women[tiab] OR menopaus*[tiab] OR selenium[tiab] OR iodine[tiab])',
    'P-F7': f'("insulin resistance"[tiab] OR prediabet*[tiab] OR "metabolic syndrome"[tiab]) AND {MENO}',
    'P-F8': f'(inflammat*[tiab] OR "C-reactive protein"[tiab] OR inflammaging[tiab] '
            f'OR "omega-3"[tiab]) AND {MENO}',
    'P-F9': f'(anxiety[tiab] OR depress*[tiab] OR mood[tiab]) AND {MENO}',
    'P-F10': f'(cognit*[tiab] OR "brain fog"[tiab] OR memory[tiab]) AND {MENO}',
    'P-F11': f'(microbiome[tiab] OR microbiota[tiab] OR probiotic*[tiab] OR "irritable bowel"[tiab] '
             f'OR "dietary fiber"[tiab]) AND {MENO}',
    'P-F12': f'(sarcopenia[tiab] OR osteoporosis[tiab] OR "bone mineral density"[tiab] OR arthralgia[tiab] '
             f'OR "musculoskeletal syndrome"[tiab] OR "resistance training"[tiab]) AND {MENO}',
    'P-F13': f'(cardiovascular[tiab] OR hypertension[tiab] OR dyslipid*[tiab] OR atherosclero*[tiab]) AND {MENO}',
    'P-F14': f'(skin[tiab] OR collagen[tiab] OR "hair loss"[tiab] OR alopecia[tiab]) AND {MENO}',
    'P-F15': f'("genitourinary syndrome of menopause"[tiab] OR "vulvovaginal atrophy"[tiab] '
             f'OR "vaginal estrogen"[tiab] OR "sexual dysfunction"[tiab] OR libido[tiab]) AND {MENO}',
    'P-F16': '(autoimmun*[tiab]) AND (menopaus*[tiab] OR "sex hormones"[tiab] OR diet[tiab] '
             'OR "vitamin D"[tiab] OR stress[tiab]) AND (women[tiab] OR female[tiab])',
    'P-F17': f'(insomnia[tiab] OR "sleep disturbance*"[tiab] OR "sleep quality"[tiab] '
             f'OR "night sweats"[tiab]) AND {MENO}',
    'P-F18': '("vitamin B12"[tiab] OR cobalamin[tiab] OR folate[tiab] OR "folic acid"[tiab] '
             'OR homocysteine[tiab] OR MTHFR[tiab]) AND (deficien*[tiab] OR metformin[tiab] '
             'OR "proton pump"[tiab] OR "older adults"[tiab])',
    'P-F19': '(hemorrhoid*[tiab] OR haemorrhoid*[tiab] OR "fecal incontinence"[tiab] '
             'OR "faecal incontinence"[tiab] OR "anal fissure"[tiab])',
    'P-F20': '("pelvic organ prolapse"[tiab] OR "urinary incontinence"[tiab] '
             'OR "pelvic floor muscle training"[tiab]) AND (women[tiab] OR menopaus*[tiab])',
    'P-F21': '("breast cancer"[tiab] OR mastalgia[tiab] OR "breast pain"[tiab] OR fibrocystic[tiab]) '
             'AND (diet[tiab] OR nutrition[tiab] OR alcohol[tiab] OR soy[tiab] OR "physical activity"[tiab]) '
             'AND (risk[tiab] OR prevention[tiab])',
    'P-F22': '("heavy menstrual bleeding"[tiab] OR menorrhagia[tiab] OR (("iron deficiency"[tiab] '
             'OR ferritin[tiab]) AND (menstruat*[tiab] OR perimenopaus*[tiab])))',
    'P-F23': '("menstrual migraine"[tiab] OR (migraine[tiab] AND (estrogen*[tiab] OR menopaus*[tiab] '
             'OR perimenopaus*[tiab] OR "hormonal contracepti*"[tiab])))',
    'P-M1': '(testosterone[tiab] OR hypogonadism[tiab] OR andropause[tiab] OR "late-onset hypogonadism"[tiab]) '
            'AND (men[tiab] OR male[tiab])',
    'P-M2': f'(cortisol[tiab] OR "HPA axis"[tiab] OR "hypothalamic-pituitary-adrenal"[tiab] '
            f'OR "chronic stress"[tiab] OR burnout[tiab]) AND {MID_MEN}',
    'P-M3': f'("insulin resistance"[tiab] OR "metabolic syndrome"[tiab] OR prediabet*[tiab] '
            f'OR "visceral fat"[tiab]) AND {MID_MEN}',
    'P-M4': f'(inflammat*[tiab] OR "C-reactive protein"[tiab] OR inflammaging[tiab]) AND {MID_MEN}',
    'P-M5': f'(hypothyroid*[tiab] OR "thyroid function"[tiab] OR Hashimoto*[tiab]) AND {MID_MEN}',
    'P-M6': f'(microbiome[tiab] OR microbiota[tiab] OR probiotic*[tiab]) AND {MID_MEN}',
    'P-M7': f'(cardiovascular[tiab] OR hypertension[tiab] OR dyslipid*[tiab] OR atherosclero*[tiab]) AND {MID_MEN}',
    'P-M8': f'(cognit*[tiab] OR "brain fog"[tiab] OR memory[tiab] OR dementia[tiab]) AND {MID_MEN}',
    'P-M9': '("obstructive sleep apnea"[tiab] OR "sleep apnoea"[tiab] OR "sleep deprivation"[tiab] '
            'OR insomnia[tiab]) AND (testosterone[tiab] OR androgen*[tiab] OR hypogonad*[tiab])',
    'P-M10': '("benign prostatic hyperplasia"[tiab] OR "lower urinary tract symptoms"[tiab] '
             'OR "prostate enlargement"[tiab])',
    'P-M11': '("erectile dysfunction"[tiab]) AND (cardiovascular[tiab] OR endothelial[tiab] OR coronary[tiab])',
}


def load_registry_parser():
    """Берём collect() из скрипта реестра — один разбор выгрузок на оба инструмента."""
    path = os.path.join(REPO, 'tools', 'build-evidence-registry.py')
    spec = importlib.util.spec_from_file_location('registry', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.collect


_last = [0.0]
def eutils(endpoint, params):
    """Без ключа NCBI разрешает 3 запроса/с — держим паузу и повторяем при сбое."""
    params = dict(params, tool='via-l-gap-scan', retmode='json')
    url = EUTILS + endpoint + '?' + urllib.parse.urlencode(params)
    for attempt in range(4):
        wait = 0.4 - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))


def search(pattern):
    q = QUERIES[pattern] + COMMON
    res = eutils('esearch.fcgi', {'db': 'pubmed', 'term': q, 'retmax': RETMAX, 'sort': 'relevance'})
    total = int(res['esearchresult']['count'])
    ids = res['esearchresult']['idlist']
    if not ids:
        return total, []
    summ = eutils('esummary.fcgi', {'db': 'pubmed', 'id': ','.join(ids)})['result']
    works = []
    for pmid in ids:
        s = summ.get(pmid, {})
        doi = next((a['value'].lower() for a in s.get('articleids', []) if a.get('idtype') == 'doi'), '')
        types = [t for t in s.get('pubtype', []) if t != 'Journal Article']
        works.append({'pmid': pmid, 'doi': doi, 'title': s.get('title', '').rstrip('.'),
                      'journal': s.get('source', ''), 'year': (s.get('pubdate', '') or '')[:4],
                      'types': types})
    return total, works


def main():
    wanted = [a for a in sys.argv[1:] if a in QUERIES] or list(QUERIES)
    collect = load_registry_parser()
    sources, by_topic, _, _ = collect()
    known = set(sources)

    md = ['# PubMed: сверка базы знаний со свежей литературой\n',
          f'**Собрано {datetime.date.today().isoformat()}** — `python3 tools/pubmed-gap-scan.py`. '
          'Пересобирается, руками не править.\n',
          '## Метод\n',
          f'По каждому паттерну — один запрос в PubMed: {RETMAX} самых релевантных работ с 2023 года, '
          'только систематические обзоры, метаанализы, РКИ и клинические рекомендации. '
          'DOI сверяются со всеми выгрузками OpenEvidence (`interpreter/Infa Cloude/`).\n',
          '- **в паттерне** — работа уже стоит в выгрузке этого паттерна;',
          '- **в базе** — есть в другой выгрузке, к этому паттерну не привязана;',
          '- **новая** — у нас её нет нигде → кандидат на прочтение.\n',
          'Список «новых» — не правда, а повод открыть. Решение, меняет ли работа правило '
          'паттерна, принимает человек; запрос мог захватить и смежное.\n',
          '## Итог\n',
          '| Паттерн | В PubMed всего | Взято | В паттерне | В базе | Новых |',
          '|---|---|---|---|---|---|']
    details = []
    totals = [0, 0, 0, 0]
    for p in wanted:
        print(f'{p} …', end=' ', flush=True)
        total, works = search(p)
        mine = by_topic.get(p, set())
        in_p = [w for w in works if w['doi'] and w['doi'] in mine]
        in_kb = [w for w in works if w['doi'] and w['doi'] in known and w['doi'] not in mine]
        new = [w for w in works if not (w['doi'] and w['doi'] in known)]
        print(f'{len(works)} взято, новых {len(new)}')
        totals = [totals[0] + len(works), totals[1] + len(in_p), totals[2] + len(in_kb), totals[3] + len(new)]
        md.append(f'| `{p}` | {total} | {len(works)} | {len(in_p)} | {len(in_kb)} | **{len(new)}** |')

        d = [f'\n### `{p}` — новых {len(new)} из {len(works)}\n']
        for w in new[:SHOW_NEW]:
            kind = ', '.join(w['types']) or 'статья'
            link = f'https://pubmed.ncbi.nlm.nih.gov/{w["pmid"]}/'
            d.append(f'- {w["title"]}. *{w["journal"]}*, {w["year"]}. {kind}. [PubMed]({link})'
                     + (f' · doi:{w["doi"]}' if w['doi'] else ''))
        if len(new) > SHOW_NEW:
            d.append(f'- … ещё {len(new) - SHOW_NEW}')
        if in_kb:
            d.append('\n_Есть в базе, но не в этом паттерне:_ ' +
                     '; '.join(f'[{w["pmid"]}](https://pubmed.ncbi.nlm.nih.gov/{w["pmid"]}/)' for w in in_kb))
        details.append('\n'.join(d))

    md.append(f'| **Всего** | | {totals[0]} | {totals[1]} | {totals[2]} | **{totals[3]}** |')
    md.append('\n## Новые работы по паттернам\n')
    md.extend(details)
    md.append('\n## Запросы\n')
    md.append('Общий фильтр: `' + COMMON[len(' AND '):] + '`\n')
    for p in wanted:
        md.append(f'- `{p}`: `{QUERIES[p]}`')
    with open(OUT_MD, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md) + '\n')
    print(f'Взято {totals[0]} | в паттерне {totals[1]} | в базе {totals[2]} | новых {totals[3]}')
    print(f'→ {os.path.relpath(OUT_MD, REPO)}')


if __name__ == '__main__':
    main()
