# Supplements & vitamins — OpenEvidence question set (series N-11)

**Date:** 2026-08-01. **For:** owner (runs the queries in OpenEvidence) → answers come back
here → I fold them into the worker's `WELLNESS_KB` and build the "Supplements" theme in the
daily overview.

Questions are in English (OpenEvidence works best in English). The audit and the
implementation notes are the Russian part of the repo's context, kept short here.

---

## 1. Why (what the KB audit showed)

I ran all 34 patterns of `WELLNESS_KB` through a supplement-coverage check. Supplements
**are** mentioned, but scattered inside general lifestyle advice — no block has a dedicated
layer of "what to take, why, what food already covers, who must not".

Three patterns are one-line stubs (~300 chars vs 3–8k for the rest):

| Pattern | Topic | Size | Supplement content |
|---|---|---|---|
| P-F19 | Digestive comfort, pelvic zone | 297 ch. | "fibre 20–30 g + water + psyllium as an option" |
| P-F20 | Pelvic floor, continence | 275 ch. | fibre in passing |
| P-F21 | Breast health | 383 ch. | omega-3, one word |

Six more have only 1–3 mentions in the whole block: **P-F13** (cardiovascular), **P-F15**
(genitourinary comfort), **P-F23** (hormonal migraine), **P-F11** (gut, women — pro/prebiotics
barely covered), **P-M3** (metabolic), **P-M11** (ED as a vascular signal).

Well covered: P-F22 (iron), P-F18 (B12/folate), P-F14 (skin/hair/collagen), P-M6 (gut, men),
P-F12 (bone/muscle), P-F3 (progesterone — home of the only "anti-voodoo" section in the base).

**Missing as topics entirely, in every block:** drug interactions (we already ask about thyroid
meds and antidepressants in the questionnaire and can say nothing about them), forms and
quality, timing and separation, practical logistics (frequency, how long a pack lasts), and
a debunking layer beyond the one under progesterone.

---

## 2. The frame that shapes the answers

- **VIA-L (App Store)** — no milligrams at all; food-first, structure/function wording.
  What matters in the answers: **mechanism and priority order (food → form → supplement)**,
  plus practical usage that is not a dose.
- **VIA-L EXPERT** — doses and a qualitative read of the evidence are allowed, so please keep
  **doses on a separate line** so I can route them to the EXPERT branch only.
- **Hormone-active herbs** (vitex, black cohosh, dong quai, red clover, ashwagandha, rhodiola,
  liquorice, sage) — dose, form, course length and time-to-effect are never printed; a
  deterministic filter strips them. Ask only: is there any point, what does it interact with,
  who must avoid it.
- No promises of outcome or timelines ("in 2–4 weeks you will feel better") — that is a claim.

### The dose question, resolved (read before answering block G)

The amount per serving is **deferred to the person's own package**: strengths differ up to
tenfold (vitamin D at 500 vs 5000 IU per drop, magnesium at 100 vs 400 mg per capsule), so
"take two a day" without the label is not safer than a milligram figure — it is less safe.
What we *can* give, and what is not a dose: **how many times a day, when, with or without
food, what to keep apart from what, how many days it is taken**, and the arithmetic for
buying (servings per day × 30 = servings per month).

---

## 3. Answer format (paste this at the top of your query)

> For each item answer in the same structure:
> **(1)** mechanism in one plain-language sentence — why this usually works;
> **(2)** how well studied — qualitatively (well established / limited data / conflicting),
> with no invented percentages;
> **(3)** what food already provides and whether food alone is enough — name the foods;
> **(4)** dose and form, if they are evidence-relevant — on a separate line;
> **(5)** who should avoid it, and interactions with medications;
> **(6)** what is sold for this purpose but does not work.
> If there is no evidence for an item, say so — do not fill the gap.

---

## 4. Questions

### A. Baseline by life stage

1. A woman aged 40–50 in perimenopause with no diagnoses: which nutrients are most often
   insufficient in this stage, and why specifically during the transition? Which of them can
   be covered by food, and which realistically need a supplement?
2. Same question for postmenopause — how do the priorities change compared with perimenopause?
3. A man aged 40–55 with declining vitality: which nutrients make sense as a base, and why?
   What in typical "men's formulas" is marketing?
4. Is there an evidence-based "basic minimum" for people over 35 (something that makes sense
   for almost everyone), or should it strictly follow measured deficiencies? If a minimum
   exists, what is in it?

