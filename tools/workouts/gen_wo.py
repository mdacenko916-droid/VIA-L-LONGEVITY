import json, os
H=os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
for f in ['tr_uk_en','tr_es_de','tr_pt_fr','tr_pl_it','tr_he_ja_ko','tr_extra','tr_ui']: exec(open(f+'.py').read())
ru=json.load(open('names.json')); W=json.load(open('workouts_ru.json'))
N={'ru':ru,'uk':uk,'en':en,'es':es,'de':de,'pt':pt,'fr':fr,'pl':pl,'it':it,'he':he,'ja':ja,'ko':ko}
base=len(ru)
for l in LANGS:
    assert len(N[l])==199 and len(X[l])==15, l
    N[l]=N[l]+X[l]
idx={n:i for i,n in enumerate(ru)}
TK={'Сила: ноги и ягодицы':'legs','Сила: спина, плечи, руки':'upper','Сила: грудь, спина, плечи':'upperM','Сила: всё тело':'full','Корпус и тазовое дно':'core','Корпус, спина и тазовое дно':'coreM','Баланс и ловкость':'bal','Мобильность суставов':'mob','HIIT':'hiit','Кардио: база':'cb','Кардио: короткие интервалы':'cs','Кардио: интервалы':'ci'}
CAT={'legs':'legs','upper':'upper','upperM':'upper','full':'full','core':'core','coreM':'core','bal':'bal','mob':'mob','hiit':'hiit','cb':'cardio','cs':'cardio','ci':'cardio'}
LK={'старт':'start','регулярный':'reg','тренированный':'tr','все уровни':'all','все, первые ~6 недель':'all6'}
OUT={}
for w in W:
    wid=('w' if w['track']=='w' else 'm')+w['id'].lstrip('№М')
    parts=[]
    if w['id'] in BR:
        k,m,its=BR[w['id']]
        parts.append([k,m,0,[[ (31 if a=='b31' else base+a), d] for a,d in its]])
    for p in w['parts']:
        parts.append([p['k'],p['m'],p['r'] or 0,[[idx[n],d] for n,d in p['items']]])
    ti=TK[w['title']]
    tot=sum(p[1] for p in parts)
    OUT[wid]=dict(ti=ti,c=CAT[ti],lv=LK[w['level']],m=w['min'],inv=INV_OF[w['id']],p=parts)
    print(wid,w['min'],tot+1, 'OK' if abs(w['min']-tot-1)<=1 else '!!')
J=lambda o: json.dumps(o,ensure_ascii=False,separators=(',',':'))
head='''/* VIA·L — «Тренировка дня» (этап 1: текстом, без видео), 2026-10-10.
   30 тренировок (женский трек w1–w15, мужской m1–m15) из docs/FITNESS-WORKOUTS.md, выбор — КОДОМ по
   docs/FITNESS-SELECTION-RULES.md (давление → без тренировки; восстановление хуже нормы → мобильность / полегче;
   вчерашняя зона; недобор недели). ИИ выбор не делает — в разборе только объясняет.
   Названия упражнений ×12 — массив N по индексу; дозы хранятся по-русски и переводятся dose() по единицам U.
   Правка плана: docs/FITNESS-WORKOUTS.md → пересобрать этот файл (python3 tools/workouts/gen_wo.py).
   Этап 2 — описание выполнения, этап 3 — кнопка видео: добавлять полем к упражнению, структуру не менять. */
(function () {
'''
body=('  var N = '+J(N)+';\n  var W = '+J(OUT)+';\n  var TI = '+J(TITLE)+';\n  var LVL = '+J(LEVEL)+';\n  var INV = '+J(INV)+';\n  var PART = '+J(PART)+';\n  var U = '+J(UNIT)+';\n  var UI = '+J(UI)+';\n  var WHY = '+J(WHY)+';\n')
open(os.path.join(H,'../../interpreter/workouts.js'),'w').write(head+body+open('wo_logic.js').read())
