from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator

class Turma(BaseModel):
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(1)],
        verbose_name="Turma",
        help_text="Digitar o nome da turma:"
    )
    def __str__(self):
        return self.nome