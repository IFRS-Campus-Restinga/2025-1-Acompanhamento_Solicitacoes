from django.db import models

class PosseSolicitacao(models.TextChoices):
    ALUNO = "Aluno",
    COORDENACAO = "Coordenação",
    CRE = "CRE",