# Ответ Ultrahuman на образец данных — 2026-09-17

Кому: Sandeep, Team Ultrahuman — ответом в тред `support@ultrahuman.com` (с `integration@via-l.com`).
Контекст: 12.09 починили 403; 16.09 мы попросили демо-данные; 17.09 прислали `response.jsonc`
(`скрин/ultrah/`). По образцу исправлен разбор (`3569e4b`), Ultrahuman открыт в приложении (`060174a`).

## EN — отправлять

Hi Sandeep,

Thank you, the sample was exactly what we needed.

We checked our integration against it and found that our field mapping was built on guesses: sleep
duration, deep sleep, temperature deviation and SpO2 were being read from the wrong places. We fixed
the mapping, and all eight metrics we use now come through correctly from your sample (HRV, resting
heart rate, total sleep, deep sleep, temperature deviation, recovery index, VO2 max, SpO2).

The Ultrahuman integration is now live in VIA-L again: on the web, in our Android app (closed testing),
and in the next iOS update.

Two quick questions to make sure we read real data correctly:
1. In the sample, the respiratory rate values are all 1.0. Is that just a placeholder in the sample,
   or can live data look like that too?
2. Does the `date` parameter refer to the day in the user's own time zone (the `latest_time_zone`
   field)? And does the sleep block for a given date describe the night that ended on that date?

Thanks again to you and to Manasa for fixing the 403 so quickly.

Best regards,
Ihor Datsenko
VIA-L — integration@via-l.com

---

## RU — перевод для себя, не отправляем

Здравствуйте, Sandeep!

Спасибо, образец — ровно то, что было нужно.

Мы сверили по нему своё подключение и увидели, что разбор полей был сделан наугад: длительность сна,
глубокий сон, отклонение температуры и SpO2 читались не из тех мест. Разбор исправили, и теперь все
восемь показателей, которые мы используем, из вашего образца доходят правильно (HRV, пульс покоя, общий
сон, глубокий сон, отклонение температуры, индекс восстановления, VO2 max, SpO2).

Подключение Ultrahuman снова включено в VIA-L: на сайте, в Android-приложении (закрытый тест) и в
ближайшем обновлении для iOS.

Два коротких вопроса, чтобы правильно читать живые данные:
1. В образце частота дыхания везде 1.0. Это просто заглушка в образце или живые данные тоже могут так
   выглядеть?
2. Параметр `date` — это день в часовом поясе самого пользователя (поле `latest_time_zone`)? И блок сна
   за дату описывает ночь, которая закончилась в эту дату?

Ещё раз спасибо вам и Manasa, что так быстро починили 403.

С уважением, Ihor Datsenko, VIA-L — integration@via-l.com
