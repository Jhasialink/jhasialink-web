/* 캠퍼스 & 시설: 「지도로 보기 / 목록으로 보기」 (2026-11-23).
   목록(#campus-board)은 그대로 두고, 위에 전환 버튼과 지도를 붙인다. 주소 끝 #map 이면 지도.
   한국어 외 언어는 번역 전까지 영어로 보인다. */
(function () {
  var board = document.getElementById("campus-board");
  if (!board) return;
  var ko = (document.documentElement.lang || "ko").indexOf("ko") === 0;
  var M = "/media/campus/map/", C = "/media/campus/r1029/";
  var T = ko ? {
    map: "지도로 보기", list: "목록으로 보기",
    lead: "지도의 표시를 누르면 그곳 사진이 나와요.",
    alt: "캠퍼스를 위에서 내려다본 드론 사진",
    more: "식당·독서실·자습실·매점·양호실 사진은 목록에서 볼 수 있어요.", moreBtn: "목록에서 보기",
    of: " / "
  } : {
    map: "Map view", list: "List view",
    lead: "Tap a marker on the map to see photos of that spot.",
    alt: "Drone photo of the campus from above",
    more: "Photos of the dining hall, reading room, study hall, store and clinic are in the list view.", moreBtn: "Open list view",
    of: " / "
  };
  function ph(n, a) { var r = []; for (var i = 1; i <= n; i++) r.push(a + i + ".webp"); return r; }
  // x·y = 바탕 사진 위 위치(%)
  var P = [
    { x: 30, y: 44, n: ko ? "건물" : "Main building",
      d: ko ? "ㄱ자 건물 하나에 1층은 교실, 2층은 기숙사예요." : "One L-shaped building: classrooms on the 1st floor, dorm rooms on the 2nd.",
      floors: [
        { n: ko ? "1층 교실" : "1F Classrooms", p: [M + "building.webp"].concat(ph(4, C + "one-"), ph(4, C + "group-")) },
        { n: ko ? "2층 기숙사" : "2F Dorm rooms", p: ph(5, C + "room2-").concat(ph(4, C + "room4-")) }
      ], more: true },
    { x: 49, y: 53, n: ko ? "농구장" : "Basketball court", d: ko ? "건물 바로 앞 야외 농구장" : "Outdoor court right in front of the building", p: [M + "court.webp"] },
    { x: 66, y: 52, n: ko ? "수영장" : "Swimming pool", d: ko ? "교내 야외 수영장과 원형 풀" : "On-campus outdoor pool with a round pool", p: [M + "pool-1.webp", M + "pool-2.webp"] },
    { x: 59, y: 40, n: ko ? "쉼터" : "Shaded rest area", d: ko ? "수영장 옆 지붕 덮인 쉼터" : "Covered rest area next to the pool", p: [M + "shelter.webp"] },
    { x: 55, y: 22, n: ko ? "태양광 패널" : "Solar panels", d: ko ? "건물 지붕의 태양광 패널" : "Solar panels on the building roof", p: [M + "solar.webp"] }
  ];

  function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }

  // 전환 버튼
  var sw = el("div", "cm-switch"); sw.setAttribute("role", "tablist");
  var bMap = el("button", "cm-tab", T.map), bList = el("button", "cm-tab", T.list);
  [bMap, bList].forEach(function (b) { b.type = "button"; b.setAttribute("role", "tab"); sw.appendChild(b); });

  // 지도
  var wrap = el("section", "cm"); wrap.id = "campus-map"; wrap.hidden = true;
  wrap.appendChild(el("p", "cm-lead", T.lead));
  var grid = el("div", "cm-grid"); wrap.appendChild(grid);
  var left = el("div", "cm-left"), map = el("div", "cm-map");
  var img = el("img"); img.alt = T.alt; img.width = 1600; img.height = 900; img.decoding = "async";
  img.src = M + "base-1600.webp"; img.srcset = M + "base-900.webp 900w, " + M + "base-1600.webp 1600w";
  img.sizes = "(max-width: 767px) 100vw, 60vw";
  map.appendChild(img); left.appendChild(map);
  var chips = el("div", "cm-chips"); left.appendChild(chips); grid.appendChild(left);
  var card = el("div", "cm-card"); card.setAttribute("aria-live", "polite"); grid.appendChild(card);

  var pins = [], chipBtns = [], cur = -1, floor = 0;
  P.forEach(function (p, i) {
    var b = el("button", "cm-pin"); b.type = "button"; b.style.left = p.x + "%"; b.style.top = p.y + "%";
    b.setAttribute("aria-label", (i + 1) + ". " + p.n);
    b.appendChild(el("i", "", String(i + 1))); b.appendChild(el("span", "", p.n));
    b.onclick = function () { show(i, true); }; map.appendChild(b); pins.push(b);
    var c = el("button", "cm-chip", (i + 1) + ". " + p.n); c.type = "button";
    c.onclick = function () { show(i, true); }; chips.appendChild(c); chipBtns.push(c);
  });

  function photos(list, name) {
    var box = el("div", "cm-photos"), rail = el("div", "cm-rail"), cnt = el("div", "cm-count");
    list.forEach(function (src, k) {
      var im = el("img"); im.src = src; im.alt = name + " " + (k + 1); im.loading = k ? "lazy" : "eager"; im.decoding = "async";
      rail.appendChild(im);
    });
    box.appendChild(rail);
    if (list.length > 1) {
      cnt.textContent = "1" + T.of + list.length; box.appendChild(cnt);
      var prev = el("button", "cm-nav cm-prev"), next = el("button", "cm-nav cm-next");
      prev.type = next.type = "button"; prev.setAttribute("aria-label", ko ? "이전 사진" : "Previous photo"); next.setAttribute("aria-label", ko ? "다음 사진" : "Next photo");
      function go(d) { rail.scrollBy({ left: d * rail.clientWidth, behavior: reduce() ? "auto" : "smooth" }); }
      prev.onclick = function () { go(-1); }; next.onclick = function () { go(1); };
      box.appendChild(prev); box.appendChild(next);
      rail.addEventListener("scroll", function () { cnt.textContent = (Math.round(rail.scrollLeft / rail.clientWidth) + 1) + T.of + list.length; }, { passive: true });
    }
    return box;
  }
  function reduce() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function render() {
    var p = P[cur]; card.textContent = "";
    var list = p.floors ? p.floors[floor].p : p.p, name = p.floors ? p.floors[floor].n : p.n;
    var head = el("div", "cm-head");
    head.appendChild(el("span", "cm-num", String(cur + 1)));
    head.appendChild(el("h2", "cm-title", p.n));
    card.appendChild(head);
    card.appendChild(el("p", "cm-desc", p.d));
    if (p.floors) {
      var ft = el("div", "cm-floors");
      p.floors.forEach(function (f, k) {
        var b = el("button", "cm-floor" + (k === floor ? " on" : ""), f.n); b.type = "button";
        b.setAttribute("aria-pressed", k === floor);
        b.onclick = function () { floor = k; render(); }; ft.appendChild(b);
      });
      card.appendChild(ft);
    }
    card.appendChild(photos(list, name));
    if (p.more) {
      var m = el("p", "cm-more", T.more + " "), a = el("button", "cm-link", T.moreBtn); a.type = "button";
      a.onclick = function () { setView("list", true); }; m.appendChild(a); card.appendChild(m);
    }
  }
  function show(i, user) {
    if (i !== cur) floor = 0;
    cur = i; render();
    pins.forEach(function (b, j) { b.setAttribute("aria-pressed", i === j); });
    chipBtns.forEach(function (b, j) { b.setAttribute("aria-pressed", i === j); });
    if (user && window.innerWidth < 768) {
      var r = card.getBoundingClientRect();
      if (r.top > window.innerHeight - 120 || r.top < 60) card.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
    }
  }

  function setView(v, push) {
    var isMap = v === "map";
    wrap.hidden = !isMap; board.hidden = isMap;
    bMap.setAttribute("aria-selected", isMap); bList.setAttribute("aria-selected", !isMap);
    bMap.classList.toggle("on", isMap); bList.classList.toggle("on", !isMap);
    if (isMap && cur < 0) show(0);
    if (push) {
      var url = location.pathname + location.search + (isMap ? "#map" : "");
      if (isMap) history.pushState({ cm: 1 }, "", url); else if (history.state && history.state.cm) history.back(); else history.replaceState(null, "", url);
    }
  }
  bMap.onclick = function () { if (wrap.hidden) setView("map", true); };
  bList.onclick = function () { if (board.hidden) setView("list", true); };
  window.addEventListener("popstate", function () { setView(location.hash === "#map" ? "map" : "list", false); });

  if (!ko) { sw.dir = wrap.dir = "ltr"; sw.lang = wrap.lang = "en"; }  // 번역 전 영어 문장이 아랍어(오른쪽→왼쪽) 화면에서 뒤집히지 않게
  board.parentNode.insertBefore(sw, board);
  board.parentNode.insertBefore(wrap, board);
  setView(location.hash === "#map" ? "map" : "list", false);
})();
