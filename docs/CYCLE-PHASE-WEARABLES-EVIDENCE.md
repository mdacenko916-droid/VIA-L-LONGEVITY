# Cycle-phase × wearable metrics — evidence plan for the AI worker KB

**Purpose.** Give the AI worker pointwise, evidence-based expectations for how each
wearable metric (temperature, RHR, HRV, respiration/SpO₂, sleep) shifts across the
menstrual cycle, so the female daily analysis can read a normal luteal-phase shift as
*context*, not as a problem — descriptively, never as a hormonal diagnosis
(see term≠claim rule in `cloudflare-worker.js` WELLNESS_SYSTEM_PROMPT).

Status: 2026-07-22. Owner pulls answers from OpenEvidence → we distil them into the
worker KB block «ФАЗЫ ЦИКЛА» and the personal-baseline logic.

---

## 1. Why this is needed (the gap)

- **The app compares to a phase-blind personal baseline.** The worker computes each
  metric's personal median (HRV, RHR, sleepHours, deepMin, tempDev, spo2, vo2,
  readiness) and labels today «лучше/хуже личной нормы» (`cloudflare-worker.js`
  ~L4247–4268). That median mixes all cycle phases together.
- **Consequence:** a physiological luteal-phase HRV dip / RHR rise / temp elevation /
  lighter sleep gets scored as "worse than usual" → the AI may alarm the client or
  miss the obvious phase explanation. The `cycle_phase` value now reaches the prompt,
  but we have **no quantified phase-expected bands** to interpret it against.

## 2. What the library already has (checked 2026-07-22)

`Infa Cloude/` is rich on hormones / labs / nutrition / exercise / testosterone, and on
menopause physiology (STRAW+10, HPA–HPG, perimenopause). **It has essentially nothing on
wearable-metric physiology across the menstrual cycle** — the one near-hit,
`N-2/Menstrual Cycle Phase and Viral Shedding`, is off-topic. So this is a clean gap:
the questions below are all net-new material for the KB.

## 3. What the answers must produce (so questions stay actionable)

For each metric we need, in order of usefulness to the app:

1. **Direction + numeric magnitude** of the follicular→luteal shift (ms, bpm, °C, %),
   *with* inter-individual spread — this becomes the phase-adjusted expected band.
2. **A threshold that separates a normal phase-related shift from a signal worth
   flagging** (Q13 — the single most important answer).
3. **Whether the pattern survives in perimenopause / anovulatory cycles** — VIA-L's core
   audience is 35+/40+, many peri; if the biphasic pattern is gone, the app must fall
   back to personal baseline only and NOT apply phase logic.

---

## 4. Question set for OpenEvidence (English)

Owner's original 13 are kept (lightly sharpened for numeric extraction); **NEW** =
additions that close app-specific gaps. Each carries a short note on the app lever it feeds.

### A. Temperature & cycle phase
1. What is the average basal body temperature rise in the luteal phase vs the follicular
   phase (give the °C range and inter-individual spread), and how quickly does the shift
   occur after ovulation?
2. What range of nightly temperature deviation (°C) is considered physiological in the
   luteal phase, versus a threshold that should raise suspicion of infection or
   inflammation?
3. What features distinguish a progesterone-driven temperature pattern from a febrile
   pattern (rate of rise, plateau duration, rate of decline)?
4. How does thermoregulation behave in anovulatory cycles (common in perimenopause) — is
   a clear biphasic pattern still present, and if not, what does wrist/skin temperature
   look like instead?
   > _App lever:_ phase-adjusted `tempDev` expected band; keeps the app from flagging a
   > normal luteal +0.3–0.5 °C as a "signal"; peri fallback.

### B. Resting heart rate & HRV
5. How does resting heart rate typically differ between the follicular and luteal phases
   (give the bpm magnitude)?
6. What is the typical magnitude of HRV (RMSSD) decline in the luteal phase vs the
   follicular phase (give the ms or % range and its variability)?
