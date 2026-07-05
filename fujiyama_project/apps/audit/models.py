from django.db import models
from django.conf import settings

class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('CREATE', 'Создание'),
        ('UPDATE', 'Обновление'),
        ('DELETE', 'Удаление'),
        ('LOGIN', 'Вход в систему'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="Пользователь"
    )
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, verbose_name="Действие")
    model_name = models.CharField(max_length=50, verbose_name="Модель")
    object_id = models.CharField(max_length=50, verbose_name="ID объекта")
    details = models.JSONField(default=dict, blank=True, verbose_name="Детали (JSON)")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Время")

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Лог действия"
        verbose_name_plural = "Логи действий"