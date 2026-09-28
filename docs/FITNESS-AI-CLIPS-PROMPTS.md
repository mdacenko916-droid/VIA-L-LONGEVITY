# Генерация клипов упражнений нейросетью — инструкция и задания

> 2026-09-23. Проба третьего пути: клипы упражнений генерируются из наших опорных кадров
> (`скрин/модель фото/`, ведущая и комната VIA·L) в Kling или Google Flow.
> Модель приложения — `FITNESS-APP-MODEL.md` §12 (единица контента — клип упражнения 10–15 с).
> Приоритет упражнений и английские названия — `FITNESS-EXERCISE-LIST.md`.

## 0. Ведущие и комната — канон (решение владельца 2026-09-27)

**Ева** — женский трек. Женщина 48–52, **обычное телосложение** (не худая и не полная, без рельефа,
мягкий плоский живот), волнистые русые волосы до плеч, доброжелательное лицо. Светло-серая футболка
по фигуре до бедра, тёмно-серые лосины, белые кроссовки.

**Адам** — мужской трек. Мужчина 50–55, обычное телосложение без рельефа, короткие седеющие волосы,
короткая седая борода. Тёмно-серая футболка по фигуре, светло-серые **прямые** спортивные брюки
(без манжет — видно щиколотку), белые кроссовки.

**Комната одна на обоих:** светлая пустая тёплая-белая стена, светлый деревянный пол, **тёмно-бирюзовый
коврик**, простой деревянный стул без колёсиков, пара гантелей на полу, зелёное растение у окна,
ровный дневной свет сбоку.

Эталонные кадры — `скрин/1/2.PNG` (Ева) и `скрин/1/Адам.PNG` (Адам). **Прикладывать их к каждой
генерации**, иначе ведущий, одежда и комната «поплывут» от кадра к кадру.

## 1. Настройки генератора

**Генератор — Google Flow (Veo).** Проба 2026-09-24: движение чистое, техника правильная.
Kling отложен: приседание вышло неглубоким с лишним провалом, а на бесплатном тарифе поверх видео
стоит водяной знак.

- Режим **image-to-video** (из изображения в видео). Без опорного кадра ведущая будет каждый раз новая.
- Длительность **5 секунд**, звук **выключен** (голос накладываем свой, Cartesia).
- Максимальное разрешение, соотношение 16:9.
- Одно движение — **один-два повтора** в клипе. Зацикливание делаем мы при монтаже.
- Закладывайте 3–5 попыток на упражнение: брак — норма.

## 2. Опорные кадры

Для каждого ведущего — своя папка (`модель фото/Ева`, `модель фото/Адам`) с восемью видами:
семь из таблицы ниже + восьмой, **сбоку со стулом вплотную за спиной** (для приседа к стулу).

| Файл | Для каких упражнений |
|---|---|
| `01_спереди_стоя.png` | прыжки, «джампинг джек», шаг на месте, круги тазом |
| `02_сбоку_стоя.png` | присед к стулу, наклон без веса, выпад назад, подъём на носки, баланс на одной ноге |
| `03_три_четверти_стоя.png` | жим над головой стоя, разведение рук, тяга к подбородку |
| `04_сбоку_с_гантелями.png` | румынская тяга, тяга в наклоне, «прогулка фермера», гоблет-присед |
| `05_лёжа_на_спине.png` | ягодичный мост, «мёртвый жук», касание пятками пола |
| `06_на_четвереньках.png` | «птица-собака», «кошка-корова», «медведь», планка, отжимания с колен |
| `07_сидя_на_стуле.png` | жим над головой сидя, подъём со стула, растяжка сидя |
| `08_сбоку_стул_вплотную.png` | **присед к стулу** — стул стоит вплотную за спиной, двигать нечего |

## 3. Как собирается задание

К каждому заданию: **опорный кадр + текст движения + общий хвост**. Хвост одинаковый всегда:

> Locked-off tripod shot, fixed camera, no zoom, no dolly, no pan. The chair, the mat, the dumbbells
> and the plant stay perfectly still in their exact positions; no objects appear, duplicate or disappear.
> Whole body including feet stays in frame the whole time. Smooth realistic human motion, natural daylight,
> same room and same person as in the reference image, no text, no logos, 5 seconds.

⚠️ Хвост переписан 2026-09-24 после пробы: у Veo стул «подъезжал» и на одном кадре **раздваивался**,
камера слегка наезжала. Запрет на движение предметов и на зум — обязателен.
Если в упражнении нужен стул, берите кадр, где он **стоит вплотную за спиной** — двигать нечего.
Число повторов задавайте словами: `exactly two slow repetitions at an even tempo, without any extra
bouncing or half-repetitions`.

