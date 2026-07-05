from django.contrib import admin
from .models import Coach, Schedule, Section, TrainingGroup

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(TrainingGroup)
class TrainingGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'section', 'coach')
    list_filter = ('section',)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('group', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week',)

@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'experience')