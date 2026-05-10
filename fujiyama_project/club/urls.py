from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SectionViewSet, EnrollmentViewSet, UserProfileDataView

# Создаем роутер для автоматических маршрутов API
router = DefaultRouter()
router.register(r'sections', SectionViewSet)
router.register(r'enrollments', EnrollmentViewSet)

urlpatterns = [
    # Маршрут для получения данных личного кабинета (пояс, достижения, посещаемость)
    path('profile-data/', UserProfileDataView.as_view(), name='profile-data'),
    
    # Подключаем автоматические маршруты роутера (sections и enrollments)
    path('', include(router.urls)),
]