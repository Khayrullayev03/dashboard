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
  const summaryEl = box.querySelector("[data-ping-summary]");
  const fullBtn = box.querySelector("[data-ping-full]");
  const copyBtn = box.querySelector("[data-ping-copy]");
  const saveBtn = box.querySelector("[data-ping-save]");
  const reportBox = box.querySelector("[data-ping-report]");

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
    email: [
      {
        name: C("Международные", "Xalqaro", "International"),
        items: [
          ["Gmail", "https://mail.google.com/robots.txt"],
          ["Outlook", "https://outlook.live.com/favicon.ico"],
          ["Yahoo Mail", "https://mail.yahoo.com/robots.txt"],
          ["iCloud Mail", "https://www.icloud.com/robots.txt"],
          ["Zoho Mail", "https://mail.zoho.com/robots.txt"],
        ],
      },
      {
        name: C("Защищённые", "Himoyalangan", "Encrypted"),
        items: [
          ["Proton Mail", "https://mail.proton.me/robots.txt"],
          ["Tuta", "https://tuta.com/robots.txt"],
        ],
      },
      {
        name: C("СНГ и Узбекистан", "MDH va O‘zbekiston", "CIS and Uzbekistan"),
        items: [
          ["Яндекс Почта", "https://mail.yandex.ru/robots.txt"],
          ["Mail.ru", "https://e.mail.ru/robots.txt"],
          ["Inbox.uz", "https://inbox.uz/favicon.ico", "UZ"],
        ],
      },
    ],
    vpn: [
      {
        name: C(
          "Свои серверы: клиенты и протоколы",
          "O‘z serverlari: mijozlar va protokollar",
          "Own servers: clients and protocols"
        ),
        items: [
          [
            "v2rayN",
            "https://raw.githubusercontent.com/2dust/v2rayN/master/.gitignore",
            null,
            "github.com/2dust/v2rayN",
          ],
          ["Xray / V2Ray", "https://xtls.github.io/", null, "xtls.github.io"],
          ["Hiddify", "https://hiddify.com/favicon.ico"],
          ["Outline", "https://getoutline.org/robots.txt"],
          ["Amnezia VPN", "https://amnezia.org/robots.txt"],
          ["Shadowsocks", "https://shadowsocks.org/"],
        ],
      },
      {
        name: C("VPN-сервисы", "VPN servislar", "VPN services"),
        items: [
          ["Cloudflare WARP", "https://one.one.one.one/cdn-cgi/trace"],
          ["Proton VPN", "https://protonvpn.com/robots.txt"],
          ["NordVPN", "https://nordvpn.com/robots.txt"],
          ["ExpressVPN", "https://www.expressvpn.com/robots.txt"],
          ["Surfshark", "https://surfshark.com/robots.txt"],
          ["Windscribe", "https://windscribe.com/robots.txt"],
          ["TunnelBear", "https://www.tunnelbear.com/robots.txt"],
          ["Psiphon", "https://psiphon.ca/robots.txt"],
          ["Lantern", "https://lantern.io/robots.txt"],
          ["Tor Project", "https://www.torproject.org/robots.txt"],
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

  const TX = {
    best: C("мин", "min", "min"),
    loss: C("потери", "yo‘qotish", "loss"),
    warm: C("прогрев…", "qizdirish…", "warming up…"),
    full: C("[ полный тест ]", "[ to‘liq test ]", "[ full test ]"),
    testing: C("[ тест {n}/{total} ]", "[ test {n}/{total} ]", "[ testing {n}/{total} ]"),
    copy: C("[ копировать отчёт ]", "[ hisobotni nusxalash ]", "[ copy report ]"),
    save: C("[ скачать .txt ]", "[ .txt yuklab olish ]", "[ download .txt ]"),
    copied: C("Отчёт скопирован", "Hisobot nusxalandi", "Report copied"),
    summary: C(
      "отвечают {ok} из {total} · медиана {avg} мс · быстрее всех {best} · медленнее всех {worst}",
      "{total} tadan {ok} tasi javob beradi · mediana {avg} ms · eng tezi {best} · eng sekini {worst}",
      "{ok} of {total} respond · median {avg} ms · fastest {best} · slowest {worst}"
    ),
    title: C("ОТЧЁТ О ЗАДЕРЖКАХ", "KECHIKISHLAR HISOBOTI", "LATENCY REPORT"),
    date: C("Дата", "Sana", "Date"),
    browser: C("Браузер", "Brauzer", "Browser"),
    network: C("Сеть", "Tarmoq", "Network"),
    method: C("Метод", "Usul", "Method"),
    methodText: C(
      "HTTPS-запросы из браузера; первый запрос (DNS + TCP + TLS) — прогрев и в статистику не входит",
      "Brauzerdan HTTPS so‘rovlar; birinchi so‘rov (DNS + TCP + TLS) — qizdirish, statistikaga kirmaydi",
      "HTTPS requests from the browser; the first request (DNS + TCP + TLS) is a warm-up and not counted"
    ),
    cols: C(
      ["сервис", "где", "мин", "медиана", "макс", "джиттер", "потери", "замеров"],
      ["servis", "qayerda", "min", "mediana", "maks", "jitter", "yo‘qotish", "o‘lchov"],
      ["service", "where", "min", "median", "max", "jitter", "loss", "samples"]
    ),
    noReply: C("нет ответа", "javob yo‘q", "no response"),
    result: C("ИТОГ", "XULOSA", "SUMMARY"),
    fastest: C("Быстрее всех", "Eng tezi", "Fastest"),
    slowest: C("Медленнее всех", "Eng sekini", "Slowest"),
    median: C("Медиана по всем", "Hammasi bo‘yicha mediana", "Overall median"),
    dead: C("Не отвечают", "Javob bermaydi", "No response"),
    grade: C("Оценка", "Baho", "Grade"),
    grades: C(
      ["отлично", "хорошо", "средне", "плохо"],
      ["a’lo", "yaxshi", "o‘rtacha", "yomon"],
      ["excellent", "good", "fair", "poor"]
    ),
    tabs: C(
      { apps: "ПРИЛОЖЕНИЯ", email: "ПОЧТА", vpn: "VPN", isp: "ПРОВАЙДЕРЫ И РЕГИОНЫ" },
      { apps: "ILOVALAR", email: "POCHTA", vpn: "VPN", isp: "PROVAYDERLAR VA HUDUDLAR" },
      { apps: "APPS", email: "EMAIL", vpn: "VPN", isp: "PROVIDERS AND REGIONS" }
    ),
  };
  const T = (key, vars) => {
    let s = L(TX[key]);
    if (vars) Object.keys(vars).forEach((k) => (s = s.replace(`{${k}}`, vars[k])));
    return s;
  };

  const targets = {};
  Object.keys(SETS).forEach((set) => {
    targets[set] = [];
    SETS[set].forEach((group) =>
      group.items.forEach(([name, url, cc, city]) => {
        const target = {
          name,
          url,
          cc,
          city,
          group,
          samples: [],
          warm: 0,
          attempts: 0,
          fails: 0,
          ms: null,
          shown: 0,
          row: null,
        };
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
  let testing = false;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const host = (url) => new URL(url).hostname.replace(/^www\./, "");
  const where = (target) => (target.city ? L(target.city) : host(target.url));
  const scale = (ms) => Math.min(1, Math.log1p(ms / 15) / Math.log1p(600 / 15));
  const speed = (ms) => (ms < 80 ? "is-fast" : ms < 200 ? "is-mid" : "is-slow");
  const median = (list) => {
    const a = [...list].sort((x, y) => x - y);
    const m = a.length >> 1;
    return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
  };
  const dead = (target) => !target.warm && target.fails >= 2;

  function stats(target) {
    const s = target.samples;
    if (!s.length) return null;
    let jitter = 0;
    for (let i = 1; i < s.length; i++) jitter += Math.abs(s[i] - s[i - 1]);
    return {
      min: Math.min(...s),
      max: Math.max(...s),
      med: median(s.slice(-5)),
      jitter: s.length > 1 ? Math.round(jitter / (s.length - 1)) : 0,
      loss: target.attempts ? Math.round((100 * target.fails) / target.attempts) : 0,
      n: s.length,
    };
  }

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
        label.append(el("span", "ping-title", target.name), el("span", "ping-where", where(target)));
        wrap.append(label);
        name.append(wrap);
        const barCell = el("td", "ping-bar-cell");
        const bar = el("span", "ping-bar");
        const fill = el("span", "ping-fill");
        bar.append(fill);
        const sub = el("span", "ping-sub");
        barCell.append(bar, sub);
        const ms = el("td", "ping-ms");
        const main = el("span", "ping-main");
        ms.append(main);
        tr.append(name, barCell, ms);
        body.append(tr);
        target.row = { tr, bar, fill, main, sub };
        paint(target, true);
      });
      updateAvg(group);
    });
    summary();
  }

  function setText(node, text, cls) {
    if (node.textContent !== text) node.textContent = text;
    if (cls != null && node.className !== cls) node.className = cls;
  }

  function subLine(target) {
    const st = stats(target);
    if (!st) return target.warm ? T("warm") : "";
    return `${T("best")} ${st.min} · ±${st.jitter} · ${T("loss")} ${st.loss}%`;
  }

  function paint(target, instant) {
    const row = target.row;
    if (!row) return;
    const ok = target.ms != null;
    row.tr.classList.toggle("is-fail", dead(target));
    row.bar.classList.toggle("is-wait", !ok && !dead(target));
    row.fill.classList.remove("is-fast", "is-mid", "is-slow");
    if (ok) row.fill.classList.add(speed(target.ms));
    setText(row.sub, subLine(target));
    if (instant) {
      target.shown = 0;
      row.fill.style.setProperty("--v", "0");
      setText(row.main, ok ? `0 ${t("net.ms")}` : dead(target) ? t("net.blocked") : "…", "ping-main");
      return;
    }
    row.fill.style.setProperty("--v", ok ? scale(target.ms).toFixed(3) : "0");
    animate();
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
          setText(row.main, dead(target) ? t("net.blocked") : "…", "ping-main");
          return;
        }
        const diff = target.ms - target.shown;
        if (Math.abs(diff) > 0.5) {
          target.shown += diff * k;
          moving = true;
        } else target.shown = target.ms;
        setText(row.main, `${Math.round(target.shown)} ${t("net.ms")}`, `ping-main ${speed(target.shown)}`);
      });
      tween = moving ? requestAnimationFrame(step) : 0;
    };
    tween = requestAnimationFrame(step);
  }

  function updateAvg(group) {
    if (!group.avgEl) return;
    const done = group.targets.filter((x) => x.ms != null);
    group.avgEl.textContent = done.length ? `~${median(done.map((x) => x.ms))} ${t("net.ms")}` : "";
  }

  function summary() {
    if (!summaryEl) return;
    const set = targets[tab];
    const done = set.filter((x) => x.ms != null).sort((a, b) => a.ms - b.ms);
    if (!done.length) {
      summaryEl.textContent = "";
      return;
    }
    const label = (x) => `${x.name}${x.city ? " " + L(x.city) : ""} ${x.ms} ${t("net.ms")}`;
    summaryEl.textContent = T("summary", {
      ok: done.length,
      total: set.length,
      avg: median(done.map((x) => x.ms)),
      best: label(done[0]),
      worst: label(done[done.length - 1]),
    });
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
    target.attempts++;
    if (ms < 0) target.fails++;
    else if (!target.warm) target.warm = ms;
    else {
      target.samples.push(ms);
      if (target.samples.length > 10) target.samples.shift();
    }
    const st = stats(target);
    target.ms = st ? st.med : target.warm || null;
    updateAvg(target.group);
    paint(target);
    summary();
  }

  const taken = (target) => (target.warm ? 1 : 0) + target.samples.length;

  async function pass(list, rounds, id, onProbe) {
    for (let round = 0; round < rounds && id === runId; round++) {
      const queue = list.filter((x) => taken(x) <= round && !dead(x));
      const worker = async () => {
        while (queue.length && id === runId) {
          const target = queue.shift();
          const ms = await probe(target.url);
          if (id !== runId) return;
          record(target, ms);
          if (onProbe) onProbe();
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
        const set = targets[tab].filter((x) => !dead(x));
        if (set.length) {
          const target = set[cursor++ % set.length];
          record(target, await probe(target.url));
        }
      }
      scheduleLive(id);
    }, 450);
  }

  async function run() {
    const id = ++runId;
    if (runBtn) runBtn.disabled = true;
    await pass(targets[tab], 4, id);
    if (id !== runId) return;
    if (runBtn) runBtn.disabled = false;
    scheduleLive(id);
  }

  async function fullTest() {
    if (testing) return;
    testing = true;
    const id = ++runId;
    clearTimeout(liveTimer);
    const all = Object.keys(SETS).flatMap((set) => targets[set]);
    const rounds = 7;
    const total = all.reduce((n, x) => n + Math.max(0, rounds - taken(x)), 0) || 1;
    let n = 0;
    const progress = () => fullBtn && (fullBtn.textContent = T("testing", { n: Math.min(n, total), total }));
    [fullBtn, runBtn].forEach((b) => b && (b.disabled = true));
    progress();
    await pass(all, rounds, id, () => {
      n++;
      progress();
    });
    testing = false;
    [fullBtn, runBtn].forEach((b) => b && (b.disabled = false));
    syncLabels();
    if (id !== runId) return;
    showReport(await report());
    scheduleLive(id);
  }

  function browserName() {
    const ua = navigator.userAgent;
    const found = [
      [/YaBrowser\/(\d+)/, "Yandex"],
      [/Edg\/(\d+)/, "Edge"],
      [/OPR\/(\d+)/, "Opera"],
      [/Firefox\/(\d+)/, "Firefox"],
      [/Chrome\/(\d+)/, "Chrome"],
      [/Version\/(\d+).*Safari/, "Safari"],
    ].find(([re]) => re.test(ua));
    const os = /Windows/.test(ua)
      ? "Windows"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : /Mac OS/.test(ua)
            ? "macOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "";
    return [found ? `${found[1]} ${ua.match(found[0])[1]}` : "", os].filter(Boolean).join(" · ");
  }

  async function report() {
    const pad = (v, n, left) => {
      const s = String(v);
      return s.length >= n ? s.slice(0, n) : left ? s.padStart(n) : s.padEnd(n);
    };
    const now = new Date();
    let tz = "";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {}
    let geo = null;
    if (window.GEO && window.GEO.locate) {
      geo = await Promise.race([
        window.GEO.locate().catch(() => null),
        new Promise((r) => setTimeout(() => r(null), 3000)),
      ]);
      if (geo && geo.source !== "ip") geo = null;
    }
    const conn = navigator.connection || {};
    const net = [
      geo && geo.isp,
      geo && [geo.city, geo.country].filter(Boolean).join(", "),
      conn.effectiveType ? `${conn.effectiveType}${conn.downlink ? ` ~${conn.downlink} Mbit/s` : ""}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    const cols = L(TX.cols);
    const out = [];
    out.push(`${T("title")} · khayrullayev03.github.io/dashboard`);
    out.push("=".repeat(86));
    out.push(`${T("date")}: ${now.toLocaleString(I18N.locale)}${tz ? ` (${tz})` : ""}`);
    out.push(`${T("browser")}: ${browserName()}`);
    if (net) out.push(`${T("network")}: ${net}`);
    out.push(`${T("method")}: ${T("methodText")}`);
    const everyone = [];
    Object.keys(SETS).forEach((set) => {
      out.push("");
      out.push(`== ${L(TX.tabs)[set]} ==`);
      out.push(
        `${pad(cols[0], 20)}${pad(cols[1], 22)}${pad(cols[2], 6, true)}${pad(cols[3], 9, true)}${pad(cols[4], 7, true)}${pad(cols[5], 9, true)}${pad(cols[6], 9, true)}${pad(cols[7], 9, true)}`
      );
      SETS[set].forEach((group) => {
        out.push(`-- ${L(group.name)}`);
        group.targets.forEach((x) => {
          const st = stats(x);
          everyone.push(x);
          const name = `${x.cc ? x.cc + " " : ""}${x.name}`;
          if (!st) {
            out.push(`${pad(name, 20)}${pad(where(x), 22)}${pad(dead(x) ? T("noReply") : "—", 40, true)}`);
            return;
          }
          out.push(
            `${pad(name, 20)}${pad(where(x), 22)}${pad(st.min, 6, true)}${pad(st.med, 9, true)}${pad(st.max, 7, true)}${pad(st.jitter, 9, true)}${pad(st.loss + "%", 9, true)}${pad(st.n, 9, true)}`
          );
        });
      });
    });
    const alive = everyone.filter((x) => stats(x)).sort((a, b) => stats(a).med - stats(b).med);
    out.push("");
    out.push(`== ${T("result")} ==`);
    if (alive.length) {
      const all = median(alive.map((x) => stats(x).med));
      const grades = L(TX.grades);
      const grade = all < 60 ? grades[0] : all < 120 ? grades[1] : all < 250 ? grades[2] : grades[3];
      const name = (x) => `${x.name}${x.city ? " · " + L(x.city) : ""} — ${stats(x).med} ${t("net.ms")}`;
      out.push(`${T("fastest")}: ${name(alive[0])}`);
      out.push(`${T("slowest")}: ${name(alive[alive.length - 1])}`);
      out.push(`${T("median")}: ${all} ${t("net.ms")}`);
      out.push(`${T("grade")}: ${grade}`);
    }
    const silent = everyone.filter(dead);
    if (silent.length) out.push(`${T("dead")}: ${silent.map((x) => x.name).join(", ")}`);
    return out.join("\n");
  }

  function showReport(text) {
    if (!reportBox) return;
    reportBox.hidden = false;
    reportBox.querySelector("pre").textContent = text;
  }

  async function copyReport() {
    const text = await report();
    showReport(text);
    try {
      await navigator.clipboard.writeText(text);
      if (window.APP && window.APP.toast) window.APP.toast(T("copied"));
    } catch (e) {}
  }

  async function saveReport() {
    const text = await report();
    showReport(text);
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    a.download = `ping-report-${stamp}.txt`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function syncLabels() {
    if (fullBtn && !testing) fullBtn.textContent = T("full");
    if (copyBtn) copyBtn.textContent = T("copy");
    if (saveBtn) saveBtn.textContent = T("save");
  }

  function select(next, rerun) {
    tab = next;
    tabs.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.pingTab === tab)));
    list.classList.remove("is-in");
    build();
    void list.offsetWidth;
    list.classList.add("is-in");
    requestAnimationFrame(() => targets[tab].forEach((target) => paint(target)));
    if (rerun !== false && !testing) run();
  }

  function start() {
    if (started) return;
    started = true;
    syncLabels();
    select(tab);
  }

  tabs.forEach((b) => b.addEventListener("click", () => b.dataset.pingTab !== tab && select(b.dataset.pingTab)));
  if (runBtn)
    runBtn.addEventListener("click", () => {
      targets[tab].forEach((target) => {
        target.samples = [];
        target.warm = 0;
        target.attempts = 0;
        target.fails = 0;
        target.ms = null;
        paint(target);
      });
      SETS[tab].forEach(updateAvg);
      summary();
      run();
    });
  if (fullBtn) fullBtn.addEventListener("click", fullTest);
  if (copyBtn) copyBtn.addEventListener("click", copyReport);
  if (saveBtn) saveBtn.addEventListener("click", saveReport);

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
    syncLabels();
    select(tab, false);
    if (reportBox && !reportBox.hidden) report().then(showReport);
  });
})();
