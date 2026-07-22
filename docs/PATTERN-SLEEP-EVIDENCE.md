# P-F17 Нарушения сна (менопаузальная бессонница) — углубление: вопросы для OpenEvidence

Четвёртое звено цепочки VIA-L: P-F1 (эстроген) → P-F7 (инсулин) → P-F4 (кортизол) → **P-F17 (сон)**.
Сон — общий узел всех троих (в P-F7 сон = метаболический рычаг; в P-F4 вечерний кортизол дробит сон,
пробуждения 3–4 утра, меньше глубокого). Цель: ИИ должен РАСПОЗНАВАТЬ менопаузальный паттерн сна по
нашим сигналам (архитектура сна с гаджета, пробуждения, приливы, ВСР/пульс покоя, температура) и давать
доказательные рычаги с величинами — дескриптивно, без диагноза «инсомния/апноэ» и без снотворных.

## Что уже есть
- **Клинический KB** P-F17 (~L101): богатый (гигиена сна, магний, поведенческие практики).
- **Велнес-KB** P-F17 (~L748): одна строка (поведенческие практики → модуль СОН, магний вечером) —
  нет менопаузальной специфики, распознавания по архитектуре сна/приливам, связи с кортизолом/фазой,
  величин рычагов, красных флагов апноэ.
- Данные до ИИ доходят: сон/глубокий/пробуждения (гаджет), приливы (частота/интенсивность), ВСР+тренд,
  пульс покоя, дыхание, температура, тревога, стресс, фаза цикла, энергия.

---

## Вопросы для OpenEvidence (English)

### A. Physiology & menopause-specificity
1. How does the menopause transition (estrogen and progesterone decline/fluctuation) change **sleep architecture and sleep continuity** — slow-wave sleep, REM, WASO, sleep-onset latency, early-morning waking — **independent of aging**? What is the mechanistic role of estrogen (serotonergic/thermoregulatory) and progesterone/allopregnanolone (GABAergic, sleep-promoting)?
2. What is the relationship between **vasomotor symptoms (hot flashes/night sweats) and nocturnal awakenings** — do flashes cause the awakenings or vice versa, and how much of menopausal insomnia is VMS-driven vs a hormone-driven sleep-continuity disturbance independent of VMS?
3. How do the **HPA axis / evening cortisol (P-F4 link) and insulin/glucose (P-F7 link)** interact bidirectionally with sleep in midlife women — quantified?

### B. Recognition from consumer wearable/questionnaire signals (no PSG)
4. Which **wearable-derived sleep metrics** (total sleep, deep/SWS, REM, WASO, sleep-onset latency, sleep efficiency, awakenings) best flag disrupted sleep in midlife women, and how reliable is consumer-wearable sleep staging vs polysomnography?
5. How do **nocturnal HRV, resting heart rate, respiratory rate, and skin temperature** track sleep quality and reflect the cortisol/autonomic contribution to poor sleep — what patterns suggest hyperarousal ("tired but wired") vs restorative sleep?
6. What **red-flag patterns point to obstructive sleep apnea** in midlife/postmenopausal women (whose risk rises sharply after menopause) — loud snoring, witnessed apneas, gasping, morning headache, unrefreshing sleep despite adequate duration, high resting HR, low overnight SpO₂, dips — and why is OSA under-diagnosed in women?

### C. Solutions — behavioral & lifestyle levers (magnitudes)
7. **CBT-I (cognitive behavioral therapy for insomnia)** and its components — stimulus control, sleep restriction/consolidation, fixed wake time — effect sizes in menopausal women, and how it compares to hypnotics; is it first-line?
8. **Sleep hygiene & circadian anchoring** (fixed wake time, morning light, evening light/screen reduction, cool bedroom for thermoregulation) — quantified effects on menopausal sleep. (Cross-link P-F4 circadian answers.)
9. **Exercise** (timing, intensity, resistance vs aerobic) for menopausal sleep quality — effect sizes and cautions (late high-intensity, fasted).
10. **Evening nutrition & substances** for sleep: magnesium, protein/carb timing, tart cherry/kiwi/glycine, and the disruptors — alcohol (deep sleep/HRV), caffeine cutoff, late heavy meals — with magnitudes. (Cross-link P-F4 alcohol/caffeine answers.)
11. **Thermoregulation for night sweats** (cooling, bedding, breathable fabrics, room temp) and evidence-based non-hormonal wellness approaches to reduce VMS-driven awakenings; where does the honest boundary sit (what wellness can do vs when to refer for medical VMS treatment)?
12. **Supplements often marketed for sleep** (melatonin, valerian, ashwagandha, magnesium, L-theanine, glycine) — what the evidence actually shows, effect sizes, and the wellness/App-Store cautions (melatonin dosing/timing, hormonally-active herbs we deliberately do NOT recommend with a dose).

### D. Safety / communication (non-diagnostic wellness)
13. For a consumer wellness (non-diagnostic) app: how to describe menopausal sleep disruption **without diagnosing insomnia disorder or sleep apnea**, and which red-flag symptoms (loud snoring + witnessed apneas/gasping, excessive daytime sleepiness with dozing, chronic insomnia unresponsive to behavioral change, depression, restless-legs) should prompt seeing a clinician / sleep evaluation?

---

