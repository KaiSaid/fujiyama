@echo off
chcp 65001 >nul
REM ============================================================
REM  Fujiyama — бэкенд для работы за прокси Caddy (HTTPS).
REM  Фаза 2: waitress слушает только localhost:8000,
REM  наружу сайт отдаёт Caddy (см. run-caddy.bat).
REM ============================================================
cd /d "%~dp0..\..\fujiyama_project"

call venv\Scripts\activate.bat

python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo Бэкенд запущен на 127.0.0.1:8000. Не закрывайте это окно.
waitress-serve --listen=127.0.0.1:8000 fujiyama_core.wsgi:application
