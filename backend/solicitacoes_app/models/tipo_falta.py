from django.db import models

class TipoFalta(models.TextChoices):
    FA = "FA", "Falta Abonada"
    FJ = "FJ", "Falta Justificada"
    

