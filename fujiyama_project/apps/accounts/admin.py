from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    # Эти колонки будут видны в списке всех профилей
    list_display = ('user', 'belt', 'kyu', 'next_exam_date')
    
    # Добавляем поиск по имени пользователя и фильтр по поясам
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    list_filter = ('belt', 'kyu')