(function () {
  "use strict";

  const S = window.SCENES;
  const I18N = window.I18N;
  if (!S || !I18N) return;
  const { makeGrid, path, blink } = S;
  const L = (v) => I18N.pick(v);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const W = 100;
  const H = 27;
  const CYCLE = 18;
  const NUMBER = "+44 20 7946 0123";

  const TXT = {
    a: { ru: "абонент A", uz: "abonent A", en: "caller A" },
    b: { ru: "абонент B", uz: "abonent B", en: "callee B" },
    sw: { ru: "коммутатор", uz: "kommutator", en: "switch" },
    pbx: { ru: "IP-АТС", uz: "IP-ATS", en: "IP-PBX" },
    ssLine: { ru: "SIP-прокси · маршрутизация", uz: "SIP-proksi · marshrutlash", en: "SIP proxy · call routing" },
    ssRoute: { ru: "маршрут +44 → МЦК", uz: "marshrut +44 → MTsK", en: "route +44 → ISC" },
    ssCalls: { ru: "активных вызовов: ", uz: "faol qo‘ng‘iroqlar: ", en: "active calls: " },
    mgw: { ru: "медиашлюз", uz: "media shlyuz", en: "media gateway" },
    rats: { ru: "РАТС", uz: "RATS", en: "LOCAL" },
    ratsLine: { ru: "районная АТС", uz: "tuman ATS", en: "local exchange" },
    pstn: { ru: "ТфОП · SS7", uz: "PSTN · SS7", en: "PSTN · SS7" },
    amts: { ru: "АМТС", uz: "AMTS", en: "TOLL" },
    amtsLine: { ru: "междугородная", uz: "shaharlararo", en: "long-distance" },
    amtsLine2: { ru: "транзит E1", uz: "tranzit E1", en: "E1 transit" },
    mck: { ru: "МЦК", uz: "MTsK", en: "ISC" },
    mckLine: { ru: "международный", uz: "xalqaro", en: "international" },
    mckLine2: { ru: "центр коммутации", uz: "kommutatsiya", en: "switching centre" },
    intl: { ru: "международная сеть", uz: "xalqaro tarmoq", en: "international network" },
    abroad: { ru: "за рубежом", uz: "xorijda", en: "abroad" },
    trunk: { ru: "SIP-транк", uz: "SIP-trank", en: "SIP trunk" },
    calling: { ru: "вызов…", uz: "chaqiruv…", en: "calling…" },
    ringback: { ru: "гудки…", uz: "gudok…", en: "ringing…" },
    incoming: { ru: "» звонок", uz: "» qo‘ng‘iroq", en: "» incoming" },
    hangup: { ru: "отбой", uz: "tugadi", en: "hang up" },
    ready: { ru: "101 готов", uz: "101 tayyor", en: "101 ready" },
    voice: { ru: "RTP · голос G.711", uz: "RTP · ovoz G.711", en: "RTP · voice G.711" },
    cdr: { ru: "разговор {d} · CDR записан", uz: "suhbat {d} · CDR yozildi", en: "call {d} · CDR saved" },
    legend: { ru: "━ сигнализация  • голос RTP  ═ E1", uz: "━ signalizatsiya  • ovoz RTP  ═ E1", en: "━ signalling  • RTP voice  ═ E1" },
    sDial: { ru: "A набирает " + NUMBER, uz: "A raqam teryapti: " + NUMBER, en: "A dials " + NUMBER },
    sInvite: { ru: "INVITE → IAM: вызов идёт к абоненту B", uz: "INVITE → IAM: chaqiruv B abonentga ketmoqda", en: "INVITE → IAM: the call travels to B" },
    sRing: { ru: "180 Ringing ← ACM: у абонента B звонит телефон", uz: "180 Ringing ← ACM: B abonentda telefon jiringlayapti", en: "180 Ringing ← ACM: B's phone is ringing" },
    sOk: { ru: "200 OK ← ANM: абонент B ответил", uz: "200 OK ← ANM: B abonent javob berdi", en: "200 OK ← ANM: B answered" },
    sTalk: { ru: "RTP ↔ разговор ", uz: "RTP ↔ suhbat ", en: "RTP ↔ talking " },
    sBye: { ru: "BYE → REL: отбой", uz: "BYE → REL: aloqa tugadi", en: "BYE → REL: hang up" },
    sIdle: { ru: "линия свободна", uz: "liniya bo‘sh", en: "line is free" },
  };

  const TERMS = [
    ["Softswitch", {
      ru: "программный коммутатор оператора: SIP-сигнализация, маршрутизация вызовов, биллинг, управление медиашлюзами (H.248)",
      uz: "operatorning dasturiy kommutatori: SIP signalizatsiyasi, qo‘ng‘iroqlarni marshrutlash, billing, media shlyuzlarni boshqarish (H.248)",
      en: "the carrier's software switch: SIP signalling, call routing, billing, media gateway control (H.248)",
    }],
    ["MGW", {
      ru: "медиашлюз: переводит голос из IP (SIP/RTP) в каналы E1 и сигнализацию SS7 телефонной сети",
      uz: "media shlyuz: ovozni IP (SIP/RTP) dan E1 kanallariga va telefon tarmog‘ining SS7 signalizatsiyasiga o‘tkazadi",
      en: "media gateway: turns IP voice (SIP/RTP) into E1 channels and SS7 signalling of the phone network",
    }],
    [TXT.pbx, {
      ru: "офисная станция (IP-PBX): внутренние номера, IVR, очереди, запись разговоров",
      uz: "ofis stansiyasi (IP-PBX): ichki raqamlar, IVR, navbatlar, suhbatlarni yozish",
      en: "office phone system (IP-PBX): extensions, IVR, queues, call recording",
    }],
    [TXT.rats, {
      ru: "районная АТС городской телефонной сети (ТфОП)",
      uz: "shahar telefon tarmog‘ining tuman ATS’i",
      en: "local exchange of the city phone network (PSTN)",
    }],
    [TXT.amts, {
      ru: "автоматическая междугородная телефонная станция",
      uz: "avtomatik shaharlararo telefon stansiyasi",
      en: "long-distance (toll) exchange",
    }],
    [TXT.mck, {
      ru: "международный центр коммутации: выход на сети других стран",
      uz: "xalqaro kommutatsiya markazi: boshqa davlatlar tarmoqlariga chiqish",
      en: "international switching centre: the gateway to other countries' networks",
    }],
    ["SIP / ISUP", {
      ru: "сигнализация вызова: INVITE→IAM, 180→ACM, 200 OK→ANM, BYE→REL",
      uz: "qo‘ng‘iroq signalizatsiyasi: INVITE→IAM, 180→ACM, 200 OK→ANM, BYE→REL",
      en: "call signalling: INVITE→IAM, 180→ACM, 200 OK→ANM, BYE→REL",
    }],
    ["RTP", {
      ru: "сам голос: пакеты по 20 мс, кодек G.711",
      uz: "ovozning o‘zi: 20 ms li paketlar, G.711 kodeki",
      en: "the voice itself: 20 ms packets, G.711 codec",
    }],
  ];

  const NODES = [
    { id: "a", x: 0, y: 1, w: 16, h: 6 },
    { id: "sw", x: 22, y: 1, w: 14, h: 6 },
    { id: "pbx", x: 42, y: 1, w: 15, h: 6 },
    { id: "ss", x: 70, y: 1, w: 30, h: 6 },
    { id: "mgw", x: 74, y: 10, w: 22, h: 5 },
    { id: "rats", x: 50, y: 10, w: 17, h: 5 },
    { id: "amts", x: 26, y: 10, w: 17, h: 5 },
    { id: "mck", x: 0, y: 10, w: 19, h: 5 },
    { id: "intl", x: 22, y: 18, w: 40, h: 8 },
    { id: "b", x: 78, y: 18, w: 20, h: 8 },
  ];

  const SEGMENTS = [
    path([16, 4], [21, 4]),
    path([36, 4], [41, 4]),
    path([57, 4], [69, 4]),
    path([85, 7], [85, 9]),
    path([73, 12], [67, 12]),
    path([49, 12], [43, 12]),
    path([25, 12], [19, 12]),
    path([9, 15], [9, 21], [21, 21]),
    path([23, 21], [60, 21]),
    path([62, 21], [77, 21]),
  ];
  const NODE_AFTER = [1, 2, 3, 4, 5, 6, 7, 8, 8, 9];
  const JOINTS = [
    [15, 4, "├"], [22, 4, "┤"], [35, 4, "├"], [42, 4, "┤"], [56, 4, "├"], [70, 4, "┤"],
    [85, 6, "┬"], [85, 10, "┴"], [74, 12, "┤"], [66, 12, "├"], [50, 12, "┤"], [42, 12, "├"],
    [26, 12, "┤"], [18, 12, "├"], [9, 14, "┬"], [22, 21, "┤"], [61, 21, "├"], [78, 21, "┤"],
  ];

  const CELLS = [];
  SEGMENTS.forEach((seg, si) => {
    seg.forEach(([x, y], i) => {
      const dirs = [];
      [seg[i - 1], seg[i + 1]].forEach((n) => {
        if (!n) return;
        if (n[0] > x) dirs.push("r");
        else if (n[0] < x) dirs.push("l");
        else if (n[1] > y) dirs.push("d");
        else dirs.push("u");
      });
      const set = dirs.sort().join("");
      const heavy = si === 8;
      const ch =
        { lr: heavy ? "═" : "─", du: "│", ru: "└", lu: "┘", dr: "┌", dl: "┐", l: heavy ? "═" : "─", r: heavy ? "═" : "─", u: "│", d: "│" }[set] || "─";
      CELLS.push({ x, y, ch, seg: si });
    });
  });
  const N = CELLS.length;

  const PHASES = [
    ["dial", 0, 1.5],
    ["invite", 1.5, 6.5],
    ["ring", 6.5, 8.0],
    ["ok", 8.0, 9.2],
    ["talk", 9.2, 15.0],
    ["bye", 15.0, 16.8],
    ["idle", 16.8, CYCLE],
  ];

  function phaseAt(t) {
    const tt = t % CYCLE;
    for (const [name, a, b] of PHASES) if (tt >= a && tt < b) return { name, p: (tt - a) / (b - a), tt };
    return { name: "idle", p: 0, tt };
  }

  const pad2 = (n) => String(n).padStart(2, "0");
  const talkClock = (sec) => `${pad2(Math.floor(sec / 60))}:${pad2(Math.floor(sec % 60))}`;
  const TALK_LEN = 15.0 - 9.2;

  function drawMap(g, t) {
    const ph = phaseAt(t);
    let head = -1;
    let dir = 1;
    let msg = null;
    if (ph.name === "invite") (head = Math.round(ph.p * (N - 1))), (dir = 1), (msg = ["INVITE", "IAM"]);
    if (ph.name === "ring") (head = Math.round((1 - ph.p) * (N - 1))), (dir = -1), (msg = ["180", "ACM"]);
    if (ph.name === "ok") (head = Math.round((1 - ph.p) * (N - 1))), (dir = -1), (msg = ["200 OK", "ANM"]);
    if (ph.name === "bye") (head = Math.round(ph.p * (N - 1))), (dir = 1), (msg = ["BYE", "REL"]);

    const connected = ["ring", "ok", "talk"].includes(ph.name);
    const reached = new Set(["a"]);
    if (connected) NODES.forEach((n) => reached.add(n.id));
    else if (head >= 0 && dir > 0) {
      const seg = CELLS[head].seg;
      for (let s = 0; s < seg; s++) reached.add(NODES[NODE_AFTER[s]].id);
      if (head === N - 1) reached.add(NODES[NODE_AFTER[seg]].id);
    }

    NODES.forEach((n) => {
      const on = reached.has(n.id);
      g.box(n.x, n.y, n.w, n.h, on ? 1 : 2, null);
    });
    const title = (n, text) => {
      const node = NODES.find((x) => x.id === n);
      g.put(node.x + 2, node.y, ` ${text} `, reached.has(n) ? 3 : 0);
    };

    CELLS.forEach((c, i) => {
      let color = 2;
      if (connected) color = 5;
      else if (head >= 0 && dir > 0 && i <= head) color = 5;
      g.put(c.x, c.y, c.ch, color);
    });
    JOINTS.forEach(([x, y, ch]) => g.put(x, y, ch, 2));

    g.put(17, 3, "LAN", 2);
    g.put(37, 3, "PoE", 2);
    g.put(58, 3, L(TXT.trunk), 2);
    g.put(87, 8, "H.248", 2);
    g.put(67, 11, "E1·SS7", 2);
    g.put(45, 11, "E1", 2);
    g.put(21, 11, "E1", 2);
    g.put(11, 17, "SS7", 2);
    g.put(11, 18, "SIP-I", 2);
    g.put(64, 20, "IP / TDM", 2);

    title("a", L(TXT.a));
    title("sw", "LAN");
    title("pbx", L(TXT.pbx));
    title("ss", "SOFTSWITCH");
    title("mgw", "MGW");
    title("rats", L(TXT.rats));
    title("amts", L(TXT.amts));
    title("mck", L(TXT.mck));
    title("intl", L(TXT.intl));
    title("b", L(TXT.b));

    let aScreen = L(TXT.ready);
    let bScreen = "—";
    if (ph.name === "dial") aScreen = NUMBER.replace(/ /g, "").slice(0, Math.max(1, Math.round(ph.p * 13)));
    if (ph.name === "invite") aScreen = L(TXT.calling);
    if (ph.name === "ring") (aScreen = L(TXT.ringback)), (bScreen = blink(t, 0.5) ? L(TXT.incoming) : "");
    if (ph.name === "ok") (aScreen = "00:00"), (bScreen = "00:00");
    const talkSec = ph.name === "talk" ? ph.tt - 9.2 : 0;
    if (ph.name === "talk") aScreen = bScreen = talkClock(talkSec);
    if (ph.name === "bye") (aScreen = L(TXT.hangup)), (bScreen = head === N - 1 ? L(TXT.hangup) : talkClock(TALK_LEN));
    if (ph.name === "idle") bScreen = "—";

    g.put(2, 2, "╭──────────╮", 2);
    g.put(2, 3, "│", 2);
    g.put(3, 3, aScreen.slice(-10).padEnd(10), ph.name === "talk" ? 1 : 3);
    g.put(13, 3, "│", 2);
    g.put(2, 4, "╰──────────╯", 2);
    g.put(3, 5, "▫▫▫ ▫▫▫ ▫▫▫", ph.name === "dial" && blink(t, 0.25) ? 1 : 2);

    g.put(24, 2, L(TXT.sw), 0);
    for (let k = 0; k < 10; k++) {
      const busy = (connected || ph.name === "invite" || ph.name === "bye") && (Math.floor(t * 9) + k * 3) % 4 === 0;
      g.put(24 + k, 3, "▪", k < 2 ? (busy ? 1 : 3) : 2);
    }
    g.put(24, 5, "VLAN · voice", 2);

    g.put(44, 2, "IP-PBX", 0);
    g.put(44, 3, "ext 101-199", 2);
    g.put(44, 4, "● online", reached.has("pbx") && !blink(t, 0.6) ? 1 : 5);
    g.put(44, 5, "IVR · queue", 2);

    const calls = connected || ph.name === "bye" ? 1 : 0;
    g.put(72, 2, L(TXT.ssLine), 0);
    g.put(72, 3, L(TXT.ssRoute), reached.has("ss") ? 1 : 2);
    g.put(72, 4, L(TXT.ssCalls) + calls, calls ? 3 : 2);
    g.put(72, 5, "CDR · billing · H.248", 2);

    g.put(76, 11, L(TXT.mgw), 0);
    g.put(76, 12, "SIP/RTP ↔ E1/SS7", 2);
    const slots = connected ? 3 : 1;
    g.put(76, 13, "E1 " + "█".repeat(slots) + "░".repeat(8 - slots) + " G.711", connected ? 1 : 2);

    const flow = (x, y, on) => g.put(x, y, on ? ["▸  ", " ▸ ", "  ▸"][Math.floor(t * 6) % 3] : "   ", 1);
    g.put(52, 11, L(TXT.ratsLine), 0);
    g.put(52, 12, L(TXT.pstn), 2);
    flow(52, 13, reached.has("rats") && ph.name !== "idle" && ph.name !== "dial");
    g.put(28, 11, L(TXT.amtsLine), 0);
    g.put(28, 12, L(TXT.amtsLine2), 2);
    flow(28, 13, reached.has("amts") && ph.name !== "idle" && ph.name !== "dial");
    g.put(2, 11, L(TXT.mckLine), 0);
    g.put(2, 12, L(TXT.mckLine2), 0);
    g.put(2, 13, "+998 → +44", reached.has("mck") ? 1 : 2);

    const waves = "~≈~~≈~ ";
    const shift = Math.floor(t * 4);
    for (let x = 23; x < 61; x++) {
      g.put(x, 19, waves[(x + shift) % waves.length], 2);
      g.put(x, 23, waves[(x * 3 - shift + 100) % waves.length], 2);
    }
    const codes = "+998  +7  +44  +49  +1  +86  +90  +971  +82  +33  ";
    const m1 = Math.floor(t * 3) % codes.length;
    const line1 = (codes + codes).slice(m1, m1 + 38);
    const m2 = codes.length - (Math.floor(t * 2) % codes.length);
    const line2 = (codes + codes).slice(m2, m2 + 38);
    [...line1].forEach((ch, i) => g.put(23 + i, 20, ch, ch === "+" ? 5 : 2));
    [...line2].forEach((ch, i) => g.put(23 + i, 22, ch, ch === "+" ? 5 : 2));
    const itu = "ITU-T · SS7 / SIP-I";
    g.put(22 + Math.floor((40 - itu.length) / 2), 24, itu, 0);

    g.put(80, 19, NUMBER, 0);
    g.put(80, 20, "╭──────────────╮", 2);
    g.put(80, 21, "│", 2);
    g.put(81, 21, bScreen.slice(0, 14).padEnd(14), ph.name === "talk" ? 1 : 3);
    g.put(95, 21, "│", 2);
    g.put(80, 22, "╰──────────────╯", 2);
    if (ph.name === "ring") g.put(82, 23, ["(  •  )", "(( • ))", "(((•)))"][Math.floor(t * 6) % 3], 1);
    else g.put(82, 23, "▫▫▫ ▫▫▫ ▫▫▫", 2);
    g.put(80, 24, L(TXT.abroad), 2);

    if (ph.name === "talk") {
      for (let k = 0; k < N; k += 7) {
        const f = (k + Math.floor(t * 12)) % N;
        const b = (N - 1 - ((k + 3 + Math.floor(t * 12)) % N) + N) % N;
        g.put(CELLS[f].x, CELLS[f].y, "•", 3);
        g.put(CELLS[b].x, CELLS[b].y, "•", 1);
      }
    }

    if (head >= 0) {
      for (let k = 3; k >= 0; k--) {
        const i = head - dir * k;
        if (i < 0 || i >= N) continue;
        const c = CELLS[i];
        if (k === 0) {
          const next = CELLS[Math.min(N - 1, Math.max(0, i + dir))];
          const prev = CELLS[Math.min(N - 1, Math.max(0, i - dir))];
          const dx = next !== c ? next.x - c.x : c.x - prev.x;
          const dy = next !== c ? next.y - c.y : c.y - prev.y;
          g.put(c.x, c.y, dx > 0 ? ">" : dx < 0 ? "<" : dy > 0 ? "v" : "^", 3);
        } else g.put(c.x, c.y, c.ch === "│" ? "┃" : "━", 1);
      }
      const c = CELLS[head];
      const label = c.seg >= 4 ? msg[1] : msg[0];
      const fits = (x, y) => {
        for (let i = -1; i <= label.length; i++) if (g.get(x + i, y) !== " ") return false;
        return true;
      };
      const spots = c.ch === "│" ? [[c.x + 2, c.y], [c.x - label.length - 1, c.y]] : [[c.x - Math.floor(label.length / 2), c.y - 1], [c.x - Math.floor(label.length / 2), c.y + 1]];
      const spot = spots.find(([x, y]) => fits(x, y));
      if (spot) g.put(spot[0], spot[1], label, 1);
    }

    const status = {
      dial: L(TXT.sDial),
      invite: L(TXT.sInvite),
      ring: L(TXT.sRing),
      ok: L(TXT.sOk),
      talk: L(TXT.sTalk) + talkClock(talkSec),
      bye: L(TXT.sBye),
      idle: L(TXT.sIdle),
    }[ph.name];
    g.put(0, 26, "> " + status, ph.name === "idle" ? 2 : 1);
    const legend = L(TXT.legend);
    g.put(W - legend.length, 26, legend, 2);
  }

  const LW = 62;
  const LH = 15;
  const COL = { a: 2, pbx: 17, ss: 34, b: 58 };

  function arrow(g, y, x1, x2, label, color, ch = "─") {
    const lo = Math.min(x1, x2);
    const hi = Math.max(x1, x2);
    for (let x = lo + 1; x < hi; x++) g.put(x, y, ch, color);
    if (x2 > x1) g.put(x2 - 1, y, ">", color);
    else g.put(x2 + 1, y, "<", color);
    const text = ` ${label} `;
    g.put(Math.round((lo + hi) / 2 - text.length / 2), y, text, color === 2 ? 0 : 3);
  }

  function drawLadder(g, t) {
    const ph = phaseAt(t);
    const tt = ph.tt;
    const center = (x, text, c) => g.put(Math.round(x - text.length / 2 + 0.5), 0, text, c);
    center(COL.a, "A", 3);
    center(COL.pbx, L(TXT.pbx), 3);
    center(COL.ss, "SOFTSWITCH", 3);
    center(46, L(TXT.pstn).split(" ")[0], 2);
    center(COL.b, "B", 3);
    Object.values(COL).forEach((x) => g.vline(x, 1, LH - 2, 2));

    const events = [
      { at: 1.5, y: 2, hops: [["a", "pbx", "INVITE"], ["pbx", "ss", "INVITE"], ["ss", "b", "IAM", "═"]], span: 4 },
      { at: 6.5, y: 4, hops: [["b", "ss", "ACM", "═"], ["ss", "pbx", "180"], ["pbx", "a", "180"]], span: 1.2 },
      { at: 8.0, y: 6, hops: [["b", "ss", "ANM", "═"], ["ss", "pbx", "200 OK"], ["pbx", "a", "200 OK"]], span: 0.8 },
      { at: 8.7, y: 8, hops: [["a", "pbx", "ACK"], ["pbx", "ss", "ACK"]], span: 0.4 },
      { at: 9.2, y: 10, rtp: true },
      { at: 15.0, y: 12, hops: [["a", "pbx", "BYE"], ["pbx", "ss", "BYE"], ["ss", "b", "REL", "═"]], span: 1.5 },
    ];
    const current = events.filter((e) => tt >= e.at).pop();
    events.forEach((e) => {
      if (tt < e.at) return;
      const color = e === current && ph.name !== "idle" ? 1 : 2;
      if (e.rtp) {
        const text = L(TXT.voice);
        arrow(g, e.y, COL.a, COL.b, text, color, "═");
        g.put(COL.a + 1, e.y, "<", color);
        return;
      }
      e.hops.forEach(([from, to, label, ch], k) => {
        if (tt < e.at + (k * e.span) / e.hops.length) return;
        arrow(g, e.y, COL[from], COL[to], label, color, ch || "─");
      });
    });
    if (ph.name === "idle") {
      const text = L(TXT.cdr).replace("{d}", talkClock(TALK_LEN));
      g.put(Math.round(LW / 2 - text.length / 2), LH - 1, text, 1);
    }
  }

  let active = null;

  function create() {
    if (active) active.dispose();
    const el = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };
    const bar = (left, right) => {
      const b = el("div", "term-bar");
      b.append(el("span", null, left));
      if (right) b.append(right);
      return b;
    };
    const screen = (pre) => {
      const s = el("div", "office-screen");
      s.append(pre);
      return s;
    };

    const mapPre = el("pre", "asc office-pre voip-pre");
    mapPre.setAttribute("aria-hidden", "true");
    mapPre.style.setProperty("--cols", W);
    const ladderPre = el("pre", "asc office-pre");
    ladderPre.setAttribute("aria-hidden", "true");
    ladderPre.style.setProperty("--cols", LW);

    const toggle = el("button", "anim-toggle");
    toggle.type = "button";

    const map = el("div", "term voip-map");
    map.append(bar("~/voip/schema", toggle), screen(mapPre));

    const ladder = el("div", "term voip-ladder");
    const live = el("span", "live", "● SIP");
    ladder.append(bar("~/voip/sip.log", live), screen(ladderPre));

    const terms = el("div", "term voip-terms");
    const dl = el("dl", "facts");
    TERMS.forEach(([name, desc]) => dl.append(el("dt", null, typeof name === "string" ? name : L(name)), el("dd", null, L(desc))));
    terms.append(bar("~/voip/README"), dl);

    const grid = el("div", "office-grid");
    grid.append(ladder, terms);
    const block = el("div", "office-block voip-block");
    block.append(map, grid);

    const g = makeGrid(W, H);
    const lg = makeGrid(LW, LH);
    let paused = reduceMotion;
    let visible = false;
    let raf = 0;
    let last = 0;
    let offset = 0;
    let stoppedAt = 10.5;

    function draw(time) {
      g.clear();
      drawMap(g, time);
      mapPre.innerHTML = g.html();
      lg.clear();
      drawLadder(lg, time);
      ladderPre.innerHTML = lg.html();
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < 100) return;
      last = now;
      stoppedAt = (now - offset) / 1000;
      draw(stoppedAt);
    }
    function sync() {
      const run = visible && !paused && !document.hidden;
      if (run && !raf) {
        offset = performance.now() - stoppedAt * 1000;
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
    function syncToggle() {
      toggle.textContent = `[ ${I18N.t(paused ? "anim.play" : "anim.pause")} ]`;
      toggle.setAttribute("aria-pressed", String(!paused));
    }
    toggle.addEventListener("click", () => {
      paused = !paused;
      syncToggle();
      sync();
    });
    syncToggle();
    draw(stoppedAt);

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            visible = entries[entries.length - 1].isIntersecting;
            sync();
          })
        : null;
    if (observer) observer.observe(block);
    else visible = true;
    document.addEventListener("visibilitychange", sync);

    active = {
      dispose() {
        cancelAnimationFrame(raf);
        raf = 0;
        if (observer) observer.disconnect();
        document.removeEventListener("visibilitychange", sync);
      },
    };
    return block;
  }

  window.VOIP = { create };
})();
