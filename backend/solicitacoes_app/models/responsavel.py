from django.db import models
from .usuario import Usuario
from .aluno import Aluno

class Responsavel(Usuario):
    aluno = models.OneToOneField(
        Aluno, on_delete=models.CASCADE, unique=True
    )

    def __str__(self):
        return f"Responsável - {self.nome}"
