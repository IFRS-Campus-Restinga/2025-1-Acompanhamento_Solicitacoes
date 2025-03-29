from .base import BaseModel
from django.db import models
from .curso import Curso

class Ppc(BaseModel):
    codigo = models.CharField(
        primary_key=True,
        max_length=30,
        null=False,
        blank=False,  # obrigatório em formulários
    )
    
    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name='ppcs',
        null=False,
        blank=False
    )
    
    def __str__(self):
        return self.codigo
