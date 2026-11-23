(function () {
  "use strict";

  const I18N = window.I18N;
  const page = document.querySelector('[data-page="info"]');
  if (!I18N || !page) return;
  const { t } = I18N;

  const frameBox = page.querySelector("[data-net-frame]");
  const statsRoot = page.querySelector("[data-net-stats]");
  const pingList = page.querySelector("[data-ping-list]");
  const pingBtn = page.querySelector("[data-ping-run]");

  const API = "https://isc.sans.edu/api/";
  const PORTS = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    81: "HTTP-alt",
    110: "POP3",
    123: "NTP",
    135: "MS-RPC",
    139: "NetBIOS",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    1433: "MSSQL",
    1723: "PPTP",
    2222: "SSH-alt",
    2323: "Telnet-alt",
    3306: "MySQL",
    3389: "RDP",
    5060: "SIP",
    5432: "PostgreSQL",
    5555: "ADB",
    5900: "VNC",
    6379: "Redis",
    8000: "HTTP-alt",
    8080: "HTTP-proxy",
    8088: "HTTP-alt",
    8443: "HTTPS-alt",
    9200: "Elastic",
    27017: "MongoDB",
    161: "SNMP",
    389: "LDAP",
    636: "LDAPS",
    1900: "SSDP",
    5038: "IP-PBX",
    5985: "WinRM",
    7547: "TR-069",
    8291: "Winbox",
    8728: "MikroTik",
    9000: "HTTP-alt",
    10000: "Webmin",
    37215: "Huawei",
    52869: "UPnP",
    60001: "HTTP-alt",
  };
  const LEVELS = { green: "#45d483", yellow: "#ffd23f", orange: "#ff8c42", red: "#f2334a" };
  const TARGETS = [
    ["Google", "https://www.google.com/generate_204"],
    ["Cloudflare", "https://www.cloudflare.com/cdn-cgi/trace"],
    ["Telegram", "https://telegram.org/favicon.ico"],
    ["GitHub", "https://github.com/favicon.ico"],
    ["Yandex", "https://ya.ru/favicon.ico"],
    ["Microsoft", "https://www.microsoft.com/favicon.ico"],
  ];

  let started = false;
  let stats = null;
  let statsFailed = false;
  let pings = TARGETS.map(() => null);
  let timer = 0;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const num = (n) => Number(n || 0).toLocaleString(I18N.locale);

  function meter(share, width = 18) {
    const n = Math.max(0, Math.min(width, Math.round(share * width)));
    const bar = el("span", "meter-bar");
    bar.append("[", el("span", "meter-fill", "█".repeat(n)), el("span", "meter-empty", "░".repeat(width - n)), "]");
    return bar;
  }

  function panel(path, label, body, extra) {
    const box = el("div", `term net-panel${extra ? " " + extra : ""}`);
    const bar = el("div", "term-bar");
    bar.append(el("span", null, path), el("span", null, label));
    box.append(bar, body);
    return box;
  }

  function loadFrame() {
    if (!frameBox || frameBox.querySelector("iframe")) return;
    const lang = I18N.lang === "en" ? "en" : "ru";
    const frame = document.createElement("iframe");
    frame.src = `https://cybermap.kaspersky.com/${lang}/widget/dynamic/dark`;
    frame.title = t("net.mapTitle");
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer";
    frame.setAttribute("allowfullscreen", "");
    frame.addEventListener("load", () => frameBox.classList.add("is-ready"));
    frameBox.append(frame);
  }

  async function getJSON(path) {
    const res = await fetch(API + path, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    return res.json();
  }

  async function loadStats() {
    try {
      const [infocon, ports, ips] = await Promise.all([
        getJSON("infocon?json"),
        getJSON("topports/records/8?json"),
        getJSON("sources/attacks/6?json"),
      ]);
      const portList = Object.keys(ports)
        .filter((k) => /^\d+$/.test(k))
        .map((k) => ports[k]);
      stats = {
        level: String(infocon.status || "green").toLowerCase(),
        date: ports.date,
        ports: portList,
        ips: Array.isArray(ips) ? ips : [],
      };
      statsFailed = false;
    } catch (e) {
      statsFailed = !stats;
    }
    renderStats(true);
  }

  function renderStats(animate) {
    if (!statsRoot) return;
    statsRoot.textContent = "";
    if (!stats) {
      statsRoot.append(el("p", "net-note", statsFailed ? t("net.error") : t("net.loading")));
      return;
    }

    const level = LEVELS[stats.level] ? stats.level : "green";
    const lv = el("div", "net-level");
    const dot = el("span", "net-dot");
    dot.style.setProperty("--c", LEVELS[level]);
    lv.append(
      el("span", "net-level-label", t("net.infocon")),
      dot,
      el("span", "net-level-name", level.toUpperCase()),
      el("span", "net-level-text", t(`net.level.${level}`)),
      el("span", "net-level-date", `${t("net.updated")}: ${stats.date || ""}`)
    );
    statsRoot.append(panel("~/isc/infocon", "Infocon", lv, "net-infocon"));

    const top = stats.ports[0] ? stats.ports[0].records : 1;
    const list = el("ol", "net-rows");
    stats.ports.forEach((row, i) => {
      const li = el("li", "net-row");
      li.style.setProperty("--i", i);
      li.append(
        el("span", "net-port", String(row.targetport)),
        el("span", "net-svc", PORTS[row.targetport] || "—"),
        meter(row.records / top),
        el("span", "net-val", `${num(row.records)} ${t("net.attempts")}`),
        el("span", "net-sub", `${num(row.sources)} ${t("net.sources")}`)
      );
      list.append(li);
    });
    statsRoot.append(panel("~/isc/topports", t("net.ports"), list, "net-ports"));

    const ipTop = stats.ips[0] ? stats.ips[0].attacks : 1;
    const ipList = el("ol", "net-rows");
    stats.ips.forEach((row, i) => {
      const li = el("li", "net-row net-ip-row");
      li.style.setProperty("--i", i);
      li.append(
        el("span", "net-ip", row.ip),
        meter(row.attacks / ipTop, 12),
        el("span", "net-val", `${num(row.attacks)} ${t("net.targets")}`)
      );
      ipList.append(li);
    });
    statsRoot.append(panel("~/isc/sources", t("net.ips"), ipList, "net-ips"));
    if (animate) statsRoot.classList.add("is-in");
  }

  async function measure(url) {
    let best = Infinity;
    for (let k = 0; k < 3; k++) {
      const t0 = performance.now();
      try {
        await fetch(`${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}${k}`, {
          mode: "no-cors",
          cache: "no-store",
        });
        best = Math.min(best, performance.now() - t0);
      } catch (e) {
        continue;
      }
    }
    return best === Infinity ? -1 : Math.round(best);
  }

  function renderPing() {
    if (!pingList) return;
    pingList.textContent = "";
    TARGETS.forEach(([name], i) => {
      const ms = pings[i];
      const li = el("li", "ping-row");
      const ok = typeof ms === "number" && ms >= 0;
      li.append(el("span", "ping-name", name));
      li.append(ok ? meter(Math.min(1, ms / 400), 20) : el("span", "ping-wait", ms === -1 ? t("net.blocked") : "…"));
      const val = el("span", "ping-ms", ok ? `${ms} ${t("net.ms")}` : "");
      if (ok) val.classList.add(ms < 80 ? "is-fast" : ms < 200 ? "is-mid" : "is-slow");
      li.append(val);
      pingList.append(li);
    });
  }

  async function runPing() {
    pings = TARGETS.map(() => null);
    renderPing();
    if (pingBtn) pingBtn.disabled = true;
    for (let i = 0; i < TARGETS.length; i++) {
      pings[i] = await measure(TARGETS[i][1]);
      renderPing();
    }
    if (pingBtn) pingBtn.disabled = false;
  }

  function start() {
    if (started) return;
    started = true;
    loadFrame();
    loadStats();
    runPing();
    timer = setInterval(
      () => document.documentElement.dataset.view === "info" && !document.hidden && loadStats(),
      5 * 60 * 1000
    );
  }

  if (pingBtn) pingBtn.addEventListener("click", runPing);
  document.addEventListener("pagechange", (event) => event.detail === "info" && start());
  document.addEventListener("langchange", () => {
    renderStats(false);
    renderPing();
  });
  if (document.documentElement.dataset.view === "info") start();
  renderStats(false);
  renderPing();
})();
