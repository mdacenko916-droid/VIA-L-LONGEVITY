/* VIO · Phosphor icon substitution (Regular, single premium style)
 * Runtime-заменяет «иконочные» эмодзи в видимом тексте DOM на Phosphor <i>.
 * НЕ трогает исходные строки в JS / промпт ИИ / экспорт / печать —
 * работает только на отрендеренном DOM. Цвет/размер — через CSS (.vio-ic).
 * Исключены намеренно: цветные статус-точки (🟢🟡🟠🔴🔵 — несут цвет-смысл),
 * флаги языков, стрелки/матем. глифы в тексте.
 */
(function () {
  "use strict";

  var MAP = {
    // — UI controls / actions —
    "✓": "check", "✅": "check-circle", "❌": "x-circle", "✕": "x", "➕": "plus",
    "🔄": "arrows-clockwise", "🔀": "shuffle", "✏": "pencil-simple", "📝": "note-pencil",
    "🖨": "printer", "📁": "folder", "📄": "file", "📖": "book-open", "🔑": "key",
    "🔒": "lock-simple", "🔗": "link", "💾": "floppy-disk", "📥": "download-simple",
    "📋": "clipboard", "🔍": "magnifying-glass", "👀": "eye", "💬": "chat-circle",
    "📍": "map-pin", "🚨": "warning-octagon", "⏰": "alarm", "📅": "calendar-blank",
    "📡": "broadcast", "⋮": "dots-three-vertical", "🎯": "target", "🧭": "compass",
    "⏳": "hourglass", "🛑": "stop-circle", "⚠": "warning", "⚖": "scales",
    // — trends / charts —
    "📈": "trend-up", "📉": "trend-down", "📊": "chart-bar",
    // — body / health / energy —
    "💪": "barbell", "🧠": "brain", "🦴": "bone", "🩸": "drop", "🦠": "virus",
    "🌡": "thermometer", "💊": "pill", "💗": "heartbeat", "❤": "heart", "🔥": "flame",
    "⚡": "lightning", "🔋": "battery-full", "🪫": "battery-low", "🛡": "shield-check",
    "🫧": "drop", "⌚": "watch",
    // — movement —
    "🚶": "person-simple-walk", "🏃": "person-simple-run", "🏋": "barbell",
    "🧘": "person-simple-tai-chi", "🤸": "person-simple-throw", "👟": "sneaker-move",
    // — sleep / mood —
    "😴": "moon-stars", "🥱": "moon", "🥶": "snowflake", "😓": "smiley-nervous",
    "😌": "smiley", "🌙": "moon", "☀": "sun",
    // — mood face scale —
    "😣": "smiley-sad", "😞": "smiley-sad", "😟": "smiley-nervous", "😕": "smiley-meh",
    "😐": "smiley-blank", "🙂": "smiley", "😊": "smiley", "😄": "smiley", "🤩": "smiley-wink",
    // — food / nutrients —
    "🥩": "hamburger", "🥗": "bowl-food", "🍽": "fork-knife", "🥚": "egg", "🥜": "nut",
    "🍫": "cookie", "🧁": "cake", "🍋": "orange-slice", "🍎": "apple-logo", "🍷": "wine",
    "🍵": "coffee", "🐟": "fish", "💧": "drop", "🌾": "grains", "🌱": "plant",
    "🌿": "leaf", "🌸": "flower-lotus",
    // — nature / metaphor —
    "✨": "sparkle", "✦": "sparkle", "🐢": "feather", "🌊": "waves", "🌀": "spiral",
    "🌫": "cloud-fog", "🌋": "mountains", "🎢": "wave-sine",
    // — people —
    "👩": "user", "👨": "user"
  };

  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, OPTION: 1, CODE: 1, PRE: 1 };

  var chars = Object.keys(MAP);
  var re = new RegExp(
    "(" + chars.map(function (c) {
      return c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|") + ")\\uFE0F?", "g"
  );

  function skipParent(node) {
    var p = node.parentNode;
    while (p && p.nodeType === 1) {
      if (SKIP[p.tagName]) return true;
      if (p.classList && p.classList.contains("vio-ic")) return true;
      if (p.isContentEditable) return true;
      p = p.parentNode;
    }
    return false;
  }

  function replaceTextNode(node) {
    var text = node.nodeValue;
    re.lastIndex = 0;
    if (!re.test(text)) return;
    if (skipParent(node)) return;
    re.lastIndex = 0;
    var frag = document.createDocumentFragment();
    var last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      var i = document.createElement("i");
      i.className = "ph ph-" + MAP[m[1]] + " vio-ic";
      i.setAttribute("aria-hidden", "true");
      frag.appendChild(i);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    if (node.parentNode) node.parentNode.replaceChild(frag, node);
  }

  function process(root) {
    if (!root) return;
    if (root.nodeType === 3) { replaceTextNode(root); return; }
    if (root.nodeType !== 1) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(replaceTextNode);
  }

  var observer = null;

  function connect() {
    if (observer) observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function disconnect() {
    if (observer) observer.disconnect();
  }

  function init() {
    disconnect();
    process(document.body);
    observer = new MutationObserver(function (muts) {
      disconnect();
      for (var k = 0; k < muts.length; k++) {
        var mu = muts[k];
        if (mu.type === "characterData") {
          process(mu.target);
        } else {
          for (var j = 0; j < mu.addedNodes.length; j++) process(mu.addedNodes[j]);
        }
      }
      connect();
    });
    connect();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
