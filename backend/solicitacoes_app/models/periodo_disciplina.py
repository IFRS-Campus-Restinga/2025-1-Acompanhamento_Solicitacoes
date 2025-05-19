from django.db import models

class PeriodoDisciplina(models.TextChoices):
    PRIMEIRO_ANO = "1º Ano", "1º Ano"
    SEGUNDO_ANO = "2º Ano", "2º Ano"
    TERCEIRO_ANO = "3º Ano", "3º Ano"
    QUARTO_ANO = "4º Ano", "4º Ano"
    PRIMEIRO_SEMESTRE = "1º Semestre", "1º Semestre"
    SEGUNDO_SEMESTRE = "2º Semestre", "2º Semestre"
    TERCEIRO_SEMESTRE = "3º Semestre", "3º Semestre"
    QUARTO_SEMESTRE = "4º Semestre", "4º Semestre"
    QUINTO_SEMESTRE = "5º Semestre", "5º Semestre"
    SEXTO_SEMESTRE = "6º Semestre", "6º Semestre"
    SETIMO_SEMESTRE = "7º Semestre", "7º Semestre"
    OITAVO_SEMESTRE = "8º Semestre", "8º Semestre"
    NONO_SEMESTRE = "9º Semestre", "9º Semestre"
    DECIMO_SEMESTRE = "10º Semestre", "10º Semestre"