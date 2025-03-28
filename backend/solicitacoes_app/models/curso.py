from .base import BaseModel
from django.db import models
from.ppc import Ppc

class Curso(BaseModel):
    nome = models.CharField(max_length=255)
    codigo = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.nome