### B. By presenting complaint (these are what our questionnaire actually collects)

5. **Constipation and abdominal heaviness** in women in the transition: psyllium, magnesium,
   probiotics, prebiotics — what works, in what order should they be tried, what is useless?
6. **Sleep: difficulty falling asleep** versus **night awakenings** — are these different
   targets for supplementation? What makes sense for each, and what should be avoided?
7. **Brain fog and memory** at 40–55: are there nutrients with real support, or is this
   entirely about sleep, movement and blood sugar?
8. **Hot flashes and night sweats**: what over-the-counter options have any evidential support
   and what is empty? (for herbs — no doses, only whether there is a point, and the risks)
9. **Joints, bone and muscle loss** in menopause: calcium, D3, K2, collagen, creatine, protein
   — what is established, what is disputed, and in what order of priority?
10. **Hair, nails, skin**: where is this a genuine deficiency (iron, B12, zinc, protein) and
    where is it a false promise? Does oral collagen work, and for what exactly?
11. **Anxiety and irritability**: magnesium, omega-3, B vitamins, adaptogens — which have
    support and which do not? (adaptogens — no doses or course lengths)
12. **Low energy and fatigue** with normal basic bloodwork: what should be looked at, what
    makes sense, and what is just a "vitamin placebo set"?
13. **Blood pressure at the upper end of normal**: potassium, magnesium, omega-3,
    beetroot/nitrates — what actually moves the numbers and what does not? (we already have a
    blood-pressure block; this is specifically the nutrient layer)

### C. Safety and interactions (absent from our base entirely)

14. A woman on **hormonal contraception or MHT**: which supplements and herbs reduce the
    effect or conflict with it? What does she most often buy in vain, or to her harm?
15. A person on **antidepressants** (SSRI/SNRI): what must not be combined, and why?
16. **Thyroid medication** (levothyroxine): what needs to be separated in time, and by how much?
17. **Anticoagulants and antiplatelets**: where is the risk from "harmless" supplements
    (omega-3, curcumin, vitamin E, garlic)?
18. **Metformin**, PPIs (omeprazole and similar), statins: which deficiencies do they create
    over time, and what is usually added because of that?
19. Which over-the-counter supplements most often cause **overdose or harm** when self-prescribed
    at 35–55 (iron without deficiency, mega-dose vitamin D, selenium, zinc, vitamin A)? How does
    that present?

### D. Forms, quality, timing

20. Where does form have **proven** significance and where is it marketing: magnesium
    (glycinate/citrate/oxide/malate), iron (bisglycinate/sulfate), omega-3 (triglyceride vs
    ethyl ester), B12 (methyl- vs cyano-), folate (methylfolate vs folic acid), D3 vs D2?
21. What should be taken **with food**, what **on an empty stomach**, and what must be **kept
    apart from what** (iron and calcium, zinc and copper, magnesium and thyroid medication,
    iron and coffee/tea)?
22. How can a person tell a decent supplement from an empty one: what to look for on the label,
    what third-party certification actually means, and why "1000 mg fish oil" ≠ 1000 mg EPA+DHA?

### E. What does not work (extending the anti-voodoo layer)

23. Which supplements and practices for women in the transition are marketed hardest while
    having no evidential support? (seed cycling, "progesterone creams", wild yam, detox
    protocols, DIM, "adrenal support" — and what else)
24. The same for men over 40: testosterone boosters, ZMA, tribulus, "men's complexes" — what is
    empty, and why does it keep selling?
25. Are there supplements that at this age **cause harm when taken regularly without indication**,
    despite being considered harmless?

### F. How to present it to a person

26. How does one honestly convey that a supplement is not a substitute for food, sleep and
    movement, without devaluing it where it genuinely is needed? Is there research on whether
    "basic habits first" works better than "habits plus a targeted supplement from the start"?

### G. Practical usage without prescribing a dose (this is the new block — most important for the product)

We do not print milligrams. We want to give the person what does not depend on their specific
product: how often, when, with what, for how long. Please answer with that constraint in mind.

27. For the commonly used supplements at this age (magnesium, vitamin D, omega-3, iron, B12,
    zinc, psyllium, probiotics, collagen, creatine): **how many times a day is each normally
    taken, and at what time of day**, and does splitting the intake actually matter or is
    once daily equivalent?
28. For each of them: **with food, after food, or on an empty stomach** — and where does this
    genuinely change absorption or tolerance rather than being folklore?
