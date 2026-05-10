# Куда вставлять: users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Настраиваем отображение полей в админке
class CustomUserAdmin(UserAdmin):
    model = User
    # Добавляем наши новые поля в интерфейс редактирования
    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {'fields': ('role', 'phone', 'belt_level')}),
    )
    # Добавляем колонки в список всех пользователей
    list_display = ['username', 'email', 'role', 'belt_level', 'is_staff']

# Регистрируем модель с нашими настройками
admin.site.register(User, CustomUserAdmin)