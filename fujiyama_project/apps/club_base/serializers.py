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


# --- Плоские сериализаторы для CRM (создание/изменение из панели) ---

class SectionDashboardSerializer(serializers.ModelSerializer):
    groups_count = serializers.IntegerField(source='groups.count', read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'name', 'description', 'groups_count']

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Укажите название секции.')
        return value


class GroupDashboardSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source='section.name', read_only=True)
    coach_name = serializers.SerializerMethodField()

    class Meta:
        model = TrainingGroup
        fields = ['id', 'name', 'section', 'section_name', 'coach', 'coach_name']

    def get_coach_name(self, obj):
        if not obj.coach:
            return None
        return obj.coach.get_full_name() or obj.coach.username

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Укажите название группы.')
        return value


class ScheduleDashboardSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Schedule
        fields = [
            'id', 'group', 'group_name',
            'day_of_week', 'day_display', 'start_time', 'end_time',
        ]

    def validate(self, attrs):
        start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if start and end and end <= start:
            raise serializers.ValidationError(
                {'end_time': 'Время окончания должно быть позже времени начала.'}
            )
        return attrs
