from django.contrib import admin
from .models import TrainingGroup, Schedule

@admin.register(TrainingGroup)
class TrainingGroupAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('day_of_week', 'start_time')