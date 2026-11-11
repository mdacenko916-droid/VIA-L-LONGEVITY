# Приливы и ночная температура с прибора: что мы можем утверждать

Разбор 2026-11-11. Повод: в документе «ЧТО · КАК · РЕЗУЛЬТАТ» (Библиотека-VIA-L/посты, §1.2) написано, что прибор «ловит даже приливы, которые человек проспал». Проверка по коду, по нашим прошлым выводам и по PubMed. Источник для открытых вопросов — OpenEvidence (вопросы внизу).

## 1. Вывод

**Утверждение неверно для VIA-L.** Приливы, в том числе проспанные, бывают на самом деле: это подтверждено исследованиями. Но наш прибор их не ловит и поймать не может:
- в приложение приходит **одно число за ночь** — отклонение ночной температуры от личной нормы, а не ночная кривая;
- **ни одно** потребительское кольцо или часы не проверено на распознавание приливов по температуре;
- база знаний воркера прямо запрещает выводить приливы из температуры.

## 2. Что делает код (проверено 2026-11-11)

| Где | Что |
|---|---|
| `cloudflare-worker.js` ~5689 (Oura), ~5891 (Ultrahuman), ~4979 (Health) | `ex.tempDev` = `temperature_deviation` **последней ночи**, одно число, границы −2…+2 °C |
| `interpreter-via-l.html` `_cycTempState()` | ряд ночей `vialp_temp_series.nights`, по ночи одно значение — только для проверки фазы цикла (подъём после овуляции) |
| `cloudflare-worker.js` стр. 1078 (KB) | «ТЕМПЕРАТУРА КОЖИ — валидирована ТОЛЬКО для событий менструального цикла… Для менопаузальных симптомов и приливов валидного якоря НЕТ — не выводи приливы из температуры, бери их из того, что человек отметил сам» |
| `doctor-visit.js` | «приливы N из 28 дней» считаются по `hf_count` из ежедневного прохода, то есть по отметкам самой женщины |
| `docs/INDEX-SCORING-REVIEW.md` §«что меняем», `INDEX-SCORING-SOURCES.md` §9 | решение 2026-07: «Приливы по температуре с браслета определить нельзя… Убираем это утверждение из текста»; штраф за «скачок температуры» снижен −12 → −4 |

## 3. Что говорит наука

- **Эталон — кожная проводимость на груди** (рост потоотделения ≥2 мкСм за 30 с), а не температура. В лаборатории совпадение с ощущениями близко к 100%, в обычной жизни заметно ниже (Sievert 2013, PMID 23897855).
- **Проспанные приливы реальны.** Мета-анализ совпадения отчёта и датчика: ночную потливость женщины чаще недосчитывают (46%), чем пересчитывают (22%); общее совпадение в амбулаторных исследованиях около 29% (Mann & Hunter 2011, PMID 21326119).
- **Температура как датчик слабая.** «Изменения только кожной температуры не точны для измерения приливов» (Sievert 2013). Температура пальца при подъёме больше 1 °C: чувствительность около 82%, около 31% приливов пропущено (выгрузка OpenEvidence N-6/1.1/1.txt). Запястье против эталона систематически не изучали.
- **Почему тонет сигнал:** при засыпании температура пальца и запястья и так растёт на 4,7 ± 2,5 °C (данные Oura); плюс комната, одеяло, положение руки (там же).
- **Новое с июля 2026:** обзор 58 работ по датчикам и ИИ в менопаузе, до декабря 2025 (Kuduz 2026, *Maturitas*, PMID 42585780): нет единого эталона, наборы данных малы, проверка разнородная; ВСР связана с тяжестью симптомов слабо и непоследовательно. Многодатчиковый алгоритм на запястье (пульс, движение, температура, **кожная проводимость**) — выше 90% чувствительности, но на 27 приливах у трёх женщин, и основную долю дала проводимость (Tsiartas 2021, PMID 34891695). Это не наши данные и не наши приборы.
- **Цикл — да.** Температура пальца Oura показывает двухфазный цикл (116 женщин, в том числе 53 в возрасте 42–55 лет; Alzueta 2024, PMID 39108015). Это поддерживает нашу температурную проверку фазы.

## 4. Где это утверждение живёт сейчас (исправить после ответа OpenEvidence)

1. `Библиотека-VIA-L/посты/VIA-L-ПРИЛОЖЕНИЕ-ЧТО-КАК-РЕЗУЛЬТАТ.md` §1.2, строка «Ночная температура кожи».
2. Там же §5, «Готовые сегменты»: «ночная температура и приливы, которые вы проспали».
3. Статья «Основ» «Приливы» (`docs/articles/*/hf.md` + `interpreter/articles.js`, ×12): «Если у вас есть кольцо или часы, на них часто видны резкие скачки температуры кожи ночью вместе с пробуждениями». Мягче, но тоже обещает то, чего наш прибор не показывает: ночной кривой у нас нет.

Предлагаемая формулировка для §1.2 документа:
> **Ночная температура кожи** — прибор присылает одно число за ночь: насколько температура отличалась от вашей нормы. Приливы по ней не определить: ни одно кольцо или часы для этого не проверены. Приливы мы берём из ваших отметок, и только так. Температура нужна для другого: подтвердить фазу цикла (после овуляции она держится выше; если «ступеньки» нет, овуляции могло не быть, а в переходе такие циклы часты) и заметить отклонения дня (недосып, начало болезни, алкоголь).

Честный сегмент для постов вместо «проспанных приливов»: **«Ночью вы просыпаетесь, а приливов не помните? Так бывает: ночную потливость женщины часто недосчитывают. Отмечайте утром «Приливы и ночная потливость» и «Пробуждение в 2–4 ночи» — VIA-L сопоставит это со сном с прибора»** (Mann & Hunter 2011). Оба пункта есть в ежедневном проходе (проверено в `interpreter-via-l.html`), так что это то, что приложение действительно делает.

## 5. Вопросы в OpenEvidence

Вставлять по одному. Ответы присылать в чат: Claude сверит PMID в PubMed.

1. As of 2026, has any consumer wearable (Oura Ring Gen3/Gen4, Ultrahuman Ring, Samsung Galaxy Ring, Apple Watch, Fitbit, Garmin, WHOOP) been validated against sternal or torso skin conductance for detecting individual nocturnal hot flashes or night sweats in peri- or postmenopausal women? Please give sensitivity, specificity, sample size and PMID for each study, and say clearly if none exists.

2. Consumer devices export only one aggregated nightly skin-temperature deviation value (e.g., Oura "temperature_deviation", Apple "sleeping wrist temperature"). Is there any evidence that this nightly aggregate is associated, at the within-person level, with the number or severity of nocturnal vasomotor symptoms (objective or self-reported)? Cite effect sizes and PMIDs.

3. What proportion of objectively recorded nocturnal hot flashes or night sweats are not reported by women the next morning? Please update Mann & Hunter 2011 (Menopause, PMID 21326119) with newer ambulatory studies (SWAN, MsHeart/MsBrain, Thurston, de Zambotti), and give the share of nocturnal hot flashes followed by an awakening.

4. Are there validated multi-sensor algorithms (PPG heart rate, accelerometry, skin temperature, electrodermal activity) that detect hot flashes during sleep using commercially available devices? What are the sample sizes, and has any been tested outside the lab in more than 50 women? PMIDs please.

5. For a consumer app that cannot detect hot flashes, is it evidence-based to use wearable-derived awakenings or wake after sleep onset as a prompt asking the woman to log night sweats (not as a detection)? Are there studies on morning symptom recall versus real-time logging of night sweats (recall bias, diaries versus electronic logging)?
