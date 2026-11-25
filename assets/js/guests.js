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

  let started = false;
  function start() {
    if (!started) {
      started = true;
      renderTest();
      locate().then(() => renderGreeting(false));
    }
    if (!greeted) {
      greeted = true;
      renderGreeting(true);
    }
  }

  document.addEventListener("pagechange", (event) => event.detail === "guests" && start());
  document.addEventListener("langchange", () => {
    if (!started) return;
    renderGreeting(false);
    renderTest();
  });
  if (root.dataset.view === "guests") start();
})();
