# P-F12 Кости / суставы / мышцы — «опорно-двигательный синдром менопаузы» — углубление: вопросы для OpenEvidence (14)

Девятый узел, анкер «телесного» кластера. Прямое продолжение воспаления (P-F8) и мышц/энергии (P-F5).
Особенность: КОСТЬ — «немой» высокорисковый процесс (теряется до ~2%/год вокруг менопаузы, женщины несут
75% переломов шейки бедра со смертностью ~33% за 1–2 года) → критично про СКРИНИНГ (не ждать «до 65»);
суставы — «менопаузальная артралгия»/замороженное плечо (двойник воспалит. артрита, частично закрыт в F8);
мышцы — саркопения (креатин/белок частично в F5). Собираем воедино как единый синдром.

Цель: ИИ должен (1) РАСПОЗНАВАТЬ опорно-двигательный паттерн по нашим сигналам, (2) понимать, что кость
немая → подсказать СКРИНИНГ вовремя и по факторам риска, (3) отличать доброкач. артралгию от воспалит.
артрита/остеоартроза, (4) давать доказательные рычаги с величинами (силовые/ударные, белок, кальций/D),
(5) красные флаги переломов/серьёзной патологии спины → к врачу.

## Что уже есть
- **Клинический KB** P-F12 (~L69): очень насыщенный (рамка синдрома; кальций 1200 мг из еды, K2, белок
  1.8–2.2 г/кг + лейцин, D3+K2, кальций цитрат, магний, креатин 5 г, коллаген, омега-3; силовые высокоинт.
  + ударные/прыжковые + баланс; ⚠️ DEXA+FRAX НА менопаузе, не «в 65»; факторы риска).
- **Велнес-KB** P-F12 (~L743): одна строка (белок + силовые/опорные; D3+K2, кальций из еды, магний, креатин,
  коллаген опция) — нет рамки синдрома, распознавания/скрининга, дифференциала артралгии, величин рычагов,
  красных флагов переломов.
- Данные до ИИ доходят: суставные симптомы/скованность, фаза, возраст, WHtR, движение. Лаб (DEXA/вит D)
  НЕТ → симптом/возраст-путь + подсказка на скрининг.

---

## Вопросы для OpenEvidence (English)

### A. Physiology & menopause-specificity
1. How does estrogen loss accelerate **bone loss** (osteoclast activation, RANKL/OPG, remodeling imbalance) — the timing (loss accelerates ~1 year before the final menstrual period), magnitude (~2%/year at spine), and lifetime fracture consequences — independent of aging?
2. How does estrogen loss drive **muscle loss / sarcopenia and loss of strength/power** in midlife women (anabolic resistance, satellite cells, motor units) — magnitude and functional consequences (falls, disability)?
3. What is the **"musculoskeletal syndrome of menopause"** — estrogen's role across joints, tendons, ligaments, and cartilage — producing arthralgia ("menopausal arthritis"), stiffness, adhesive capsulitis (frozen shoulder), and tendinopathy; how common, and how does it tie to the inflammation node (P-F8)?

### B. Recognition & differential diagnosis / screening
4. What everyday/non-lab signals flag musculoskeletal risk in midlife women (new joint aches/morning stiffness, height loss, grip weakness, falls, WHtR, menopause stage/age) — and the critical point that **bone loss is silent** (no symptoms until fracture)?
5. **Screening:** Who needs **bone density testing (DEXA) and fracture-risk assessment (FRAX)**, and WHEN — the case for assessing at menopause / earlier with risk factors (early menopause <45, prior fragility fracture, glucocorticoids, aromatase inhibitors, rheumatoid arthritis, low BMI, parental hip fracture, smoking) rather than waiting until 65?
6. **DIFFERENTIAL:** How to distinguish benign menopausal arthralgia from **inflammatory arthritis** (RA — prolonged morning stiffness, swelling, symmetrical small joints) and from **osteoarthritis**, and how to recognize **adhesive capsulitis (frozen shoulder)** → which warrant referral?
7. **RED FLAGS — fracture & serious spine pathology:** which features flag a **fragility/vertebral fracture** (sudden severe back pain, height loss, new kyphosis) or serious secondary back pain (cancer, infection, cauda equina) requiring urgent evaluation?

