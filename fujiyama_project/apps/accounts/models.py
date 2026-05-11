from django.db import models
from django.conf import settings

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='profile',
        verbose_name="Пользователь"
    )
    belt = models.CharField(max_length=50, default='Белый пояс', verbose_name="Пояс")
    kyu = models.IntegerField(default=10, verbose_name="Кю")
    next_exam_date = models.DateField(null=True, blank=True, verbose_name="Дата след. экзамена")

    class Meta:
        verbose_name = "Профиль ученика"
        verbose_name_plural = "Профили учеников"

    def __str__(self):
        return f"Профиль: {self.user.username}"