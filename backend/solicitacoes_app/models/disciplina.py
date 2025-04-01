from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator

class Disciplina(BaseModel):
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(1)],
        verbose_name="Disciplina",
        help_text="Digitar o nome da disciplina:"
    )
    codigo = models.CharField(
        primary_key=True,
        max_length=50,
        validators=[MinLengthValidator(1)],
        verbose_name="Codigo",
        help_text="Digitar o código da disciplina:"
    )
    
    def __str__(self):
        return self.nome
