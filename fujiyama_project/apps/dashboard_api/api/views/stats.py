from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.club_base.models import Schedule, Section, TrainingGroup
from apps.competitions.models import Competition
from apps.dashboard_api.permissions import IsDashboardAdmin
from apps.training.models import Enrollment, TrialRequest

User = get_user_model()


class DashboardStatsView(APIView):
    """Сводные показатели для главной страницы CRM."""
    permission_classes = [IsDashboardAdmin]

    def get(self, request):
        today = timezone.localdate()
        return Response({
            'students': User.objects.filter(is_superuser=False, is_active=True).count(),
            'sections': Section.objects.count(),
            'groups': TrainingGroup.objects.count(),
            'schedules': Schedule.objects.count(),
            'pending_enrollments': Enrollment.objects.filter(status='pending').count(),
            'upcoming_competitions': Competition.objects.filter(date__gte=today).count(),
            'new_trial_requests': TrialRequest.objects.filter(status='new').count(),
        })
