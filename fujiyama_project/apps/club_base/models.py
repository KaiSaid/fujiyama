from django.db import models
from django.conf import settings

class Section(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название секции")
    description = models.TextField(blank=True, verbose_name="Описание")

    class Meta:
        verbose_name = "Секция"
        verbose_name_plural = "Секции"

    def __str__(self):
        return self.name

class TrainingGroup(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название группы")
    section = models.ForeignKey(
        Section, 
        on_delete=models.CASCADE, 
        related_name='groups', 
        verbose_name="Секция"
    )
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        limit_choices_to={'role': 'coach'},
        verbose_name="Тренер"
    )

    class Meta:
        verbose_name = "Группа"
        verbose_name_plural = "Группы"

    def __str__(self):
        return f"{self.name} ({self.section.name})"

class Schedule(models.Model):
    DAYS = [
        (1, 'Понедельник'), (2, 'Вторник'), (3, 'Среда'),
        (4, 'Четверг'), (5, 'Пятница'), (6, 'Суббота'), (7, 'Воскресенье'),
    ]
    group = models.ForeignKey(
        TrainingGroup, 
        on_delete=models.CASCADE, 
        related_name='schedules', 
        verbose_name="Группа"
    )
    day_of_week = models.IntegerField(choices=DAYS, verbose_name="День недели")
    start_time = models.TimeField(verbose_name="Время начала")
    end_time = models.TimeField(verbose_name="Время окончания")

    class Meta:
        verbose_name = "Расписание"
        verbose_name_plural = "Расписания"

    def __str__(self):
        return f"{self.group.name} - {self.get_day_of_week_display()}"