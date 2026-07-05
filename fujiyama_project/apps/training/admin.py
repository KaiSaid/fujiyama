from django.contrib import admin
from .models import Attendance, Enrollment, TrialRequest


@admin.register(TrialRequest)
class TrialRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'group', 'status', 'created_at')
    list_filter = ('status', 'group')
    search_fields = ('name', 'phone')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'status', 'created_at')
    list_filter = ('status',)

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'training_group', 'date', 'is_present')
    list_filter = ('date', 'is_present')