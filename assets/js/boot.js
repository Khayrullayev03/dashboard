(function (root) {
  "use strict";

  var HOME = "https://khayrullayev03.github.io/dashboard/";
  var HOSTS = ["khayrullayev03.github.io", "localhost", "127.0.0.1"];
  var own = location.protocol === "file:" || HOSTS.indexOf(location.hostname) !== -1;
  if (!own) {
    location.replace(HOME + location.hash);
    return;
  }

  if (window.top !== window.self) {
    root.classList.add("is-framed");
    try {
      window.top.location.replace(location.href);
    } catch (e) {}
  }

  root.classList.add("js");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  var nav = navigator;
  var saved = null;
  try {
    saved = localStorage.getItem("perf");
  } catch (e) {}
  var weak =
    (nav.deviceMemory && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) ||
    (nav.connection && nav.connection.saveData);
  // No hardware GPU (blocked driver, VM, remote desktop): WebGL and blur run on the CPU.
  var SOFT = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic|mesa offscreen/i;
  function noGpu() {
    try {
      var gl = document.createElement("canvas").getContext("webgl", { failIfMajorPerformanceCaveat: true });
      if (!gl) return true;
      var info = gl.getExtension("WEBGL_debug_renderer_info");
      var name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
      var lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
      return SOFT.test(name);
    } catch (e) {
      return true;
    }
  }
  if (!weak && saved !== "lite" && saved !== "full") weak = noGpu();
  root.dataset.perf = saved === "lite" || saved === "full" ? saved : weak ? "lite" : "full";
  if (saved) root.dataset.perfLocked = "1";

  // Copy protection for ordinary visitors. The text is still in the page source,
  // so this only stops selecting, copying, saving and printing from the page itself.
  var ALLOW = "input, textarea, select, [contenteditable], .allow-copy";
  var SIGN = "\u00a9 Anvarjon Khayrullayev \u2014 " + HOME;
  function node(t) {
    return t && t.nodeType !== 1 ? t.parentElement : t;
  }
  function free(t) {
    t = node(t);
    return Boolean(t && t.closest && t.closest(ALLOW));
  }
  document.addEventListener("copy", function (e) {
    if (free(e.target)) return;
    e.preventDefault();
    if (e.clipboardData) e.clipboardData.setData("text/plain", SIGN);
  });
  ["cut", "selectstart", "dragstart"].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (!free(e.target)) e.preventDefault();
    });
  });
  document.addEventListener("contextmenu", function (e) {
    var t = node(e.target);
    if (free(t) || (t && t.closest && t.closest("a[href]"))) return;
    e.preventDefault();
  });
  document.addEventListener(
    "keydown",
    function (e) {
      var k = (e.key || "").toLowerCase();
      var mod = e.ctrlKey || e.metaKey;
      var devtools = k === "f12" || (mod && e.shiftKey && (k === "i" || k === "j" || k === "c"));
      var grab = mod && !e.shiftKey && !e.altKey && "cxasup".indexOf(k) !== -1 && k.length === 1 && !free(e.target);
      if (devtools || grab) e.preventDefault();
    },
    true
  );
})(document.documentElement);
