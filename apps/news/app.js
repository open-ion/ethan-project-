/* 5分ニュースダイジェスト — アプリ本体（依存なし）。
   ./digest.json を読み込み、タブ切替・ジャンル選択・オフライン対応で表示する。 */
(function () {
  "use strict";

  var COLORS = {
    trend: "#ff4d4f", politics: "#3b6cf6", economy: "#16a34a", prices: "#f59e0b",
    medical: "#06b6d4", sports: "#8b5cf6", world: "#0ea5e9", society: "#64748b",
  };
  var DEFAULT_COLOR = "#ff4d4f";

  var data = null;          // digest.json
  var selected = null;      // 表示するジャンルkeyの配列
  var current = "top";      // 現在のタブ

  var $main = document.getElementById("main");
  var $tabs = document.getElementById("tabs");
  var $date = document.getElementById("dateLabel");

  // ---- localStorage ヘルパ ----
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function color(k) { return COLORS[k] || DEFAULT_COLOR; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ---- データ取得 ----
  function loadData() {
    return fetch("./digest.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .catch(function () {
        // SW がオフライン時にキャッシュを返す。それも無ければエラー表示。
        return fetch("./digest.json").then(function (r) { return r.json(); });
      });
  }

  function presentGenres() { return (data.genres || []).map(function (g) { return g.key; }); }

  function loadSelected() {
    var saved = lsGet("nd_genres");
    var present = presentGenres();
    if (saved) {
      try {
        var arr = JSON.parse(saved).filter(function (k) { return present.indexOf(k) >= 0; });
        if (arr.length) return arr;
      } catch (e) {}
    }
    return present.slice(); // 既定は全部
  }

  function genreByKey(k) {
    return (data.genres || []).filter(function (g) { return g.key === k; })[0];
  }

  // ---- カード生成 ----
  function card(item, chipKey) {
    var a = el("a", "card");
    a.href = item.link; a.target = "_blank"; a.rel = "noopener";
    a.appendChild(el("div", "title", item.title));
    if (item.summary) a.appendChild(el("div", "sum", item.summary));
    var foot = el("div", "foot");
    if (chipKey) {
      var g = genreByKey(chipKey);
      if (g) {
        var chip = el("span", "chip", g.emoji + " " + g.label);
        chip.style.background = color(chipKey);
        foot.appendChild(chip);
      }
    }
    if (item.time) foot.appendChild(el("span", null, item.time));
    foot.appendChild(el("span", null, "NHK"));
    a.appendChild(foot);
    return a;
  }

  // ---- 描画 ----
  function render() {
    // 日付・エンジン表示
    $date.textContent = formatDate(data.date_label) + "更新 ・ "
      + (data.used_llm ? "AI要約" : "見出し+概要");

    // タブ
    $tabs.innerHTML = "";
    var order = ["top"].concat(selected);
    addTab("top", "⭐ トップ", DEFAULT_COLOR);
    selected.forEach(function (k) {
      var g = genreByKey(k);
      if (g) addTab(k, g.emoji + " " + g.label, color(k));
    });

    // パネル
    $main.innerHTML = "";
    $main.appendChild(topPanel());
    selected.forEach(function (k) {
      var g = genreByKey(k);
      if (g) $main.appendChild(genrePanel(g));
    });

    // 復元 or 先頭
    var saved = lsGet("nd_tab");
    showTab(order.indexOf(saved) >= 0 ? saved : "top", false);
  }

  function addTab(key, label, col) {
    var b = el("button", null, label);
    b.setAttribute("role", "tab");
    b.dataset.tab = key; b.dataset.color = col;
    b.addEventListener("click", function () { showTab(key, true); });
    $tabs.appendChild(b);
  }

  function topPanel() {
    var p = el("section", "panel"); p.dataset.panel = "top";
    if (data.overall) {
      var s = el("div", "summary");
      s.appendChild(el("h2", null, "📌 今日のまとめ"));
      s.appendChild(document.createTextNode(data.overall));
      p.appendChild(s);
    }
    if (selected.length) {
      p.appendChild(el("div", "sectionhead", "主要トピック"));
      selected.forEach(function (k) {
        var g = genreByKey(k);
        if (g && g.items && g.items.length) p.appendChild(card(g.items[0], k));
      });
    } else {
      p.appendChild(el("p", "empty", "表示するジャンルがありません。⚙ から選んでください。"));
    }
    p.appendChild(el("p", "hint", "← タブをタップ／スワイプでカテゴリ切替 →"));
    return p;
  }

  function genrePanel(g) {
    var p = el("section", "panel"); p.dataset.panel = g.key; p.hidden = true;
    (g.items || []).forEach(function (it) { p.appendChild(card(it)); });
    if (!g.items || !g.items.length) p.appendChild(el("p", "empty", "新着なし"));
    return p;
  }

  function showTab(key, save) {
    var tabs = Array.prototype.slice.call($tabs.querySelectorAll("button"));
    tabs.forEach(function (t) {
      var on = t.dataset.tab === key;
      t.setAttribute("aria-selected", on ? "true" : "false");
      if (on) {
        t.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
        document.documentElement.style.setProperty("--accent", t.dataset.color || DEFAULT_COLOR);
      }
    });
    Array.prototype.slice.call($main.querySelectorAll(".panel")).forEach(function (p) {
      p.hidden = p.dataset.panel !== key;
    });
    current = key;
    if (save) lsSet("nd_tab", key);
    window.scrollTo(0, 0);
  }

  function formatDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
    return m ? (parseInt(m[2], 10) + "月" + parseInt(m[3], 10) + "日") : (s || "");
  }

  // ---- スワイプでタブ移動 ----
  function enableSwipe() {
    var x0 = null, y0 = null;
    $main.addEventListener("touchstart", function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    $main.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        var order = ["top"].concat(selected);
        var i = order.indexOf(current);
        var n = i + (dx < 0 ? 1 : -1);
        if (n >= 0 && n < order.length) showTab(order[n], true);
      }
      x0 = y0 = null;
    }, { passive: true });
  }

  // ---- ジャンル選択シート ----
  function setupSheet() {
    var $sheet = document.getElementById("sheet");
    var $toggles = document.getElementById("genreToggles");
    function open() {
      $toggles.innerHTML = "";
      presentGenres().forEach(function (k) {
        var g = genreByKey(k);
        var row = el("label", "toggle");
        row.appendChild(el("span", "lbl", g.emoji + " " + g.label));
        var cb = document.createElement("input");
        cb.type = "checkbox"; cb.checked = selected.indexOf(k) >= 0; cb.dataset.key = k;
        row.appendChild(cb);
        $toggles.appendChild(row);
      });
      $sheet.hidden = false;
    }
    function close() { $sheet.hidden = true; }
    function done() {
      var checks = Array.prototype.slice.call($toggles.querySelectorAll("input"));
      var picked = checks.filter(function (c) { return c.checked; })
        .map(function (c) { return c.dataset.key; });
      if (!picked.length) picked = presentGenres(); // 全部外したら全表示に戻す
      selected = picked;
      lsSet("nd_genres", JSON.stringify(selected));
      close();
      render();
    }
    document.getElementById("settingsBtn").addEventListener("click", open);
    document.getElementById("sheetBg").addEventListener("click", close);
    document.getElementById("sheetDone").addEventListener("click", done);
  }

  // ---- 起動 ----
  function init() {
    setupSheet();
    enableSwipe();
    loadData().then(function (d) {
      data = d;
      selected = loadSelected();
      render();
    }).catch(function (err) {
      $main.innerHTML = "";
      $main.appendChild(el("p", "empty",
        "ニュースを読み込めませんでした。時間をおいて開き直してください。"));
      $date.textContent = "";
      console.error(err);
    });
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }
  init();
})();
