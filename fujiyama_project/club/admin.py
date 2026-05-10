from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Section, TrainingGroup, Schedule, Enrollment, 
    UserProfile, Attendance, Achievement, Competition, CompetitionApplication
)

User = get_user_model()

# --- НАСТРОЙКИ ВСТРОЕННЫХ ФОРМ (INLINES) ---

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Дополнительная информация профиля'

class AchievementInline(admin.TabularInline):
    model = Achievement
    extra = 1  # Количество пустых полей для новых записей

class AttendanceInline(admin.TabularInline):
    model = Attendance
    extra = 1

class EnrollmentInline(admin.TabularInline):
    model = Enrollment
    extra = 1

class CompetitionApplicationInline(admin.TabularInline):
    model = CompetitionApplication
    extra = 1

# --- ПЕРЕОПРЕДЕЛЕНИЕ АДМИНКИ ПОЛЬЗОВАТЕЛЯ ---

# Сначала снимем стандартную регистрацию пользователя, если она была
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    # Добавляем все наши инлайны в профиль пользователя
    inlines = (
        UserProfileInline, 
        AchievementInline, 
        AttendanceInline, 
        EnrollmentInline, 
        CompetitionApplicationInline
    )
    
    # Добавляем отображение роли и телефона в список пользователей
    list_display = BaseUserAdmin.list_display + ('role', 'phone')
    
    # Добавляем кастомные поля (роль, телефон) в саму форму редактирования
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительная информация (Системная)', {'fields': ('role', 'phone', 'belt_level')}),
    )

# --- ОСТАЛЬНЫЕ МОДЕЛИ (Оставляем для быстрого доступа) ---

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(TrainingGroup)
class TrainingGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'section', 'coach')

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('group', 'day_of_week', 'start_time')
    list_filter = ('day_of_week', 'group')

@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'location')