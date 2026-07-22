# Blood pressure — evidence plan for the AI worker KB + questionnaire input

**Purpose.** Let VIA-L collect the user's own blood-pressure readings (they usually have a
home cuff, especially anyone with hypertension) and have the AI interpret them for the
35+/40+ audience — using nutrition/lifestyle as the lever to help restore a healthy BP —
descriptively, never diagnosing (term≠claim, non-diagnostic wellness).

Status: 2026-07-22 — questions drafted for OpenEvidence pull. Workflow mirrors
`CYCLE-PHASE-WEARABLES-EVIDENCE.md`: pull answers → distil into worker KB + add a BP input
to the questionnaire (both gadget and manual flows) → the field design follows the evidence
(single readings are noisy → likely resting home BP, averaged over days, morning/evening).

## 1. What already exists (checked 2026-07-22)

- Clinical KB patterns **P-F13** (female CV risk) and **P-M7** (male CV risk) in
  `cloudflare-worker.js` SYSTEM_PROMPT already mention BP targets (>120/80 not to ignore,
  130/80 for >65) and nutrition (Mediterranean, salt <5 g, omega-3, magnesium, CoQ10).
  BUT these are **clinical (EXPERT/ELITE)**; VIA-L runs on WELLNESS_KB, which has **no BP block**.
- **No blood-pressure input anywhere in the questionnaire**, so BP is never in `data` — the
  AI can only talk about CV risk in the abstract, not interpret the user's actual readings.
- Gap to fill: (a) BP-specific wellness knowledge (patterns + nutrition levers + thresholds),
  (b) a BP input field, (c) safe non-diagnostic communication of readings.

## 2. What answers must produce (to stay actionable)

1. Menopause/andropause-specific BP physiology → so the AI frames rising BP as part of the
   transition, not just "aging," and knows the salt-sensitivity nuance.
2. **Home/self-measured** BP thresholds and correct measurement method → so the field
   collects a reliable value and the AI reads it against the right cutoffs.
3. Quantified nutrition/lifestyle effects (mmHg) → so guidance is concrete and evidence-based.
4. Red-flag values + non-diagnostic wording → safety.

---

## 3. Questions for OpenEvidence (English)

Each carries a note on the app lever it feeds.

### A. Physiology & patterns

1. How does blood pressure change across the menopause transition (perimenopause →
   postmenopause), **independent of chronological aging** — magnitude of systolic/diastolic
   rise and mechanisms (estrogen loss → arterial stiffness, RAAS activation, endothelial
   dysfunction, sympathetic tone)?
2. How does **salt (sodium) sensitivity** change after menopause, and how does that alter
   the BP response to dietary sodium?
3. In men, how does andropause / declining testosterone relate to blood pressure and
   arterial stiffness — is low testosterone a driver or a marker?
4. What is the relationship between BP and the metrics we already track — **resting heart
   rate, HRV, sleep quality/duration, psychological stress, body weight/visceral fat**? Do
   low HRV or poor sleep accompany/predict higher BP?
   > _App lever:_ lets the AI connect BP to the rest of the daily picture we already collect.
5. Does blood pressure vary across **menstrual cycle phases** in still-cycling women, and by
   how much — enough to matter for interpreting home readings?
   > _App lever:_ ties BP into the cycle-phase logic already built.
6. What are the **morning BP surge** and **nocturnal dipping / non-dipping** patterns, what
   do they signify, and are they detectable/relevant from home cuff readings?
7. **White-coat vs masked hypertension**: how common are they, and how does home/self-measured
   BP compare with office BP for identifying true elevated BP?
8. What is the evidence-based **correct method for home BP self-measurement** (rest before,
   posture, arm support, cuff size, number of readings, morning + evening, days of
   averaging) that yields a reliable value?
   > _App lever:_ defines exactly what the input field should collect and instruct.

### B. Thresholds & interpretation (non-diagnostic)

9. What are the current guideline BP categories/thresholds (normal, elevated, stage 1/2)
   for **home/self-measured** BP specifically (they differ from office cutoffs), and are
   there age- or menopause-specific considerations for ages 40–65?
