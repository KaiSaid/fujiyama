from .models import Achievement

def award_achievement(*, user, title, description="", date_received):
    """
    Сервис для официального вручения награды.
    Здесь можно добавить логику уведомления ученика по email.
    """
    achievement = Achievement.objects.create(
        user=user,
        title=title,
        description=description,
        date_received=date_received
    )
    return achievement