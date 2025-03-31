from django.db import models
from .usuario import Usuario

class CRE(Usuario):
    siape = models.IntegerField(
        unique=True,
        help_text="Escreva aqui o número do SIAPE.",
        verbose_name="SIAPE:",
    )
    
    def __str__(self):
        return f"{self.nome}-({self.siape})"
    
    class Meta:
        verbose_name = "CRE"
        verbose_name_plural = "CREs"
        ordering = ("nome",)     