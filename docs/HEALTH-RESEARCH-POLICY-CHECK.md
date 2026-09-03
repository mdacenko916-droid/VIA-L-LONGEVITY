# Исследование или улучшение: что дословно требуют Apple и Google

Сверка от 2026-09-03 по действующим текстам правил. Повод: исследовательский синк
«Помочь улучшить приложение» (`/research/day`, `research_days`) и вопрос, надо ли объявлять
VIA-L приложением для исследований на людях. Раньше решение принималось по памяти и по
комментарию в коде — оба раза неточно, отсюда эта выписка с цитатами.

## Apple — App Store Review Guidelines 5.1.3

**(i)** «Apps may not use or disclose to third parties data gathered in the health, fitness, and
medical research context—including from the Clinical Health Records API, HealthKit API, Motion
and Fitness, MovementDisorder APIs, or health-related human subject research—for advertising,
marketing, or other use-based data mining purposes **other than improving health management, or
for the purpose of health research, and then only with permission**. […] **You must disclose the
specific health data that you are collecting from the device.**»

**(iii)** Исследование на людях требует согласия, включающего природу, цель и длительность
исследования; процедуры, риски и пользу; сведения о конфиденциальности и обращении с данными;
контакт для вопросов; порядок отзыва.

**(iv)** «Apps conducting health-related human subject research **must secure approval from an
independent ethics review board**. Proof of such approval must be provided upon request.»

**Читается так:** у данных HealthKit две разрешённые цели помимо базовой — *улучшение управления
здоровьем* и *исследование здоровья*, обе только с разрешения пользователя. Этический комитет
требуется **только для второй**. Утверждение «у Apple нет требования об IRB» — неверно, пункт (iv)
существует; но и утверждение «улучшение у Apple читается как data mining» тоже неверно —
улучшение прямо вынесено из-под запрета.

## Google Play — категория «Human subjects research»

Определение из формы декларации медицинских приложений: «Apps that are **used and developed by
credentialed researchers and healthcare professionals** to collect data for research studies on
health-related human subjects, **that are approved by an Institutional Review Board (IRB) or
Ethics Committee (EC)**, or other equivalent entity.»

При объявлении этой категории требуются: информированное согласие того же состава, что у Apple;
одобрение независимого совета; для данных Health Connect — возможно, отдельная форма
исследования.

**Читается так:** категория определяется через **кто разрабатывает** приложение и **одобрено ли
исследование комитетом**. VIA-L не разрабатывается аккредитованными исследователями и не имеет
одобрения IRB — то есть под определение не подпадает. Поставить эту галочку было бы не
осторожностью, а недостоверной декларацией.

## Google Play — Health Connect: разрешённое и запрещённое

Разрешённые сценарии: fitness, wellness and coaching; rewards; corporate wellness; medical care;
human-subjects research; health-integrated games. **Наш сценарий — первый.**

Запрещено: передавать или продавать данные третьим лицам вроде рекламных платформ; использовать
для показа рекламы; делиться данными с третьими лицами **без явного информированного согласия**;
передавать в продукты, которые могут квалифицироваться как медицинское изделие, без
регуляторного соответствия; обращаться к данным из headless-приложений.

Отдельно действует принцип минимизации: запрашивать только те типы данных, которые нужны
заявленным пользовательским функциям, и обосновывать каждый.

**Серая зона:** прямого ответа, можно ли использовать данные Health Connect для обезличенной
внутренней статистики и калибровки, в правилах нет. Вопрос решается через минимизацию и
целевое ограничение — то есть через то, как у нас устроен синк.

## Отдельно: Google Health API User Data and Health Research Policy

Относится к Google Health API (не к Health Connect на устройстве). Требует одобрения независимого
совета, использования данных только для исходной цели исследования, деидентификации «в максимально
возможной степени» и разрешает публиковать только сводные агрегаты. Нас не касается, пока мы не
используем этот API, но полезен как образец того, как выглядит настоящий исследовательский режим.

## Сводка

| | Apple | Google |
|---|---|---|
| Личный анализ по данным HealthKit / Health Connect | разрешён с разрешения пользователя | разрешён, сценарий «fitness, wellness and coaching» |
| Улучшение управления здоровьем (наша калибровка) | прямо выведено из-под запрета на data mining, 5.1.3(i) | прямо не описано; решается минимизацией и целевым ограничением |
| Исследование на людях | разрешено, но **нужен этический комитет**, 5.1.3(iv) | разрешено, но **нужен IRB/EC**, и категория определена через аккредитованных исследователей |
| Отдельное согласие на исследовательский слой | обязательно | обязательно |
| Обезличенный набор без привязки к аккаунту | требований нет сверх общих | согласуется с минимизацией |
| Перечислить конкретные типы собираемых данных | **обязательно**, 5.1.3(i) | обязательно (декларация + «Безопасность данных») |
| Реклама, продажа, брокеры | запрещено | запрещено |

## Вывод и что из этого следует делать

1. **Исследовательской рамки не объявляем.** Ни у Apple, ни у Google она не даётся «за согласие»:
   обе площадки требуют независимый этический комитет. Издатель — физическое лицо; протокола,
   ответственного исследователя и одобрения нет. У Google мы вдобавок не подходим под само
   определение категории.
2. **Приборные метрики режем не потому, что Apple.** Запрет 5.1.3(i) на улучшение не
   распространяется — значит, блокировать данные HealthKit в выборке (как предлагалось 2026-09-02)
   оснований нет. В `WEARABLE_RESEARCH_BLOCK` остаётся только Oura, у которой запрет
   договорной, а не сторовый (см. `docs/OURA-COMPLIANCE-REVIEW.md`).
3. **Обещание публикаций и бессрочное хранение снимаем** — они и делали из калибровки
   исследование. Заменено на 24 месяца скользящего окна + бессрочные обезличенные сводки
   (`research_stats`).
4. **Перечислить типы данных поимённо** в политике приватности — это требование **обеих**
   площадок, а не только Google: Apple 5.1.3(i) «You must disclose the specific health data».
   Правка `legal-app/privacy.html` × 12 языков ждёт слова владельца.
5. **Слабое место, которое надо держать в уме:** у Google данные Health Connect должны служить
   заявленным пользовательским функциям, а калибровка пользу приносит не тому, кто данные отдал,
   а следующим. Защита — отдельное явное согласие (у Google запрет сформулирован как «без явного
   информированного согласия»), выключенное по умолчанию, минимальный набор полей и срок хранения.

## Источники

- Apple App Store Review Guidelines 5.1.3 — https://developer.apple.com/app-store/review/guidelines/
- Health app categories and additional information (Play Console Help) — https://support.google.com/googleplay/android-developer/answer/13996367
- Android Health Permissions: Guidance and FAQs — https://support.google.com/googleplay/android-developer/answer/12991134
- Publish your health app on Google Play — https://developer.android.com/health-and-fitness/health-connect/publish
- Google Health API User Data and Health Research Policy — https://developers.google.com/health/policies/health-api-user-data-and-research-policy
