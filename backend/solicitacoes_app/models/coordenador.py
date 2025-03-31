from django.db import models
from .usuario import Usuario
from .curso import Curso

class Coordenador(Usuario):
    siape = models.IntegerField(
        unique=True,
        help_text="Escreva aqui o número do SIAPE.",
        verbose_name="SIAPE:",
    )
    inicio_mandato = models.DateField(
        help_text="Escreva aqui a data de início do mandato",
        verbose_name="Inicio Mandato:"
    )
    fim_mandato = models.DateField(
        blank=True, 
        null=True,
        help_text="Escreva aqui a data de fim do mandato",
        verbose_name="Fim Mandato:"
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
        
    class Meta:
        verbose_name = "Coordenador"
        verbose_name_plural = "Coordenadores"
        ordering = ("nome",)        