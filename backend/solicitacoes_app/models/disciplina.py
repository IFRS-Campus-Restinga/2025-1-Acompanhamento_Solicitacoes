from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from .ppc import Ppc  # Importa o modelo PPC

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
    ppc = models.ForeignKey(
        Ppc,  # Relacionamento com o modelo Ppc
        on_delete=models.CASCADE,  # O que acontece quando o PPC é deletado
        related_name='disciplinas',  # Nome reverso da relação
        verbose_name="PPC",
        help_text="Selecionar o PPC ao qual a disciplina pertence:"
    )
    
    def __str__(self):
        return self.nome
