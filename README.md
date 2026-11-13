# ДекорЗавод — сайт

Статический сайт (HTML + CSS + JS), без сборки. Резиновая адаптивная вёрстка: 320px → 4K.

## Структура
- index.html — главная страница
- privacy.html — политика конфиденциальности (152-ФЗ)
- consent.html — согласие на обработку персональных данных (отдельный документ)
  Обе страницы открываются на главной во всплывающем окне и доступны по прямой ссылке.
- assets/css/styles.css — стили (в конце — адаптивный слой, кнопки, мессенджеры, модальное окно)
- assets/js/script.js — меню, карусель, FAQ, счётчики, маска телефона, форма, окно документов
- assets/img/ — фото и logo.svg
- favicon.svg, favicon-32.png, apple-touch-icon.png — иконки сайта
- vercel.json, robots.txt, sitemap.xml — хостинг и SEO

## Что заменить перед запуском
- Ссылки Telegram и MAX: атрибут href у элементов с data-messenger="telegram" / "max" (index.html, 2 места каждая)
- Телефон и e-mail (index.html, privacy.html, consent.html)
- Подключить отправку формы (Telegram-бот / почта / CRM) и Яндекс Метрику
