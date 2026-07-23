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

## СИНТЕЗ — вложить после выгрузки OpenEvidence в `Infa Cloude/N-17/`
(по образцу P-F8/P-F5: мено-специфика / распознавание+скрининг+дифференциал / рычаги с величинами /
красные флаги переломов и спины)
