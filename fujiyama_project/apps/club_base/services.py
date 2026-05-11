from django.core.exceptions import ValidationError
from .models import TrainingGroup, Schedule

def create_training_group(*, name, section, coach=None):
    """
    Сервис для создания группы. Здесь можно добавить проверки, 
    например, не перегружен ли тренер количеством групп.
    """
    if coach and TrainingGroup.objects.filter(coach=coach).count() >= 5:
        raise ValidationError("У этого тренера уже слишком много групп (макс. 5).")
        
    return TrainingGroup.objects.create(name=name, section=section, coach=coach)

def add_schedule_to_group(*, group, day_of_week, start_time, end_time):
    """
    Сервис добавления расписания с проверкой на накладки по времени.
    """
    # Здесь в будущем можно прописать логику проверки занятости зала
    return Schedule.objects.create(
        group=group, 
        day_of_week=day_of_week, 
        start_time=start_time, 
        end_time=end_time
    )