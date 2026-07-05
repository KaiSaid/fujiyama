from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.views import ProfileDataView
from apps.club_base.views import SectionListView, api_coaches
from apps.training.views import EnrollmentCreateView, TrialRequestCreateView

urlpatterns = [
    # Служебная админка Django.
    # Живёт на /django-admin/, потому что /admin/... занят CRM-панелью (React).
    path('django-admin/', admin.site.urls),

    # Аутентификация по JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Публичная часть сайта (лендинг)
    path('api/sections/', SectionListView.as_view(), name='api_sections'),
    path('api/coaches/', api_coaches, name='api_coaches'),
    path('api/trial-requests/', TrialRequestCreateView.as_view(), name='api_trial_requests'),

    # Личный кабинет ученика
    path('api/profile-data/', ProfileDataView.as_view(), name='api_profile_data'),
    path('api/enrollments/', EnrollmentCreateView.as_view(), name='api_enrollments'),

    # CRM-панель (управление учениками и заявками)
    path('api/dashboard/', include('apps.dashboard_api.urls')),
]

# Если фронтенд собран (npm run build), Django отдаёт SPA на всех остальных
# адресах: /, /login, /profile, /admin/... — маршрутизацию делает React.
if settings.SERVE_SPA:
    urlpatterns += [
        re_path(
            r'^(?!api/|django-admin/|static/|media/).*$',
            TemplateView.as_view(template_name='index.html'),
            name='spa',
        ),
    ]
