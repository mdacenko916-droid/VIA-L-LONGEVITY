# Ответ Apple на Guideline 2.1 «Information Needed» — 2026-09-11

Версия 1.0 (сборка 138) получила статус Rejected с пометкой «2.1.0 Performance: App Completeness».
По сути это запрос информации, а не найденный баг. Apple просит одно и то же в двух местах:
ответ в Resolution Center и поле **App Review Information → Notes**. В поле Notes влезает около 4000
знаков, текст ниже в этот лимит укладывается.

---

## 1. Текст ответа (EN): вставить без изменений в оба места

```
Hello, and thank you for reviewing VIA-L.

1. SCREEN RECORDING
Attached. Recorded on a physical iPhone running iOS 26.5 with build 1.0 (147). It starts from app launch and shows: the wellness disclaimer and consent, the subscription screen opened from My profile → Subscription (subscription name, one-month period, price, Terms of Use and Privacy Policy links, Restore Purchases), and tapping Subscribe (the TestFlight Apple ID already holds an active test subscription, so the store shows "already subscribed" and the subscription management screen), a daily check-in entered by hand, the resulting analysis, the Apple Health permission, the AI advisor, the "My guide" screen, and deleting all health data.
VIA-L has no account registration and no login. Entries are stored on the device. The user can delete them at any time: My profile → Backup and data deletion → Delete my health data. There is no user-generated content visible to other users.

2. PURPOSE AND AUDIENCE
VIA-L is a wellness app for adults in midlife hormonal change: women from 35 (perimenopause) and men from 40 (andropause). Sleep, energy and mood start changing, and people are usually told "it's just age". The user logs how they slept, their energy level and how they felt. The app explains in plain language what appears connected and suggests one small lifestyle step, such as sleep timing, meal timing or movement. Once a week it gives a longer review. A wearable is optional. VIA-L does not diagnose, treat or prevent any condition and is not a medical device.

3. HOW TO ACCESS THE MAIN FEATURES
No login or demo account is needed.
a) Launch the app and accept the disclaimer.
b) The subscription screen opens. Subscribe with a sandbox Apple ID, or tap Restore Purchases.
c) Fill in today's check-in by hand. Apple Health is optional.
d) Tap to get the analysis. It is prepared in the background in 1–3 minutes, and the app can be left meanwhile. The analysis and the day plan appear on the Today screen.
e) The AI advisor opens from the round VIA-L button.
f) My profile → Backup and data deletion: export, restore and delete data.

4. EXTERNAL SERVICES
- Anthropic (Claude API): generates the analysis and advisor text.
- Cloudflare Workers, KV and D1: our backend relay. A prepared analysis is cached for up to 72 hours under a random device ID.
- RevenueCat: subscription status and receipt validation for Apple In-App Purchase.
- Apple HealthKit: read-only sleep, heart rate, HRV and activity data, only with the user's permission.
- Optional direct wearable connections via the vendors' own OAuth: Oura, Fitbit, Polar, Withings.
- Cal.com: optional booking of a free introductory call on the "My guide" screen.

5. REGIONAL DIFFERENCES
The app works the same in all regions. The interface is available in 12 languages, and the language follows the device setting. Only the subscription price varies, as set in App Store Connect.

6. REGULATED INDUSTRY
VIA-L is a general wellness app, not a medical service or medical device. It gives no diagnosis or treatment. The disclaimer appears before first use and on every result. The "My guide" screen lists independent specialists who use the VIA-L platform. Connecting to one is optional and needs the specialist's code and explicit consent. The user can withdraw consent on the same screen. Nothing is sold on that screen, and it has no prices and no external payment links. VIA-L does not use protected third-party material.

7. IN-APP PURCHASE
One auto-renewable subscription, "VIA-L Monthly" (via_l_pro_monthly). It lasts one month and costs EUR 29.99 (USD 34.99 in the US and Canada), and it unlocks all features. The subscription screen appears automatically after the disclaimer on first launch, and it can be opened at any time from My profile → Subscription → Plan, price and terms. Restore Purchases, Terms of Use (https://via-l.com/legal-app/terms.html) and Privacy Policy (https://via-l.com/legal-app/privacy.html) are on the same screen. Access cannot be bought outside the app.

Support: support@via-l.com

Kind regards,
Kyrylo Selivanov
```

