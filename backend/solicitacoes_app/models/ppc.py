from .base import BaseModel
from django.db import models
from django.core.validators import *
from .curso import Curso


class Ppc(BaseModel):
    codigo = models.CharField(
        primary_key=True,
        max_length=30,
        validators=[MinLengthValidator(5)]  
    )
    # Exemplo: "ADS-101/2017"
    
    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name='ppcs'
    )
    
    def __str__(self):
        return self.codigo