10. Which **single or short-term readings warrant prompt medical attention** (red flags) vs
    a mild chronic elevation that lifestyle can address over time?
    > _App lever:_ the safety gate — when the app must say "see a doctor now."
11. How large a **BP change is clinically meaningful** — e.g., what systolic reduction (mmHg)
    meaningfully lowers cardiovascular risk?

### C. Solutions — nutrition & lifestyle (our value)

12. Magnitude of BP reduction from the **DASH dietary pattern**, and which components drive
    it (fruit/veg, low-fat dairy, whole grains, reduced saturated fat)?
13. **Sodium reduction** dose–response on BP and the target intake — with any menopause
    salt-sensitivity nuance.
14. Effect of **dietary potassium** and the **sodium-to-potassium ratio** on BP — food
    sources and realistic targets (and who must be cautious, e.g., kidney disease / K-sparing drugs).
15. Quantified BP effect of: **weight loss (per kg), alcohol reduction, aerobic exercise,
    isometric/strength training**, and specific items — **dietary nitrate (beetroot),
    magnesium, omega-3, flavanols (dark chocolate), hibiscus, caffeine/coffee**, and
    **licorice** as a BP-raiser to avoid.
16. Which **supplements** have the strongest evidence for modest BP lowering (magnesium,
    potassium, omega-3, CoQ10, beetroot/nitrate) — effect sizes and safety caveats?
17. How do the main **antihypertensive drug classes interact with nutrition** (ACE-inhibitors/
    ARBs + potassium, thiazides + minerals, grapefruit, etc.) — what dietary cautions must a
    wellness advisor know so as **not to conflict with medical treatment**?
    > _App lever:_ safety — advice must not clash with a user's meds.

### D. Safety / communication (non-diagnostic wellness)

18. For a consumer **wellness (non-diagnostic)** app, what is the evidence-supported, safe way
    to communicate an elevated home BP reading and lifestyle guidance **without diagnosing
    hypertension or interfering with medical care** — including the red-flag values that must
    trigger an immediate "seek medical care" message?
    > _App lever:_ confirms term≠claim wording for BP.

---

## 4. How answers get used

- Distil into a WELLNESS_KB **«ДАВЛЕНИЕ»** block: menopause/andropause BP physiology +
  home-BP thresholds + quantified nutrition levers + drug-interaction cautions + red flags.
- Add a **BP input** to the questionnaire (both gadget and manual flows): systolic /
  diastolic (+ pulse), framed as an optional home resting reading, with the measurement
  method from Q8 and averaging guidance; store in `data` (e.g., `bp_sys`/`bp_dia`) → worker
  prompt block.
- Worker interprets the reading descriptively against home-BP cutoffs (Q9), connects it to
  HRV/sleep/stress/weight/cycle (Q4–5), gives nutrition levers (Q12–16), respects meds (Q17),
  and escalates red flags (Q10/18) — all term≠claim, no diagnosis.

---

## 5. SYNTHESIS — answers distilled (2026-07-22)

Raw OpenEvidence answers with citations: `Infa Cloude/N-8/` (folders A–D, files 1–18).
**All numbers are internal reference bands — never quoted to the user as claims.**

### 5.1 Home-BP thresholds → app tiers (what the AI reads the reading against)
Home/self-measured cutoffs (lower than office; no white-coat effect). AHA/ACC 2025:

| Home avg SBP/DBP | Category | App tier | Response |
|---|---|---|---|
| <120/80 | Normal | 🟢 | reassure, keep habits |
| 120–129/<80 | Elevated | 🟡 | lifestyle awareness |
| 130–139/80–89 | Stage 1 (home) | 🟠 | lifestyle + "consider sharing with your provider" |
| ≥140/90 | Stage 2 (home) | 🔴 | "schedule a provider appointment" |
| **≥180/110–120 (any single reading)** | Severe | 🚨 | rest 5 min & re-measure; if still high → provider promptly; **if with symptoms → seek care NOW** |

Red-flag symptoms (with high reading → emergency): severe headache, chest pain, shortness of
breath, vision changes, confusion, focal weakness/numbness, tearing back pain.
ISH/ESC use ≥135/85 as the home hypertension line — we use ≥130/80 (AHA/ACC) as the "above target" cue.

