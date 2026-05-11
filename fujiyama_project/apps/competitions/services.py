from django.core.exceptions import ValidationError
from .models import CompetitionApplication

def submit_competition_app(*, user, competition, category):
    """
    Сервис подачи заявки на турнир. 
    Проверяет, не подавал ли уже ученик заявку на этот же турнир.
    """
    if CompetitionApplication.objects.filter(user=user, competition=competition).exists():
        raise ValidationError("Вы уже подали заявку на это соревнование.")
        
    return CompetitionApplication.objects.create(
        user=user, 
        competition=competition, 
        category=category
    )