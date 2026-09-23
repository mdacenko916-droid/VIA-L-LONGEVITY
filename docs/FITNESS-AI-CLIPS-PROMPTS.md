# Генерация клипов упражнений нейросетью — инструкция и задания

> 2026-09-23. Проба третьего пути: клипы упражнений генерируются из наших опорных кадров
> (`скрин/модель фото/`, ведущая и комната VIA·L) в Kling или Google Flow.
> Модель приложения — `FITNESS-APP-MODEL.md` §12 (единица контента — клип упражнения 10–15 с).
> Приоритет упражнений и английские названия — `FITNESS-EXERCISE-LIST.md`.

## 1. Настройки генератора

- Режим **image-to-video** (из изображения в видео). Без опорного кадра ведущая будет каждый раз новая.
- Длительность **5 секунд**, звук **выключен** (голос накладываем свой, Cartesia).
- Максимальное разрешение, соотношение 16:9.
- Одно движение — **один-два повтора** в клипе. Зацикливание делаем мы при монтаже.
- Закладывайте 3–5 попыток на упражнение: брак — норма.

## 2. Опорные кадры

| Файл | Для каких упражнений |
|---|---|
| `01_спереди_стоя.png` | прыжки, «джампинг джек», шаг на месте, круги тазом |
| `02_сбоку_стоя.png` | присед к стулу, наклон без веса, выпад назад, подъём на носки, баланс на одной ноге |
| `03_три_четверти_стоя.png` | жим над головой стоя, разведение рук, тяга к подбородку |
| `04_сбоку_с_гантелями.png` | румынская тяга, тяга в наклоне, «прогулка фермера», гоблет-присед |
| `05_лёжа_на_спине.png` | ягодичный мост, «мёртвый жук», касание пятками пола |
| `06_на_четвереньках.png` | «птица-собака», «кошка-корова», «медведь», планка, отжимания с колен |
| `07_сидя_на_стуле.png` | жим над головой сидя, подъём со стула, растяжка сидя |

## 3. Как собирается задание

К каждому заданию: **опорный кадр + текст движения + общий хвост**. Хвост одинаковый всегда:

> Static camera, no camera movement, side view unchanged, whole body including feet stays in frame,
> smooth realistic motion, natural daylight, same room and same woman as in the reference image,
> no text, no logos, 5 seconds.

## 4. Задания по упражнениям (приоритет A)

**Присед к стулу** · кадр 02
> The woman performs one slow bodyweight squat: hips move back as if sitting down, knees stay in line with her toes, back straight, arms reach forward for balance. She lightly touches the chair seat with her hips, then stands back up.

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
