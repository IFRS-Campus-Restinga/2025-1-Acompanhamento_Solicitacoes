from django.db import models
from .base import BaseModel
from .usuario import Usuario

class CRE(BaseModel):
    usuario = models.OneToOneField(
        Usuario, on_delete=models.CASCADE, related_name="cre"
    )
    siape = models.IntegerField(
        unique=True
    )


    def __str__(self):
        return f"{self.usuario.nome} - ({self.siape})"
    
    class Meta:
        verbose_name = "CRE"
        verbose_name_plural = "CREs"   