# ============================================================
#  Fujiyama — автоматическая настройка сайта на Windows-сервере.
#
#  Что делает: клонирует/обновляет проект, ставит зависимости,
#  создаёт .env (с секретным ключом и админом), поднимает базу
#  (SQLite), собирает статику, открывает порт 80 и запускает сайт.
#
#  ЗАПУСКАТЬ В PowerShell ОТ ИМЕНИ АДМИНИСТРАТОРА.
#  Перед запуском должны быть установлены Python 3.12 и Git.
# ============================================================

param(
    [string]$RepoUrl    = "https://github.com/KaiSaid/fujiyama.git",
    [string]$InstallDir = "C:\fujiyama"
)

# 0. Права администратора (нужны для порта 80 и брандмауэра)
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
    ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Запустите PowerShell от имени администратора и повторите." -ForegroundColor Red
    exit 1
}

function Test-Cmd($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

# 1. Проверка Python и Git
if (-not (Test-Cmd python)) {
    Write-Host "Не найден Python. Установите Python 3.12 с https://www.python.org/downloads/" -ForegroundColor Red
    Write-Host "(при установке отметьте галочку 'Add python.exe to PATH'), затем запустите скрипт снова." -ForegroundColor Red
    exit 1
}
if (-not (Test-Cmd git)) {
    Write-Host "Не найден Git. Установите с https://git-scm.com/download/win, затем запустите скрипт снова." -ForegroundColor Red
    exit 1
}

# 2. Клонирование или обновление репозитория
if (Test-Path $InstallDir) {
    Write-Host "Обновляю проект в $InstallDir ..." -ForegroundColor Cyan
    git -C $InstallDir pull
} else {
    Write-Host "Клонирую проект в $InstallDir ..." -ForegroundColor Cyan
    git clone $RepoUrl $InstallDir
}

Set-Location "$InstallDir\fujiyama_project"

# 3. Виртуальное окружение и зависимости
if (-not (Test-Path "venv")) {
    Write-Host "Создаю виртуальное окружение..." -ForegroundColor Cyan
    python -m venv venv
}
$py = ".\venv\Scripts\python.exe"
Write-Host "Устанавливаю зависимости..." -ForegroundColor Cyan
& $py -m pip install --upgrade pip --quiet
& $py -m pip install -r "..\requirements.txt" --quiet

# 4. Файл .env (создаётся один раз; при повторном запуске не трогаем)
$envFile = "$InstallDir\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "`nСоздаю файл .env..." -ForegroundColor Cyan
    $secret = & $py -c "import secrets;print(secrets.token_urlsafe(50))"
    try {
        $ip = (Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 10).Trim()
    } catch {
        $ip = "*"
    }
    $adminUser = Read-Host "Придумайте ЛОГИН администратора сайта"
    $adminPass = Read-Host "Придумайте ПАРОЛЬ администратора сайта"

    $lines = @(
        "DJANGO_SECRET_KEY=$secret",
        "DJANGO_DEBUG=False",
        "DJANGO_ALLOWED_HOSTS=$ip,localhost,127.0.0.1",
        "USE_SQLITE=True",
        "DJANGO_SUPERUSER_USERNAME=$adminUser",
        "DJANGO_SUPERUSER_PASSWORD=$adminPass",
        "DJANGO_SUPERUSER_EMAIL=admin@example.com"
    )
    # UTF-8 без BOM, иначе python-dotenv не прочитает первую строку
    [System.IO.File]::WriteAllLines($envFile, $lines, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host ".env создан. Публичный IP сервера: $ip" -ForegroundColor Green
} else {
    Write-Host ".env уже существует — оставляю без изменений." -ForegroundColor Yellow
    $ip = "вашего сервера"
}

# 5. База данных, администратор, статика
Write-Host "`nПрименяю миграции..." -ForegroundColor Cyan
& $py manage.py migrate --noinput
Write-Host "Создаю администратора (если ещё нет)..." -ForegroundColor Cyan
& $py manage.py createsuperuser --noinput 2>$null
Write-Host "Собираю статику..." -ForegroundColor Cyan
& $py manage.py collectstatic --noinput | Out-Null

# 6. Брандмауэр: открыть порт 80
if (-not (Get-NetFirewallRule -DisplayName "Fujiyama HTTP" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName "Fujiyama HTTP" -Direction Inbound `
        -Protocol TCP -LocalPort 80 -Action Allow | Out-Null
    Write-Host "Порт 80 открыт в брандмауэре." -ForegroundColor Green
}

# 7. Запуск сайта
Write-Host "`n=====================================================" -ForegroundColor Green
Write-Host " Настройка завершена. Запускаю сайт на порту 80..." -ForegroundColor Green
Write-Host " Сайт будет доступен по адресу:  http://$ip" -ForegroundColor Cyan
Write-Host " Открывшееся окно сервера не закрывайте." -ForegroundColor Yellow
Write-Host "=====================================================`n" -ForegroundColor Green

Start-Process -FilePath ".\venv\Scripts\waitress-serve.exe" `
    -ArgumentList "--listen=*:80", "fujiyama_core.wsgi:application"