## Как ответы будут использованы
- Переписать велнес-KB P-F17: менопаузальная рамка (эстроген/прогестерон→архитектура сна+терморегуляция;
  приливы vs гормональная бессонница) + распознавание по нашим сигналам (глубокий/WASO/пробуждения,
  ВСР/пульс/температура как гиперарузал, SpO₂/пульс → красный флаг апноэ) + рычаги с величинами (CBT-I
  первой линией, циркадный якорь, движение, терморегуляция, магний/вечернее питание) + честно про
  добавки (мелатонин — доза/тайминг; адаптогены не рекомендуем) + красные флаги апноэ/инсомнии.
- Сшить с P-F4 (вечерний кортизол → дробит сон), P-F7 (недосып → инсулин), P-F1 (фаза/эстроген).
- Числа — внутренние ориентиры; клиенту качественно, без диагноза.

---

## СИНТЕЗ (2026-07-22) — вложено в велнес-KB P-F17
Сырьё: `Infa Cloude/N-12/` (A–D, 1–13). Ключевое:
- **Мено-специфика (важная честность):** бóльшая часть ухудшения сна (WASO, длительность) — это ВОЗРАСТ,
  не менопауза (проспективные PSG Finnish/SWAN, FSH-модели). Менопаузо-специфичны: удлинение засыпания
  (↑FSH), **корковый гиперарузал** (↑бета-EEG в NREM, НЕЗАВИСИМО от приливов — самая устойчивая находка),
  фрагментация от приливов; глубокий сон парадоксально НЕ падает (даже растёт с ↑FSH). Механизм: эстроген
  (KNDy → сужение термонейтральной зоны → приливы; серотонин), прогестерон/аллопрегнанолон (ГАМК →
  засыпание/глубокий). Две дорожки: приливы будят (78% ночных приливов совпадают с пробуждением, OR 5.31)
  + гормональный гиперарузал сам по себе. Сшивка: P-F4 (вечерний кортизол +27%/CAR −57% дробит сон),
  P-F7 (6-нед недосып → HOMA-IR +0.30, у постмено сильнее +0.45).
- **Распознавание (без PSG):** надёжны TST/эффективность/SOL/число пробуждений; **стадии (глубокий/REM)
  с гаджета НЕнадёжны** (macro-F1 ≤0.69, «hypothesis-generating» — важно, VIA-L показывает глубокий сон!).
  WASO гаджеты систематически занижают именно в плохие ночи. Гиперарузал: приподнятый ночной пульс (нет
  дипа −10–20%), низкая ВСР без утреннего восстановления, кожная температура не падает перед сном.
  Апноэ у женщин после менопаузы — риск ↑2.6–3.5×, недодиагностируется (фенотип: бессонница/усталость/
  настроение/утренние головные боли/никтурия, а не классический храп; STOP-BANG занижает из-за пункта
  «мужской пол»); wearable-флаги: провалы SpO₂ (ODI), высокий ночной пульс.
- **Рычаги:** CBT-I ПЕРВОЙ линией (ISI −7.7…−10 у менопаузальных, ремиссия 54–84%, держится 2–10 лет,
  сильнее снотворных долгосрочно); активные компоненты — контроль стимула + сжатие сна (sleep restriction)
  + когнитивная реструктуризация; одна «гигиена сна» слаба (ISI −1–3), релаксация как ЕДИНСТВЕННЫЙ приём
  контрпродуктивна. Регулярность подъёма > длительности (смертность −20–48%). Циркадный якорь/свет (как
  P-F4). Терморегуляция: спальня 15.6–19.4 °C, охлаждающий наматрасник (VMS −52% в пилоте, глубокий +9.6
  мин у постмено) — но ЧЕСТНО: охлаждение НЕ расширяет термонейтральную зону, снижает лишь пробуждения/
  дискомфорт (NAMS: cooling НЕ рекомендован как лечение VMS). Субтрактивно > аддитивно: алкоголь «ложный
  друг» (режет REM/2-ю половину/ВСР, стирает пользу движения), кофеин отсечка ~8.8 ч (~14:00), еда ≥3 ч
  до сна. Аддитивы скромны: магний (SOL −17 мин), глицин 3 г (терморегуляторный, уместен в менопаузе),
  киви/вишня, L-теанин.
- **Мелатонин:** эффект малый (SOL −9 мин), критичен ТАЙМИНГ (за 2–3 ч, не перед сном); в менопаузе
  помогает лишь при исходной бессоннице; ⚠️ 88% этикеток неточны (74–347%), серотонин-контаминация →
  USP-verified, 0.5–1 мг циркадно / 3–4 мг при засыпании, не наращивать. Валериана — нет доказательств.
  Адаптогены (ашваганда) НЕ рекомендуем (печень/щитовидка, как P-F4).
- **Красные флаги (Q13):** апноэ (храп+паузы/задыхание, неосвежающий сон при достаточной длительности,
  дневная сонливость с засыпанием, утренние головные боли, никтурия, SpO₂-провалы) → сомнолог, особенно
  т.к. у женщин недодиагностируется; хроническая бессонница ≥3 мес несмотря на поведенческие меры;
  беспокойные ноги (позыв двигать вечером/в покое, легче при движении → проверить ферритин); стойко
  сниженное настроение/тревога; мысли о самоповреждении ИЛИ засыпание за рулём → безотлагательно.
  Регуляторно: описывать «изменения сна», НЕ ставить «бессонница/апноэ»; стадии гаджета — не клин.данные.
