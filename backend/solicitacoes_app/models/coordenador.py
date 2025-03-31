from django.db import models
from .usuario import Usuario, Curso
from django.core.validators import *

class Coordenador(Usuario):
    siape = models.IntegerField(
        unique=True
    )
    inicio_mandato = models.DateField()
    
    fim_mandato = models.DateField(
        blank=True, null=True
    )

    curso = models.OneToOneField(
        Curso, on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.nome}-({self.siape})"
    
    def clean(self):

        """Garante que o fim do mandato seja posterior ao início."""

        if self.inicio_mandato >= self.fim_mandato:
            raise ValueError("O fim do mandato deve ser posterior ao início.")
