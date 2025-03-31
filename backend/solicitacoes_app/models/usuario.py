from .base import BaseModel
from django.db import models

class Usuario (BaseModel):
    nome = models.CharField(
        max_length=100
    )
    email = models.EmailField(
        
    )
    cpf = models.CharField(
        max_length=11, unique=True
    )
    telefone = models.CharField(
        max_length=11
    )
    data_nascimento = models.DateField(

    )


    class Meta:
        abstract = True