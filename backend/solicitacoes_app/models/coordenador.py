from django.db import models, transaction
from .base import BaseModel
from .usuario import Usuario
from .status_usuario import StatusUsuario

class Coordenador(BaseModel):
    
    usuario = models.OneToOneField(
        Usuario, on_delete=models.PROTECT, related_name="coordenador"
    )
    siape = models.IntegerField(
        unique=True
    )
     
    def __str__(self):
        return f"{self.usuario.nome} - ({self.siape})"
    
    def save(self, *args, **kwargs):
        created = not self.pk
        super().save(*args, **kwargs)
        if created: # Somente na criação do Coordenador
            # Regra: Ao criar Coordenador, passa o STATUSUSUARIO para EM_ANALISE
            if self.usuario.status_usuario == StatusUsuario.NOVO:
                self.usuario.status_usuario = StatusUsuario.EM_ANALISE
                self.usuario.save()

    def delete(self, using=None, keep_parents=False):
        # Deleção do papel Coordenador. A lógica de deleção do Usuario está em Usuario.delete().
        super().delete(using=using, keep_parents=keep_parents)
    
    class Meta:
        verbose_name = "Coordenador"
        verbose_name_plural = "Coordenadores"