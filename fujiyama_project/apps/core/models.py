from django.db import models
from django.utils import timezone

class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        # При вызове .delete() на QuerySet (наборе данных)
        return super().update(is_deleted=True, deleted_at=timezone.now())

    def hard_delete(self):
        # Если нужно удалить запись из базы навсегда
        return super().delete()

    def alive(self):
        # Фильтр для получения только живых записей
        return self.filter(is_deleted=False)

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        # По умолчанию менеджер возвращает только не удаленные записи
        return SoftDeleteQuerySet(self.model, using=self._db).alive()

class BaseModel(models.Model):
    """
    Абстрактная модель. 
    Наследуй от нее все будущие модели (Student, Trainer, etc.)
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")
    is_deleted = models.BooleanField(default=False, verbose_name="Удалено", db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Время удаления")

    objects = SoftDeleteManager()      # Основной менеджер (скрывает удаленные)
    all_objects = models.Manager()     # Менеджер для доступа ко всем записям (включая удаленные)

    class Meta:
        abstract = True

    def delete(self, **kwargs):
        # При вызове .delete() на конкретном объекте
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()