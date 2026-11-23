(function () {
  "use strict";

  const DICT = {
    ru: {
      skip: "К содержимому",
      "nav.home": "Главная",
      "nav.back": "← меню",
      "home.logo": "Логотип",
      "office.full": "во весь экран",
      "nav.main": "главная",
      "nav.services": "услуги",
      "nav.about": "о себе",
      "nav.info": "инфо",
      "services.title": "Услуги",
      "services.clients": "компаний доверили мне свою IT-инфраструктуру",
      "services.count": "услуг — от сервера до облачной АТС",
      "about.title": "О себе",
      "about.kicker": "sysadmin · IT-инфраструктура",
      "about.focusTitle": "Чем занимаюсь",
      "about.spec.role": "Должность",
      "about.spec.focus": "Профиль",
      "about.spec.country": "Страна",
      "about.spec.level": "Уровень",
      "about.spec.contact": "Связь",
      "about.levelValue": "продвинутый · {n} из {total} навыков",
      "about.stat.skills": "навыков",
      "about.stat.advanced": "на продвинутом уровне",
      "about.stat.areas": "направлений",
      "about.stat.services": "услуг",
      "info.title": "Инфо",
      "info.locating": "определяю местоположение",
      "info.externalIp": "Внешний IP",
      "info.localIp": "Локальный IP",
      "info.place": "Место",
      "info.coords": "Координаты",
      "info.isp": "Провайдер",
      "info.tz": "Часовой пояс",
      "info.time": "Ваше время",
      "info.browser": "Браузер",
      "info.os": "Система",
      "info.screen": "Экран",
      "info.lang": "Язык",
      "info.noIp": "недоступен на этой странице",
      "info.approx": "примерно, по часовому поясу",
      "info.localHidden": "скрыт браузером",
      "info.localUnsupported": "браузер не поддерживает проверку",
      "info.sourceIp": "по IP",
      "info.sourceTz": "по часовому поясу",
      "nav.contact": "контакты",
      "ctrl.lang": "Язык",
      "ctrl.soundOn": "Включить звук",
      "ctrl.soundOff": "Выключить звук",

      "office.legend": ":·: зона обзора камеры   ■ видео на сервер   ● данные   o сотрудник (! — замечен камерой)",
      "office.feed": "Камеры",
      "office.models": "модели камер",
      "anim.pause": "пауза",
      "anim.play": "▶ смотреть",
      "skills.title": "Навыки",
      "skills.web": "веб-разработка",
      "skills.admin": "администрирование",
      "skills.canDo": "что умею:",
      "skills.levelTitle": "{level} уровень",
      "skills.detail": "Подробно, с анимацией",
      "skills.total": "навыков",
      "skills.level": "Уровень",
      "level.basic": "Базовый",
      "level.intermediate": "Средний",
      "level.confident": "Уверенный",
      "level.advanced": "Продвинутый",
      "level.expert": "Эксперт",

      "exp.title": "Опыт",
      "exp.certs": "Сертификаты",

      "contact.title": "Контакты",

      "toast.matrixOn": "режим матрицы: вкл",
      "toast.matrixOff": "режим матрицы: выкл",
      "toast.soundOn": "звук: вкл",
      "toast.soundOff": "звук: выкл",

      "geo.locating": "определяю местоположение…",
      "geo.you": "вы здесь",
      "geo.ip": "внешний IP",
      "geo.place": "место",
      "geo.isp": "провайдер",
      "geo.local": "локальный IP",
      "geo.localHidden": "браузер не раскрывает сайтам",
      "geo.noIp": "недоступен здесь — место примерно по часовому поясу",
    },

    uz: {
      skip: "Asosiy qismga o‘tish",
      "nav.home": "Bosh sahifa",
      "nav.back": "← menyu",
      "home.logo": "Logotip",
      "office.full": "to‘liq ekran",
      "nav.main": "bosh sahifa",
      "nav.services": "xizmatlar",
      "nav.about": "men haqimda",
      "nav.info": "info",
      "services.title": "Xizmatlar",
      "services.clients": "kompaniya IT infratuzilmasini menga ishonib topshirgan",
      "services.count": "xizmat — serverdan bulutli ATSgacha",
      "about.title": "Men haqimda",
      "about.kicker": "sysadmin · IT infratuzilma",
      "about.focusTitle": "Nima bilan shug‘ullanaman",
      "about.spec.role": "Lavozim",
      "about.spec.focus": "Yo‘nalish",
      "about.spec.country": "Mamlakat",
      "about.spec.level": "Daraja",
      "about.spec.contact": "Aloqa",
      "about.levelValue": "yuqori · {total} tadan {n} ko‘nikma",
      "about.stat.skills": "ko‘nikma",
      "about.stat.advanced": "yuqori darajada",
      "about.stat.areas": "yo‘nalish",
      "about.stat.services": "xizmat",
      "info.title": "Info",
      "info.locating": "joylashuv aniqlanmoqda",
      "info.externalIp": "Tashqi IP",
      "info.localIp": "Lokal IP",
      "info.place": "Joy",
      "info.coords": "Koordinatalar",
      "info.isp": "Provayder",
      "info.tz": "Vaqt mintaqasi",
      "info.time": "Sizning vaqtingiz",
      "info.browser": "Brauzer",
      "info.os": "Tizim",
      "info.screen": "Ekran",
      "info.lang": "Til",
      "info.noIp": "bu sahifada mavjud emas",
      "info.approx": "taxminan, vaqt mintaqasi bo‘yicha",
      "info.localHidden": "brauzer yashirgan",
      "info.localUnsupported": "brauzer tekshirishni qo‘llab-quvvatlamaydi",
      "info.sourceIp": "IP bo‘yicha",
      "info.sourceTz": "vaqt mintaqasi bo‘yicha",
      "nav.contact": "aloqa",
      "ctrl.lang": "Til",
      "ctrl.soundOn": "Ovozni yoqish",
      "ctrl.soundOff": "Ovozni o‘chirish",

      "office.legend": ":·: kamera ko‘rish zonasi   ■ serverga video   ● ma’lumotlar   o xodim (! — kamera payqadi)",
      "office.feed": "Kameralar",
      "office.models": "kamera modellari",
      "anim.pause": "pauza",
      "anim.play": "▶ ko‘rish",
      "skills.title": "Ko‘nikmalar",
      "skills.web": "veb-dasturlash",
      "skills.admin": "tizim ma’muriyati",
      "skills.canDo": "nimalarni bilaman:",
      "skills.levelTitle": "{level} daraja",
      "skills.detail": "Batafsil, animatsiya bilan",
      "skills.total": "ko‘nikma",
      "skills.level": "Daraja",
      "level.basic": "Boshlang‘ich",
      "level.intermediate": "O‘rta",
      "level.confident": "Ishonchli",
      "level.advanced": "Yuqori",
      "level.expert": "Ekspert",

      "exp.title": "Tajriba",
      "exp.certs": "Sertifikatlar",

      "contact.title": "Aloqa",

      "toast.matrixOn": "matritsa rejimi: yoqildi",
      "toast.matrixOff": "matritsa rejimi: o‘chirildi",
      "toast.soundOn": "ovoz: yoqildi",
      "toast.soundOff": "ovoz: o‘chirildi",

      "geo.locating": "joylashuv aniqlanmoqda…",
      "geo.you": "siz shu yerdasiz",
      "geo.ip": "tashqi IP",
      "geo.place": "joy",
      "geo.isp": "provayder",
      "geo.local": "lokal IP",
      "geo.localHidden": "brauzer saytlarga ko‘rsatmaydi",
      "geo.noIp": "bu yerda mavjud emas — joy vaqt mintaqasi bo‘yicha taxminiy",
    },

    en: {
      skip: "Skip to content",
      "nav.home": "Home",
      "nav.back": "← menu",
      "home.logo": "Logo",
      "office.full": "fullscreen",
      "nav.main": "home",
      "nav.services": "services",
      "nav.about": "about",
      "nav.info": "info",
      "services.title": "Services",
      "services.clients": "companies trust me with their IT infrastructure",
      "services.count": "services, from servers to cloud PBX",
      "about.title": "About",
      "about.kicker": "sysadmin · IT infrastructure",
      "about.focusTitle": "What I do",
      "about.spec.role": "Role",
      "about.spec.focus": "Focus",
      "about.spec.country": "Country",
      "about.spec.level": "Level",
      "about.spec.contact": "Contact",
      "about.levelValue": "advanced · {n} of {total} skills",
      "about.stat.skills": "skills",
      "about.stat.advanced": "at advanced level",
      "about.stat.areas": "areas",
      "about.stat.services": "services",
      "info.title": "Info",
      "info.locating": "locating",
      "info.externalIp": "External IP",
      "info.localIp": "Local IP",
      "info.place": "Location",
      "info.coords": "Coordinates",
      "info.isp": "Provider",
      "info.tz": "Time zone",
      "info.time": "Your time",
      "info.browser": "Browser",
      "info.os": "System",
      "info.screen": "Screen",
      "info.lang": "Language",
      "info.noIp": "not available on this page",
      "info.approx": "approximate, from time zone",
      "info.localHidden": "hidden by the browser",
      "info.localUnsupported": "the browser doesn’t support the check",
      "info.sourceIp": "by IP",
      "info.sourceTz": "by time zone",
      "nav.contact": "contact",
      "ctrl.lang": "Language",
      "ctrl.soundOn": "Turn sound on",
      "ctrl.soundOff": "Turn sound off",

      "office.legend": ":·: camera field of view   ■ video to server   ● data   o person (! — seen by a camera)",
      "office.feed": "Cameras",
      "office.models": "camera models",
      "anim.pause": "pause",
      "anim.play": "▶ play",
      "skills.title": "Skills",
      "skills.web": "web development",
      "skills.admin": "system administration",
      "skills.canDo": "what I can do:",
      "skills.levelTitle": "{level} level",
      "skills.detail": "In detail, with animations",
      "skills.total": "skills",
      "skills.level": "Level",
      "level.basic": "Basic",
      "level.intermediate": "Intermediate",
      "level.confident": "Confident",
      "level.advanced": "Advanced",
      "level.expert": "Expert",

      "exp.title": "Experience",
      "exp.certs": "Certificates",

      "contact.title": "Contact",

      "toast.matrixOn": "matrix mode: on",
      "toast.matrixOff": "matrix mode: off",
      "toast.soundOn": "sound: on",
      "toast.soundOff": "sound: off",

      "geo.locating": "locating…",
      "geo.you": "you are here",
      "geo.ip": "external IP",
      "geo.place": "location",
      "geo.isp": "provider",
      "geo.local": "local IP",
      "geo.localHidden": "browsers don’t reveal it to websites",
      "geo.noIp": "not available here — location estimated from your time zone",
    },
  };

  const LANGS = ["ru", "uz", "en"];
  const LOCALES = { ru: "ru-RU", uz: "uz-Latn-UZ", en: "en-US" };
  let lang = "ru";
  try {
    const saved = localStorage.getItem("lang");
    if (LANGS.includes(saved)) lang = saved;
  } catch (e) {}

  function t(key, params) {
    let text = (DICT[lang] && DICT[lang][key]) || DICT.ru[key] || key;
    if (params) text = text.replace(/\{(\w+)\}/g, (_, name) => (params[name] != null ? params[name] : ""));
    return text;
  }

  function pick(value) {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number" || Array.isArray(value)) return value;
    return value[lang] != null ? value[lang] : value.ru;
  }

  function apply(scope = document) {
    scope.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAria));
    });
  }

  function set(next) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    try {
      localStorage.setItem("lang", next);
    } catch (e) {}
    document.documentElement.lang = next;
    apply();
    document.dispatchEvent(new CustomEvent("langchange", { detail: next }));
  }

  document.documentElement.lang = lang;
  apply();

  window.I18N = {
    LANGS,
    get lang() {
      return lang;
    },
    get locale() {
      return LOCALES[lang];
    },
    t,
    pick,
    apply,
    set,
  };
})();
