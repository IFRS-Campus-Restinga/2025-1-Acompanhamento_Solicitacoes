from django.db import models, transaction
from .base import BaseModel
from .usuario import Usuario
import datetime
from django.core.validators import MinValueValidator, MaxValueValidator
from .ppc import *

class Aluno(BaseModel):
    usuario = models.OneToOneField(
        Usuario, on_delete=models.PROTECT, related_name="aluno"
    )
    matricula = models.CharField(
        max_length=20, unique=True
    )
    ppc = models.ForeignKey(
        Ppc, on_delete=models.DO_NOTHING,
        related_name='ppcs'
    )
    ano_ingresso = models.IntegerField(
        validators=[MinValueValidator(2000),MaxValueValidator(datetime.date.today().year)]
    )
    
    def delete(self, using=None, keep_parents=False):
        with transaction.atomic():
            self.usuario.delete() # O usuario é inativado e o registro do Aluno permanece para histórico


    def __str__(self):
        return f"{self.usuario.nome} ({self.matricula})"
    

    