7. Is there a distinct HRV pattern immediately before or during ovulation?
8. How does perimenopause modify the usual cycle-dependent fluctuations in HRV and
   resting heart rate (are they blunted, exaggerated, or lost)?
   > _App lever:_ phase-adjusted `hrv`/`rhr` bands; the core anti-false-alarm case.

### C. Respiration / SpO₂
9. How does progesterone affect minute ventilation and CO₂ in the luteal phase, and does
   this show up in wearable-measured respiratory rate or SpO₂ (direction and magnitude)?
10. Are there documented changes in nocturnal respiratory rate across cycle phases (give
    the breaths/min magnitude)?
    > _App lever:_ context for the existing resp-rate personal-baseline rule (+3 br/min
    > over median) and the SpO₂ <94% flag — so a luteal respiratory-rate bump isn't
    > over-read.

### D. Sleep
11. How does sleep architecture (deep sleep %, REM %, sleep-onset latency, WASO) differ
    between the follicular and luteal phases (give the % / minute magnitudes)?
12. Does perimenopause alter the typical cycle-related effects on sleep compared with
    reproductive-age women?
    > _App lever:_ phase-adjusted `deepMin`/sleep expectations.

### E. Applied threshold — the key synthesis
13. What deviation thresholds **from an individual's own baseline** are used in the
    literature to flag a metric as a physiological cycle-related shift rather than a
    potential pathological signal?
    > _App lever:_ directly defines how much to widen/shift the personal-baseline "worse
    > than usual" trigger by phase.

### F. NEW — gaps the app specifically needs

14. **[peri validity]** In perimenopausal women with irregular or anovulatory cycles, is
    calendar-based cycle-phase interpretation of wearable metrics still valid, or should
    interpretation revert to the individual's own rolling baseline only? What does the
    evidence recommend?
    > _App lever:_ gate — when to switch phase logic OFF and use personal baseline alone.

15. **[calendar-estimate error]** How accurate is calendar-based phase estimation
    (ovulation ≈ cycle-length − 14) compared with temperature- or LH-confirmed ovulation,
    and what is the typical day-error? By how much can this misplace a woman's true phase?
    > _App lever:_ tells the AI how much to hedge, since our `cycle_phase` is
    > calendar-derived, not measured.

16. **[vasomotor confound]** In perimenopause, how can a luteal-phase nocturnal
    temperature rise and sleep fragmentation be distinguished from vasomotor
    (hot-flash/night-sweat)-driven nocturnal temperature and sleep disruption on
    wearables?
    > _App lever:_ avoids attributing a hot-flash night to "luteal phase" (we already
    > collect hot-flash frequency/intensity).

17. **[hormonal contraception]** How do combined oral contraceptives, progestin-only
    methods, and hormonal IUDs alter the cyclic wearable patterns (temperature, HRV, RHR,
    sleep) — is the natural biphasic pattern blunted or abolished?
    > _App lever:_ another gate — for women on hormonal contraception, suppress phase
    > interpretation (we capture contraceptive use in meds).

18. **[synthesis for safe wording]** For a consumer wellness (non-diagnostic) context,
    what is the evidence-supported, descriptive way to communicate a cycle-phase-related
    metric shift ("your HRV today is consistent with the luteal phase") without implying
    causation, a hormonal measurement, or a diagnosis?
    > _App lever:_ confirms the term≠claim wording is evidence-aligned.

---

## 5. How answers get used

- Distil §4 answers into a compact numeric table (per phase: expected direction +
  magnitude for tempDev / hrv / rhr / respRate / deepMin) → add to the worker KB
  «ФАЗЫ ЦИКЛА» block and, where useful, widen the personal-baseline "worse than usual"
  trigger by the phase-expected amount so normal luteal shifts don't score as decline.
- Encode the gates from Q14/Q17 (anovulatory / hormonal contraception → phase logic OFF,
  personal baseline only) and the Q15 hedge (calendar estimate → soft wording).
- Keep every output descriptive per the term≠claim rule; magnitudes stay internal
  reference bands, never quoted at the user as numbers/claims.
