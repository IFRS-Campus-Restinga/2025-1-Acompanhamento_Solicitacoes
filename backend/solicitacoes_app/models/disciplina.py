from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from .ppc import Ppc
from .periodo_disciplina import PeriodoDisciplina

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

    periodo = models.CharField(
        max_length=20,
        choices=PeriodoDisciplina.choices,
        default=PeriodoDisciplina.PRIMEIRO_ANO,
        verbose_name="Período",
        help_text="Selecionar o semestre/ano da disciplina:"
    )

    ppc = models.ForeignKey(
        Ppc, 
        on_delete=models.CASCADE, 
        related_name='disciplinas', 
        verbose_name="PPC",
        help_text="Selecionar o PPC ao qual a disciplina pertence:"
    )
    
    def __str__(self):
        return self.nome
