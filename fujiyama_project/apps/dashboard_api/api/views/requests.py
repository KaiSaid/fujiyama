from rest_framework import viewsets

from apps.dashboard_api.permissions import IsDashboardAdmin
from apps.training.models import TrialRequest
from apps.training.serializers import TrialRequestDashboardSerializer


class TrialRequestDashboardViewSet(viewsets.ModelViewSet):
    """Заявки на запись в CRM: просмотр, отметка «обработана», удаление.
    Создаются заявки только через публичную форму сайта."""
    queryset = TrialRequest.objects.select_related('group').order_by('-created_at')
    serializer_class = TrialRequestDashboardSerializer
    permission_classes = [IsDashboardAdmin]
    # POST закрыт: заявки приходят только с сайта
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter in ('new', 'processed'):
            qs = qs.filter(status=status_filter)
        return qs
