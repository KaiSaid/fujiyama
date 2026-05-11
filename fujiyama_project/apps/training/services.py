from django.core.exceptions import ValidationError
from .models import Enrollment, Attendance

def register_for_group(*, user, group):
    """Сервис подачи заявки. Проверяет, нет ли уже активной заявки."""
    if Enrollment.objects.filter(user=user, group=group).exists():
        raise ValidationError("Вы уже подали заявку в эту группу.")
    return Enrollment.objects.create(user=user, group=group)

def mark_attendance(*, user, group, is_present=True):
    """Сервис отметки посещаемости. Не дает отметить дважды за один день."""
    from datetime import date
    if Attendance.objects.filter(user=user, training_group=group, date=date.today()).exists():
        raise ValidationError("Ученик уже отмечен сегодня в этой группе.")
    
    return Attendance.objects.create(user=user, training_group=group, is_present=is_present)