## 3a. Проба удалась — 2026-09-28 (Ева, присед к стулу)

`скрин/Eva тренер видео/Woman_performing_bodyweight_squat_...mp4` — **эталон**. Стул неподвижен и не
раздваивается, камера стоит, стопы в кадре, техника чистая: таз назад, колени по линии носков, спина ровная.
Стык проверен кодом: последний кадр отличается от первого на 2,5 из 255 → **клип зацикливается без шва**.

Отсюда правило: **длинные ролики не генерируем**. Генерируем 5 секунд с одним-двумя повторами, нужное
число повторов делает проигрыватель зацикливанием. Это дешевле по кредитам и надёжнее по технике.

## 4. Задания по упражнениям (приоритет A)

Ева и Адам выполняют одни и те же движения — меняется только приложенный кадр (папка Евы или Адама)
и местоимение в тексте (`the woman` / `the man`).

**Присед к стулу** · кадр 08 (стул вплотную за спиной)
> The woman performs exactly two slow squats at an even tempo, without any extra bouncing or half-repetitions: hips move back as if sitting down, knees stay in line with her toes, back straight, arms reach forward for balance. She lightly touches the chair seat with her hips, then stands back up.

**Гоблет-присед** · кадр 04
> Holding one dumbbell with both hands close to her chest, the woman performs one slow squat: hips back, knees in line with toes, chest upright, then she stands back up.

**Наклон с прямой спиной (без веса)** · кадр 02
> Knees slightly bent, the woman hinges at the hips: her hips travel back, her hands slide down the front of her thighs to knee level, her back stays perfectly flat, then she stands back up.

**Румынская тяга с гантелями** · кадр 04
> Holding a dumbbell in each hand in front of her thighs, knees slightly bent, the woman hinges at the hips: the dumbbells slide down close to her legs to mid-shin, her back stays flat, then she stands back up and squeezes her glutes.

**Выпад назад** · кадр 02
> The woman steps backward with her right foot onto the toes, lowers straight down bending both knees, front knee stays above the ankle, then pushes through the front heel and returns to standing.

**Подъём на носки** · кадр 02
> The woman rises slowly onto the balls of her feet as high as she can, holds for a moment, then lowers her heels back to the floor under control. She rests one hand on the chair back for balance.

**Ягодичный мост** · кадр 05
> Lying on her back with knees bent and arms alongside her body, the woman slowly lifts her hips until knees, hips and shoulders form a straight line, holds briefly, then lowers her hips back to the mat.

**«Мёртвый жук»** · кадр 05
> Lying on her back with both arms pointing straight up and knees bent above her hips, the woman slowly lowers her right arm behind her head and straightens her left leg towards the floor, then returns both to the start. Her lower back stays flat on the mat.

**«Птица-собака»** · кадр 06
> On all fours, the woman slowly extends her right arm forward and her left leg straight back until both are level with her back, holds briefly, then returns to the starting position. Her back stays flat and still.

**Планка на предплечьях** · кадр 06
> The woman lowers onto her forearms and steps her feet back into a straight plank, body in one line from head to heels, and holds the position steadily.

**Отжимания от стены** · кадр 02
> The woman stands an arm's length from the plain wall, places both palms on the wall at shoulder height, bends her elbows to bring her chest towards the wall, then pushes back to the start. Her body stays in one straight line.

**Отжимания с колен** · кадр 06
> From all fours the woman walks her hands forward and lowers her chest towards the mat with her knees on the floor, elbows close to her body, then pushes back up. Her body stays in one line from head to knees.

**Тяга гантелей в наклоне** · кадр 04
> Holding a dumbbell in each hand, the woman hinges forward with a flat back and lets the dumbbells hang, then pulls both dumbbells up to her waist, elbows close to her body, and lowers them again.

**Жим над головой сидя** · кадр 07
> Sitting upright on the chair holding a dumbbell in each hand at shoulder height, the woman presses both dumbbells straight up overhead, then lowers them back to her shoulders.

**«Прогулка фермера»** · кадр 04
> Holding a dumbbell in each hand at her sides, shoulders down and back straight, the woman walks slowly and steadily across the room from left to right.

**Мини-прыжки на месте** · кадр 01
> The woman performs small light jumps in place, landing softly on the balls of her feet with knees slightly bent, arms relaxed at her sides.

**Стойка на одной ноге** · кадр 02
> The woman slowly lifts her right foot off the floor and balances on her left leg, knee slightly soft, arms out to the sides for balance, and holds the position steadily.

**Шаг на месте** · кадр 01
> The woman marches in place at a calm pace, lifting her knees to hip height and swinging her arms naturally.

## 5. Что проверять в готовом клипе

