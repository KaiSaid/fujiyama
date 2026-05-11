from django.db import models
from django.conf import settings

class Competition(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название")
    date = models.DateField(verbose_name="Дата проведения")
    location = models.CharField(max_length=255, verbose_name="Место")

    class Meta:
        verbose_name = "Соревнование"
        verbose_name_plural = "Соревнования"

    def __str__(self):
        return self.name

class CompetitionApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'На рассмотрении'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='competition_apps',
        verbose_name="Ученик"
    )
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, verbose_name="Турнир")
    category = models.CharField(max_length=100, verbose_name="Категория")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending', 
        verbose_name="Статус"
    )

    class Meta:
        verbose_name = "Заявка на турнир"
        verbose_name_plural = "Заявки на турниры"