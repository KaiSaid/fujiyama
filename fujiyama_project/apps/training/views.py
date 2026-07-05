from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.club_base.models import TrainingGroup

from .serializers import TrialRequestCreateSerializer
from .services import register_for_group


class TrialRequestCreateView(generics.CreateAPIView):
    """Публичная заявка «Записаться» с лендинга: имя + телефон, без учётки.
    Троттлинг защищает открытый эндпоинт от спама."""
    permission_classes = [AllowAny]
    serializer_class = TrialRequestCreateSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'trial_requests'


class EnrollmentCreateView(APIView):
    """Запись авторизованного ученика в группу: POST {"group": <id>}."""

    def post(self, request):
        group_id = request.data.get('group')
        if not group_id:
            return Response(
                {'detail': 'Не указана группа (поле "group").'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        group = get_object_or_404(TrainingGroup, pk=group_id)
        try:
            enrollment = register_for_group(user=request.user, group=group)
        except ValidationError as exc:
            return Response(
                {'detail': ' '.join(exc.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {'id': enrollment.id, 'group': group.id, 'status': enrollment.status},
            status=status.HTTP_201_CREATED,
        )
