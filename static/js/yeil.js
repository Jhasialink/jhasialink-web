// 머리글 메뉴가 넘치면 ☰ 메뉴로 바꾼다 (외국어 메뉴가 길 때)
(function () {
  var html = document.documentElement;
  function fit() {
    html.classList.remove("ys-compact");
    var w = document.querySelector(".ys-head .wrap");
    if (w && w.scrollWidth > w.clientWidth + 1) html.classList.add("ys-compact");
  }
  fit();
  addEventListener("resize", fit);
  // LMS 로그인 링크에 이 페이지 언어를 붙인다 (로그인 화면도 같은 언어로)
  var code = { "zh-Hans": "zh", "zh-Hant": "zh-tw" }[html.lang] || html.lang;
  [].forEach.call(document.querySelectorAll("a[data-login]"), function (a) { a.search = "?lang=" + code; });
  if (document.fonts) document.fonts.ready.then(fit);
})();

// Yeil 학교 공간: LMS 주소가 있으면(<html data-lms>) 공지사항·학사일정을 LMS에서 가져와 보여 준다.
// 실패하거나 주소가 없으면 페이지에 미리 적힌 "준비 중"/"없습니다" 문구가 그대로 남는다.
(function () {
  var lms = document.documentElement.dataset.lms, box = document.querySelector("[data-feed]");
  if (!lms || !box) return;
  var lang = document.documentElement.lang || "ko";
  var label = function (k) { var e = document.querySelector('[data-label="' + k + '"]'); return e ? e.textContent : k; };
  var day = function (d) { return new Date(d + "T00:00:00").toLocaleDateString(lang, { year: "numeric", month: "short", day: "numeric", weekday: "short" }); };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var code = { "zh-Hans": "zh", "zh-Hant": "zh-tw" }[lang] || lang;
  fetch(lms.replace(/\/$/, "") + "/yics/public/feed.php?lang=" + code).then(function (r) { return r.json(); }).then(function (data) {
    var kind = box.dataset.feed, items = data[kind] || [];
    var src = document.querySelector(".feed-src"); if (src) src.hidden = false;
    if (kind === "notices") {
      if (!items.length) return;
      box.textContent = "";
      items.forEach(function (n) {
        var row = el("div", "notice");
        var head = el("div", "notice-head"); head.append(el("b", "", n.title), el("span", "notice-date", day(n.date)));
        row.append(head); if (n.text) row.append(el("p", "", n.text));
        box.append(row);
      });
    } else {
      box.textContent = "";
      if (!items.length) { box.append(el("div", "soon", label("none"))); return; }
      var t = el("table", "tbl"), today = new Date().toISOString().slice(0, 10);
      items.forEach(function (c) {
        var tr = el("tr", c.date < today ? "past" : "");
        tr.append(el("td", "", day(c.date)));
        var td = el("td"); td.append(el("span", "tag " + c.type, label(c.type)), document.createTextNode(" " + c.title + (c.note ? " — " + c.note : "")));
        tr.append(td); t.append(tr);
      });
      var wrap = el("div", "scroll"); wrap.append(t); box.append(wrap);
    }
  }).catch(function () {});
})();
