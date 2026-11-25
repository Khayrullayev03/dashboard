(function () {
  "use strict";

  const I18N = window.I18N;
  const box = document.querySelector("[data-schemes]");
  if (!I18N || !box) return;

  const root = document.documentElement;
  const NS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = () => root.dataset.perf === "lite";
  const S = (ru, uz, en) => ({ ru, uz, en });
  const L = (v) => (v == null ? "" : typeof v === "string" ? v : I18N.pick(v));

  /* ---------- icons: 40×40, stroked ---------- */

  const R = (x, y, w, h, r = 2) =>
    `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
  const O = (cx, cy, rx, ry = rx) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 -${2 * rx} 0z`;

  const ICONS = {
    pc: R(4, 6, 32, 21) + "M16 27v5M24 27v5M11 33h18",
    laptop: R(8, 8, 24, 17, 1.5) + "M4 29h32l-3 4H7z",
    kbd:
      R(3, 12, 34, 17) +
      "M8 17h.01M13 17h.01M18 17h.01M23 17h.01M28 17h.01M32 17h.01M9 21h.01M14 21h.01M19 21h.01M24 21h.01M29 21h.01M12 25h16",
    cpu:
      R(11, 11, 18, 18) +
      R(16, 16, 8, 8, 1) +
      "M15 11V6M20 11V6M25 11V6M15 34v-5M20 34v-5M25 34v-5M11 15H6M11 20H6M11 25H6M34 15h-5M34 20h-5M34 25h-5",
    ram:
      R(3, 12, 34, 13, 1) +
      "M8 16h5v5H8zM15.5 16h5v5h-5zM23 16h5v5h-5zM30 16h3v5h-3zM7 25v4M12 25v4M17 25v4M23 25v4M28 25v4M33 25v4",
    ssd: R(5, 11, 30, 18) + "M10 16h13M10 20.5h9M29 24.5h.01",
    nic: "M4 11h32v15H4zM9 26v4h8v-4" + R(24, 15, 8, 7, 1) + "M8 15h11M8 19h8",
    switch: R(3, 12, 34, 16) + "M9 17.5h13m-3-3 3 3-3 3M31 22.5H18m3-3-3 3 3 3",
    router:
      O(20, 20, 15) +
      "M20 8v7m-2.6-2.6L20 15l2.6-2.6M20 32v-7m-2.6 2.6L20 25l2.6 2.6M15 20H8m2.6-2.6L8 20l2.6 2.6M25 20h7m-2.6-2.6L32 20l-2.6 2.6",
    firewall: R(5, 8, 30, 24, 1.5) + "M5 16h30M5 24h30M13 8v8M26 8v8M19.5 16v8M10 24v8M29 24v8",
    cloud: "M12.5 30h16.5a6.5 6.5 0 0 0 1.2-12.9A9.5 9.5 0 0 0 11.8 15.6 7.3 7.3 0 0 0 12.5 30z",
    globe:
      O(20, 20, 14) + "M6 20h28M20 6c4.4 3.8 6.2 8.6 6.2 14S24.4 30.2 20 34c-4.4-3.8-6.2-8.6-6.2-14S15.6 9.8 20 6z",
    db: O(20, 10, 12, 4) + "M8 10v20c0 2.2 5.4 4 12 4s12-1.8 12-4V10M8 20c0 2.2 5.4 4 12 4s12-1.8 12-4",
    server:
      R(7, 5, 26, 9, 1.5) +
      R(7, 15.5, 26, 9, 1.5) +
      R(7, 26, 26, 9, 1.5) +
      "M11.5 9.5h.01M11.5 20h.01M11.5 30.5h.01M21 9.5h8M21 20h8M21 30.5h8",
    phone:
      "M7 13.5c0-3.2 26-3.2 26 0V16h-6.5v-2.2h-13V16H7z" +
      R(8, 18, 24, 15) +
      "M13 23h.01M20 23h.01M27 23h.01M13 28h.01M20 28h.01M27 28h.01",
    mobile: R(12, 4, 16, 32, 3) + "M18 32h4",
    analog: "M6 15c0-4.5 28-4.5 28 0v3h-7v-3.2H13V18H6zM11.5 20h17l3.5 13H8z" + O(20, 26.5, 3.5),
    ats: "M5 34V15L20 6l15 9v19zM15 34v-8h10v8M11 19h5M24 19h5",
    tower:
      "M20 15l-7 21M20 15l7 21M14.5 30h11M16.5 23.5h7" +
      O(20, 11.5, 2.5) +
      "M12.5 5.5a10 10 0 0 0 0 12M27.5 5.5a10 10 0 0 1 0 12",
    ap: "M7.5 15.5a17.5 17.5 0 0 1 25 0M11.8 20.2a11 11 0 0 1 16.4 0M16.2 24.8a4.8 4.8 0 0 1 7.6 0M20 30.5h.01",
    lock: R(9, 17, 22, 17, 2.5) + "M14 17v-5a6 6 0 0 1 12 0v5M20 23.5v4.5",
    eye: "M3 20s6.5-10 17-10 17 10 17 10-6.5 10-17 10S3 20 3 20z" + O(20, 20, 4.8),
    camera: "M6 12.5l21-5 3 10-21 5zM24 19.5l2.5 6.5H33M33 22v8",
    unit: R(4, 9, 32, 22, 3),
  };

  /* ---------- diagrams ---------- */

  const UNIT = (t) => `unit:${t}`;
  const SCHEMES = [
    {
      id: "pc",
      name: S("Компьютер", "Kompyuter", "Computer"),
      title: S(
        "Внутри компьютера: от нажатия клавиши до сети",
        "Kompyuter ichida: tugmani bosishdan tarmoqqacha",
        "Inside a computer: from a key press to the network"
      ),
      zones: [{ x: 215, y: 40, w: 510, h: 410, label: S("системный блок", "tizim bloki", "pc case") }],
      nodes: {
        kb: { x: 95, y: 140, icon: "kbd", label: S("Клавиатура", "Klaviatura", "Keyboard"), sub: "USB HID" },
        mon: { x: 95, y: 360, icon: "pc", label: S("Монитор", "Monitor", "Monitor"), sub: "HDMI · 144 Hz" },
        cpu: {
          x: 370,
          y: 140,
          icon: "cpu",
          label: S("Процессор", "Protsessor", "CPU"),
          sub: S("8 ядер · 4.5 ГГц", "8 yadro · 4.5 GGs", "8 cores · 4.5 GHz"),
        },
        ram: { x: 370, y: 360, icon: "ram", label: S("ОЗУ", "Operativ xotira", "RAM"), sub: "DDR5 · 32 GB" },
        ssd: { x: 600, y: 360, icon: "ssd", label: "SSD NVMe", sub: "PCIe 4.0 · 7 GB/s" },
        nic: {
          x: 600,
          y: 140,
          icon: "nic",
          label: S("Сетевая карта", "Tarmoq kartasi", "Network card"),
          sub: "1 Gbit/s",
        },
        sw: {
          x: 880,
          y: 140,
          icon: "switch",
          label: S("Коммутатор", "Kommutator", "Switch"),
          sub: S("порт 12", "12-port", "port 12"),
        },
      },
      links: [
        ["kb", "cpu", "bus", "USB"],
        ["cpu", "mon", "bus", "HDMI"],
        ["cpu", "ram", "bus", "DDR5"],
        ["ram", "ssd", "bus", "DMA"],
        ["cpu", "nic", "bus", "PCIe"],
        ["nic", "sw", "cu", "Cat6 · 1G"],
      ],
      steps: [
        {
          via: ["kb", "cpu"],
          tag: "IRQ",
          title: S("Нажатие клавиши", "Tugma bosilishi", "Key press"),
          text: S(
            "Клавиатура отправляет скан-код по USB. Контроллер поднимает прерывание (IRQ), и процессор на микросекунды откладывает текущую работу, чтобы обработать нажатие.",
            "Klaviatura USB orqali skan-kod yuboradi. Kontroller uzilish (IRQ) chaqiradi va protsessor bosishni qayta ishlash uchun joriy ishini mikrosoniyalarga to‘xtatadi.",
            "The keyboard sends a scan code over USB. The controller raises an interrupt (IRQ), and the CPU pauses its work for microseconds to handle the key press."
          ),
          log: ["usb 1-2: HID report · key 0x28 (Enter)", "irq 37: xhci_hcd → cpu3"],
        },
        {
          via: ["ssd", "ram"],
          tag: "DMA",
          title: S("Загрузка программы", "Dasturni yuklash", "Loading the program"),
          text: S(
            "Браузер копируется с SSD в оперативную память напрямую по DMA — без участия процессора, со скоростью до 7 ГБ/с.",
            "Brauzer SSD’dan operativ xotiraga to‘g‘ridan-to‘g‘ri DMA orqali ko‘chiriladi — protsessorsiz, 7 GB/s gacha tezlikda.",
            "The browser is copied from the SSD into RAM directly via DMA — without the CPU, at up to 7 GB/s."
          ),
          log: ["nvme0n1: read 148 MiB in 21 ms", "dma: ssd → ram 0x7f3a00000000"],
        },
        {
          via: ["ram", "cpu"],
          tag: "L3→L2→L1",
          title: S("Кэш и вычисления", "Kesh va hisoblash", "Cache and compute"),
          text: S(
            "Процессор берёт инструкции из ОЗУ (~80 нс) в кэш L3 → L2 → L1 (~1 нс) и выполняет миллиарды операций в секунду на 8 ядрах.",
            "Protsessor ko‘rsatmalarni operativ xotiradan (~80 ns) L3 → L2 → L1 keshga (~1 ns) oladi va 8 yadroda soniyasiga milliardlab amal bajaradi.",
            "The CPU pulls instructions from RAM (~80 ns) into the L3 → L2 → L1 cache (~1 ns) and runs billions of operations per second on 8 cores."
          ),
          log: ["perf: 4.21 GHz · IPC 3.1", "cache: L1 hit 97.8% · L3 miss 0.4%"],
        },
        {
          via: ["cpu", "mon"],
          tag: "FRAME",
          title: S("Картинка на экране", "Ekrandagi tasvir", "Picture on screen"),
          text: S(
            "Графическое ядро собирает кадр и отправляет его по HDMI — 144 раза в секунду, по кадру каждые 6,9 мс.",
            "Grafik yadro kadrni yig‘ib, HDMI orqali yuboradi — soniyasiga 144 marta, har 6,9 ms da bir kadr.",
            "The graphics core renders a frame and sends it over HDMI — 144 times a second, one frame every 6.9 ms."
          ),
          log: ["gpu: frame 2560×1440 in 3.2 ms", "hdmi: 144 Hz · vsync"],
        },
        {
          via: ["cpu", "nic"],
          seq: ["HTTP", "TCP|HTTP", "IP|TCP|HTTP", "ETH|IP|TCP|HTTP"],
          title: S("Сборка пакета (OSI)", "Paketni yig‘ish (OSI)", "Building a packet (OSI)"),
          text: S(
            "Операционная система упаковывает запрос как матрёшку: данные HTTP → сегмент TCP (порты) → пакет IP (адреса) → кадр Ethernet (MAC).",
            "Operatsion tizim so‘rovni matryoshka kabi o‘raydi: HTTP ma’lumoti → TCP segment (portlar) → IP paket (manzillar) → Ethernet kadr (MAC).",
            "The operating system wraps the request like a nesting doll: HTTP data → TCP segment (ports) → IP packet (addresses) → Ethernet frame (MAC)."
          ),
          hdr: [
            ["L7", "HTTP GET /"],
            ["L4", "TCP 51544 → 443"],
            ["L3", "IP 192.168.1.10 → 203.0.113.80"],
            ["L2", "MAC 3c:7c:3f:a1:22:10 → 00:1e:58:7b:01:01"],
          ],
          log: ["socket: connect 203.0.113.80:443", "tcp: mss 1460 · ip: ttl 128"],
        },
        {
          via: ["nic", "sw"],
          tag: "1011 0010",
          flow: "fwd",
          title: S("В кабель", "Kabelga", "Into the cable"),
          text: S(
            "Сетевая карта добавляет контрольную сумму CRC и превращает кадр в электрические сигналы: 1 миллиард бит в секунду по четырём парам кабеля Cat6.",
            "Tarmoq kartasi CRC nazorat yig‘indisini qo‘shadi va kadrni elektr signallariga aylantiradi: Cat6 kabelining to‘rt juftligi bo‘ylab soniyasiga 1 milliard bit.",
            "The network card appends a CRC checksum and turns the frame into electrical signals: one billion bits per second over the four pairs of a Cat6 cable."
          ),
          log: ["eth0: tx 1514 B · fcs 0x9a3c21f0", "link: 1000BASE-T full-duplex"],
        },
      ],
    },

    {
      id: "route",
      name: S("ПК → сервер", "Kompyuter → server", "PC → server"),
      title: S(
        "Путь пакета: от компьютера до сервера",
        "Paket yo‘li: kompyuterdan servergacha",
        "A packet's journey: from PC to server"
      ),
      zones: [
        { x: 25, y: 150, w: 335, h: 200, label: S("офис · LAN", "ofis · LAN", "office · LAN") },
        { x: 378, y: 30, w: 124, h: 320, label: S("провайдер", "provayder", "isp") },
        { x: 640, y: 70, w: 350, h: 375, label: S("дата-центр", "data-markaz", "data center") },
      ],
      nodes: {
        pc: { x: 70, y: 250, icon: "pc", label: S("Ваш ПК", "Kompyuteringiz", "Your PC"), sub: "192.168.1.10" },
        sw: { x: 190, y: 250, icon: "switch", label: S("Коммутатор", "Kommutator", "Switch"), sub: "L2 · MAC" },
        rt: {
          x: 310,
          y: 250,
          icon: "router",
          label: S("Роутер", "Router", "Router"),
          sub: S("шлюз · NAT", "shlyuz · NAT", "gateway · NAT"),
        },
        isp: { x: 440, y: 250, icon: "router", label: S("Провайдер", "Provayder", "ISP"), sub: "BGP" },
        dns: {
          x: 440,
          y: 85,
          icon: UNIT("DNS"),
          label: S("DNS-резолвер", "DNS-rezolver", "DNS resolver"),
          sub: "1.1.1.1",
        },
        ix: { x: 570, y: 250, icon: "globe", label: S("Магистраль", "Magistral", "Backbone"), sub: "IX · 100G" },
        fw: { x: 695, y: 250, icon: "firewall", label: "Firewall", sub: "anti-DDoS" },
        lb: {
          x: 815,
          y: 250,
          icon: UNIT("LB"),
          label: S("Балансировщик", "Balansirovshik", "Load balancer"),
          sub: "TLS 1.3",
        },
        web: { x: 930, y: 140, icon: "server", label: S("Веб-сервер", "Veb-server", "Web server"), sub: "nginx" },
        db: {
          x: 930,
          y: 370,
          icon: "db",
          label: S("База данных", "Ma’lumotlar bazasi", "Database"),
          sub: "PostgreSQL",
        },
      },
      links: [
        ["pc", "sw", "cu", "1G"],
        ["sw", "rt", "cu"],
        ["rt", "isp", "fiber", "GPON"],
        ["isp", "dns", "fiber"],
        ["isp", "ix", "fiber", "10G"],
        ["ix", "fw", "fiber", "100G"],
        ["fw", "lb", "cu"],
        ["lb", "web", "cu"],
        ["web", "db", "cu"],
      ],
      steps: [
        {
          via: ["pc", "sw", "rt", "sw", "pc"],
          tag: "DISCOVER",
          back: "OFFER",
          title: S("Получение адреса (DHCP)", "Manzil olish (DHCP)", "Getting an address (DHCP)"),
          text: S(
            "При включении ПК кричит на всю сеть: «Мне нужен адрес!». Роутер отвечает: твой IP 192.168.1.10, шлюз 192.168.1.1, DNS 1.1.1.1.",
            "Yoqilganda kompyuter butun tarmoqqa: «Menga manzil kerak!» deydi. Router javob beradi: IP 192.168.1.10, shlyuz 192.168.1.1, DNS 1.1.1.1.",
            "On boot the PC shouts to the whole network: “I need an address!” The router replies: your IP is 192.168.1.10, gateway 192.168.1.1, DNS 1.1.1.1."
          ),
          log: ["DHCPDISCOVER from 3c:7c:3f:a1:22:10", "DHCPOFFER 192.168.1.10 → REQUEST → ACK"],
        },
        {
          via: ["pc", "sw", "rt", "isp", "dns", "isp", "rt", "sw", "pc"],
          tag: "site.uz ?",
          back: "203.0.113.80",
          title: S("Поиск адреса (DNS)", "Manzilni topish (DNS)", "Finding the address (DNS)"),
          text: S(
            "Браузер знает только имя site.uz. DNS-резолвер переводит его в IP-адрес сервера — это телефонная книга интернета.",
            "Brauzer faqat site.uz nomini biladi. DNS-rezolver uni server IP-manziliga aylantiradi — bu internetning telefon kitobi.",
            "The browser only knows the name site.uz. The DNS resolver turns it into the server's IP address — the phone book of the internet."
          ),
          hdr: [
            ["SRC", "192.168.1.10:60211"],
            ["DST", "1.1.1.1:53"],
            ["PROTO", "UDP · DNS A?"],
            ["TTL", "128"],
          ],
          log: ["dns: site.uz A? → 1.1.1.1", "dns: site.uz A 203.0.113.80 (12 ms)"],
        },
        {
          via: ["pc", "sw", "rt"],
          tag: "SYN",
          title: S("NAT на роутере", "Routerdagi NAT", "NAT on the router"),
          text: S(
            "Внутренний адрес 192.168.1.10 в интернете не виден. Роутер подменяет его на внешний 203.0.113.25 и запоминает порт, чтобы вернуть ответ именно вам.",
            "Ichki 192.168.1.10 manzili internetda ko‘rinmaydi. Router uni tashqi 203.0.113.25 ga almashtiradi va javobni aynan sizga qaytarish uchun portni eslab qoladi.",
            "The internal address 192.168.1.10 isn't visible on the internet. The router swaps it for the public 203.0.113.25 and remembers the port so the reply comes back to you."
          ),
          hdr: [
            ["SRC", "192.168.1.10:51544"],
            ["NAT", "→ 203.0.113.25:51544"],
            ["DST", "203.0.113.80:443"],
            ["PROTO", "TCP SYN"],
            ["TTL", "127"],
          ],
          log: ["nat: 192.168.1.10:51544 → 203.0.113.25:51544", "conntrack: tcp SYN_SENT"],
        },
        {
          via: ["rt", "isp", "ix", "fw"],
          tag: "SYN",
          title: S("Маршрутизация", "Marshrutlash", "Routing"),
          text: S(
            "Каждый маршрутизатор смотрит в таблицу маршрутов, выбирает следующий хоп и уменьшает TTL на 1. Провайдеры обмениваются маршрутами по протоколу BGP.",
            "Har bir marshrutizator marshrutlar jadvaliga qarab keyingi hopni tanlaydi va TTL ni 1 ga kamaytiradi. Provayderlar marshrutlarni BGP protokoli orqali almashadi.",
            "Each router checks its routing table, picks the next hop and decrements the TTL by 1. Providers exchange routes using BGP."
          ),
          hdr: [
            ["SRC", "203.0.113.25:51544"],
            ["DST", "203.0.113.80:443"],
            ["PROTO", "TCP SYN"],
            ["TTL", "124"],
          ],
          log: [
            " 1  192.168.1.1     0.6 ms",
            " 2  10.20.0.1       3.1 ms",
            " 3  ix-peering      8.4 ms",
            " 4  203.0.113.1    21.7 ms",
          ],
        },
        {
          via: ["fw", "lb"],
          tag: "TLS 1.3",
          title: S("Защита и шифрование", "Himoya va shifrlash", "Protection and encryption"),
          text: S(
            "Межсетевой экран пропускает только порт 443 и отсекает DDoS. Балансировщик завершает рукопожатие TCP (SYN → SYN-ACK → ACK) и TLS 1.3 — дальше всё зашифровано.",
            "Tarmoqlararo ekran faqat 443-portni o‘tkazadi va DDoS’ni to‘sadi. Balansirovshik TCP (SYN → SYN-ACK → ACK) va TLS 1.3 qo‘l berishishini yakunlaydi — keyin hammasi shifrlangan.",
            "The firewall only lets port 443 through and filters DDoS. The load balancer completes the TCP (SYN → SYN-ACK → ACK) and TLS 1.3 handshakes — from here on everything is encrypted."
          ),
          log: ["fw: accept tcp/443 · drop 12.4k pps (ddos)", "tls: TLSv1.3 · TLS_AES_128_GCM_SHA256"],
        },
        {
          via: ["lb", "web", "db", "web"],
          tags: ["GET /", "SELECT", "rows"],
          title: S("Работа сервера", "Server ishi", "The server at work"),
          text: S(
            "Балансировщик выбирает наименее загруженный веб-сервер. Nginx передаёт запрос приложению, а оно берёт данные из PostgreSQL.",
            "Balansirovshik eng kam yuklangan veb-serverni tanlaydi. Nginx so‘rovni ilovaga uzatadi, ilova esa ma’lumotni PostgreSQL’dan oladi.",
            "The load balancer picks the least busy web server. Nginx hands the request to the app, which reads the data from PostgreSQL."
          ),
          log: ['nginx: "GET / HTTP/2" 200', "postgres: SELECT … 3 rows (0.8 ms)"],
        },
        {
          via: ["web", "lb", "fw", "ix", "isp", "rt", "sw", "pc"],
          tag: "200 OK",
          flow: "fwd",
          title: S("Ответ", "Javob", "The response"),
          text: S(
            "Страница летит обратно тем же путём. Роутер по таблице NAT узнаёт, что ответ для 192.168.1.10. Весь путь туда и обратно — 20–60 мс.",
            "Sahifa xuddi shu yo‘l bilan qaytadi. Router NAT jadvali bo‘yicha javob 192.168.1.10 uchun ekanini biladi. Borib-kelish — 20–60 ms.",
            "The page travels back the same way. The router's NAT table knows the reply is for 192.168.1.10. The whole round trip takes 20–60 ms."
          ),
          hdr: [
            ["SRC", "203.0.113.80:443"],
            ["DST", "192.168.1.10:51544"],
            ["HTTP", "200 OK · 48 KB"],
            ["RTT", "34 ms"],
          ],
          log: ["http: 200 OK · 48 KB · h2", "rtt: 34 ms · page ready"],
        },
      ],
    },

    {
      id: "voip",
      name: S("IP-телефония", "IP-telefoniya", "VoIP"),
      title: S(
        "IP-телефония: как звонок проходит через АТС",
        "IP-telefoniya: qo‘ng‘iroq ATS orqali qanday o‘tadi",
        "VoIP: how a call goes through the PBX"
      ),
      zones: [
        { x: 25, y: 40, w: 430, h: 425, label: S("офис", "ofis", "office") },
        { x: 470, y: 150, w: 275, h: 200, label: S("оператор связи", "aloqa operatori", "carrier") },
      ],
      nodes: {
        a: {
          x: 75,
          y: 250,
          icon: "phone",
          label: S("IP-телефон", "IP-telefon", "IP phone"),
          sub: S("доб. 101", "ichki 101", "ext. 101"),
        },
        b: {
          x: 360,
          y: 410,
          icon: "phone",
          label: S("IP-телефон", "IP-telefon", "IP phone"),
          sub: S("доб. 102", "ichki 102", "ext. 102"),
        },
        sw: {
          x: 215,
          y: 250,
          icon: "switch",
          label: S("PoE-коммутатор", "PoE-kommutator", "PoE switch"),
          sub: "VLAN 20 · QoS",
        },
        pbx: { x: 370, y: 250, icon: UNIT("PBX"), label: S("IP-АТС", "IP-ATS", "IP PBX"), sub: "IP-PBX" },
        crm: {
          x: 370,
          y: 100,
          icon: UNIT("CRM"),
          label: "CRM",
          sub: S("запись · CDR", "yozuv · CDR", "recording · CDR"),
        },
        sbc: { x: 530, y: 250, icon: UNIT("SBC"), label: S("SIP-транк", "SIP-trank", "SIP trunk"), sub: "SBC" },
        gw: {
          x: 680,
          y: 250,
          icon: UNIT("GW"),
          label: S("Медиашлюз", "Media-shlyuz", "Media gateway"),
          sub: "SIP ↔ SS7",
        },
        pstn: {
          x: 810,
          y: 250,
          icon: "cloud",
          label: S("ТфОП", "Shahar tarmog‘i", "PSTN"),
          sub: S("город · мобильные", "shahar · mobil", "city · mobile"),
        },
        mob: { x: 935, y: 250, icon: "mobile", label: S("Клиент", "Mijoz", "Customer"), sub: "+998 90 …" },
      },
      links: [
        ["a", "sw", "cu"],
        ["b", "sw", "cu"],
        ["sw", "pbx", "cu"],
        ["pbx", "crm", "cu"],
        ["pbx", "sbc", "fiber", "SIP 5060"],
        ["sbc", "gw", "fiber"],
        ["gw", "pstn", "e1", "E1 · SS7"],
        ["pstn", "mob", "air", "LTE"],
      ],
      steps: [
        {
          via: ["a", "sw", "pbx", "sw", "a"],
          tag: "REGISTER",
          back: "200 OK",
          title: S("Регистрация", "Ro‘yxatdan o‘tish", "Registration"),
          text: S(
            "Телефон авторизуется на IP-АТС по протоколу SIP (порт 5060) логином и паролем и сообщает свой адрес — теперь АТС знает, куда слать вызовы на номер 101.",
            "Telefon IP-ATS’da SIP protokoli (5060-port) orqali login va parol bilan avtorizatsiyadan o‘tadi va manzilini bildiradi — endi ATS 101 raqamiga qo‘ng‘iroqlarni qayerga yuborishni biladi.",
            "The phone logs in to the IP PBX over SIP (port 5060) with a username and password and reports its address — now the PBX knows where to send calls for extension 101."
          ),
          log: [
            "→ REGISTER sip:101@pbx.local",
            "← 401 Unauthorized (digest)",
            "→ REGISTER + auth",
            "← 200 OK · expires 3600",
          ],
        },
        {
          via: ["a", "sw", "pbx", "sw", "b"],
          tag: "INVITE",
          title: S("Внутренний звонок", "Ichki qo‘ng‘iroq", "Internal call"),
          text: S(
            "Набираете 102 — АТС находит коллегу и отправляет ему INVITE. Телефон звонит: 180 Ringing. Звонки внутри офиса бесплатные.",
            "102 ni terasiz — ATS hamkasbingizni topib, unga INVITE yuboradi. Telefon jiringlaydi: 180 Ringing. Ofis ichidagi qo‘ng‘iroqlar bepul.",
            "You dial 102 — the PBX finds your colleague and sends an INVITE. Their phone rings: 180 Ringing. Calls inside the office are free."
          ),
          log: ["→ INVITE sip:102@pbx.local", "← 100 Trying", "← 180 Ringing", "← 200 OK → ACK"],
        },
        {
          via: ["a", "sw", "b"],
          tag: "RTP",
          flow: "both",
          title: S("Голос: RTP", "Ovoz: RTP", "Voice: RTP"),
          text: S(
            "После ответа голос идёт пакетами RTP: каждые 20 мс — 50 пакетов в секунду в каждую сторону. Кодек G.711 — 64 кбит/с, Opus — от 16 кбит/с.",
            "Javobdan so‘ng ovoz RTP paketlarida boradi: har 20 ms da — har tomonga soniyasiga 50 paket. G.711 kodeki — 64 kbit/s, Opus — 16 kbit/s dan.",
            "Once answered, the voice flows as RTP packets: one every 20 ms — 50 packets per second each way. G.711 uses 64 kbit/s, Opus from 16 kbit/s."
          ),
          hdr: [
            ["CODEC", "G.711 A-law"],
            ["PTIME", "20 ms"],
            ["DSCP", "EF (46)"],
            ["JITTER", "2 ms"],
          ],
          log: ["rtp: 101 ⇄ 102 · 50 pps · G.711a", "qos: dscp ef · loss 0.0%"],
        },
        {
          via: ["a", "sw", "pbx", "sbc"],
          tag: "INVITE",
          title: S("Звонок наружу", "Tashqi qo‘ng‘iroq", "Outbound call"),
          text: S(
            "Набираете +998 90 … — АТС по правилам маршрутизации отправляет вызов оператору через SIP-транк. SBC на границе проверяет и защищает сессию.",
            "+998 90 … ni terasiz — ATS marshrutlash qoidalari bo‘yicha qo‘ng‘iroqni SIP-trank orqali operatorga yuboradi. Chegaradagi SBC sessiyani tekshiradi va himoya qiladi.",
            "You dial +998 90 … — the PBX routing rules send the call to the carrier over a SIP trunk. The SBC at the edge checks and protects the session."
          ),
          log: ["→ INVITE sip:+99890…@trunk", "← 100 Trying", "sbc: auth ok · codec g711a"],
        },
        {
          via: ["sbc", "gw", "pstn", "mob"],
          tag: "IAM",
          title: S("В мобильную сеть", "Mobil tarmoqqa", "Into the mobile network"),
          text: S(
            "Медиашлюз переводит SIP в сигнализацию телефонной сети SS7 (ISUP). Сеть находит абонента — у клиента звонит телефон.",
            "Media-shlyuz SIP’ni telefon tarmog‘ining SS7 (ISUP) signalizatsiyasiga o‘giradi. Tarmoq abonentni topadi — mijozning telefoni jiringlaydi.",
            "The media gateway translates SIP into the phone network's SS7 (ISUP) signalling. The network finds the subscriber — the customer's phone rings."
          ),
          log: ["isup: IAM → ACM (ringing)", "← 180 Ringing", "← 200 OK · ANM"],
        },
        {
          via: ["a", "sw", "pbx", "sbc", "gw", "pstn", "mob"],
          tag: "RTP",
          flow: "both",
          title: S("Разговор", "Suhbat", "The conversation"),
          text: S(
            "Голос оцифрован и идёт пакетами через всю цепочку. Если задержка в одну сторону меньше 150 мс (норма ITU-T G.114), разговор звучит естественно.",
            "Ovoz raqamlashtirilgan va butun zanjir bo‘ylab paketlarda boradi. Bir tomonlama kechikish 150 ms dan kam bo‘lsa (ITU-T G.114 me’yori), suhbat tabiiy eshitiladi.",
            "The voice is digitized and travels in packets through the whole chain. With one-way delay under 150 ms (the ITU-T G.114 norm), the call sounds natural."
          ),
          hdr: [
            ["DELAY", "68 ms"],
            ["JITTER", "4 ms"],
            ["LOSS", "0.1%"],
            ["MOS", "4.3"],
          ],
          log: ["rtp: 101 ⇄ +99890… · mos 4.3"],
        },
        {
          via: ["pbx", "crm"],
          tag: "CDR",
          title: S("Запись и аналитика", "Yozuv va tahlil", "Recording and analytics"),
          text: S(
            "АТС записывает разговор и сохраняет CDR — кто звонил, сколько ждал, сколько говорил. В CRM видно каждого клиента и все пропущенные.",
            "ATS suhbatni yozib oladi va CDR’ni saqlaydi — kim qo‘ng‘iroq qildi, qancha kutdi, qancha gaplashdi. CRM’da har bir mijoz va barcha o‘tkazib yuborilganlar ko‘rinadi.",
            "The PBX records the call and stores the CDR — who called, how long they waited and talked. The CRM shows every customer and every missed call."
          ),
          log: ["cdr: 101 → +99890… · 03:42 · ANSWERED", "crm: call linked to deal #2481"],
        },
      ],
    },

    {
      id: "pstn",
      name: S("Городская связь", "Shahar aloqasi", "City phone line"),
      title: S("Городская телефонная связь (ТфОП)", "Shahar telefon aloqasi (PSTN)", "The city phone network (PSTN)"),
      h: 500,
      zones: [{ x: 225, y: 40, w: 550, h: 330, label: S("сеть оператора", "operator tarmog‘i", "carrier network") }],
      nodes: {
        a: {
          x: 80,
          y: 290,
          icon: "analog",
          label: S("Телефон А", "Telefon A", "Phone A"),
          sub: S("аналог", "analog", "analog"),
        },
        ats1: { x: 300, y: 290, icon: "ats", label: S("Районная АТС", "Tuman ATS", "Local exchange"), sub: "Class 5" },
        tr: {
          x: 500,
          y: 125,
          icon: "ats",
          label: S("Транзитная АТС", "Tranzit ATS", "Tandem exchange"),
          sub: "SS7 · STP",
        },
        ats2: {
          x: 700,
          y: 290,
          icon: "ats",
          label: S("АТС абонента Б", "B abonent ATS", "Exchange B"),
          sub: "Class 5",
        },
        b: {
          x: 920,
          y: 290,
          icon: "analog",
          label: S("Телефон Б", "Telefon B", "Phone B"),
          sub: S("аналог", "analog", "analog"),
        },
        bill: {
          x: 500,
          y: 410,
          icon: UNIT("CDR"),
          label: S("Биллинг", "Billing", "Billing"),
          sub: S("тарификация", "tariflash", "rating"),
        },
      },
      links: [
        ["a", "ats1", "cu", S("медная пара · до 5 км", "mis juftlik · 5 km gacha", "copper pair · up to 5 km")],
        ["ats1", "tr", "fiber", "E1 · SDH"],
        ["tr", "ats2", "fiber", "E1 · SDH"],
        ["ats2", "b", "cu", S("медная пара", "mis juftlik", "copper pair")],
        ["ats1", "bill", "data"],
      ],
      steps: [
        {
          via: ["a", "ats1", "a"],
          tag: "LOOP 25 mA",
          back: "425 Hz",
          title: S("Снятие трубки", "Go‘shakni ko‘tarish", "Off-hook"),
          text: S(
            "Трубка замыкает шлейф: по медной паре течёт ток ~25 мА. АТС видит это и отвечает гудком «ответ станции» — тон 425 Гц.",
            "Go‘shak shleyfni tutashtiradi: mis juftlik bo‘ylab ~25 mA tok oqadi. ATS buni ko‘rib, 425 Gs ohangli «stansiya javobi» signalini beradi.",
            "Lifting the handset closes the loop: ~25 mA flows through the copper pair. The exchange detects it and plays the 425 Hz dial tone."
          ),
          hdr: [
            ["LINE", "−60 V → −8 V"],
            ["LOOP", "25 mA"],
            ["TONE", "425 Hz"],
          ],
          log: ["line 12-07: off-hook", "tone: dial 425 Hz"],
        },
        {
          via: ["a", "ats1"],
          tag: "DTMF 5",
          title: S("Набор номера", "Raqam terish", "Dialing"),
          text: S(
            "Каждая цифра — сочетание двух частот DTMF: например, «5» = 770 Гц + 1336 Гц. АТС собирает цифры и анализирует номер.",
            "Har bir raqam — ikki DTMF chastotasi birikmasi: masalan, «5» = 770 Gs + 1336 Gs. ATS raqamlarni yig‘ib, raqamni tahlil qiladi.",
            "Each digit is a pair of DTMF tones: “5” = 770 Hz + 1336 Hz. The exchange collects the digits and analyses the number."
          ),
          hdr: [
            ["DIGIT", "5"],
            ["LOW", "770 Hz"],
            ["HIGH", "1336 Hz"],
            ["NUMBER", "255-01-23"],
          ],
          log: ["dtmf: 2 5 5 0 1 2 3", "route: 255xxxx → tandem"],
        },
        {
          via: ["ats1", "tr", "ats2"],
          tag: "IAM",
          title: S("Сигнализация SS7", "SS7 signalizatsiyasi", "SS7 signalling"),
          text: S(
            "По отдельному каналу сигнализации SS7 АТС отправляет сообщение IAM: «соедини с номером 255-01-23». Транзитная станция выбирает маршрут и свободный канал.",
            "Alohida SS7 signalizatsiya kanali orqali ATS IAM xabarini yuboradi: «255-01-23 raqami bilan ulang». Tranzit stansiya yo‘nalish va bo‘sh kanalni tanlaydi.",
            "Over a separate SS7 signalling channel the exchange sends an IAM: “connect me to 255-01-23”. The tandem exchange picks a route and a free channel."
          ),
          log: ["isup: IAM cic 17 → 255-01-23", "stp: route via tandem-2"],
        },
        {
          via: ["ats2", "b"],
          tag: "RING 25 Hz",
          title: S("Звонок", "Qo‘ng‘iroq", "Ringing"),
          text: S(
            "Станция Б подаёт на линию вызывное напряжение ~75–100 В частотой 25 Гц — телефон звонит. Обратно уходит ACM: «абонент свободен, звоним».",
            "B stansiyasi liniyaga 25 Gs chastotali ~75–100 V chaqiruv kuchlanishini beradi — telefon jiringlaydi. Orqaga ACM ketadi: «abonent bo‘sh, chaqiryapmiz».",
            "Exchange B puts ~75–100 V of ringing voltage at 25 Hz on the line — the phone rings. An ACM goes back: “subscriber free, ringing”."
          ),
          hdr: [
            ["RING", "90 V · 25 Hz"],
            ["ISUP", "ACM"],
          ],
          log: ["line 03-41: ringing", "isup: ACM ← cic 17"],
        },
        {
          via: ["b", "ats2", "tr", "ats1", "a"],
          tag: "ANM",
          title: S("Ответ", "Javob", "Answer"),
          text: S(
            "Абонент Б снял трубку — сообщение ANM возвращается к станции А. Голосовой канал скоммутирован, начинается тарификация.",
            "B abonent go‘shakni ko‘tardi — ANM xabari A stansiyasiga qaytadi. Ovoz kanali ulandi, tariflash boshlanadi.",
            "Subscriber B picks up — an ANM travels back to exchange A. The voice channel is connected and billing starts."
          ),
          log: ["isup: ANM ← cic 17", "billing: start 14:02:11"],
        },
        {
          via: ["a", "ats1", "tr", "ats2", "b"],
          tag: "PCM",
          flow: "both",
          title: S("Разговор: 64 кбит/с", "Suhbat: 64 kbit/s", "Talking: 64 kbit/s"),
          text: S(
            "Голос оцифровывается: 8000 отсчётов в секунду × 8 бит = 64 кбит/с. Каждый разговор занимает один таймслот потока E1 (30 голосовых каналов, 2 Мбит/с).",
            "Ovoz raqamlashtiriladi: soniyasiga 8000 namuna × 8 bit = 64 kbit/s. Har bir suhbat E1 oqimining bitta taymslotini egallaydi (30 ovoz kanali, 2 Mbit/s).",
            "The voice is digitized: 8000 samples per second × 8 bits = 64 kbit/s. Each call takes one timeslot of an E1 link (30 voice channels, 2 Mbit/s)."
          ),
          hdr: [
            ["PCM", "G.711 · 8 kHz"],
            ["RATE", "64 kbit/s"],
            ["E1", "TS 17 / 32"],
          ],
          log: ["e1: ts17 busy · 2.048 Mbit/s"],
        },
        {
          via: ["ats1", "bill"],
          tag: "CDR",
          title: S("Отбой и тарификация", "Yakunlash va tariflash", "Hang-up and billing"),
          text: S(
            "После отбоя станции обмениваются REL/RLC и освобождают канал. АТС пишет CDR: кто, кому, сколько минут — из этого формируется счёт.",
            "Go‘shak qo‘yilgach stansiyalar REL/RLC almashadi va kanalni bo‘shatadi. ATS CDR yozadi: kim, kimga, necha daqiqa — hisob shundan tuziladi.",
            "After hang-up the exchanges swap REL/RLC and free the channel. The exchange writes a CDR — who, to whom, how many minutes — and that becomes the bill."
          ),
          log: ["isup: REL → RLC", "cdr: 2xx → 255-01-23 · 04:12"],
        },
      ],
    },

    {
      id: "intl",
      name: S("Международный звонок", "Xalqaro qo‘ng‘iroq", "International call"),
      title: S(
        "Международный звонок: Ташкент → Нью-Йорк",
        "Xalqaro qo‘ng‘iroq: Toshkent → Nyu-York",
        "An international call: Tashkent → New York"
      ),
      zones: [
        { x: 25, y: 110, w: 345, h: 340, label: S("Узбекистан", "O‘zbekiston", "Uzbekistan") },
        { x: 385, y: 110, w: 115, h: 150, label: S("Европа", "Yevropa", "Europe") },
        { x: 630, y: 110, w: 345, h: 340, label: S("США", "AQSh", "USA") },
      ],
      nodes: {
        a: { x: 70, y: 370, icon: "phone", label: S("Ташкент", "Toshkent", "Tashkent"), sub: "+998 71 …" },
        ats: { x: 200, y: 370, icon: "ats", label: S("АТС", "ATS", "Exchange"), sub: S("городская", "shahar", "city") },
        isc: {
          x: 300,
          y: 180,
          icon: UNIT("ISC"),
          label: S("Международный", "Xalqaro", "International"),
          sub: S("центр коммутации", "kommutatsiya markazi", "switching centre"),
        },
        eu: {
          x: 440,
          y: 180,
          icon: "router",
          label: S("Транзит", "Tranzit", "Transit"),
          sub: S("Европа · хаб", "Yevropa · xab", "Europe · hub"),
        },
        us: {
          x: 720,
          y: 180,
          icon: "router",
          label: S("Шлюз США", "AQSh shlyuzi", "US gateway"),
          sub: S("Нью-Йорк", "Nyu-York", "New York"),
        },
        core: {
          x: 870,
          y: 180,
          icon: UNIT("MSC"),
          label: S("Мобильное ядро", "Mobil yadro", "Mobile core"),
          sub: "MSC · HSS",
        },
        bts: {
          x: 870,
          y: 370,
          icon: "tower",
          label: S("Базовая станция", "Baza stansiyasi", "Cell tower"),
          sub: "LTE / 5G",
        },
        b: { x: 700, y: 370, icon: "mobile", label: S("Нью-Йорк", "Nyu-York", "New York"), sub: "+1 212 555 …" },
      },
      links: [
        ["a", "ats", "cu"],
        ["ats", "isc", "fiber"],
        ["isc", "eu", "fiber", S("оптика", "optika", "fiber")],
        [
          "eu",
          "us",
          "sea",
          S("подводный кабель · ~6 600 км", "suv osti kabeli · ~6 600 km", "subsea cable · ~6,600 km"),
          240,
        ],
        ["us", "core", "fiber"],
        ["core", "bts", "fiber"],
        ["bts", "b", "air", "LTE"],
      ],
      steps: [
        {
          via: ["a", "ats"],
          tag: "+1 212…",
          title: S("Набор номера", "Raqam terish", "Dialing"),
          text: S(
            "Номер +1 212 555 …: «1» — код США, «212» — код зоны Нью-Йорка. По префиксу АТС понимает, что звонок международный, и передаёт его дальше.",
            "+1 212 555 … raqami: «1» — AQSh kodi, «212» — Nyu-York hudud kodi. Prefiks bo‘yicha ATS qo‘ng‘iroq xalqaro ekanini tushunadi va uni uzatadi.",
            "Number +1 212 555 …: “1” is the US country code, “212” the New York area code. From the prefix the exchange knows the call is international and passes it on."
          ),
          hdr: [
            ["CC", "+1 (USA)"],
            ["NDC", "212 (NYC)"],
            ["SN", "555 01 23"],
          ],
          log: ["dial: +1 212 555 0123", "route: international → ISC"],
        },
        {
          via: ["ats", "isc"],
          tag: "IAM",
          title: S("Международный центр", "Xalqaro markaz", "International centre"),
          text: S(
            "Международный центр коммутации выбирает оператора-партнёра и маршрут — по качеству и цене минуты. Здесь же звонок попадает в межоператорский учёт.",
            "Xalqaro kommutatsiya markazi hamkor operator va yo‘nalishni tanlaydi — sifat va daqiqa narxiga qarab. Shu yerda qo‘ng‘iroq operatorlararo hisobga tushadi.",
            "The international switching centre picks a partner carrier and a route by quality and price per minute. This is also where inter-carrier accounting starts."
          ),
          log: ["isc: route +1 → carrier B · asr 62%", "isup IAM → sip INVITE"],
        },
        {
          via: ["isc", "eu"],
          tag: "SIP",
          title: S("Транзит", "Tranzit", "Transit"),
          text: S(
            "Между странами звонок чаще всего идёт по IP через транзитных операторов: голос не занимает отдельный провод, а летит пакетами вместе с интернет-трафиком.",
            "Mamlakatlar orasida qo‘ng‘iroq ko‘pincha tranzit operatorlar orqali IP bo‘yicha boradi: ovoz alohida simni egallamaydi, internet trafigi bilan birga paketlarda uchadi.",
            "Between countries the call usually travels over IP through transit carriers: the voice doesn't occupy its own wire but flies in packets alongside internet traffic."
          ),
          log: ["sip: INVITE via transit-eu", "rtp: g711a · no transcoding"],
        },
        {
          via: ["eu", "us"],
          tag: "λ 1550 nm",
          title: S("Подводный кабель", "Suv osti kabeli", "Subsea cable"),
          text: S(
            "Атлантику голос пересекает по оптическому кабелю на дне океана: свет в стекле проходит ~6 600 км примерно за 33 мс. Через спутник было бы ~250 мс.",
            "Atlantikani ovoz okean tubidagi optik kabel orqali kesib o‘tadi: shishadagi yorug‘lik ~6 600 km ni taxminan 33 ms da bosib o‘tadi. Sun’iy yo‘ldosh orqali ~250 ms bo‘lardi.",
            "The voice crosses the Atlantic through an optical cable on the ocean floor: light in glass covers ~6,600 km in about 33 ms. Via satellite it would take ~250 ms."
          ),
          hdr: [
            ["LENGTH", "~6 600 km"],
            ["LIGHT", "~200 000 km/s"],
            ["DELAY", "~33 ms"],
            ["SATELLITE", "~250 ms"],
          ],
          log: ["cable: dwdm 1550 nm · 200 Gbit/s per λ", "latency: eu → nyc 33 ms"],
        },
        {
          via: ["us", "core", "bts", "b"],
          tag: "PAGING",
          title: S("Поиск абонента", "Abonentni qidirish", "Finding the subscriber"),
          text: S(
            "Оператор США по номеру проверяет в базе HSS, где сейчас телефон, и вызывает его через ближайшую базовую станцию — телефон звонит.",
            "AQSh operatori raqam bo‘yicha HSS bazasida telefon hozir qayerdaligini tekshiradi va uni eng yaqin baza stansiyasi orqali chaqiradi — telefon jiringlaydi.",
            "The US carrier checks its HSS database for where the phone is right now and pages it through the nearest cell tower — the phone rings."
          ),
          log: ["hss: +1212555… → cell nyc-0412", "lte: paging → 180 Ringing"],
        },
        {
          via: ["a", "ats", "isc", "eu", "us", "core", "bts", "b"],
          tag: "VOICE",
          flow: "both",
          title: S("Разговор через океан", "Okean orqali suhbat", "Talking across the ocean"),
          text: S(
            "Между Ташкентом и Нью-Йорком ~10 200 км по прямой, по кабелям — больше. Задержка в одну сторону 100–150 мс: собеседник слышит вас почти мгновенно.",
            "Toshkent va Nyu-York orasida to‘g‘ri chiziqda ~10 200 km, kabellar bo‘yicha — ko‘proq. Bir tomonlama kechikish 100–150 ms: suhbatdosh sizni deyarli darhol eshitadi.",
            "Tashkent and New York are ~10,200 km apart as the crow flies, more along the cables. One-way delay is 100–150 ms — the other side hears you almost instantly."
          ),
          hdr: [
            ["DISTANCE", "~10 200 km"],
            ["DELAY", "~120 ms"],
            ["CODEC", "G.711 / AMR-WB"],
          ],
          log: ["rtp: tas ⇄ nyc · delay 118 ms · mos 4.1"],
        },
        {
          via: ["b", "bts", "core", "us", "eu", "isc", "ats", "a"],
          tag: "REL",
          title: S("Отбой и расчёты", "Yakunlash va hisob-kitob", "Hang-up and settlement"),
          text: S(
            "После отбоя каждая сеть записывает CDR. Операторы разных стран потом рассчитываются между собой по межоператорским тарифам за каждую минуту.",
            "Yakunlangach har bir tarmoq CDR yozadi. Turli mamlakatlar operatorlari keyin har bir daqiqa uchun operatorlararo tariflar bo‘yicha hisob-kitob qiladi.",
            "After hang-up every network writes a CDR. Carriers in different countries then settle with each other per minute at wholesale rates."
          ),
          log: ["sip: BYE → 200 OK", "cdr: tas → nyc · 06:18 · settled"],
        },
      ],
    },

    {
      id: "vpn",
      name: S("VPN", "VPN", "VPN"),
      title: S("Как работает VPN", "VPN qanday ishlaydi", "How a VPN works"),
      h: 500,
      tunnel: ["pc", "wifi", "isp", "vpn"],
      zones: [{ x: 560, y: 185, w: 180, h: 160, label: S("другая страна", "boshqa davlat", "another country") }],
      nodes: {
        pc: {
          x: 80,
          y: 260,
          icon: "laptop",
          label: S("Ваше устройство", "Qurilmangiz", "Your device"),
          sub: "10.8.0.2",
        },
        wifi: { x: 220, y: 260, icon: "ap", label: "Wi-Fi", sub: S("кафе / дом", "kafe / uy", "café / home") },
        isp: { x: 380, y: 260, icon: "router", label: S("Провайдер", "Provayder", "ISP"), sub: "DPI" },
        eve: {
          x: 380,
          y: 415,
          icon: "eye",
          label: S("Наблюдатель", "Kuzatuvchi", "Observer"),
          sub: S("DPI · хакер в Wi-Fi", "DPI · Wi-Fi’dagi xaker", "DPI · Wi-Fi snooper"),
        },
        vpn: { x: 650, y: 260, icon: "lock", label: S("VPN-сервер", "VPN-server", "VPN server"), sub: "WireGuard" },
        site: { x: 900, y: 130, icon: "globe", label: S("Сайт", "Sayt", "Website"), sub: "site.com" },
      },
      links: [
        ["pc", "wifi", "air"],
        ["wifi", "isp", "fiber"],
        ["isp", "vpn", "fiber"],
        ["isp", "site", "fiber", S("напрямую", "to‘g‘ridan-to‘g‘ri", "direct"), -150],
        ["vpn", "site", "fiber"],
        ["isp", "eve", "tap"],
      ],
      steps: [
        {
          via: ["pc", "wifi", "isp", "site"],
          tag: "site.com",
          alarm: ["eve"],
          title: S("Без VPN", "VPN’siz", "Without a VPN"),
          text: S(
            "Провайдер и любой в той же Wi-Fi-сети видят, на какие сайты вы ходите (по DNS и имени в TLS), а на сайтах без HTTPS — даже содержимое.",
            "Provayder va o‘sha Wi-Fi tarmog‘idagi har kim qaysi saytlarga kirayotganingizni ko‘radi (DNS va TLS’dagi nom orqali), HTTPS’siz saytlarda esa — hatto mazmunini ham.",
            "Your ISP and anyone on the same Wi-Fi can see which sites you visit (from DNS and the name in TLS), and on sites without HTTPS even the content."
          ),
          hdr: [
            ["SRC", "203.0.113.25"],
            ["DST", "203.0.113.80 (site.com)"],
            ["SNI", "site.com"],
            ["SEEN", "✓ visible"],
          ],
          log: ["eve$ tcpdump -i wlan0", "10.0.0.23 > dns: site.com A?", "10.0.0.23 > site.com: TLS SNI=site.com"],
        },
        {
          via: ["pc", "wifi", "isp", "vpn", "isp", "wifi", "pc"],
          tag: "HANDSHAKE",
          back: "KEYS ✓",
          tunnel: true,
          title: S("Рукопожатие", "Qo‘l berishish", "Handshake"),
          text: S(
            "Клиент и VPN-сервер обмениваются публичными ключами (Curve25519) и вычисляют общий секрет. Сам секрет по сети не передаётся — подсмотреть его нельзя.",
            "Mijoz va VPN-server ochiq kalitlar (Curve25519) almashadi va umumiy sirni hisoblaydi. Sirning o‘zi tarmoq orqali uzatilmaydi — uni ko‘rib bo‘lmaydi.",
            "The client and the VPN server exchange public keys (Curve25519) and compute a shared secret. The secret itself never crosses the network, so nobody can sniff it."
          ),
          log: ["wg0: handshake initiation → 198.51.100.7:51820", "wg0: handshake response ← keys ok"],
        },
        {
          via: ["pc", "wifi", "isp", "vpn"],
          tag: "site.com",
          crypt: true,
          tunnel: true,
          title: S("Шифрование и упаковка", "Shifrlash va o‘rash", "Encrypt and wrap"),
          text: S(
            "Исходный пакет целиком шифруется ChaCha20 и вкладывается в новый UDP-пакет, адресованный только VPN-серверу. Внутри — куда и что, снаружи — шум.",
            "Asl paket butunlay ChaCha20 bilan shifrlanadi va faqat VPN-serverga yo‘naltirilgan yangi UDP paketga joylanadi. Ichida — qayerga va nima, tashqarida — shovqin.",
            "The original packet is fully encrypted with ChaCha20 and placed inside a new UDP packet addressed only to the VPN server. Inside: where and what; outside: noise."
          ),
          hdr: [
            ["OUTER", "203.0.113.25 → 198.51.100.7"],
            ["UDP", "51820"],
            ["INNER", "10.8.0.2 → site.com ▒▒▒"],
            ["CIPHER", "ChaCha20-Poly1305"],
          ],
          log: ["wg0: encrypt 1420 B → udp 1452 B"],
        },
        {
          via: ["pc", "wifi", "isp", "eve"],
          tag: "UDP 148 B",
          crypt: true,
          tunnel: true,
          title: S("Что видит провайдер", "Provayder nimani ko‘radi", "What the ISP sees"),
          text: S(
            "Только зашифрованный UDP-поток на один IP-адрес. Ни сайтов, ни DNS-запросов, ни содержимого — только объём и время.",
            "Faqat bitta IP-manzilga shifrlangan UDP oqimi. Na saytlar, na DNS so‘rovlari, na mazmun — faqat hajm va vaqt.",
            "Just an encrypted UDP stream to one IP address. No sites, no DNS queries, no content — only volume and timing."
          ),
          hdr: [
            ["SRC", "203.0.113.25:51820"],
            ["DST", "198.51.100.7:51820"],
            ["DATA", "▒▒▒▒▒▒▒▒ 148 B"],
            ["SEEN", "✕ encrypted"],
          ],
          log: ["eve$ tcpdump -i wlan0", "10.0.0.23.51820 > 198.51.100.7.51820: UDP 148", "eve$ ??? (encrypted)"],
        },
        {
          via: ["vpn", "site"],
          tag: "site.com",
          title: S("Расшифровка и выход", "Shifrni ochish va chiqish", "Decrypt and exit"),
          text: S(
            "VPN-сервер снимает «конверт», расшифровывает пакет и отправляет его от своего имени. Сайт видит IP сервера в другой стране, а не ваш.",
            "VPN-server «konvert»ni olib, paketni shifrdan chiqaradi va o‘z nomidan yuboradi. Sayt sizning emas, boshqa davlatdagi server IP’sini ko‘radi.",
            "The VPN server removes the “envelope”, decrypts the packet and sends it on its own behalf. The site sees the server's IP in another country, not yours."
          ),
          hdr: [
            ["SRC", "198.51.100.7"],
            ["DST", "site.com:443"],
            ["YOUR IP", "hidden"],
          ],
          log: ["wg0: decrypt ok · nat 10.8.0.2 → 198.51.100.7", "site.com: visitor 198.51.100.7"],
        },
        {
          via: ["site", "vpn", "isp", "wifi", "pc"],
          tag: "200 OK",
          crypt: "tunnel",
          tunnel: true,
          flow: "fwd",
          title: S("Ответ — тоже в туннеле", "Javob ham tunnelda", "The reply is tunneled too"),
          text: S(
            "Ответ сайта приходит на VPN-сервер, снова шифруется и по туннелю возвращается к вам. Так же соединяют филиалы офиса и удалённых сотрудников (site-to-site).",
            "Sayt javobi VPN-serverga keladi, yana shifrlanadi va tunnel orqali sizga qaytadi. Ofis filiallari va masofaviy xodimlar ham shunday ulanadi (site-to-site).",
            "The site's reply reaches the VPN server, is encrypted again and comes back to you through the tunnel. Office branches and remote staff are linked the same way (site-to-site)."
          ),
          log: ["wg0: rx 48 KB · +18 ms latency"],
        },
        {
          via: ["pc", "wifi", "isp", "vpn"],
          tag: "TLS 1.3 :443",
          tunnel: true,
          title: S("Маскировка (Xray, v2rayN)", "Niqoblash (Xray, v2rayN)", "Camouflage (Xray, v2rayN)"),
          text: S(
            "Некоторые сети распознают VPN по «отпечатку» протокола. Xray (VLESS + Reality) маскирует туннель под обычное HTTPS-соединение с популярным сайтом — DPI видит привычный TLS.",
            "Ba’zi tarmoqlar VPN’ni protokol «izi» orqali aniqlaydi. Xray (VLESS + Reality) tunnelni mashhur saytga oddiy HTTPS ulanishi kabi niqoblaydi — DPI odatiy TLS’ni ko‘radi.",
            "Some networks spot VPNs by their protocol “fingerprint”. Xray (VLESS + Reality) disguises the tunnel as an ordinary HTTPS connection to a popular site — DPI sees regular TLS."
          ),
          hdr: [
            ["LOOKS LIKE", "TLS 1.3 → :443"],
            ["SNI", "www.microsoft.com"],
            ["REALLY", "VLESS tunnel"],
          ],
          log: ["dpi: tls 1.3 · sni www.microsoft.com · allow"],
        },
      ],
    },

    {
      id: "dns",
      name: S("DNS", "DNS", "DNS"),
      title: S("Как работает DNS", "DNS qanday ishlaydi", "How DNS works"),
      h: 500,
      nodes: {
        pc: { x: 90, y: 250, icon: "pc", label: S("Браузер", "Brauzer", "Browser"), sub: "site.uz ?" },
        res: { x: 380, y: 250, icon: UNIT("DNS"), label: S("Резолвер", "Rezolver", "Resolver"), sub: "1.1.1.1" },
        root: {
          x: 720,
          y: 85,
          icon: "server",
          label: S("Корневой «.»", "Ildiz «.»", "Root “.”"),
          sub: "a–m.root-servers",
        },
        tld: { x: 800, y: 250, icon: "server", label: S("Зона .uz", ".uz zonasi", "Zone .uz"), sub: "TLD" },
        auth: { x: 720, y: 415, icon: "server", label: S("NS сайта", "Sayt NS", "Site NS"), sub: "ns1.site.uz" },
      },
      links: [
        ["pc", "res", "cu", "UDP 53"],
        ["res", "root", "fiber"],
        ["res", "tld", "fiber"],
        ["res", "auth", "fiber"],
      ],
      steps: [
        {
          via: ["pc", "res"],
          tag: "site.uz A?",
          title: S("Вопрос", "Savol", "The question"),
          text: S(
            "Браузер не знает IP-адреса site.uz. Сначала он проверяет свой кэш и кэш системы, а если там пусто — спрашивает рекурсивный DNS-резолвер.",
            "Brauzer site.uz IP-manzilini bilmaydi. Avval o‘z keshini va tizim keshini tekshiradi, bo‘sh bo‘lsa — rekursiv DNS-rezolverdan so‘raydi.",
            "The browser doesn't know site.uz's IP. It first checks its own and the system's cache; if they're empty, it asks a recursive DNS resolver."
          ),
          log: ["$ dig site.uz A", ";; cache miss → 1.1.1.1"],
        },
        {
          via: ["res", "root", "res"],
          tag: "site.uz ?",
          back: "→ .uz",
          title: S("Корневой сервер", "Ildiz server", "Root server"),
          text: S(
            "Резолвер спрашивает корневой сервер. Тот не знает адрес сайта, но знает, кто отвечает за зону .uz. Корневых имён всего 13, а копий — больше тысячи по всему миру.",
            "Rezolver ildiz serverdan so‘raydi. U sayt manzilini bilmaydi, lekin .uz zonasi uchun kim javobgarligini biladi. Ildiz nomlari atigi 13 ta, nusxalari esa butun dunyo bo‘ylab mingdan ortiq.",
            "The resolver asks a root server. It doesn't know the site, but knows who runs the .uz zone. There are only 13 root names but over a thousand copies worldwide."
          ),
          log: [". → referral: uz. NS (TLD servers)"],
        },
        {
          via: ["res", "tld", "res"],
          tag: "site.uz ?",
          back: "→ ns1.site.uz",
          title: S("Доменная зона .uz", ".uz domen zonasi", "The .uz zone"),
          text: S(
            "Сервер зоны .uz подсказывает, какие DNS-серверы обслуживают именно site.uz — их владелец указал при регистрации домена.",
            ".uz zonasi serveri aynan site.uz’ga xizmat ko‘rsatadigan DNS-serverlarni aytadi — ularni egasi domenni ro‘yxatdan o‘tkazishda ko‘rsatgan.",
            "The .uz zone server says which DNS servers handle site.uz itself — the owner set them when registering the domain."
          ),
          log: ["uz. → referral: site.uz. NS ns1.site.uz"],
        },
        {
          via: ["res", "auth", "res"],
          tag: "A ?",
          back: "203.0.113.80",
          title: S("Точный ответ", "Aniq javob", "The exact answer"),
          text: S(
            "Авторитативный сервер сайта отвечает: A-запись 203.0.113.80, TTL 3600 — этот ответ можно хранить в кэше час.",
            "Saytning avtoritativ serveri javob beradi: A-yozuv 203.0.113.80, TTL 3600 — bu javobni keshda bir soat saqlash mumkin.",
            "The site's authoritative server answers: A record 203.0.113.80, TTL 3600 — the answer may be cached for an hour."
          ),
          log: ["site.uz. 3600 IN A 203.0.113.80 (aa)"],
        },
        {
          via: ["res", "pc"],
          tag: "203.0.113.80",
          title: S("Ответ и кэш", "Javob va kesh", "Answer and cache"),
          text: S(
            "Резолвер отдаёт адрес браузеру и запоминает его. Следующий посетитель получит ответ из кэша за 1–2 мс вместо 40–80 мс.",
            "Rezolver manzilni brauzerga beradi va eslab qoladi. Keyingi tashrifchi javobni keshdan 40–80 ms o‘rniga 1–2 ms da oladi.",
            "The resolver hands the address to the browser and remembers it. The next visitor gets the answer from cache in 1–2 ms instead of 40–80 ms."
          ),
          hdr: [
            ["QUERY", "site.uz A"],
            ["ANSWER", "203.0.113.80"],
            ["TTL", "3600"],
            ["TIME", "48 ms → 1 ms"],
          ],
          log: [";; ANSWER: site.uz. 3600 IN A 203.0.113.80", ";; Query time: 48 msec"],
        },
      ],
    },

    {
      id: "office",
      name: S("Сеть офиса", "Ofis tarmog‘i", "Office network"),
      title: S(
        "Сеть офиса: VLAN, защита и бэкапы",
        "Ofis tarmog‘i: VLAN, himoya va zaxira",
        "An office network: VLANs, security and backups"
      ),
      h: 500,
      zones: [{ x: 740, y: 110, w: 180, h: 255, label: S("серверная", "server xonasi", "server room") }],
      nodes: {
        inet: {
          x: 500,
          y: 55,
          icon: "cloud",
          label: S("Интернет", "Internet", "Internet"),
          sub: S("2 провайдера", "2 provayder", "2 ISPs"),
        },
        fw: { x: 500, y: 180, icon: "firewall", label: "Firewall / UTM", sub: "MikroTik · pfSense" },
        core: {
          x: 500,
          y: 300,
          icon: "switch",
          label: S("Ядро сети", "Tarmoq yadrosi", "Core switch"),
          sub: "L3 · VLAN · 10G",
        },
        srv: {
          x: 830,
          y: 180,
          icon: "server",
          label: S("Серверы", "Serverlar", "Servers"),
          sub: S("AD · 1С · АТС", "AD · 1C · ATS", "AD · ERP · PBX"),
        },
        nas: {
          x: 830,
          y: 300,
          icon: "db",
          label: "NAS · NVR",
          sub: S("видео · бэкапы", "video · zaxira", "video · backups"),
        },
        pcs: { x: 110, y: 420, icon: "pc", label: S("Рабочие места", "Ish joylari", "Workstations"), sub: "VLAN 10" },
        ph: {
          x: 300,
          y: 420,
          icon: "phone",
          label: S("IP-телефоны", "IP-telefonlar", "IP phones"),
          sub: "VLAN 20 · PoE",
        },
        cam: { x: 700, y: 420, icon: "camera", label: S("Камеры", "Kameralar", "Cameras"), sub: "VLAN 30" },
        wifi: { x: 890, y: 420, icon: "ap", label: S("Гостевой Wi-Fi", "Mehmon Wi-Fi", "Guest Wi-Fi"), sub: "VLAN 99" },
      },
      links: [
        ["inet", "fw", "fiber"],
        ["fw", "core", "cu"],
        ["core", "srv", "fiber", "10G"],
        ["core", "nas", "fiber"],
        ["core", "pcs", "cu"],
        ["core", "ph", "cu"],
        ["core", "cam", "cu"],
        ["core", "wifi", "cu"],
      ],
      steps: [
        {
          via: ["pcs", "core", "srv"],
          tag: "SMB",
          title: S("Файлы и 1С", "Fayllar va 1C", "Files and ERP"),
          text: S(
            "Сотрудники открывают файлы и 1С на сервере внутри офиса: трафик не уходит в интернет, скорость до 1–10 Гбит/с, доступ — по учётным записям Active Directory.",
            "Xodimlar ofis ichidagi serverda fayllar va 1C’ni ochadi: trafik internetga chiqmaydi, tezlik 1–10 Gbit/s gacha, kirish — Active Directory hisoblari orqali.",
            "Staff open files and the ERP on an in-office server: traffic never goes to the internet, speeds reach 1–10 Gbit/s, and access uses Active Directory accounts."
          ),
          log: ["smb: \\\\fs01\\docs · user anvar (AD)", "core: vlan10 → vlan50 · permit"],
        },
        {
          via: ["ph", "core", "srv"],
          tag: "SIP",
          title: S("Телефоны в своём VLAN", "Telefonlar o‘z VLAN’ida", "Phones in their own VLAN"),
          text: S(
            "Голос идёт с приоритетом QoS (DSCP EF): даже когда кто-то качает большие файлы, звонки не прерываются. Телефоны питаются по сетевому кабелю (PoE).",
            "Ovoz QoS ustuvorligi bilan boradi (DSCP EF): kimdir katta fayl yuklayotganda ham qo‘ng‘iroqlar uzilmaydi. Telefonlar tarmoq kabeli orqali quvvatlanadi (PoE).",
            "Voice gets QoS priority (DSCP EF): even when someone downloads big files, calls don't break up. The phones are powered over the network cable (PoE)."
          ),
          log: ["qos: vlan20 dscp ef → priority queue", "poe: port 7 · 6.5 W"],
        },
        {
          via: ["cam", "core", "nas"],
          tag: "RTSP",
          flow: "fwd",
          title: S("Видеонаблюдение", "Videokuzatuv", "CCTV"),
          text: S(
            "Камеры круглосуточно пишут поток на видеорегистратор. Их VLAN изолирован: ни из интернета, ни из гостевой сети к камерам не подключиться.",
            "Kameralar kecha-kunduz oqimni videoregistratorga yozadi. Ularning VLAN’i ajratilgan: internetdan ham, mehmon tarmog‘idan ham kameralarga ulanib bo‘lmaydi.",
            "Cameras record around the clock to the video recorder. Their VLAN is isolated, so neither the internet nor the guest network can reach them."
          ),
          log: ["nvr: 8 streams · h.265 · 32 Mbit/s", "acl: vlan30 → wan deny"],
        },
        {
          via: ["wifi", "core"],
          tag: "→ 10.50.0.10",
          block: true,
          title: S("Гости изолированы", "Mehmonlar ajratilgan", "Guests are isolated"),
          text: S(
            "Гость в Wi-Fi пытается достучаться до сервера — список доступа (ACL) на ядре сети отбрасывает пакет. Гости не видят ни компьютеры, ни принтеры, ни камеры.",
            "Wi-Fi’dagi mehmon serverga ulanmoqchi — tarmoq yadrosidagi kirish ro‘yxati (ACL) paketni tashlab yuboradi. Mehmonlar kompyuterlarni ham, printerlarni ham, kameralarni ham ko‘rmaydi.",
            "A guest on Wi-Fi tries to reach the server — the access list (ACL) on the core switch drops the packet. Guests see no PCs, printers or cameras."
          ),
          log: ["acl: vlan99 10.99.0.37 → 10.50.0.10:445 DENY"],
        },
        {
          via: ["wifi", "core", "fw", "inet"],
          tag: "HTTPS",
          title: S("А в интернет — можно", "Internetga esa — mumkin", "The internet is fine"),
          text: S(
            "Гостям открыт только выход в интернет, с ограничением скорости, чтобы они не мешали работе офиса.",
            "Mehmonlarga faqat internetga chiqish ochiq, ofis ishiga xalaqit bermasligi uchun tezlik cheklangan.",
            "Guests only get internet access, with a speed cap so they don't slow the office down."
          ),
          log: ["fw: vlan99 → wan · nat · 10 Mbit/s cap"],
        },
        {
          via: ["srv", "core", "nas", "core", "fw", "inet"],
          tag: "BACKUP",
          title: S("Бэкапы по правилу 3-2-1", "3-2-1 qoidasi bo‘yicha zaxira", "3-2-1 backups"),
          text: S(
            "Каждую ночь сервер копирует данные на NAS, а зашифрованная копия уходит в облако: 3 копии, 2 разных носителя, 1 — вне офиса. Даже вирус-шифровальщик не страшен.",
            "Har kecha server ma’lumotlarni NAS’ga nusxalaydi, shifrlangan nusxa esa bulutga ketadi: 3 nusxa, 2 xil tashuvchi, 1 tasi — ofisdan tashqarida. Hatto shifrlovchi virus ham qo‘rqinchli emas.",
            "Every night the server copies data to the NAS and an encrypted copy goes to the cloud: 3 copies, 2 media, 1 off-site. Even ransomware can't wipe you out."
          ),
          log: ["backup: fs01 → nas01 · 214 GB · 02:00", "backup: nas01 → cloud (aes-256) ok"],
        },
        {
          via: ["inet", "fw"],
          tag: "RDP 3389",
          block: true,
          title: S("Атака снаружи", "Tashqaridan hujum", "An outside attack"),
          text: S(
            "Сканер из интернета перебирает порты и стучится в RDP 3389. Межсетевой экран молча отбрасывает пакет и пишет попытку в журнал — сервер об этом даже не узнает.",
            "Internetdagi skaner portlarni tekshirib, RDP 3389 ga uriladi. Tarmoqlararo ekran paketni jimgina tashlab yuboradi va urinishni jurnalga yozadi — server buni hatto bilmaydi.",
            "An internet scanner sweeps ports and knocks on RDP 3389. The firewall silently drops the packet and logs the attempt — the server never even notices."
          ),
          log: ["fw: drop tcp 45.x.x.x → :3389", "ids: port scan detected · blocked 24h"],
        },
      ],
    },

    {
      id: "mail",
      name: S("Email", "Email", "Email"),
      title: S(
        "Путь письма: от «Отправить» до телефона",
        "Xat yo‘li: «Yuborish»dan telefongacha",
        "An email's path: from “Send” to the phone"
      ),
      nodes: {
        a: { x: 75, y: 250, icon: "laptop", label: S("Отправитель", "Jo‘natuvchi", "Sender"), sub: "anvar@site.uz" },
        smtp: {
          x: 225,
          y: 250,
          icon: UNIT("SMTP"),
          label: S("Свой сервер", "O‘z serveri", "Own server"),
          sub: "smtp · 587",
        },
        dns: { x: 380, y: 90, icon: UNIT("DNS"), label: "DNS", sub: "MX ?" },
        mx: { x: 530, y: 250, icon: UNIT("MX"), label: "MX", sub: "mail.uz · 25" },
        spam: {
          x: 680,
          y: 250,
          icon: "firewall",
          label: S("Антиспам", "Antispam", "Anti-spam"),
          sub: "SPF · DKIM · DMARC",
        },
        mbox: { x: 820, y: 250, icon: "db", label: S("Почтовый ящик", "Pochta qutisi", "Mailbox"), sub: "IMAP · 993" },
        b: { x: 940, y: 250, icon: "mobile", label: S("Получатель", "Oluvchi", "Recipient"), sub: "client@mail.uz" },
      },
      links: [
        ["a", "smtp", "cu", "TLS"],
        ["smtp", "dns", "fiber"],
        ["smtp", "mx", "fiber", S("интернет", "internet", "internet")],
        ["mx", "spam", "cu"],
        ["spam", "mbox", "cu"],
        ["mbox", "b", "air", "push"],
      ],
      steps: [
        {
          via: ["a", "smtp"],
          tag: "SMTP AUTH",
          title: S("Отправка", "Yuborish", "Sending"),
          text: S(
            "Почтовая программа отправляет письмо на свой сервер по SMTP (порт 587) — с логином, паролем и шифрованием TLS.",
            "Pochta dasturi xatni o‘z serveriga SMTP orqali (587-port) yuboradi — login, parol va TLS shifrlash bilan.",
            "The mail app hands the message to its own server over SMTP (port 587) — with a login, password and TLS encryption."
          ),
          log: ["→ EHLO laptop", "→ AUTH PLAIN ****", "← 235 Authentication successful"],
        },
        {
          via: ["smtp", "dns", "smtp"],
          tag: "MX ?",
          back: "mx1.mail.uz",
          title: S("Куда доставлять?", "Qayerga yetkazish?", "Where to deliver?"),
          text: S(
            "Сервер спрашивает DNS: какой сервер принимает почту для домена mail.uz? Ответ — MX-запись с адресом почтового сервера получателя.",
            "Server DNS’dan so‘raydi: mail.uz domeni uchun qaysi server pochta qabul qiladi? Javob — qabul qiluvchi pochta serveri ko‘rsatilgan MX-yozuv.",
            "The server asks DNS: which server accepts mail for mail.uz? The answer is an MX record pointing to the recipient's mail server."
          ),
          log: ["dns: mail.uz MX? → 10 mx1.mail.uz"],
        },
        {
          via: ["smtp", "mx"],
          tag: "SMTP + DKIM",
          title: S("Передача между серверами", "Serverlar orasida uzatish", "Server to server"),
          text: S(
            "Письмо передаётся по SMTP (порт 25, STARTTLS) и подписано DKIM — цифровой подписью домена отправителя, которую нельзя подделать.",
            "Xat SMTP orqali (25-port, STARTTLS) uzatiladi va DKIM bilan imzolangan — jo‘natuvchi domenining soxtalashtirib bo‘lmaydigan raqamli imzosi.",
            "The message travels over SMTP (port 25, STARTTLS) signed with DKIM — the sender domain's digital signature that can't be forged."
          ),
          log: ["→ MAIL FROM:<anvar@site.uz>", "→ RCPT TO:<client@mail.uz>", "← 250 2.0.0 OK queued"],
        },
        {
          via: ["mx", "spam"],
          tag: "CHECK",
          title: S("Проверка", "Tekshiruv", "Checks"),
          text: S(
            "SPF — разрешено ли этому серверу слать почту домена; DKIM — не изменено ли письмо; DMARC — что делать при провале. Плюс антивирус и оценка спама.",
            "SPF — bu serverga domen pochtasini yuborishga ruxsat bormi; DKIM — xat o‘zgartirilmaganmi; DMARC — muvaffaqiyatsizlikda nima qilish kerak. Yana antivirus va spam bahosi.",
            "SPF: is this server allowed to send for the domain? DKIM: was the message altered? DMARC: what to do if checks fail. Plus antivirus and a spam score."
          ),
          hdr: [
            ["SPF", "pass"],
            ["DKIM", "pass (site.uz)"],
            ["DMARC", "pass"],
            ["SPAM", "0.4 / 5"],
          ],
          log: ["spf=pass dkim=pass dmarc=pass", "rspamd: score 0.4 → inbox"],
        },
        {
          via: ["spam", "mbox"],
          tag: "INBOX",
          title: S("Доставка", "Yetkazish", "Delivery"),
          text: S(
            "Письмо сохраняется в почтовом ящике получателя. Если проверки провалены, оно попадёт в «Спам» или будет отклонено.",
            "Xat qabul qiluvchining pochta qutisiga saqlanadi. Tekshiruvlardan o‘tmasa, «Spam»ga tushadi yoki rad etiladi.",
            "The message lands in the recipient's mailbox. If the checks fail, it goes to Spam or is rejected."
          ),
          log: ["lmtp: delivered to client@mail.uz/INBOX"],
        },
        {
          via: ["mbox", "b"],
          tag: "IMAP",
          title: S("Чтение", "O‘qish", "Reading"),
          text: S(
            "Телефон получает push-уведомление и забирает письмо по IMAP (порт 993, TLS) — оно сразу появляется на всех устройствах. Весь путь — секунды.",
            "Telefon push-bildirishnoma oladi va xatni IMAP orqali (993-port, TLS) yuklab oladi — u darhol barcha qurilmalarda paydo bo‘ladi. Butun yo‘l — soniyalar.",
            "The phone gets a push notification and fetches the message over IMAP (port 993, TLS) — it shows up on every device at once. The whole trip takes seconds."
          ),
          log: ["imap: IDLE → * 1 EXISTS", "push: new mail from anvar@site.uz"],
        },
      ],
    },
  ];

  const UI = {
    step: S("шаг", "qadam", "step"),
    play: S("пуск", "boshlash", "play"),
    pause: S("пауза", "pauza", "pause"),
    prev: S("назад", "orqaga", "back"),
    next: S("далее", "keyingi", "next"),
    speed: S("скорость", "tezlik", "speed"),
    log: S("журнал", "jurnal", "log"),
    packet: S("заголовки пакета", "paket sarlavhalari", "packet headers"),
    swipe: S("листайте схему ⇆", "sxemani suring ⇆", "swipe the diagram ⇆"),
  };

  /* ---------- engine ---------- */

  const W = 1000;
  const SCRAMBLE = "▒░▓#%&@$*01";
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const sv = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (t) => 0.5 - Math.cos(Math.PI * clamp(t, 0, 1)) / 2;

  const state = {
    idx: 0,
    step: 0,
    t: 0,
    playing: !reduceMotion,
    speed: 1,
    raf: 0,
    last: 0,
    drawn: 0,
    visible: false,
    follow: 0,
    scroll: 0,
    holdFollow: 0,
    finish: false,
  };
  let ui = null;
  let view = null;
  let plan = null;

  function linkGeo(sc, link) {
    const a = sc.nodes[link[0]];
    const b = sc.nodes[link[1]];
    const bend = typeof link[4] === "number" ? link[4] : 0;
    let c = null;
    if (bend) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      c = { x: (a.x + b.x) / 2 + (-dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend };
    }
    return { a, b, c };
  }

  const at = (g, u, rev) => {
    const t = rev ? 1 - u : u;
    if (!g.c) return { x: g.a.x + (g.b.x - g.a.x) * t, y: g.a.y + (g.b.y - g.a.y) * t };
    const m = 1 - t;
    return {
      x: m * m * g.a.x + 2 * m * t * g.c.x + t * t * g.b.x,
      y: m * m * g.a.y + 2 * m * t * g.c.y + t * t * g.b.y,
    };
  };

  function geoLength(g) {
    if (!g.c) return Math.hypot(g.b.x - g.a.x, g.b.y - g.a.y);
    let len = 0;
    let p = at(g, 0);
    for (let i = 1; i <= 24; i++) {
      const q = at(g, i / 24);
      len += Math.hypot(q.x - p.x, q.y - p.y);
      p = q;
    }
    return len;
  }

  const pathD = (g, rev) => {
    const a = rev ? g.b : g.a;
    const b = rev ? g.a : g.b;
    return g.c ? `M${a.x} ${a.y}Q${g.c.x} ${g.c.y} ${b.x} ${b.y}` : `M${a.x} ${a.y}L${b.x} ${b.y}`;
  };

  function findLink(sc, u, v) {
    for (let i = 0; i < sc.links.length; i++) {
      const l = sc.links[i];
      if (l[0] === u && l[1] === v) return { i, rev: false };
      if (l[0] === v && l[1] === u) return { i, rev: true };
    }
    return null;
  }

  function buildPlan(sc, step) {
    const segs = [];
    let total = 0;
    for (let k = 0; k < step.via.length - 1; k++) {
      const f = findLink(sc, step.via[k], step.via[k + 1]);
      if (!f) continue;
      const g = linkGeo(sc, sc.links[f.i]);
      const len = geoLength(g);
      segs.push({ g, rev: f.rev, len, start: total, link: f.i });
      total += len;
    }
    const tunnelSet = new Set();
    if (sc.tunnel)
      for (let k = 0; k < sc.tunnel.length - 1; k++) {
        const f = findLink(sc, sc.tunnel[k], sc.tunnel[k + 1]);
        if (f) tunnelSet.add(f.i);
      }
    const move = clamp(total / 330, 0.9, 3.6);
    const flow = step.flow ? 3.6 : 0;
    const chars = (L(step.title) + L(step.text)).length;
    const read = Math.min(13, chars / 19);
    const after = step.block ? 1.2 : 0;
    return {
      segs,
      len: total,
      move,
      flow,
      after,
      total: Math.max(move + flow + after + 1.8, read),
      tunnelSet,
      passed: 0,
    };
  }

  function posAt(d) {
    const segs = plan.segs;
    if (!segs.length) return { x: 0, y: 0, seg: 0 };
    let i = 0;
    while (i < segs.length - 1 && d > segs[i].start + segs[i].len) i++;
    const s = segs[i];
    const u = s.len ? clamp((d - s.start) / s.len, 0, 1) : 1;
    const p = at(s.g, u, s.rev);
    p.seg = i;
    return p;
  }

  /* ---------- build DOM ---------- */

  function buildUI() {
    const tabs = el("div", "sch-tabs");
    tabs.setAttribute("role", "tablist");
    const title = el("h3", "sch-title");
    const stage = el("div", "sch-stage");
    const hint = el("p", "sch-hint");
    const count = el("p", "sch-count");
    const capTitle = el("h4", "sch-cap-title");
    const capText = el("p", "sch-cap-text");
    const dots = el("div", "sch-dots");
    const btn = (cls, text) => {
      const b = el("button", `sch-btn ${cls}`, text);
      b.type = "button";
      return b;
    };
    const prev = btn("sch-prev", "◀");
    const play = btn("sch-play", "");
    const next = btn("sch-next", "▶");
    const speed = btn("sch-speed", "1×");
    const ctrl = el("div", "sch-ctrl");
    ctrl.append(prev, play, next, speed);
    const cap = el("div", "sch-cap");
    cap.append(count, capTitle, capText, dots, ctrl);
    const logTitle = el("p", "sch-side-title");
    const log = el("pre", "sch-log");
    const hdrTitle = el("p", "sch-side-title");
    const hdr = el("dl", "sch-hdr");
    const side = el("div", "sch-side");
    side.append(logTitle, log, hdrTitle, hdr);
    const foot = el("div", "sch-foot");
    foot.append(cap, side);
    const bar = el("div", "term-bar");
    bar.setAttribute("aria-hidden", "true");
    bar.append(el("span", null, "~/guests/schemes"), el("span", "live", "● live"));
    const head = el("div", "sch-head");
    head.append(title);
    box.replaceChildren(bar, tabs, head, stage, hint, foot);
    ui = {
      tabs,
      title,
      stage,
      hint,
      count,
      capTitle,
      capText,
      dots,
      prev,
      play,
      next,
      speed,
      logTitle,
      log,
      hdrTitle,
      hdr,
    };

    prev.addEventListener("click", () => go(state.step - 1, true));
    next.addEventListener("click", () => go(state.step + 1, true));
    play.addEventListener("click", () => {
      state.playing = !state.playing;
      state.finish = false;
      if (state.playing && plan && state.t >= plan.total) go(state.step + 1);
      labels();
      sync();
    });
    speed.addEventListener("click", () => {
      state.speed = state.speed === 1 ? 2 : 1;
      labels();
    });
    const hold = () => (state.holdFollow = performance.now() + 4000);
    ["pointerdown", "wheel", "touchstart"].forEach((e) => stage.addEventListener(e, hold, { passive: true }));
    box.addEventListener("keydown", (e) => {
      if (e.target.closest && e.target.closest(".sch-tabs")) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          pick((state.idx + (e.key === "ArrowRight" ? 1 : SCHEMES.length - 1)) % SCHEMES.length, true);
        }
        return;
      }
      if (e.key === "ArrowRight") go(state.step + 1, true);
      else if (e.key === "ArrowLeft") go(state.step - 1, true);
    });
    if (reduceMotion) play.hidden = speed.hidden = true;
    renderTabs();
    labels();
  }

  function renderTabs() {
    ui.tabs.textContent = "";
    SCHEMES.forEach((sc, i) => {
      const b = el("button", "sch-tab");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", String(i === state.idx));
      b.tabIndex = i === state.idx ? 0 : -1;
      b.append(el("span", "sch-tab-n", String(i + 1).padStart(2, "0")), document.createTextNode(L(sc.name)));
      b.classList.toggle("is-on", i === state.idx);
      b.addEventListener("click", () => pick(i, true));
      ui.tabs.append(b);
    });
  }

  function labels() {
    if (!ui) return;
    ui.play.textContent = state.playing ? `❚❚ ${L(UI.pause)}` : `▶ ${L(UI.play)}`;
    ui.play.setAttribute("aria-pressed", String(state.playing));
    ui.prev.setAttribute("aria-label", L(UI.prev));
    ui.next.setAttribute("aria-label", L(UI.next));
    ui.speed.textContent = `${state.speed}×`;
    ui.speed.setAttribute("aria-label", `${L(UI.speed)} ${state.speed}×`);
    ui.logTitle.textContent = L(UI.log);
    ui.hdrTitle.textContent = L(UI.packet);
    ui.hint.textContent = L(UI.swipe);
  }

  function pick(i, focus) {
    state.idx = i;
    state.step = 0;
    state.t = 0;
    state.scroll = 0;
    renderTabs();
    if (focus) ui.tabs.children[i].focus();
    renderScheme();
    ui.tabs.children[i].scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function renderScheme() {
    const sc = SCHEMES[state.idx];
    const H = sc.h || 480;
    ui.title.textContent = L(sc.title);
    const svg = sv("svg", {
      class: "sch-svg",
      viewBox: `0 0 ${W} ${H}`,
      role: "img",
      "aria-label": L(sc.title),
    });
    const defs = sv("defs", null, svg);
    const grad = (id, stops, radial) => {
      const g = sv(
        radial ? "radialGradient" : "linearGradient",
        radial ? { id } : { id, x1: 0, y1: 0, x2: 0, y2: 1 },
        defs
      );
      stops.forEach(([o, c, a]) => sv("stop", { offset: o, "stop-color": c, "stop-opacity": a }, g));
    };
    grad("sch-card", [
      [0, "#1d191f", 1],
      [1, "#0c0b0d", 1],
    ]);
    grad(
      "sch-halo",
      [
        [0, "#f2334a", 0.32],
        [1, "#f2334a", 0],
      ],
      true
    );
    grad(
      "sch-glow",
      [
        [0, "#ff5a6c", 0.75],
        [1, "#f2334a", 0],
      ],
      true
    );
    grad(
      "sch-glow-g",
      [
        [0, "#45d483", 0.7],
        [1, "#45d483", 0],
      ],
      true
    );
    const pat = sv("pattern", { id: "sch-grid", width: 25, height: 25, patternUnits: "userSpaceOnUse" }, defs);
    sv("path", { d: "M25 0H0V25", fill: "none", stroke: "rgba(255,255,255,0.035)", "stroke-width": 1 }, pat);
    sv("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#sch-grid)" }, svg);

    const gZones = sv("g", { class: "sch-zones" }, svg);
    (sc.zones || []).forEach((z, i) => {
      const g = sv("g", { class: "sch-zone", style: `--d:${i}` }, gZones);
      sv("rect", { x: z.x, y: z.y, width: z.w, height: z.h, rx: 16 }, g);
      sv("text", { x: z.x + 14, y: z.y + 20 }, g).textContent = L(z.label);
    });

    let tunnel = null;
    if (sc.tunnel) {
      let d = "";
      for (let k = 0; k < sc.tunnel.length - 1; k++) {
        const f = findLink(sc, sc.tunnel[k], sc.tunnel[k + 1]);
        if (!f) continue;
        const seg = pathD(linkGeo(sc, sc.links[f.i]), f.rev);
        d += k ? seg.replace(/^M[^QL]+/, "") : seg;
      }
      tunnel = sv("g", { class: "sch-tunnel" }, svg);
      sv("path", { d, class: "sch-tunnel-pipe" }, tunnel);
      sv("path", { d, class: "sch-tunnel-core" }, tunnel);
    }

    const gLinks = sv("g", { class: "sch-links" }, svg);
    const gLabels = sv("g", { class: "sch-llabels" }, svg);
    const links = sc.links.map((l, i) => {
      const g = linkGeo(sc, l);
      const len = Math.round(geoLength(g));
      const kind = l[2] || "cu";
      const path = sv("path", { d: pathD(g), class: `sch-link k-${kind}`, style: `--len:${len};--d:${i}` }, gLinks);
      const flow = sv("path", { d: pathD(g), class: "sch-flowline" }, gLinks);
      if (l[3]) {
        const mid = at(g, 0.5);
        const horiz = Math.abs(g.b.x - g.a.x) >= Math.abs(g.b.y - g.a.y);
        const below = g.c && g.c.y > mid.y;
        const t = sv(
          "text",
          horiz
            ? { x: mid.x, y: below ? mid.y + 20 : mid.y - 9, "text-anchor": "middle" }
            : { x: mid.x + 10, y: mid.y + 4, "text-anchor": "start" },
          gLabels
        );
        t.setAttribute("class", "sch-llabel");
        t.textContent = L(l[3]);
      }
      return { path, flow };
    });

    const gNodes = sv("g", { class: "sch-nodes" }, svg);
    const nodes = {};
    Object.keys(sc.nodes).forEach((id, i) => {
      const n = sc.nodes[id];
      const outer = sv("g", { class: "sch-node", transform: `translate(${n.x} ${n.y})` }, gNodes);
      const g = sv("g", { class: "sch-pop", style: `--d:${i}` }, outer);
      sv("circle", { r: 50, class: "sch-halo" }, g);
      sv("rect", { x: -34, y: -34, width: 68, height: 68, rx: 16, class: "sch-card" }, g);
      const ico = sv("g", { class: "sch-ico", transform: "translate(-20 -20)" }, g);
      const [icon, text] = String(n.icon).split(":");
      sv("path", { d: ICONS[icon] || ICONS.unit }, ico);
      if (text) {
        const t = sv("text", { x: 20, y: 23.6, class: "sch-ico-t" }, ico);
        t.textContent = text;
      }
      sv("text", { y: 54, class: "sch-lbl" }, g).textContent = L(n.label);
      if (n.sub) sv("text", { y: 69, class: "sch-sub" }, g).textContent = L(n.sub);
      nodes[id] = { outer, x: n.x, y: n.y };
    });

    const gFx = sv("g", { class: "sch-fx" }, svg);
    const pulses = [];
    const dots = [];
    for (let i = 0; i < 24; i++) dots.push(sv("circle", { r: 3.2, class: "sch-dot", opacity: 0 }, gFx));
    const trail = [];
    for (let i = 0; i < 5; i++) trail.push(sv("circle", { r: 4 - i * 0.6, class: "sch-trail", opacity: 0 }, gFx));
    const pkt = sv("g", { class: "sch-pkt", opacity: 0 }, gFx);
    const glow = sv("circle", { r: 26, class: "sch-pkt-glow" }, pkt);
    const pill = sv("rect", { y: -11, height: 22, rx: 11, class: "sch-pkt-pill" }, pkt);
    const ptext = sv("text", { y: 4, class: "sch-pkt-t" }, pkt);

    ui.stage.replaceChildren(svg);
    ui.stage.classList.remove("is-swap");
    void ui.stage.offsetWidth;
    ui.stage.classList.add("is-swap");
    view = {
      sc,
      svg,
      nodes,
      links,
      tunnel,
      pulses,
      dots,
      trail,
      pkt,
      glow,
      pill,
      ptext,
      gFx,
      H,
      tag: "",
      scrambleAt: 0,
    };
    measure();
    renderDots();
    startStep(true);
  }

  function measure() {
    if (!view) return;
    const w = view.svg.getBoundingClientRect().width || ui.stage.clientWidth || W;
    view.scale = w / W;
    view.stageW = ui.stage.clientWidth;
    view.maxScroll = Math.max(0, ui.stage.scrollWidth - view.stageW);
    view.scrollable = view.maxScroll > 4;
    ui.hint.hidden = !view.scrollable;
  }

  function renderDots() {
    const sc = SCHEMES[state.idx];
    ui.dots.textContent = "";
    sc.steps.forEach((st, i) => {
      const b = el("button", "sch-dot-btn");
      b.type = "button";
      b.setAttribute("aria-label", `${L(UI.step)} ${i + 1}: ${L(st.title)}`);
      b.addEventListener("click", () => go(i, true));
      ui.dots.append(b);
    });
  }

  function go(i, manual) {
    const n = SCHEMES[state.idx].steps.length;
    state.step = (i + n) % n;
    state.t = 0;
    startStep(manual);
  }

  function startStep(manual) {
    const sc = SCHEMES[state.idx];
    const step = sc.steps[state.step];
    plan = buildPlan(sc, step);
    const on = new Set(step.via);
    Object.keys(view.nodes).forEach((id) => {
      const n = view.nodes[id].outer;
      n.classList.toggle("is-on", on.has(id));
      n.classList.toggle("is-dim", !on.has(id));
      n.classList.remove("is-alarm", "is-hit");
    });
    const used = new Set(plan.segs.map((s) => s.link));
    view.links.forEach((l, i) => {
      l.path.classList.toggle("is-on", used.has(i));
      l.flow.classList.toggle("is-on", used.has(i));
    });
    if (view.tunnel) view.tunnel.classList.toggle("is-on", Boolean(step.tunnel));
    view.pulses.forEach((p) => p.el.remove());
    view.pulses.length = 0;

    ui.count.textContent = `${L(UI.step)} ${state.step + 1} / ${sc.steps.length}`;
    ui.capTitle.textContent = L(step.title);
    ui.capText.textContent = L(step.text);
    ui.capTitle.classList.remove("is-in");
    ui.capText.classList.remove("is-in");
    void ui.capText.offsetWidth;
    ui.capTitle.classList.add("is-in");
    ui.capText.classList.add("is-in");
    [...ui.dots.children].forEach((d, i) => {
      d.classList.toggle("is-on", i === state.step);
      d.classList.toggle("is-done", i < state.step);
    });

    const lines = [];
    sc.steps
      .slice(0, state.step + 1)
      .forEach((st, i) => (st.log || []).forEach((line) => lines.push([line, i === state.step])));
    ui.log.textContent = "";
    lines.slice(-8).forEach(([line, fresh], i) => {
      const row = el("span", `sch-log-line${fresh ? " is-new" : ""}`, line);
      row.style.setProperty("--i", i);
      ui.log.append(row);
    });

    let prevHdr = null;
    for (let i = state.step - 1; i >= 0 && !prevHdr; i--) prevHdr = sc.steps[i].hdr || null;
    const hdr = step.hdr;
    ui.hdr.textContent = "";
    ui.hdrTitle.hidden = !hdr;
    ui.hdr.hidden = !hdr;
    if (hdr) {
      const old = new Map(prevHdr || []);
      hdr.forEach(([k, v]) => ui.hdr.append(el("dt", null, k), el("dd", old.get(k) !== v ? "is-new" : null, v)));
    }

    state.finish = Boolean(manual) && !state.playing;
    if (reduceMotion) state.t = plan.move + plan.after;
    draw(performance.now());
  }

  function tagFor(step, seg, p) {
    if (step.seq) return step.seq[Math.min(step.seq.length - 1, Math.floor(p * step.seq.length))];
    if (step.tags) return step.tags[Math.min(step.tags.length - 1, seg)];
    if (step.back && seg >= Math.ceil(plan.segs.length / 2)) return step.back;
    return step.tag || "";
  }

  function pulse(id, kind) {
    const n = view.nodes[id];
    if (!n || lite() || reduceMotion) return;
    const c = sv("circle", { cx: n.x, cy: n.y, r: 36, class: `sch-pulse${kind ? ` is-${kind}` : ""}` }, view.gFx);
    view.svg.insertBefore(c, view.gFx);
    view.pulses.push({ el: c, t0: performance.now() });
  }

  function setTag(text, crypt, now) {
    let shown = text;
    if (crypt) {
      if (now - view.scrambleAt > 70 || view.tag.length !== text.length) {
        view.scrambleAt = now;
        shown = text.replace(/[^\s]/g, () => SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0]);
      } else shown = view.tag;
    }
    if (shown !== view.tag) {
      view.tag = shown;
      view.ptext.textContent = shown;
      const w = Math.max(30, shown.length * 6.7 + 18);
      view.pill.setAttribute("x", -w / 2);
      view.pill.setAttribute("width", w);
    }
  }

  function draw(now) {
    if (!view || !plan) return;
    const step = view.sc.steps[state.step];
    const t = state.t;
    const p = plan.move ? clamp(t / plan.move, 0, 1) : 1;
    const d = ease(p) * plan.len;
    const pos = posAt(d);
    const arrived = t >= plan.move;

    // nodes passed → pulse
    const nodeIdx = arrived ? plan.segs.length : pos.seg;
    while (plan.passed <= nodeIdx && plan.passed <= plan.segs.length) {
      const id = step.via[plan.passed];
      if (plan.passed > 0 || t < 0.05) {
        pulse(id, step.block && plan.passed === plan.segs.length ? "block" : "");
        view.nodes[id] && view.nodes[id].outer.classList.add("is-hit");
      }
      plan.passed++;
    }

    // packet
    const blockT = step.block && arrived ? clamp((t - plan.move) / plan.after, 0, 1) : 0;
    const flowing = step.flow && arrived && t < plan.move + plan.flow;
    let alpha = t < 0.15 ? t / 0.15 : 1;
    if (step.block && arrived) alpha = 1 - blockT;
    else if (flowing) alpha = 0.35;
    else if (arrived && t > plan.move + plan.flow + 0.9)
      alpha = Math.max(0, 1 - (t - plan.move - plan.flow - 0.9) / 0.5);
    const seg = plan.segs[pos.seg];
    const inTunnel = seg && plan.tunnelSet.has(seg.link) && step.tunnel;
    const crypt = step.crypt === true || (step.crypt === "tunnel" && inTunnel);
    view.pkt.setAttribute("opacity", alpha.toFixed(3));
    view.pkt.setAttribute("transform", `translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)})`);
    view.pkt.classList.toggle("is-crypt", Boolean(crypt));
    view.pkt.classList.toggle("is-block", step.block && arrived);
    setTag(step.block && arrived ? "✕ DROP" : tagFor(step, pos.seg, p), crypt && !(step.block && arrived), now);
    if (step.block && arrived && !plan.blocked) {
      plan.blocked = true;
      const last = step.via[step.via.length - 1];
      if (view.nodes[last]) view.nodes[last].outer.classList.add("is-alarm");
    }
    if (arrived && step.alarm && !plan.alarmed) {
      plan.alarmed = true;
      step.alarm.forEach((id) => {
        if (!view.nodes[id]) return;
        view.nodes[id].outer.classList.add("is-alarm");
        view.nodes[id].outer.classList.remove("is-dim");
        pulse(id, "block");
      });
    }

    // trail
    view.trail.forEach((c, i) => {
      const show = !arrived && !lite() && t > 0.1 && d - (i + 1) * 13 > 0;
      if (!show) return c.setAttribute("opacity", 0);
      const q = posAt(d - (i + 1) * 13);
      c.setAttribute("cx", q.x.toFixed(1));
      c.setAttribute("cy", q.y.toFixed(1));
      c.setAttribute("opacity", (0.55 - i * 0.1).toFixed(2));
    });

    // flow dots
    const count = lite() ? 8 : 16;
    view.dots.forEach((c, i) => {
      if (!flowing || i >= count) return c.setAttribute("opacity", 0);
      const both = step.flow === "both";
      const back = both && i % 2 === 1;
      const k = both ? Math.floor(i / 2) : i;
      const per = both ? count / 2 : count;
      const ft = t - plan.move;
      const f = (((ft * 0.32 + k / per) % 1) + 1) % 1;
      const q = posAt((back ? 1 - f : f) * plan.len);
      const fade = Math.min(1, ft / 0.4, (plan.flow - ft) / 0.4);
      c.setAttribute("cx", q.x.toFixed(1));
      c.setAttribute("cy", q.y.toFixed(1));
      c.setAttribute("opacity", (0.9 * fade).toFixed(2));
      c.setAttribute("class", `sch-dot${back ? " is-back" : ""}`);
    });

    // pulses
    for (let i = view.pulses.length - 1; i >= 0; i--) {
      const pl = view.pulses[i];
      const k = (now - pl.t0) / 700;
      if (k >= 1) {
        pl.el.remove();
        view.pulses.splice(i, 1);
        continue;
      }
      pl.el.setAttribute("r", (36 + k * 30).toFixed(1));
      pl.el.setAttribute("opacity", (0.8 * (1 - k)).toFixed(2));
    }

    // follow the packet when the diagram is wider than the screen
    if (view.scrollable && now > state.holdFollow) {
      const target = clamp(pos.x * view.scale - view.stageW / 2, 0, view.maxScroll);
      state.scroll += (target - state.scroll) * (reduceMotion ? 1 : 0.08);
      if (Math.abs(ui.stage.scrollLeft - state.scroll) > 0.5) ui.stage.scrollLeft = state.scroll;
    } else if (view.scrollable) state.scroll = ui.stage.scrollLeft;
  }

  function frame(now) {
    state.raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (state.last || now)) / 1000);
    state.last = now;
    if (state.playing && plan) {
      state.t += dt * state.speed;
      if (state.t >= plan.total) {
        go(state.step + 1 >= SCHEMES[state.idx].steps.length ? 0 : state.step + 1);
        return;
      }
    } else if (plan && state.finish) {
      const end = plan.move + plan.after;
      state.t = Math.min(end, state.t + dt * state.speed);
      if (state.t >= end) state.finish = false;
    }
    if (lite() && now - state.drawn < 32) return;
    state.drawn = now;
    draw(now);
  }

  function sync() {
    const run = state.visible && !document.hidden && root.dataset.view === "guests" && !reduceMotion;
    if (run && !state.raf) {
      state.last = 0;
      state.raf = requestAnimationFrame(frame);
    } else if (!run && state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
  }

  let built = false;
  function start() {
    if (!built) {
      built = true;
      buildUI();
      renderScheme();
      if ("IntersectionObserver" in window)
        new IntersectionObserver((entries) => {
          state.visible = entries.some((e) => e.isIntersecting);
          sync();
        }).observe(box);
      else state.visible = true;
      if ("ResizeObserver" in window) new ResizeObserver(() => measure()).observe(box);
    }
    sync();
  }

  document.addEventListener("pagechange", (event) => (event.detail === "guests" ? start() : sync()));
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("perfchange", () => view && draw(performance.now()));
  document.addEventListener("langchange", () => {
    if (!built) return;
    renderTabs();
    labels();
    const keep = state.step;
    renderScheme();
    state.step = keep;
    state.t = 0;
    startStep(true);
  });
  if (root.dataset.view === "guests") start();
})();
