from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.dashboard_api.api.views.club import (
    GroupDashboardViewSet,
    ScheduleDashboardViewSet,
    SectionDashboardViewSet,
    StaffUsersView,
)
from apps.dashboard_api.api.views.competitions import CompetitionDashboardViewSet
from apps.dashboard_api.api.views.requests import TrialRequestDashboardViewSet
from apps.dashboard_api.api.views.stats import DashboardStatsView
from apps.dashboard_api.api.views.students import StudentDashboardViewSet

# Используем Router для автоматической генерации путей (GET, POST, PUT, DELETE)
router = DefaultRouter()
router.register(r'students', StudentDashboardViewSet, basename='dashboard-students')
router.register(r'requests', TrialRequestDashboardViewSet, basename='dashboard-requests')
router.register(r'competitions', CompetitionDashboardViewSet, basename='dashboard-competitions')
router.register(r'sections', SectionDashboardViewSet, basename='dashboard-sections')
router.register(r'groups', GroupDashboardViewSet, basename='dashboard-groups')
router.register(r'schedules', ScheduleDashboardViewSet, basename='dashboard-schedules')

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('staff/', StaffUsersView.as_view(), name='dashboard-staff'),
    path('', include(router.urls)),
]