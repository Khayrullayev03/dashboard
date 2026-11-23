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
  var nav = navigator;
  var saved = null;
  try {
    saved = localStorage.getItem("perf");
  } catch (e) {}
  var weak =
    (nav.deviceMemory && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) ||
    (nav.connection && nav.connection.saveData);
  root.dataset.perf = saved === "lite" || saved === "full" ? saved : weak ? "lite" : "full";
  if (saved) root.dataset.perfLocked = "1";
})(document.documentElement);
