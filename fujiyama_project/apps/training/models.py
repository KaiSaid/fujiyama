from django.db import models
from django.conf import settings

class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает подтверждения'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    # ЗАМЕНЯЕМ club_base на fujiyama_club
    group = models.ForeignKey('fujiyama_club.TrainingGroup', on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Заявка в группу"
        verbose_name_plural = "Заявки в группы"
        unique_together = ('user', 'group')

class Attendance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendances')
    # ЗАМЕНЯЕМ club_base на fujiyama_club
    training_group = models.ForeignKey('fujiyama_club.TrainingGroup', on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    is_present = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Посещаемость"
        verbose_name_plural = "Посещаемость"


class TrialRequest(models.Model):
    """Заявка на запись с сайта — без учётной записи, только имя и телефон.
    Администратор перезванивает и договаривается о пробной тренировке."""
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('processed', 'Обработана'),
    ]
    name = models.CharField(max_length=100, verbose_name="Имя")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    # SET_NULL: при удалении группы контакт человека не теряется
    group = models.ForeignKey(
        'fujiyama_club.TrainingGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='trial_requests',
        verbose_name="Группа",
    )
    comment = models.TextField(blank=True, verbose_name="Комментарий")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='new', verbose_name="Статус",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создана")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Заявка на запись"
        verbose_name_plural = "Заявки на запись"

    def __str__(self):
        return f"{self.name} ({self.phone})"