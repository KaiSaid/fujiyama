from django.utils import timezone
from rest_framework import serializers

from .models import Competition


class CompetitionDashboardSerializer(serializers.ModelSerializer):
    """Турнир в CRM: с числом заявок и признаком «предстоящий»."""
    date_display = serializers.DateField(source='date', format='%d.%m.%Y', read_only=True)
    applications_count = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()

    class Meta:
        model = Competition
        fields = [
            'id', 'name', 'date', 'date_display', 'location',
            'applications_count', 'is_upcoming',
        ]

    def get_applications_count(self, obj):
        # В списке значение приходит из annotate(), для одиночного
        # объекта (после create/update) считаем отдельным запросом.
        count = getattr(obj, 'applications_count', None)
        return count if count is not None else obj.competitionapplication_set.count()

    def get_is_upcoming(self, obj):
        return obj.date >= timezone.localdate()

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError('Укажите название турнира.')
        return value
