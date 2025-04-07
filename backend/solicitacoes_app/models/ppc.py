from .base import BaseModel
from django.db import models
from .curso import Curso
from ..managers.ppc_manager import PpcManager

class Ppc(BaseModel):
    codigo = models.CharField(
        primary_key=True,
        max_length=30,
        null=False,
        blank=False, 
    )
    
    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name='ppcs',
        null=False,
        blank=False
    )

    objects = PpcManager()
    
    def __str__(self):
        return self.codigo
