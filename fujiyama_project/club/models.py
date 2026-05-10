from django.db import models
from django.conf import settings

# --- БАЗОВЫЕ МОДЕЛИ ---

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


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает подтверждения'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='enrollments',
        verbose_name="Ученик"
    )
    group = models.ForeignKey(
        TrainingGroup, 
        on_delete=models.CASCADE, 
        related_name='enrollments',
        verbose_name="Группа"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending', 
        verbose_name="Статус"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата подачи")

    class Meta:
        verbose_name = "Заявка в группу"
        verbose_name_plural = "Заявки в группы"
        unique_together = ('user', 'group') 

    def __str__(self):
        return f"{self.user.username} -> {self.group.name}"


# --- ЛИЧНЫЙ КАБИНЕТ ---

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


class Attendance(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='attendances',
        verbose_name="Ученик"
    )
    training_group = models.ForeignKey(TrainingGroup, on_delete=models.CASCADE, verbose_name="Группа")
    date = models.DateField(auto_now_add=True, verbose_name="Дата")
    is_present = models.BooleanField(default=True, verbose_name="Присутствовал")

    class Meta:
        verbose_name = "Посещаемость"
        verbose_name_plural = "Посещаемость"

    def __str__(self):
        return f"{self.user.username} - {self.date}"


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

    def __str__(self):
        return f"{self.user.username} - {self.competition.name}"