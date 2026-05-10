from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Кастомная модель пользователя.
    Наследуется от стандартной модели, расширяя ее полями для клуба.
    """
    ROLE_CHOICES = (
        ('guest', 'Гость'),
        ('student', 'Ученик'),
        ('coach', 'Тренер'),
        ('admin', 'Администратор'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guest', verbose_name='Роль')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Телефон')
    belt_level = models.CharField(max_length=50, blank=True, null=True, verbose_name='Уровень пояса')

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"