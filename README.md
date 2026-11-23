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
    data.js       контент: профиль, услуги, навыки, контакты
    i18n.js       тексты интерфейса
    main.js       страницы, навигация, рендер
    scenes.js     анимации услуг и навыков
    icons.js      анимированные иконки
    office.js     схема офиса и камеры
    voip.js       схема IP-телефонии
    info.js       карта мира и данные посетителя
    geo.js        определение IP
    background.js фон
    fx.js         эффекты логотипа и текста
    sound.js      звуки
    ascii-logo.js, worldmap.js   данные для ASCII-логотипа и карты
```

Контент меняется в `assets/js/data.js`, переводы интерфейса — в `assets/js/i18n.js`.

## Деплой

GitHub Pages. Пуш в `main` автоматически публикуется через `.github/workflows/publish.yml`.

## Форматирование

```bash
npm install
npm run format
```
