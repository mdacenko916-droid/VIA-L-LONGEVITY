# Письмо в Oura: фото кольца в приложении (черновик, 2026-09-01)

**Кому:** `branduse@ouraring.com` — адрес из `ouraring.com/guidelines-for-commercial-use`,
указан для запросов на использование «Oura Brand Features».
**Повод:** единственная серая зона после сверки — см. `OURA-COMPLIANCE-REVIEW.md` §1. Марки и
логотипы мы не используем вообще, а вот фото кольца — **официальный продуктовый снимок** (кольцо
в разрезе, с видимыми сенсорами). Брендбук для API описывает вордмарк и про продуктовую
фотографию молчит, а страница коммерческого использования требует письменного разрешения на любые
Brand Features. Дешевле спросить, чем узнать постфактум.

**Отдельным письмом, не в тикет #7815321:** тот тред вёл Member Care про доступ к API, это вопрос
к бренд-команде.

---

## Точные факты (проверено по коду 2026-09-01)

Фото **одно**, лежит в репозитории под двумя именами-дублями — `interpreter/images-in/oura.png` и
`interpreter/images-in/Oura Ring Gen 4 gold.PNG` (побайтово разные файлы, визуально один и тот же
снимок). Используется в **двух** местах, оба — на экране подключения источника данных:

**1. Карточка подключения Oura** (`interpreter-via-l.html:2211`, копия в EXPERT:2174).
Иконка 42×42 в кликабельной карточке. Рядом: название «Oura Ring», строка
«HRV · Сон · Температура · Пульс · Готовность», бейдж «РЕЖИМ ТЕСТ» и наш ярлык качества данных
«Лучший» (`badge-best`). Нажатие открывает официальный OAuth-экран Oura. Это **более заметное**
и более рискованное для бренд-команды использование, чем лента ниже.

**2. Лента совместимости** внутри карточки Apple Health (`interpreter-via-l.html:2260`).
Восемь фото трекеров подряд по 44×44 (Apple Watch, Garmin, Samsung, Withings, **Oura**, Fitbit,
Ultrahuman, Xiaomi), некликабельные, ссылок нет. Кольцо намеренно чуть уменьшено и приглушено
(`.compat-ring`), чтобы не читалось как «главный» бренд среди часов. Подпись: «данные этих
трекеров могут подключаться через Apple Health или Health Connect». Заявление о совместимости,
не о партнёрстве. Владелец эту ленту на экране не видел — она в режиме `mode-all`, а кнопка
«Синхронизация устройства» открывает `mode-full`, где только вендорские карточки.

Вордмарк и логотип Oura не используются нигде. Приложение называется VIA-L.

**Число вендорских карточек — сверено 2026-09-01 по скриншотам владельца.** В `mode-full`
четыре карточки: Oura, Polar, Fitbit Air · Google Health, Withings · Health Mate — ровно как в коде
(`m-full` у четырёх). Первый скриншот показывал только верх экрана до прокрутки; расхождения нет.

⚠️ **Два замечания к экрану, не к письму:**
1. На карточке Oura стоит бейдж «РЕЖИМ ТЕСТ» (`badge_test`), хотя интеграция боевая с 26 августа —
   лимит снят, OAuth работает. В глазах Oura это выглядит как заявление, что мы не в проде.
   Снять до отправки письма или хотя бы до того, как они откроют скриншот.
2. Продуктовые фото у нас не только у Oura — Polar, Fitbit и Withings тоже показаны своими
   устройствами. Формально тот же вопрос о правах стоит и по ним. Oura спрашиваем первыми, потому
   что с ними у нас есть отношения и одобрение; остальных — по результату этого ответа.

---

## Письмо (English — это отправляем)

**To:** branduse@ouraring.com
**Subject:** Permission question — use of a product photo of the ring in our app

Hi,

I'm writing with a narrow question about product imagery. I'd rather ask than assume.

