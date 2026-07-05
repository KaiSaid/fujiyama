from rest_framework import permissions

class IsDashboardAdmin(permissions.BasePermission):
    """Доступ только для суперпользователей (Администраторов)"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

class IsInstructor(permissions.BasePermission):
    """Доступ для тренеров (Инструкторов)"""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.groups.filter(name='Instructors').exists() or 
            request.user.is_superuser
        )