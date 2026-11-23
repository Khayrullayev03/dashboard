# dashboard

Персональный сайт-портфолио: системный администратор, IT-инфраструктура, сети, СКС, телефония.

**https://khayrullayev03.github.io/dashboard/**

Чистый HTML, CSS и JavaScript без сборки и зависимостей. ASCII-графика, карточки в стиле Liquid Glass,
три языка (ru / uz / en).

## Запуск

Открыть `index.html` в браузере. Или локальный сервер:

```bash
npm start
```

## Структура

```
index.html
assets/
  css/style.css
  fonts/          JetBrains Mono (OFL)
  img/logo.png
  js/
    config.js     ключи Supabase для статистики и оценок
    data.js       контент: профиль, услуги, навыки, контакты
    i18n.js       тексты интерфейса
    main.js       страницы, навигация, рендер
    scenes.js     анимации услуг и навыков
    icons.js      анимированные иконки
    office.js     схема офиса и камеры
    voip.js       схема IP-телефонии (раздел «Телефония»)
    info.js       карта мира и данные посетителя
    netwatch.js   «Инфо»: живая карта атак Kaspersky, сводка атак SANS ISC
    ping.js       «Инфо»: живой пинг до приложений, почты, VPN и провайдеров, полный тест и отчёт
    sectools.js   «Инфо»: оценка соединения, свежие CVE и EPSS, проверка пароля и почты домена, отпечаток браузера, инструменты
    geo.js        определение IP
    background.js фон
    fx.js         эффекты логотипа и текста
    sound.js      звуки
    visualizer.js аудиовизуализатор: спектр 20 Гц – 16 кГц в шапке, глитч и вспышки на ударах
    soundtrack.js саундтрек сайта, синтезируется в браузере (Web Audio)
    stats.js      раздел «Кто заходил» и оценка сайта
    ascii-logo.js, worldmap.js   данные для ASCII-логотипа и карты
supabase/schema.sql   таблицы и функции для статистики и оценок
```

Контент меняется в `assets/js/data.js`, переводы интерфейса — в `assets/js/i18n.js`.

## Статистика и оценки

Раздел «Кто заходил» и блок оценки работают через [Supabase](https://supabase.com) (бесплатный тариф).
Пока ключи не заданы, раздел и оценка скрыты.

1. Создать проект в Supabase.
2. SQL Editor → вставить `supabase/schema.sql` → Run.
3. Project Settings → API: скопировать Project URL и публичный ключ (anon / publishable) в `assets/js/config.js`.

Хранится анонимно: источник перехода, город по часовому поясу, тип устройства, раздел. IP не сохраняется.
Ссылки с меткой источника: `https://khayrullayev03.github.io/dashboard/?from=telegram`.

## Производительность

На слабых устройствах (до 4 ГБ памяти, до 4 потоков или режим экономии трафика) сайт сам включает облегчённую
графику: без размытия стекла, с более редкой анимацией фона, а карта Kaspersky загружается по кнопке. Если во время
работы кадров меньше ~38 в секунду, облегчённый режим включается автоматически. Переключатель — внизу страницы.

## Поиск Google

В `index.html` есть разметка schema.org (Person и ProfessionalService), в корне — `sitemap.xml`.
Чтобы сайт быстрее попал в Google: [Search Console](https://search.google.com/search-console) → добавить ресурс
`https://khayrullayev03.github.io/dashboard/` → подтвердить мета-тегом → отправить `sitemap.xml`.

## Деплой

GitHub Pages. Пуш в `main` автоматически публикуется через `.github/workflows/publish.yml`.

## Форматирование

```bash
npm install
npm run format
```
