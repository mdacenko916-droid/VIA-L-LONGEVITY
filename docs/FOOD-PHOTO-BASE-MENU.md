# Фото для базового меню «Памятки дня» — промпты для GPT (2026-11-10)

Зачем: меню завтрака/обеда/ужина в `interpreter/dayplan-base.js` писалось отдельно от каталога фото,
поэтому у обеда фото нет совсем, у ужина — одно, у завтрака — половина. Здесь — 21 недостающее фото.
Стиль — тот же, что у 65 готовых (`docs/FOOD-PHOTO-SPEC.md`), чтобы новые не выделялись.

## Как делать в GPT

1. **Первым сообщением в чат загрузить образец** — готовое фото
   `/Users/foxmaster/Developer/VIA-L-LONGEVITY/interpreter/food/ln_beef_rice.webp`
   и написать: «Make all following images in exactly the same style, plate, angle and lighting as this reference».
2. Дальше — по одному промпту из списка ниже (каждый промпт полный, копировать целиком).
3. **Размер:** 1024×1024, квадрат. **Формат:** PNG с прозрачным фоном.
4. **Имя файла** — ключ из заголовка (`bf_omelet_seeds_greens.png` и т.д.). Готовые PNG сложить в одну папку
   и сказать мне где — я сожму в webp 512×512, положу в `interpreter/food/` и привяжу к меню.

Проверка каждого фото перед сохранением:
- фон прозрачный (не белый, не стол), под тарелкой мягкая тень;
- тарелка та же — круглая матовая тёмно-графитовая, без рисунка, ~85% кадра, ракурс 45°;
- на тарелке ровно то, что в составе, без лишнего (никакого сыра, соусов-разводов, приборов, если не сказано).

---

## ЗАВТРАКИ (7)

### 1. `bf_omelet_seeds_greens` — Омлет из 3 яиц + тыквенные семечки + зелень
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: a fluffy folded omelette made from 3 eggs, a small sprinkle of roasted pumpkin seeds (about 1 tablespoon) on top, a handful of fresh mixed greens (arugula, spinach) beside it. No cheese, no bread, no sauce. 1024x1024, PNG with transparent background.

### 2. `bf_mackerel_toast_avocado` — Скумбрия/лосось + цельнозерновой тост + авокадо
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: two slices of wholegrain bread toast, on them flakes of smoked mackerel (about 80 g), half an avocado sliced in a fan next to the toast, a lemon wedge and a few dill sprigs. No cheese, no eggs. 1024x1024, PNG with transparent background.

### 3. `bf_yogurt_almond_chia` — Греческий йогурт + миндаль/орехи + семена чиа
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: a matte dark-graphite ceramic bowl standing on the plate, filled with thick white Greek yogurt (about 200 g), topped with a small handful of whole almonds (about 20 g) and a sprinkle of chia seeds (1 tablespoon). No fruit, no granola, no honey. 1024x1024, PNG with transparent background.

### 4. `bf_oat_protein_banana` — Овсянка + протеин + орехи + банан
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: a matte dark-graphite ceramic bowl standing on the plate with creamy oatmeal porridge (about 250 g cooked), topped with half a sliced banana, a small handful of chopped walnuts (about 15 g). The porridge looks thick and slightly creamy (protein stirred in). No berries, no syrup. 1024x1024, PNG with transparent background.

### 5. `bf_omelet_avocado_greens` — Омлет из 2–3 яиц + авокадо + горсть зелени
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: a soft folded omelette made from 2–3 eggs, half an avocado sliced in a fan next to it, a handful of fresh baby spinach and arugula. No cheese, no bread, no tomatoes. 1024x1024, PNG with transparent background.

### 6. `bf_oat_protein_berries` — Овсянка на воде + протеин + ягоды
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: a matte dark-graphite ceramic bowl standing on the plate with oatmeal porridge cooked on water (about 250 g cooked), thick and creamy, topped with a handful of fresh blueberries and raspberries (about 80 g). No nuts, no banana, no syrup. 1024x1024, PNG with transparent background.

### 7. `bf_kefir_smoothie` — Смузи: кефир + ягоды + протеин + лён
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no napkins. Honest home portion: one tall clear glass standing on the plate, filled with a thick berry-pink smoothie (about 300 ml), a light sprinkle of ground flaxseed on top; beside the glass on the plate a few fresh blueberries and raspberries. No straw, no whipped cream, no decorations. 1024x1024, PNG with transparent background.

---

## ОБЕДЫ (6) — у обеда сейчас нет ни одного фото

### 8. `ln_turkey_buckwheat_salad` — Индейка/курица ~130 г + гречка + большой салат с оливковым маслом
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: sliced grilled turkey breast (about 130 g), a mound of cooked buckwheat (about 150 g), a large fresh salad of lettuce, cucumber, cherry tomatoes and greens glistening lightly with olive oil, taking about half the plate. 1024x1024, PNG with transparent background.

### 9. `ln_salmon_brownrice_broccoli` — Лосось/тунец ~140 г + бурый рис + брокколи
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: a baked salmon fillet (about 140 g), a portion of cooked brown rice (about 150 g), steamed broccoli florets taking about half the plate, a lemon wedge. No sauce. 1024x1024, PNG with transparent background.

