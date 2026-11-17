// PC 상단 메뉴가 가운데 로고와 겹칠 만큼 좁으면(외국어 메뉴가 길 때) 폰처럼 ☰ 메뉴로 바꾼다.
(function () {
  var html = document.documentElement;
  // 넓은 화면일수록 메뉴 사이를 넓게: 로고와 안 겹치는 가장 넓은 간격을 고르고, 가장 좁게 해도 겹치면 ☰ 메뉴로.
  var GAPS = [2.6, 2.2, 1.8, 1.5, 1.2, 0.9, 0.6];
  function hits(logo, items) {
    var l = logo.getBoundingClientRect();
    return items.some(function (e) {
      var r = e.getBoundingClientRect();
      return r.width && r.right > l.left - 24 && r.left < l.right + 24;
    });
  }
  function fit() {
    html.classList.remove("nav-compact");
    var logo = document.querySelector(".container-nav > .logobox");
    var items = [].slice.call(document.querySelectorAll(".container-nav .navpc > *"));
    if (!logo || !items.length || !items[0].offsetParent) return;
    html.classList.remove("nav-tight");
    for (var i = 0; i < GAPS.length; i++) {
      html.style.setProperty("--navgap", GAPS[i] + "em");
      if (GAPS[i] <= 1.2) html.classList.add("nav-tight"); // 좁으면 세로줄로 구분(세로줄 폭까지 넣고 잰다)
      if (!hits(logo, items)) return;
    }
    html.classList.remove("nav-tight");
    html.classList.add("nav-compact");
  }
  fit();
  addEventListener("resize", fit);
  if (document.fonts) document.fonts.ready.then(fit);
  addEventListener("load", fit); // 글꼴·스타일이 늦게 들어와 메뉴 폭이 바뀌어도 다시 잰다
  setTimeout(fit, 1500);
})();

// 카카오톡 상담 버튼: 한국어 페이지 오른쪽 아래에 떠 있다(카카오 채널 1:1 채팅으로 바로 연결).
(function () {
  if ((document.documentElement.lang || "").slice(0, 2) !== "ko" || document.querySelector(".kakao-float")) return;
  var a = document.createElement("a");
  a.className = "kakao-float";
  a.href = "https://pf.kakao.com/_gxfLuX/chat";
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "카카오톡 상담");
  a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.5c-5 0-9 3.2-9 7.1 0 2.5 1.6 4.7 4.1 5.9l-1 3.7c-.1.3.3.6.6.4l4.4-2.9c.3 0 .6.1.9.1 5 0 9-3.2 9-7.2S17 3.5 12 3.5z"/></svg><span>카카오톡 상담</span>';
  var css = document.createElement("style");
  css.textContent = ".kakao-float{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:9999;display:flex;align-items:center;gap:8px;padding:12px 18px 12px 14px;border-radius:999px;background:#FEE500;color:#191919;font:700 15px/1 Pretendard,'Noto Sans KR',sans-serif;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.18)}"
    + ".kakao-float svg{width:22px;height:22px}.kakao-float:hover{filter:brightness(.96)}"
    + "@media (max-width:520px){.kakao-float span{display:none}.kakao-float{padding:14px}}"
    + "@media print{.kakao-float{display:none}}";
  document.head.appendChild(css);
  document.body.appendChild(a);
})();

// 캠퍼스 시설 칸(4인실·2인실 …)을 눌러 다른 시설로 넘어가도 보던 높이 그대로 열리게 한다(맨 위로 튀지 않게).
(function () {
  var K = "campusY";
  try {
    var y = sessionStorage.getItem(K);
    if (y !== null) {
      sessionStorage.removeItem(K);
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, +y);
      window.addEventListener("load", function () { window.scrollTo(0, +y); });
    }
  } catch (e) {}
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.menu-btn");
    if (a && /\/campus\//.test(a.getAttribute("href") || "")) {
      try { sessionStorage.setItem(K, String(window.scrollY)); } catch (er) {}
    }
  });
})();
