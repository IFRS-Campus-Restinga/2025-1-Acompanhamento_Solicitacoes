from django.db import models, transaction
from .base import BaseModel
from .usuario import Usuario

class Coordenador(BaseModel):
    
    usuario = models.OneToOneField(
        Usuario, on_delete=models.PROTECT, related_name="coordenador"
    )
    siape = models.IntegerField(
        unique=True
    )
    
    def delete(self, using=None, keep_parents=False):
        with transaction.atomic():
            self.usuario.delete() # O usuario é inativado e o registro do Coordenador permanece para histórico

    
    def __str__(self):
        return f"{self.usuario.nome} - ({self.siape})"
    
    class Meta:
        verbose_name = "Coordenador"
        verbose_name_plural = "Coordenadores"