from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.club_base.models import Schedule, Section, TrainingGroup
from apps.club_base.serializers import (
    GroupDashboardSerializer,
    ScheduleDashboardSerializer,
    SectionDashboardSerializer,
)
from apps.dashboard_api.permissions import IsDashboardAdmin

User = get_user_model()


class SectionDashboardViewSet(viewsets.ModelViewSet):
    """Секции клуба: полное управление из CRM."""
    queryset = Section.objects.order_by('name')
    serializer_class = SectionDashboardSerializer
    permission_classes = [IsDashboardAdmin]


class GroupDashboardViewSet(viewsets.ModelViewSet):
    """Тренировочные группы: полное управление из CRM."""
    queryset = (
        TrainingGroup.objects
        .select_related('section', 'coach')
        .order_by('section__name', 'name')
    )
    serializer_class = GroupDashboardSerializer
    permission_classes = [IsDashboardAdmin]


class ScheduleDashboardViewSet(viewsets.ModelViewSet):
    """Занятия расписания: полное управление из CRM."""
    queryset = (
        Schedule.objects
        .select_related('group')
        .order_by('day_of_week', 'start_time')
    )
    serializer_class = ScheduleDashboardSerializer
    permission_classes = [IsDashboardAdmin]


class StaffUsersView(APIView):
    """Сотрудники (is_staff) — варианты для поля «Тренер» в форме группы."""
    permission_classes = [IsDashboardAdmin]

    def get(self, request):
        staff = User.objects.filter(is_staff=True, is_active=True).order_by('username')
        return Response([
            {'id': u.id, 'name': u.get_full_name() or u.username}
            for u in staff
        ])
