from django.db import models
from django.conf import settings

class Achievement(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='achievements',
        verbose_name="Ученик"
    )
    title = models.CharField(max_length=200, verbose_name="Награда")
    description = models.TextField(blank=True, verbose_name="Описание")
    date_received = models.DateField(verbose_name="Дата получения")

    class Meta:
        verbose_name = "Достижение"
        verbose_name_plural = "Достижения"

    def __str__(self):
        return f"{self.title} ({self.user.username})"