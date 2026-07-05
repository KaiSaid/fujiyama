# Fujiyama — сайт и CRM карате-клуба

Django 6 + DRF + SimpleJWT (бэкенд) и React 19 + Vite + Tailwind 4 (фронтенд).
В продакшене работает как один сервис: Django раздаёт и API, и собранный React-сайт.

## Структура

```
├── Dockerfile                  # образ бэкенда (Django + собранный фронтенд)
├── docker-compose.yml          # запуск на любом VPS: web + PostgreSQL + Caddy (HTTPS)
├── deploy/Caddyfile            # конфиг HTTPS-прокси
├── .env.example                # шаблон переменных окружения (скопировать в .env)
├── amvera.yml                  # альтернатива: деплой на Amvera (PaaS)
├── requirements.txt            # зависимости бэкенда
└── fujiyama_project/
    ├── manage.py
    ├── fujiyama_core/          # настройки, urls, wsgi
    ├── apps/
    │   ├── accounts/           # профиль ученика (пояс, кю)
    │   ├── club_base/          # секции, группы, расписание, тренеры
    │   ├── training/           # заявки с сайта, заявки в группы, посещаемость
    │   ├── achievements/       # достижения
    │   ├── competitions/       # соревнования и заявки
    │   ├── audit/              # журнал действий (ActivityLog)
    │   ├── core/               # базовая модель с soft-delete
    │   └── dashboard_api/      # DRF API для CRM-панели
    └── fujiyama_frontend/      # React SPA (лендинг + кабинет + CRM)
        └── dist/               # прод-сборка (коммитится — её раздаёт Django)
```

## Запуск для разработки

```bash
# Бэкенд (нужен PostgreSQL, параметры — env-переменные POSTGRES_*)
cd fujiyama_project
venv\Scripts\activate
python manage.py migrate
python manage.py runserver            # http://127.0.0.1:8000

# Фронтенд (в другом терминале)
cd fujiyama_project/fujiyama_frontend
npm install
npm run dev                           # http://127.0.0.1:5173
```

## Прод-режим локально

```bash
cd fujiyama_project/fujiyama_frontend && npm run build
# после сборки Django сам отдаёт сайт на http://127.0.0.1:8000
```

## Основные API

| Метод | URL | Доступ |
|---|---|---|
| POST | `/api/token/`, `/api/token/refresh/` | все |
| GET | `/api/sections/`, `/api/coaches/` | публично (лендинг) |
| POST | `/api/trial-requests/` | публично — форма «Записаться» (имя + телефон), лимит 20/час с IP |
| GET | `/api/profile-data/` | авторизованные |
| POST | `/api/enrollments/` | авторизованные |
| CRUD | `/api/dashboard/students/` | только администраторы |
| GET/PATCH/DELETE | `/api/dashboard/requests/` | только администраторы (заявки с сайта) |
| GET | `/api/dashboard/stats/` | только администраторы |

Служебная админка Django — на `/django-admin/` (путь `/admin/` занят CRM-панелью).

## Деплой на Windows-сервер (VPS с Windows, подключение по RDP)

Сервер на Windows (например, тариф LuxHost WINDOWS-*). Подключение — «Подключение
к удалённому рабочему столу» (mstsc) по IP, логину и паролю из панели хостинга.
Приложение обслуживает **waitress** (на Windows вместо gunicorn), статику и SPA —
whitenoise, база — SQLite (файл, отдельный сервер БД не нужен), секреты — файл `.env`.
Готовые скрипты лежат в `deploy/windows/`.

### Быстрый путь — один скрипт

1. Установить **Python 3.12** (python.org, галочка «Add python.exe to PATH») и
   **Git for Windows** (git-scm.com).
2. Открыть **PowerShell от имени администратора** и выполнить:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   irm https://raw.githubusercontent.com/KaiSaid/fujiyama/main/deploy/windows/setup.ps1 -OutFile $env:TEMP\fj-setup.ps1
   & $env:TEMP\fj-setup.ps1
   ```
   Скрипт склонирует проект в `C:\fujiyama`, поставит зависимости, спросит логин/пароль
   администратора сайта, создаст `.env` со случайным ключом, поднимет базу, откроет порт 80
   и запустит сайт. По завершении сайт доступен по `http://IP-сервера`.