29. Which of them are taken **continuously** and which **in cycles or seasonally** (for example
    vitamin D in winter, iron only until stores are replenished)? Where is continuous use
    without monitoring a bad idea?
30. Is it safe and reasonable to tell a person "take the serving stated on your package, this
    many times a day", given that product strengths vary widely? What is the safest way to
    phrase practical guidance when we deliberately do not name a dose?
31. When a product's stated serving differs markedly from the usual reference amount, what
    should a person notice on the label — and at what point does this become a question for
    a specialist rather than a shopping decision?
32. Which combinations are commonly taken together at the **same** intake (for example D3 with
    omega-3 or with a fatty meal), and which must be split across the day? A practical
    "morning / lunch / evening" layout for a typical set would be ideal.
33. How long does it usually take before a person could reasonably notice anything from each of
    these — described without promising a result (we are not allowed to promise outcomes, but
    we want to prevent someone from stopping after three days)?

---

## 5. What I do with the answers

1. Fill the thin patterns — P-F19/20/21 first, then P-F13/15/23/11 and P-M3/M11.
2. Add a **cross-cutting "SUPPLEMENTS" block** to the KB — interactions, forms, timing, practical
   usage, anti-voodoo. It is shared by all patterns; duplicating it in each is pointless.
3. Raise a dedicated "Supplements & vitamins" theme in the overview: VIA-L without doses,
   food-first, with the "why this usually works" line; EXPERT with doses and the "what this is
   based on" line. It builds on what the person **already takes** (the questionnaire holds 11
   items plus medications) — so it never re-suggests what they are on, and can flag conflicts.
4. Amount per intake stays with the package; from us — frequency, timing, what to separate,
   duration, and the buying arithmetic (servings per day × 30).
5. Cross-link with the day plan: the Morning / Day / Evening reminder lines carry the "with
   food / after food" instruction, and the supplements theme points there instead of repeating it.

---

# ROUND 2 — что осталось (после разбора ответов 2026-08-01)

Ответы лежат в `interpreter/Infa Cloude/E/` (33 файла, 423k знаков). Разобраны, качество высокое.

## Что изменилось в конструкции блока (ответ 30 — решающий)

Идея «пиши не дозу, а сколько раз в день по порции с упаковки» **не проходит**: порция на
этикетке — маркетинговое решение производителя, а не терапевтическая доза; по данным DSID
фактическое содержание почти всех ингредиентов в мультивитаминах **превышает** заявленное
(селен и йод ~на 25%, кальций на 7–29%), а превышение верхнего допустимого уровня даёт
именно приём добавок, не еда. Инструкция «по порции с упаковки» отдаёт решение о дозе
производителю.

Безопасная конструкция, из тех же ответов:
- **Частота, время, что с чем разносить, длительность** — это НЕ доза, это можно и нужно
  (ответы 27/28/29/32 дают готовую раскладку по 10 добавкам).
- **Количество на приём** — учим читать строку «amount per serving» и считать, а не
  «сколько капсул».
- **Потолок вместо дозы** — назвать верхний допустимый уровень безопаснее и долговечнее,
  чем целевую дозу.
- **Разделение по риску:** «по упаковке» допустимо для B12, C, B1, B2, биотина,
  пантотената (нет UL) и объёмных агентов (псиллиум, креатин, коллаген, белок); **не
  допустимо** для ретинола, цинка, железа, йода, меди, кальция, селена, ниацина, фолиевой.
- Отдельно предупреждать про **суммирование**: мультивитамин + «для волос» + отдельный
  минерал незаметно дублируют один и тот же нутриент.

## Дырка в ответах

**Вопрос 11 (тревога и раздражительность: магний, омега-3, витамины B, адаптогены) не
отвечен** — файл `B/11.txt` побайтно совпадает с `B/10.txt` (волосы/кожа/ногти),
ответ продублировался. Тревога у нас — недельный блок опросника, без неё в теме дыра.
(`F/26:1.txt` = `G/27.txt` — тоже дубль, но безобидный: это ответ про частоту, лежит дважды.)

## Вопросы второго круга

34. *(повтор 11)* **Anxiety and irritability** in women 40–55 in the transition: magnesium,
    omega-3, B vitamins, adaptogens — which have real support and which do not? Where is this
    a nutrient question at all versus sleep, vasomotor symptoms and mood? (adaptogens — no
    doses, no course lengths: only whether there is a point, interactions, who must avoid)

