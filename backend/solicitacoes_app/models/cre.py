from django.db import models, transaction
from django.forms import ValidationError
from ..models.status_usuario import StatusUsuario
from .base import BaseModel
from .usuario import Usuario

class CRE(BaseModel):
    usuario = models.OneToOneField(
        Usuario, on_delete=models.PROTECT, related_name="cre"
    )
    siape = models.IntegerField(
        unique=True
    )
    
    def delete(self, using=None, keep_parents=False):
        # Verificar se existe pelo menos 1 CRE ativo
        cre_ativos = CRE.objects.filter(usuario__status_usuario=StatusUsuario.ATIVO)

        if cre_ativos.count() <= 1:
            raise ValidationError("Não é possível excluir. Deve haver pelo menos 1 CRE ativa no sistema.")

        with transaction.atomic():
            self.usuario.delete() # O usuario é inativado e o registro da CRE permanece para histórico


    def clean(self):
        # Verifica se o siape é realmente um inteiro
        if not isinstance(self.siape, int):
            raise ValidationError({'siape': "O SIAPE deve ser um número inteiro."})

        # Verifica se é um inteiro positivo
        if self.siape <= 0:
            raise ValidationError({'siape': "O SIAPE deve ser um número positivo."})


    def __str__(self):
        return f"{self.usuario.nome} - ({self.siape})"
    
    class Meta:
        verbose_name = "CRE"
        verbose_name_plural = "CREs"   
    
