# Деплой `premiumdoors.cc` на VDS

Инструкция рассчитана на Ubuntu 22.04/24.04 и статический сайт из HTML, CSS и JavaScript.
Нужны: IP-адрес VDS, SSH-доступ с правами `sudo` и уже направленные DNS-записи домена.

## 1. Проверьте DNS

У регистратора создайте записи:

| Тип | Имя | Значение |
|---|---|---|
| A | `@` | публичный IPv4 вашего VDS |
| A | `www` | тот же IPv4 |

Проверка с компьютера:

```bash
nslookup premiumdoors.cc
nslookup www.premiumdoors.cc
```

Оба имени должны вернуть IP сервера. Обновление DNS может занять несколько часов.

## 2. Подключитесь к серверу и установите Nginx

Подставьте IP сервера вместо `SERVER_IP`:

```bash
ssh root@SERVER_IP
apt update && apt upgrade -y
apt install -y nginx rsync ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

Рекомендуется создать отдельного пользователя для работы:

```bash
adduser deploy
usermod -aG sudo deploy
```

После настройки SSH-ключа входите как `deploy`, а root-доступ по паролю отключите.

## 3. Создайте каталог сайта

```bash
mkdir -p /var/www/premiumdoors.cc
chown -R deploy:www-data /var/www/premiumdoors.cc
chmod -R 755 /var/www/premiumdoors.cc
```

## 4. Загрузите файлы сайта

Выполните на локальном компьютере из каталога проекта:

```powershell
scp index.html styles.css script.js config.js PRICING.md deploy@SERVER_IP:/var/www/premiumdoors.cc/
scp -r assets deploy@SERVER_IP:/var/www/premiumdoors.cc/
```

На сервере проверьте:

```bash
find /var/www/premiumdoors.cc -maxdepth 2 -type f
chown -R deploy:www-data /var/www/premiumdoors.cc
```

## 5. Настройте виртуальный хост Nginx

Создайте файл:

```bash
nano /etc/nginx/sites-available/premiumdoors.cc
```

Вставьте:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name premiumdoors.cc www.premiumdoors.cc;

    root /var/www/premiumdoors.cc;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(css|js|png|jpg|jpeg|svg|webp|ico)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        try_files $uri =404;
    }
}
```

Активируйте конфигурацию:

```bash
ln -s /etc/nginx/sites-available/premiumdoors.cc /etc/nginx/sites-enabled/premiumdoors.cc
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Откройте `http://premiumdoors.cc` и убедитесь, что сайт загружается.

## 6. Подключите HTTPS

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d premiumdoors.cc -d www.premiumdoors.cc
```

На вопрос о перенаправлении выберите вариант перенаправления HTTP на HTTPS. Проверьте автообновление сертификата:

```bash
systemctl status certbot.timer
certbot renew --dry-run
```

После этого рабочий адрес: `https://premiumdoors.cc`.

## 7. Настройте заявки

Сейчас `config.js` содержит пустые значения:

```js
window.SITE_CONFIG = {
  phone: '',
  leadEndpoint: ''
};
```

Статический сайт не сохраняет заявки самостоятельно. Нужен HTTPS-обработчик, который:

1. принимает JSON методом `POST`;
2. валидирует поля и согласие на обработку данных;
3. сохраняет заявку в CRM/БД или отправляет менеджеру;
4. возвращает `{"ok":true}` только после успешного сохранения.

После размещения обработчика укажите его адрес:

```js
window.SITE_CONFIG = {
  phone: '+7XXXXXXXXXX',
  leadEndpoint: 'https://premiumdoors.cc/api/leads'
};
```

Не храните токены Telegram, пароли и ключи API в `config.js` или `script.js`. Они должны быть только на сервере.

После изменения файла загрузите его заново:

```powershell
scp config.js deploy@SERVER_IP:/var/www/premiumdoors.cc/config.js
```

## 8. Проверка после деплоя

```bash
curl -I https://premiumdoors.cc
curl -I https://premiumdoors.cc/assets/slab-hero.png
nginx -t
tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

В браузере проверьте мобильную и десктопную версии, фильтры каталога, сортировку, калькулятор и отправку формы. В DevTools на вкладке Network запрос формы должен идти на `leadEndpoint` и возвращать JSON `{"ok":true}`.

## 9. Обновление сайта

Повторно загрузите изменённые файлы той же командой `scp`. Для очистки кэша можно добавить версию к подключению скрипта в `index.html`, например `script.js?v=2`, либо выполнить жёсткое обновление браузера.

Перед рекламным запуском заполните телефон, реквизиты оператора персональных данных, политику обработки данных и проверьте актуальность цен.
