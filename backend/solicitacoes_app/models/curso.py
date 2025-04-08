from .base import BaseModel
from django.db import models
from ..managers.curso_manager import *
from django.core.validators import MinLengthValidator


class Curso(BaseModel):
    nome = models.CharField(
        max_length=255
    )
    codigo = models.CharField(
        primary_key=True,
        max_length=50
    )

    objects = CursoManager()
    
    def __str__(self):
        return self.nome