Обновление после правок в коде: запустить `deploy\windows\setup.ps1` ещё раз
(он сделает `git pull`, миграции и статику; существующий `.env` не тронет).

### Ручной путь (если нужен контроль над шагами)

1. Установить **Python 3.12** (python.org, галочка «Add python.exe to PATH»).
2. Установить **PostgreSQL** (installer с enterprisedb.com), запомнить пароль
   пользователя `postgres`; через pgAdmin/psql создать базу `fujiyama_db`.
3. Установить **Git for Windows** и склонировать репозиторий:
   ```powershell
   git clone <адрес вашего репозитория> C:\fujiyama
   cd C:\fujiyama\fujiyama_project
   py -3.12 -m venv venv
   venv\Scripts\activate
   pip install -r ..\requirements.txt
   ```
4. Создать файл `C:\fujiyama\.env` (скопировать из `.env.example`) и заполнить:
   `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS=IP-сервера`,
   `POSTGRES_*`, `DJANGO_SUPERUSER_*`.
5. Создать администратора: `python manage.py createsuperuser`.
6. Открыть порт 80 в брандмауэре (PowerShell от администратора):
   ```powershell
   New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
   ```

**Запуск сайта (HTTP, доступ по IP):** двойной клик по `deploy\windows\run-http.bat`.
Сайт откроется по адресу `http://IP-вашего-сервера`. Окно не закрывать; чтобы сервер
жил после отключения — **отключайте** RDP-сессию (Disconnect), а не «Выход» (Log off).

**HTTPS + домен (когда появится домен):**
1. В DNS домена создать A-запись на IP сервера.
2. Скачать `caddy.exe` (caddyserver.com/download, windows/amd64) в `deploy\windows\`.
3. Открыть порт 443 (аналогично порту 80).
4. В `deploy\windows\run-caddy.bat` вписать свой домен в строку `set DOMAIN=`.
5. Запустить `run-app.bat` (бэкенд), затем `run-caddy.bat` (HTTPS-прокси).
   Caddy сам выпустит сертификат — сайт заработает по `https://ваш-домен`.

**Обновление после правок:** `git pull`, затем заново запустить `run-http.bat`
(миграции и статика подтянутся сами). Фронтенд перед этим пересобрать локально:
`cd fujiyama_project/fujiyama_frontend && npm run build` и закоммитить `dist`.

Чтобы сервер стартовал сам после перезагрузки — оформите `run-http.bat` как службу
через **NSSM** (`nssm install Fujiyama ...`) или Планировщик задач Windows.

## Деплой на Linux-VPS (Docker) — альтернатива

Нужен VPS с Ubuntu/Debian (от 1–2 ГБ RAM). Обычный shared-хостинг «для сайтов на PHP»
не подойдёт — Django нужен полноценный сервер или контейнеры.

```bash
# на сервере (один раз):
curl -fsSL https://get.docker.com | sh          # установить Docker
git clone <адрес вашего репозитория> fujiyama && cd fujiyama
cp .env.example .env && nano .env               # заполнить секреты и домен
docker compose up -d --build                    # собрать и запустить всё
```

Что произойдёт автоматически: поднимется PostgreSQL, применятся миграции,
создастся администратор (из `DJANGO_SUPERUSER_*`), соберётся статика,
Caddy выпустит HTTPS-сертификат для домена из `DOMAIN`.

Обновление сайта после правок: `git pull && docker compose up -d --build`.
Логи: `docker compose logs -f web`. Бэкап базы:
`docker compose exec db pg_dump -U fujiyama fujiyama_db > backup.sql`.

Перед деплоем не забудьте пересобрать фронтенд и закоммитить `dist`:
`cd fujiyama_project/fujiyama_frontend && npm run build`.

### Альтернатива: Amvera (PaaS, без администрирования сервера)

Файл `amvera.yml` уже настроен: создать в панели приложение (Python 3.12) и PostgreSQL,
задать переменные окружения (список в `amvera.yml`), `git push amvera master`.
