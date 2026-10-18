#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Библиотека статей VIA-L: docs/articles/<язык>/<ключ>.md → interpreter/articles.js (данные для приложения).

Источник правды — markdown в docs/articles/ (русский — канон, вычитан специалистом). Руками articles.js не правим:
поправили статью → запустили сборку. Язык попадает в приложение, только когда в нём есть ВСЕ статьи набора
(иначе строка «Статьи» в «Профиле» этому языку не показывается — полупереведённой библиотеки не бывает).

Что берётся из файла:
  • заголовок `# …`, строка `*N минут чтения*`, тело (## подзаголовки, абзацы, списки `- `, **жирный**, *курсив*);
  • коды тем базы знаний для «На чём основано» — из служебного комментария <!-- … -->: все P-F*/P-M* после
    слов «На чём основано». Строка «**На чём основано** — …» в тексте заменяется блоком с работами реестра
    (evidence.js, режим статьи), текст строки не показывается.

Запуск: python3 tools/build-articles.py
"""
import os, re, json, html

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, 'docs', 'articles')
OUT = os.path.join(REPO, 'interpreter', 'articles.js')

# Порядок и разделы (docs/ARTICLE-LIBRARY-PLAN.md §7б)
SECTIONS = [
    ('start', ['start-peri', 'start-meno', 'start-tests']),
    ('cmp',   ['hf', 'sleep', 'energy', 'mood', 'fog', 'weight', 'pain', 'muscle', 'libido_f', 'cycle']),
    ('step',  ['evening', 'wake', 'strength', 'protein', 'cool', 'walk', 'breath', 'bed', 'order']),
]
ALL_KEYS = [k for _, ks in SECTIONS for k in ks]
# Мужской раздел (2026-10-17, P-M1…P-M11): мужчине приложение показывает его вместо женского. Язык получает мужской раздел,
# только когда в нём есть все мужские статьи; без них язык остаётся с женским разделом (мужчине «Основы» не показываются).
SECTIONS_M = [
    ('start', ['start-andro', 'start-tests_m']),
    ('cmp',   ['sleep_m', 'energy_m', 'mood_m', 'fog_m', 'drive', 'weight_m', 'pain_m', 'muscle_m', 'libido_m']),
    ('men',   ['prostate', 'heart_m']),
]
ALL_KEYS_M = [k for _, ks in SECTIONS_M for k in ks]
# Мужские «Что делать» (2026-10-18, вычитаны специалистом): отдельная группа — язык получает её, когда есть все 8 статей,
# и не теряет мужской раздел, пока они не переведены. «Прохладной спальни» (cool) для мужчин нет: в базе P-M нет опоры.
STEP_M = ['evening_m', 'wake_m', 'strength_m', 'protein_m', 'walk_m', 'breath_m', 'bed_m', 'order_m']


def men_keys(have):
    """Мужские ключи языка: основной набор + «Что делать», если переведены все шаги; [] — мужского раздела нет."""
    if not all(k in have for k in ALL_KEYS_M):
        return []
    return ALL_KEYS_M + (STEP_M if all(k in have for k in STEP_M) else [])

# Языки, которые уходят в приложение: только вычитанные специалистом. Переведено, но не вычитано — лежит в
# docs/articles/<язык>/ и в сборку не идёт. Проверить невычитанный язык локально: ARTICLES_LANGS=ru,uk python3 …
PUBLISH = {'ru', 'uk', 'en', 'es', 'fr', 'de', 'pl', 'it', 'pt', 'he', 'ja', 'ko'}   # ru, uk — вычитаны специалистом 2026-10-17; en, es, fr, de, pl, it, pt, he, ja, ko — вычитать некому, решение владельца 2026-10-17: проверены сверкой с ru
# Подпись «Проверено специалистом VIA-L» — только у языков, которые вычитал специалист. Остальные опубликованы по
# решению владельца после сверки с ru: подписи у них нет (иначе это неправда — 2026-10-17).
REVIEWED = {'ru', 'uk'}
if os.environ.get('ARTICLES_LANGS'):
    PUBLISH = set(os.environ['ARTICLES_LANGS'].split(','))

# Строка-метка «На чём основано» в тексте статьи — на языке статьи (заменяется блоком работ реестра).
# Коды тем берутся из служебного комментария; в переводах комментарий оставляем русским (он внутренний).
EV_MARKS = ('**На чём основано**', '**На чому ґрунтується**', '**What this is based on**', '**En qué se basa**',
            '**Worauf das beruht**', '**Em que se baseia**', '**Sur quoi cela repose**', '**Na czym to się opiera**',
            '**Su cosa si basa**', '**על מה זה מבוסס**', '**この記事の根拠**', '**이 글의 근거**')


def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)', r'<i>\1</i>', s)
    return s


def convert(path):
    raw = open(path, encoding='utf-8').read()
    m = re.search(r'<!--(.*?)-->', raw, re.S)
    meta = m.group(1) if m else ''
    codes = []
    i = meta.find('На чём основано')
    if i >= 0:
        codes = list(dict.fromkeys(re.findall(r'P-[FM]\d+', meta[i:])))
    body = re.sub(r'<!--.*?-->\s*', '', raw, flags=re.S).strip().split('\n')
    title, minutes, out, ul = '', '', [], False

    def close_ul():
        nonlocal ul
        if ul:
            out.append('</ul>'); ul = False

    for line in body:
        t = line.rstrip()
        if not t.strip():
            close_ul(); continue
        if t.startswith('# '):
            title = t[2:].strip(); continue
        mm = re.match(r'^\*(\d+)\s*([^*]+)\*$', t.strip())   # \s* — в ja/ko нет пробела («4分», «4분»)
        if mm and not minutes:
            minutes = t.strip().strip('*'); continue
        if t.strip() == '---':
            close_ul(); continue
        if t.startswith(EV_MARKS):
            close_ul(); out.append('<!--EV-->'); continue
        if t.startswith('## '):
            close_ul(); out.append('<h3 class="art-h">' + inline(t[3:].strip()) + '</h3>'); continue
        if t.startswith('- '):
            if not ul:
                out.append('<ul class="art-ul">'); ul = True
            out.append('<li>' + inline(t[2:].strip()) + '</li>'); continue
        close_ul()
        cls = 'art-p art-note' if (t.startswith('*') and t.endswith('*') and not t.startswith('**')) else 'art-p'
        out.append('<p class="' + cls + '">' + inline(t.strip()) + '</p>')
    close_ul()
    if not title:
        raise SystemExit('нет заголовка: ' + path)
    a = {'t': title, 'min': minutes, 'h': ''.join(out), 'codes': codes}
    if 'Вычитано специалистом' not in meta:
        a['nr'] = 1   # не вычитано специалистом: подписи «Проверено специалистом» у этой статьи нет, даже в ru/uk
    return a


def main():
    data, skipped, men = {}, {}, []
    for lang in sorted(os.listdir(SRC)):
        d = os.path.join(SRC, lang)
        if not os.path.isdir(d):
            continue
        if lang not in PUBLISH:
            skipped[lang] = 'не вычитано'; continue
        have = {f[:-3] for f in os.listdir(d) if f.endswith('.md')}
        missing = [k for k in ALL_KEYS if k not in have]
        if missing:
            skipped[lang] = missing; continue
        data[lang] = {k: convert(os.path.join(d, k + '.md')) for k in ALL_KEYS}
        mk = men_keys(have)
        if mk:
            data[lang].update({k: convert(os.path.join(d, k + '.md')) for k in mk})
            men.append(lang)
    js = ('/* VIA·L — библиотека статей. СОБРАНО tools/build-articles.py из docs/articles/<язык>/*.md — руками не править.\n'
          '   Данные: ART[язык][ключ] = {t: заголовок, min: время чтения, h: HTML тела, codes: темы базы для «На чём основано»}. */\n'
          'window.VIAL_ART = ' + json.dumps({'sections': SECTIONS, 'sectionsM': SECTIONS_M + [('step', STEP_M)], 'men': sorted(men), 'reviewed': sorted(REVIEWED & set(data)), 'langs': data}, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(OUT, 'w', encoding='utf-8').write(js)
    print('→', os.path.relpath(OUT, REPO), '| языки:', ', '.join(sorted(data)) or '—',
          '| мужской раздел:', ', '.join(sorted(men)) or '—', '| пропущены (не все статьи):', skipped or '—')


if __name__ == '__main__':
    main()
