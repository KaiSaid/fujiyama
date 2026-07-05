import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Локальная разработка и Windows-сервер читают секреты из файла .env.
# На Docker/Amvera переменные приходят из окружения — dotenv их не переопределяет.
# Если python-dotenv не установлен (напр. минимальный контейнер) — просто пропускаем.
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR.parent / '.env')  # .env в корне репозитория
    load_dotenv(BASE_DIR / '.env')          # или в папке fujiyama_project
except ImportError:
    pass

# Секреты и окружение читаются из переменных окружения.
# Значения по умолчанию оставлены для локальной разработки;
# на сервере (Amvera) задайте DJANGO_SECRET_KEY, DJANGO_DEBUG=False и т.д.
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-)*(hlwspj#nlxw4&u3_j+$a^+2gl2rnno%t3v%)^r9&pa+holr',
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('1', 'true', 'yes')

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
    if h.strip()
]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Библиотеки
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Приложения проекта
    'apps.accounts',
    'apps.club_base',
    'apps.training',
    'apps.achievements',
    'apps.competitions',
    'apps.core',
    'apps.audit',
    'apps.dashboard_api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Всегда в самом верху
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Отдача статики без nginx (для Amvera)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'fujiyama_core.urls'

# Собранный фронтенд (npm run build). Если сборка есть, Django раздаёт
# SPA сам: index.html — через шаблон, ассеты — через whitenoise.
FRONTEND_DIST = BASE_DIR / 'fujiyama_frontend' / 'dist'
SERVE_SPA = (FRONTEND_DIST / 'index.html').exists()

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [FRONTEND_DIST] if SERVE_SPA else [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'fujiyama_core.wsgi.application'

# 1. Настройка базы данных.
# По умолчанию — PostgreSQL (локальная разработка и Docker/Amvera).
# На простом сервере можно задать в .env USE_SQLITE=True — тогда используется
# встроенный SQLite (файл db.sqlite3), не требующий отдельного сервера БД.
if os.environ.get('USE_SQLITE', 'False').lower() in ('1', 'true', 'yes'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('POSTGRES_DB', 'fujiyama_db'),
            'USER': os.environ.get('POSTGRES_USER', 'postgres'),
            'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'KaiSaid!178'),
            'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
            'PORT': os.environ.get('POSTGRES_PORT', '5432'),
        }
    }


# 3. Настройка REST Framework
# JWT-токены проверяются на каждом запросе; по умолчанию API закрыт
# для неавторизованных. Публичные эндпоинты помечаются AllowAny явно.
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    # Лимит для публичной формы «Записаться» — защита от спама по IP
    'DEFAULT_THROTTLE_RATES': {
        'trial_requests': '20/hour',
    },
}

# 4. Настройка JWT (Чтобы токен жил дольше)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # Токен живет 24 часа
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7), # Обновление раз в неделю
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# 5. Разрешаем CORS для React (dev-сервер Vite).
# Домен продакшена добавляется через переменную окружения CORS_EXTRA_ORIGINS
# (список через запятую), чтобы не менять код при смене хостинга.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
] + [
    o.strip()
    for o in os.environ.get('CORS_EXTRA_ORIGINS', '').split(',')
    if o.strip()
]
CORS_ALLOW_CREDENTIALS = True

# Валидация паролей
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Интернационализация
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
# Каталог, куда collectstatic собирает статику для отдачи в продакшене (whitenoise).
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Ассеты собранного фронтенда попадают в /static/ вместе с админской статикой
# (vite собирает пути с base '/static/').
STATICFILES_DIRS = [FRONTEND_DIST] if SERVE_SPA else []

# Домены, с которых разрешены POST-формы Django (нужно для админки за HTTPS),
# например: DJANGO_CSRF_TRUSTED_ORIGINS=https://fujiyama.amvera.io
CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.environ.get('DJANGO_CSRF_TRUSTED_ORIGINS', '').split(',')
    if o.strip()
]

# Хостинг (Amvera) снимает HTTPS на своём прокси и передаёт запрос по HTTP.
# По этому заголовку Django понимает, что исходное соединение было защищённым.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'