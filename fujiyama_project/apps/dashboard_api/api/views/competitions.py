from django.db.models import Count
from rest_framework import viewsets

from apps.competitions.models import Competition
from apps.competitions.serializers import CompetitionDashboardSerializer
from apps.dashboard_api.permissions import IsDashboardAdmin


class CompetitionDashboardViewSet(viewsets.ModelViewSet):
    """Турниры в CRM: список, создание, изменение, удаление."""
    queryset = (
        Competition.objects
        .annotate(applications_count=Count('competitionapplication'))
        .order_by('-date')
    )
    serializer_class = CompetitionDashboardSerializer
    permission_classes = [IsDashboardAdmin]
