/* VIA·L — «i» на каждой вкладке: короткая подсказка «как этим пользоваться» (2026-10-10,
   docs/APP-STRUCTURE-PLAN.md §3a). Один файл на все страницы VIA-L (главная и «Специалист»), чтобы тексты ×12
   жили в одном месте, как нижняя строка в bottom-nav.js. Подпись под заголовком экрана отвечает «что здесь»,
   «i» — «как этим пользоваться». Подсказка «Сегодня» один раз открывается сама (vialHelp.once).
   API: vialHelp.button(tab) → html кнопки «i»; vialHelp.open(tab); vialHelp.once(tab) — показать при первом
   заходе; язык — localStorage 'vial_lang' (его пишут все страницы). */
(function () {
  var TX = {
    today: {
      ru: ['Как устроено «Сегодня»', 'Каждый день — короткий проход, около 3 минут. Потом по шагам:', ['Мой день — с чем вы пришли и что показали цифры', 'На что это похоже — вывод VIA-L и на чём он основан', 'Что делать сегодня — план, еда, приёмы', 'Почему у меня так — объяснения', 'Мой вечерний ритуал — вечер и сон'], 'Нажмите на шаг, чтобы раскрыть его. Что изменилось за неделю и месяц — во вкладке «Мой прогресс».'],
      uk: ['Як влаштовано «Сьогодні»', 'Щодня — короткий прохід, близько 3 хвилин. Далі — по кроках:', ['Мій день — з чим ви прийшли і що показали цифри', 'На що це схоже — висновок VIA-L і на чому він ґрунтується', 'Що робити сьогодні — план, їжа, прийоми', 'Чому в мене так — пояснення', 'Мій вечірній ритуал — вечір і сон'], 'Натисніть на крок, щоб розгорнути його. Що змінилося за тиждень і місяць — у вкладці «Мій прогрес».'],
      en: ['How “Today” works', 'Every day — a short check-in, about 3 minutes. Then step by step:', ['My day — what brought you here and what the numbers show', 'What this looks like — VIA-L’s conclusion and what it rests on', 'What to do today — the plan, meals, intake', 'Why it’s like this for me — the explanations', 'My evening ritual — evening and sleep'], 'Tap a step to open it. What changed over the week and month is in “My progress”.'],
      es: ['Cómo funciona «Hoy»', 'Cada día, un registro breve de unos 3 minutos. Después, paso a paso:', ['Mi día — lo que te trajo aquí y lo que muestran los datos', 'A qué se parece — la conclusión de VIA-L y en qué se basa', 'Qué hacer hoy — el plan, las comidas, las tomas', 'Por qué me pasa esto — las explicaciones', 'Mi ritual de la noche — la noche y el sueño'], 'Toca un paso para abrirlo. Lo que cambió en la semana y el mes está en «Mi progreso».'],
      de: ['So funktioniert „Heute“', 'Jeden Tag ein kurzer Check-in, etwa 3 Minuten. Dann Schritt für Schritt:', ['Mein Tag — womit du gekommen bist und was die Zahlen zeigen', 'Wonach es aussieht — das Fazit von VIA-L und worauf es beruht', 'Was heute zu tun ist — Plan, Mahlzeiten, Einnahmen', 'Warum es bei mir so ist — die Erklärungen', 'Mein Abendritual — Abend und Schlaf'], 'Tippe auf einen Schritt, um ihn zu öffnen. Was sich in Woche und Monat verändert hat, steht unter „Fortschritt“.'],
      pt: ['Como funciona «Hoje»', 'Todos os dias, um registro curto de uns 3 minutos. Depois, passo a passo:', ['Meu dia — o que trouxe você aqui e o que os números mostram', 'Com o que isso se parece — a conclusão da VIA-L e em que se baseia', 'O que fazer hoje — o plano, as refeições, as tomas', 'Por que comigo é assim — as explicações', 'Meu ritual da noite — noite e sono'], 'Toque num passo para abri-lo. O que mudou na semana e no mês está em «Meu progresso».'],
      fr: ['Comment fonctionne « Aujourd’hui »', 'Chaque jour, un court bilan d’environ 3 minutes. Puis, étape par étape :', ['Ma journée — ce qui vous amène et ce que montrent les chiffres', 'À quoi cela ressemble — la conclusion de VIA-L et ce sur quoi elle repose', 'Que faire aujourd’hui — le plan, les repas, les prises', 'Pourquoi c’est ainsi chez moi — les explications', 'Mon rituel du soir — le soir et le sommeil'], 'Touchez une étape pour l’ouvrir. Ce qui a changé sur la semaine et le mois est dans « Mes progrès ».'],
      pl: ['Jak działa „Dziś”', 'Codziennie krótki wpis, około 3 minut. Potem krok po kroku:', ['Mój dzień — z czym przychodzisz i co pokazują liczby', 'Na co to wygląda — wniosek VIA-L i na czym się opiera', 'Co zrobić dziś — plan, posiłki, przyjmowanie', 'Dlaczego u mnie tak jest — wyjaśnienia', 'Mój wieczorny rytuał — wieczór i sen'], 'Dotknij kroku, aby go otworzyć. Co zmieniło się w tygodniu i miesiącu — w zakładce „Moje postępy”.'],
      it: ['Come funziona «Oggi»', 'Ogni giorno un breve check-in, circa 3 minuti. Poi, passo dopo passo:', ['La mia giornata — il motivo per cui sei qui e cosa mostrano i numeri', 'A cosa somiglia — la conclusione di VIA-L e su cosa si basa', 'Cosa fare oggi — il piano, i pasti, le assunzioni', 'Perché per me è così — le spiegazioni', 'Il mio rituale serale — sera e sonno'], 'Tocca un passo per aprirlo. Cosa è cambiato in settimana e nel mese è in «Progressi».'],
      he: ['איך בנוי „היום”', 'בכל יום — מילוי קצר, כ־3 דקות. ואז שלב אחר שלב:', ['היום שלי — עם מה הגעת ומה המספרים מראים', 'למה זה דומה — המסקנה של VIA-L ועל מה היא מבוססת', 'מה לעשות היום — התוכנית, הארוחות, הנטילות', 'למה זה כך אצלי — ההסברים', 'הטקס הערבי שלי — ערב ושינה'], 'הקישו על שלב כדי לפתוח אותו. מה השתנה בשבוע ובחודש — בלשונית „ההתקדמות שלי”.'],
      ja: ['「今日」の使い方', '毎日、約3分の短い記録。そのあと順番に：', ['私の今日 — 気になっていることと数値', 'どういう状態か — VIA-Lの見立てとその根拠', '今日やること — プラン、食事、服用', 'なぜ私はこうなのか — 解説', '私の夜の習慣 — 夜と睡眠'], 'ステップをタップすると開きます。1週間・1か月の変化は「マイ進捗」で確認できます。'],
      ko: ['“오늘” 사용법', '매일 약 3분의 짧은 기록. 그다음 단계별로:', ['나의 하루 — 찾아온 이유와 숫자가 보여주는 것', '어떤 모습인지 — VIA-L의 결론과 그 근거', '오늘 할 일 — 계획, 식사, 복용', '왜 나는 이런지 — 설명', '나의 저녁 의식 — 저녁과 수면'], '단계를 누르면 열립니다. 한 주와 한 달의 변화는 “나의 발전”에서 볼 수 있어요.']
    },
    path: {
      ru: ['Как устроен «Мой прогресс»', 'Здесь видно, что изменилось. Раз в неделю вы оцениваете то, что беспокоит, — по этим оценкам VIA-L решает, закрепить шаг недели или попробовать следующий. Новый шаг появится на «Сегодня».'],
      uk: ['Як влаштовано «Мій прогрес»', 'Тут видно, що змінилося. Раз на тиждень ви оцінюєте те, що турбує, — за цими оцінками VIA-L вирішує, закріпити крок тижня чи спробувати наступний. Новий крок з’явиться на «Сьогодні».'],
      en: ['How “My progress” works', 'This is where you see what has changed. Once a week you rate what bothers you — from those ratings VIA-L decides whether to keep the week’s step or try the next one. The new step appears on “Today”.'],
      es: ['Cómo funciona «Mi progreso»', 'Aquí ves lo que ha cambiado. Una vez por semana valoras lo que te preocupa: con esas valoraciones VIA-L decide si mantener el paso de la semana o probar el siguiente. El nuevo paso aparece en «Hoy».'],
      de: ['So funktioniert „Fortschritt“', 'Hier siehst du, was sich verändert hat. Einmal pro Woche bewertest du, was dich belastet — danach entscheidet VIA-L, ob der Wochenschritt bleibt oder der nächste kommt. Der neue Schritt erscheint unter „Heute“.'],
      pt: ['Como funciona «Meu progresso»', 'Aqui você vê o que mudou. Uma vez por semana você avalia o que incomoda — com essas notas a VIA-L decide se mantém o passo da semana ou tenta o próximo. O novo passo aparece em «Hoje».'],
      fr: ['Comment fonctionne « Mes progrès »', 'Ici, vous voyez ce qui a changé. Une fois par semaine, vous notez ce qui vous gêne — à partir de ces notes, VIA-L décide de garder l’étape de la semaine ou d’essayer la suivante. La nouvelle étape apparaît dans « Aujourd’hui ».'],
      pl: ['Jak działają „Moje postępy”', 'Tu widać, co się zmieniło. Raz w tygodniu oceniasz to, co cię niepokoi — na tej podstawie VIA-L decyduje, czy zostawić krok tygodnia, czy spróbować kolejnego. Nowy krok pojawi się w „Dziś”.'],
      it: ['Come funziona «Progressi»', 'Qui vedi cosa è cambiato. Una volta alla settimana valuti ciò che ti preoccupa: da queste valutazioni VIA-L decide se mantenere il passo della settimana o provare il successivo. Il nuovo passo compare in «Oggi».'],
      he: ['איך בנויה „ההתקדמות שלי”', 'כאן רואים מה השתנה. פעם בשבוע מדרגים את מה שמטריד — לפי הדירוגים VIA-L מחליטה אם לשמור על צעד השבוע או לנסות את הבא. הצעד החדש יופיע ב„היום”.'],
      ja: ['「マイ進捗」の使い方', 'ここで変化を確認できます。週に1回、気になっていることを評価すると、その結果をもとにVIA-Lが今週のステップを続けるか次に進むかを決めます。新しいステップは「今日」に表示されます。'],
      ko: ['“나의 발전” 사용법', '여기서 무엇이 달라졌는지 볼 수 있어요. 일주일에 한 번 신경 쓰이는 것을 평가하면, VIA-L이 그 점수로 이번 주 단계를 유지할지 다음 단계로 갈지 정합니다. 새 단계는 “오늘”에 나타나요.']
    },
    guide: {
      ru: ['Как устроен «Специалист»', 'Когда нужен живой человек: закажите письменный разбор у специалиста из витрины или подключитесь по коду, если уже у него ведётесь.'],
      uk: ['Як влаштовано «Фахівець»', 'Коли потрібна жива людина: замовте письмовий розбір у фахівця з вітрини або підключіться за кодом, якщо вже в нього ведетеся.'],
      en: ['How “Specialist” works', 'When you need a real person: order a written review from a specialist in the showcase, or connect with their code if you already work with them.'],
      es: ['Cómo funciona «Especialista»', 'Cuando necesitas a una persona: pide un análisis por escrito a un especialista del escaparate o conéctate con su código si ya trabajas con él.'],
      de: ['So funktioniert „Spezialist“', 'Wenn du einen Menschen brauchst: Bestelle eine schriftliche Auswertung bei einer Fachperson aus der Auswahl oder verbinde dich per Code, wenn du schon begleitet wirst.'],
      pt: ['Como funciona «Especialista»', 'Quando você precisa de uma pessoa: peça uma análise por escrito a um especialista da vitrine ou conecte-se com o código, se já acompanha com ele.'],
      fr: ['Comment fonctionne « Spécialiste »', 'Quand il vous faut une personne : commandez une analyse écrite à un spécialiste de la vitrine, ou connectez-vous avec son code si vous êtes déjà suivi(e).'],
      pl: ['Jak działa „Specjalista”', 'Gdy potrzebny jest człowiek: zamów pisemną analizę u specjalisty z witryny albo połącz się jego kodem, jeśli już z nim współpracujesz.'],
      it: ['Come funziona «Specialista»', 'Quando serve una persona: richiedi un’analisi scritta a uno specialista della vetrina, oppure collegati con il suo codice se sei già seguito.'],
      he: ['איך בנוי „מומחה”', 'כשצריך אדם: הזמינו ניתוח כתוב ממומחה בחלון הראווה, או התחברו עם הקוד שלו אם כבר מלווים אצלו.'],
      ja: ['「専門家」の使い方', '人の助けが必要なときに：一覧の専門家に書面の分析を依頼するか、すでに指導を受けている場合はコードで接続します。'],
      ko: ['“전문가” 사용법', '사람의 도움이 필요할 때: 목록의 전문가에게 서면 분석을 요청하거나, 이미 함께하고 있다면 코드로 연결하세요.']
    },
    card: {
      ru: ['Как устроен «Профиль»', 'Ваши данные и настройки. Вес, талию и приёмы приложение раз в неделю попросит проверить само — по ним подбираются рекомендации.'],
      uk: ['Як влаштовано «Профіль»', 'Ваші дані та налаштування. Вагу, талію і прийоми застосунок раз на тиждень попросить перевірити сам — за ними добираються рекомендації.'],
      en: ['How “Profile” works', 'Your data and settings. Once a week the app will ask you to check your weight, waist and intake schedule — recommendations are based on them.'],
      es: ['Cómo funciona «Perfil»', 'Tus datos y ajustes. Una vez por semana la app te pedirá revisar peso, cintura y tomas: las recomendaciones se basan en ellos.'],
      de: ['So funktioniert „Profil“', 'Deine Daten und Einstellungen. Einmal pro Woche bittet dich die App, Gewicht, Taille und Einnahmen zu prüfen — danach richten sich die Empfehlungen.'],
      pt: ['Como funciona «Perfil»', 'Seus dados e configurações. Uma vez por semana o app vai pedir para conferir peso, cintura e tomas — as recomendações se baseiam neles.'],
      fr: ['Comment fonctionne « Profil »', 'Vos données et réglages. Une fois par semaine, l’app vous demandera de vérifier poids, tour de taille et prises — les recommandations s’appuient dessus.'],
      pl: ['Jak działa „Profil”', 'Twoje dane i ustawienia. Raz w tygodniu aplikacja poprosi o sprawdzenie wagi, talii i przyjmowania — na ich podstawie dobierane są zalecenia.'],
      it: ['Come funziona «Profilo»', 'I tuoi dati e le impostazioni. Una volta alla settimana l’app ti chiederà di controllare peso, girovita e assunzioni: le raccomandazioni si basano su questi.'],
      he: ['איך בנוי „פרופיל”', 'הנתונים וההגדרות שלך. פעם בשבוע האפליקציה תבקש לבדוק משקל, מותניים ונטילות — לפיהם נבחרות ההמלצות.'],
      ja: ['「プロフィール」の使い方', 'あなたのデータと設定です。週に1回、体重・ウエスト・服用の確認をアプリがお願いします。おすすめはそれをもとに選ばれます。'],
      ko: ['“프로필” 사용법', '내 데이터와 설정이에요. 일주일에 한 번 앱이 체중, 허리둘레, 복용을 확인해 달라고 요청하고, 이를 바탕으로 추천이 정해집니다.']
    }
  };
  var OK = { ru: 'Понятно', uk: 'Зрозуміло', en: 'Got it', es: 'Entendido', de: 'Verstanden', pt: 'Entendi', fr: 'Compris', pl: 'Rozumiem', it: 'Capito', he: 'הבנתי', ja: 'わかりました', ko: '알겠어요' };

  function lang() { try { return localStorage.getItem('vial_lang') || 'en'; } catch (e) { return 'en'; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function css() {
    if (document.getElementById('vhCss')) return;
    var st = document.createElement('style'); st.id = 'vhCss';
    st.textContent = '.vh-i{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;border:1px solid rgba(138,106,31,.6);background:none;color:#8A6A1F;font:italic 600 15px Georgia,serif;cursor:pointer;flex-shrink:0;vertical-align:middle;margin-inline-start:8px;}'
      + '.vh-ov{position:fixed;inset:0;z-index:9000;background:rgba(5,7,10,.62);display:flex;align-items:flex-end;justify-content:center;}'
      + '.vh-sh{width:100%;max-width:520px;background:#1A1F2B;color:#fff;border-radius:24px 24px 0 0;border-top:1px solid rgba(226,185,90,.3);padding:12px 20px calc(22px + env(safe-area-inset-bottom,0px));font-family:inherit;box-sizing:border-box;}'
      + '.vh-gr{width:44px;height:5px;border-radius:3px;background:rgba(255,255,255,.25);margin:0 auto 14px;}'
      + '.vh-t{font-family:"Playfair Display",serif;font-size:22px;margin:0 0 8px;}'
      + '.vh-p{font-size:15px;line-height:1.6;color:rgba(255,255,255,.9);margin:0 0 10px;}'
      + '.vh-st{display:flex;gap:12px;align-items:flex-start;padding:8px 0;border-top:1px solid rgba(255,255,255,.07);font-size:15px;line-height:1.45;}'
      + '.vh-n{width:26px;height:26px;border-radius:50%;border:1px solid rgba(238,175,84,.6);color:#EEAF54;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}'
      + '.vh-ok{width:100%;min-height:50px;margin-top:14px;border-radius:14px;border:1px solid rgba(238,175,84,.7);background:rgba(238,175,84,.2);color:#fff;font-weight:500;font-size:16px;font-family:inherit;cursor:pointer;}';
    document.head.appendChild(st);
  }
  function open(tab) {
    css();
    var l = lang(), d = (TX[tab] || {})[l] || (TX[tab] || {}).en; if (!d) return;
    var steps = Array.isArray(d[2]) ? d[2].map(function (x, i) { return '<div class="vh-st"><span class="vh-n">' + (i + 1) + '</span><span>' + esc(x) + '</span></div>'; }).join('') : '';
    var ov = document.createElement('div'); ov.className = 'vh-ov';
    ov.innerHTML = '<div class="vh-sh" role="dialog" aria-modal="true"><div class="vh-gr"></div><h2 class="vh-t">' + esc(d[0]) + '</h2><p class="vh-p">' + esc(d[1]) + '</p>'
      + steps + (d[3] ? '<p class="vh-p" style="margin-top:10px;">' + esc(d[3]) + '</p>' : '')
      + '<button type="button" class="vh-ok">' + esc(OK[l] || OK.en) + '</button></div>';
    if (l === 'he') ov.firstChild.setAttribute('dir', 'rtl');
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.classList.contains('vh-ok')) ov.remove(); });
    document.body.appendChild(ov);
  }
  function once(tab) {
    try { var k = 'vial_help_' + tab; if (localStorage.getItem(k)) return; localStorage.setItem(k, '1'); } catch (e) { return; }
    open(tab);
  }
  function button(tab) { css(); return '<button type="button" class="vh-i" aria-label="?" onclick="vialHelp.open(\'' + tab + '\')">i</button>'; }
  try { css(); } catch (e) {}   // стиль кнопки «i» нужен и статичным кнопкам в разметке страниц
  window.vialHelp = { open: open, once: once, button: button };
})();
