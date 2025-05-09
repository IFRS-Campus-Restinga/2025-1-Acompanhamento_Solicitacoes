from django.db import models

class Status(models.TextChoices):
    EM_ANALISE = "Em Análise"
    EM_EMISSAO = "Em Emissão"
    APROVADO = "Aprovado"
    REPROVADO = "Reprovado"
    REGISTRADO = "Registrado"
    CANCELADO = "Cancelado"