### C. Solutions — levers with magnitudes
8. **Resistance training + high-impact/weight-bearing/jump exercise** for bone mineral density and fracture prevention in peri/postmenopausal women — effect sizes (e.g., LIFTMOR), dosing (intensity, frequency), and safety in those with low bone density.
9. **Exercise for muscle/sarcopenia and falls prevention** — resistance + power + balance training effect sizes on strength, function, and fall/fracture risk in midlife/older women.
10. **Dietary protein** for muscle and bone in peri/postmenopause — how much (g/kg/day, per-meal, leucine), the anabolic-resistance issue, and effect on sarcopenia/bone.
11. **Calcium & vitamin D** — food-first targets, doses, the **calcium supplement cardiovascular-safety debate**, vitamin D thresholds and whether supplementation reduces fractures; roles of **vitamin K2 and magnesium**.
12. **Other levers & harms + supplements:** fall prevention (vision, home hazards, balance), smoking, excess alcohol, being underweight, caffeine; and the evidence for **collagen, creatine, omega-3** for joint/bone/muscle.

### D. Safety / communication (non-diagnostic wellness)
13. For a consumer wellness (non-diagnostic) app: how to describe bone/joint/muscle changes **without diagnosing osteoporosis or arthritis** — conveying that bone loss is silent and screening matters, while honestly noting where hormone therapy and prescription bone medications sit (a clinician decision, not our recommendation)?
14. **Red-flag mapping:** which features → which clinician/test — fragility fracture or height loss ≥4 cm → DEXA/bone specialist; inflammatory-arthritis pattern → rheumatology; frozen shoulder → physio/ortho; new significant/progressive back pain with red flags → urgent evaluation; and the routine screening prompt (DEXA/FRAX at menopause with risk factors)?

---

## Как ответы будут использованы
- Переписать велнес-KB P-F12: рамка синдрома (эстроген по всей опорно-двигательной системе) + распознавание
  (кость немая → скрининг вовремя; суставная скованность как сигнал) + дифференциал (артралгия vs
  воспалит. артрит/остеоартроз, замороженное плечо) + рычаги с величинами (силовые высокоинт. + ударные/
  прыжковые для кости, баланс от падений, белок ≥1.0–1.2+ г/кг + лейцин, кальций из еды + вит D/K2/магний,
  креатin) + честно про кальций-добавки (ССС-дебат) и коллаген + красные флаги переломов/спины и подсказка
  на DEXA/FRAX по факторам риска (не ждать 65). HRT/лекарства кости — решение врача.
- Сшить с P-F8 (воспаление сустава/мышцы), P-F5 (мышцы/креатин), P-F7 (висцеральный жир), P-F4 (кортизол→кость).
- Числа — внутренние ориентиры; клиенту качественно, без диагноза.

---

## СИНТЕЗ (2026-07-23) — вложено в велнес-KB P-F12
Сырьё: `Infa Cloude/N-17/` (A–D, 1–14). Ключевое:
- **Мено-специфика (Q1–3):** эстроген — тормоз резорбции кости (RANKL/OPG); падение → транс-менопаузальное
  ОКНО (кость теряется с ~года до FMP до 2 лет после: спина ~1.7%/год до → 3.3%/год после, пери до 2.5%/год,
  20-кратное ускорение; 10-лет потеря спины 10.6%, 70% в транс-меноп.). «Годы от менопаузы > возраст»
  (каждый год раньше FMP = +5% риск перелома; каждый +1%/год потери = +56% риск). 50% женщин — хрупкий
  перелом. Мышцы: сателлитные клетки↓, анаболич. РЕЗИСТЕНТНОСТЬ (притуплён ответ MPS на белок+тренировку),
  протеолиз (FOXO/MuRF1); lean −2.5% пери/−5.7% пост, ~1–1.5%/год; саркопения → падения +20%, бедро +60%,
  остеосаркопения >2× перелом. Суставы: «менопаузальная артралгия» >50% (OR 2.28, не возраст); замороженное
  плечо; тендинопатии — эстроген противовоспалит. регулятор хряща/синовия (связь P-F8).