### 5.2 Correct measurement (drives the input field's hint)
Validated **automated upper-arm** cuff (NOT wrist/finger). Empty bladder; no caffeine/smoking/
exercise 30 min; **rest ≥5 min seated, back supported, feet flat, arm on a table at heart level,
don't talk**; **2 readings ≥1 min apart, take the average**; morning (within 1 h of waking, before
meds) + evening; **average over ≥7 days** (min 3, ideally discard day 1). A single reading can over-
read by 3–10 mmHg; bad technique adds 20–70 mmHg → so we ask for a calm resting reading and lean on
the trend, not one spike.

### 5.3 Why it matters for our audience (framing, not diagnosis)
- **Menopause**: BP rise is mostly aging + BMI, but a subgroup accelerates ~1 yr post-menopause
  (~3–5 mmHg); estrogen loss → arterial stiffness, RAAS, endothelial dysfunction. **Salt
  sensitivity roughly doubles (≈22%→53%)** after menopause → sodium restriction is especially
  impactful for women.
- **Men/andropause**: low testosterone tracks with higher BP/stiffness but is **more marker than
  driver** — don't over-attribute; weight/visceral fat/metabolic are the real levers.
- **Ties to what we already collect**: high resting HR, low HRV, short/poor sleep, high stress,
  visceral fat all predict higher BP via **sympathetic overactivation** → BP belongs in the daily
  picture; a high reading alongside low HRV / poor sleep / high stress is a coherent story.
- **Cycle**: natural variation only ~1–3 mmHg (ignore for interpretation; averaging removes it);
  PMS amplifies and is a sentinel for future hypertension; combined OCP raises BP ~9 mmHg.

### 5.4 Nutrition & lifestyle levers (SBP drop, hypertensive; internal reference)
- **DASH pattern**: −5.5 avg, **up to −11 in hypertensive** (veg/fruit, low-fat dairy, whole grains, less sat-fat).
- **Sodium ↓**: ~−3 SBP per 1000 mg cut; target <2300 mg/day (ideal ~1500). Especially strong postmenopause.
- **Potassium ↑ from food**: −4 to −5 SBP; target 3500–5000 mg/day; the **Na/K ratio** matters most.
- **Weight loss**: ~1 mmHg per kg; aim ≥5%.  **Alcohol ↓**: −4 to −6 (from ≥2–3 drinks/day).
- **Exercise**: aerobic 150 min/wk −5; **isometric (wall-sit) −5 to −10**; strength −2 to −7.
- **Modest add-ons**: beetroot/nitrate, magnesium, omega-3 (≥2 g), CoQ10, hibiscus, cocoa flavanols; meditation/slow breathing −5.
- **Avoid**: licorice (raises BP), excess caffeine/alcohol, ultra-processed/high-sodium.

### 5.5 Safety — drug & wording (mandatory)
- **Meds interaction**: if on ACE-inhibitors/ARBs or with kidney issues, **do NOT push high-dose
  potassium or KCl salt substitutes** (hyperkalemia risk) — food potassium is fine, but big changes
  → check with doctor. **NSAIDs (ibuprofen) raise BP / blunt meds → prefer paracetamol.** Grapefruit
  with some BP meds. Sodium restriction *boosts* ACE/ARB effect (good).
- **term≠claim**: "your readings are **above the range associated with heart health**", "consider
  discussing with your provider", "may reflect stress/caffeine/activity" — NEVER "you have
  hypertension / you need medication / this is abnormal". A wellness app displays + educates + refers;
  it does not diagnose or dose.

### 5.6 What the app does with it
- Input field (both flows): optional systolic/diastolic (+ pulse already exists), framed as a calm
  resting home reading, with the §5.2 hint. Store `bp_sys`/`bp_dia` in `data` → worker prompt.
- Worker WELLNESS_KB «ДАВЛЕНИЕ» block: §5.1 tiers + §5.3 framing + §5.4 levers + §5.5 safety, all
  descriptive; escalate red flags; connect to HRV/sleep/stress/weight already in the picture.
