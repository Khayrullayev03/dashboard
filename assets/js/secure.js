(function () {
  "use strict";

  const S = window.SCENES;
  const I18N = window.I18N;
  if (!S || !I18N) return;
  const { makeGrid, blink, hash } = S;
  const L = (v) => I18N.pick(v);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const W = 40;
  const H = 11;
  const pad = (n, len = 3) => String(n).padStart(len, "0");
  const hhmm = (min) => `${pad(9 + Math.floor(min / 60), 2)}:${pad(min % 60, 2)}`;

  const PRINCIPLES = {
    ru: [
      "минимум прав",
      "всё логируется",
      "без выхода в интернет",
      "шифрование каналов",
      "резервные копии офлайн",
      "контроль носителей",
    ],
    uz: [
      "minimal huquqlar",
      "hammasi qayd etiladi",
      "internetga chiqishsiz",
      "kanallarni shifrlash",
      "oflayn zaxira nusxalar",
      "tashuvchilar nazorati",
    ],
    en: [
      "least privilege",
      "everything is logged",
      "no internet access",
      "encrypted links",
      "offline backups",
      "media control",
    ],
  };

  const CARDS = [
    {
      id: "airgap",
      title: { ru: "Закрытый контур", uz: "Yopiq kontur", en: "Closed network" },
      points: {
        ru: [
          "Физически изолированная сеть без интернета",
          "Данные и обновления — только через проверенные носители",
          "Отдельные рабочие места и учётные записи",
        ],
        uz: [
          "Internetsiz jismonan izolyatsiyalangan tarmoq",
          "Ma’lumot va yangilanishlar — faqat tekshirilgan tashuvchilar orqali",
          "Alohida ish joylari va hisob yozuvlari",
        ],
        en: [
          "Physically isolated network with no internet",
          "Data and updates only via verified media",
          "Separate workstations and accounts",
        ],
      },
      draw(g, t) {
        g.box(0, 0, 19, 7, 1, "CLOSED", 3);
        g.box(21, 0, 19, 7, 2, "INTERNET", 0);
        for (let y = 0; y < 7; y++) g.put(19, y, "║║", blink(t + y * 0.12, 1.4) ? 1 : 5);
        g.put(1, 1, "[SRV]─[WS1]─[WS2]", 0);
        g.put(3, 2, "│", 2);
        g.put(9, 2, "│", 2);
        g.put(15, 2, "│", 2);
        g.put(1, 3, "[NVR]─[WS3]─[LOG]", 0);
        g.put(1, 5, "no WAN · isolated", 2);
        const loop = [
          [6, 1],
          [12, 1],
          [15, 2],
          [12, 3],
          [6, 3],
          [3, 2],
        ];
        const [lx, ly] = loop[Math.floor(t * 5) % loop.length];
        g.put(lx, ly, "•", 1);

        g.put(23, 1, "◇  ◇   ◇  ◇", 2);
        const hits = Math.floor(t / 1.4);
        const ax = Math.round(38 - ((t / 1.4) % 1) * 16);
        g.put(ax > 22 ? ax : 22, 3, ax > 22 ? "«" : "✕", 1);
        g.put(23, 5, `blocked ${pad(hits)}`, 1);

        const c = t % 5;
        const stage = c < 1.2 ? 0 : c < 3 ? 1 : c < 4 ? 2 : 3;
        g.put(7, 8, "[USB]", stage === 0 ? 1 : 3);
        g.put(12, 8, "──▸", 2);
        g.put(15, 8, "[SCAN]", stage === 1 ? 1 : stage > 1 ? 3 : 2);
        g.put(21, 8, "──▸", 2);
        g.put(24, 8, "[IMPORT]", stage === 2 ? 1 : stage > 2 ? 3 : 2);
        const mark = (at) => (c > at ? "✓" : stage === 1 ? "|/-\\"[Math.floor(t * 8) % 4] : "·");
        g.put(7, 9, `AV ${mark(1.6)}  hash ${mark(2.2)}  log ${mark(2.7)}`, 2);
        const status = ["› media inserted", "› scanning media…", "› import to closed net", "› verified ✓ · 0 threats"][
          stage
        ];
        g.put(0, 10, status, stage === 3 ? 1 : 2);
      },
    },
    {
      id: "vpn",
      title: { ru: "Шифрованные каналы", uz: "Shifrlangan kanallar", en: "Encrypted links" },
      points: {
        ru: [
          "VPN-туннели между штабом и удалёнными объектами",
          "IPsec / IKEv2, шифрование AES-256",
          "Резервный канал при обрыве связи",
        ],
        uz: [
          "Shtab va uzoqdagi obyektlar orasida VPN tunnellar",
          "IPsec / IKEv2, AES-256 shifrlash",
          "Aloqa uzilganda zaxira kanal",
        ],
        en: [
          "VPN tunnels between HQ and remote sites",
          "IPsec / IKEv2, AES-256 encryption",
          "Backup link when a line goes down",
        ],
      },
      draw(g, t) {
        const c = t % 10;
        const down = c > 6 && c < 8.6;
        g.put(0, 1, "SITE-1", 3);
        g.put(6, 1, "╞" + "═".repeat(9) + "╡", 2);
        g.put(17, 1, "[HQ]", 1);
        g.put(21, 1, "╞", 2);
        g.put(22, 1, down ? "┄┄┄┄✕┄┄┄┄" : "═".repeat(9), down ? 1 : 2);
        g.put(31, 1, "╡", 2);
        g.put(32, 1, "SITE-2", 3);
        for (let y = 2; y <= 4; y++) g.put(18, y, "║", 2);
        g.put(15, 5, "SITE-3", 3);

        g.put(7 + (Math.floor(t * 8) % 9), 1, "▓", 1);
        g.put(15 - (Math.floor(t * 6) % 9), 1, "░", 3);
        if (!down) {
          g.put(22 + (Math.floor(t * 7) % 9), 1, "▓", 1);
          g.put(30 - (Math.floor(t * 5) % 9), 1, "░", 3);
        } else {
          g.put(24, 2, "· · LTE · ·", 5);
          g.put(24 + (Math.floor(t * 6) % 10), 2, "▓", 1);
        }
        g.put(18, 2 + (Math.floor(t * 4) % 3), "▓", 1);

        g.put(0, 7, "IKEv2 · AES-256 · SHA-256", 2);
        g.put(0, 8, "T1 up 3ms", 0);
        g.put(11, 8, down ? "T2 DOWN→LTE" : "T2 up 4ms", down ? 1 : 0);
        g.put(24, 8, "T3 up 6ms", 0);
        const left = 60 - Math.floor((t * 6) % 60);
        g.put(0, 9, "rekey ", 2);
        g.bar(6, 9, 14, left / 60, 5, 2, "▓", "░");
        g.put(21, 9, `${pad(left, 2)}s`, 2);
        g.put(0, 10, down ? "› T2 lost · traffic moved to backup" : "› 3 tunnels up · traffic encrypted", down ? 1 : 2);
      },
    },
    {
      id: "acs",
      title: { ru: "СКУД", uz: "SKUD", en: "Access control" },
      points: {
        ru: ["Карты и коды доступа по зонам", "Журнал всех проходов с временем", "Блокировка утерянных карт"],
        uz: [
          "Zonalar bo‘yicha kartalar va kirish kodlari",
          "Barcha o‘tishlar vaqti bilan jurnalda",
          "Yo‘qolgan kartalarni bloklash",
        ],
        en: ["Cards and access codes by zone", "Log of every entry with time", "Blocking of lost cards"],
      },
      draw(g, t) {
        const k = Math.floor(t / 1.6);
        const phase = (t / 1.6) % 1;
        const cards = ["#0417", "#2290", "#1183", "#0952", "#3307"];
        const entry = (i) => ({
          time: hhmm(i * 3 + 12),
          card: hash(i * 3.1) > 0.82 ? "#????" : cards[i % cards.length],
          ok: hash(i * 3.1) <= 0.82,
        });
        const now = entry(k);
        const open = now.ok && phase < 0.6;

        g.box(0, 0, 12, 8, 2);
        g.put(3, 1, "ZONE B", 3);
        g.put(3, 2, "┌────┐", 0);
        for (let y = 3; y <= 5; y++) {
          g.put(3, y, "│", 0);
          g.put(8, y, "│", 0);
          g.put(4, y, open ? "░░░░" : "    ", 5);
        }
        g.put(7, 4, open ? " " : "●", 3);
        g.put(3, 6, "└────┘", 0);
        g.put(13, 3, "┌─┐", 2);
        g.put(13, 4, "│", 2);
        g.put(14, 4, "■", now.ok ? 3 : blink(t, 0.3) ? 1 : 2);
        g.put(15, 4, "│", 2);
        g.put(13, 5, "└─┘", 2);

        g.put(18, 0, "TIME  CARD  RESULT", 2);
        for (let r = 0; r < 7; r++) {
          const i = k - 6 + r;
          if (i < 0) continue;
          const e = entry(i);
          const last = r === 6;
          g.put(18, 1 + r, `${e.time} ${e.card} ${e.ok ? "✓ ok" : "✕ deny"}`, !e.ok ? 1 : last ? 3 : 0);
        }
        let denied = 0;
        for (let i = 0; i <= k; i++) if (!entry(i).ok) denied++;
        g.put(0, 9, `› today: ${pad(100 + k)} passes · ${denied} denied`, 2);
        g.put(
          0,
          10,
          now.ok ? `› ${now.card} → zone B · access granted` : "› unknown card → alarm to guard",
          now.ok ? 0 : 1
        );
      },
    },
    {
      id: "perimeter",
      title: { ru: "Охрана периметра", uz: "Perimetr qo‘riqlash", en: "Perimeter security" },
      points: {
        ru: [
          "IP-камеры по всему периметру",
          "Детекция движения и тревожные зоны",
          "Архив записей на защищённом сервере",
        ],
        uz: [
          "Butun perimetr bo‘ylab IP-kameralar",
          "Harakatni aniqlash va xavfli zonalar",
          "Yozuvlar arxivi himoyalangan serverda",
        ],
        en: [
          "IP cameras along the whole perimeter",
          "Motion detection and alarm zones",
          "Recording archive on a secured server",
        ],
      },
      draw(g, t) {
        const c = t % 8;
        const alarm = c > 3.6 && c < 6.4;
        g.box(2, 0, 36, 8, alarm ? 1 : 2, "PERIMETER", alarm ? 1 : 0);
        g.put(15, 3, "[ OBJECT ]", 3);
        g.put(15, 4, " ▪▪▪▪▪▪▪▪ ", 2);
        const cams = [
          [4, 1, 0.6],
          [34, 1, 2.4],
          [4, 6, -0.6],
          [34, 6, 3.8],
        ];
        cams.forEach(([x, y, base], i) => {
          const a = base + Math.sin(t * 0.9 + i) * 0.6;
          for (let r = 1; r <= 4; r++) {
            const cx = Math.round(x + Math.cos(a) * r * 2);
            const cy = Math.round(y + Math.sin(a) * r);
            if (cx > 2 && cx < 37 && cy > 0 && cy < 7 && g.get(cx, cy) === " ")
              g.put(cx, cy, "·", alarm && i === 2 ? 1 : 5);
          }
          g.put(x, y, `C${i + 1}`, alarm && i === 2 ? 1 : 3);
        });
        let ix = 39;
        let iy = 9;
        if (c < 3) ix = Math.round(39 - (c / 3) * 19);
        else if (c < 3.6) (ix = 20), (iy = 9);
        else (ix = 20), (iy = 8);
        if (c < 6.4) g.put(ix, iy, "x", alarm ? 1 : 0);
        if (alarm) {
          g.put(18, 7, "▓▓▓▓▓", blink(t, 0.3) ? 1 : 5);
          for (let k = 1; k < 5; k++) g.put(4 + k * 4, 6 + Math.round((k / 5) * 2), "·", 1);
        }
        g.put(
          0,
          10,
          alarm ? (blink(t, 0.5) ? "› ALARM · zone S · C3 recording" : "") : "› motion: none · 4 cams online",
          alarm ? 1 : 2
        );
      },
    },
    {
      id: "rights",
      title: { ru: "Разграничение прав", uz: "Huquqlarni ajratish", en: "Rights separation" },
      points: {
        ru: [
          "Группы и уровни доступа в Active Directory",
          "Принцип минимальных прав",
          "Доступ к папкам и системам только по роли",
        ],
        uz: [
          "Active Directory’da guruhlar va kirish darajalari",
          "Minimal huquqlar tamoyili",
          "Papka va tizimlarga faqat rol bo‘yicha kirish",
        ],
        en: [
          "Groups and access levels in Active Directory",
          "Principle of least privilege",
          "Folders and systems by role only",
        ],
      },
      draw(g, t) {
        const reqs = [
          ["ivanov", "archive", "G-L2", true],
          ["petrova", "finance", "G-L1", false],
          ["karimov", "docs", "G-L1", true],
          ["guest01", "servers", null, false],
          ["admin.s", "servers", "G-ADM", true],
        ];
        const k = Math.floor(t / 2.2);
        const p = (t / 2.2) % 1;
        const [user, share, group, ok] = reqs[k % reqs.length];
        const tree = [
          ["DC01.corp.local", null, 3],
          ["├─ OU=Staff", null, 0],
          ["│  ├─ G-L1   (12)", "G-L1", 0],
          ["│  ├─ G-L2    (5)", "G-L2", 0],
          ["│  └─ G-ADM   (2)", "G-ADM", 0],
          ["└─ OU=Servers", null, 0],
        ];
        tree.forEach(([text, id, c], y) => g.put(0, y, text, id && id === group && p > 0.35 ? 1 : c));
        g.put(21, 0, "REQUEST", 2);
        g.put(21, 1, user, 3);
        g.put(21, 2, `→ \\\\fs\\${share}`, 0);
        g.put(21, 3, "check " + "·".repeat(Math.min(5, Math.floor(p * 12))), 2);
        if (p > 0.45) g.put(21, 4, ok ? `✓ ALLOW · ${group}` : "✕ DENY · no rights", ok ? 3 : 1);
        g.put(0, 7, "GPO: USB off · lock 5m · audit on", 2);
        for (let r = 0; r < 3; r++) {
          const i = k - 3 + r;
          if (i < 0) continue;
          const [u, s, , o] = reqs[i % reqs.length];
          g.put(0, 8 + r, `${hhmm(i * 4 + 30)} ${u.padEnd(8)} ${s.padEnd(8)} ${o ? "✓" : "✕"}`, o ? 2 : 1);
        }
      },
    },
    {
      id: "audit",
      title: { ru: "Учёт и аудит", uz: "Hisob va audit", en: "Accounting and audit" },
      points: {
        ru: [
          "Инвентаризация и пломбирование техники",
          "Контроль USB-портов и съёмных носителей",
          "Журнал событий: кто, когда и что делал",
        ],
        uz: [
          "Texnikani inventarizatsiya va plombalash",
          "USB portlar va olinadigan tashuvchilar nazorati",
          "Hodisalar jurnali: kim, qachon va nima qildi",
        ],
        en: [
          "Asset inventory and seals",
          "Control of USB ports and removable media",
          "Event log: who did what and when",
        ],
      },
      draw(g, t) {
        const assets = [
          ["PC-014", "8H2K19", "#0451"],
          ["PC-015", "8H2K22", "#0452"],
          ["NB-003", "5F1L07", "#0453"],
          ["SW-02", "CX9A11", "#0454"],
          ["NVR-1", "HK7D03", "#0455"],
        ];
        const c = t % 7;
        const row = Math.min(5, Math.floor(c / 0.8));
        g.put(0, 0, "ASSET   S/N      SEAL   OK", 2);
        assets.forEach(([a, sn, seal], i) => {
          const done = i < row;
          const scan = i === row;
          g.put(0, 1 + i, a, scan ? 1 : 0);
          g.put(8, 1 + i, sn, scan ? 1 : 2);
          g.put(17, 1 + i, seal, scan ? 1 : 2);
          g.put(24, 1 + i, done ? "✓" : scan ? "|/-\\"[Math.floor(t * 8) % 4] : "·", done ? 3 : 1);
        });
        if (row < 5) g.put(27, 1 + row, "◂ scan", 1);
        const usb = c > 4.6 && c < 6.2;
        g.put(0, 7, usb ? "USB on PC-015 → BLOCKED" : "login ivanov · PC-014 · ok", usb ? (blink(t, 0.3) ? 1 : 5) : 2);
        g.put(0, 8, `inventory ${Math.min(row, 5)}/5 · seals intact`, row >= 5 ? 3 : 2);
        g.put(0, 10, `› audit: ${pad(128 + Math.floor(t / 7) * 6, 4)} events logged`, 2);
      },
    },
  ];

  let active = null;

  function create() {
    if (active) active.dispose();
    const el = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };

    const block = el("div", "office-block secure-block");
    const chips = el("ul", "skill-chips secure-principles");
    (L(PRINCIPLES) || []).forEach((p, i) => {
      const li = el("li", "skill-chip", p);
      li.style.setProperty("--i", i);
      chips.append(li);
    });
    block.append(chips);

    const grid = el("div", "secure-grid");
    const players = [];
    CARDS.forEach((card, i) => {
      const pre = el("pre", "asc office-pre");
      pre.setAttribute("aria-hidden", "true");
      pre.style.setProperty("--cols", W);
      const screen = el("div", "office-screen");
      screen.append(pre);
      const bar = el("div", "term-bar");
      bar.append(el("span", null, `~/secure/${pad(i + 1, 2)}-${card.id}`), el("span", "live", "●"));
      const info = el("div", "secure-info");
      const list = el("ul", "points");
      (L(card.points) || []).forEach((p) => list.append(el("li", null, p)));
      info.append(el("h4", "secure-title", L(card.title)), list);
      const box = el("article", "term secure-card");
      box.append(bar, screen, info);
      grid.append(box);
      const g = makeGrid(W, H);
      const player = {
        box,
        visible: false,
        draw(time) {
          g.clear();
          card.draw(g, time);
          g.paint(pre);
        },
      };
      player.draw(2.5 + i);
      players.push(player);
    });
    block.append(grid);

    let raf = 0;
    let last = 0;
    const start = performance.now();
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < 110) return;
      last = now;
      const time = (now - start) / 1000;
      players.forEach((p) => p.visible && p.draw(time));
    }
    function sync() {
      const run = !reduceMotion && !document.hidden && players.some((p) => p.visible);
      if (run && !raf) raf = requestAnimationFrame(frame);
      else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              const p = players.find((x) => x.box === entry.target);
              if (p) p.visible = entry.isIntersecting;
            });
            sync();
          })
        : null;
    if (observer) players.forEach((p) => observer.observe(p.box));
    else players.forEach((p) => (p.visible = true));
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

  window.SECURE = { create };
})();