35. **The ceiling reference OpenEvidence itself offered.** Give a concise, patient-facing
    tolerable upper intake level reference for the nutrients most often over-consumed at 35–55,
    phrased as ceilings rather than doses. For each: the ceiling, what it counts (supplements
    and fortified foods, or food too), what exceeding it looks like in practice, and how quickly
    harm accumulates. This is what we will print instead of doses.

36. **No labs — the real situation of our users.** Almost every answer says "only if the
    deficiency is documented", but most people using a consumer app have no ferritin, no
    25-OH D, no B12. Which of these can be responsibly suggested without testing, and which
    must never be suggested before a test? What can be said to someone who will not get
    tested — and at what point does "get tested" become the only honest recommendation?

37. **Invisible stacking.** Which real-world product combinations most often duplicate the
    same nutrient without the person noticing (multivitamin + hair/skin/nails formula +
    separate mineral + fortified foods)? Which nutrients is this most dangerous for, and what
    is the simplest self-check a person can run over their own shelf?

38. **Predictable gaps from diet patterns we already collect** (vegetarian, vegan,
    lactose-free, gluten-free, low-carb, intermittent fasting): which deficiencies become
    predictable enough to act on without testing, and which are assumed but not actually
    supported by evidence?

39. **Perimenopause versus supplement timing across the cycle.** Is there any evidence that
    the timing of any supplement across the menstrual cycle matters (given that our app knows
    the cycle phase), or is cycle-linked dosing entirely a marketing construct like seed
    cycling?

---

# ROUND 3 — тонкие паттерны базы знаний (заведено 2026-08-02)

**Зачем.** Сквозной блок про добавки вложен, P-F19 (пищеварение) и P-F13 (давление) наполнены
из первого круга. Остальные тонкие блоки наполнять **нечем** — материала под них в N-11 нет,
а сочинять в базу знаний нельзя. Это вопросы ровно под них.

| Паттерн | Тема | Сейчас |
|---|---|---|
| P-F20 | Тазовое дно, недержание | 275 знаков |
| P-F21 | Здоровье груди | 383 знака |
| P-F15 | Урогенитальный комфорт (GSM), интимное здоровье | 1–3 упоминания |
| P-F23 | Гормональная (менструальная) мигрень | 1–3 упоминания |
| P-F11 | Кишечник и микробиом у женщин | про/пребиотики не раскрыты |
| P-M3 | Метаболический синдром у мужчин | 1–3 упоминания |
| P-M11 | ЭД как сосудистый сигнал | 1 упоминание |

**Формат ответа — тот же** (вставить в начало запроса): механизм одной фразой; насколько изучено
качественно, без выдуманных процентов; что даёт еда и хватает ли её; доза и форма отдельной
строкой (уйдёт только в EXPERT); кому не подходит и взаимодействия; что продаётся и не работает.
Гормонально-активные травы — без дозы, формы и курса, только смысл и риски.

**Дополнительно к каждому блоку:** что из этого может увидеть носимый трекер (ВСР, сон, пульс
покоя, температура кожи, дыхание) — и, что важнее, чего он увидеть НЕ может, чтобы мы не строили
выводы на несуществующем якоре.

## Вопросы

40. **Pelvic floor and continence in women 40–60.** What actually works, in what order: pelvic floor
    muscle training (supervised versus app/home), weight loss, bladder training, treatment of
    constipation and chronic cough, vaginal oestrogen (as a category, not a prescription)? How large
    is the effect of each, how long before a fair trial has been given, and what should never be
    self-managed? What is sold for this (devices, "bladder support" supplements, cranberry, collagen)
    and has no support?
41. **Nutrition and the pelvic floor:** is there any evidence-based dietary contribution at all
    (fibre and constipation as a load factor, caffeine and alcohol as bladder irritants, hydration
    myths), or is this entirely a training question?
