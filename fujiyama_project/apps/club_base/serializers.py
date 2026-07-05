from rest_framework import serializers

from .models import Schedule, Section, TrainingGroup


class ScheduleSerializer(serializers.ModelSerializer):
    # Человекочитаемый день недели («Понедельник»), как ожидает лендинг
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Schedule
        fields = ['id', 'day_of_week', 'day_display', 'start_time', 'end_time']


class TrainingGroupSerializer(serializers.ModelSerializer):
    schedules = ScheduleSerializer(many=True, read_only=True)
    coach_name = serializers.SerializerMethodField()

    class Meta:
        model = TrainingGroup
        fields = ['id', 'name', 'coach_name', 'schedules']

    def get_coach_name(self, obj):
        if not obj.coach:
            return None
        return obj.coach.get_full_name() or obj.coach.username


class SectionSerializer(serializers.ModelSerializer):
    groups = TrainingGroupSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'name', 'description', 'groups']
