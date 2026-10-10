import json, os
H=os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
for f in ['tr_uk_en','tr_es_de','tr_pt_fr','tr_pl_it','tr_he_ja_ko','tr_extra','tr_ui','tr_v2']: exec(open(f+'.py').read())
ru=json.load(open('names.json')); W=json.load(open('workouts_ru.json'))
N={'ru':ru,'uk':uk,'en':en,'es':es,'de':de,'pt':pt,'fr':fr,'pl':pl,'it':it,'he':he,'ja':ja,'ko':ko}
base=len(ru)
for l in LANGS:
    assert len(N[l])==199 and len(X[l])==15, l
    N[l]=N[l]+X[l]
# каталог v2 (2026-10-08): заменённые упражнения — новые названия на тех же индексах; новые — в конец
for i,d in REN.items():
    for l in LANGS: N[l][i]=d[l]
ren_old={json.load(open('names.json'))[i]:i for i in REN}   # старые русские названия в workouts_ru.json → тот же индекс
for l in LANGS:
    assert len(NEW[l])==18, l
    N[l]=N[l]+NEW[l]
ru=N['ru']
idx={n:i for i,n in enumerate(ru)}
idx.update(ren_old)
# №13: разминка — ходьба Otago вместо шага на месте (каталог 6.6–6.9); М6: отжимания с ногами на стуле при давлении → с пола
for w in W:
    if w['id']=='№13':
        w['parts'][0]['items'][0]=[NEW['ru'][0],'60 с']
ALT={'М6':{'Отжимания, ноги на стуле, опускание на 3 счёта':'Отжимания от пола, опускание на 3 счёта'}}
# №16 «Пилатес», №17 «Тело-разум» — из каталога v2 §9 (черновик на вычитку Марине)
NR=NEW['ru']
W.append(dict(id='№16',track='w',title='Пилатес',level='все уровни',min=25,parts=[
  dict(k='br',m=4,r=None,items=[['Дыхание «канистрой» лёжа','90 с'],['Наклоны таза лёжа','60 с'],['Мост с перекатом по позвонкам','60 с']]),
  dict(k='main',m=17,r=2,items=[['Мост с перекатом по позвонкам','8'],[NR[1],'10 на каждую ногу'],[NR[2],'10 на каждую сторону'],[NR[3],'6 на каждую ногу'],[NR[4],'60 с'],[NR[5],'8 на каждую ногу'],['«Лодочка» лёжа на животе (разгибание спины)','8 на каждую сторону'],[NR[6],'6']]),
  dict(k='cool',m=3,r=None,items=[[NR[7],'по 30 с на сторону'],[NR[8],'60 с']])]))
W.append(dict(id='№17',track='w',title='Тело-разум: мягкая йога и тайцзи',level='все уровни',min=25,parts=[
  dict(k='br',m=3,r=None,items=[[NR[9],'60 с'],['Вдох на 4 счёта, выдох на 6','90 с']]),
  dict(k='main',m=17,r=None,items=[[NR[10],'2 мин'],[NR[11],'3 мин'],[NR[12],'3 мин'],[NR[13],'по 30 с на каждую ногу'],[NR[14],'по 30 с на каждую сторону'],[NR[15],'45 с'],[NR[16],'60 с'],['«Кошка-корова» на четвереньках с дыханием','60 с']]),
  dict(k='cool',m=4,r=None,items=[['Лёжа, ноги на стуле, спокойное дыхание','2 мин'],[NR[17],'2 мин']])]))
INV_OF['№16']=['mat','pillow']; INV_OF['№17']=['mat','chair','wall']
TK={'Сила: ноги и ягодицы':'legs','Сила: спина, плечи, руки':'upper','Сила: грудь, спина, плечи':'upperM','Сила: всё тело':'full','Корпус и тазовое дно':'core','Корпус, спина и тазовое дно':'coreM','Баланс и ловкость':'bal','Мобильность суставов':'mob','HIIT':'hiit','Кардио: база':'cb','Кардио: короткие интервалы':'cs','Кардио: интервалы':'ci','Пилатес':'pil','Тело-разум: мягкая йога и тайцзи':'mind'}
CAT={'legs':'legs','upper':'upper','upperM':'upper','full':'full','core':'core','coreM':'core','bal':'bal','mob':'mob','hiit':'hiit','cb':'cardio','cs':'cardio','ci':'cardio','pil':'pil','mind':'mind'}
LK={'старт':'start','регулярный':'reg','тренированный':'tr','все уровни':'all','все, первые ~6 недель':'all6'}
OUT={}
for w in W:
    wid=('w' if w['track']=='w' else 'm')+w['id'].lstrip('№М')
    parts=[]
    if w['id'] in BR:
        k,m,its=BR[w['id']]
        parts.append([k,m,0,[[ (31 if a=='b31' else base+a), d] for a,d in its]])
    for p in w['parts']:
        alt=ALT.get(w['id'],{})
        parts.append([p['k'],p['m'],p['r'] or 0,[([idx[n],d,idx[alt[n]]] if n in alt else [idx[n],d]) for n,d in p['items']]])
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
