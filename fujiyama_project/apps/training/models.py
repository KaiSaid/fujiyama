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