### 10. `ln_lentil_chickpea_stew` — Чечевица/нут + тушёные овощи + зелень
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: a hearty stew of brown lentils and chickpeas (about 250 g) with stewed carrots, zucchini, onion and tomato, topped with fresh chopped parsley and a few leaves of spinach on the side. Fully plant-based: no meat, no cheese, no egg. 1024x1024, PNG with transparent background.

### 11. `ln_beef_sweetpotato_greens` — Постная говядина + запечённый батат + листовые овощи
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: slices of lean grilled beef (about 130 g), half a baked sweet potato with orange flesh (about 150 g), a generous handful of leafy greens (spinach, arugula, romaine). No sauce, no rice. 1024x1024, PNG with transparent background.

### 12. `ln_chicken_quinoa_grilledveg` — Куриная грудка + киноа + овощи-гриль
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: a sliced grilled chicken breast (about 130 g), a mound of cooked quinoa (about 150 g), grilled vegetables with visible grill marks — zucchini, red bell pepper, eggplant — taking about half the plate. No sauce. 1024x1024, PNG with transparent background.

### 13. `ln_warm_bean_egg_salad` — Тёплый салат: фасоль + яйцо + авокадо + зелень
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion: a warm salad of cooked white and red beans (about 150 g) on a bed of mixed greens, one boiled egg cut in halves, half an avocado in cubes, a light drizzle of olive oil. No cheese, no meat, no croutons. 1024x1024, PNG with transparent background.

---

## УЖИНЫ (8) — у ужина сейчас одно фото

### 14. `dn_whitefish_stewed_veg` — Белая рыба + тушёные овощи
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion, light evening meal: a baked white fish fillet such as cod or hake (about 140 g), soft stewed vegetables — zucchini, carrots, bell pepper, onion — (about 200 g), a sprig of dill. No rice, no potatoes, no sauce. 1024x1024, PNG with transparent background.

### 15. `dn_chicken_big_salad` — Куриная грудка + большой салат
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion, light evening meal: a sliced grilled chicken breast (about 120 g), a large fresh salad of lettuce, cucumber, cherry tomatoes, radish and herbs taking more than half of the plate, a light drizzle of olive oil. No grains, no bread, no cheese. 1024x1024, PNG with transparent background.

### 16. `dn_omelet_grilledveg` — Омлет + овощи-гриль
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion, light evening meal: a folded omelette made from 2–3 eggs, grilled vegetables with visible grill marks — zucchini, red bell pepper, eggplant — beside it, a few fresh herb leaves. No cheese, no bread. 1024x1024, PNG with transparent background.

### 17. `dn_turkey_stewed_cabbage` — Индейка + тушёная капуста
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion, light evening meal: slices of baked turkey breast (about 130 g), a generous portion of soft stewed white cabbage with a little carrot (about 200 g), a sprig of parsley. No potatoes, no sauce. 1024x1024, PNG with transparent background.

### 18. `dn_cottage_nuts` — Творог + орехи (лёгкий поздний вариант)
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion, light late snack-dinner: a mound of crumbly white cottage cheese (about 150 g), topped with a small handful of walnut halves (about 15 g). Nothing else — no berries, no fruit, no honey. 1024x1024, PNG with transparent background.

### 19. `dn_cottage_greens_flax` — Творог + зелень + 1 ст. л. льна
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion, light evening meal: a mound of white cottage cheese (about 150 g) mixed with fresh chopped dill, parsley and green onion, sprinkled with 1 tablespoon of ground flaxseed, a few cucumber slices on the side. No fruit, no berries, no bread. 1024x1024, PNG with transparent background.

### 20. `dn_chicken_broccoli` — Запечённая курица + брокколи на пару
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion, light evening meal: a baked chicken breast with lightly golden skin-free surface, sliced (about 130 g), bright green steamed broccoli florets (about 200 g). No rice, no potatoes, no sauce. 1024x1024, PNG with transparent background.

### 21. `dn_yogurt_nuts` — Греческий йогурт + орехи (лёгкий поздний вариант)
Photorealistic food photography, single round matte dark-graphite ceramic plate centered, filling ~85% of frame, 45-degree three-quarter view, warm golden side lighting from upper left, soft translucent contact shadow under the plate, transparent background, no table, no cutlery, no napkins. Honest home portion, light late snack-dinner: a small matte dark-graphite ceramic bowl standing on the plate with thick white Greek yogurt (about 150 g), topped with a small handful of mixed walnuts and almonds (about 15 g). No fruit, no berries, no honey, no chia. 1024x1024, PNG with transparent background.

---

## Фото НЕ нужны (уже есть подходящие)

| Вариант меню | Готовое фото |
|---|---|
| Творог + грецкий орех + ягоды / Творог + ягоды + лён | `bf_cottage_berries` |
| Яичница из 3 яиц + тост + помидоры | `bf_eggs_veg` |
| Тост + яйцо-пашот + авокадо | `dn_egg_avocado` |
| Тёплый овощной суп + порция белка | `dn_soup_fish` |
| Омлет + большой салат | `bf_omelet_cheese` |

После загрузки: метки `[dish:KEY]` в `dayplan-base.js` + БЖУ новых ключей в `_DISH` (VIA-L и ADAM-L).