We run VIA-L, a wellness app that helps people read the numbers their wearables already
collect. Our Oura developer application was approved on 26 August (ticket #7815321), and
we take the terms seriously: we use no Oura marks or logos in our name, icon or branding,
and "Oura" appears in our interface only to identify the source of the data.

What I'm unsure about is a photograph of the ring itself. We use one product shot, in two
places, both on the screen where a member chooses where their data comes from.

The first is the connection card. A 42-pixel image of the ring sits next to the words
"Oura Ring" and a line listing what we can read — HRV, sleep, temperature, heart rate,
readiness. Tapping the card opens your own OAuth consent screen. Alongside it we show our
own data-quality label, "Best", which is our assessment of how much a device gives us to
work with, not a claim made by you. I mention it explicitly because it is a comparative
statement standing next to your name, and I would rather you heard it from me.

The second is a compatibility row inside our Apple Health card: eight small tracker photos
in a line — Apple Watch, Garmin, Samsung, Withings, Oura, Fitbit, Ultrahuman, Xiaomi — at
44 pixels, not clickable, linking nowhere, under a caption saying these trackers can
connect through Apple Health or Health Connect. The ring image there is deliberately a
little smaller and less saturated than its neighbours so that it does not read as a
featured or recommended brand.

The photo carries no wordmark and no logo, but it is your product imagery, and your
commercial-use page asks for written permission for Oura Brand Features. The API Brand
Guidelines cover the wordmark and don't address product photography, so I couldn't answer
this from the documents.

So, four questions:

1. Is this use of a product photograph acceptable as it stands?
2. Is the "Best" data-quality label acceptable next to your product name, or would you
   prefer we drop the label for Oura specifically?
3. If either is not acceptable, we will replace the photo with a neutral illustration of a
   ring bearing no resemblance to your product, and remove the label. Say the word and it
   is done in a day.
4. If it is acceptable, is there wording you would like shown alongside, or an official
   image you would prefer we use instead of ours?

I'm attaching screenshots of both screens so you can judge the context rather than take my
description for it.

Thank you for your time.

Best regards,
Ihor Datsenko
VIA-L
integration@via-l.com

---

## Перевод (для владельца — не отправляем)

**Тема:** Вопрос о разрешении — использование продуктового фото кольца в нашем приложении

Здравствуйте,

Пишу по узкому вопросу об изображении продукта. Предпочитаю спросить, а не додумывать.

Мы делаем VIA-L — велнес-приложение, которое помогает человеку прочитать те показатели, что его
носимое устройство и так собирает. Наше приложение-разработчика Oura одобрено 26 августа
(тикет #7815321), и условия мы воспринимаем всерьёз: марки и логотипы Oura не используются в
нашем названии, иконке и брендинге, а слово «Oura» стоит в интерфейсе только как обозначение
источника данных.

Не уверен я в одном — в фотографии самого кольца. Мы используем один продуктовый снимок в двух
местах, оба — на экране, где человек выбирает, откуда взять данные.

Первое — карточка подключения. Изображение кольца 42 пикселя стоит рядом со словами «Oura Ring»
и строкой о том, что мы можем прочитать: HRV, сон, температура, пульс, готовность. Нажатие
открывает ваш собственный экран согласия OAuth. Рядом мы показываем свой ярлык качества данных —
«Лучший»; это наша оценка того, сколько устройство даёт нам материала, а не ваше заявление.
Упоминаю об этом прямо, потому что это сравнительное утверждение рядом с вашим именем, и лучше
вы услышите о нём от меня.

Второе — лента совместимости внутри нашей карточки Apple Health: восемь небольших фото трекеров в
ряд — Apple Watch, Garmin, Samsung, Withings, Oura, Fitbit, Ultrahuman, Xiaomi — по 44 пикселя,
некликабельные, никуда не ведут, под подписью о том, что эти трекеры могут подключаться через
Apple Health или Health Connect. Изображение кольца там намеренно чуть меньше и приглушённее
соседних, чтобы не читаться как выделенный или рекомендуемый бренд.

На фото нет ни вордмарка, ни логотипа, но это ваш продуктовый материал, а страница коммерческого
использования требует письменного разрешения на Oura Brand Features. Брендбук для API описывает
вордмарк и ничего не говорит о продуктовой фотографии, поэтому из документов ответа я не получил.

Отсюда четыре вопроса:

1. Приемлемо ли такое использование продуктового фото в нынешнем виде?
2. Приемлем ли ярлык качества данных «Лучший» рядом с названием вашего продукта, или вы
   предпочли бы, чтобы для Oura мы его сняли?
3. Если что-то из этого неприемлемо — мы заменим фото нейтральной иллюстрацией кольца, не
   имеющей сходства с вашим продуктом, и снимем ярлык. Одного слова достаточно, сделаем за день.
4. Если приемлемо — нужна ли рядом какая-то формулировка, или есть официальное изображение,
   которое вы предпочли бы вместо нашего?

Прикладываю скриншоты обоих экранов, чтобы вы судили по контексту, а не верили описанию на слово.

Спасибо за время.

С уважением,
Ihor Datsenko
VIA-L
integration@via-l.com

---

## Перед отправкой

1. Снять бейдж «РЕЖИМ ТЕСТ» с карточки Oura (см. ⚠️ выше) — иначе скриншот противоречит письму.
2. Приложить два скриншота: экран подключения (`mode-full`, с прокруткой — чтобы были видны все
   четыре карточки) и лента совместимости внутри карточки Apple Health (`mode-all`).
3. Решить подпись: вся переписка с Oura шла от Ihor Datsenko. Если подписывать Кириллом как
   ответственным лицом — заменить в обоих экземплярах.

## После отправки

- Ответ вклеить сюда с датой и номером тикета.
- Если попросят убрать фото — правка в четырёх местах: `interpreter-via-l.html:2211` и `:2260`,
  те же строки в `interpreter-via-l-expert.html`, плюс удалить оба файла-дубля из `images-in/`.
- Если попросят снять ярлык — `badge_best` у карточки Oura в обоих файлах.
- Если разрешат с условием (обязательная подпись рядом) — правка идёт в ключ `compat_note`
  на 12 языках, а не отдельной строкой под фото.
