from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Section, TrainingGroup, Schedule, Enrollment, 
    Attendance, Achievement, CompetitionApplication
)

User = get_user_model()

class ScheduleSerializer(serializers.ModelSerializer):
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    class Meta:
        model = Schedule
        fields = ['id', 'day_display', 'start_time', 'end_time']

# 2. Затем группы (включаем в них расписание)
class GroupSerializer(serializers.ModelSerializer):
    # ВАЖНО: имя переменной 'schedules' должно совпадать с related_name в модели Schedule
    schedules = ScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingGroup
        fields = ['id', 'name', 'schedules']

# 3. В конце секции (включаем в них группы)
class SectionSerializer(serializers.ModelSerializer):
    # ВАЖНО: имя переменной 'groups' должно совпадать с related_name в модели TrainingGroup
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'name', 'groups']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'group', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

# --- СЕРИАЛИЗАТОРЫ ДЛЯ ПРОФИЛЯ ---

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['title', 'description', 'date_received']

class AttendanceSerializer(serializers.ModelSerializer):
    training_group_name = serializers.ReadOnlyField(source='training_group.name')
    class Meta:
        model = Attendance
        fields = ['date', 'is_present', 'training_group_name']

class CompetitionApplicationSerializer(serializers.ModelSerializer):
    competition_name = serializers.ReadOnlyField(source='competition.name')
    date = serializers.ReadOnlyField(source='competition.date')
    
    class Meta:
        model = CompetitionApplication
        fields = ['competition_name', 'date', 'category', 'status']

class FullUserProfileSerializer(serializers.ModelSerializer):
    # Добавляем default=[], чтобы фронтенд не падал, если данных нет
    achievements = AchievementSerializer(many=True, read_only=True, default=[])
    attendances = AttendanceSerializer(many=True, read_only=True, default=[])
    competition_apps = CompetitionApplicationSerializer(many=True, read_only=True, default=[])

    class Meta:
        model = User
        # ВАЖНО: Проверь, чтобы эти имена полей (phone, belt_level) 
        # в точности совпадали с тем, что ты писал в models.py в приложении users!
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 
            'role', 'phone', 'belt_level', 
            'achievements', 'attendances', 'competition_apps'
        ]
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'is_staff', 'belt_level', 'kyu', 'attendances']
        # Здесь обязательно должно быть 'is_staff'