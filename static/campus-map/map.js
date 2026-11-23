/* 캠퍼스 & 시설: 「지도로 보기 / 목록으로 보기」 (2026-11-23, 같은 날 실장님 지적으로 다시 만듦).
   목록(#campus-board)은 그대로 두고 위에 전환 버튼과 지도를 붙인다. 주소 끝 #map 이면 지도.
   실내는 층별 안내(1층·2층 → 시설 카드), 카드나 사진을 누르면 크게 보기(옆으로 넘김, 뒤로가기로 닫힘).
   층 배치는 실장님 확인(11-23): 1층 로비·교실·식당·매점·양호실·놀이방 / 2층 기숙사·독서실·자습실.
   한국어 외 언어는 번역 전까지 영어로 보인다. */
(function () {
  var board = document.getElementById("campus-board");
  if (!board) return;
  var ko = (document.documentElement.lang || "ko").indexOf("ko") === 0;
  var M = "/media/campus/map/";
  function L(k, e) { return ko ? k : e; }
  var T = {
    map: L("지도로 보기", "Map view"), list: L("목록으로 보기", "List view"),
    lead: L("지도의 표시를 누르면 그곳 사진이 나와요.", "Tap a marker on the map to see photos of that spot."),
    alt: L("캠퍼스를 위에서 내려다본 드론 사진", "Drone photo of the campus from above"),
    n: L("장", " photos"), close: L("닫기", "Close"), prev: L("이전 사진", "Previous photo"), next: L("다음 사진", "Next photo"),
    tapRoom: L("보고 싶은 곳을 누르세요.", "Tap a room to see its photos."), tapPhoto: L("사진을 누르면 크게 볼 수 있어요.", "Tap a photo to see it large.")
  };
  function S(key, n, from) { var r = []; for (var i = from || 1; i <= n; i++) r.push(key + "-" + i); return r; }
  function room(k, e, list, cover) { return { n: L(k, e), p: list, c: cover || list[0] }; }
  var F1 = [
    room("로비", "Lobby", S("lobby", 4).concat("hall1-1")),
    room("1:1 교실", "1:1 classrooms", S("one", 5), "one-5"),
    room("그룹 교실", "Group classrooms", S("group", 4), "group-2"),
    room("대그룹 교실", "Large group classrooms", S("biggroup", 6)),
    room("식당", "Dining hall", S("dining", 5), "dining-4"),
    room("매점", "Store", S("store", 4)),
    room("양호실", "Clinic", S("clinic", 5), "clinic-3"),
    room("놀이방·영화관", "Playroom & movie room", S("playroom", 7), "playroom-3")
  ];
  var F2 = [
    room("2인실", "Twin rooms", S("room2", 6)),
    room("4인실", "Quad rooms", S("room4", 5)),
    room("독서실", "Reading room", S("reading", 10)),
    room("자습실", "Self-study room", S("study", 5, 3).concat("study-1", "study-2")),
    room("복도", "Hallway", S("hall2", 9), "hall2-6")
  ];
  // x·y = 바탕 사진 위 위치(%)
  var P = [
    { x: 30, y: 44, n: L("실내", "Indoor"), d: L("ㄱ자 건물 하나에 1층은 교실·식당, 2층은 기숙사·독서실이에요.", "One L-shaped building: classrooms and dining on the 1st floor, dorm rooms and reading room on the 2nd."),
      floors: [{ n: L("1층", "1st floor"), r: F1 }, { n: L("2층", "2nd floor"), r: F2 }] },
    { x: 49, y: 53, n: L("농구장", "Basketball court"), d: L("건물 바로 앞 야외 농구장", "Outdoor court right in front of the building"), p: ["drone-court"].concat(S("court", 10)) },
    { x: 66, y: 52, n: L("수영장", "Swimming pool"), d: L("교내 야외 수영장과 원형 풀", "On-campus outdoor pool with a round pool"), p: ["drone-pool-1", "drone-pool-2"].concat(S("pool", 11), "pool-15") },
    { x: 59, y: 40, n: L("쉼터", "Shaded rest area"), d: L("수영장 옆 지붕 덮인 쉼터", "Covered rest area next to the pool"), p: ["pool-12", "pool-13", "pool-14", "drone-shelter"] },
    { x: 55, y: 22, n: L("태양광 패널", "Solar panels"), d: L("건물 지붕의 태양광 패널", "Solar panels on the building roof"), p: ["drone-solar"] },
    { x: 22, y: 90, n: L("외관", "Exterior"), d: L("정문 쪽에서 본 건물", "The building seen from the front gate"), p: ["drone-front"].concat(S("outside", 11)) }
  ];
  function big(k) { return M + k + ".webp"; }
  function small(k) { return M + k + "-s.webp"; }
  function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }
  function btn(c, txt) { var b = el("button", c, txt); b.type = "button"; return b; }
  function reduce() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // 전환 버튼
  var sw = el("div", "cm-switch"); sw.setAttribute("role", "tablist");
  var bMap = btn("cm-tab", T.map), bList = btn("cm-tab", T.list);
  [bMap, bList].forEach(function (b) { b.setAttribute("role", "tab"); sw.appendChild(b); });

  // 지도
  var wrap = el("section", "cm"); wrap.id = "campus-map"; wrap.hidden = true;
  wrap.appendChild(el("p", "cm-lead", T.lead));
  var grid = el("div", "cm-grid"); wrap.appendChild(grid);
  var left = el("div", "cm-left"), map = el("div", "cm-map");
  var img = el("img"); img.alt = T.alt; img.width = 1600; img.height = 900; img.decoding = "async";
  img.src = M + "base-1600.webp"; img.srcset = M + "base-900.webp 900w, " + M + "base-1600.webp 1600w";
  img.sizes = "(max-width: 991px) 100vw, 60vw";
  map.appendChild(img); left.appendChild(map);
  var chips = el("div", "cm-chips"); left.appendChild(chips); grid.appendChild(left);
  var card = el("div", "cm-card"); grid.appendChild(card);

  var pins = [], chipBtns = [], cur = -1, floor = 0;
  P.forEach(function (p, i) {
    var b = btn("cm-pin"); b.style.left = p.x + "%"; b.style.top = p.y + "%";
    b.setAttribute("aria-label", (i + 1) + ". " + p.n);
    b.appendChild(el("i", "", String(i + 1))); b.appendChild(el("span", "", p.n));
    b.onclick = function () { show(i, true); }; map.appendChild(b); pins.push(b);
    var c = btn("cm-chip", (i + 1) + ". " + p.n); c.onclick = function () { show(i, true); }; chips.appendChild(c); chipBtns.push(c);
  });

  function tile(cover, name, sub, onClick) {
    var b = btn("cm-tile"), im = el("img"); im.src = small(cover); im.alt = ""; im.loading = "lazy"; im.decoding = "async";
    b.appendChild(im); var t = el("span", "cm-tile-t"); t.appendChild(el("b", "", name)); if (sub) t.appendChild(el("small", "", sub)); b.appendChild(t);
    b.setAttribute("aria-label", name + (sub ? ", " + sub : "")); b.onclick = onClick; return b;
  }
  function render() {
    var p = P[cur]; card.textContent = "";
    var head = el("div", "cm-head");
    head.appendChild(el("span", "cm-num", String(cur + 1))); head.appendChild(el("h2", "cm-title", p.n));
    card.appendChild(head); card.appendChild(el("p", "cm-desc", p.d));
    if (p.floors) {
      var ft = el("div", "cm-floors"); ft.setAttribute("role", "tablist");
      p.floors.forEach(function (f, k) {
        var b = btn("cm-floor" + (k === floor ? " on" : ""));
        b.setAttribute("role", "tab"); b.setAttribute("aria-selected", k === floor);
        b.appendChild(el("b", "", f.n + " · " + f.r.length + L("곳", " places")));
        var sm = el("small"); f.r.forEach(function (r, x) { sm.appendChild(el("span", "", r.n + (x < f.r.length - 1 ? "," : ""))); sm.appendChild(document.createTextNode(" ")); });
        b.appendChild(sm);
        b.onclick = function () { floor = k; render(); }; ft.appendChild(b);
      });
      card.appendChild(ft);
      card.appendChild(el("p", "cm-hint", T.tapRoom));
      var g = el("div", "cm-tiles"), fl = p.floors[floor];
      fl.r.forEach(function (r) { g.appendChild(tile(r.c, r.n, r.p.length + T.n, function () { viewer(r.p, 0, fl.n + " " + r.n); })); });
      card.appendChild(g);
    } else {
      card.appendChild(el("p", "cm-hint", p.p.length > 1 ? T.tapPhoto : ""));
      var g2 = el("div", "cm-thumbs" + (p.p.length === 1 ? " one" : ""));
      p.p.forEach(function (k, j) {
        var b = btn("cm-thumb"), im = el("img"); im.src = p.p.length === 1 ? big(k) : small(k); im.alt = p.n + " " + (j + 1); im.loading = j < 6 ? "eager" : "lazy"; im.decoding = "async";
        b.appendChild(im); b.onclick = function () { viewer(p.p, j, p.n); }; g2.appendChild(b);
      });
      card.appendChild(g2);
    }
  }
  function show(i, user) {
    if (i !== cur) floor = 0;
    cur = i; render();
    pins.forEach(function (b, j) { b.setAttribute("aria-pressed", i === j); });
    chipBtns.forEach(function (b, j) { b.setAttribute("aria-pressed", i === j); });
    if (user && window.innerWidth < 992) {
      var r = card.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.top < 60) card.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
    }
  }

  // 크게 보기
  var lb = el("div", "cm-lb"); lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
  var lbTop = el("div", "cm-lb-top"), lbName = el("div", "cm-lb-name"), lbCnt = el("div", "cm-lb-cnt"), lbX = btn("cm-lb-x");
  lbX.setAttribute("aria-label", T.close); lbTop.appendChild(lbName); lbTop.appendChild(lbCnt); lbTop.appendChild(lbX);
  var lbRail = el("div", "cm-lb-rail"), lbPrev = btn("cm-nav cm-prev"), lbNext = btn("cm-nav cm-next");
  lbPrev.setAttribute("aria-label", T.prev); lbNext.setAttribute("aria-label", T.next);
  lb.appendChild(lbTop); lb.appendChild(lbRail); lb.appendChild(lbPrev); lb.appendChild(lbNext);
  document.body.appendChild(lb);
  var lbList = [], lbOpen = false, lastFocus = null;
  function lbIdx() { return Math.round(lbRail.scrollLeft / Math.max(1, lbRail.clientWidth)); }
  function lbUpd() { var i = lbIdx(), ims = lbRail.querySelectorAll("img"); [i - 1, i + 1, i + 2].forEach(function (k) { if (ims[k]) ims[k].loading = "eager"; }); lbCnt.textContent = (i + 1) + " / " + lbList.length; lbPrev.disabled = i <= 0; lbNext.disabled = i >= lbList.length - 1; }
  function lbGo(d) { lbRail.scrollTo({ left: (lbIdx() + d) * lbRail.clientWidth, behavior: reduce() ? "auto" : "smooth" }); }
  function viewer(list, start, name) {
    lbList = list; lbRail.textContent = ""; lbName.textContent = name;
    list.forEach(function (k, j) {
      var f = el("figure"), im = el("img"); im.src = big(k); im.alt = name + " " + (j + 1); im.loading = Math.abs(j - start) < 2 ? "eager" : "lazy"; im.decoding = "async";
      f.appendChild(im); lbRail.appendChild(f);
    });
    lbPrev.hidden = lbNext.hidden = list.length < 2;
    lastFocus = document.activeElement; lb.hidden = false; lbOpen = true; document.documentElement.classList.add("cm-lock");
    lbRail.scrollLeft = start * lbRail.clientWidth; lbUpd(); lbX.focus();
    history.pushState({ cm: 1, lb: 1 }, "", location.href);
  }
  function lbClose(fromPop) {
    if (!lbOpen) return; lbOpen = false; lb.hidden = true; document.documentElement.classList.remove("cm-lock");
    if (lastFocus) lastFocus.focus({ preventScroll: true });
    if (!fromPop && history.state && history.state.lb) history.back();
  }
  lbRail.addEventListener("scroll", lbUpd, { passive: true });
  lbPrev.onclick = function () { lbGo(-1); }; lbNext.onclick = function () { lbGo(1); };
  lbX.onclick = function () { lbClose(false); };
  lb.addEventListener("click", function (e) { if (e.target.tagName === "FIGURE") lbClose(false); });
  document.addEventListener("keydown", function (e) {
    if (!lbOpen) return;
    if (e.key === "Escape") lbClose(false); else if (e.key === "ArrowLeft") lbGo(-1); else if (e.key === "ArrowRight") lbGo(1);
  });
  window.addEventListener("resize", function () { if (lbOpen) lbRail.scrollLeft = lbIdx() * lbRail.clientWidth; });

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
  window.addEventListener("popstate", function () {
    if (lbOpen) { lbClose(true); return; }  // 뒤로가기 = 크게 보기 닫기
    setView(location.hash === "#map" ? "map" : "list", false);
  });

  if (!ko) { sw.dir = wrap.dir = lb.dir = "ltr"; sw.lang = wrap.lang = lb.lang = "en"; }  // 번역 전 영어 문장이 아랍어 화면에서 뒤집히지 않게
  board.parentNode.insertBefore(sw, board);
  board.parentNode.insertBefore(wrap, board);
  setView(location.hash === "#map" ? "map" : "list", false);
})();
