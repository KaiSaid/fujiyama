from django.http import JsonResponse
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Coach, Section
from .serializers import SectionSerializer


class SectionListView(generics.ListAPIView):
    """Публичное расписание для лендинга: секции → группы → занятия."""
    permission_classes = [AllowAny]
    serializer_class = SectionSerializer
    # prefetch/select_related убирают N+1: группы, расписания и тренеры
    # выбираются фиксированным числом запросов, а не по одному на группу.
    queryset = (
        Section.objects
        .prefetch_related('groups__schedules', 'groups__coach')
        .order_by('name')
    )


def api_coaches(request):
    """Публичный список тренеров для лендинга."""
    coaches = Coach.objects.all().values('id', 'first_name', 'last_name', 'bio', 'experience')
    return JsonResponse(list(coaches), safe=False)
