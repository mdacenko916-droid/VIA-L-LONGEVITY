/* VIA·L — «Вдвоём» (2026-10-15, docs/НОВЫЕ-ИДЕИ.md §1).
   Двое (муж/жена, подруга, мама, дочь) идут каждый своим «Фокусом недели» и видят у друг друга ТОЛЬКО имя,
   шаг недели и отметки «получилось/нет» за 7 дней. Данные о здоровье не уходят. Подписка у каждого своя.
   Воркер: /duo/invite · /duo/join · /duo/push · /duo/peer · /duo/leave (POST JSON {id,…}).
   id — случайный секрет этого устройства (vialp_duo_id); партнёр его не узнаёт.
   Рисует блок #rd-duo под #rd-focus; зовётся из renderFocusUI и после отметки дня (_expMark). */
(function () {
  var K_ID = 'vialp_duo_id', K_ST = 'vialp_duo', K_PUSH = 'vialp_duo_push';
  var APPSTORE = 'https://apps.apple.com/app/via-l-midlife-explained/id6807062006';
  var PLAY = 'https://play.google.com/store/apps/details?id=com.viael.vial';
  var peerCache = null, peerTs = 0, uiMode = '', lastCheck = 0;

  var S = {
    ru:{t:'Вдвоём',intro:'Идите шагом недели вместе с близким человеком — мужем, подругой, мамой, дочерью. Вы будете видеть шаг и отметки друг друга. Данные о здоровье не видны.',inv:'Пригласить',join:'У меня есть код',name:'Как вас подписать для партнёра?',code:'Ваш код: {c}. Он действует 7 дней — отправьте его.',send:'Отправить приглашение',copied:'Приглашение скопировано',enter:'Введите код из приглашения',ok:'Готово',bad:'Код не подошёл или уже использован',with:'Вы и {n}',choosing:'{n} пока выбирает шаг недели',day:'день {d} из 7',leave:'Выйти из пары',leaveQ:'Выйти из пары? {n} перестанет видеть ваш шаг.',note:'Видны только шаг недели и отметки. Данные о здоровье — нет.',cancel:'Отмена',msg:'Давай вместе: в VIA-L каждую неделю один шаг, а через 7 дней видно, помогло ли. Мой код для пары: {c}',partner:'партнёр',sp:'Показать специалисту, что мы вдвоём',spHint:'Специалист и так видит каждого из вас отдельно. Если включите оба и вы у одного специалиста — он увидит, что вы пара, и сможет смотреть ваши карточки рядом. Друг другу ваши данные по-прежнему не видны.',spBoth:'Специалист видит вас вместе',spWait:'{n}: ещё не включено'},
    uk:{t:'Удвох',intro:'Ідіть кроком тижня разом із близькою людиною — чоловіком, подругою, мамою, донькою. Ви бачитимете крок і позначки одне одного. Дані про здоровʼя не видно.',inv:'Запросити',join:'У мене є код',name:'Як вас підписати для партнера?',code:'Ваш код: {c}. Він діє 7 днів — надішліть його.',send:'Надіслати запрошення',copied:'Запрошення скопійовано',enter:'Введіть код із запрошення',ok:'Готово',bad:'Код не підійшов або вже використаний',with:'Ви і {n}',choosing:'{n} поки обирає крок тижня',day:'день {d} із 7',leave:'Вийти з пари',leaveQ:'Вийти з пари? {n} більше не бачитиме ваш крок.',note:'Видно лише крок тижня й позначки. Дані про здоровʼя — ні.',cancel:'Скасувати',msg:'Давай разом: у VIA-L щотижня один крок, а через 7 днів видно, чи допомогло. Мій код для пари: {c}',partner:'партнер',sp:'Показати спеціалісту, що ми удвох',spHint:'Спеціаліст і так бачить кожного з вас окремо. Якщо увімкнете обоє і ви в одного спеціаліста — він побачить, що ви пара, і зможе дивитися ваші картки поруч. Одне одному ваші дані й далі не видно.',spBoth:'Спеціаліст бачить вас разом',spWait:'{n}: ще не увімкнено'},
    en:{t:'Together',intro:'Take your weekly step together with someone close — your partner, a friend, your mother or daughter. You will see each other’s step and check-ins. No health data is shared.',inv:'Invite',join:'I have a code',name:'What name should your partner see?',code:'Your code: {c}. It works for 7 days — send it.',send:'Send invitation',copied:'Invitation copied',enter:'Enter the code from the invitation',ok:'Done',bad:'The code didn’t work or was already used',with:'Together with {n}',choosing:'{n} is choosing a weekly step',day:'day {d} of 7',leave:'Leave the pair',leaveQ:'Leave the pair? {n} will no longer see your step.',note:'Only the weekly step and check-ins are shared. No health data.',cancel:'Cancel',msg:'Let’s do it together: VIA-L gives one step a week, and after 7 days you see if it helped. My pair code: {c}',partner:'partner',sp:'Show my specialist we are a pair',spHint:'Your specialist already sees each of you separately. If you both turn this on and share the same specialist, they will see you are a pair and can view your cards side by side. You still cannot see each other’s data.',spBoth:'Your specialist sees you together',spWait:'{n}: not turned on yet'},
    es:{t:'En compañía',intro:'Da tu paso de la semana junto a alguien cercano: tu pareja, una amiga, tu madre o tu hija. Veréis el paso y las marcas de la otra persona. No se comparten datos de salud.',inv:'Invitar',join:'Tengo un código',name:'¿Con qué nombre te verá la otra persona?',code:'Tu código: {c}. Vale 7 días: envíalo.',send:'Enviar invitación',copied:'Invitación copiada',enter:'Escribe el código de la invitación',ok:'Listo',bad:'El código no sirve o ya se usó',with:'Con {n}',choosing:'{n} está eligiendo su paso de la semana',day:'día {d} de 7',leave:'Salir de la pareja',leaveQ:'¿Salir? {n} dejará de ver tu paso.',note:'Solo se comparten el paso de la semana y las marcas. Nada de salud.',cancel:'Cancelar',msg:'Hagámoslo juntas: VIA-L propone un paso por semana y a los 7 días ves si ayudó. Mi código: {c}',partner:'pareja',sp:'Mostrar a mi especialista que vamos juntas',spHint:'Tu especialista ya ve a cada una por separado. Si las dos lo activáis y tenéis la misma especialista, verá que sois pareja y podrá ver vuestras fichas lado a lado. Entre vosotras seguís sin ver vuestros datos.',spBoth:'Tu especialista os ve juntas',spWait:'{n}: aún sin activar'},
    de:{t:'Zu zweit',intro:'Geh deinen Wochenschritt gemeinsam mit einem nahen Menschen – Partner, Freundin, Mutter oder Tochter. Ihr seht Schritt und Häkchen des anderen. Gesundheitsdaten bleiben privat.',inv:'Einladen',join:'Ich habe einen Code',name:'Unter welchem Namen soll dich die andere Person sehen?',code:'Dein Code: {c}. Er gilt 7 Tage – schick ihn ab.',send:'Einladung senden',copied:'Einladung kopiert',enter:'Code aus der Einladung eingeben',ok:'Fertig',bad:'Der Code passt nicht oder wurde schon benutzt',with:'Zu zweit mit {n}',choosing:'{n} wählt gerade einen Wochenschritt',day:'Tag {d} von 7',leave:'Paar verlassen',leaveQ:'Paar verlassen? {n} sieht deinen Schritt dann nicht mehr.',note:'Geteilt werden nur Wochenschritt und Häkchen. Keine Gesundheitsdaten.',cancel:'Abbrechen',msg:'Lass es uns zusammen machen: VIA-L gibt einen Schritt pro Woche, nach 7 Tagen siehst du, ob er geholfen hat. Mein Code: {c}',partner:'Partner',sp:'Meiner Fachperson zeigen, dass wir zu zweit sind',spHint:'Deine Fachperson sieht euch beide schon einzeln. Wenn ihr beide das einschaltet und dieselbe Fachperson habt, sieht sie, dass ihr ein Paar seid, und kann eure Karten nebeneinander ansehen. Gegenseitig seht ihr eure Daten weiterhin nicht.',spBoth:'Deine Fachperson sieht euch zusammen',spWait:'{n}: noch nicht eingeschaltet'},
    pt:{t:'A dois',intro:'Faça o passo da semana junto com alguém próximo — parceiro, amiga, mãe ou filha. Vocês veem o passo e as marcações uma da outra. Dados de saúde não são compartilhados.',inv:'Convidar',join:'Tenho um código',name:'Com que nome a outra pessoa vai te ver?',code:'Seu código: {c}. Vale por 7 dias — envie.',send:'Enviar convite',copied:'Convite copiado',enter:'Digite o código do convite',ok:'Pronto',bad:'O código não serviu ou já foi usado',with:'A dois com {n}',choosing:'{n} está escolhendo o passo da semana',day:'dia {d} de 7',leave:'Sair da dupla',leaveQ:'Sair da dupla? {n} deixará de ver o seu passo.',note:'Só o passo da semana e as marcações são vistos. Nada de saúde.',cancel:'Cancelar',msg:'Vamos juntas: o VIA-L dá um passo por semana e em 7 dias você vê se ajudou. Meu código: {c}',partner:'parceira',sp:'Mostrar ao especialista que somos uma dupla',spHint:'O especialista já vê cada um de vocês separadamente. Se os dois ativarem e tiverem o mesmo especialista, ele verá que são uma dupla e poderá ver as fichas lado a lado. Um não vê os dados do outro.',spBoth:'O especialista vê vocês juntos',spWait:'{n}: ainda não ativou'},
    fr:{t:'À deux',intro:'Faites votre étape de la semaine avec une personne proche — partenaire, amie, mère ou fille. Vous verrez l’étape et les coches de l’autre. Aucune donnée de santé n’est partagée.',inv:'Inviter',join:'J’ai un code',name:'Sous quel nom l’autre personne vous verra-t-elle ?',code:'Votre code : {c}. Valable 7 jours — envoyez-le.',send:'Envoyer l’invitation',copied:'Invitation copiée',enter:'Saisissez le code de l’invitation',ok:'C’est fait',bad:'Le code ne fonctionne pas ou a déjà servi',with:'À deux avec {n}',choosing:'{n} choisit son étape de la semaine',day:'jour {d} sur 7',leave:'Quitter le duo',leaveQ:'Quitter le duo ? {n} ne verra plus votre étape.',note:'Seules l’étape de la semaine et les coches sont partagées. Aucune donnée de santé.',cancel:'Annuler',msg:'Faisons-le ensemble : VIA-L propose une étape par semaine, et au bout de 7 jours on voit si ça aide. Mon code : {c}',partner:'partenaire',sp:'Montrer à mon spécialiste que nous sommes à deux',spHint:'Votre spécialiste voit déjà chacun de vous séparément. Si vous l’activez tous les deux et avez le même spécialiste, il verra que vous êtes un duo et pourra consulter vos fiches côte à côte. Vous ne voyez toujours pas les données l’un de l’autre.',spBoth:'Votre spécialiste vous voit ensemble',spWait:'{n} : pas encore activé'},
    pl:{t:'We dwoje',intro:'Idź krokiem tygodnia razem z bliską osobą — partnerem, przyjaciółką, mamą lub córką. Zobaczycie nawzajem swój krok i odhaczenia. Dane o zdrowiu nie są udostępniane.',inv:'Zaproś',join:'Mam kod',name:'Pod jakim imieniem zobaczy cię druga osoba?',code:'Twój kod: {c}. Działa 7 dni — wyślij go.',send:'Wyślij zaproszenie',copied:'Zaproszenie skopiowane',enter:'Wpisz kod z zaproszenia',ok:'Gotowe',bad:'Kod nie pasuje lub został już użyty',with:'Ty i {n}',choosing:'{n} wybiera krok tygodnia',day:'dzień {d} z 7',leave:'Wyjdź z pary',leaveQ:'Wyjść z pary? {n} przestanie widzieć twój krok.',note:'Widać tylko krok tygodnia i odhaczenia. Żadnych danych o zdrowiu.',cancel:'Anuluj',msg:'Zróbmy to razem: VIA-L daje jeden krok w tygodniu, a po 7 dniach widać, czy pomógł. Mój kod: {c}',partner:'partner',sp:'Pokaż specjaliście, że jesteśmy parą',spHint:'Specjalista i tak widzi każde z was osobno. Jeśli oboje to włączycie i macie tego samego specjalistę, zobaczy, że jesteście parą, i będzie mógł oglądać wasze karty obok siebie. Nadal nie widzicie nawzajem swoich danych.',spBoth:'Specjalista widzi was razem',spWait:'{n}: jeszcze nie włączono'},
    it:{t:'In due',intro:'Fai il passo della settimana insieme a una persona cara — partner, amica, madre o figlia. Vedrete il passo e le spunte dell’altra persona. Nessun dato di salute viene condiviso.',inv:'Invita',join:'Ho un codice',name:'Con che nome ti vedrà l’altra persona?',code:'Il tuo codice: {c}. Vale 7 giorni — invialo.',send:'Invia l’invito',copied:'Invito copiato',enter:'Inserisci il codice dell’invito',ok:'Fatto',bad:'Il codice non va o è già stato usato',with:'In due con {n}',choosing:'{n} sta scegliendo il passo della settimana',day:'giorno {d} di 7',leave:'Esci dalla coppia',leaveQ:'Uscire? {n} non vedrà più il tuo passo.',note:'Si vedono solo il passo della settimana e le spunte. Nessun dato di salute.',cancel:'Annulla',msg:'Facciamolo insieme: VIA-L propone un passo a settimana e dopo 7 giorni vedi se ha aiutato. Il mio codice: {c}',partner:'partner',sp:'Mostra allo specialista che siamo in due',spHint:'Lo specialista vede già ciascuno di voi separatamente. Se lo attivate entrambi e avete lo stesso specialista, vedrà che siete una coppia e potrà guardare le vostre schede affiancate. Tra voi i dati restano non visibili.',spBoth:'Lo specialista vi vede insieme',spWait:'{n}: non ancora attivato'},
    he:{t:'ביחד',intro:'לכו את צעד השבוע יחד עם אדם קרוב — בן/בת זוג, חברה, אמא או בת. תראו זה את הצעד והסימונים של זה. נתוני בריאות לא משותפים.',inv:'להזמין',join:'יש לי קוד',name:'באיזה שם יראו אותך?',code:'הקוד שלך: {c}. תקף 7 ימים — שלחו אותו.',send:'לשלוח הזמנה',copied:'ההזמנה הועתקה',enter:'הקלידו את הקוד מההזמנה',ok:'מוכן',bad:'הקוד לא מתאים או שכבר נוצל',with:'ביחד עם {n}',choosing:'{n} בוחר/ת צעד שבועי',day:'יום {d} מתוך 7',leave:'לצאת מהזוג',leaveQ:'לצאת מהזוג? {n} לא יראה/תראה יותר את הצעד שלך.',note:'משותפים רק צעד השבוע והסימונים. בלי נתוני בריאות.',cancel:'ביטול',msg:'בואו נעשה את זה יחד: VIA-L נותן צעד אחד בשבוע, ואחרי 7 ימים רואים אם עזר. הקוד שלי: {c}',partner:'שותף/ה',sp:'להראות למומחה שאנחנו ביחד',spHint:'המומחה כבר רואה כל אחד מכם בנפרד. אם שניכם תפעילו ואתם אצל אותו מומחה — הוא יראה שאתם זוג ויוכל לצפות בכרטיסים שלכם זה לצד זה. זה לא רואה את הנתונים של זה.',spBoth:'המומחה רואה אתכם יחד',spWait:'{n}: עדיין לא הופעל'},
    ja:{t:'ふたりで',intro:'身近な人（パートナー、友だち、母、娘）と一緒に今週の一歩に取り組みましょう。お互いの一歩とチェックだけが見えます。健康データは共有されません。',inv:'招待する',join:'コードを持っている',name:'相手に表示する名前は？',code:'あなたのコード：{c}。7日間有効です。送ってください。',send:'招待を送る',copied:'招待をコピーしました',enter:'招待のコードを入力',ok:'完了',bad:'コードが合わないか、使用済みです',with:'{n}さんとふたりで',choosing:'{n}さんは今週の一歩を選んでいます',day:'7日中{d}日目',leave:'ペアを解除',leaveQ:'ペアを解除しますか？{n}さんにあなたの一歩が見えなくなります。',note:'共有されるのは今週の一歩とチェックだけ。健康データは共有されません。',cancel:'キャンセル',msg:'一緒にやろう：VIA-Lは週にひとつの一歩、7日後に効果があったかわかる。ペアのコード：{c}',partner:'パートナー',sp:'専門家にふたりであることを知らせる',spHint:'専門家はすでにおふたりを別々に見ています。ふたりともオンにし、同じ専門家であれば、ペアであることがわかり、カードを並べて見られます。お互いのデータは引き続き見えません。',spBoth:'専門家はおふたりを一緒に見ています',spWait:'{n}さん：まだオンになっていません'},
    ko:{t:'함께',intro:'가까운 사람(배우자, 친구, 엄마, 딸)과 함께 이번 주 한 걸음을 해 보세요. 서로의 한 걸음과 체크만 보입니다. 건강 데이터는 공유되지 않습니다.',inv:'초대하기',join:'코드가 있어요',name:'상대에게 보일 이름은?',code:'내 코드: {c}. 7일간 유효해요 — 보내 주세요.',send:'초대 보내기',copied:'초대가 복사되었습니다',enter:'초대 코드 입력',ok:'완료',bad:'코드가 맞지 않거나 이미 사용되었습니다',with:'{n} 님과 함께',choosing:'{n} 님이 이번 주 한 걸음을 고르는 중',day:'7일 중 {d}일째',leave:'짝 해제',leaveQ:'짝을 해제할까요? {n} 님이 더 이상 내 한 걸음을 보지 못합니다.',note:'이번 주 한 걸음과 체크만 공유됩니다. 건강 데이터는 공유되지 않습니다.',cancel:'취소',msg:'함께해요: VIA-L은 매주 한 걸음, 7일 뒤 도움이 됐는지 보여 줘요. 짝 코드: {c}',partner:'짝',sp:'전문가에게 우리가 짝이라고 알리기',spHint:'전문가는 이미 두 분을 각각 보고 있습니다. 두 분 모두 켜고 같은 전문가라면, 짝임을 알고 카드를 나란히 볼 수 있습니다. 서로의 데이터는 여전히 보이지 않습니다.',spBoth:'전문가가 두 분을 함께 봅니다',spWait:'{n} 님: 아직 켜지 않음'}
  };
  function L() { var l = (typeof lang !== 'undefined' && lang) || 'en'; return S[l] || S.en; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
  function W() { return (typeof AI_WORKER !== 'undefined' && AI_WORKER) || ''; }
  function myId() {
    var id = null; try { id = localStorage.getItem(K_ID); } catch (e) {}
    if (!id) {
      var b = new Uint8Array(18); crypto.getRandomValues(b);
      id = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      try { localStorage.setItem(K_ID, id); } catch (e) {}
    }
    return id;
  }
  function st() { try { return JSON.parse(localStorage.getItem(K_ST) || '{}') || {}; } catch (e) { return {}; } }
  function stSet(o) { try { localStorage.setItem(K_ST, JSON.stringify(o)); } catch (e) {} }
  async function call(op, body) {
    var r = await fetch(W() + '/duo/' + op, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(Object.assign({ id: myId() }, body || {})) });
    return r.json();
  }

  // Своё состояние фокуса: ключ шага, день недели фокуса, 7 отметок — из тех же записей, что и сам блок.
  function myFocus() {
    try {
      var e = (typeof _expGet === 'function') ? _expGet() : null; if (!e || !e.lever) return { lever:null, day:0, marks:[] };
      var daily = JSON.parse(localStorage.getItem('vialp_daily') || '[]') || [], DAY = 86400000, marks = [], day = 0;
      for (var i = 0; i < 7; i++) {
        var dk = _dayKey(new Date(e.startTs + i * DAY)); var rec = daily.filter(function (x) { return x.day === dk; })[0];
        marks.push((rec && rec.exp_done) || '');
        if (dk <= _dayKey()) day = i + 1;
      }
      return { lever:e.lever, day:day, marks:marks };
    } catch (x) { return { lever:null, day:0, marks:[] }; }
  }
  function specCode() { try { var l = JSON.parse(localStorage.getItem('vial_spec_link') || 'null'); return (l && l.code && !l.closed) ? String(l.code) : ''; } catch (e) { return ''; } }
  async function push(force) {
    var s = st(); if (!s.paired) return;
    var f = myFocus(), sc = specCode(); f.spec_code = sc; f.spec_share = !!(s.specShare && sc);
    var sig = JSON.stringify(f), last = null;
    try { last = JSON.parse(localStorage.getItem(K_PUSH) || 'null'); } catch (e) {}
    if (!force && last && last.sig === sig && Date.now() - last.ts < 6 * 3600000) return;
    try { var j = await call('push', f); if (j && j.ok) { s.peerShares = !!j.peer_shares; s.linked = !!j.linked; stSet(s); } localStorage.setItem(K_PUSH, JSON.stringify({ sig:sig, ts:Date.now() })); } catch (e) {}
  }
  async function loadPeer(force) {
    var s = st(); if (!s.paired) return null;
    if (!force && peerCache && Date.now() - peerTs < 10 * 60000) return peerCache;
    try {
      var j = await call('peer');
      if (j && j.ok && !j.peer) { s.paired = false; stSet(s); peerCache = null; return null; }   // партнёр вышел
      peerCache = j && j.peer; peerTs = Date.now();
    } catch (e) {}
    return peerCache;
  }

  // (i) «Как это работает» + строка «Вы» (2026-10-15, владелец: блок теряется, нужно описание).
  var I = {
    ru:{me:'Вы',info:['Каждый идёт своим шагом из «Фокуса недели» и сам отмечает дни: «Сегодня получилось» или «Не вышло».','Вы видите имя близкого человека, его шаг, день недели и 7 кружков. Он видит то же у вас.','Золотой кружок — получилось, серый — не вышло, пустой — отметки нет.','Разборы, показатели прибора, жалобы и анкета друг другу не видны. Переписки внутри пары нет.','Подписка у каждого своя. Выйти из пары можно в любой момент — связь пропадёт у обоих.','Зачем: шаг легче удержать вдвоём. Видно, что близкий человек тоже старается, — и есть повод поддержать.']},
    uk:{me:'Ви',info:['Кожен іде своїм кроком із «Фокусу тижня» і сам позначає дні: «Сьогодні вдалося» або «Не вийшло».','Ви бачите імʼя близької людини, її крок, день тижня і 7 кружечків. Вона бачить те саме у вас.','Золотий кружечок — вдалося, сірий — не вийшло, порожній — позначки немає.','Розбори, показники приладу, скарги й анкета одне одному не видні. Листування всередині пари немає.','Підписка в кожного своя. Вийти з пари можна будь-коли — звʼязок зникне в обох.','Навіщо: крок легше втримати вдвох. Видно, що близька людина теж старається, — і є привід підтримати.']},
    en:{me:'You',info:['Each of you follows your own step from “Focus of the week” and marks each day: “Done today” or “Didn’t work out”.','You see the other person’s name, their step, the day of the week and 7 dots. They see the same for you.','Gold dot — done, grey — didn’t work out, empty — no mark yet.','Analyses, device data, complaints and questionnaire answers stay private. There is no messaging inside the pair.','Each of you keeps your own subscription. You can leave the pair at any time — the link disappears for both.','Why: a step is easier to keep up together. You see the other person is trying too — and have a reason to cheer them on.']},
    es:{me:'Tú',info:['Cada una sigue su propio paso del «Foco de la semana» y marca cada día: «Hoy lo logré» o «No salió».','Ves el nombre de la otra persona, su paso, el día de la semana y 7 puntos. Ella ve lo mismo de ti.','Punto dorado: lo logró; gris: no salió; vacío: aún sin marca.','Los análisis, los datos del dispositivo, las molestias y el cuestionario no se comparten. No hay mensajes dentro de la pareja.','Cada una tiene su propia suscripción. Puedes salir de la pareja cuando quieras: el vínculo desaparece para las dos.','Para qué: un paso se mantiene mejor en compañía. Ves que la otra persona también lo intenta, y tienes un motivo para animarla.']},
    de:{me:'Du',info:['Jede Person geht ihren eigenen Schritt aus „Fokus der Woche“ und markiert jeden Tag: „Heute geschafft“ oder „Hat nicht geklappt“.','Du siehst den Namen der anderen Person, ihren Schritt, den Wochentag und 7 Punkte. Sie sieht dasselbe von dir.','Goldener Punkt – geschafft, grau – nicht geklappt, leer – noch keine Markierung.','Auswertungen, Gerätedaten, Beschwerden und Fragebogen bleiben privat. Nachrichten innerhalb des Paares gibt es nicht.','Jede Person hat ihr eigenes Abo. Du kannst das Paar jederzeit verlassen – die Verbindung verschwindet für beide.','Wozu: Zu zweit hält man einen Schritt leichter durch. Du siehst, dass sich die andere Person auch bemüht – und hast einen Grund, sie zu ermutigen.']},
    pt:{me:'Você',info:['Cada pessoa segue o próprio passo do «Foco da semana» e marca cada dia: «Hoje consegui» ou «Não deu».','Você vê o nome da outra pessoa, o passo dela, o dia da semana e 7 bolinhas. Ela vê o mesmo de você.','Bolinha dourada — conseguiu, cinza — não deu, vazia — ainda sem marcação.','Análises, dados do aparelho, queixas e questionário não são compartilhados. Não há mensagens dentro da dupla.','Cada pessoa tem a própria assinatura. Dá para sair da dupla a qualquer momento — a ligação some para as duas.','Para quê: a dois é mais fácil manter o passo. Você vê que a outra pessoa também está tentando — e tem um motivo para apoiá-la.']},
    fr:{me:'Vous',info:['Chacun suit sa propre étape du « Focus de la semaine » et coche chaque jour : « Fait aujourd’hui » ou « Pas réussi ».','Vous voyez le prénom de l’autre personne, son étape, le jour de la semaine et 7 points. Elle voit la même chose pour vous.','Point doré — réussi, gris — pas réussi, vide — pas encore coché.','Analyses, données de l’appareil, symptômes et questionnaire restent privés. Il n’y a pas de messagerie dans le duo.','Chacun garde son propre abonnement. Vous pouvez quitter le duo à tout moment — le lien disparaît pour les deux.','Pourquoi : une étape tient mieux à deux. Vous voyez que l’autre fait aussi des efforts — et vous avez une raison de l’encourager.']},
    pl:{me:'Ty',info:['Każda osoba idzie własnym krokiem z „Fokusu tygodnia” i zaznacza każdy dzień: „Dziś się udało” albo „Nie wyszło”.','Widzisz imię drugiej osoby, jej krok, dzień tygodnia i 7 kropek. Ona widzi to samo u ciebie.','Złota kropka — udało się, szara — nie wyszło, pusta — brak zaznaczenia.','Analizy, dane z urządzenia, dolegliwości i ankieta pozostają prywatne. W parze nie ma wiadomości.','Każda osoba ma własną subskrypcję. Parę można opuścić w każdej chwili — połączenie zniknie u obu.','Po co: we dwoje łatwiej utrzymać krok. Widzisz, że druga osoba też się stara — i masz powód, by ją wesprzeć.']},
    it:{me:'Tu',info:['Ognuno segue il proprio passo dal «Focus della settimana» e segna ogni giorno: «Fatto oggi» o «Non è andata».','Vedi il nome dell’altra persona, il suo passo, il giorno della settimana e 7 pallini. Lei vede lo stesso di te.','Pallino dorato — fatto, grigio — non è andata, vuoto — ancora nessun segno.','Analisi, dati del dispositivo, disturbi e questionario restano privati. Nella coppia non ci sono messaggi.','Ognuno ha il proprio abbonamento. Puoi lasciare la coppia in qualsiasi momento — il collegamento sparisce per entrambi.','Perché: in due è più facile mantenere un passo. Vedi che anche l’altra persona ci prova — e hai un motivo per incoraggiarla.']},
    he:{me:'את/ה',info:['כל אחד הולך בצעד שלו מ„מיקוד השבוע” ומסמן כל יום: „בוצע היום” או „לא הסתדר”.','אתם רואים את השם של האדם הקרוב, את הצעד שלו, את היום בשבוע ו־7 נקודות. הוא רואה אותו דבר אצלכם.','נקודה זהובה — בוצע, אפורה — לא הסתדר, ריקה — עוד אין סימון.','ניתוחים, נתוני המכשיר, תלונות והשאלון נשארים פרטיים. אין התכתבות בתוך הזוג.','לכל אחד מנוי משלו. אפשר לצאת מהזוג בכל רגע — הקשר נעלם אצל שניכם.','למה: ביחד קל יותר להחזיק בצעד. רואים שגם האדם הקרוב משתדל — ויש סיבה לעודד.']},
    ja:{me:'あなた',info:['それぞれが「今週のフォーカス」から自分の一歩を選び、毎日「今日できた」か「できなかった」を記録します。','相手の名前、一歩、今週の何日目か、7つの丸が見えます。相手にもあなたの同じ情報が見えます。','金の丸はできた、灰色はできなかった、空の丸はまだ記録なし。','分析、デバイスのデータ、不調、質問票は共有されません。ペア内のメッセージ機能はありません。','サブスクリプションはそれぞれ別です。いつでもペアを解除でき、つながりは両方から消えます。','なぜ：ふたりなら一歩を続けやすい。相手もがんばっているのが見え、応援するきっかけになります。']},
    ko:{me:'나',info:['각자 "이번 주 포커스"에서 자신의 한 걸음을 정하고 매일 "오늘 해냈어요" 또는 "못 했어요"를 표시합니다.','상대의 이름, 한 걸음, 이번 주 며칠째인지, 7개의 점이 보입니다. 상대도 나의 같은 정보를 봅니다.','금색 점은 해냄, 회색은 못 함, 빈 점은 아직 표시 없음.','분석, 기기 데이터, 불편 증상, 설문은 공유되지 않습니다. 짝 사이에 메시지 기능은 없습니다.','구독은 각자 따로입니다. 언제든 짝에서 나갈 수 있고, 연결은 둘 다에게서 사라집니다.','왜: 함께하면 한 걸음을 이어 가기 쉬워요. 상대도 노력하는 게 보이고, 응원할 이유가 생깁니다.']}
  };
  function LI() { var l = (typeof lang !== 'undefined' && lang) || 'en'; return I[l] || I.en; }
  try {
    var css = document.createElement('style');
    css.textContent = '.rd-step.open .rd-step-b #rd-duo.rd-card,#rd-duo.rd-card{background:linear-gradient(160deg,rgba(226,185,90,.13),rgba(226,185,90,.04))!important;border:1px solid rgba(226,185,90,.55)!important;border-radius:14px!important;padding:13px 16px!important;margin:10px 0!important;}'
      + '#rd-duo .duo-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}#rd-duo .duo-h .rd-card-t{margin:0;}'
      + '#rd-duo .duo-i{width:28px;height:28px;flex:0 0 28px;border-radius:50%;border:1px solid var(--gold);background:transparent;color:var(--gold-lt);font:italic 600 15px Georgia,serif;cursor:pointer;padding:0;}'
      + '#rd-duo .duo-r{margin-top:10px;}#rd-duo .duo-r+.duo-r{padding-top:10px;border-top:1px solid rgba(226,185,90,.18);}'
      + '#rd-duo .duo-n{font-size:var(--fs-cap);color:var(--gold-lt);font-weight:700;letter-spacing:.04em;}'
      + '#rd-duo .duo-s{font-size:var(--fs-body);color:var(--t1);line-height:1.45;margin-top:2px;}';
    document.head.appendChild(css);
  } catch (e) {}
  function info() {
    var T = L(), x = LI();
    var body = x.info.map(function (t, i) { return '<p style="margin:' + (i ? '10px' : '0') + ' 0 0;line-height:1.55;color:' + (i === x.info.length - 1 ? 'var(--gold-lt)' : 'var(--t1)') + ';">' + esc(t) + '</p>'; }).join('');
    if (typeof window.openSheet === 'function') window.openSheet('👥', T.t, body);
    else alert(x.info.join('\n\n'));
  }
  function row(who, lever, day, marks) {
    var tt = (lever && window.vialLevers) ? window.vialLevers.text(lever, (typeof lang !== 'undefined' && lang) || 'en') : null;
    if (!tt) return '';
    return '<div class="duo-r"><div class="duo-n">' + esc(who) + (day ? ' · <span style="color:var(--t3);font-weight:400;">' + esc(L().day.replace('{d}', day)) + '</span>' : '') + '</div>'
      + '<div class="duo-s">' + esc(tt.title) + '</div>' + dots(marks) + '</div>';
  }

  var BTN = 'padding:8px 14px;border-radius:10px;font-size:var(--fs-cap);font-family:inherit;cursor:pointer;border:1px solid rgba(226,185,90,.32);background:rgba(226,185,90,.08);color:var(--t1);';
  var BTN_ON = 'padding:8px 14px;border-radius:10px;font-size:var(--fs-cap);font-family:inherit;cursor:pointer;border:1px solid var(--gold);background:rgba(226,185,90,.2);color:#fff;font-weight:600;';
  var INP = 'width:100%;box-sizing:border-box;margin-top:6px;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:#fff;font:inherit;font-size:var(--fs-body);';
  function head() { return '<div class="duo-h"><div class="rd-card-t">👥 ' + esc(L().t) + '</div><button type="button" class="duo-i" onclick="vialDuo.info()" aria-label="i">i</button></div>'; }
  function dots(m) {
    return '<div style="display:flex;gap:6px;margin-top:8px;">' + (m || []).slice(0, 7).map(function (v) {
      var c = v === 'yes' ? 'var(--gold)' : v === 'no' ? 'rgba(255,255,255,.25)' : 'transparent';
      return '<span style="width:14px;height:14px;border-radius:50%;border:1px solid rgba(226,185,90,.5);background:' + c + ';display:inline-block;"></span>';
    }).join('') + '</div>';
  }

  async function render() {
    var box = document.getElementById('rd-duo'), fb = document.getElementById('rd-focus'); if (!box) return;
    var focusOn = fb && fb.style.display !== 'none' && fb.innerHTML;
    var s = st(), T = L(), h = head();
    if (!s.paired && s.code && Date.now() - lastCheck > 60000) { lastCheck = Date.now(); window.vialDuo.check(); }   // код отправлен — не принят ли уже
    if (!focusOn && !s.paired) { box.style.display = 'none'; box.innerHTML = ''; return; }
    if (s.paired) {
      push(false);
      var p = await loadPeer(false); s = st();
      if (s.paired) {
        var nm = (p && p.name) || s.peerName || T.partner;
        h += '<div style="font-size:var(--fs-body);color:var(--t1);font-weight:600;">' + esc(T['with'].replace('{n}', nm)) + '</div>';
        var mf = myFocus();
        h += row(LI().me, mf.lever, mf.day, mf.marks);
        if (p && p.lever && window.vialLevers) h += row(nm, p.lever, p.day, p.marks);
        else h += '<div class="duo-r"><div class="duo-n">' + esc(nm) + '</div><div style="font-size:var(--fs-cap);color:var(--t3);margin-top:2px;">' + esc(T.choosing.replace('{n}', nm)) + '</div></div>';
        if (specCode()) {
          var on = !!s.specShare, both = on && !!s.linked;
          h += '<label style="display:flex;gap:8px;align-items:flex-start;margin-top:12px;cursor:pointer;"><input type="checkbox" ' + (on ? 'checked ' : '') + 'onchange="vialDuo.spec(this.checked)" style="margin-top:3px;">'
            + '<span style="font-size:var(--fs-cap);color:var(--t1);line-height:1.5;">' + esc(T.sp) + '</span></label>'
            + '<div style="font-size:var(--fs-cap);color:var(--t3);margin-top:4px;line-height:1.5;">' + esc(T.spHint) + '</div>'
            + (on ? '<div style="font-size:var(--fs-cap);color:' + (both ? 'var(--ok)' : 'var(--t3)') + ';margin-top:4px;">' + esc(both ? T.spBoth : T.spWait.replace('{n}', nm)) + '</div>' : '');
        }
        h += '<button type="button" onclick="vialDuo.leave()" style="margin-top:6px;background:none;border:none;color:var(--t3);font:inherit;font-size:var(--fs-cap);text-decoration:underline;cursor:pointer;padding:0;margin-top:12px;">' + esc(T.leave) + '</button>';
        box.innerHTML = h; box.style.display = 'block'; return;
      }
    }
    // не в паре
    h += '<div style="font-size:var(--fs-body);color:var(--t2);line-height:1.55;">' + esc(T.intro) + '</div>';
    if (uiMode === 'invite' && s.code) {
      h += '<div style="font-size:var(--fs-body);color:var(--t1);margin-top:10px;">' + esc(T.code.replace('{c}', s.code)) + '</div>'
        + '<div style="display:flex;gap:7px;margin-top:8px;flex-wrap:wrap;"><button type="button" style="' + BTN_ON + '" onclick="vialDuo.share()">' + esc(T.send) + '</button>'
        + '<button type="button" style="' + BTN + '" onclick="vialDuo.mode(\'\')">' + esc(T.ok) + '</button></div>';
    } else if (uiMode === 'invite' || uiMode === 'join') {
      h += '<div style="font-size:var(--fs-cap);color:var(--t2);margin-top:10px;">' + esc(T.name) + '</div><input id="duo-name" maxlength="30" style="' + INP + '" value="' + esc(s.myName || '') + '">';
      if (uiMode === 'join') h += '<div style="font-size:var(--fs-cap);color:var(--t2);margin-top:8px;">' + esc(T.enter) + '</div><input id="duo-code" maxlength="6" autocapitalize="characters" style="' + INP + 'letter-spacing:3px;text-transform:uppercase;">';
      h += '<div id="duo-err" style="font-size:var(--fs-cap);color:var(--alert);margin-top:6px;display:none;"></div>'
        + '<div style="display:flex;gap:7px;margin-top:8px;"><button type="button" style="' + BTN_ON + '" onclick="vialDuo.' + (uiMode === 'join' ? 'join' : 'invite') + '()">' + esc(uiMode === 'join' ? T.join : T.inv) + '</button>'
        + '<button type="button" style="' + BTN + '" onclick="vialDuo.mode(\'\')">' + esc(T.cancel) + '</button></div>';
    } else {
      h += '<div style="display:flex;gap:7px;margin-top:10px;flex-wrap:wrap;"><button type="button" style="' + BTN_ON + '" onclick="vialDuo.mode(\'invite\')">' + esc(T.inv) + '</button>'
        + '<button type="button" style="' + BTN + '" onclick="vialDuo.mode(\'join\')">' + esc(T.join) + '</button></div>';
    }
    box.innerHTML = h; box.style.display = 'block';
  }
  function err(msg) { var e = document.getElementById('duo-err'); if (e) { e.textContent = msg; e.style.display = 'block'; } }
  function nameVal() { var n = document.getElementById('duo-name'); return n ? n.value.trim().slice(0, 30) : ''; }

  window.vialDuo = {
    render: render,
    info: info,
    push: function () { push(true); },
    spec: async function (on) { var s = st(); s.specShare = !!on; stSet(s); await push(true); peerCache = null; render(); },
    mode: function (m) { uiMode = m; render(); },
    invite: async function () {
      var s = st(), nm = nameVal(); if (!nm) { err(L().name); return; }
      try { var j = await call('invite', { name:nm }); if (!j || !j.ok) { err(L().bad); return; } s.myName = nm; s.code = j.code; stSet(s); uiMode = 'invite'; render(); }
      catch (e) { err(L().bad); }
    },
    join: async function () {
      var s = st(), nm = nameVal(), c = (document.getElementById('duo-code') || {}).value || '';
      if (!nm) { err(L().name); return; }
      try {
        var j = await call('join', { name:nm, code:c });
        if (!j || !j.ok) { err(L().bad); return; }
        s.myName = nm; s.paired = true; s.peerName = j.peerName || ''; delete s.code; stSet(s); uiMode = '';
        await push(true); peerCache = null; render();
      } catch (e) { err(L().bad); }
    },
    share: async function () {
      var s = st(), T = L(), text = T.msg.replace('{c}', s.code || '') + '\nApp Store: ' + APPSTORE + '\nGoogle Play: ' + PLAY;
      try { if (navigator.share) { await navigator.share({ text:text }); return; } } catch (e) { return; }
      try { await navigator.clipboard.writeText(text); alert(T.copied); } catch (e) { prompt('', text); }
    },
    leave: async function () {
      var s = st(), T = L(), nm = (peerCache && peerCache.name) || s.peerName || T.partner;
      if (!confirm(T.leaveQ.replace('{n}', nm))) return;
      try { await call('leave'); } catch (e) {}
      s.paired = false; delete s.peerName; delete s.code; stSet(s); peerCache = null; uiMode = ''; render();
    },
    // Пригласивший узнаёт, что код использован, при следующем открытии: спрашиваем /duo/peer, пока висит код.
    check: async function () {
      var s = st(); if (s.paired || !s.code) return;
      try { var j = await call('peer'); if (j && j.ok && j.peer) { s.paired = true; s.peerName = j.peer.name || ''; delete s.code; stSet(s); peerCache = j.peer; peerTs = Date.now(); render(); } } catch (e) {}
    }
  };
})();
