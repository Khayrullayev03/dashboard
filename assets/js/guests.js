(function () {
  "use strict";

  const I18N = window.I18N;
  const page = document.querySelector('[data-page="guests"]');
  if (!I18N || !page) return;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const L = (v) => (typeof v === "string" ? v : I18N.pick(v));
  const C = (ru, uz, en) => ({ ru, uz, en });
  const store = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
    },
  };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const button = (cls, text) => {
    const b = el("button", cls, text);
    b.type = "button";
    return b;
  };
  const bar = (path, right) => {
    const b = el("div", "term-bar");
    b.append(el("span", null, path));
    if (right) b.append(right);
    return b;
  };

  const TX = {
    morning: C("Доброе утро", "Xayrli tong", "Good morning"),
    day: C("Добрый день", "Xayrli kun", "Good afternoon"),
    evening: C("Добрый вечер", "Xayrli kech", "Good evening"),
    night: C("Доброй ночи", "Xayrli tun", "Good night"),
    guest: C("гость", "mehmon", "guest"),
    from: C("подключение из", "ulanish joyi", "connecting from"),
    unknown: C("где-то в интернете", "internetning qayeridir", "somewhere on the internet"),
    first: C(
      "вы здесь впервые — добро пожаловать!",
      "siz bu yerda birinchi marta — xush kelibsiz!",
      "first time here — welcome!"
    ),
    again: C(
      "визит №{n} — рад снова видеть",
      "{n}-tashrif — sizni yana ko‘rganimdan xursandman",
      "visit #{n} — good to see you again"
    ),
    time: C("у вас сейчас", "sizda hozir", "your time"),
    qOf: C("вопрос {n} из {total}", "{total} tadan {n}-savol", "question {n} of {total}"),
    yes: C("Да", "Ha", "Yes"),
    no: C("Нет", "Yo‘q", "No"),
    dunno: C("Не знаю", "Bilmayman", "Not sure"),
    grade: C("защита офиса", "ofis himoyasi", "office security"),
    tipsTitle: C(
      "Что стоит исправить в первую очередь",
      "Birinchi navbatda nimani tuzatish kerak",
      "What to fix first"
    ),
    perfect: C(
      "Отличный результат — у вас всё под контролем.",
      "Ajoyib natija — hammasi nazorat ostida.",
      "Great result — everything is under control."
    ),
    audit: C("Обсудить аудит в Telegram", "Telegram’da auditni muhokama qilish", "Discuss an audit on Telegram"),
    restart: C("Пройти заново", "Qaytadan o‘tish", "Start over"),
    verdict: [
      C(
        "Критично: офис уязвим, нужна срочная помощь.",
        "Jiddiy: ofis zaif, shoshilinch yordam kerak.",
        "Critical: the office is vulnerable and needs urgent help."
      ),
      C(
        "Слабо: много дыр, через которые можно потерять данные.",
        "Zaif: ma’lumotni yo‘qotish mumkin bo‘lgan teshiklar ko‘p.",
        "Weak: plenty of holes that can cost you data."
      ),
      C(
        "Средне: база есть, но риски остаются.",
        "O‘rtacha: asos bor, lekin xavflar qolmoqda.",
        "Fair: the basics are there, but risks remain."
      ),
      C(
        "Хорошо: осталось закрыть несколько пунктов.",
        "Yaxshi: bir nechta bandni yopish qoldi.",
        "Good: just a few points left to close."
      ),
      C(
        "Отлично: защита на высоком уровне.",
        "A’lo: himoya yuqori darajada.",
        "Excellent: protection is at a high level."
      ),
    ],
    nick: C("никнейм", "taxallus", "nickname"),
    text: C("ваш комментарий", "izohingiz", "your comment"),
    send: C("[ отправить ]", "[ yuborish ]", "[ send ]"),
    soon: C(
      "Гостевая книга открывается — совсем скоро здесь можно будет оставить комментарий.",
      "Mehmonlar kitobi ochilmoqda — tez orada bu yerda izoh qoldirish mumkin bo‘ladi.",
      "The guestbook is opening — you'll be able to leave a comment here very soon."
    ),
    empty: C("Пока пусто — станьте первым!", "Hozircha bo‘sh — birinchi bo‘ling!", "Nothing here yet — be the first!"),
    loading: C("Загружаю комментарии…", "Izohlar yuklanmoqda…", "Loading comments…"),
    error: C("Не удалось загрузить комментарии", "Izohlarni yuklab bo‘lmadi", "Couldn't load comments"),
    sent: C("Спасибо! Комментарий опубликован.", "Rahmat! Izoh e’lon qilindi.", "Thanks! Your comment is published."),
    rules: C(
      "Комментарий увидят все гости сайта. Ссылки не принимаются.",
      "Izohni saytning barcha mehmonlari ko‘radi. Havolalar qabul qilinmaydi.",
      "Every visitor will see your comment. Links are not accepted."
    ),
    noLinks: C(
      "Без ссылок, пожалуйста — уберите адрес сайта из текста",
      "Havolasiz, iltimos — matndan sayt manzilini olib tashlang",
      "No links, please — remove the web address from the text"
    ),
    tooShort: C("Напишите никнейм и комментарий", "Taxallus va izoh yozing", "Write a nickname and a comment"),
    wait: C(
      "Подождите минуту перед следующим комментарием",
      "Keyingi izohdan oldin bir daqiqa kuting",
      "Please wait a minute before the next comment"
    ),
    fail: C(
      "Не получилось отправить, попробуйте позже",
      "Yuborib bo‘lmadi, keyinroq urinib ko‘ring",
      "Couldn't send, please try later"
    ),
    more: C("[ показать ещё ]", "[ yana ko‘rsatish ]", "[ show more ]"),
    count: C(
      ["{n} комментарий", "{n} комментария", "{n} комментариев"],
      ["{n} ta izoh"],
      ["{n} comment", "{n} comments"]
    ),
  };
  const T = (key, vars) => {
    let s = L(TX[key]);
    if (vars) Object.keys(vars).forEach((k) => (s = s.replace(`{${k}}`, vars[k])));
    return s;
  };

  const QUESTIONS = [
    [
      C(
        "Есть резервные копии важных данных, и восстановление из них проверялось за последние 3 месяца?",
        "Muhim ma’lumotlarning zaxira nusxalari bormi va ulardan tiklash so‘nggi 3 oyda tekshirilganmi?",
        "Do you back up important data, and was a restore tested in the last 3 months?"
      ),
      C(
        "Настроить ежедневные бэкапы по правилу 3-2-1 и раз в квартал проверять восстановление.",
        "Har kuni 3-2-1 qoidasi bo‘yicha zaxira nusxalashni sozlash va har chorakda tiklashni tekshirish.",
        "Set up daily 3-2-1 backups and test a restore every quarter."
      ),
      3,
    ],
    [
      C(
        "У каждого сотрудника свой логин, общих паролей нет?",
        "Har bir xodimning o‘z logini bormi, umumiy parollar yo‘qmi?",
        "Does every employee have their own login, with no shared passwords?"
      ),
      C(
        "Завести личные учётные записи (Active Directory) и отказаться от общих паролей.",
        "Shaxsiy hisoblar (Active Directory) yaratish va umumiy parollardan voz kechish.",
        "Create personal accounts (Active Directory) and drop shared passwords."
      ),
      2,
    ],
    [
      C(
        "Пароль Wi-Fi сменён с заводского, а гостевой Wi-Fi отделён от рабочей сети?",
        "Wi-Fi paroli zavod parolidan o‘zgartirilganmi, mehmon Wi-Fi ishchi tarmoqdan ajratilganmi?",
        "Is the Wi-Fi password changed from the default, and is guest Wi-Fi separated from the work network?"
      ),
      C(
        "Сменить пароль Wi-Fi и вынести гостей в отдельную сеть (VLAN).",
        "Wi-Fi parolini almashtirish va mehmonlarni alohida tarmoqqa (VLAN) chiqarish.",
        "Change the Wi-Fi password and move guests to a separate network (VLAN)."
      ),
      2,
    ],
    [
      C(
        "Заводские пароли на роутере, камерах и принтерах заменены?",
        "Router, kamera va printerlardagi zavod parollari almashtirilganmi?",
        "Are default passwords on the router, cameras and printers replaced?"
      ),
      C(
        "Заменить заводские пароли на всём сетевом оборудовании — это первое, что пробуют взломщики.",
        "Barcha tarmoq uskunalaridagi zavod parollarini almashtirish — buzg‘unchilar birinchi shuni sinaydi.",
        "Replace default passwords on all network gear — it's the first thing attackers try."
      ),
      2,
    ],
    [
      C(
        "Windows и программы обновляются регулярно?",
        "Windows va dasturlar muntazam yangilanadimi?",
        "Are Windows and software updated regularly?"
      ),
      C(
        "Включить автообновления или централизованно ставить обновления (WSUS).",
        "Avtomatik yangilanishni yoqish yoki yangilanishlarni markazlashgan holda o‘rnatish (WSUS).",
        "Turn on automatic updates or deploy them centrally (WSUS)."
      ),
      2,
    ],
    [
      C(
        "На всех компьютерах работает антивирус (хотя бы Защитник Windows)?",
        "Barcha kompyuterlarda antivirus ishlaydimi (hech bo‘lmasa Windows Defender)?",
        "Is antivirus running on every computer (at least Windows Defender)?"
      ),
      C(
        "Включить антивирус везде и проверить, что он обновляет базы.",
        "Hamma joyda antivirusni yoqish va bazalarini yangilashini tekshirish.",
        "Enable antivirus everywhere and make sure it updates."
      ),
      1,
    ],
    [
      C(
        "Уволенный сотрудник сразу теряет доступ ко всем системам?",
        "Ishdan bo‘shagan xodim barcha tizimlarga kirishni darhol yo‘qotadimi?",
        "Does a departing employee lose access to every system right away?"
      ),
      C(
        "Сделать чек-лист увольнения: отключить учётку, почту, VPN, сменить общие пароли.",
        "Ishdan bo‘shatish chek-listini tuzish: hisob, pochta, VPN’ni o‘chirish, umumiy parollarni almashtirish.",
        "Create an offboarding checklist: disable the account, mail, VPN, and rotate shared passwords."
      ),
      2,
    ],
    [
      C(
        "Почта и банк-клиент защищены двухфакторной аутентификацией?",
        "Pochta va bank-mijoz ikki bosqichli autentifikatsiya bilan himoyalanganmi?",
        "Are email and online banking protected with two-factor authentication?"
      ),
      C(
        "Включить двухфакторную защиту на почте, банке и админ-панелях.",
        "Pochta, bank va admin panellarida ikki bosqichli himoyani yoqish.",
        "Turn on two-factor authentication for email, banking and admin panels."
      ),
      2,
    ],
    [
      C(
        "Серверы и сетевое оборудование подключены к ИБП?",
        "Serverlar va tarmoq uskunalari UPS’ga ulanganmi?",
        "Are servers and network equipment on a UPS?"
      ),
      C(
        "Поставить ИБП, чтобы скачки и отключения света не ломали оборудование и данные.",
        "Kuchlanish sakrashlari va o‘chishlar uskuna va ma’lumotni buzmasligi uchun UPS o‘rnatish.",
        "Install a UPS so power surges and outages don't break hardware and data."
      ),
      1,
    ],
    [
      C(
        "Кто-то следит за серверами и сетью и получает оповещения о сбоях?",
        "Serverlar va tarmoqni kimdir kuzatib, nosozliklar haqida xabar oladimi?",
        "Does someone monitor servers and the network and get alerts about failures?"
      ),
      C(
        "Настроить мониторинг (Zabbix) с оповещениями в Telegram — узнавать о проблеме раньше сотрудников.",
        "Telegram’ga ogohlantirishli monitoringni (Zabbix) sozlash — muammoni xodimlardan oldin bilish.",
        "Set up monitoring (Zabbix) with Telegram alerts — hear about problems before your staff do."
      ),
      2,
    ],
  ];

  let visit = Number(store.get("guestVisits") || 0);
  try {
    if (!sessionStorage.getItem("guestSeen")) {
      visit += 1;
      store.set("guestVisits", String(visit));
      sessionStorage.setItem("guestSeen", "1");
    }
  } catch (e) {
    visit = visit || 1;
  }

  const greetBox = page.querySelector("[data-guest-greet]");
  let place = null;
  let greeted = false;

  function greetLines() {
    const h = new Date().getHours();
    const word = h >= 5 && h < 12 ? "morning" : h >= 12 && h < 18 ? "day" : h >= 18 && h < 23 ? "evening" : "night";
    const time = new Date().toLocaleTimeString(I18N.locale, { hour: "2-digit", minute: "2-digit" });
    return [
      `${T(word)}, ${T("guest")}.`,
      `${T("from")}: ${place || T("unknown")}`,
      visit > 1 ? `${T("again", { n: visit })}.` : T("first"),
      `${T("time")}: ${time}`,
    ];
  }

  function renderGreeting(animate) {
    if (!greetBox) return;
    const lines = greetLines();
    const pre = el("pre", "guest-greet-text");
    greetBox.replaceChildren(bar("~/guests/hello.sh", el("span", "live", "● online")), pre);
    if (!animate || reduceMotion) {
      pre.textContent = lines.map((l) => `> ${l}`).join("\n");
      return;
    }
    const full = lines.map((l) => `> ${l}`).join("\n");
    let i = 0;
    const step = () => {
      i = Math.min(full.length, i + 2);
      pre.textContent = full.slice(0, i);
      if (i < full.length) setTimeout(step, 18);
    };
    step();
  }

  async function locate() {
    const geo = window.GEO;
    if (!geo) return;
    try {
      const hit = await Promise.race([geo.locate(), new Promise((r) => setTimeout(() => r(null), 2500))]);
      const pick = hit && hit.city ? hit : geo.estimate ? geo.estimate() : null;
      if (pick && pick.city && !/^(UTC|GMT|Etc)|\//.test(pick.city))
        place = [pick.city, pick.country].filter(Boolean).join(", ");
    } catch (e) {}
  }

  const testBox = page.querySelector("[data-guest-test]");
  const test = { index: 0, answers: [] };

  function renderTest() {
    if (!testBox) return;
    const head = bar(
      "~/guests/office-audit",
      el("span", null, `${Math.min(test.index + 1, QUESTIONS.length)}/${QUESTIONS.length}`)
    );
    if (test.index >= QUESTIONS.length) return renderResult(head);
    const [q] = QUESTIONS[test.index];
    const body = el("div", "guest-test-body");
    const progress = el("div", "guest-progress");
    const fill = el("span");
    fill.style.setProperty("--w", `${(test.index / QUESTIONS.length) * 100}%`);
    progress.append(fill);
    const count = el("p", "guest-test-count", T("qOf", { n: test.index + 1, total: QUESTIONS.length }));
    const question = el("p", "guest-test-q", L(q));
    const choices = el("div", "guest-test-choices");
    [
      ["yes", 1],
      ["no", 0],
      ["dunno", 0.25],
    ].forEach(([key, value]) => {
      const b = button(`cta-btn${key === "yes" ? " is-primary" : ""}`, T(key));
      b.addEventListener("click", () => {
        test.answers[test.index] = value;
        test.index += 1;
        renderTest();
      });
      choices.append(b);
    });
    body.append(progress, count, question, choices);
    body.classList.add("is-in");
    testBox.replaceChildren(head, body);
  }

  function renderResult(head) {
    const total = QUESTIONS.reduce((n, q) => n + q[2], 0);
    const got = QUESTIONS.reduce((n, q, i) => n + q[2] * (test.answers[i] || 0), 0);
    const pct = Math.round((got / total) * 100);
    const grade = pct >= 90 ? "A" : pct >= 75 ? "B" : pct >= 55 ? "C" : pct >= 35 ? "D" : "F";
    const tier = pct >= 90 ? 4 : pct >= 75 ? 3 : pct >= 55 ? 2 : pct >= 35 ? 1 : 0;
    const body = el("div", "guest-test-body guest-result is-in");
    const badge = el("div", `sec-grade grade-${grade === "A" ? "a" : grade === "B" ? "b" : grade === "C" ? "c" : "d"}`);
    badge.append(el("span", "sec-grade-letter", grade), el("span", "sec-grade-label", `${T("grade")} · ${pct}%`));
    const side = el("div", "guest-result-side");
    side.append(el("p", "guest-verdict", L(TX.verdict[tier])));
    const weak = QUESTIONS.map((q, i) => [q, test.answers[i]]).filter(([, a]) => a !== 1);
    if (weak.length) {
      side.append(el("p", "guest-tips-title", T("tipsTitle")));
      const list = el("ol", "guest-tips");
      weak.sort((a, b) => b[0][2] - a[0][2]).forEach(([q]) => list.append(el("li", null, L(q[1]))));
      side.append(list);
    } else side.append(el("p", "guest-tips-title", T("perfect")));
    const actions = el("div", "guest-actions");
    const contacts = (window.PORTFOLIO && window.PORTFOLIO.contacts) || [];
    const tg = contacts.find((c) => c.label === "telegram");
    if (tg) {
      const a = el("a", "cta-btn is-primary", T("audit"));
      a.href = tg.href;
      a.target = "_blank";
      a.rel = "noopener";
      actions.append(a);
    }
    const again = button("cta-btn", T("restart"));
    again.addEventListener("click", () => {
      test.index = 0;
      test.answers = [];
      renderTest();
    });
    actions.append(again);
    side.append(actions);
    body.append(badge, side);
    testBox.replaceChildren(head, body);
  }

  const bookBox = page.querySelector("[data-guest-book]");
  const cfg = (window.SITE_CONFIG && window.SITE_CONFIG.guestbook) || {};
  const server = String(cfg.server || "https://ntfy.sh").replace(/\/+$/, "");
  const topic = /^[A-Za-z0-9_-]{1,64}$/.test(cfg.topic || "") ? cfg.topic : "";
  const ready = Boolean(topic);
  const book = { stored: null, seen: new Set(), live: [], mine: [], failed: false, shown: 20, opened: 0, timer: 0 };
  let bookUI = null;

  const LINK =
    /(https?:\/\/|www\.|t\.me\/|\b[\w-]+\.(?:com|net|org|ru|uz|io|me|xyz|top|info|site|online|shop|click|link|biz|club|pro)\b)/i;
  const CONTROL = /[\u0000-\u0008\u000b-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g;
  const cleanNick = (s) =>
    String(s || "")
      .replace(CONTROL, "")
      .replace(/\s+/g, " ")
      .trim();
  const cleanText = (s) =>
    String(s || "")
      .replace(CONTROL, "")
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  const hasLink = (s) => LINK.test(s);

  function fromMessage(m) {
    if (!m || m.event !== "message" || m.attachment || !m.id || !m.time) return null;
    const nick = cleanNick(m.title);
    const text = cleanText(m.message);
    if (nick.length < 2 || nick.length > 32 || text.length < 2 || text.length > 500) return null;
    if (hasLink(nick) || hasLink(text)) return null;
    return { id: String(m.id), time: Number(m.time), nick, text };
  }

  const nickColor = (nick) => {
    const palette = ["#f2334a", "#ff8c9a", "#ffd23f", "#45d483", "#6ed2ff", "#cfd1d7"];
    let h = 0;
    for (let i = 0; i < nick.length; i++) h = (h * 31 + nick.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  };

  const LOCALES = { ru: "ru-RU", uz: "uz-UZ", en: "en-GB" };
  function stamp(time) {
    const date = new Date(time * 1000);
    const opts = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" };
    try {
      return date.toLocaleString(LOCALES[I18N.lang] || "ru-RU", opts);
    } catch (e) {
      return date.toLocaleString("ru-RU", opts);
    }
  }

  function buildBook() {
    if (!bookBox) return;
    const form = el("form", "guest-form");
    const nick = el("input", "sec-input guest-nick");
    nick.maxLength = 32;
    nick.autocomplete = "nickname";
    nick.spellcheck = false;
    const text = el("textarea", "sec-input sec-area guest-text");
    text.maxLength = 500;
    const trap = el("input", "guest-trap");
    trap.tabIndex = -1;
    trap.autocomplete = "off";
    trap.setAttribute("aria-hidden", "true");
    const counter = el("span", "guest-counter", "0/500");
    const send = el("button", "cta-btn is-primary");
    send.type = "submit";
    const row = el("div", "guest-form-row");
    row.append(counter, send);
    const rules = el("p", "net-note guest-rules");
    form.append(nick, text, trap, row, rules);
    const status = el("p", "net-note guest-status");
    status.setAttribute("role", "status");
    const list = el("ol", "guest-list");
    const more = button("anim-toggle guest-more", "");
    more.addEventListener("click", () => {
      book.shown += 20;
      renderBook();
    });
    const countEl = el("span", "guest-count");
    bookBox.replaceChildren(bar("~/guests/guestbook.log", countEl), form, status, list, more);
    bookUI = { form, nick, text, trap, counter, send, rules, status, list, more, countEl };
    text.addEventListener("input", () => (counter.textContent = `${text.value.length}/500`));
    const opened = () => (book.opened = book.opened || Date.now());
    nick.addEventListener("focus", opened);
    text.addEventListener("focus", opened);
    form.addEventListener("submit", submit);
    labelBook();
    if (!ready) [nick, text, send].forEach((n) => (n.disabled = true));
    renderBook();
  }

  function labelBook() {
    if (!bookUI) return;
    bookUI.nick.placeholder = T("nick");
    bookUI.text.placeholder = T("text");
    bookUI.send.textContent = T("send");
    bookUI.more.textContent = T("more");
    bookUI.rules.textContent = T(ready ? "rules" : "soon");
    bookUI.status.textContent = "";
  }

  function entries() {
    const byId = new Map();
    [...(book.stored || []), ...book.live.filter((c) => !book.seen.has(c.id)), ...book.mine].forEach((c) =>
      byId.set(c.id, c)
    );
    return [...byId.values()].sort((a, b) => b.time - a.time || (a.id < b.id ? 1 : -1));
  }

  function countLabel(n) {
    const forms = L(TX.count);
    let i = forms.length - 1;
    if (forms.length === 3) {
      const d = n % 10;
      const h = n % 100;
      i = d === 1 && h !== 11 ? 0 : d >= 2 && d <= 4 && (h < 12 || h > 14) ? 1 : 2;
    } else if (forms.length === 2) i = n === 1 ? 0 : 1;
    return forms[i].replace("{n}", n);
  }

  function renderBook() {
    if (!bookUI) return;
    const all = entries();
    bookUI.list.textContent = "";
    bookUI.countEl.textContent = all.length ? countLabel(all.length) : "";
    if (!all.length) {
      if (ready) {
        const loaded = book.stored || book.live.length || book.liveOk;
        bookUI.list.append(el("li", "guest-empty", loaded ? T("empty") : book.failed ? T("error") : T("loading")));
      }
      bookUI.more.hidden = true;
      return;
    }
    all.slice(0, book.shown).forEach((e, i) => {
      const li = el("li", "guest-entry");
      li.style.setProperty("--i", Math.min(i, 12));
      const meta = el("div", "guest-meta");
      const who = el("span", "guest-who", e.nick);
      who.style.color = nickColor(e.nick);
      meta.append(el("span", "guest-time", `[${stamp(e.time)}]`), who);
      li.append(meta, el("p", "guest-msg", e.text));
      bookUI.list.append(li);
    });
    bookUI.more.hidden = all.length <= book.shown;
  }

  async function loadStored() {
    const res = await fetch(`assets/data/guestbook.json?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const comments = Array.isArray(data.comments) ? data.comments : [];
    book.stored = comments
      .map((c) => fromMessage({ event: "message", id: c.id, time: c.time, title: c.nick, message: c.text }))
      .filter(Boolean);
    book.seen = new Set([...Object.keys(data.seen || {}), ...book.stored.map((c) => c.id)]);
  }

  async function loadLive() {
    const res = await fetch(`${server}/${topic}/json?poll=1&since=all`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const lines = (await res.text()).split("\n");
    const live = [];
    lines.forEach((line) => {
      if (!line.trim()) return;
      try {
        const c = fromMessage(JSON.parse(line));
        if (c) live.push(c);
      } catch (e) {}
    });
    book.live = live.slice(-100);
    book.liveOk = true;
  }

  async function loadBook() {
    if (!ready) return;
    const [stored, live] = await Promise.allSettled([loadStored(), loadLive()]);
    book.failed = stored.status === "rejected" && live.status === "rejected" && !book.stored;
    renderBook();
  }

  async function submit(event) {
    event.preventDefault();
    if (!ready || !bookUI || bookUI.send.disabled) return;
    const nick = cleanNick(bookUI.nick.value).slice(0, 32);
    const text = cleanText(bookUI.text.value).slice(0, 500);
    if (bookUI.trap.value) return;
    if (nick.length < 2 || text.length < 2) {
      bookUI.status.textContent = T("tooShort");
      return;
    }
    if (hasLink(nick) || hasLink(text)) {
      bookUI.status.textContent = T("noLinks");
      return;
    }
    const last = Number(store.get("gbLast") || 0);
    if (Date.now() - last < 60000 || !book.opened || Date.now() - book.opened < 2500) {
      bookUI.status.textContent = T("wait");
      return;
    }
    bookUI.send.disabled = true;
    try {
      const res = await fetch(`${server}/${topic}?title=${encodeURIComponent(nick)}&tags=speech_balloon`, {
        method: "POST",
        body: text,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(res.status);
      const sent = fromMessage(await res.json().catch(() => null)) || {
        id: `local-${Date.now()}`,
        time: Math.floor(Date.now() / 1000),
        nick,
        text,
      };
      book.mine.push(sent);
      store.set("gbLast", String(Date.now()));
      bookUI.text.value = "";
      bookUI.counter.textContent = "0/500";
      bookUI.status.textContent = T("sent");
      renderBook();
    } catch (e) {
      bookUI.status.textContent = T("fail");
    }
    bookUI.send.disabled = false;
  }

  let started = false;
  function start() {
    if (!started) {
      started = true;
      renderTest();
      buildBook();
      locate().then(() => renderGreeting(false));
    }
    if (!greeted) {
      greeted = true;
      renderGreeting(true);
    }
    loadBook();
    clearInterval(book.timer);
    book.timer = setInterval(() => root.dataset.view === "guests" && !document.hidden && loadBook(), 90000);
  }

  document.addEventListener("pagechange", (event) => {
    if (event.detail === "guests") start();
    else clearInterval(book.timer);
  });
  document.addEventListener("langchange", () => {
    if (!started) return;
    renderGreeting(false);
    renderTest();
    labelBook();
    renderBook();
  });
  if (root.dataset.view === "guests") start();
})();
