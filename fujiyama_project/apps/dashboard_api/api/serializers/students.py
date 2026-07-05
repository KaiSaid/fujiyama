from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.accounts.models import UserProfile

User = get_user_model()


class StudentDashboardSerializer(serializers.ModelSerializer):
    # Человекочитаемая дата регистрации
    joined_date = serializers.DateTimeField(source='date_joined', format="%d.%m.%Y", read_only=True)
    full_name = serializers.SerializerMethodField()
    # Квалификация (пояс/кю) хранится в связанном UserProfile
    rank = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'full_name', 'email', 'is_active', 'joined_date',
            'date_joined', 'rank',
        ]
        read_only_fields = ['date_joined']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def to_representation(self, instance):
        data = super().to_representation(instance)
        profile = getattr(instance, 'profile', None)
        data['rank'] = profile.belt if profile else ''
        return data

    def create(self, validated_data):
        rank = validated_data.pop('rank', '')
        user = User(**validated_data)
        # Пароль ученику назначает администратор отдельно (через админку
        # или сброс) — аккаунт создаётся без действующего пароля.
        user.set_unusable_password()
        user.save()
        self._save_rank(user, rank)
        return user

    def update(self, instance, validated_data):
        rank = validated_data.pop('rank', None)
        instance = super().update(instance, validated_data)
        if rank is not None:
            self._save_rank(instance, rank)
        return instance

    @staticmethod
    def _save_rank(user, rank):
        profile, _ = UserProfile.objects.update_or_create(
            user=user, defaults={'belt': rank},
        )
        # Обновляем связь, закешированную select_related('profile'),
        # иначе ответ API вернёт прежнее значение ранга.
        user.profile = profile