42. **Breast health and nutrition in midlife.** Which dietary factors have real evidence for breast
    health and for benign symptoms (mastalgia, cyclical tenderness): alcohol, body weight and fat
    distribution, fibre, soy foods versus soy extracts, dairy, Mediterranean pattern? Where does the
    evidence stop and marketing begin (evening primrose oil, iodine, vitamin E, DIM, "estrogen
    detox")? What are the red flags that must go to a doctor without delay?
43. **Genitourinary syndrome of menopause (GSM).** Non-prescription options first: moisturisers
    versus lubricants (what is the difference and what does each actually do), pelvic floor work,
    sexual activity itself, what to avoid (soaps, douching, glycerin/perfumed products). Which
    over-the-counter products marketed for vaginal health are useless or harmful? How should we
    talk about this warmly and without shame in a wellness app, and where is the honest boundary
    at which we must say "this is a doctor's conversation"?
44. **Hormonal (menstrual) migraine in the transition.** How is it recognised (timing relative to the
    cycle, what distinguishes it from other headaches), what non-pharmacological levers have real
    support (sleep regularity, meal timing and skipped meals, hydration, caffeine withdrawal,
    aerobic exercise, magnesium, riboflavin, CoQ10 — which of these hold up)? What worsens it in
    perimenopause specifically? Red flags that mean urgent assessment rather than self-management.
45. **Gut and microbiome in women 40–60.** Beyond constipation (already covered): what does the
    evidence support for bloating, altered bowel habit and general gut comfort in this age group —
    fibre types and how to increase them without worsening bloating, fermented foods versus
    probiotic capsules, low-FODMAP as a temporary tool, the role of stress and sleep on gut symptoms?
    Does menopause itself change the microbiome in a way that matters practically, or is that
    overstated? Which tests ("gut microbiome analysis", food-sensitivity IgG panels) are not worth
    the money?
46. **Metabolic syndrome in men over 40.** What is the realistic order of levers (weight, sleep,
    alcohol, resistance training, dietary pattern), and how much does each move the actual markers?
    Where do supplements fit at all — is there anything beyond food and movement with a real signal?
    What is the honest relationship between visceral fat, testosterone and metabolic markers — which
    causes which, and what does correcting the metabolic side actually do to symptoms?
47. **Erectile dysfunction as a vascular signal in men over 40.** How strong and how early is the
    association with cardiovascular disease — is ED genuinely a "canary" and over what time horizon?
    What lifestyle interventions have real evidence (exercise type and dose, weight, smoking,
    alcohol, sleep apnoea treatment)? What is sold over the counter and does not work or is
    dangerous (yohimbe, "male enhancement" blends, adulterated products)? How should a wellness app
    raise this topic without shaming and without diagnosing — and what makes it a doctor's
    conversation rather than a lifestyle one?
48. **Wearable anchors, honestly.** For each of the topics above (pelvic floor, breast, GSM,
    migraine, gut, metabolic, ED): is there any validated signal in consumer wearable data (HRV,
    sleep stages, resting heart rate, skin temperature, respiratory rate) that legitimately relates
    to it? Where the answer is "none", say so plainly — we need to know where we must not build an
    inference on a non-existent anchor.

---

## Вопрос 39 — переспросить (первый заход вернул ответ не по теме)

В прошлый раз в запрос ушёл шаблон формата без самой темы, и OpenEvidence честно ответил, что
отвечать не на что, подставив вместо этого SAMe. Ниже — самодостаточная формулировка: тема
названа прямо в первом предложении, без опоры на предыдущий контекст.

**Зачем нам это.** Приложение знает фазу цикла и умеет её показывать. Значит, у нас есть соблазн
привязать к фазам ещё и приём добавок — так делают многие приложения. Прежде чем строить такую
функцию, нужно знать, есть ли под ней хоть что-то, или это второй «сид-циклинг», который мы уже
пометили в базе как выдумку.

> **39.** Does the timing of nutritional supplements across the menstrual cycle have any
> evidence-based rationale? Specifically: for magnesium, vitamin B6, iron, calcium, vitamin D,
> omega-3 and any commonly marketed "cycle support" product — is there any controlled evidence
> that taking them in a particular cycle phase (follicular versus luteal, or around menstruation)
> changes absorption, tolerability, symptom outcomes or nutrient status, compared with taking the
> same amount continuously?
>
> Please separate three things: **(a)** where phase-linked timing is genuinely justified by
> physiology or trial data — for example iron around heavy menstrual bleeding, or anything taken
> specifically for premenstrual symptoms in the luteal phase; **(b)** where it is plausible but
> untested; **(c)** where it is pure marketing, in the same category as seed cycling.
>
> Also: in perimenopause, where cycles become irregular and often anovulatory, does phase-linked
> timing retain any meaning at all — or does cycle irregularity by itself make the whole idea
> unusable in practice?
>
> If the honest answer for most items is "no evidence", say so plainly rather than constructing a
> rationale.
