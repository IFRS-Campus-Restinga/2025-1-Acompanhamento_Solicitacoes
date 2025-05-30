from django.db import models, transaction
from django.forms import ValidationError
from .status_usuario import StatusUsuario
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
             
        
    def delete(self, using=None, keep_parents=False):
        # Regra de negócio: Não permitir excluir se for o último CRE ativo.
        # Esta validação deve ocorrer ANTES de tentar a deleção.
        # A view/serializer que chama delete() deve tratar a ValidationError.
        cre_ativos = CRE.objects.filter(usuario__status_usuario=StatusUsuario.ATIVO, usuario__is_active=True).exclude(pk=self.pk)
        if not cre_ativos.exists() and self.usuario.status_usuario == StatusUsuario.ATIVO:
             # Se este é o último CRE ativo, não pode ser deletado.
             # No entanto, se o próprio usuário CRE está sendo inativado/deletado via Usuario.delete(),
             # essa checagem pode ser diferente. A lógica em Usuario.delete() prevalecerá.
            raise ValidationError("Não é possível excluir o último CRE ativo do sistema.")
        
        # Deleção do grupo CRE. A lógica de deleção do Usuario está em Usuario.delete().
        super().delete(using=using, keep_parents=keep_parents)

    def clean(self):
        # Verifica se o siape é realmente um inteiro
        if not isinstance(self.siape, int):
            raise ValidationError({'siape': "O SIAPE deve ser um número inteiro."})

        # Verifica se é um inteiro positivo
        if self.siape <= 0:
            raise ValidationError({'siape': "O SIAPE deve ser um número positivo."})
    
    def save(self, *args, **kwargs):
        created = not self.pk
        super().save(*args, **kwargs)
        if created: # Somente na criação do CRE
            # Regra: Ao criar CRE, passa o STATUSUSUARIO para EM_ANALISE
            if self.usuario.status_usuario == StatusUsuario.NOVO:
                self.usuario.status_usuario = StatusUsuario.EM_ANALISE
                self.usuario.save()


    def __str__(self):
        return f"{self.usuario.nome} - ({self.siape})"
    
    class Meta:
        verbose_name = "CRE"
        verbose_name_plural = "CREs"   
    
