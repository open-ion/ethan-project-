/* 予定済み（定期ブリーフィング）画面。
   ./briefings.json を読み込み、ChatGPTの「予定済み」風にカード表示する。 */
(function () {
  "use strict";

  var $main = document.getElementById("main");
  var $date = document.getElementById("dateLabel");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // 本文中のURLをリンク化し、改行を <br> に。
  function bodyHtml(text) {
    var safe = esc(text);
    safe = safe.replace(/(https?:\/\/[^\s）)、]+)/g, function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener">' + u + "</a>";
    });
    return safe.replace(/\n/g, "<br>");
  }

  function formatDate(iso) {
    var m = /(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    return m ? (parseInt(m[2], 10) + "月" + parseInt(m[3], 10) + "日") : "";
  }

  function newsCard() {
    // 既存のニュースダイジェストアプリへの導線
    var a = el("a", "card");
    a.href = "./"; a.style.display = "block";
    a.appendChild(el("div", "title", "🗞 News Brief（ニュース）"));
    a.appendChild(el("div", "sum", "カテゴリ別の主要ニュースを数分で。タップで開く。"));
    var foot = el("div", "foot");
    var chip = el("span", "chip", "毎日");
    chip.style.background = "#ff4d4f";
    foot.appendChild(chip);
    a.appendChild(foot);
    return a;
  }

  function briefingCard(b) {
    var card = el("div", "card");
    card.appendChild(el("div", "title", (b.emoji || "📌") + " " + b.title));

    if (b.body) {
      var body = el("div", "sum");
      body.innerHTML = bodyHtml(b.body);
      card.appendChild(body);
    } else if (b.instruction) {
      card.appendChild(el("div", "sum", b.instruction));
    }

    var foot = el("div", "foot");
    if (b.schedule_label) {
      var chip = el("span", "chip", b.schedule_label);
      chip.style.background = "#3b6cf6";
      foot.appendChild(chip);
    }
    if (b.due === false) {
      foot.appendChild(el("span", null, "次回更新予定"));
    } else if (b.ok === false) {
      foot.appendChild(el("span", null, "生成できませんでした"));
    } else if (b.generated_at) {
      foot.appendChild(el("span", null, formatDate(b.generated_at) + " 更新"));
    }
    card.appendChild(foot);
    return card;
  }

  function render(data) {
    $date.textContent = formatDate(data.generated_at) + " ・ 定期ブリーフィング";
    $main.innerHTML = "";
    $main.appendChild(el("div", "sectionhead", "毎日のダイジェスト"));
    $main.appendChild(newsCard());

    var list = data.briefings || [];
    if (list.length) {
      $main.appendChild(el("div", "sectionhead", "予定済みのブリーフィング"));
      list.forEach(function (b) { $main.appendChild(briefingCard(b)); });
    }
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }

  fetch("./briefings.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () {
      // 予定がまだ無い場合もニュースへの導線は出す
      $date.textContent = "";
      $main.innerHTML = "";
      $main.appendChild(el("div", "sectionhead", "毎日のダイジェスト"));
      $main.appendChild(newsCard());
      $main.appendChild(el("p", "hint",
        "定期ブリーフィングはまだありません（briefings.json で設定）。"));
    });
})();
