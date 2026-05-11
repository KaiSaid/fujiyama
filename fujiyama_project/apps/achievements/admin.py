from django.contrib import admin
from .models import Achievement

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    # Скорее всего, поле называется просто 'date' или его нет
    list_display = ('title', 'user')