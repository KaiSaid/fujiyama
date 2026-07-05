FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Зависимости ставятся отдельным слоем — при правках кода кэш не сбрасывается
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Код бэкенда + собранный фронтенд (fujiyama_frontend/dist)
COPY fujiyama_project ./fujiyama_project

WORKDIR /app/fujiyama_project

EXPOSE 8000

# Миграции и статика выполняются на старте (база доступна только в рантайме).
# createsuperuser создаёт первого админа из переменных DJANGO_SUPERUSER_*
# и молча пропускается, если он уже существует.
CMD ["sh", "-c", "python manage.py migrate --noinput && (python manage.py createsuperuser --noinput || true) && python manage.py collectstatic --noinput && gunicorn fujiyama_core.wsgi:application --bind 0.0.0.0:8000 --workers 2"]
