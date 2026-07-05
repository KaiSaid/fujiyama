@echo off
chcp 65001 >nul
REM ============================================================
REM  Fujiyama — запуск сайта на Windows-сервере по HTTP.
REM  Фаза 1: сайт доступен по адресу http://IP-сервера
REM  (без домена и HTTPS). Запускать из папки deploy\windows.
REM ============================================================
cd /d "%~dp0..\..\fujiyama_project"

call venv\Scripts\activate.bat

echo [1/3] Применяю миграции базы данных...
python manage.py migrate --noinput

echo [2/3] Собираю статику...
python manage.py collectstatic --noinput

echo [3/3] Запускаю сервер на порту 80...
echo.
echo Готово. Откройте в браузере:  http://IP-вашего-сервера
echo Это окно закрывать нельзя. Остановить сервер — Ctrl+C.
echo.
waitress-serve --listen=*:80 fujiyama_core.wsgi:application
