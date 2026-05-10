from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Маршрут для получения токена (логин)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Маршрут для обновления токена
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]