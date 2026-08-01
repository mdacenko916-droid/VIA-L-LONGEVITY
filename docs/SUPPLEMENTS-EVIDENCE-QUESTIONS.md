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
