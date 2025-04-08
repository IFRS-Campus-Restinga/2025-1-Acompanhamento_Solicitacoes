from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator

class Curso(BaseModel):
    nome = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(6)]  
    )
    
    codigo = models.CharField(
        primary_key=True,
        max_length=50,
        validators=[MinLengthValidator(3)] 
    )
    
    def __str__(self):
        return self.nome