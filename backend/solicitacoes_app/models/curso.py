from .base import BaseModel
from django.db import models

class Curso(BaseModel):
    nome = models.CharField(
        max_length=255,
        null=False,
        blank=False
    )
    codigo = models.CharField(
        primary_key=True,
        max_length=50,
        null=False,
        blank=False
    )
    
    def __str__(self):
        return self.nome
