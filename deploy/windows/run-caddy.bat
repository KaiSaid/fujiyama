@echo off
chcp 65001 >nul
REM ============================================================
REM  Fujiyama — HTTPS-прокси Caddy для Windows.
REM  Требует:
REM   1) caddy.exe в этой же папке (скачать с caddyserver.com/download,
REM      платформа windows/amd64);
REM   2) домен, чьи DNS A-записи указывают на IP сервера;
REM   3) запущенный бэкенд (run-app.bat).
REM  Caddy сам выпустит и будет продлевать HTTPS-сертификат.
REM ============================================================
cd /d "%~dp0"

REM --- ВПИШИТЕ СВОЙ ДОМЕН (без https://) ---
set DOMAIN=example.ru

caddy.exe run --config Caddyfile --adapter caddyfile
