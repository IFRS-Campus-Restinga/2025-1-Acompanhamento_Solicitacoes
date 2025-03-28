from .base import BaseModel
from django.db import models
from .curso import Curso

class Ppc(BaseModel):
    
    codigo = models.CharField(
        unique=True, 
        primary_key=True, 
        max_length=30, 
        blank=False
    )
    
    curso = models.ForeignKey(
        Curso, 
        on_delete=models.CASCADE,
        related_name='ppcs'  
    )
    
    def __str__(self):
        return self.codigo
