from django.db import models
from .base import BaseModel
from .usuario import Usuario
from .aluno import Aluno
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
        super().save(*args, **kwargs)
