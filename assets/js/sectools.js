(function () {
  "use strict";

  const I18N = window.I18N;
  const page = document.querySelector('[data-page="info"]');
  if (!I18N || !page) return;
  const L = (v) => I18N.pick(v);

  const connRoot = page.querySelector("[data-sec-conn]");
  const vulnRoot = page.querySelector("[data-sec-vuln]");
  const toolsRoot = page.querySelector("[data-sec-tools]");

  const TX = {
    good: { ru: "хорошо", uz: "yaxshi", en: "good" },
    tls: { ru: "Шифрование (TLS)", uz: "Shifrlash (TLS)", en: "Encryption (TLS)" },
    http: { ru: "Протокол", uz: "Protokol", en: "Protocol" },
    ech: { ru: "Скрытие имени сайта (ECH)", uz: "Sayt nomini yashirish (ECH)", en: "Hidden site name (ECH)" },
    warp: { ru: "Cloudflare WARP / VPN", uz: "Cloudflare WARP / VPN", en: "Cloudflare WARP / VPN" },
    colo: { ru: "Ближайший дата-центр", uz: "Eng yaqin data-markaz", en: "Nearest data centre" },
    https: { ru: "HTTPS на этом сайте", uz: "Bu saytda HTTPS", en: "HTTPS on this site" },
    webrtc: { ru: "Утечка IP через WebRTC", uz: "WebRTC orqali IP sizib chiqishi", en: "IP leak via WebRTC" },
    privacy: { ru: "Do Not Track / GPC", uz: "Do Not Track / GPC", en: "Do Not Track / GPC" },
    on: { ru: "включено", uz: "yoqilgan", en: "on" },
    off: { ru: "выключено", uz: "o‘chirilgan", en: "off" },
    hidden: { ru: "нет, IP скрыт", uz: "yo‘q, IP yashirin", en: "no, IP hidden" },
    leak: { ru: "да, виден локальный IP", uz: "ha, lokal IP ko‘rinadi", en: "yes, local IP is visible" },
    encrypted: { ru: "включено", uz: "yoqilgan", en: "enabled" },
    plain: {
      ru: "нет, имя сайта видно провайдеру",
      uz: "yo‘q, sayt nomi provayderga ko‘rinadi",
      en: "no, the provider sees the site name",
    },
    grade: { ru: "оценка соединения", uz: "ulanish bahosi", en: "connection grade" },
    connError: {
      ru: "Не удалось проверить соединение",
      uz: "Ulanishni tekshirib bo‘lmadi",
      en: "Couldn't check the connection",
    },
    newCve: { ru: "новые уязвимости (NVD)", uz: "yangi zaifliklar (NVD)", en: "new vulnerabilities (NVD)" },
    epss: { ru: "уже атакуют (EPSS)", uz: "allaqachon hujum qilinmoqda (EPSS)", en: "already exploited (EPSS)" },
    epssNote: {
      ru: "Всего {n} CVE с вероятностью эксплуатации выше 90% в ближайшие 30 дней. Здесь самые новые из них, их патчат в первую очередь.",
      uz: "Keyingi 30 kunda ekspluatatsiya ehtimoli 90% dan yuqori bo‘lgan {n} ta CVE. Bu yerda eng yangilari, ular birinchi navbatda yamaladi.",
      en: "{n} CVEs have over 90% probability of exploitation in the next 30 days. These are the newest; patch them first.",
    },
    cveCount: {
      ru: "{n} новых CVE за последние 48 часов",
      uz: "So‘nggi 48 soatda {n} ta yangi CVE",
      en: "{n} new CVEs in the last 48 hours",
    },
    agoMin: { ru: "мин назад", uz: "daqiqa oldin", en: "min ago" },
    agoHour: { ru: "ч назад", uz: "soat oldin", en: "h ago" },
    agoDay: { ru: "дн назад", uz: "kun oldin", en: "days ago" },
    loading: { ru: "Загружаю…", uz: "Yuklanmoqda…", en: "Loading…" },
    noData: {
      ru: "Нет данных — попробуйте позже",
      uz: "Ma’lumot yo‘q — keyinroq urinib ko‘ring",
      en: "No data — please try later",
    },
    pwTitle: { ru: "Пароль в утечках?", uz: "Parol sizib chiqqanmi?", en: "Password in leaks?" },
    pwPlaceholder: { ru: "введите пароль", uz: "parolni kiriting", en: "enter a password" },
    check: { ru: "Проверить", uz: "Tekshirish", en: "Check" },
    pwNote: {
      ru: "Пароль не покидает браузер: наружу уходят только первые 5 символов его SHA-1 хеша (метод k-анонимности, Have I Been Pwned).",
      uz: "Parol brauzerdan chiqmaydi: tashqariga faqat SHA-1 xeshining birinchi 5 belgisi yuboriladi (k-anonimlik usuli, Have I Been Pwned).",
      en: "The password never leaves the browser: only the first 5 characters of its SHA-1 hash are sent (k-anonymity, Have I Been Pwned).",
    },
    pwFound: {
      ru: "Найден в утечках {n} раз — не используйте его",
      uz: "Sizib chiqqan bazalarda {n} marta topildi — undan foydalanmang",
      en: "Found in leaks {n} times — don't use it",
    },
    pwClean: {
      ru: "В известных утечках не найден",
      uz: "Ma’lum sizib chiqishlarda topilmadi",
      en: "Not found in known leaks",
    },
    crack: { ru: "Перебор займёт", uz: "Tanlab topish vaqti", en: "Time to crack" },
    instant: { ru: "мгновенно", uz: "bir zumda", en: "instantly" },
    sec: { ru: "сек", uz: "soniya", en: "sec" },
    min: { ru: "мин", uz: "daqiqa", en: "min" },
    hour: { ru: "ч", uz: "soat", en: "h" },
    day: { ru: "дн", uz: "kun", en: "days" },
    year: { ru: "лет", uz: "yil", en: "years" },
    forever: { ru: "больше миллиона лет", uz: "milliondan ortiq yil", en: "over a million years" },
    domTitle: { ru: "Защита почты домена", uz: "Domen pochtasi himoyasi", en: "Domain email security" },
    domPlaceholder: {
      ru: "домен, например google.com",
      uz: "domen, masalan google.com",
      en: "domain, e.g. google.com",
    },
    badDomain: {
      ru: "Введите домен, например example.com",
      uz: "Domen kiriting, masalan example.com",
      en: "Enter a domain, e.g. example.com",
    },
    nx: { ru: "Такой домен не найден", uz: "Bunday domen topilmadi", en: "Domain not found" },
    spf: { ru: "SPF — кто может слать почту", uz: "SPF — kim pochta yubora oladi", en: "SPF — who may send mail" },
    dmarc: {
      ru: "DMARC — что делать с подделками",
      uz: "DMARC — soxtalari bilan nima qilish",
      en: "DMARC — what to do with fakes",
    },
    mx: { ru: "MX — почтовые серверы", uz: "MX — pochta serverlari", en: "MX — mail servers" },
    dnssec: { ru: "DNSSEC — подпись DNS", uz: "DNSSEC — DNS imzosi", en: "DNSSEC — signed DNS" },
    caa: {
      ru: "CAA — кто выпускает сертификаты",
      uz: "CAA — sertifikatni kim chiqaradi",
      en: "CAA — who may issue certs",
    },
    mtasts: { ru: "MTA-STS — шифрование почты", uz: "MTA-STS — pochtani shifrlash", en: "MTA-STS — mail encryption" },
    none: { ru: "нет", uz: "yo‘q", en: "none" },
    yes: { ru: "есть", uz: "bor", en: "present" },
    safe: {
      ru: "Подделать письма от имени этого домена сложно ✓",
      uz: "Bu domen nomidan xat soxtalashtirish qiyin ✓",
      en: "Hard to spoof email from this domain ✓",
    },
    weak: {
      ru: "Защита частичная — подделки могут дойти до получателя",
      uz: "Himoya qisman — soxta xatlar yetib borishi mumkin",
      en: "Partial protection — spoofed mail may get through",
    },
    unsafe: {
      ru: "Письма от имени домена можно подделать ✕",
      uz: "Domen nomidan xatlarni soxtalashtirish mumkin ✕",
      en: "Email from this domain can be spoofed ✕",
    },
    fpTitle: { ru: "Что о вас знает сайт", uz: "Sayt siz haqingizda nimani biladi", en: "What a site knows about you" },
    fpId: { ru: "ваш отпечаток", uz: "sizning izingiz", en: "your fingerprint" },
    fpNote: {
      ru: "По этим признакам сайты узнают браузер без cookies. Всё посчитано у вас, никуда не отправляется.",
      uz: "Bu belgilar orqali saytlar brauzerni cookie’larsiz taniydi. Hammasi sizda hisoblandi, hech qayerga yuborilmaydi.",
      en: "Sites can recognise your browser by these traits without cookies. Computed locally, nothing is sent.",
    },
    fpBrowser: { ru: "Браузер", uz: "Brauzer", en: "Browser" },
    fpPlatform: { ru: "Система", uz: "Tizim", en: "System" },
    fpLangs: { ru: "Языки", uz: "Tillar", en: "Languages" },
    fpScreen: { ru: "Экран", uz: "Ekran", en: "Screen" },
    fpTz: { ru: "Часовой пояс", uz: "Vaqt mintaqasi", en: "Time zone" },
    fpCpu: { ru: "Ядра / память", uz: "Yadrolar / xotira", en: "Cores / memory" },
    fpTouch: { ru: "Сенсорный экран", uz: "Sensorli ekran", en: "Touch screen" },
    fpCanvas: { ru: "Canvas-отпечаток", uz: "Canvas izi", en: "Canvas hash" },
    fpGpu: { ru: "Видеокарта (WebGL)", uz: "Videokarta (WebGL)", en: "GPU (WebGL)" },
    fpFonts: { ru: "Шрифты", uz: "Shriftlar", en: "Fonts" },
    found: { ru: "найдено", uz: "topildi", en: "found" },
    toolTitle: { ru: "Инструменты", uz: "Asboblar", en: "Toolkit" },
    tabHash: { ru: "Хеш", uz: "Xesh", en: "Hash" },
    tabGen: { ru: "Пароль", uz: "Parol", en: "Password" },
    input: { ru: "введите текст", uz: "matn kiriting", en: "enter text" },
    jwtInput: { ru: "вставьте JWT-токен", uz: "JWT tokenni qo‘ying", en: "paste a JWT" },
    encode: { ru: "Кодировать", uz: "Kodlash", en: "Encode" },
    decode: { ru: "Декодировать", uz: "Dekodlash", en: "Decode" },
    badInput: {
      ru: "Не получилось — проверьте ввод",
      uz: "Bo‘lmadi — kiritilganini tekshiring",
      en: "Failed — check the input",
    },
    expired: { ru: "истёк", uz: "muddati o‘tgan", en: "expired" },
    valid: { ru: "действует до", uz: "amal qiladi", en: "valid until" },
    jwtNote: {
      ru: "Подпись не проверяется — это просто расшифровка содержимого.",
      uz: "Imzo tekshirilmaydi — bu faqat tarkibni ochish.",
      en: "The signature isn't verified — this only decodes the content.",
    },
    length: { ru: "длина", uz: "uzunlik", en: "length" },
    generate: { ru: "Сгенерировать", uz: "Yaratish", en: "Generate" },
    copy: { ru: "Копировать", uz: "Nusxalash", en: "Copy" },
    copied: { ru: "скопировано", uz: "nusxalandi", en: "copied" },
  };
  const T = (key, vars) => {
    let s = L(TX[key]) || key;
    if (vars) Object.keys(vars).forEach((k) => (s = s.replace(`{${k}}`, vars[k])));
    return s;
  };

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const digest = async (algo, text) => hex(await crypto.subtle.digest(algo, new TextEncoder().encode(text)));
  const num = (n) => Number(n || 0).toLocaleString(I18N.locale);
  const mark = (state) => ({ good: "✓", ok: "~", bad: "✕", info: "·" })[state] || "·";

  function md5(str) {
    const bytes = new TextEncoder().encode(str);
    const K = new Uint32Array(64);
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
    const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    const len = bytes.length;
    const blocks = ((len + 8) >> 6) + 1;
    const X = new Uint32Array(blocks * 16);
    for (let i = 0; i < len; i++) X[i >> 2] |= bytes[i] << ((i % 4) * 8);
    X[len >> 2] |= 0x80 << ((len % 4) * 8);
    X[blocks * 16 - 2] = (len * 8) >>> 0;
    X[blocks * 16 - 1] = Math.floor(len / 0x20000000);
    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;
    for (let w = 0; w < X.length; w += 16) {
      let A = a0;
      let B = b0;
      let C = c0;
      let D = d0;
      for (let i = 0; i < 64; i++) {
        let F;
        let g;
        if (i < 16) {
          F = (B & C) | (~B & D);
          g = i;
        } else if (i < 32) {
          F = (D & B) | (~D & C);
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          F = B ^ C ^ D;
          g = (3 * i + 5) % 16;
        } else {
          F = C ^ (B | ~D);
          g = (7 * i) % 16;
        }
        F = (F + A + K[i] + X[w + g]) >>> 0;
        A = D;
        D = C;
        C = B;
        const s = S[(i >> 4) * 4 + (i % 4)];
        B = (B + ((F << s) | (F >>> (32 - s)))) >>> 0;
      }
      a0 = (a0 + A) >>> 0;
      b0 = (b0 + B) >>> 0;
      c0 = (c0 + C) >>> 0;
      d0 = (d0 + D) >>> 0;
    }
    return [a0, b0, c0, d0]
      .map((v) => [0, 8, 16, 24].map((sh) => ((v >>> sh) & 255).toString(16).padStart(2, "0")).join(""))
      .join("");
  }

  function card(path, titleKey, extra) {
    const box = el("div", `term sec-card${extra ? " " + extra : ""}`);
    const bar = el("div", "term-bar");
    const title = el("span", null, T(titleKey));
    title.dataset.tx = titleKey;
    bar.append(el("span", null, path), title);
    const body = el("div", "sec-body");
    box.append(bar, body);
    return { box, body };
  }

  function labelled(tag, cls, key, attr) {
    const n = el(tag, cls);
    if (attr) {
      n.dataset.txAttr = attr;
      n.setAttribute(attr, T(key));
    } else n.textContent = T(key);
    n.dataset.tx = key;
    return n;
  }

  function applyText(root) {
    root.querySelectorAll("[data-tx]").forEach((n) => {
      const attr = n.dataset.txAttr;
      if (attr) n.setAttribute(attr, T(n.dataset.tx));
      else n.textContent = T(n.dataset.tx);
    });
  }

  function rows(list) {
    const ul = el("ul", "sec-rows");
    list.forEach(([key, value, state]) => {
      const li = el("li", `sec-row is-${state}`);
      li.append(el("span", "sec-mark", mark(state)), el("span", "sec-key", T(key)), el("span", "sec-val", value));
      ul.append(li);
    });
    return ul;
  }

  let conn = null;
  let connFailed = false;

  async function loadConn() {
    try {
      const res = await fetch(`https://www.cloudflare.com/cdn-cgi/trace?_=${Date.now()}`, { cache: "no-store" });
      const text = await res.text();
      const trace = {};
      text.split("\n").forEach((line) => {
        const i = line.indexOf("=");
        if (i > 0) trace[line.slice(0, i)] = line.slice(i + 1).trim();
      });
      const local = window.GEO && window.GEO.localIP ? await window.GEO.localIP() : { status: "unsupported" };
      conn = { trace, local };
      connFailed = false;
    } catch (e) {
      connFailed = true;
    }
    renderConn();
  }

  function renderConn() {
    if (!connRoot) return;
    connRoot.textContent = "";
    const bar = el("div", "term-bar");
    bar.append(el("span", null, "~/sec/connection"), el("span", "live", "● live"));
    connRoot.append(bar);
    if (!conn) {
      connRoot.append(el("p", "net-note sec-pad", connFailed ? T("connError") : T("loading")));
      return;
    }
    const tr = conn.trace;
    const tls = tr.tls || "—";
    const http = (tr.http || "—").toUpperCase();
    const list = [
      ["tls", tls, tls === "TLSv1.3" ? "good" : tls === "TLSv1.2" ? "ok" : "bad"],
      ["http", http, /3/.test(http) ? "good" : /2/.test(http) ? "ok" : "bad"],
      ["ech", tr.sni === "encrypted" ? T("encrypted") : T("plain"), tr.sni === "encrypted" ? "good" : "ok"],
      ["https", location.protocol === "https:" ? T("on") : T("off"), location.protocol === "https:" ? "good" : "bad"],
      ["webrtc", conn.local.status === "ok" ? T("leak") : T("hidden"), conn.local.status === "ok" ? "bad" : "good"],
      [
        "privacy",
        navigator.globalPrivacyControl || navigator.doNotTrack === "1" ? T("on") : T("off"),
        navigator.globalPrivacyControl || navigator.doNotTrack === "1" ? "good" : "ok",
      ],
      ["warp", tr.warp && tr.warp !== "off" ? T("on") : T("off"), "info"],
      ["colo", [tr.colo, tr.loc].filter(Boolean).join(" · ") || "—", "info"],
    ];
    const scored = list.filter((r) => r[2] !== "info");
    const score = scored.reduce((n, r) => n + (r[2] === "good" ? 2 : r[2] === "ok" ? 1 : 0), 0) / (scored.length * 2);
    const grade = score >= 0.92 ? "A+" : score >= 0.8 ? "A" : score >= 0.65 ? "B" : score >= 0.5 ? "C" : "D";
    const body = el("div", "sec-conn-body");
    const g = el("div", `sec-grade grade-${grade[0].toLowerCase()}`);
    g.append(el("span", "sec-grade-letter", grade), labelled("span", "sec-grade-label", "grade"));
    body.append(g, rows(list));
    connRoot.append(body);
  }

  let vulns = null;
  let vulnFailed = false;
  let vulnRetries = 0;

  // The vulnerability feed comes from our Supabase function `feeds` (NVD + EPSS, cached for an hour);
  // direct requests to NVD and FIRST are only a fallback.
  const site = window.SITE_CONFIG || {};
  const FEEDS =
    site.supabaseUrl && site.supabaseKey ? `${site.supabaseUrl.replace(/\/+$/, "")}/functions/v1/feeds` : "";

  async function vulnsViaProxy() {
    const headers = { apikey: site.supabaseKey };
    if (site.supabaseKey.startsWith("eyJ")) headers.Authorization = `Bearer ${site.supabaseKey}`;
    const res = await fetch(`${FEEDS}?src=vulns`, { headers });
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    if (!Array.isArray(d.cves)) throw new Error("feed");
    return { cves: d.cves, top: d.top || [], total: d.total || 0, hot: d.hot || 0 };
  }

  async function loadVulns() {
    if (FEEDS) {
      try {
        vulns = await vulnsViaProxy();
        vulnFailed = false;
        renderVulns();
        return;
      } catch (e) {}
    }
    const day = 86400000;
    const iso = (d) => d.toISOString().slice(0, 23);
    const end = new Date();
    const startDate = new Date(end.getTime() - 2 * day);
    const base = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${iso(startDate)}&pubEndDate=${iso(end)}`;
    try {
      const [head, epss] = await Promise.all([
        fetch(`${base}&resultsPerPage=1`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
        fetch("https://api.first.org/data/v1/epss?epss-gt=0.9&limit=200").then((r) =>
          r.ok ? r.json() : Promise.reject(r.status)
        ),
      ]);
      const total = head.totalResults || 0;
      const list = await fetch(`${base}&resultsPerPage=8&startIndex=${Math.max(0, total - 8)}`).then((r) =>
        r.ok ? r.json() : Promise.reject(r.status)
      );
      const cves = (list.vulnerabilities || [])
        .map((v) => v.cve)
        .reverse()
        .map((c) => {
          const m = c.metrics || {};
          const key = ["cvssMetricV40", "cvssMetricV31", "cvssMetricV30", "cvssMetricV2"].find(
            (k) => m[k] && m[k].length
          );
          const data = key ? m[key][0].cvssData || {} : {};
          const desc = (c.descriptions || []).find((d) => d.lang === "en") || (c.descriptions || [])[0] || {};
          return {
            id: c.id,
            score: data.baseScore,
            severity: String(data.baseSeverity || (key ? m[key][0].baseSeverity : "") || "").toUpperCase(),
            published: c.published,
            text: desc.value || "",
          };
        });
      const order = (id) => {
        const [, year, n] = String(id).split("-");
        return Number(year) * 1e7 + Number(n);
      };
      const top = (epss.data || []).sort((a, b) => order(b.cve) - order(a.cve)).slice(0, 8);
      vulns = { cves, top, total, hot: epss.total || top.length };
      vulnFailed = false;
    } catch (e) {
      vulnFailed = !vulns;
      if (!vulns && vulnRetries < 2) setTimeout(loadVulns, 8000 * ++vulnRetries);
    }
    renderVulns();
  }

  function renderVulns() {
    if (!vulnRoot) return;
    vulnRoot.textContent = "";
    if (!vulns) {
      vulnRoot.append(el("p", "net-note", vulnFailed ? T("noData") : T("loading")));
      return;
    }
    const feed = el("ol", "sec-cves");
    vulns.cves.forEach((c, i) => {
      const li = el("li", "sec-cve");
      li.style.setProperty("--i", i);
      const head = el("div", "sec-cve-head");
      const link = el("a", "sec-cve-id", c.id);
      link.href = `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(c.id)}`;
      link.target = "_blank";
      link.rel = "noopener";
      const sev = c.severity || "N/A";
      const badge = el("span", `sev sev-${sev.toLowerCase()}`, c.score != null ? `${sev} ${c.score}` : "N/A");
      const mins = Math.max(1, Math.round((Date.now() - new Date(c.published + "Z").getTime()) / 60000));
      const ago =
        mins < 60
          ? `${mins} ${T("agoMin")}`
          : mins < 2880
            ? `${Math.round(mins / 60)} ${T("agoHour")}`
            : `${Math.round(mins / 1440)} ${T("agoDay")}`;
      head.append(link, badge, el("span", "sec-cve-time", ago));
      li.append(head, el("p", "sec-cve-text", c.text.length > 150 ? c.text.slice(0, 150) + "…" : c.text));
      feed.append(li);
    });
    const a = card("~/sec/cve", "newCve", "sec-feed");
    a.body.append(el("p", "sec-count", T("cveCount", { n: num(vulns.total) })), feed);

    const epssList = el("ol", "net-rows");
    vulns.top.forEach((r, i) => {
      const li = el("li", "net-row sec-epss-row");
      li.style.setProperty("--i", i);
      const link = el("a", "net-port", r.cve);
      link.href = `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(r.cve)}`;
      link.target = "_blank";
      link.rel = "noopener";
      const p = Number(r.epss);
      const pct = el(
        "span",
        `sev ${p >= 0.97 ? "sev-critical" : "sev-high"}`,
        `${(Math.floor(p * 10000) / 100).toFixed(2)}%`
      );
      li.append(link, pct);
      epssList.append(li);
    });
    const b = card("~/sec/epss", "epss", "sec-epss");
    b.body.append(epssList, el("p", "net-note sec-pad", T("epssNote", { n: num(vulns.hot) })));
    vulnRoot.append(a.box, b.box);
    vulnRoot.classList.add("is-in");
  }

  function crackTime(pw) {
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/[0-9]/.test(pw)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
    if (/[^\x00-\x7f]/.test(pw)) pool += 60;
    let bits = pw.length * Math.log2(Math.max(pool, 1));
    if (/^(.)\1+$/.test(pw)) bits = Math.min(bits, 8);
    if (/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|zxcv|йцук|пароль|password)/i.test(pw)) bits -= 14;
    bits = Math.max(0, bits);
    const seconds = Math.pow(2, bits) / 1e10 / 2;
    return { bits, seconds };
  }

  function formatTime(s) {
    if (s < 1) return T("instant");
    if (s < 60) return `${Math.round(s)} ${T("sec")}`;
    if (s < 3600) return `${Math.round(s / 60)} ${T("min")}`;
    if (s < 86400) return `${Math.round(s / 3600)} ${T("hour")}`;
    if (s < 31557600) return `${Math.round(s / 86400)} ${T("day")}`;
    const y = s / 31557600;
    if (y > 1e6) return T("forever");
    return `${num(Math.round(y))} ${T("year")}`;
  }

  function passwordCard() {
    const { box, body } = card("~/sec/hibp", "pwTitle", "sec-tool");
    const form = el("form", "sec-form");
    const input = labelled("input", "sec-input", "pwPlaceholder", "placeholder");
    input.type = "password";
    input.autocomplete = "off";
    input.spellcheck = false;
    const btn = labelled("button", "cta-btn is-primary sec-btn", "check");
    btn.type = "submit";
    form.append(input, btn);
    const out = el("div", "sec-out");
    body.append(form, out, labelled("p", "net-note", "pwNote"));
    let last = null;
    const render = () => {
      out.textContent = "";
      if (!last) return;
      const { count, strength } = last;
      const bad = count > 0;
      out.append(
        el(
          "p",
          `sec-verdict ${bad ? "is-bad" : "is-good"}`,
          bad ? T("pwFound", { n: num(count) }) : T("pwClean") + " ✓"
        )
      );
      const t = bad ? T("instant") : formatTime(strength.seconds);
      const level = bad || strength.bits < 40 ? "bad" : strength.bits < 65 ? "ok" : "good";
      const meter = el("div", `sec-strength is-${level}`);
      meter.style.setProperty("--w", `${Math.min(100, (bad ? 5 : strength.bits / 100) * 100)}%`);
      out.append(meter, el("p", "sec-crack", `${T("crack")}: ${t} · ${Math.round(strength.bits)} bit`));
    };
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const pw = input.value;
      if (!pw) return;
      btn.disabled = true;
      try {
        const hash = (await digest("SHA-1", pw)).toUpperCase();
        const res = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`);
        const text = await res.text();
        const line = text.split("\n").find((l) => l.startsWith(hash.slice(5)));
        last = { count: line ? Number(line.split(":")[1]) : 0, strength: crackTime(pw) };
      } catch (e) {
        last = { count: 0, strength: crackTime(pw) };
      }
      btn.disabled = false;
      render();
    });
    return { box, render };
  }

  async function dns(name, type) {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}&do=1`, {
      headers: { accept: "application/dns-json" },
    });
    if (!res.ok) throw new Error(res.status);
    return res.json();
  }
  const txt = (r) =>
    (r.Answer || []).filter((a) => a.type === 16).map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s*"/g, ""));

  function domainCard() {
    const { box, body } = card("~/sec/mail", "domTitle", "sec-tool");
    const form = el("form", "sec-form");
    const input = labelled("input", "sec-input", "domPlaceholder", "placeholder");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("autocapitalize", "off");
    const btn = labelled("button", "cta-btn is-primary sec-btn", "check");
    btn.type = "submit";
    form.append(input, btn);
    const out = el("div", "sec-out");
    body.append(form, out);
    let last = null;
    const render = () => {
      out.textContent = "";
      if (!last) return;
      if (last.error) {
        out.append(el("p", "sec-verdict is-bad", T(last.error)));
        return;
      }
      const r = last;
      out.append(el("p", "sec-domain", r.domain));
      const spfState = !r.spf ? "bad" : /-all/.test(r.spf) ? "good" : /~all/.test(r.spf) ? "ok" : "bad";
      const policy = r.dmarc ? (r.dmarc.match(/;\s*p=(\w+)/i) || [])[1] || "none" : null;
      const dmarcState = !policy ? "bad" : /reject|quarantine/i.test(policy) ? "good" : "ok";
      out.append(
        rows([
          ["spf", r.spf ? r.spf.slice(0, 60) : T("none"), spfState],
          ["dmarc", policy ? `p=${policy}` : T("none"), dmarcState],
          [
            "mx",
            r.mx.length ? r.mx.slice(0, 2).join(", ") + (r.mx.length > 2 ? ` +${r.mx.length - 2}` : "") : T("none"),
            r.mx.length ? "good" : "ok",
          ],
          ["dnssec", r.dnssec ? T("on") : T("off"), r.dnssec ? "good" : "ok"],
          ["caa", r.caa ? T("yes") : T("none"), r.caa ? "good" : "ok"],
          ["mtasts", r.mtasts ? T("yes") : T("none"), r.mtasts ? "good" : "ok"],
        ])
      );
      const verdict =
        spfState !== "bad" && dmarcState === "good"
          ? "safe"
          : spfState !== "bad" || dmarcState !== "bad"
            ? "weak"
            : "unsafe";
      out.append(
        el("p", `sec-verdict is-${verdict === "safe" ? "good" : verdict === "weak" ? "ok" : "bad"}`, T(verdict))
      );
    };
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const domain = input.value
        .trim()
        .toLowerCase()
        .replace(/^[a-z]+:\/\//, "")
        .replace(/[/?#:].*$/, "")
        .replace(/^www\./, "");
      if (!/^(?=.{3,253}$)([a-z0-9-]{1,63}\.)+[a-z]{2,63}$/.test(domain)) {
        last = { error: "badDomain" };
        return render();
      }
      btn.disabled = true;
      try {
        const [a, root, dm, mx, caa, sts] = await Promise.all([
          dns(domain, "A"),
          dns(domain, "TXT"),
          dns(`_dmarc.${domain}`, "TXT"),
          dns(domain, "MX"),
          dns(domain, "CAA"),
          dns(`_mta-sts.${domain}`, "TXT"),
        ]);
        if (a.Status === 3 && root.Status === 3) last = { error: "nx" };
        else
          last = {
            domain,
            spf: txt(root).find((s) => /^v=spf1/i.test(s)) || null,
            dmarc: txt(dm).find((s) => /^v=DMARC1/i.test(s)) || null,
            mx: (mx.Answer || []).filter((x) => x.type === 15).map((x) => x.data.split(" ").pop().replace(/\.$/, "")),
            dnssec: Boolean(a.AD || root.AD),
            caa: (caa.Answer || []).some((x) => x.type === 257),
            mtasts: txt(sts).some((s) => /^v=STSv1/i.test(s)),
          };
      } catch (e) {
        last = { error: "noData" };
      }
      btn.disabled = false;
      render();
    });
    return { box, render };
  }

  async function fingerprint() {
    const ua = navigator.userAgent;
    const browser =
      [
        [/YaBrowser\/(\d+)/, "Yandex"],
        [/Edg\/(\d+)/, "Edge"],
        [/OPR\/(\d+)/, "Opera"],
        [/Firefox\/(\d+)/, "Firefox"],
        [/Chrome\/(\d+)/, "Chrome"],
        [/Version\/(\d+).*Safari/, "Safari"],
      ]
        .map(([re, name]) => (re.exec(ua) ? `${name} ${re.exec(ua)[1]}` : null))
        .find(Boolean) || "—";
    let canvasHash = "—";
    try {
      const c = document.createElement("canvas");
      c.width = 240;
      c.height = 60;
      const g = c.getContext("2d");
      const grad = g.createLinearGradient(0, 0, 240, 0);
      grad.addColorStop(0, "#f2334a");
      grad.addColorStop(1, "#3ad");
      g.fillStyle = grad;
      g.fillRect(0, 0, 240, 60);
      g.font = "18px serif";
      g.fillStyle = "#fff";
      g.fillText("Cwm fjordbank glyphs vext quiz 0xC0FFEE ✓", 8, 34);
      g.globalCompositeOperation = "multiply";
      g.fillStyle = "rgba(20,200,120,0.6)";
      g.beginPath();
      g.arc(180, 30, 22, 0, Math.PI * 2);
      g.fill();
      canvasHash = (await digest("SHA-256", c.toDataURL())).slice(0, 12);
    } catch (e) {}
    let gpu = "—";
    try {
      const gl = document.createElement("canvas").getContext("webgl");
      const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
      if (gl) gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    } catch (e) {}
    const fonts = [
      "Arial",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Times New Roman",
      "Courier New",
      "Calibri",
      "Cambria",
      "Consolas",
      "Menlo",
      "Monaco",
      "Ubuntu",
      "DejaVu Sans",
      "Noto Sans",
      "Tahoma",
      "Verdana",
      "Georgia",
      "PT Sans",
      "SF Pro Text",
      "Comic Sans MS",
    ];
    const probe = document.createElement("canvas").getContext("2d");
    const width = (font) => {
      probe.font = `32px ${font}`;
      return probe.measureText("mmmmmmmmmmlliWWW@#₽Жж").width;
    };
    const bases = ["monospace", "serif", "sans-serif"].map((f) => [f, width(f)]);
    const present = fonts.filter((f) => bases.some(([b, w]) => width(`"${f}", ${b}`) !== w));
    let tz = "—";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {}
    const items = [
      ["fpBrowser", browser],
      [
        "fpPlatform",
        navigator.userAgentData && navigator.userAgentData.platform
          ? navigator.userAgentData.platform
          : navigator.platform || "—",
      ],
      ["fpLangs", (navigator.languages || [navigator.language]).join(", ")],
      [
        "fpScreen",
        `${screen.width}×${screen.height} · ${screen.colorDepth}bit · ×${(window.devicePixelRatio || 1).toFixed(2)}`,
      ],
      ["fpTz", tz],
      [
        "fpCpu",
        `${navigator.hardwareConcurrency || "?"} · ${navigator.deviceMemory ? navigator.deviceMemory + " GB" : "?"}`,
      ],
      ["fpTouch", navigator.maxTouchPoints > 0 ? `✓ ${navigator.maxTouchPoints}` : "✕"],
      ["fpCanvas", canvasHash],
      ["fpGpu", String(gpu).length > 48 ? String(gpu).slice(0, 47) + "…" : String(gpu)],
      ["fpFonts", `${present.length} / ${fonts.length}`],
    ];
    const id = (await digest("SHA-256", items.map((i) => i[1]).join("|") + present.join(","))).slice(0, 16);
    return { items, id: id.match(/.{4}/g).join(" ") };
  }

  function fingerprintCard() {
    const { box, body } = card("~/sec/fingerprint", "fpTitle", "sec-tool");
    let data = null;
    const render = () => {
      body.textContent = "";
      if (!data) {
        body.append(el("p", "net-note", T("loading")));
        return;
      }
      const head = el("div", "sec-fp-id");
      head.append(el("span", "sec-fp-label", T("fpId")), el("span", "sec-fp-hash", data.id));
      body.append(head, rows(data.items.map(([k, v]) => [k, v, "info"])), el("p", "net-note", T("fpNote")));
    };
    render();
    fingerprint().then((d) => {
      data = d;
      render();
    });
    return { box, render };
  }

  function toolboxCard() {
    const { box, body } = card("~/sec/toolkit", "toolTitle", "sec-tool sec-toolbox");
    const tabs = el("div", "sec-tabs");
    const panes = el("div", "sec-panes");
    const list = [
      ["base64", "Base64"],
      ["hash", "tabHash"],
      ["jwt", "JWT"],
      ["gen", "tabGen"],
    ];
    const buttons = list.map(([id, key]) => {
      const b = TX[key] ? labelled("button", "sec-tab", key) : el("button", "sec-tab", key);
      b.type = "button";
      b.dataset.tab = id;
      tabs.append(b);
      return b;
    });

    const b64 = el("div", "sec-pane");
    const b64in = labelled("textarea", "sec-input sec-area", "input", "placeholder");
    const b64out = el("pre", "sec-pre");
    const b64row = el("div", "sec-actions");
    const enc = labelled("button", "cta-btn sec-btn", "encode");
    const dec = labelled("button", "cta-btn sec-btn", "decode");
    enc.type = dec.type = "button";
    b64row.append(enc, dec);
    b64.append(b64in, b64row, b64out);
    enc.addEventListener("click", () => {
      try {
        b64out.textContent = btoa(String.fromCharCode(...new TextEncoder().encode(b64in.value)));
      } catch (e) {
        b64out.textContent = T("badInput");
      }
    });
    dec.addEventListener("click", () => {
      try {
        const bin = atob(b64in.value.trim().replace(/-/g, "+").replace(/_/g, "/"));
        b64out.textContent = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
      } catch (e) {
        b64out.textContent = T("badInput");
      }
    });

    const hash = el("div", "sec-pane");
    const hin = labelled("textarea", "sec-input sec-area", "input", "placeholder");
    const hout = el("div", "sec-hashes");
    hash.append(hin, hout);
    let hashTimer = 0;
    const doHash = async () => {
      const v = hin.value;
      const rowsData = [["MD5", md5(v)]];
      for (const algo of ["SHA-1", "SHA-256", "SHA-512"]) rowsData.push([algo, await digest(algo, v)]);
      hout.textContent = "";
      rowsData.forEach(([k, v2]) => {
        const r = el("div", "sec-hash");
        r.append(el("span", "sec-hash-k", k), el("code", "sec-hash-v", v2));
        hout.append(r);
      });
    };
    hin.addEventListener("input", () => {
      clearTimeout(hashTimer);
      hashTimer = setTimeout(doHash, 120);
    });

    const jwt = el("div", "sec-pane");
    const jin = labelled("textarea", "sec-input sec-area", "jwtInput", "placeholder");
    const jout = el("div", "sec-jwt");
    jwt.append(jin, jout, labelled("p", "net-note", "jwtNote"));
    const b64url = (s) => {
      const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
      return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    };
    jin.addEventListener("input", () => {
      jout.textContent = "";
      const parts = jin.value.trim().split(".");
      if (parts.length < 2) return;
      try {
        const head = JSON.parse(b64url(parts[0]));
        const payload = JSON.parse(b64url(parts[1]));
        jout.append(
          el("pre", "sec-pre", JSON.stringify(head, null, 2)),
          el("pre", "sec-pre", JSON.stringify(payload, null, 2))
        );
        if (payload.exp) {
          const d = new Date(payload.exp * 1000);
          const ok = d > new Date();
          jout.append(
            el(
              "p",
              `sec-verdict is-${ok ? "good" : "bad"}`,
              ok
                ? `${T("valid")} ${d.toLocaleString(I18N.locale)}`
                : `${T("expired")} · ${d.toLocaleString(I18N.locale)}`
            )
          );
        }
      } catch (e) {
        jout.append(el("p", "sec-verdict is-bad", T("badInput")));
      }
    });

    const gen = el("div", "sec-pane");
    const lenRow = el("label", "sec-len");
    const lenLabel = labelled("span", null, "length");
    const lenVal = el("b", null, "20");
    const range = el("input");
    range.type = "range";
    range.min = "8";
    range.max = "64";
    range.value = "20";
    lenRow.append(lenLabel, range, lenVal);
    const sets = [
      ["a-z", "abcdefghijkmnopqrstuvwxyz"],
      ["A-Z", "ABCDEFGHJKLMNPQRSTUVWXYZ"],
      ["0-9", "23456789"],
      ["!@#", "!@#$%^&*()-_=+[]{};:,.?/"],
    ];
    const checks = el("div", "sec-checks");
    const boxes = sets.map(([label]) => {
      const l = el("label", "sec-check");
      const c = el("input");
      c.type = "checkbox";
      c.checked = true;
      l.append(c, el("span", null, label));
      checks.append(l);
      return c;
    });
    const pwOut = el("code", "sec-gen-out allow-copy");
    const genRow = el("div", "sec-actions");
    const genBtn = labelled("button", "cta-btn is-primary sec-btn", "generate");
    const copyBtn = labelled("button", "cta-btn sec-btn", "copy");
    genBtn.type = copyBtn.type = "button";
    genRow.append(genBtn, copyBtn);
    gen.append(lenRow, checks, pwOut, genRow);
    const generate = () => {
      const pool = sets.filter((s, i) => boxes[i].checked).map((s) => s[1]);
      const all = pool.join("") || sets[0][1];
      const n = Number(range.value);
      const rnd = new Uint32Array(n + pool.length);
      crypto.getRandomValues(rnd);
      const chars = Array.from({ length: n }, (_, i) => all[rnd[i] % all.length]);
      pool.forEach((set, i) => (chars[rnd[n + i] % n] = set[rnd[i] % set.length]));
      pwOut.textContent = chars.join("");
    };
    range.addEventListener("input", () => {
      lenVal.textContent = range.value;
      generate();
    });
    boxes.forEach((c) => c.addEventListener("change", generate));
    genBtn.addEventListener("click", generate);
    copyBtn.addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(pwOut.textContent).catch(() => {});
      if (window.APP && window.APP.toast) window.APP.toast(T("copied"));
    });

    const paneList = [b64, hash, jwt, gen];
    panes.append(...paneList);
    const select = (i) => {
      buttons.forEach((b, k) => b.setAttribute("aria-selected", String(k === i)));
      paneList.forEach((p, k) => (p.hidden = k !== i));
      if (i === 1 && !hout.childNodes.length) doHash();
      if (i === 3 && !pwOut.textContent) generate();
    };
    buttons.forEach((b, i) => b.addEventListener("click", () => select(i)));
    select(0);
    body.append(tabs, panes);
    return { box, render: () => {} };
  }

  let started = false;
  let cards = [];

  function start() {
    if (started) return;
    started = true;
    renderConn();
    renderVulns();
    loadConn();
    loadVulns();
    if (toolsRoot) {
      cards = [passwordCard(), domainCard(), fingerprintCard(), toolboxCard()];
      toolsRoot.append(...cards.map((c) => c.box));
    }
  }

  document.addEventListener("pagechange", (event) => event.detail === "info" && start());
  document.addEventListener("langchange", () => {
    if (!started) return;
    renderConn();
    renderVulns();
    applyText(toolsRoot);
    cards.forEach((c) => c.render());
  });
  if (document.documentElement.dataset.view === "info") start();
})();
