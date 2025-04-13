from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from .disciplina import Disciplina  # Importa o modelo Disciplina

class Turma(BaseModel):
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(1)],
        verbose_name="Turma",
        help_text="Digitar o nome da turma:"
    )
    disciplinas = models.ManyToManyField(
        Disciplina,
        related_name='turmas',
        verbose_name="Disciplinas",
        help_text="Selecionar as disciplinas da turma:"
    )
    def __str__(self):
        return self.nome