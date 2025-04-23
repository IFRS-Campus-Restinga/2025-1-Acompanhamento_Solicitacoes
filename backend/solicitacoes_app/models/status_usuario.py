from django.db import models

class StatusUsuario (models.TextChoices):
    ATIVO = "Ativo"
    INATIVO = "Inativo"
    EM_ANALISE = "Em Analise"

