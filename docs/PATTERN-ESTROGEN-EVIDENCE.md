# P-F1 Эстроген (дефицит / доминирование-флукс) — углубление паттерна: вопросы для OpenEvidence

Цель: сделать так, чтобы ИИ **различал два под-состояния** и читал их через наши метрики/симптомы,
а не выдавал одну общую «гормональные колебания». Это несущая ось перименопаузальной линзы.

## Что уже есть
- **Клинический KB** P-F1 (`cloudflare-worker.js` ~L29): разделяет ДЕФИЦИТ (мено/пост) и
  ДОМИНИРОВАНИЕ/ФЛУКС (пери) с протоколами питания/нутрицевтиков. Хорошая база.
- **Велнес-KB** P-F1 (~L728): ОДНА общая строка («цельная соя, лён, клетчатка, крестоцветные,
  рыба; D3+K2, магний, омега-3») — различение флукс vs дефицит ПОТЕРЯНО.
- Данные до ИИ доходят (phase, приливы, температура, сон, настроение/тревога, вес, цикл).

## Что должны дать ответы
1. Распознавание флукс (пери) vs дефицит (мено) — по симптомам И по нашим метрикам (без гормон-анализов).
2. Как каждое под-состояние отражается в носимых (сон/темп/ВСР/пульс) и субъективных сигналах.
3. Доказательные велнес-рычаги ОТДЕЛЬНО под каждое под-состояние, с величинами и безопасностью.

---

## Вопросы для OpenEvidence (English)

### A. Flux vs deficit — recognition
1. In perimenopause, how do estrogen fluctuations (erratic peaks, relative "estrogen dominance" vs progesterone) differ physiologically from the low-estrogen state of menopause/postmenopause — and what are the hallmark symptom clusters of each (flux: heavy/irregular bleeding, breast tenderness, mood swings, migraines, intensified PMS; deficit: hot flashes, night sweats, vaginal dryness, joint aches, cognitive fog)?
2. How does the estrogen-to-progesterone ratio shift across the menopause transition, and why does relative progesterone deficiency appear early in perimenopause while estrogen can still surge?
3. Within the same perimenopausal woman across a month, which symptoms/signs best distinguish a high-estrogen (flux) phase from a low-estrogen phase?

### B. How each shows up in the metrics/signals we track (consumer, no hormone labs)
4. How do estrogen fluctuation vs deficiency each affect sleep architecture, nocturnal temperature, HRV, resting HR, and mood — i.e., what wearable + symptom footprint does each sub-state leave?
5. Estrogen and thermoregulation: the mechanism/threshold by which falling estrogen produces hot flashes/night sweats, and how that maps onto nocturnal temperature elevation and awakenings on a wearable?
6. Estrogen and cognition/mood: the evidence linking estrogen decline vs fluctuation to brain fog, memory, anxiety and mood swings — is it the fluctuation or the low level that matters more?
7. Estrogen and body composition / insulin sensitivity: how estrogen loss shifts fat toward visceral, lowers insulin sensitivity and raises sugar cravings — quantify where possible (this ties fog + cravings + weight into one story).

### C. Solutions — evidence-based lifestyle/nutrition levers (wellness)
8. Phytoestrogens (soy isoflavones, flaxseed lignans): evidence and effect size for hot flashes / menopausal symptoms, effective doses, and safety — including the breast-health nuance and whether they help flux vs deficit differently.
9. Cruciferous vegetables / DIM / I3C and estrogen metabolism: the actual human evidence for supporting healthier estrogen metabolism (relevant to the flux/dominance sub-state), and what is safe to recommend food-first vs supplement claims to avoid.
10. Dietary fiber and estrogen: how fiber affects estrogen recirculation/excretion (enterohepatic), and what intake (g/day) meaningfully helps.
11. Which lifestyle levers most reduce vasomotor/menopausal symptom burden — weight loss, exercise (incl. strength), alcohol reduction, cooling/sleep hygiene, stress/CBT, Mediterranean pattern — with magnitudes.
12. Alcohol, caffeine and refined sugar vs menopausal symptoms and estrogen: quantified effects and where evidence is strong enough to advise reduction.

### D. Safety / communication (non-diagnostic wellness)
13. For a consumer wellness (non-diagnostic) app: how to describe estrogen-related patterns descriptively (peri flux vs deficit) WITHOUT implying a hormone measurement or diagnosis; and which hormone-active herbs (black cohosh, red clover, dong quai, vitex/chasteberry) should stay options-only without dose/regimen claims, plus their key interaction cautions.

---

## Как ответы будут использованы
- Переписать велнес-KB P-F1 в ДВА под-блока (флукс-пери / дефицит-мено) с распознаванием по нашим
  сигналам + рычагами под каждое, дескриптивно (term≠claim), гормон-активные травы — только опция без доз.
- Усилить перименопаузальную линзу: связать кластер (ВСР/сон/туман/тяга/вес/либидо) с под-состоянием
  эстрогена как единой историей.
- Держать числа внутренними ориентирами (клиенту — качественно).

---

## СИНТЕЗ (2026-07-22) — вложено в велнес-KB P-F1
Сырьё с цитатами: `Infa Cloude/N-9/` (A–D, 1–13). Ключевое:
- **Флукс (пери):** эстроген скачет + прогестерона мало. Кластер: обильные/нерегулярные месячные,
  болезненность груди, перепады/ПМС, мигрени, вздутие. Носимые: high-эстроген → ↑ночная ВСР,
  стабильнее темп; прогестероновые ночи → ↑пробуждения, ↓глубокий. **Настроение тянет амплитуда
  колебаний, не уровень** (Joffe: вариабельность E2 β=0.11, p=0.001).
- **Дефицит (мено):** эстроген низкий стабильно. Кластер: приливы, ночная потливость, сухость,
  суставы, туман, фрагментированный сон. Носимые: резкие скачки кожной темп 1–7 °C + пробуждения
  (78% приливов будят; термонейтральная зона ~0 vs 0.4 °C), ВСР ниже (симпатика). **Туман тянет
  снижение** (мозговой глюкозный обмен; SWAN — временный дефицит, восстанавливается пост-мено).
- **Единая цепочка:** эстроген↓ → висцеральный жир +6.2%/год в переходе + инсулинорезистентность →
  тяга к сахару + туман + вес (вес на весах не меняется — жир↑/мышцы↓ маскируют). SWAN DXA.
- **Рычаги:** соя-изофлавоны −1.3 прилива/день (лён по приливам — нет); клетчатка ≥25–30 г → −10–20%
  циркулирующего эстрогена (энтерогепатика); крестоцветные — еда, DIM/I3C-БАД клинически не доказан;
  алкоголь — сильнейший вред (доза-зависимо ↑симптомы+эстроген, сдвиг обмена); по приливам сильнее
  всего КПТ/релаксация/гипноз (не йога/спорт напрямую); силовые — не гасить.
- **Подача:** «паттерн, типичный для…», НЕ «ваш эстроген высокий/низкий»; травы — опция без доз.
