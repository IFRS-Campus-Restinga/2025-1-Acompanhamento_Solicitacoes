from django.db import models
from .base import BaseModel
from .usuario import Usuario
from .curso import Curso


class Coordenador(BaseModel):
    
    usuario = models.OneToOneField(
        Usuario, on_delete=models.CASCADE, related_name="coordenador"
    )
    siape = models.IntegerField(
        unique=True
    )
    inicio_mandato = models.DateField()
    fim_mandato = models.DateField(blank=True, null=True)

    curso = models.OneToOneField(
        Curso, on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.usuario.nome} - ({self.siape})"

    
    def clean(self):

        """Garante que o fim do mandato seja posterior ao início."""

        if self.inicio_mandato >= self.fim_mandato:
            raise ValueError("O fim do mandato deve ser posterior ao início.")
        
    class Meta:
        verbose_name = "Coordenador"
        verbose_name_plural = "Coordenadores"