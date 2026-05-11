from django.contrib import admin
from .models import Enrollment, Attendance

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'status', 'created_at')
    list_filter = ('status',)

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'training_group', 'date', 'is_present')
    list_filter = ('date', 'is_present')