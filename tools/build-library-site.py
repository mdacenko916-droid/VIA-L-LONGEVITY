#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Библиотека на сайте: docs/articles/<язык>/*.md → library/<язык>/index.html + library/<язык>/<ключ>.html
(docs/ARTICLE-LIBRARY-PLAN.md §6, §7а). Тот же источник, что у приложения (tools/build-articles.py): правим
статью в docs/articles → запускаем обе сборки. Руками library/ не правим.

Языки сайта — uk, ru, en, es (сайт Европы, 4 языка; приложение — 12). Язык попадает на сайт, только если он
в PUBLISH сборщика приложения (вычитан или разрешён владельцем) и в нём есть все статьи.

«На чём основано» — статический список работ из interpreter/evidence-registry.json по кодам тем статьи
(как в приложении: свежие сверху, 12 сразу, остальные под «Показать все»). Сайт ведёт в приложение (сторы),
приложение на сайт — нет (feedback_via_l_appstore_isolation).

Запуск: python3 tools/build-library-site.py   (заодно дописывает страницы в sitemap.xml)
"""
import os, re, json, html, importlib.util

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, 'library')
BASE = 'https://via-l.com/library'
SITE_LANGS = ['uk', 'ru', 'en', 'es']        # порядок в переключателе; uk — язык по умолчанию сайта
DEFAULT = 'uk'
REVIEWED = '2026-10-17'

spec = importlib.util.spec_from_file_location('ba', os.path.join(REPO, 'tools', 'build-articles.py'))
BA = importlib.util.module_from_spec(spec); spec.loader.exec_module(BA)

APP_STORE = 'https://apps.apple.com/app/via-l-midlife-explained/id6807062006'
PLAY = 'https://play.google.com/store/apps/details?id=com.viael.vial'

UI = {
    'lib':     {'uk': 'Бібліотека', 'ru': 'Библиотека', 'en': 'Library', 'es': 'Biblioteca'},
    'title':   {'uk': 'Бібліотека VIA-L: перименопауза й менопауза', 'ru': 'Библиотека VIA-L: перименопауза и менопауза',
                'en': 'VIA-L Library: perimenopause and menopause', 'es': 'Biblioteca VIA-L: perimenopausia y menopausia'},
    'lead':    {'uk': 'Прості й чесні статті про те, що відбувається з тілом у перехідні роки, і що справді допомагає. Кожна стаття ґрунтується на опублікованих дослідженнях і перевірена спеціалістом.',
                'ru': 'Простые и честные статьи о том, что происходит с телом в переходные годы, и что действительно помогает. Каждая статья основана на опубликованных исследованиях и проверена специалистом.',
                'en': 'Plain, honest articles about what happens to the body in the transition years, and what really helps. Every article is based on published research and reviewed by a specialist.',
                'es': 'Artículos sencillos y honestos sobre lo que le pasa al cuerpo en los años de transición y lo que de verdad ayuda. Cada artículo se basa en estudios publicados y está revisado por una especialista.'},
    'leadNr':  {'uk': '', 'ru': '',
                'en': 'Plain, honest articles about what happens to the body in the transition years, and what really helps. Every article is based on published research.',
                'es': 'Artículos sencillos y honestos sobre lo que le pasa al cuerpo en los años de transición y lo que de verdad ayuda. Cada artículo se basa en estudios publicados.'},
    'leadM':   {'uk': 'Прості й чесні статті про те, що відбувається з тілом після 40, і що справді допомагає. Кожна стаття ґрунтується на опублікованих дослідженнях; статті для жінок перевірені спеціалістом.',
                'ru': 'Простые и честные статьи о том, что происходит с телом после 40, и что действительно помогает. Каждая статья основана на опубликованных исследованиях; статьи для женщин проверены специалистом.',
                'en': '', 'es': ''},
    'search':  {'uk': 'Пошук статті', 'ru': 'Поиск статьи', 'en': 'Search articles', 'es': 'Buscar un artículo'},
    'none':    {'uk': 'Нічого не знайшлося.', 'ru': 'Ничего не нашлось.', 'en': 'Nothing found.', 'es': 'No se ha encontrado nada.'},
    'start':   {'uk': 'З чого почати', 'ru': 'С чего начать', 'en': 'Where to start', 'es': 'Por dónde empezar'},
    'cmp':     {'uk': 'Що турбує', 'ru': 'Что беспокоит', 'en': 'What bothers you', 'es': 'Qué te preocupa'},
    'step':    {'uk': 'Що робити', 'ru': 'Что делать', 'en': 'What to do', 'es': 'Qué hacer'},
    'men':     {'uk': 'Чоловікам', 'ru': 'Мужчинам', 'en': 'For men', 'es': 'Para hombres'},
    'check':   {'uk': 'Перевірено спеціалістом VIA-L', 'ru': 'Проверено специалистом VIA-L', 'en': 'Reviewed by a VIA-L specialist', 'es': 'Revisado por un especialista de VIA-L'},
    'ev':      {'uk': 'На чому ґрунтується', 'ru': 'На чём основано', 'en': 'What this is based on', 'es': 'En qué se basa'},
    'evHead':  {'uk': 'Статтю написано за темами бази знань VIA-L. За ними стоять опубліковані роботи — ось вони:',
                'ru': 'Статья написана по темам базы знаний VIA-L. За ними стоят опубликованные работы — вот они:',
                'en': 'This article is based on topics from the VIA-L knowledge base. These are the published studies behind them:',
                'es': 'Este artículo se basa en temas de la base de conocimiento de VIA-L. Estos son los estudios publicados que hay detrás:'},
    'evWeak':  {'uk': 'Доказова сила цих робіт різна: десь великі огляди та мета-аналізи, десь окремі невеликі дослідження. Кроки в статті — прості заходи турботи про себе з низьким ризиком, а не лікування, і підходять не всім.',
                'ru': 'Доказательная сила у этих работ разная: где-то крупные обзоры и мета-анализы, где-то отдельные небольшие исследования. Шаги в статье — простые меры заботы о себе с низким риском, а не лечение, и подходят не всем.',
                'en': 'The strength of this evidence varies: some are large reviews and meta-analyses, some are small single studies. The steps in the article are simple, low-risk self-care measures, not treatment, and they may not suit everyone.',
                'es': 'La solidez de esta evidencia varía: hay grandes revisiones y metaanálisis, y también estudios pequeños aislados. Los pasos del artículo son medidas sencillas de autocuidado de bajo riesgo, no un tratamiento, y pueden no servir para todos.'},
    'all':     {'uk': 'Показати всі', 'ru': 'Показать все', 'en': 'Show all', 'es': 'Ver todos'},
    'more':    {'uk': 'Читати далі', 'ru': 'Читать дальше', 'en': 'Keep reading', 'es': 'Sigue leyendo'},
    'back':    {'uk': 'Усі статті', 'ru': 'Все статьи', 'en': 'All articles', 'es': 'Todos los artículos'},
    'appNav':  {'uk': 'Застосунок', 'ru': 'Приложение', 'en': 'App', 'es': 'App'},
    'specNav': {'uk': 'Спеціаліст', 'ru': 'Специалист', 'en': 'Specialist', 'es': 'Especialista'},
    'dlTitle': {'uk': 'Застосунок VIA-L', 'ru': 'Приложение VIA-L', 'en': 'The VIA-L app', 'es': 'La app VIA-L'},
    'dlNote':  {'uk': 'Усі статті бібліотеки є й у застосунку.', 'ru': 'Все статьи библиотеки есть и в приложении.',
                'en': 'All library articles are in the app too.', 'es': 'Todos los artículos de la biblioteca están también en la app.'},
}


def tx(k, lang):
    return UI[k][lang]


def esc(s):
    return html.escape(str(s), quote=True)


def lp_texts():
    """h_sub лендинга (interpreter/index.html, уже опубликован) — описание приложения ×4."""
    s = open(os.path.join(REPO, 'interpreter', 'index.html'), encoding='utf-8').read()
    i = s.find('const LP_T = ') + len('const LP_T = ')
    o, _ = json.JSONDecoder().raw_decode(s[i:])
    return {L: o[L]['h_sub'] for L in SITE_LANGS}


CSS = """
:root{--cream:#EAE1C9;--cream-dk:#E3D9BF;--card:#F4EDE3;--gold:#6B4F2A;--gold-lt:#8B6030;--text:#0D0A05;--text-lt:#2E2010;--muted:#5A4A35;--line:rgba(139,111,71,.22);}
*{box-sizing:border-box;}
html{-webkit-text-size-adjust:100%;}
body{margin:0;background:var(--cream);color:var(--text);font-family:'DM Sans',system-ui,sans-serif;font-size:18px;line-height:1.7;-webkit-font-smoothing:antialiased;}
a{color:var(--gold-lt);}
.wrap{max-width:760px;margin:0 auto;padding:0 20px;}
header.top{border-bottom:1px solid var(--line);background:var(--cream);}
header.top .wrap{display:flex;align-items:center;gap:6px 14px;padding-top:12px;padding-bottom:10px;flex-wrap:wrap;}
.brand{order:1;}
.langs{order:2;margin-left:auto;}
nav.menu{order:3;width:100%;}
@media(min-width:720px){nav.menu{order:2;width:auto;margin-left:28px;}.langs{order:3;}}
.brand{font-family:'Cormorant Garamond',serif;font-size:24px;letter-spacing:.18em;color:var(--gold);text-decoration:none;white-space:nowrap;}
nav.menu{display:flex;gap:18px;font-size:15px;flex-wrap:wrap;line-height:1.4;}
nav.menu a{text-decoration:none;color:var(--text-lt);}
nav.menu a.on{color:var(--gold-lt);font-weight:500;}
.langs{display:flex;gap:6px;font-size:13px;letter-spacing:.06em;}
.langs a{text-decoration:none;color:var(--muted);padding:2px 6px;border-radius:6px;}
.langs a.on{background:var(--gold);color:#F4EDE3;}
h1{font-family:'Playfair Display',serif;font-weight:400;font-size:clamp(30px,6vw,44px);line-height:1.2;margin:36px 0 12px;color:var(--text);}
.lead{color:var(--text-lt);font-size:19px;margin:0 0 22px;}
.search{width:100%;padding:12px 16px;border:1px solid var(--line);border-radius:12px;background:var(--card);font:inherit;font-size:16px;color:var(--text);margin:0 0 8px;}
.none{color:var(--muted);display:none;}
h2.sec{font-family:'Playfair Display',serif;font-weight:400;font-size:26px;margin:34px 0 12px;color:var(--gold);}
.cards{display:grid;gap:12px;}
.card{display:block;text-decoration:none;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;color:var(--text);transition:border-color .2s;}
.card:hover{border-color:var(--gold-lt);}
.card .t{font-family:'Playfair Display',serif;font-size:20px;line-height:1.3;display:block;}
.card .m{font-size:14px;color:var(--muted);display:block;margin-top:6px;}
article h1{margin-top:28px;}
.meta{font-size:14px;color:var(--muted);display:flex;gap:14px;flex-wrap:wrap;margin:0 0 22px;}
.meta .ok::before{content:'✓ ';color:var(--gold-lt);}
.art-h{font-family:'Playfair Display',serif;font-weight:500;font-size:24px;line-height:1.3;margin:32px 0 10px;color:var(--gold);}
.art-p{margin:0 0 14px;}
.art-note{color:var(--muted);font-size:15px;font-style:italic;}
.art-ul{margin:0 0 14px;padding-left:22px;}
.art-ul li{margin:0 0 6px;}
.ev{margin:30px 0 10px;padding:18px;border:1px solid var(--line);border-radius:16px;background:var(--card);font-size:15px;}
.ev h2{font-family:'Playfair Display',serif;font-weight:400;font-size:22px;margin:0 0 8px;color:var(--gold);}
.ev ol{padding-left:22px;margin:10px 0;}
.ev li{margin:0 0 6px;line-height:1.5;}
.ev .j{color:var(--muted);}
.ev details summary{cursor:pointer;color:var(--gold-lt);margin:6px 0;}
.ev .note{color:var(--muted);}
.dl{margin:30px 0;padding:22px;border-radius:18px;background:var(--gold);color:#F4EDE3;}
.dl h2{font-family:'Playfair Display',serif;font-weight:400;font-size:24px;margin:0 0 8px;color:#F4EDE3;}
.dl p{margin:0 0 14px;font-size:16px;}
.stores{display:flex;gap:10px;flex-wrap:wrap;}
.stores a{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:12px;background:#F4EDE3;color:var(--gold);text-decoration:none;font-weight:500;font-size:15px;}
.more h2{font-family:'Playfair Display',serif;font-weight:400;font-size:24px;margin:30px 0 12px;color:var(--gold);}
.backl{display:inline-block;margin:22px 0 0;text-decoration:none;font-size:15px;}
html.in-app .dl,html.in-app .to-app,html.in-app .to-site{display:none!important;}
footer{margin:46px 0 0;padding:22px 0 40px;border-top:1px solid var(--line);font-size:13px;color:var(--muted);}
"""

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Playfair+Display:wght@400;500&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">')

APPLE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.5 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.3-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.4 0 2.2-1.2 3-2.4 1-1.4 1.4-2.7 1.4-2.8-.1 0-2.5-1-2.5-4.2zM14 5.1c.7-.8 1.1-1.9 1-3.1-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>'
GPLAY = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M4 2.6c-.3.3-.4.7-.4 1.2v16.4c0 .5.1.9.4 1.2l9.2-9.4L4 2.6zm10.4 8.2 2.6-2.6L6.2 2.1c-.3-.2-.7-.2-1 0l9.2 8.7zm0 2.4-9.2 8.7c.3.2.7.2 1 0l10.8-6.1-2.6-2.6zm5.9-2.8-2.5-1.4-2.8 2.8 2.8 2.8 2.5-1.4c.7-.4.7-1.4 0-1.8z"/></svg>'


# Режим «из приложения» (владелец 2026-10-17): книга в VIA-L ведёт сюда с ?app=1. Прячем всё, что уводит на главную via-l.com
# (там цены и гайды Hotmart — правило App Store 3.1.1 / Play Billing) и блок «скачать приложение»: остаются статьи, поиск, языки.
# Метка держится на вкладке браузера (sessionStorage), чтобы переходы по статьям её не теряли.
APP_MODE = ('<script>try{if(/[?&]app=1/.test(location.search))sessionStorage.setItem("vialApp","1");'
            'if(sessionStorage.getItem("vialApp"))document.documentElement.classList.add("in-app");}catch(e){}</script>')


def page(lang, title, desc, path, body, alt_paths):
    """path — относительно library/, напр. 'uk/hf.html'; alt_paths — {lang: path} для hreflang и переключателя."""
    alts = ''.join('<link rel="alternate" hreflang="%s" href="%s/%s">' % (L, BASE, p) for L, p in alt_paths.items())
    alts += '<link rel="alternate" hreflang="x-default" href="%s/%s">' % (BASE, alt_paths.get(DEFAULT, path))
    langs = ''.join('<a href="../%s"%s>%s</a>' % (p, ' class="on" aria-current="true"' if L == lang else '', L.upper())
                    for L, p in alt_paths.items())
    return ('<!doctype html><html lang="%s"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
            '<title>%s</title><meta name="description" content="%s"><link rel="canonical" href="%s/%s">%s'
            '<meta property="og:type" content="article"><meta property="og:title" content="%s"><meta property="og:description" content="%s">'
            '<meta property="og:url" content="%s/%s"><meta name="robots" content="index, follow">%s<style>%s</style>' + APP_MODE + '</head><body>'
            '<header class="top"><div class="wrap"><a class="brand" href="../%s/">VIA·L</a>'
            '<nav class="menu"><a class="on" href="../%s/">%s</a><a class="to-app" href="#app">%s</a><a class="to-site" href="https://via-l.com/">%s</a></nav>'
            '<div class="langs">%s</div></div></header><main class="wrap">%s</main>'
            '<footer class="wrap">© VIA-L<span class="to-site"> · <a href="https://via-l.com/">via-l.com</a></span></footer></body></html>'
            ) % (lang, esc(title), esc(desc), BASE, path, alts, esc(title), esc(desc), BASE, path, FONTS, CSS,
                 lang, lang, tx('lib', lang), tx('appNav', lang), tx('specNav', lang), langs, body)


def dl_block(lang, sub):
    return ('<section class="dl" id="app"><h2>%s</h2><p>%s</p><p>%s</p><div class="stores">'
            '<a href="%s" target="_blank" rel="noopener">%s<span>App Store</span></a>'
            '<a href="%s" target="_blank" rel="noopener">%s<span>Google Play</span></a></div></section>'
            ) % (tx('dlTitle', lang), esc(sub), tx('dlNote', lang), APP_STORE, APPLE, PLAY, GPLAY)


def ev_block(lang, codes, reg):
    seen, lst = set(), []
    for p in codes:
        for doi in reg['byPattern'].get(p, []):
            if doi in seen or doi not in reg['sources']:
                continue
            seen.add(doi); lst.append(doi)
    lst.sort(key=lambda d: reg['sources'][d].get('y') or '', reverse=True)

    def row(doi):
        s = reg['sources'][doi]
        j = ' — ' + esc(s['j']) + (', ' + esc(s['y']) if s.get('y') else '') if s.get('j') else (' — ' + esc(s['y']) if s.get('y') else '')
        return '<li>%s<span class="j">%s</span> <a href="https://doi.org/%s" target="_blank" rel="noopener">doi</a></li>' % (esc(s['t']), j, esc(doi))
    h = '<section class="ev"><h2>%s</h2><p class="note">%s</p><ol>%s</ol>' % (tx('ev', lang), tx('evHead', lang), ''.join(row(d) for d in lst[:12]))
    if len(lst) > 12:
        h += '<details><summary>%s (%d)</summary><ol start="13">%s</ol></details>' % (tx('all', lang), len(lst), ''.join(row(d) for d in lst[12:]))
    return h + '<p class="note">%s</p></section>' % tx('evWeak', lang)


def plain(h):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', h))).strip()


def main():
    reg = json.load(open(os.path.join(REPO, 'interpreter', 'evidence-registry.json'), encoding='utf-8'))
    sub = lp_texts()
    langs = [L for L in SITE_LANGS if L in BA.PUBLISH and all(
        os.path.exists(os.path.join(BA.SRC, L, k + '.md')) for k in BA.ALL_KEYS)]
    data = {L: {k: BA.convert(os.path.join(BA.SRC, L, k + '.md')) for k in BA.ALL_KEYS} for L in langs}
    for L in langs:   # мужской раздел — только язык, где есть все мужские статьи
        if all(os.path.exists(os.path.join(BA.SRC, L, k + '.md')) for k in BA.ALL_KEYS_M):
            data[L].update({k: BA.convert(os.path.join(BA.SRC, L, k + '.md')) for k in BA.ALL_KEYS_M})
    urls = []
    for L in langs:
        os.makedirs(os.path.join(OUT, L), exist_ok=True)
        d = data[L]
        # ── главная библиотеки на языке ──
        secs = ''
        for sec, keys in BA.SECTIONS:
            secs += '<h2 class="sec">%s</h2><div class="cards">' % tx(sec, L)
            for k in keys:
                secs += '<a class="card" href="%s.html" data-s="%s"><span class="t">%s</span><span class="m">%s</span></a>' % (
                    k, esc((d[k]['t'] + ' ' + plain(d[k]['h'].split('<!--EV-->')[0])).lower()), esc(d[k]['t']), esc(d[k]['min']))
            secs += '</div>'
        men = all(k in d for k in BA.ALL_KEYS_M)
        if men:   # мужской раздел — одним блоком «Мужчинам» (2026-10-17)
            secs += '<h2 class="sec">%s</h2><div class="cards">' % tx('men', L)
            for k in BA.ALL_KEYS_M:
                secs += '<a class="card" href="%s.html" data-s="%s"><span class="t">%s</span><span class="m">%s</span></a>' % (
                    k, esc((d[k]['t'] + ' ' + plain(d[k]['h'].split('<!--EV-->')[0])).lower()), esc(d[k]['t']), esc(d[k]['min']))
            secs += '</div>'
        search = ('<input class="search" type="search" placeholder="%s" aria-label="%s" oninput="var q=this.value.trim().toLowerCase(),n=0;'
                  'document.querySelectorAll(\'.card\').forEach(function(c){var on=!q||c.dataset.s.indexOf(q)>-1;c.style.display=on?\'\':\'none\';if(on)n++;});'
                  'document.querySelectorAll(\'h2.sec\').forEach(function(h){var any=[].some.call(h.nextElementSibling.children,function(c){return c.style.display!==\'none\';});h.style.display=any?\'\':\'none\';});'
                  'document.querySelector(\'.none\').style.display=n?\'none\':\'block\';">'
                  '<p class="none">%s</p>') % (tx('search', L), tx('search', L), tx('none', L))
        nr = any(d[k].get('nr') for k in d)   # есть невычитанные статьи (мужские переводы) — не обещаем «каждая проверена»
        lead = (tx('leadM', L) if nr else tx('lead', L)) if L in BA.REVIEWED else tx('leadNr', L)
        body = '<h1>%s</h1><p class="lead">%s</p>%s%s%s' % (tx('title', L), lead, search, secs, dl_block(L, sub[L]))
        alt = {X: X + '/' for X in langs}
        open(os.path.join(OUT, L, 'index.html'), 'w', encoding='utf-8').write(
            page(L, tx('title', L), lead, L + '/', body, alt))
        urls.append(L + '/')
        # ── статьи ──
        groups = list(BA.SECTIONS) + ([('men', BA.ALL_KEYS_M)] if men else [])
        for sec, keys in groups:
            for i, k in enumerate(keys):
                a = d[k]
                art = a['h'].replace('<!--EV-->', ev_block(L, a['codes'], reg))
                nxt = [keys[(i + j) % len(keys)] for j in (1, 2, 3)]
                more = '<section class="more"><h2>%s</h2><div class="cards">%s</div></section>' % (tx('more', L), ''.join(
                    '<a class="card" href="%s.html"><span class="t">%s</span><span class="m">%s</span></a>' % (n, esc(d[n]['t']), esc(d[n]['min'])) for n in nxt))
                chk = ('<span class="ok">%s · %s</span>' % (tx('check', L), REVIEWED[8:] + '.' + REVIEWED[5:7] + '.' + REVIEWED[:4])
                       if L in BA.REVIEWED and not a.get('nr') else '')   # подпись — только у вычитанных специалистом языков
                body = ('<article><a class="backl" href="./">‹ %s</a><h1>%s</h1><div class="meta"><span>%s</span>%s</div>%s</article>%s%s'
                        ) % (tx('back', L), esc(a['t']), esc(a['min']), chk, art, dl_block(L, sub[L]), more)
                desc = plain(a['h'].split('<!--EV-->')[0])
                desc = desc[:157].rsplit(' ', 1)[0] + '…' if len(desc) > 160 else desc
                alt = {X: '%s/%s.html' % (X, k) for X in langs if k in data[X]}
                open(os.path.join(OUT, L, k + '.html'), 'w', encoding='utf-8').write(
                    page(L, a['t'] + ' · VIA-L', desc, '%s/%s.html' % (L, k), body, alt))
                urls.append('%s/%s.html' % (L, k))
    # ── корень: выбор языка по сохранённому/браузерному ──
    redirect = ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
                '<title>VIA-L · %s</title><link rel="canonical" href="%s/%s/">%s'
                '<script>(function(){var L=%s,s="";try{s=localStorage.getItem("selectedLang")||"";}catch(e){}'
                'if(s==="ua")s="uk";if(L.indexOf(s)<0){var n=(navigator.language||"").slice(0,2).toLowerCase();s=L.indexOf(n)>-1?n:"%s";}'
                'location.replace(s+"/"+location.search);})();</script></head><body>%s</body></html>'
                ) % (tx('lib', DEFAULT), BASE, DEFAULT,
                     ''.join('<link rel="alternate" hreflang="%s" href="%s/%s/">' % (X, BASE, X) for X in langs),
                     json.dumps(langs), DEFAULT, ' · '.join('<a href="%s/">%s</a>' % (X, tx('lib', X)) for X in langs))
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(redirect)
    # ── sitemap: блок библиотеки пересобирается целиком ──
    sm = os.path.join(REPO, 'sitemap.xml')
    s = open(sm, encoding='utf-8').read()
    s = re.sub(r'\s*<!-- library:start -->.*?<!-- library:end -->', '', s, flags=re.S)
    block = '\n  <!-- library:start -->' + ''.join('\n  <url><loc>%s/%s</loc></url>' % (BASE, u) for u in urls) + '\n  <!-- library:end -->'
    s = s.replace('</urlset>', block + '\n</urlset>')
    open(sm, 'w', encoding='utf-8').write(s)
    print('→ library/ | языки:', ', '.join(langs), '| страниц:', len(urls) + 1)


if __name__ == '__main__':
    main()
