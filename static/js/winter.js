// 겨울캠프 상담 신청: 쓰던 글은 새로고침해도 남고, 보내는 동안 버튼을 막고, 실패하면 이유를 보여 준다.
(function () {
  var f = document.getElementById("lead");
  if (!f) return;
  var KEY = "wc-draft", err = f.querySelector(".err"), btn = f.querySelector("button[type=submit]");
  try {
    var d = JSON.parse(localStorage.getItem(KEY) || "{}");
    Object.keys(d).forEach(function (k) {
      var el = f.elements[k];
      if (!el) return;
      if (el.length && el[0] && el[0].type === "radio") { [].forEach.call(el, function (r) { r.checked = r.value === d[k]; }); }
      else if (el.type === "checkbox") el.checked = !!d[k];
      else el.value = d[k];
    });
  } catch (e) {}
  function data() {
    var o = {};
    ["parent_name", "phone", "child_age", "child_name", "question", "website"].forEach(function (k) { o[k] = f.elements[k].value; });
    var lv = f.querySelector("input[name=english_level]:checked");
    o.english_level = lv ? lv.value : "";
    o.agree = f.elements.agree.checked;
    return o;
  }
  f.addEventListener("input", function () { try { var o = data(); delete o.website; localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} });
  function fail(m, el) { err.textContent = m; err.hidden = false; if (el) el.focus(); }
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    err.hidden = true;
    var o = data();
    if (!o.parent_name.trim()) return fail("학부모 성함을 적어 주세요.", f.elements.parent_name);
    if (!/^(\+?82|0)1\d{8,9}$/.test(o.phone.replace(/[^\d+]/g, ""))) return fail("휴대폰 번호를 다시 확인해 주세요. 예) 010-1234-5678", f.elements.phone);
    if (!o.child_age.trim()) return fail("아이 나이(학년)를 적어 주세요.", f.elements.child_age);
    if (!o.agree) return fail("개인정보 수집·이용에 동의해 주세요.", f.elements.agree);
    o.source = f.getAttribute("data-source");
    o.utm = location.search.slice(1, 300);
    btn.disabled = true; btn.textContent = "보내는 중…";
    // 신청 저장은 Cloudflare에 남아 있다(홈페이지는 서울 서버). text/plain 이라 브라우저 사전 확인 요청 없이 한 번에 간다.
    var API = /^(localhost|127\.)/.test(location.hostname) ? "/api/lead" : "https://jhasialink.pages.dev/api/lead";
    fetch(API, { method: "POST", headers: { "content-type": "text/plain;charset=UTF-8" }, body: JSON.stringify(o) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (r) {
        if (!r.ok) throw { msg: r.error };
        try { localStorage.removeItem(KEY); } catch (e) {}
        f.hidden = true;
        var done = f.parentNode.querySelector(".done");
        done.hidden = false;
        done.scrollIntoView({ block: "center" });
      })
      .catch(function (x) {
        fail((x && x.msg) || "보내지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요. 적은 내용은 그대로 남아 있어요.");
      })
      .then(function () { btn.disabled = false; btn.textContent = "상담 신청하기"; });
  });
})();

// 기간 계산: 과정·방을 고르면 날짜와 가격이 바로 바뀐다(스크립트가 없으면 위 가격표로 충분하다).
(function () {
  var pk = document.querySelector(".picker");
  if (!pk) return;
  var C = JSON.parse(pk.getAttribute("data-courses")), sp = pk.getAttribute("data-special") === "1";
  var cur = 2, room = 4;
  var won = function (n) { return (n / 10000).toLocaleString("ko-KR") + "만 원"; };
  function draw() {
    var c = C[cur], extra = room === 2 ? 150000 * (c.w / 2) : 0;
    var d = c.d.split(" ~ ");
    pk.querySelector(".pk-date").textContent = "2027. " + d[0] + " 출국 ~ " + d[1] + " 귀국";
    var pe = pk.querySelector(".pk-price"); pe.textContent = "";
    if (sp && c.p < c.r) { var o = document.createElement("s"); o.textContent = won(c.r + extra); pe.appendChild(o); pe.appendChild(document.createTextNode(" → ")); }
    pe.appendChild(document.createTextNode(won(c.p + extra)));
    pk.querySelector(".pk-note").textContent = (room === 2 ? "2인실(" + won(extra) + " 추가)" : "4인실") +
      (sp && c.p < c.r ? " · 정가 " + won(c.r + extra) + "에서 " + won(c.r - c.p) + " 할인" : "") +
      " · 왕복 항공료 별도 · 토요일 액티비티 " + c.a + "번(비용 별도)";
  }
  pk.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var grp = b.parentNode;
    [].forEach.call(grp.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    if (b.hasAttribute("data-i")) cur = +b.getAttribute("data-i"); else room = +b.getAttribute("data-room");
    draw();
  });
  draw();
})();

// 섹션 안 제목·글·사진이 차례로 살짝 올라온다(한 번만). 움직임 줄이기면 CSS가 끈다.
(function () {
  if (!("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js");
  var els = document.querySelectorAll(".ch > *, .cta > *");
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, i = [].indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(i, 4) * 70 + "ms";
      el.classList.add("in");
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  [].forEach.call(els, function (el) {
    var r = el.getBoundingClientRect();
    if (r.top < innerHeight) return; // 처음부터 보이는 것은 숨기지 않는다
    el.classList.add("rise");
    io.observe(el);
  });
})();
