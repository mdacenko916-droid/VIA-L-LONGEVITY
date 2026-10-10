
  // ── дозы: русская строка из плана → язык экрана ──────────────────────────────
  function dose(s, l) {
    s = String(s || '');
    if (/^\d+$/.test(s)) s += ' раз';   // голое число в плане = повторы
    if (l === 'ru' || !U[l]) return s;
    var u = U[l];
    s = s.replace(/^по /, '\u0001')
      .replace(/на каждую ногу|на ногу/g, u.leg).replace(/на каждую руку|на руку/g, u.arm)
      .replace(/на каждую сторону|на сторону/g, u.side).replace(/за круг/g, u.rnd)
      .replace(/касаний/g, u.tap).replace(/раз/g, u.x).replace(/мин/g, u.min)
      .replace(/(\d) с(?=$|[\s,])/g, '$1 ' + u.s)
      .replace('\u0001', u.po);
    if (l === 'ja' || l === 'ko') s = s.replace(/(\d) (秒|分|回|초|분|회)/g, '$1$2');
    return s;
  }
  function tx(o, l) { return (o && (o[l] || o.en || o.ru)) || ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nm(i, l) { var a = N[l] || N.en; return a[i] || N.ru[i] || ''; }
  function title(id, l) { var w = W[id]; return w ? tx(TI[w.ti], l) : ''; }
  function invTxt(id, l) {
    var w = W[id]; if (!w) return '';
    return w.inv.map(function (k) { var p = k.split(':'); return tx(INV[p[0]], l).replace('{d}', p[1] || ''); }).join(', ');
  }

  // ── журнал «Сделано» ─────────────────────────────────────────────────────────
  var LOG = 'vialp_workouts';
  function log() { try { var a = JSON.parse(localStorage.getItem(LOG) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function doneOn(day) { var r = log().filter(function (x) { return x && x.day === day; })[0]; return r ? r.id : ''; }
  function mark(id, day, on) {
    var a = log().filter(function (x) { return x && x.day !== day; });
    if (on && W[id]) a.unshift({ day: day, id: id, c: W[id].c });
    try { localStorage.setItem(LOG, JSON.stringify(a.slice(0, 120))); } catch (e) {}
  }

  // ── выбор тренировки дня — docs/FITNESS-SELECTION-RULES.md §4–7 ─────────────
  // ctx: {male, level:'start'|'reg'|'tr', bp, ill, limit, heartRisk, pelvic, older, bad, soreMild,
  //       sleep, back, calm (жалоба: сон · спина/суставы · приливы/настроение/туман),
//       hist:[{d:1..7, c:'legs'|'upper'|'full'|'str'|'core'|'bal'|'mob'|'pil'|'mind'|'hiit'|'cardio'|'other'}]}
  // Ответ: {id|null, why, wp} — id тренировки, ключ строки «почему» и её параметры.
  var STR = { legs: 1, upper: 1, full: 1, str: 1 };
  var IDS = {
    w: { legs: ['w1', 'w2', 'w3'], upper: ['w4', 'w5', 'w6'], full: ['w7', 'w8', 'w9'], core: ['w10', 'w11', 'w12'], bal: ['w13', 'w13', 'w13'], mob: ['w14', 'w14', 'w14'], hiit: ['w15', 'w15', 'w15'], pil: ['w16', 'w16', 'w16'], mind: ['w17', 'w17', 'w17'] },
    m: { legs: ['m1', 'm2', 'm3'], upper: ['m4', 'm5', 'm6'], full: ['m7', 'm8', 'm9'], core: ['m10', 'm11', 'm11'], cardio: ['m12', 'm13', 'm14'], mob: ['m15', 'm15', 'm15'] }
  };
  var LV = ['start', 'reg', 'tr'];
  function pick(ctx) {
    ctx = ctx || {};
    var tr = ctx.male ? 'm' : 'w', T = IDS[tr], mob = T.mob[0];
    var lv = Math.max(0, LV.indexOf(ctx.level || 'start'));
    var id = function (c, l) { return (T[c] || T.mob)[l == null ? lv : l]; };
    if (ctx.bp) return { id: null, why: 'bp' };
    if (ctx.ill) return { id: mob, why: 'ill' };
    if ((ctx.bad || 0) >= 2) return { id: mob, why: 'red' };
    var hist = (ctx.hist || []).filter(function (h) { return h && h.d >= 1 && h.d <= 7; });
    var on = function (d) { return hist.filter(function (h) { return h.d === d; })[0]; };
    var loaded = function (h) { return h && (STR[h.c] || h.c === 'hiit' || h.c === 'cardio'); };
    var streak = 0; while (streak < 7 && loaded(on(streak + 1))) streak++;
    if (streak >= 3) return { id: mob, why: 'rest', wp: { n: streak } };
    var cnt = function (f) { return hist.filter(function (h) { return f(h.c); }).length; };
    var done = { s: cnt(function (c) { return STR[c]; }), core: cnt(function (c) { return c === 'core'; }), bal: cnt(function (c) { return c === 'bal'; }),
                 hiit: cnt(function (c) { return c === 'hiit'; }), pil: cnt(function (c) { return c === 'pil'; }), mind: cnt(function (c) { return c === 'mind'; }), cardio: cnt(function (c) { return c === 'cardio' || c === 'hiit'; }) };
    // Ограничение нагрузки врачом / беременность / онкология сейчас — только щадящие.
    if (ctx.limit) {
      if (!done.core) return { id: id('core', 0), why: 'limit' };
      return { id: tr === 'w' && !done.bal ? 'w13' : mob, why: 'limit' };
    }
    var yellow = (ctx.bad || 0) === 1 || !!ctx.soreMild;
    if (yellow) {
      if (lv === 0) {   // жёлтый день у новичка → корпус / баланс / мобильность (Марина, §8.4)
        if (!done.core) return { id: id('core', 0), why: 'yellow' };
        if (tr === 'w' && !done.bal) return { id: 'w13', why: 'yellow' };
        if (tr === 'w' && !done.mind) return { id: 'w17', why: 'yellow' };
        return { id: mob, why: 'yellow' };
      }
      lv--;
    }
    var y = on(1), yc = y ? y.c : '';
    var ban = {};
    if (yc === 'legs') { ban.legs = ban.full = 1; }
    if (yc === 'upper') { ban.upper = ban.full = 1; }
    if (yc === 'full') { ban.legs = ban.upper = ban.full = 1; }
    if (yc === 'str') { ban.full = 1; }
    if (yc === 'hiit') { ban.hiit = ban.legs = 1; }
    if (STR[yc] && LV[lv] === 'start') { ban.legs = ban.upper = ban.full = 1; }   // у «старта» не две силовые подряд
    var tS = LV[Math.max(0, LV.indexOf(ctx.level || 'start'))] === 'start' ? 2 : 3;
    var need = [];
    // Сила: из ног / верха / всего тела — та, что делали давнее всего (и не запрещена после вчера).
    var last = function (c) { var h = hist.filter(function (x) { return x.c === c; }).sort(function (a, b) { return a.d - b.d; })[0]; return h ? h.d : 99; };
    var sc = ['legs', 'upper', 'full'].filter(function (c) { return !ban[c]; }).sort(function (a, b) { return last(b) - last(a); })[0];
    if (sc && done.s < tS) need.push({ c: sc, def: tS - done.s, s: 1 });
    var tC = ctx.pelvic ? 3 : 1;
    if (done.core < tC && yc !== 'core') need.push({ c: 'core', def: tC - done.core });
    if (tr === 'w' && done.bal < 1 && yc !== 'bal') need.push({ c: 'bal', def: 1 });
    // Пилатес и тело-разум — по разу в неделю (FITNESS-TRAINING-TYPES.md §3, 2026-10-08)
    if (tr === 'w' && done.pil < 1 && yc !== 'pil') need.push({ c: 'pil', def: 1 });
    if (tr === 'w' && done.mind < 1 && yc !== 'mind') need.push({ c: 'mind', def: 1 });
    var green = !yellow;
    if (tr === 'w' && LV[lv] === 'tr' && green && !ctx.heartRisk && !ban.hiit && done.hiit < 1) need.push({ c: 'hiit', def: 1 });
    if (tr === 'm' && done.cardio < 1 && yc !== 'cardio' && yc !== 'hiit') need.push({ c: 'cardio', def: 1 });
    // Предпочтения при равном недоборе: тазовое дно → корпус; сон / спина → пилатес; приливы, настроение,
    // туман → тело-разум; 60+ / остеопороз → баланс; иначе сила.
    var pref = function (n) { return n.c === 'core' && ctx.pelvic ? 4 : n.c === 'pil' && (ctx.sleep || ctx.back) ? 3 : n.c === 'mind' && ctx.calm ? 3 : n.c === 'bal' && ctx.older ? 2 : n.s ? 1 : 0; };
    need.sort(function (a, b) { return (b.def - a.def) || (pref(b) - pref(a)); });
    var n = need[0];
    var yWhy = yc === 'legs' ? 'yLegs' : yc === 'upper' ? 'yUp' : yc === 'full' ? 'yFull' : '';
    if (!n) {
      var why0 = yellow ? 'yellow' : (done.s >= tS ? 'wkDone' : (yWhy || 'wkDone'));
      if (tr === 'w') return { id: yc === 'bal' ? mob : 'w13', why: why0 };
      return { id: yc === 'cardio' ? mob : 'm12', why: why0 };
    }
    var l2 = lv;
    if (n.c === 'cardio' && (ctx.heartRisk || yellow)) l2 = 0;   // интервалы при сердечном риске — нет
    var res = { id: id(n.c, l2) };
    if (yellow) res.why = 'yellow';
    else if (n.c === 'core' && ctx.pelvic) res.why = 'pelvic';
    else if (n.c === 'pil' || n.c === 'mind') res.why = n.c;
    else if (n.s && yWhy) res.why = yWhy;
    else if (n.s) { res.why = 'wk'; res.wp = { s: done.s, t: tS }; }
    else if (yWhy) res.why = yWhy;
    else res.why = done.s >= tS ? 'wkDone' : '';
    return res;
  }

  // ── отрисовка ────────────────────────────────────────────────────────────────
  function whyTxt(r, l) {
    if (!r || !r.why) return '';
    var s = tx(WHY[r.why], l), p = r.wp || {};
    Object.keys(p).forEach(function (k) { s = s.replace('{' + k + '}', p[k]); });
    return s;
  }
  function meta(id, l) {
    var w = W[id]; if (!w) return '';
    return tx(LVL[w.lv], l) + ' · ' + w.m + ' ' + tx(UI.min, l);
  }
  // Карточка в шаге «Что делать сегодня». done — тренировку уже отметили сегодня.
  function card(r, l, done) {
    var h = '<div class="wo-h"><i class="ph ph-barbell" aria-hidden="true"></i>' + esc(tx(UI.title, l)) + '</div>';
    if (!r || !r.id) return h + '<div class="wo-why">' + esc(whyTxt(r, l)) + '</div>';
    h += '<div class="wo-n">' + esc(title(r.id, l)) + '</div><div class="wo-d">' + esc(meta(r.id, l)) + '</div>';
    var wt = whyTxt(r, l); if (wt) h += '<div class="wo-why">' + esc(wt) + '</div>';
    h += '<div class="wo-b"><button type="button" class="wo-open" onclick="vialWorkouts.open(\'' + r.id + '\')">' + esc(tx(UI.open, l)) + ' ›</button>'
      + '<button type="button" class="wo-done' + (done ? ' on' : '') + '" onclick="vialWorkouts.toggle(\'' + r.id + '\')">' + (done ? '✓ ' + esc(tx(UI.doneOn, l)) : esc(tx(UI.done, l))) + '</button></div>';
    return h;
  }
  function plan(id, l, hyp) {
    var w = W[id]; if (!w) return '';
    var h = '<div class="wo-sh"><div class="wo-d">' + esc(meta(id, l)) + '</div>'
      + '<div class="wo-inv"><b>' + esc(tx(UI.inv, l)) + ':</b> ' + esc(invTxt(id, l)) + '</div>';
    w.p.forEach(function (p) {
      var hd = tx(PART[p[0]], l) + (p[2] ? ' · ' + tx(UI.rounds, l).replace('{n}', p[2]) : '') + ' · ' + p[1] + ' ' + tx(UI.min, l);
      h += '<div class="wo-pt"><div class="wo-pth">' + esc(hd) + '</div><ol>'
        + p[3].map(function (it) { return '<li><span>' + esc(nm(hyp && it[2] != null ? it[2] : it[0], l)) + '</span>' + (it[1] ? '<em>' + esc(dose(it[1], l)) + '</em>' : '') + '</li>'; }).join('')
        + '</ol></div>';
    });
    h += '<div class="wo-note">' + esc(tx(UI.tempo, l)) + '</div><div class="wo-note wo-stop">' + esc(tx(UI.stop, l)) + '</div></div>';
    return h;
  }

  var cfg = { lang: function () { return (typeof window.lang === 'string' && window.lang) || 'en'; }, day: function () { return new Date().toISOString().slice(0, 10); }, rerender: null };
  function L_() { try { return cfg.lang(); } catch (e) { return 'en'; } }
  function open(id) {
    if (typeof window.openSheet !== 'function' || !W[id]) return;
    window.openSheet('<i class="ph ph-barbell" style="color:var(--gold-lt);"></i>', title(id, L_()), plan(id, L_(), !!cfg.hyp));
  }
  function toggle(id) {
    var day = cfg.day(), on = doneOn(day) !== id;
    mark(id, day, on);
    if (typeof cfg.rerender === 'function') try { cfg.rerender(); } catch (e) {}
  }

  var CSS = '.wo-card{background:linear-gradient(160deg,#222a37,#161c26);border:1px solid rgba(226,185,90,.28);border-radius:20px;padding:13px 16px;margin-bottom:10px;color:var(--t1,#fff);}'
    + '.wo-h{display:flex;align-items:center;gap:8px;font-size:var(--fs-cap,13px);color:var(--gold-lt,#EEAF54);font-weight:700;letter-spacing:.06em;text-transform:uppercase;}'
    + '.wo-n{font-size:var(--fs-body,16px);font-weight:600;margin-top:6px;}'
    + '.wo-d{font-size:var(--fs-cap,13px);color:var(--t2,rgba(255,255,255,.7));margin-top:2px;}'
    + '.wo-why{font-size:var(--fs-cap,13px);color:var(--t1,#fff);line-height:1.5;margin-top:8px;}'
    + '.wo-b{display:flex;gap:8px;margin-top:12px;}'
    + '.wo-b button{flex:1;min-height:44px;border-radius:12px;font:600 var(--fs-body,15px) var(--font-ui,inherit);cursor:pointer;background:transparent;color:var(--t1,#fff);border:1px solid rgba(226,185,90,.45);}'
    + '.wo-b .wo-open{background:rgba(226,185,90,.16);}'
    + '.wo-b .wo-done.on{background:#5AC4B2;color:#0e1413;border-color:#5AC4B2;}'
    + '.wo-sh .wo-inv{font-size:var(--fs-cap,13px);color:var(--t2,rgba(255,255,255,.75));line-height:1.5;margin:8px 0 4px;}'
    + '.wo-sh .wo-inv b{color:var(--t1,#fff);font-weight:600;}'
    + '.wo-pt{margin-top:14px;}'
    + '.wo-pth{font-size:var(--fs-cap,13px);font-weight:700;color:var(--t1,#fff);letter-spacing:.02em;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.1);}'
    + '.wo-pt ol{margin:0;padding:0 0 0 22px;}'
    + '.wo-pt li{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);line-height:1.45;color:var(--t1,#fff);font-size:var(--fs-body,15px);}'
    + '.wo-pt li span{display:block;}'
    + '.wo-pt li em{display:block;font-style:normal;font-size:var(--fs-cap,13px);color:var(--gold-lt,#EEAF54);margin-top:2px;}'
    + '.wo-note{font-size:var(--fs-cap,13px);color:var(--t2,rgba(255,255,255,.75));line-height:1.5;margin-top:14px;}'
    + '.wo-stop{color:var(--t1,#fff);}';
  try { var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); } catch (e) {}

  window.vialWorkouts = {
    pick: pick, card: card, plan: plan, open: open, toggle: toggle, title: title, meta: meta, why: whyTxt, dose: dose,
    cat: function (id) { return W[id] ? W[id].c : ''; }, ids: function () { return Object.keys(W); },
    log: log, doneOn: doneOn, mark: mark,
    setup: function (o) { Object.keys(o || {}).forEach(function (k) { cfg[k] = o[k]; }); }
  };
})();
