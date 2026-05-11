from django.contrib import admin
from .models import Competition, CompetitionApplication

@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'location')

@admin.register(CompetitionApplication)
class CompetitionApplicationAdmin(admin.ModelAdmin):
    list_display = ('competition', 'user', 'status')