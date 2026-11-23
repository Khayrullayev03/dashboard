(function () {
  "use strict";

  const I18N = window.I18N;
  if (!I18N) return;
  const { t } = I18N;
  const cfg = window.SITE_CONFIG || {};
  const enabled = Boolean(cfg.supabaseUrl && cfg.supabaseKey);
  const base = enabled ? cfg.supabaseUrl.replace(/\/+$/, "") : "";

  const store = {
    get(area, key) {
      try {
        return window[area].getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(area, key, value) {
      try {
        window[area].setItem(key, value);
      } catch (e) {}
    },
  };

  function request(path, body, prefer) {
    const headers = { apikey: cfg.supabaseKey, "Content-Type": "application/json" };
    if (cfg.supabaseKey.startsWith("eyJ")) headers.Authorization = `Bearer ${cfg.supabaseKey}`;
    if (prefer) headers.Prefer = prefer;
    return fetch(`${base}/rest/v1/${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body || {}),
      keepalive: true,
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return prefer ? null : res.json();
    });
  }

  const SOURCES = {
    telegram: "Telegram",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    vk: "VK",
    x: "X",
    github: "GitHub",
    whatsapp: "WhatsApp",
    google: "Google",
    yandex: "Yandex",
    bing: "Bing",
    hh: "hh",
  };

  const HOSTS = [
    [/(^|\.)t\.me$|telegram\.org$/, "telegram"],
    [/instagram\.com$/, "instagram"],
    [/facebook\.com$|(^|\.)fb\.com$/, "facebook"],
    [/youtube\.com$|youtu\.be$/, "youtube"],
    [/tiktok\.com$/, "tiktok"],
    [/linkedin\.com$|lnkd\.in$/, "linkedin"],
    [/(^|\.)vk\.com$/, "vk"],
    [/(^|\.)x\.com$|twitter\.com$|(^|\.)t\.co$/, "x"],
    [/github\.com$/, "github"],
    [/whatsapp\.com$|(^|\.)wa\.me$/, "whatsapp"],
    [/(^|\.)google\./, "google"],
    [/(^|\.)yandex\./, "yandex"],
    [/bing\.com$/, "bing"],
    [/(^|\.)hh\.(uz|ru|kz)$/, "hh"],
  ];

  function detectSource() {
    const saved = store.get("sessionStorage", "src");
    if (saved) return saved;
    const params = new URLSearchParams(location.search);
    let src = (params.get("from") || params.get("utm_source") || "")
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "")
      .slice(0, 32);
    if (!src) {
      const ua = navigator.userAgent;
      if (/Instagram/i.test(ua)) src = "instagram";
      else if (/FBAN|FBAV|FB_IAB/i.test(ua)) src = "facebook";
      else if (/Telegram/i.test(ua)) src = "telegram";
    }
    if (!src && document.referrer) {
      let host = "";
      try {
        host = new URL(document.referrer).hostname.replace(/^www\./, "");
      } catch (e) {}
      if (host && host !== location.hostname) {
        const hit = HOSTS.find(([re]) => re.test(host));
        src = hit ? hit[1] : "other";
      }
    }
    src = src || "direct";
    store.set("sessionStorage", "src", src);
    return src;
  }

  function device() {
    const ua = navigator.userAgent;
    if (/iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "tablet";
    if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
    return "desktop";
  }

  function place() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      return tz.split("/").pop().replace(/_/g, " ").slice(0, 64);
    } catch (e) {
      return "";
    }
  }

  const sourceName = (id) => SOURCES[id] || (id === "direct" ? t("who.direct") : id === "other" ? t("who.other") : id);
  const pageName = (id) => t(id === "home" ? "nav.main" : `nav.${id}`);

  function track(page) {
    if (!enabled) return;
    const seen = new Set((store.get("sessionStorage", "seen") || "").split(",").filter(Boolean));
    if (seen.has(page)) return;
    seen.add(page);
    store.set("sessionStorage", "seen", [...seen].join(","));
    request(
      "visits",
      { page, source: detectSource(), place: place(), device: device(), lang: I18N.lang },
      "return=minimal"
    ).catch(() => {});
  }

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  function meter(share) {
    const n = Math.round(share * 20);
    const bar = el("span", "meter-bar");
    bar.append("[", el("span", "meter-fill", "█".repeat(n)), el("span", "meter-empty", "░".repeat(20 - n)), "]");
    return bar;
  }

  function ago(iso) {
    const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (min < 1) return t("who.now");
    if (min < 60) return t("who.min", { n: min });
    if (min < 1440) return t("who.hour", { n: Math.round(min / 60) });
    return t("who.day", { n: Math.round(min / 1440) });
  }

  const whoRoot = document.querySelector("[data-who]");
  const whoLink = document.querySelector('.nav a[href="#who"]');
  let summary = null;
  let failed = false;
  let timer = 0;

  function panel(title, label, body) {
    const box = el("div", "term who-panel");
    const bar = el("div", "term-bar");
    bar.append(el("span", null, title), el("span", null, label));
    box.append(bar, body);
    return box;
  }

  function bars(rows, total, name) {
    const list = el("ul", "who-bars");
    rows.forEach((row) => {
      const share = total ? row.n / total : 0;
      const li = el("li", "who-bar");
      li.append(
        el("span", "who-bar-name", name(row)),
        meter(share),
        el("span", "who-bar-val", `${Math.round(share * 100)}% · ${row.n}`)
      );
      list.append(li);
    });
    return list;
  }

  function renderWho() {
    if (!whoRoot) return;
    whoRoot.textContent = "";
    if (!enabled || failed || !summary) {
      whoRoot.append(el("p", "who-note", !enabled ? t("who.off") : failed ? t("who.error") : t("who.loading")));
      return;
    }
    const total = summary.total || 0;
    const sources = summary.sources || [];
    const top = sources[0];

    const stats = el("div", "services-stats who-stats");
    [
      [String(total), t("who.total")],
      [String(summary.today || 0), t("who.today")],
      [top ? sourceName(top.source) : "—", t("who.top")],
    ].forEach(([value, label]) => {
      const card = el("div", "term stat-card");
      card.append(el("span", "stat-num", value), el("span", "stat-label", label));
      stats.append(card);
    });
    whoRoot.append(stats);

    if (!total) {
      whoRoot.append(el("p", "who-note", t("who.empty")));
      return;
    }

    const grid = el("div", "who-grid");
    grid.append(
      panel(
        "~/who/sources",
        t("who.sources"),
        bars(sources, total, (r) => sourceName(r.source))
      ),
      panel(
        "~/who/pages",
        t("who.pages"),
        bars(summary.pages || [], total, (r) => pageName(r.page))
      )
    );
    whoRoot.append(grid);

    const feed = el("ol", "who-feed");
    (summary.recent || []).forEach((v) => {
      const li = el("li", "who-row");
      li.append(
        el("span", "who-time", ago(v.created_at)),
        el("span", "who-src", sourceName(v.source)),
        el("span", "who-meta", [v.place, t(`who.${v.device}`)].filter(Boolean).join(" · ")),
        el("span", "who-page", `→ ${pageName(v.page)}`)
      );
      feed.append(li);
    });
    const live = el("span", "live", "● live");
    const recent = panel("~/who/live", "", feed);
    recent.querySelector(".term-bar span:last-child").replaceWith(live);
    recent.classList.add("who-recent");
    whoRoot.append(recent, el("p", "who-note", t("who.note")));
  }

  function loadWho() {
    if (!enabled) return renderWho();
    request("rpc/visit_summary")
      .then((data) => {
        summary = data;
        failed = false;
      })
      .catch(() => {
        failed = true;
      })
      .then(renderWho);
  }

  const ratingRoot = document.querySelector("[data-rating]");
  const starsRoot = document.querySelector("[data-stars]");
  const avgEl = document.querySelector("[data-rating-avg]");
  const countEl = document.querySelector("[data-rating-count]");
  const distRoot = document.querySelector("[data-rating-dist]");
  const msgEl = document.querySelector("[data-rating-msg]");
  const STAR =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L2.9 9.4l6.3-.9z"/></svg>';
  let rating = null;
  let mine = Number(store.get("localStorage", "rated")) || 0;
  let message = mine ? "yours" : "hint";

  function paintStars(n) {
    [...starsRoot.children].forEach((b, i) => b.classList.toggle("is-on", i < n));
  }

  function renderRating() {
    if (!ratingRoot) return;
    ratingRoot.hidden = !enabled;
    if (!enabled) return;
    starsRoot.textContent = "";
    for (let i = 1; i <= 5; i++) {
      const b = el("button", "star");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(i === mine));
      b.setAttribute("aria-label", t("rate.star", { n: i }));
      b.disabled = Boolean(mine);
      b.innerHTML = STAR;
      b.addEventListener("pointerenter", () => !mine && paintStars(i));
      b.addEventListener("focus", () => !mine && paintStars(i));
      b.addEventListener("click", () => vote(i));
      starsRoot.append(b);
    }
    starsRoot.onpointerleave = () => paintStars(mine);
    paintStars(mine);

    const count = rating ? rating.count : 0;
    avgEl.textContent = count ? Number(rating.average).toFixed(1) : "—";
    countEl.textContent = t("rate.count", { n: count });
    distRoot.textContent = "";
    for (let s = 5; s >= 1; s--) {
      const n = rating && rating.stars ? Number(rating.stars[s]) || 0 : 0;
      const li = el("li", "rating-row");
      li.append(
        el("span", "rating-row-label", `${s}★`),
        meter(count ? n / count : 0),
        el("span", "rating-row-val", String(n))
      );
      distRoot.append(li);
    }
    msgEl.textContent = message === "yours" ? t("rate.yours", { n: mine }) : t(`rate.${message}`);
    msgEl.classList.toggle("is-error", message === "error");
  }

  function loadRating() {
    if (!enabled) return renderRating();
    request("rpc/rating_summary")
      .then((data) => (rating = data))
      .catch(() => {})
      .then(renderRating);
  }

  function vote(n) {
    if (mine) return;
    mine = n;
    message = "saving";
    renderRating();
    request("ratings", { stars: n }, "return=minimal")
      .then(() => {
        store.set("localStorage", "rated", String(n));
        message = "thanks";
        loadRating();
      })
      .catch(() => {
        mine = 0;
        message = "error";
        renderRating();
      });
  }

  function syncWho(page) {
    clearInterval(timer);
    if (page !== "who") return;
    loadWho();
    if (enabled) timer = setInterval(loadWho, 30000);
  }

  if (whoLink) whoLink.hidden = !enabled;
  document.addEventListener("pagechange", (event) => {
    track(event.detail);
    syncWho(event.detail);
  });
  document.addEventListener("langchange", () => {
    renderWho();
    renderRating();
  });
  renderWho();
  loadRating();
})();
