from django.db import models
from .base import BaseModel
from .usuario import Usuario
from .aluno import Aluno

class Responsavel(BaseModel):
    usuario = models.OneToOneField(
        Usuario, on_delete=models.CASCADE, related_name="responsavel"
    )
    aluno = models.OneToOneField(
        Aluno, on_delete=models.CASCADE, unique=True
    )

    def __str__(self):
        return f"Responsável - {self.usuario.nome}"
