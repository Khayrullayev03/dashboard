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
    voip.js       схема IP-телефонии
    info.js       карта мира и данные посетителя
    netwatch.js   «Инфо»: живая карта атак Kaspersky, сводка атак SANS ISC, пинг до серверов
    geo.js        определение IP
    background.js фон
    fx.js         эффекты логотипа и текста
    sound.js      звуки
    visualizer.js аудиовизуализатор: эквалайзер в шапке, луна и логотип в такт (микрофон или свой трек)
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

## Деплой

GitHub Pages. Пуш в `main` автоматически публикуется через `.github/workflows/publish.yml`.

## Форматирование

```bash
npm install
npm run format
```
