/* News Brief ダッシュボード（依存なし）。
   ./data.json を読み、「今日の重要ニュース」＋カテゴリ別ダイジェストを描画する。 */
(function () {
  "use strict";

  var CAT_COLOR = {
    ai_tech: "#7c3aed", investing: "#16a34a", medical: "#06b6d4", business: "#f59e0b",
  };
  var $main = document.getElementById("main");
  var $chips = document.getElementById("chips");
  var $date = document.getElementById("dateLabel");
  var $sampleNote = document.getElementById("sampleNote");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function color(key) { return CAT_COLOR[key] || "#2563eb"; }

  // 1ニュースのカード（chip=カテゴリ表示する場合に色キーを渡す）
  function card(item, chipKey, chipLabel, chipEmoji) {
    var c = el("div", "card");
    if (chipKey) {
      var chip = el("span", "chip", (chipEmoji ? chipEmoji + " " : "") + chipLabel);
      chip.style.background = color(chipKey);
      c.appendChild(chip);
    }
    c.appendChild(el("div", "headline", item.headline || ""));
    if (item.one_line) c.appendChild(el("div", "oneline", item.one_line));

    if (item.why) {
      var why = el("div", "why");
      why.appendChild(el("span", "label", "なぜ重要か"));
      why.appendChild(document.createTextNode(item.why));
      c.appendChild(why);
    }
    if (item.bottom_line) {
      var b = el("div", "bottom");
      b.appendChild(el("span", "label", "結論"));
      b.appendChild(document.createTextNode(item.bottom_line));
      c.appendChild(b);
    }

    var foot = el("div", "foot");
    foot.appendChild(el("span", "src", item.source || ""));
    if (item.url) {
      var a = el("a", "more", "詳細を読む →");
      a.href = item.url; a.target = "_blank"; a.rel = "noopener";
      foot.appendChild(a);
    }
    c.appendChild(foot);
    return c;
  }

  function sectionHead(emoji, title, count) {
    var h = el("div", "sectionhead");
    h.appendChild(document.createTextNode((emoji ? emoji + " " : "") + title));
    if (count != null) h.appendChild(el("span", "count", count + "本"));
    return h;
  }

  function render(data) {
    $date.textContent = data.date_label || "";
    if (data.is_sample) {
      $sampleNote.textContent = "※サンプルデータ表示中。";
      var bar = el("div", "samplebar",
        "サンプルニュースで画面を表示しています（実データの自動取得は次段階）。");
      $main.parentNode.insertBefore(bar, $main);
    }
    $main.innerHTML = "";

    // カテゴリチップ（ジャンプ）
    $chips.innerHTML = "";
    var top = el("a", null, "⭐ 今日の重要");
    top.href = "#top"; $chips.appendChild(top);
    (data.categories || []).forEach(function (cat) {
      var a = el("a", null, (cat.emoji || "") + " " + cat.label);
      a.href = "#cat-" + cat.key;
      $chips.appendChild(a);
    });

    // 今日の重要ニュース（カテゴリ横断トップ）
    var topSec = el("section", "top"); topSec.id = "top";
    topSec.appendChild(sectionHead("⭐", "今日の重要ニュース",
      (data.top_picks || []).length));
    (data.top_picks || []).forEach(function (it) {
      topSec.appendChild(card(it, it.key, it.label, it.emoji));
    });
    $main.appendChild(topSec);

    // カテゴリ別
    (data.categories || []).forEach(function (cat) {
      var sec = el("section"); sec.id = "cat-" + cat.key;
      sec.appendChild(sectionHead(cat.emoji, cat.label, (cat.items || []).length));
      (cat.items || []).forEach(function (it) { sec.appendChild(card(it)); });
      $main.appendChild(sec);
    });
  }

  fetch("./data.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function (e) {
      $main.innerHTML = "";
      $main.appendChild(el("p", "loading",
        "ニュースを読み込めませんでした。HTTPサーバ経由で開いてください（file:// は不可）。"));
      console.error(e);
    });
})();
