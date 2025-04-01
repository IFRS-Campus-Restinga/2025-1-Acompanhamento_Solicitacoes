from django.db import models
from .usuario import Usuario
import datetime
from django.core.validators import *

class Aluno(Usuario):
    matricula = models.CharField(max_length=20, unique=True)
    turma = models.CharField(max_length=100)
    ano_ingresso = models.IntegerField(validators=[MinValueValidator(2000),MaxValueValidator(datetime.date.today().year)])

    def __str__(self):
        return f"{self.nome} ({self.matricula})"