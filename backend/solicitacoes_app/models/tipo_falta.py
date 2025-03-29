from django.db import models

class TipoFalta(models.TextChoices):
    FJ = "Falta Justificada"
    FA = "Falta Abonada"