---

## 2. Запись экрана: сценарий (снимает владелец)

Телефон «Игорь» на iOS 26.5 подходит под требование «последняя ОС». Сборку 138 ставить из
TestFlight: покупка там идёт в песочнице и деньги не списываются.

0. Перед записью удалить приложение и поставить заново из TestFlight. Так запись покажет первый
   запуск и пейволл.
1. Пункт управления → Запись экрана → запустить VIA-L с домашнего экрана.
2. Дисклеймер и согласие → принять.
3. Пейволл: задержаться на 2–3 секунды на цене. Коснуться Terms of Use, открыть, вернуться. То же
   с Privacy Policy.
4. Subscribe → подтвердить покупку в песочнице.
5. Анкета дня: ввести пару значений руками → получить разбор, пролистать.
6. Показать разрешение Apple Health (запрос доступа).
7. Нижние вкладки: памятка дня и недельный разбор.
8. Круглая кнопка VIA-L → ИИ-советник → задать один вопрос.
9. Вкладка «My guide» → показать каталог. Ничего не подключать.
10. Профиль → Backup and data deletion → Delete my health data → подтвердить оба окна.
11. Остановить запись. Файл прикрепить к ответу в Resolution Center (кнопка вложения).

Лучше записывать на английском интерфейсе: ревьюер читает по-английски.

---

## 3. Риски, которые видны по коду (решить до записи)

> **Статус 2026-09-11.** Пункт 1 исправлен: строка цены теперь «VIA-L Monthly · €29,99 / month»,
> правка едет сборкой после 140. Там же описание специалиста в «My guide» переводится на язык
> приложения (воркер уже задеплоен). Пункт 2 **сделан** (тот же день): `legal-app/privacy.html`
> на 12 языках — исключение «My guide» в §4, RevenueCat / Oura·Fitbit·Polar·Withings / Cal.com в §6,
> подраздел «My guide» (что хранится, что НЕ уходит специалисту, Telegram-уведомление о записи,
> удаление по письму), сроки в §8. Пункт 3: владелец решил **оставить** «My guide» — «будет честно».
> Хвост: `legal-app/delete-data.html` всё ещё пишет «no account… we hold no names» — не тронут.

1. **На пейволле нет названия подписки.** Показаны «VIA·L», цена со словом «/ month», Restore,
   Terms и Privacy. Apple прямо требует *title* подписки. Предложение: добавить строку
   «VIA-L Monthly» над ценой. Это правка в коде, значит нужна новая сборка.
2. **Политика конфиденциальности называет только Anthropic, Cloudflare и Apple/Google.** В ней нет
   RevenueCat, Oura/Fitbit/Polar/Withings, Cal.com и передачи данных специалисту при подключении
   (проверено `grep -c`, 0 упоминаний). В пункте 4 ответа эти сервисы перечислены, и ревьюер может
   сверить. Предложение: дописать их в `legal-app/privacy.html` на 12 языках. Это веб-страница,
   сборка не нужна.
3. **Экран «My guide» — самое спорное место для ревью.** В каталоге есть гинекологи и
   эндокринологи. При подключении на сервере создаётся карточка с email, а экран пишет «Save this
   code — it's your sign-in to the app». Это можно прочитать как создание аккаунта, и тогда Apple
   потребует удаление аккаунта. Сейчас «Withdraw consent and disconnect» отвязывает специалиста,
   но карточку на сервере не удаляет. Фолбэк-кнопка знакомства ведёт на Cal.com с личным именем
   в адресе. В сценарии записи подключение не показываем, но ревьюер может нажать сам.
