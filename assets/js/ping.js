(function () {
  "use strict";

  const I18N = window.I18N;
  const box = document.querySelector("[data-ping]");
  if (!I18N || !box) return;
  const { t } = I18N;
  const L = (v) => (typeof v === "string" ? v : I18N.pick(v));

  const list = box.querySelector("[data-ping-list]");
  const runBtn = box.querySelector("[data-ping-run]");
  const tabs = [...box.querySelectorAll("[data-ping-tab]")];

  const C = (ru, uz, en) => ({ ru, uz, en });
  const TASHKENT = C("Ташкент", "Toshkent", "Tashkent");
  const MOSCOW = C("Москва", "Moskva", "Moscow");
  const aws = (region) => `https://dynamodb.${region}.amazonaws.com/ping`;

  const SETS = {
    apps: [
      {
        name: C("Мессенджеры и звонки", "Messenjerlar va qo‘ng‘iroqlar", "Messengers and calls"),
        items: [
          ["Telegram", "https://telegram.org/favicon.ico"],
          ["WhatsApp", "https://web.whatsapp.com/favicon.ico"],
          ["Discord", "https://discord.com/robots.txt"],
          ["Zoom", "https://zoom.us/favicon.ico"],
        ],
      },
      {
        name: C("Соцсети и видео", "Ijtimoiy tarmoqlar va video", "Social and video"),
        items: [
          ["Instagram", "https://www.instagram.com/robots.txt"],
          ["YouTube", "https://www.youtube.com/favicon.ico"],
          ["TikTok", "https://www.tiktok.com/favicon.ico"],
          ["X (Twitter)", "https://x.com/favicon.ico"],
          ["Twitch", "https://www.twitch.tv/favicon.ico"],
          ["VK", "https://vk.com/robots.txt"],
        ],
      },
      {
        name: C("Игры", "O‘yinlar", "Games"),
        items: [
          ["Steam", "https://store.steampowered.com/robots.txt"],
          ["Dota 2", "https://www.dota2.com/favicon.ico"],
          ["PUBG", "https://www.pubg.com/favicon.ico"],
          ["Roblox", "https://www.roblox.com/robots.txt"],
        ],
      },
      {
        name: C("Сервисы", "Servislar", "Services"),
        items: [
          ["Google", "https://www.google.com/generate_204"],
          ["ChatGPT", "https://chatgpt.com/robots.txt"],
          ["Spotify", "https://open.spotify.com/robots.txt"],
          ["Netflix", "https://www.netflix.com/robots.txt"],
          ["Microsoft", "https://www.microsoft.com/robots.txt"],
          ["GitHub", "https://github.com/robots.txt"],
          ["Yandex", "https://ya.ru/favicon.ico"],
          ["Cloudflare", "https://www.cloudflare.com/cdn-cgi/trace"],
        ],
      },
    ],
    isp: [
      {
        name: C("Узбекистан", "O‘zbekiston", "Uzbekistan"),
        items: [
          ["Uztelecom", "https://uztelecom.uz/robots.txt", "UZ", TASHKENT],
          ["Beeline", "https://beeline.uz/robots.txt", "UZ", TASHKENT],
          ["Ucell", "https://ucell.uz/favicon.ico", "UZ", TASHKENT],
          ["Mobiuz", "https://mobi.uz/robots.txt", "UZ", TASHKENT],
          ["Turon Telecom", "https://turontelecom.uz/robots.txt", "UZ", TASHKENT],
          ["Sarkor Telecom", "https://sarkor.uz/robots.txt", "UZ", TASHKENT],
          ["TPS", "https://tps.uz/robots.txt", "UZ", TASHKENT],
          ["Comnet", "https://comnet.uz/robots.txt", "UZ", TASHKENT],
          ["Sharq Telecom", "https://sharq.uz/robots.txt", "UZ", TASHKENT],
        ],
      },
      {
        name: C("Центральная Азия", "Markaziy Osiyo", "Central Asia"),
        items: [
          ["Kazakhtelecom", "https://telecom.kz/robots.txt", "KZ", C("Астана", "Astana", "Astana")],
          ["Beeline KZ", "https://beeline.kz/robots.txt", "KZ", C("Алматы", "Almati", "Almaty")],
          ["Beeline KG", "https://www.beeline.kg/favicon.ico", "KG", C("Бишкек", "Bishkek", "Bishkek")],
          ["Tcell", "https://tcell.tj/robots.txt", "TJ", C("Душанбе", "Dushanbe", "Dushanbe")],
        ],
      },
      {
        name: C("Россия", "Rossiya", "Russia"),
        items: [
          ["Rostelecom", "https://www.rt.ru/robots.txt", "RU", MOSCOW],
          ["MTS", "https://moskva.mts.ru/robots.txt", "RU", MOSCOW],
          ["MegaFon", "https://moscow.megafon.ru/robots.txt", "RU", MOSCOW],
          [
            "Selectel",
            "https://selectel.ru/robots.txt",
            "RU",
            C("Санкт-Петербург", "Sankt-Peterburg", "St Petersburg"),
          ],
        ],
      },
      {
        name: C("Европа и Турция", "Yevropa va Turkiya", "Europe and Turkey"),
        items: [
          ["Türk Telekom", "https://www.turktelekom.com.tr/robots.txt", "TR", C("Стамбул", "Istanbul", "Istanbul")],
          ["Deutsche Telekom", "https://www.telekom.de/robots.txt", "DE", C("Германия", "Germaniya", "Germany")],
          ["AWS", aws("eu-central-1"), "DE", C("Франкфурт", "Frankfurt", "Frankfurt")],
          ["AWS", aws("eu-north-1"), "SE", C("Стокгольм", "Stokgolm", "Stockholm")],
          ["AWS", aws("eu-west-2"), "GB", C("Лондон", "London", "London")],
          ["OVHcloud", "https://proof.ovh.net/favicon.ico", "FR", C("Рубе", "Rube", "Roubaix")],
        ],
      },
      {
        name: C("Азия и Ближний Восток", "Osiyo va Yaqin Sharq", "Asia and the Middle East"),
        items: [
          ["AWS", aws("me-central-1"), "AE", C("Дубай", "Dubay", "Dubai")],
          ["AWS", aws("ap-south-1"), "IN", C("Мумбаи", "Mumbay", "Mumbai")],
          ["AWS", aws("ap-southeast-1"), "SG", C("Сингапур", "Singapur", "Singapore")],
          ["AWS", aws("ap-east-1"), "HK", C("Гонконг", "Gonkong", "Hong Kong")],
          ["AWS", aws("ap-northeast-1"), "JP", C("Токио", "Tokio", "Tokyo")],
        ],
      },
      {
        name: C("Америка", "Amerika", "Americas"),
        items: [
          ["AWS", aws("us-east-1"), "US", C("Вирджиния", "Virjiniya", "Virginia")],
          ["AWS", aws("us-east-2"), "US", C("Огайо", "Ogayo", "Ohio")],
          ["AWS", aws("us-west-1"), "US", C("Калифорния", "Kaliforniya", "California")],
          ["AWS", aws("us-west-2"), "US", C("Орегон", "Oregon", "Oregon")],
          ["AWS", aws("ca-central-1"), "CA", C("Монреаль", "Monreal", "Montreal")],
          ["AWS", aws("sa-east-1"), "BR", C("Сан-Паулу", "San-Paulu", "São Paulo")],
        ],
      },
      {
        name: C("Африка", "Afrika", "Africa"),
        items: [["AWS", aws("af-south-1"), "ZA", C("Кейптаун", "Keyptaun", "Cape Town")]],
      },
    ],
  };

  const targets = {};
  Object.keys(SETS).forEach((set) => {
    targets[set] = [];
    SETS[set].forEach((group) =>
      group.items.forEach(([name, url, cc, city]) => {
        const target = { name, url, cc, city, group, samples: [], fails: 0, ms: null, shown: 0, row: null };
        group.targets = group.targets || [];
        group.targets.push(target);
        targets[set].push(target);
      })
    );
  });

  let tab = "apps";
  let started = false;
  let onScreen = false;
  let runId = 0;
  let cursor = 0;
  let liveTimer = 0;
  let tween = 0;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const host = (url) => new URL(url).hostname.replace(/^www\./, "");
  const scale = (ms) => Math.min(1, Math.log1p(ms / 15) / Math.log1p(600 / 15));
  const speed = (ms) => (ms < 80 ? "is-fast" : ms < 200 ? "is-mid" : "is-slow");

  function build() {
    list.textContent = "";
    let i = 0;
    SETS[tab].forEach((group) => {
      const table = el("table", "ping-table");
      const caption = el("caption", "ping-group");
      group.avgEl = el("span", "ping-avg");
      caption.append(el("span", null, L(group.name)), group.avgEl);
      caption.style.setProperty("--i", i++);
      const body = el("tbody");
      table.append(caption, body);
      list.append(table);
      group.targets.forEach((target) => {
        const tr = el("tr", "ping-row");
        tr.style.setProperty("--i", i++);
        const name = el("th");
        name.scope = "row";
        const wrap = el("div", "ping-name");
        if (target.cc) wrap.append(el("span", "cc", target.cc));
        const label = el("span", "ping-label");
        label.append(
          el("span", "ping-title", target.name),
          el("span", "ping-where", target.city ? L(target.city) : host(target.url))
        );
        wrap.append(label);
        name.append(wrap);
        const barCell = el("td", "ping-bar-cell");
        const bar = el("span", "ping-bar");
        const fill = el("span", "ping-fill");
        bar.append(fill);
        barCell.append(bar);
        const ms = el("td", "ping-ms");
        tr.append(name, barCell, ms);
        body.append(tr);
        target.row = { tr, bar, fill, ms };
        target.shown = 0;
        paint(target, true);
      });
      updateAvg(group);
    });
  }

  function paint(target, instant) {
    const row = target.row;
    if (!row) return;
    const ok = target.ms != null;
    row.tr.classList.toggle("is-fail", !ok && target.fails >= 2);
    row.bar.classList.toggle("is-wait", !ok && target.fails < 2);
    row.fill.classList.remove("is-fast", "is-mid", "is-slow");
    if (ok) row.fill.classList.add(speed(target.ms));
    if (instant) {
      target.shown = 0;
      row.fill.style.setProperty("--v", "0");
      row.ms.textContent = ok ? `0 ${t("net.ms")}` : target.fails >= 2 ? t("net.blocked") : "…";
      row.ms.className = "ping-ms";
      return;
    }
    row.fill.style.setProperty("--v", ok ? scale(target.ms).toFixed(3) : "0");
    animate();
  }

  function setText(node, text, cls) {
    if (node.textContent !== text) node.textContent = text;
    if (node.className !== cls) node.className = cls;
  }

  function animate() {
    if (tween) return;
    let prev = performance.now();
    const step = (now) => {
      const dt = Math.min(64, now - prev);
      prev = now;
      const k = 1 - Math.exp(-dt / 200);
      let moving = false;
      targets[tab].forEach((target) => {
        const row = target.row;
        if (!row) return;
        if (target.ms == null) {
          setText(row.ms, target.fails >= 2 ? t("net.blocked") : "…", "ping-ms");
          return;
        }
        const diff = target.ms - target.shown;
        if (Math.abs(diff) > 0.5) {
          target.shown += diff * k;
          moving = true;
        } else target.shown = target.ms;
        setText(row.ms, `${Math.round(target.shown)} ${t("net.ms")}`, `ping-ms ${speed(target.shown)}`);
      });
      tween = moving ? requestAnimationFrame(step) : 0;
    };
    tween = requestAnimationFrame(step);
  }

  function updateAvg(group) {
    if (!group.avgEl) return;
    const done = group.targets.filter((x) => x.ms != null);
    group.avgEl.textContent = done.length
      ? `~${Math.round(done.reduce((s, x) => s + x.ms, 0) / done.length)} ${t("net.ms")}`
      : "";
  }

  async function probe(url) {
    const ctrl = window.AbortController ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), 5000);
    const t0 = performance.now();
    try {
      await fetch(url, {
        mode: "no-cors",
        cache: "no-store",
        credentials: "omit",
        signal: ctrl ? ctrl.signal : undefined,
      });
      return Math.round(performance.now() - t0);
    } catch (e) {
      return -1;
    } finally {
      clearTimeout(timer);
    }
  }

  function record(target, ms) {
    if (ms >= 0) {
      target.samples.push(ms);
      if (target.samples.length > 3) target.samples.shift();
      target.ms = Math.min(...target.samples);
      target.fails = 0;
    } else if (++target.fails >= 2 && !target.samples.length) target.ms = null;
    updateAvg(target.group);
    paint(target);
  }

  async function firstPass(set, id) {
    for (let round = 0; round < 3 && id === runId; round++) {
      const queue = targets[set].filter((x) => x.samples.length <= round && !(x.fails >= 2 && !x.samples.length));
      const worker = async () => {
        while (queue.length && id === runId) {
          const target = queue.shift();
          const ms = await probe(target.url);
          if (id === runId) record(target, ms);
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
    }
  }

  function active() {
    return started && onScreen && !document.hidden && document.documentElement.dataset.view === "info";
  }

  function scheduleLive(id) {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(async () => {
      if (id !== runId) return;
      if (active()) {
        const set = targets[tab];
        const target = set[cursor++ % set.length];
        record(target, await probe(target.url));
      }
      scheduleLive(id);
    }, 450);
  }

  async function run() {
    const id = ++runId;
    if (runBtn) runBtn.disabled = true;
    await firstPass(tab, id);
    if (id !== runId) return;
    if (runBtn) runBtn.disabled = false;
    scheduleLive(id);
  }

  function select(next, rerun) {
    tab = next;
    tabs.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.pingTab === tab)));
    list.classList.remove("is-in");
    build();
    void list.offsetWidth;
    list.classList.add("is-in");
    requestAnimationFrame(() => targets[tab].forEach((target) => paint(target)));
    if (rerun !== false) run();
  }

  function start() {
    if (started) return;
    started = true;
    select(tab);
  }

  tabs.forEach((b) => b.addEventListener("click", () => b.dataset.pingTab !== tab && select(b.dataset.pingTab)));
  if (runBtn)
    runBtn.addEventListener("click", () => {
      targets[tab].forEach((target) => {
        target.samples = [];
        target.fails = 0;
        target.ms = null;
        paint(target);
      });
      SETS[tab].forEach(updateAvg);
      run();
    });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      if (onScreen) start();
    }).observe(box);
  } else onScreen = true;

  document.addEventListener("pagechange", (event) => {
    if (event.detail === "info" && onScreen) start();
  });
  document.addEventListener("langchange", () => {
    if (!started) return;
    select(tab, false);
  });
})();
