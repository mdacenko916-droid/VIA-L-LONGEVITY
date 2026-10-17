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
        mm = re.match(r'^\*(\d+)\s+([^*]+)\*$', t.strip())
        if mm and not minutes:
            minutes = t.strip().strip('*'); continue
        if t.strip() == '---':
            close_ul(); continue
        if t.startswith('**На чём основано**'):
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
    return {'t': title, 'min': minutes, 'h': ''.join(out), 'codes': codes}


def main():
    data, skipped = {}, {}
    for lang in sorted(os.listdir(SRC)):
        d = os.path.join(SRC, lang)
        if not os.path.isdir(d):
            continue
        have = {f[:-3] for f in os.listdir(d) if f.endswith('.md')}
        missing = [k for k in ALL_KEYS if k not in have]
        if missing:
            skipped[lang] = missing; continue
        data[lang] = {k: convert(os.path.join(d, k + '.md')) for k in ALL_KEYS}
    js = ('/* VIA·L — библиотека статей. СОБРАНО tools/build-articles.py из docs/articles/<язык>/*.md — руками не править.\n'
          '   Данные: ART[язык][ключ] = {t: заголовок, min: время чтения, h: HTML тела, codes: темы базы для «На чём основано»}. */\n'
          'window.VIAL_ART = ' + json.dumps({'sections': SECTIONS, 'langs': data}, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(OUT, 'w', encoding='utf-8').write(js)
    print('→', os.path.relpath(OUT, REPO), '| языки:', ', '.join(sorted(data)) or '—',
          '| пропущены (не все статьи):', skipped or '—')


if __name__ == '__main__':
    main()
