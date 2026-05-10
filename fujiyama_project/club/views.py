from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

# Импортируем модели
from .models import (
    Section, TrainingGroup, Schedule, Enrollment, 
    UserProfile, Attendance, Achievement, Competition, CompetitionApplication
)

# Импортируем сериализаторы
from .serializers import (
    SectionSerializer, GroupSerializer, ScheduleSerializer, EnrollmentSerializer,
    FullUserProfileSerializer
)

User = get_user_model()

# 1. Личный кабинет (получение всех данных пользователя)
class UserProfileDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # request.user — это текущий авторизованный пользователь
        serializer = FullUserProfileSerializer(request.user)
        return Response(serializer.data)

# 2. ViewSet для секций
class SectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        section = self.get_object()
        return Response(
            {'status': 'Успешно!', 'message': f'Вы записаны на направление: {section.name}'}, 
            status=status.HTTP_200_OK
        )

# 3. ViewSet для заявок в группы
class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        # Автоматически привязываем заявку к текущему юзеру
        serializer.save(user=self.request.user)