- **Распознавание/скрининг (Q4–5):** КОСТЬ НЕМАЯ до перелома. Косвенные сигналы: артралгия/скованность,
  потеря РОСТА (>4 см от пика/>2 см проспективно → снимок; >5 см → бедро +50%), слабый ХВАТ (≤20 кг →
  оценка саркопении), падения (любое → оценка), WHtR/центр. жир (саркопеническое ожирение), стадия/ранняя
  менопауза. Скрининг DEXA универсально в 65, НО раньше при факторах: ранняя меноп <45/POI, хрупкий перелом
  в анамнезе, ГК ≥2.5 мг >3 мес, ингибиторы ароматазы, РА, ИМТ<21, перелом бедра у родителей, курение/
  алкоголь → FRAX. «Не ждать 65»: к 65 может быть потеряно 10–20% молча.
- **Дифференциал (Q6):** СИНОВИТ (припухлость) = главный отличитель. Артралгия — боль БЕЗ припухлости,
  скованность <30 мин, маркёры норма. RA — припухлость/синовит, скованность ≥30–60 мин улучшается движением,
  MCP/PIP/запястья, RF/анти-CCP, конституц. симптомы → окно 3–6 мес, срочно ревматолог. OA — хуже от
  нагрузки, <30 мин, DIP/PIP/1-й CMC, костные узелки. Замороженное плечо — ограничены АКТИВНЫЕ И ПАССИВНЫЕ
  движения (наружная ротация сильнее всего), диабет/щитовидка/менопауза.
- **Красные флаги (Q7):** компрессионный перелом позвонка (внезапная срединная боль от обычного движения,
  тораколюмбар, потеря роста/кифоз; ⅔ пропускают) → «имминентный» риск след. перелома 10–18% за 1–2 года →
  немедленное лечение. Вторичная патология спины: рак (боль в покое/ночью, потеря веса, рак в анамнезе,
  нет улучшения за месяц); инфекция (лихорадка/иммуносупрессия/ВВ-наркотики); КОНСКИЙ ХВОСТ (задержка мочи,
  седловидная анестезия, двусторонняя слабость ног) → неотложно, нет безопасных временных порогов.
- **Рычаги (Q8–12):** СИЛОВЫЕ высокоинт. (становая/присед/жим ≥85% 1ПМ) + УДАРНЫЕ/прыжковые = LIFTMOR:
  спина +2.9% (vs −1.2), шейка бедра сохранена, БЕЗОПАСНО при остеопении (0 переломов, кифоз ↓), эффект как
  у части лекарств; доза-ответ по интенсивности; комбинир. аэроб+силовые — топ; НАДЗОР → 2× защита от
  переломов (IR 0.44); упражнения ↓переломы IR 0.67. Баланс/сила от падений. БЕЛОК ≥1.0–1.2 (лучше 1.6–2.0)
  г/кг, 30–40 г/приём + лейцин (анаболич. резистентность). КАЛЬЦИЙ 1000–1200 мг FOOD-FIRST (средн. женщина
  ~600); добавки — только закрыть дефицит, ≤500 мг/доза, ≤1000 доп.; ⚠️ пищевой Ca без ССС-риска, ДОБАВКИ
  спорны (MI RR 1.24 в части мета-анализов, коронарный кальций, камни) → минимизировать. Вит D (≥20–30 нг/мл),
  K2, магний. Креатин ~5 г. Коллаген — слабо. Убрать курение/алкоголь/недовес/избыток кофеина.
- **Регуляторно:** описывать «немую кость → важность скрининга», не диагностировать остеопороз/артрит;
  HRT и лекарства кости (бисфосфонаты/деносумаб) — решение врача, не наша рекомендация.
