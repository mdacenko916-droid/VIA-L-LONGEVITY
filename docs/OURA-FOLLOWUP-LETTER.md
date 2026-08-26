# Письмо №2 Oura (ответ Dante) — цена от 20 колец + просьба про API

**Кому:** Dante, Oura Member Success Support — **ответом в тред тикета #7805684**
**От:** `integration@via-l.com`
**Дата черновика:** 2026-08-26
**Тема:** Re: pricing for 20+ rings — and a question about API access for existing owners

> Логика письма: сначала честный вопрос про цену от 20 штук (Dante сам назвал этот порог),
> затем — почему закупка не решает нашу задачу (клиенты по всему миру, кольца им не
> перешлёшь), и мягкий переход к API для тех, **у кого кольцо уже есть**.
> Про лимит 10 пользователей и про наше живое тестирование — говорим прямо.
> Предыдущие серии: [OURA-AFFILIATE-LETTER.md](OURA-AFFILIATE-LETTER.md) (отказ по рефералке),
> тикет #6994484 (отказ Becky по расширению >10 пользователей).

---

## EN — текст письма

Subject: Re: pricing for 20+ rings — and a question about API access for existing owners

Hi Dante,

Thank you for the clear and quick answer — knowing where the line sits is genuinely
useful, and I'd rather have a straight "not below 20" than a long silence.

Two things, then, and the second is the one I'd most appreciate your help with.

**First, the 20-ring threshold.** Could you tell me what pricing and terms look like at
20 units and above — unit price, how an order like that is placed, and whether a
business-issued discount code for our members becomes available at that volume? I'd like
to see the actual numbers before deciding whether we can commit to it.

**Second, and more important for us — the members who already own a ring.** I should be
honest about how our product works, because it changes what would actually help. VIA-L
is used in twelve languages across many countries; our members buy their own rings,
wherever they live. We are not in a position to ship hardware to people in Europe, Latin
America and Asia ourselves, so even a bulk order wouldn't reach the people who need it.
What our members ask for is different: they already wear an Oura Ring, and they want our
platform to read the data they are already generating.

Part of that already works. Our App Store application reads Oura data through Apple
Health and Health Connect, and that path is fine. But the programme where members work
together with a specialist runs as a web app outside the app stores — and there no
health-platform bridge exists. Today those members have to type their numbers in by
hand, every day. A direct Oura connection is the only thing that fixes it.

I have an Oura Ring myself and we have the OAuth connection built and working — it reads
sleep, HRV, resting heart rate and activity exactly as documented, and I've tested it
end to end. The limitation is the standard 10-user cap on a self-registered application.
That's enough to prove the integration; it isn't enough to run a product. Earlier this
year we asked about lifting it (ticket #6994484) and were told the partner programme was
closed to new partners at that time.

So my question is simply: what is the path today for an application that is built,
tested and working, to serve more than 10 Oura members? If review has reopened, we will
submit and follow whatever requirements you set. If it is still closed, and the honest
answer is that the volume purchase is what opens the door, tell me that plainly and I'll
plan around it.

If this needs to go to the partnerships or developer team rather than to you, I'd be
grateful if you could pass it along — reaching a person there is the part we haven't
managed on our own.

Thank you for the help,
Ihor Datsenko
VIA-L
integration@via-l.com
https://via-l.com

---

## RU — перевод для себя (не отправляем)

Тема: Re: цена от 20 колец — и вопрос про доступ к API для тех, у кого кольцо уже есть

Здравствуйте, Dante,

Спасибо за ясный и быстрый ответ — знать, где проходит граница, действительно полезно,
и прямое «не меньше 20» лучше долгого молчания.

Тогда два вопроса, и второй — тот, в котором ваша помощь нужнее всего.

**Первое — порог в 20 колец.** Подскажите, какие цена и условия начинаются от 20 штук:
цена за штуку, как оформляется такой заказ и появляется ли на этом объёме бизнес-код
скидки для наших пользователей? Хочу увидеть реальные цифры, прежде чем решать, можем ли
мы это потянуть.

**Второе, и для нас важнее — люди, у которых кольцо уже есть.** Честно расскажу, как
устроен наш продукт, потому что от этого зависит, что нам реально поможет. VIA-L
работает на двенадцати языках и во многих странах; наши пользователи покупают кольца
сами, где живут. Мы физически не можем рассылать устройства людям в Европе, Латинской
Америке и Азии — то есть даже оптовая закупка не дойдёт до тех, кому нужна. Просят у
нас другое: кольцо Oura у человека уже на пальце, и он хочет, чтобы наша платформа
читала те данные, которые он и так собирает.

Часть этого уже работает. Наше приложение в App Store читает данные Oura через Apple
Health и Health Connect — с этим путём всё в порядке. Но программа, где человек
занимается вместе со специалистом, живёт как веб-приложение вне сторов, и там моста
здоровья не существует. Сегодня такие пользователи вводят цифры руками, каждый день.
Починить это может только прямое подключение Oura.

У меня самого есть кольцо Oura, и подключение по OAuth у нас собрано и работает — читает
сон, HRV, пульс покоя и активность ровно как в документации, я проверил весь путь
целиком. Ограничение — стандартный лимит в 10 пользователей для самостоятельно
зарегистрированного приложения. Этого хватает, чтобы доказать интеграцию, но не хватает,
чтобы работать. В начале года мы спрашивали про снятие лимита (тикет #6994484), и нам
ответили, что программа партнёров тогда закрыта для новых участников.

Поэтому вопрос простой: какой сегодня путь у приложения, которое уже собрано, проверено
и работает, чтобы обслуживать больше 10 пользователей Oura? Если ревью снова открыто —
подадим и выполним любые ваши требования. Если по-прежнему закрыто и честный ответ в
том, что дверь открывает именно объёмная закупка — скажите прямо, и я буду планировать
исходя из этого.

Если это вопрос не к вам, а к партнёрской команде или к разработке — буду признателен,
если передадите. Дойти там до живого человека — как раз то, что нам самим не удалось.

Спасибо за помощь,
Игорь Даценко
VIA-L
integration@via-l.com
https://via-l.com
