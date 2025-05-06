from django.db import models
from .base import BaseModel
from .curso import Curso
from .coordenador import Coordenador
from django.core.exceptions import ValidationError

class Mandato(BaseModel):
    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name="mandatos_curso"
    )
    coordenador = models.ForeignKey(
        Coordenador,
        on_delete=models.CASCADE,
        related_name="mandatos_coordenador"
    )
    inicio_mandato = models.DateField()
    fim_mandato = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Mandato de {self.coordenador} no curso {self.curso}. Início: {self.inicio_mandato} / Fim: {self.fim_mandato} "

    def clean(self):
        """Garante que o fim do mandato seja posterior ao início e que não haja sobreposição de mandatos para o mesmo curso."""
        
        # Valida se o fim do mandato é posterior ao início
        if self.fim_mandato and self.inicio_mandato >= self.fim_mandato:
            raise ValidationError("O fim do mandato deve ser posterior ao início.")
            
    class Meta:
        verbose_name = "Mandato"
        verbose_name_plural = "Mandatos"
        constraints = [
            models.UniqueConstraint(fields=['coordenador', 'curso'], name='unique_mandato') #usada para garantir que um coordenador não tenha múltiplos mandatos no mesmo curso ao mesmo tempo
        ]