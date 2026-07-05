from django.contrib.auth import get_user_model
from rest_framework import filters, viewsets

from apps.audit.models import ActivityLog
from apps.dashboard_api.api.serializers.students import StudentDashboardSerializer
from apps.dashboard_api.permissions import IsDashboardAdmin

User = get_user_model()


class StudentDashboardViewSet(viewsets.ModelViewSet):
    """Управление учениками через CRM. Доступно только администраторам."""
    queryset = (
        User.objects.filter(is_superuser=False)
        .select_related('profile')
        .order_by('-date_joined')
    )
    serializer_class = StudentDashboardSerializer
    permission_classes = [IsDashboardAdmin]

    # Поиск и сортировка
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['date_joined', 'username']

    def perform_destroy(self, instance):
        """Вместо удаления — деактивация + запись в лог."""
        ActivityLog.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name='Student',
            object_id=instance.id,
            details={'username': instance.username},
        )
        instance.is_active = False
        instance.save(update_fields=['is_active'])
