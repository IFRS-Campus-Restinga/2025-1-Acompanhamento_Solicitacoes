from django.db import models
from .base import BaseModel
from .usuario import Usuario
from .aluno import Aluno
from .status_usuario import StatusUsuario
from ..managers.responsavel_manager import ResponsavelManager

class Responsavel(BaseModel):
    usuario = models.OneToOneField(
        Usuario, on_delete=models.PROTECT, related_name="responsavel"
    )
    aluno = models.OneToOneField(
        Aluno, on_delete=models.CASCADE, unique=True
    )

    objects = ResponsavelManager()

    def __str__(self):
        return f"Responsável - {self.usuario.nome}"
    
    def delete(self, using=None, keep_parents=False):
        super().delete(using=using, keep_parents=keep_parents)
    
    def save(self, *args, **kwargs):
        created = not self.pk
        super().save(*args, **kwargs)
        if created: # Somente na criação do Responsável
            # Regra: Ao criar Responsável, passa o STATUSUSUARIO para EM_ANALISE
            if self.usuario.status_usuario == StatusUsuario.NOVO:
                self.usuario.status_usuario = StatusUsuario.EM_ANALISE
                self.usuario.save()    
        super().save(*args, **kwargs)
