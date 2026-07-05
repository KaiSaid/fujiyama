import re

from rest_framework import serializers

from .models import TrialRequest

PHONE_RE = re.compile(r'^[\d\s+\-()]{6,20}$')


class TrialRequestCreateSerializer(serializers.ModelSerializer):
    """Публичная форма «Записаться»: имя, телефон, группа, комментарий."""

    class Meta:
        model = TrialRequest
        fields = ['id', 'name', 'phone', 'group', 'comment']

    def validate_phone(self, value):
        value = value.strip()
        if not PHONE_RE.match(value):
            raise serializers.ValidationError(
                'Укажите корректный номер телефона (цифры, пробелы и символы + - ( )).'
            )
        return value

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Укажите имя.')
        return value


class TrialRequestDashboardSerializer(serializers.ModelSerializer):
    """Заявка в CRM: с названием группы, читаемыми статусом и датой."""
    group_name = serializers.CharField(source='group.name', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created = serializers.DateTimeField(source='created_at', format='%d.%m.%Y %H:%M', read_only=True)

    class Meta:
        model = TrialRequest
        fields = [
            'id', 'name', 'phone', 'comment',
            'group', 'group_name', 'status', 'status_display', 'created',
        ]
        read_only_fields = ['name', 'phone', 'comment', 'group']