1. Камера стоит на месте, кадр не наезжает и не уезжает.
2. Стопы видны всё время.
3. Тело не «плывёт»: не появляются лишние руки, не проваливается стул, гантели не исчезают.
4. Техника правильная: колени по линии носков, спина не круглится, поясница не прогибается.
5. Ведущая похожа на себя из других клипов.

Брак не переделываем текстом до бесконечности — проще перегенерировать 2–3 раза с тем же заданием.

---

## 5. Пары кадров «верх → низ» (приём 2026-09-28)

Проба показала: **амплитуду задаёт картинка, а не текст.** Veo сам делает присед на четверть, сколько
его ни проси. Лечится режимом Flow «начальный и конечный кадр»: даём две картинки, генератор рисует
движение между ними. Так же решается и стык — если конец совпадает со стартом.

**Как работать:**
1. В ChatGPT делаем две картинки: **верхняя точка** (исходное положение) и **нижняя точка** (конец движения).
   К обеим прикладываем эталон Евы (`скрин/1/2.PNG`) или Адама (`скрин/1/Адам.PNG`).
2. В Flow: начальный кадр — верхняя точка, конечный — она же; нижняя точка идёт серединой движения.
   Если режим принимает только начало и конец, ставим верх → низ и добавляем в текст:
   `She returns to the starting standing position at the end of the clip.`
3. Текст движения — короткий: `She lowers down and stands back up twice, slowly and evenly. The camera does not move.`

**Общий хвост для КАДРА (не для видео):**
> Same woman, same clothes, same room as in the reference image. Standing on the teal mat. Camera at waist
> height, whole body including feet fully visible. Photorealistic, no text, no logos, 16:9.

### Пары для упражнений с амплитудой

| Упражнение | Верхняя точка | Нижняя точка |
|---|---|---|
| Присед к стулу | `Side view, standing in front of the wooden chair, the chair directly behind her, arms reaching forward` | `Side view, in the bottom of a squat, seat lightly touching the chair seat, knees bent about ninety degrees, back straight, arms forward` |
| Гоблет-присед ✅ | `Side view, standing, holding one dumbbell with both hands in front of her, elbows down` | `Side view, in the bottom of a squat, knees bent about ninety degrees, seat at knee level, back straight, dumbbell still in both hands` |
| Румынская тяга | `Side view, standing tall, holding a dumbbell in each hand in front of her legs` | `Side view, bent forward at the hips with a flat back, knees slightly bent, dumbbells hanging at mid-shin level` |
| Наклон без веса | `Side view, standing tall, hands resting on the front of her legs` | `Side view, bent forward at the hips with a flat back, hands sliding down to knee level` |
| Выпад назад | `Side view, standing tall, hands on her waist` | `Side view, in a backward lunge: right foot stepped back on the toes, both knees bent about ninety degrees, torso upright` |
| Подъём на носки | `Side view, standing tall next to the chair, one hand resting on the chair back` | `Side view, risen high on the balls of both feet, heels lifted off the floor, one hand on the chair back` |
| Ягодичный мост | `Side view, lying on her back on the mat, knees bent, feet flat, arms alongside her body` | `Side view, hips lifted so that knees, hips and shoulders form one straight line` |
| «Мёртвый жук» | `Side view, lying on her back, both arms pointing straight up, knees bent above the hips` | `Side view, lying on her back, right arm lowered behind her head and left leg extended straight just above the floor, lower back flat on the mat` |
| «Птица-собака» | `Side view, on all fours, hands under shoulders, knees under hips, flat back` | `Side view, on all fours with the right arm extended forward and the left leg extended straight back, both level with the flat back` |
| Отжимания от стены | `Side view, standing an arm's length from the wall, both palms on the wall at shoulder height, body in one straight line` | `Side view, elbows bent, body leaning close to the wall, still in one straight line from head to heels` |
| Отжимания с колен | `Side view, in a kneeling push-up start: hands under shoulders, knees on the mat, body in one line from head to knees` | `Side view, lowered so that the chest is just above the mat, elbows bent close to the body, body still in one line` |
| Тяга в наклоне | `Side view, bent forward at the hips with a flat back, dumbbells hanging down at arm's length` | `Side view, same bent-forward position, both dumbbells pulled up to waist level, elbows close to the body` |
| Жим над головой сидя | `Side view, sitting upright on the chair, a dumbbell in each hand at shoulder height, elbows down` | `Side view, sitting upright on the chair, both dumbbells pressed straight overhead, arms extended` |

### Одиночные кадры (движение без амплитуды)

Планка · «прогулка фермера» · мини-прыжки · стойка на одной ноге · шаг на месте — хватает одного кадра
из папки ведущего и короткого текста движения из §4: удержание, ходьба или мелкие повторы генератор
делает без подсказок об амплитуде.
