from django.db import models, transaction
from .base import BaseModel
from .usuario import Usuario
import datetime
from django.core.validators import MinValueValidator, MaxValueValidator
from .ppc import *
from django.contrib.auth.models import Group

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

    def __str__(self):
        return f"{self.usuario.nome} ({self.matricula})"
    
    
    def delete(self, using=None, keep_parents=False):
        # A lógica em Usuario.delete() já trata de deletar este Aluno antes de deletar fisicamente o Usuario.
        super().delete(using=using, keep_parents=keep_parents)
    
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)

        if is_new:
            try:
                # Adiciona ao grupo 'aluno' na criação
                grupo = Group.objects.get(name="aluno")
                self.usuario.groups.add(grupo)
                print(f"Usuário {self.usuario.email} adicionado ao grupo 'aluno'.")
            except Group.DoesNotExist:
                print("ERRO: Grupo 'aluno' não encontrado.")
            except Exception as e:
                print(f"Erro ao adicionar usuário {self.usuario.email} ao grupo 'aluno': {e}")

    
    

    
