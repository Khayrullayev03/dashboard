(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    window.GLITCH = { text() {}, block() {} };
    return;
  }

  const TEXT = [".title-text", ".sub-text", ".service-text h3", ".contact-value", ".brand-text", ".about-name", ".about-role-text", ".focus-title", ".tile-title"].join(", ");
  const BLOCK = ".term, .about-avatar, .skill-tile, .contact-art";
  const timers = new WeakMap();
  const lastHover = new WeakMap();

  function restart(node, cls, ms) {
    node.classList.remove("g-on", "g-hard", "g-block", "g-block-hard");
    void node.offsetWidth;
    node.classList.add(cls);
    clearTimeout(timers.get(node));
    timers.set(
      node,
      setTimeout(() => node.classList.remove(cls), ms)
    );
  }

  function text(node, strong) {
    if (!node) return;
    node.classList.add("glitch-text");
    node.dataset.text = node.textContent;
    restart(node, strong ? "g-hard" : "g-on", strong ? 640 : 380);
  }

  function block(node, strong) {
    if (!node) return;
    restart(node, strong ? "g-block-hard" : "g-block", strong ? 540 : 340);
  }

  const currentPage = () => document.querySelector("main [data-page]:not([hidden])");
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function inView(node) {
    const r = node.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
  }

  function visible(selector) {
    const page = currentPage();
    return page ? [...page.querySelectorAll(selector)].filter(inView) : [];
  }

  function tick() {
    const page = currentPage();
    if (!document.hidden && page) {
      const roll = Math.random();
      const brand = document.querySelector(".brand-text");
      if (page.dataset.page === "home" || roll < 0.16) {
        if (brand && inView(brand)) text(brand, Math.random() < 0.2);
      } else if (roll < 0.42) {
        const title = page.querySelector(".title-text");
        if (title && inView(title)) text(title, Math.random() < 0.35);
      } else if (roll < 0.78) {
        text(pick(visible(TEXT)));
      } else {
        block(pick(visible(BLOCK)));
      }
      if (Math.random() < 0.12) setTimeout(() => text(pick(visible(TEXT))), 140);
    }
    setTimeout(tick, 700 + Math.random() * 1500);
  }
  setTimeout(tick, 1200);

  document.addEventListener("pagechange", (event) => {
    if (event.detail === "home") return;
    const page = currentPage();
    if (!page) return;
    setTimeout(() => {
      text(page.querySelector(".title-text"), true);
      block(page.querySelector(".page-head"), true);
    }, 640);
    setTimeout(() => block(pick(visible(".term"))), 1100);
  });

  document.addEventListener("pointerover", (event) => {
    const node = event.target.closest && event.target.closest(TEXT);
    if (!node) return;
    const now = performance.now();
    if (now - (lastHover.get(node) || 0) < 700) return;
    lastHover.set(node, now);
    text(node);
  });

  window.GLITCH = { text, block };
})();
