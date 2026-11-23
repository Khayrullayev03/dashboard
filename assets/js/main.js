(function () {
  "use strict";

  const data = window.PORTFOLIO;
  if (!data || !window.FX || !window.I18N) return;

  const { profile, contacts = [], skills = [], experience = [], certs = [] } = data;
  const { scramble, createAsciiArt, animate, easeInOut } = window.FX;
  const I18N = window.I18N;
  const { t, pick: L } = I18N;
  const SOUND = window.SOUND || { enabled: false, set() {}, key() {}, tick() {}, beep() {} };
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const LEVELS = { basic: 3, intermediate: 6, confident: 8, advanced: 9, expert: 10 };
  const PAGES = ["home", "services", "about", "info", "who", "contact"];
  const ALIASES = { office: "services", skills: "about", experience: "about", projects: "about", terminal: "info" };
  const resolvePage = (id) => (PAGES.includes(id) ? id : ALIASES[id] || null);
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const firstSkill = skills.find((s) => s.level === "advanced") || skills.find((s) => s.group === "admin") || skills[0];
  const state = { skill: firstSkill ? firstSkill.id : null, page: null };

  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "vars") for (const [name, v] of Object.entries(value)) node.style.setProperty(name, v);
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children.flat()) {
      if (child != null && child !== false) node.append(child);
    }
    return node;
  }

  const toastEl = $("[data-toast]");
  let toastTimer = 0;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = `[ ${message} ]`;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
  }

  function toggleMatrix() {
    if (!window.BG) return "contour";
    const mode = window.BG.toggleMatrix();
    toast(t(mode === "matrix" ? "toast.matrixOn" : "toast.matrixOff"));
    SOUND.beep();
    return mode;
  }

  const langButtons = $$("[data-lang]");
  const soundBtn = $("[data-sound-btn]");

  function syncControls() {
    langButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === I18N.lang)));
    soundBtn.setAttribute("aria-pressed", String(SOUND.enabled));
    soundBtn.setAttribute("aria-label", t(SOUND.enabled ? "ctrl.soundOff" : "ctrl.soundOn"));
  }

  langButtons.forEach((b) =>
    b.addEventListener("click", () => {
      SOUND.tick();
      I18N.set(b.dataset.lang);
    })
  );
  soundBtn.addEventListener("click", () => {
    SOUND.set(!SOUND.enabled);
    syncControls();
    toast(t(SOUND.enabled ? "toast.soundOn" : "toast.soundOff"));
  });
  document.addEventListener("soundchange", syncControls);

  const logoBox = $("[data-home-logo]");
  const logo = window.ASCII_LOGO ? createAsciiArt(logoBox, window.ASCII_LOGO) : null;
  if (logo) logo.show();

  const homePage = $('[data-page="home"]');
  let heroShown = false;

  function renderHero() {
    const [last, ...first] = L(profile.name).split(" ");
    $("[data-hero-name]").replaceChildren(el("span", { text: last }), el("span", { text: first.join(" ") }));
    $("[data-hero-role]").textContent = L(profile.role);
    $("[data-hero-tags]").replaceChildren(...(L(profile.tags) || []).map((tag) => el("li", { text: tag })));
    $("[data-hero-stat]").replaceChildren(
      el("span", {
        class: "stat-num",
        "data-count": data.clients || 0,
        "data-suffix": "+",
        text: `${data.clients || 0}+`,
      }),
      el("span", { class: "hero-stat-label", text: t("services.clients") })
    );
    const telegram = contacts.find((c) => c.label === "telegram");
    $("[data-hero-cta]").replaceChildren(
      ...[
        telegram &&
          el("a", {
            class: "cta-btn is-primary",
            href: telegram.href,
            target: "_blank",
            rel: "noopener",
            text: t("about.cta.tg"),
          }),
        el("a", { class: "cta-btn", href: "#services", text: t("hero.services") }),
      ].filter(Boolean)
    );
  }

  function playHeroText() {
    if (reduceMotion) return;
    $$("[data-hero-name] span").forEach((line, i) => {
      const text = line.textContent;
      line.textContent = "";
      setTimeout(() => scramble(line, text, 700), 520 + i * 160);
    });
    setTimeout(() => countUp(homePage), 900);
  }

  function showHero({ animate: withAnimation = true } = {}) {
    if (heroShown) return;
    heroShown = true;
    if (!withAnimation || reduceMotion) {
      homePage.classList.replace("is-intro", "is-hero");
      if (logo) logo.show();
      return;
    }
    if (logo) logo.show();
    const from = logoBox.getBoundingClientRect();
    homePage.classList.replace("is-intro", "is-hero");
    const to = logoBox.getBoundingClientRect();
    if (logo) logo.glitch(2.4);
    if (to.width > 0 && logoBox.animate) {
      logoBox.animate(
        [
          {
            transformOrigin: "top left",
            transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`,
          },
          { transformOrigin: "top left", transform: "none" },
        ],
        { duration: 1050, easing: "cubic-bezier(0.76, 0, 0.24, 1)" }
      );
    }
    SOUND.tick();
    playHeroText();
  }

  ["click", "keydown", "wheel", "touchstart"].forEach((type) =>
    window.addEventListener(type, () => state.page === "home" && showHero(), { passive: true })
  );

  const hardGlitch = () => logo && logo.glitch(2.4);
  logoBox.addEventListener("pointerenter", hardGlitch);
  logoBox.addEventListener("click", hardGlitch);

  if (logo && !reduceMotion) {
    (function schedule() {
      setTimeout(
        () => {
          if (!document.hidden && state.page === "home" && root.dataset.music !== "on")
            logo.glitch(Math.random() < 0.25 ? 2 : 0.7 + Math.random() * 0.6);
          schedule();
        },
        700 + Math.random() * 1500
      );
    })();
  }

  function renderProfile() {
    $$("[data-handle]").forEach((n) => (n.textContent = profile.handle || "user"));
    $("[data-footer]").replaceChildren(
      `© ${new Date().getFullYear()}`,
      el("span", { class: "footer-dot", text: " · " }),
      el("span", { class: "footer-handle", text: profile.handle || "" })
    );
    $("[data-name]").textContent = L(profile.name);
    $("[data-role]").textContent = L(profile.role);
    $("[data-about]").textContent = L(profile.about);

    const cta = $("[data-about-cta]");
    cta.textContent = "";
    [
      ["telegram", "about.cta.tg", "cta-btn is-primary"],
      ["email", "about.cta.mail", "cta-btn"],
    ].forEach(([label, key, cls]) => {
      const contact = contacts.find((c) => c.label === label);
      if (!contact) return;
      const external = contact.href.startsWith("http");
      cta.append(
        el("a", {
          class: cls,
          href: contact.href,
          target: external ? "_blank" : null,
          rel: external ? "noopener" : null,
          text: t(key),
        })
      );
    });

    const levels = data.skillLevels || [];
    const total = levels.reduce((n, g) => n + g.items.length, 0);
    const advanced = levels
      .filter((g) => g.level === "advanced" || g.level === "expert")
      .reduce((n, g) => n + g.items.length, 0);
    const telegram = contacts.find((c) => c.label === "telegram");
    const specs = [
      ["about.spec.role", L(profile.role)],
      ["about.spec.focus", L(profile.focusLine)],
      ["about.spec.country", L(profile.country)],
      ["about.spec.level", t("about.levelValue", { n: advanced, total })],
      telegram && ["about.spec.contact", telegram.value, telegram.href],
    ].filter((row) => row && row[1]);
    const specsRoot = $("[data-about-specs]");
    specsRoot.textContent = "";
    specs.forEach(([key, value, href]) =>
      specsRoot.append(
        el(
          "div",
          { class: "spec" },
          el("dt", { text: t(key) }),
          el("dd", null, href ? el("a", { href, target: "_blank", rel: "noopener", text: value }) : value)
        )
      )
    );

    const stats = [
      [total, "about.stat.skills"],
      [advanced, "about.stat.advanced"],
      [(data.focus || []).length, "about.stat.areas"],
      [(data.services || []).length, "about.stat.services"],
    ];
    const statsRoot = $("[data-about-stats]");
    statsRoot.textContent = "";
    stats.forEach(([n, key]) =>
      statsRoot.append(
        el(
          "div",
          { class: "stat" },
          el("span", { class: "stat-num", "data-count": n, text: String(n) }),
          el("span", { class: "stat-label", text: t(key) })
        )
      )
    );
  }

  function countUp(scope) {
    $$(".stat-num", scope).forEach((node) => {
      const target = Number(node.dataset.count) || 0;
      const suffix = node.dataset.suffix || "";
      animate(900, (time, p) => {
        node.textContent = String(Math.round(easeInOut(p) * target)).padStart(String(target).length, "0");
      }).then(() => (node.textContent = String(target) + suffix));
    });
  }

  function renderServicesStats() {
    const root = $("[data-services-stats]");
    if (!root) return;
    root.textContent = "";
    const stats = [
      [data.clients || 0, "+", "services.clients"],
      [(data.services || []).length, "", "services.count"],
    ];
    stats.forEach(([n, suffix, key]) =>
      root.append(
        el(
          "div",
          { class: "term stat-card" },
          el("span", { class: "stat-num", "data-count": n, "data-suffix": suffix, text: String(n) + suffix }),
          el("span", { class: "stat-label", text: t(key) })
        )
      )
    );
  }

  function renderFocus() {
    const list = $("[data-focus]");
    list.textContent = "";
    (data.focus || []).forEach((area, i) => {
      const icon =
        window.ICONS && window.ICONS.has("skill", area.icon)
          ? el("pre", { class: "asc focus-icon", "aria-hidden": "true" })
          : null;
      list.append(
        el(
          "li",
          { class: "focus-card term", "data-reveal": true },
          el(
            "div",
            { class: "term-bar", "aria-hidden": "true" },
            el("span", { text: `~/focus/${String(i + 1).padStart(2, "0")}` }),
            el("span", { class: "live", text: "●" })
          ),
          el(
            "div",
            { class: "focus-body" },
            icon && el("div", { class: "focus-art" }, icon),
            el("h4", { class: "focus-title", text: L(area.title) }),
            el(
              "ul",
              { class: "points focus-points" },
              (L(area.items) || []).map((item) => el("li", { text: item }))
            )
          )
        )
      );
      if (icon) window.ICONS.skill(icon, area.icon);
    });
  }

  function renderSkillLevels() {
    const root = $("[data-skill-levels]");
    const groups = data.skillLevels || [];
    root.textContent = "";
    let total = 0;
    groups.forEach((group) => {
      const score = LEVELS[group.level] || 5;
      const names = group.items.map((item) => L(item));
      total += names.length;
      const chips = names.map((name, i) => {
        const chip = el("li", { class: "skill-chip", vars: { "--i": i } }, name);
        chip.addEventListener("pointerenter", () => scramble(chip, name, 380));
        return chip;
      });
      root.append(
        el(
          "div",
          { class: "level-group" },
          el(
            "p",
            { class: "level-head" },
            el("span", { class: "level-name", text: t("skills.levelTitle", { level: t("level." + group.level) }) }),
            el(
              "span",
              { class: "meter-bar", "aria-hidden": "true" },
              "[",
              el("span", { class: "meter-fill", text: "█".repeat(score) }),
              el("span", { class: "meter-empty", text: "░".repeat(10 - score) }),
              "]"
            ),
            el("span", { class: "level-count", text: String(names.length) })
          ),
          el("ul", { class: "skill-chips" }, chips)
        )
      );
    });
    $("[data-skill-count]").textContent = `${total} ${t("skills.total")}`;
  }

  const servicesRoot = $("[data-services]");
  const officeBlock = $("[data-office]");
  const servicePlayers = new Map();

  function renderServices() {
    servicePlayers.forEach((p) => p.stop());
    servicePlayers.clear();
    if (officeBlock) officeBlock.remove();
    servicesRoot.textContent = "";
    (data.services || []).forEach((service, i) => {
      const num = String(i + 1).padStart(2, "0");
      const text = el(
        "div",
        { class: "service-text" },
        el("span", { class: "service-num", text: num }),
        el("h3", { text: L(service.title) }),
        el("p", { class: "service-desc", text: L(service.desc) }),
        el(
          "ul",
          { class: "points" },
          (L(service.points) || []).map((p) => el("li", { text: p }))
        )
      );
      let art = null;
      if (service.scene && window.SCENES) {
        const pre = el("pre", { class: "scene-pre asc" });
        const player = window.SCENES.createPlayer(pre, service.scene);
        servicePlayers.set(service.id, player);
        const toggle = el("button", { class: "anim-toggle", type: "button" });
        const syncToggle = () => {
          toggle.textContent = `[ ${t(player.paused ? "anim.play" : "anim.pause")} ]`;
          toggle.setAttribute("aria-pressed", String(!player.paused));
        };
        toggle.addEventListener("click", () => {
          player.setPaused(!player.paused);
          syncToggle();
          syncServiceScenes();
        });
        syncToggle();
        art = el(
          "div",
          { class: "service-art" },
          el("div", { class: "term-bar" }, el("span", { text: `$ ./${service.id}.sh` }), toggle),
          el("div", { class: "scene-screen", "aria-hidden": "true" }, pre)
        );
      }
      const row = el(
        "article",
        {
          class: `service term${service.feature ? " service-feature" : ""}${i % 2 ? " is-flipped" : ""}`,
          "data-reveal": true,
          "data-service": service.id,
        },
        el(
          "div",
          { class: "term-bar", "aria-hidden": "true" },
          el("span", { text: `~/services/${num}-${service.id}` }),
          el("span", { class: "live", text: "●" })
        ),
        el("div", { class: "service-body" }, art, text)
      );
      if (service.feature === "office" && officeBlock) row.append(officeBlock);
      if (service.feature === "voip" && window.VOIP) row.append(window.VOIP.create());
      if (service.feature === "secure" && window.SECURE) row.append(window.SECURE.create());
      servicesRoot.append(row);
    });
    observeServices();
  }

  const visibleServices = new Set();
  let servicesObserver = null;
  function observeServices() {
    if (!("IntersectionObserver" in window)) return;
    if (servicesObserver) servicesObserver.disconnect();
    visibleServices.clear();
    servicesObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.dataset.service;
        if (entry.isIntersecting) visibleServices.add(id);
        else visibleServices.delete(id);
      });
      syncServiceScenes();
    });
    $$("[data-service]", servicesRoot).forEach((node) => servicesObserver.observe(node));
  }
  function syncServiceScenes() {
    servicePlayers.forEach((player, id) => {
      if (visibleServices.has(id) && !document.hidden && state.page === "services") player.start();
      else player.stop();
    });
  }
  document.addEventListener("visibilitychange", syncServiceScenes);

  const tabsRoot = $("[data-tabs]");
  const panelsRoot = $("[data-panels]");
  let tabs = [];
  let panels = [];
  const players = new Map();
  let panelsVisible = false;

  function buildPanel(skill) {
    const title = L(skill.title);
    const score = LEVELS[skill.level] || 5;
    const lines = skill.snippet ? skill.snippet.split("\n").length : 1;
    const scenePre = el("pre", { class: "scene-pre asc" });
    const player = window.SCENES ? window.SCENES.createPlayer(scenePre, skill.id) : null;
    const toggle = el("button", { class: "anim-toggle", type: "button" });
    const syncToggle = () => {
      if (!player) return;
      toggle.textContent = `[ ${t(player.paused ? "anim.play" : "anim.pause")} ]`;
      toggle.setAttribute("aria-pressed", String(!player.paused));
    };
    toggle.addEventListener("click", () => {
      if (!player) return;
      player.setPaused(!player.paused);
      syncToggle();
      syncScenes();
    });
    syncToggle();

    const panel = el(
      "div",
      {
        class: "panel term",
        role: "tabpanel",
        id: `panel-${skill.id}`,
        "aria-labelledby": `tab-${skill.id}`,
        tabindex: "0",
        hidden: true,
        "data-score": score,
        vars: { "--lines": lines },
      },
      el(
        "div",
        { class: "term-bar", "aria-hidden": "true" },
        el("span", { text: `~/skills/${skill.id}` }),
        el("span", { text: "─ □ ×" })
      ),
      el(
        "div",
        { class: "panel-inner" },
        el(
          "div",
          { class: "panel-head" },
          el(
            "div",
            { class: "panel-title" },
            el("h3", { text: title, "aria-label": title }),
            skill.summary && el("p", { class: "panel-summary", text: L(skill.summary) })
          ),
          skill.level &&
            el(
              "span",
              { class: "meter", "aria-label": `${t("skills.level")}: ${t("level." + skill.level)}` },
              el(
                "span",
                { class: "meter-bar", "aria-hidden": "true" },
                "[",
                el("span", { class: "meter-fill", text: "█".repeat(score) }),
                el("span", { class: "meter-empty", text: "░".repeat(10 - score) }),
                "]"
              ),
              el("span", { class: "meter-label", text: t("level." + skill.level) })
            )
        ),
        el(
          "div",
          { class: "panel-body" },
          el(
            "div",
            { class: "panel-points" },
            el("h4", { text: t("skills.canDo") }),
            el(
              "ul",
              { class: "points" },
              (L(skill.points) || []).map((p) => el("li", { text: p }))
            )
          ),
          el(
            "div",
            { class: "scene term" },
            el("div", { class: "term-bar" }, el("span", { text: `$ ./demo --${skill.id}` }), player && toggle),
            el("div", { class: "scene-screen", "aria-hidden": "true" }, scenePre)
          ),
          skill.snippet &&
            el(
              "div",
              { class: "snippet" },
              el("h4", { text: `$ cat ${skill.file || "example.txt"}` }),
              el("pre", null, el("code", { text: skill.snippet }))
            )
        )
      )
    );
    if (player) players.set(skill.id, player);
    return panel;
  }

  function renderSkills() {
    players.forEach((p) => p.stop());
    players.clear();
    tabsRoot.textContent = "";
    panelsRoot.textContent = "";
    tabsRoot.setAttribute("aria-label", t("skills.title"));
    tabs = [];
    [
      ["admin", "skills.admin"],
      ["web", "skills.web"],
    ].forEach(([group, key]) => {
      const items = skills
        .filter((s) => (s.group || "web") === group)
        .sort((a, b) => (LEVELS[b.level] || 5) - (LEVELS[a.level] || 5));
      if (!items.length) return;
      const row = el(
        "div",
        { class: "tab-group", role: "presentation" },
        el("span", { class: "tab-group-label", text: t(key), "aria-hidden": "true" })
      );
      items.forEach((skill) => {
        const score = LEVELS[skill.level] || 5;
        const icon =
          window.ICONS && window.ICONS.has("skill", skill.id)
            ? el("pre", { class: "asc skill-icon", "aria-hidden": "true" })
            : null;
        const tab = el(
          "button",
          {
            class: "tab skill-tile",
            type: "button",
            role: "tab",
            id: `tab-${skill.id}`,
            "aria-controls": `panel-${skill.id}`,
            "aria-selected": "false",
            tabindex: "-1",
            "data-skill": skill.id,
            onclick: () => {
              SOUND.tick();
              selectSkill(skill.id, { animate: true });
            },
          },
          icon,
          el("span", { class: "tile-title", text: L(skill.title) }),
          el(
            "span",
            { class: "tile-meter", "aria-hidden": "true" },
            el("span", { class: "meter-fill", text: "█".repeat(score) }),
            el("span", { class: "meter-empty", text: "░".repeat(10 - score) })
          )
        );
        if (icon) window.ICONS.skill(icon, skill.id);
        tabs.push(tab);
        row.append(tab);
      });
      tabsRoot.append(row);
    });
    panels = tabs.map((tab) => buildPanel(skillById.get(tab.dataset.skill)));
    panelsRoot.append(...panels);
    if (state.skill) selectSkill(state.skill);
  }

  function animateMeter(panel) {
    const fill = $(".meter-fill", panel);
    const empty = $(".meter-empty", panel);
    if (!fill || reduceMotion) return;
    const score = Number(panel.dataset.score);
    let n = 0;
    (function step() {
      fill.textContent = "█".repeat(n);
      empty.textContent = "░".repeat(10 - n);
      if (n++ < score) setTimeout(step, 45);
    })();
  }

  function animatePanel(panel) {
    if (reduceMotion || !panel) return;
    panel.classList.remove("is-drawing");
    void panel.offsetWidth;
    panel.classList.add("is-drawing");
    const title = $("h3", panel);
    scramble(title, title.getAttribute("aria-label"), 450);
    animateMeter(panel);
  }

  function syncScenes() {
    players.forEach((player, id) => {
      if (id === state.skill && panelsVisible && !document.hidden) player.start();
      else player.stop();
    });
  }

  function selectSkill(id, { focus = false, animate = false } = {}) {
    if (!skillById.has(id)) return;
    state.skill = id;
    tabs.forEach((tab, i) => {
      const active = tab.dataset.skill === id;
      const wasActive = !panels[i].hidden;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
      if (active && focus) tab.focus();
      if (active && animate && !wasActive) animatePanel(panels[i]);
    });
    syncScenes();
  }

  tabsRoot.addEventListener("keydown", (event) => {
    const current = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    const last = tabs.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    SOUND.tick();
    selectSkill(tabs[next].dataset.skill, { focus: true, animate: true });
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      panelsVisible = entries[entries.length - 1].isIntersecting;
      syncScenes();
    }).observe(panelsRoot);
  }
  document.addEventListener("visibilitychange", syncScenes);

  function renderExperience() {
    const section = $("[data-exp-section]");
    if (section) {
      section.hidden = !experience.length && !certs.length;
      $(".log", section).hidden = !experience.length;
      $(".certs", section).hidden = !certs.length;
    }
    const list = $("[data-experience]");
    list.textContent = "";
    experience.forEach((job) =>
      list.append(
        el(
          "li",
          { class: "log-entry" },
          el("span", { class: "log-time", text: `[${L(job.period)}]` }),
          el(
            "div",
            { class: "log-body" },
            el(
              "p",
              { class: "log-head" },
              el("span", { class: "log-company", text: L(job.company) }),
              el("span", { class: "dim", text: " · " }),
              el("span", { class: "log-role", text: L(job.role) })
            ),
            el(
              "ul",
              { class: "log-points" },
              (L(job.points) || []).map((p) => el("li", { text: p }))
            )
          )
        )
      )
    );
    const certList = $("[data-certs]");
    certList.textContent = "";
    certs.forEach((c) =>
      certList.append(
        el(
          "li",
          null,
          el("span", { class: "cert-year", text: `[${c.year}]` }),
          " ",
          el("span", { class: "cert-name", text: L(c.name) }),
          el("span", { class: "cert-issuer", text: " — " + L(c.issuer) })
        )
      )
    );
  }

  function renderContacts() {
    const list = $("[data-contacts]");
    list.textContent = "";
    contacts.forEach((c) => {
      const external = c.href.startsWith("http");
      const art =
        window.ICONS && window.ICONS.has("contact", c.label)
          ? el("pre", { class: "asc contact-icon", "aria-hidden": "true" })
          : null;
      list.append(
        el(
          "li",
          { class: "contact-card term", "data-reveal": true },
          el(
            "div",
            { class: "term-bar", "aria-hidden": "true" },
            el("span", { text: `~/contacts/${c.label}` }),
            el("span", { class: "live", text: "●" })
          ),
          el(
            "a",
            { class: "contact", href: c.href, target: external ? "_blank" : null, rel: external ? "noopener" : null },
            art && el("div", { class: "contact-art" }, art),
            el("span", { class: "contact-key", text: c.label }),
            el("span", { class: "contact-value", text: c.value })
          )
        )
      );
      if (art) window.ICONS.contact(art, c.label);
    });
  }

  const navLinks = $$(".nav a");
  const brandPath = $("[data-brand-path]");

  function enterAnimations(page) {
    $$("[data-reveal]", page).forEach((node, i) => {
      node.classList.remove("in");
      void node.offsetWidth;
      node.style.setProperty("--delay", `${Math.min(i, 10) * 60}ms`);
      node.classList.add("in");
    });
    const title = $(".title-text", page);
    if (title) scramble(title, title.textContent, 600);
    if (page.dataset.page === "about") {
      animatePanel(panels.find((p) => !p.hidden));
      countUp(page);
    }
    if (page.dataset.page === "services") countUp(page);
  }

  let lastPointer = null;
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest && event.target.closest('a[href^="#"]'))
        lastPointer = { x: event.clientX, y: event.clientY };
    },
    { passive: true }
  );

  function showPage(id, { animate: withAnimation = true } = {}) {
    id = resolvePage(id) || "home";
    if (id === state.page) return;
    if (withAnimation && state.page && window.TRANSITION && !reduceMotion) {
      const origin = lastPointer || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      lastPointer = null;
      SOUND.tick();
      window.TRANSITION.run(origin, id, () => applyPage(id, true));
      return;
    }
    applyPage(id, withAnimation);
  }

  function applyPage(id, withAnimation) {
    if (id === state.page) return;
    ensurePage(id);
    const next = $(`[data-page="${id}"]`);
    $$("main [data-page]").forEach((page) => (page.hidden = page !== next));
    state.page = id;
    root.dataset.view = id;
    window.scrollTo({ top: 0, behavior: "instant" });
    navLinks.forEach((a) => {
      if (a.getAttribute("href") === `#${id}`) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (brandPath) brandPath.textContent = id === "home" ? "~" : `~/${id}`;
    if (window.BG) window.BG.setScene(id === "home" ? "home" : "page");

    if (id === "home") {
      if (logo && withAnimation) logo.decode(1000);
      if (heroShown && withAnimation) playHeroText();
    } else if (withAnimation && !reduceMotion) {
      enterAnimations(next);
    }
    if (withAnimation && !reduceMotion) {
      next.classList.remove("page-enter");
      void next.offsetWidth;
      next.classList.add("page-enter");
    }
    syncServiceScenes();
    document.dispatchEvent(new CustomEvent("pagechange", { detail: id }));
  }

  function goTo(id) {
    const target = id === "top" ? "home" : resolvePage(id) || "home";
    if (`#${target}` === location.hash) showPage(target);
    else location.hash = target;
  }

  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (id === "" || resolvePage(id)) showPage(id || "home");
  });

  const KONAMI = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konami = 0;
  document.addEventListener("keydown", (event) => {
    if (event.target.closest && event.target.closest("input, textarea")) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    konami = key === KONAMI[konami] ? konami + 1 : key === KONAMI[0] ? 1 : 0;
    if (konami === KONAMI.length) {
      konami = 0;
      toggleMatrix();
    }
  });

  const PAGE_RENDER = {
    services: [renderServicesStats, renderServices],
    about: [renderFocus, renderSkillLevels, renderSkills, renderExperience],
    contact: [renderContacts],
  };
  const rendered = new Set();

  function ensurePage(id) {
    if (rendered.has(id)) return;
    rendered.add(id);
    (PAGE_RENDER[id] || []).forEach((render) => render());
  }

  function renderAll() {
    renderProfile();
    renderHero();
    rendered.forEach((id) => (PAGE_RENDER[id] || []).forEach((render) => render()));
    syncControls();
  }
  renderAll();

  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  setTimeout(
    () => ["services", "about", "contact"].forEach((id, i) => setTimeout(() => idle(() => ensurePage(id)), i * 800)),
    6000
  );
  document.addEventListener("langchange", () => {
    renderAll();
    if (window.ICONS) window.ICONS.prune();
    toast(I18N.lang.toUpperCase());
  });

  const perfBtn = $("[data-perf-toggle]");
  const isLite = () => root.dataset.perf === "lite";

  function syncPerf() {
    if (!perfBtn) return;
    perfBtn.textContent = `[ ${t(isLite() ? "perf.lite" : "perf.full")} ]`;
    perfBtn.setAttribute("aria-pressed", String(isLite()));
  }

  function setPerf(mode, auto) {
    if (root.dataset.perf === mode) return;
    root.dataset.perf = mode;
    try {
      localStorage.setItem("perf", mode);
    } catch (e) {}
    if (!auto) root.dataset.perfLocked = "1";
    syncPerf();
    document.dispatchEvent(new CustomEvent("perfchange", { detail: mode }));
    toast(t(mode === "full" ? "perf.fullOn" : auto ? "perf.autoLite" : "perf.liteOn"));
  }

  function watchFrames() {
    if (reduceMotion || isLite() || root.dataset.perfLocked) return;
    let start = 0;
    let prev = 0;
    let frames = 0;
    let slow = 0;
    let bad = 0;
    let windows = 0;
    const tick = (now) => {
      if (isLite() || root.dataset.perfLocked) return;
      if (document.hidden || (window.TRANSITION && window.TRANSITION.busy)) {
        start = 0;
        requestAnimationFrame(tick);
        return;
      }
      if (!start) {
        start = prev = now;
        frames = slow = 0;
      } else {
        if (now - prev > 34) slow++;
        prev = now;
        frames++;
      }
      if (now - start >= 2000) {
        const fps = (frames * 1000) / (now - start);
        bad = fps < 38 || slow > frames * 0.25 ? bad + 1 : 0;
        start = 0;
        windows++;
        if (bad >= 3) return setPerf("lite", true);
        if (windows > 60 && !bad) return;
      }
      requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 2500);
  }

  if (perfBtn) perfBtn.addEventListener("click", () => setPerf(isLite() ? "full" : "lite"));
  document.addEventListener("langchange", syncPerf);
  syncPerf();
  watchFrames();

  window.APP = {
    logoGlitch(strength, ms) {
      if (logo && state.page === "home" && !document.hidden) logo.glitch(strength, ms);
    },
    selectSkill(id) {
      goTo("about");
      selectSkill(id, { animate: true });
    },
    goTo,
    toast,
    toggleMatrix,
    home() {
      goTo("home");
      if (logo && state.page === "home") logo.decode(1200);
    },
  };

  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    let pending = null;
    let frame = 0;
    document.addEventListener(
      "pointermove",
      (event) => {
        pending = event;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (isLite()) return;
          const card = pending.target.closest && pending.target.closest(".term, .skill-tile");
          if (!card) return;
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${(((pending.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
          card.style.setProperty("--my", `${(((pending.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
        });
      },
      { passive: true }
    );
  }

  const startId = location.hash.slice(1);
  showPage(resolvePage(startId) || "home", { animate: false });
  if (state.page === "home" && logo && !reduceMotion) {
    logo.clear();
    setTimeout(
      () =>
        logo
          .decode(1600)
          .then(() => new Promise((done) => setTimeout(done, 700)))
          .then(() => showHero()),
      200
    );
  } else {
    showHero({ animate: false });
  }
})();
