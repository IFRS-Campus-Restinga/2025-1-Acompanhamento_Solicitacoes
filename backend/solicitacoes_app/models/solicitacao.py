# seu_app/models/solicitacao.py

from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from polymorphic.models import PolymorphicModel

from .base import BaseModel
from .status import Status
from .aluno import Aluno
from .posse_solicitacao import PosseSolicitacao

class Solicitacao(PolymorphicModel):
    aluno = models.ForeignKey(
        Aluno,
        related_name='solicitacoes', 
        on_delete=models.DO_NOTHING
    )
    
    posse_solicitacao = models.CharField(
        max_length=20,
        choices=PosseSolicitacao.choices,
        default=PosseSolicitacao.COORDENACAO,
        verbose_name="Responsável Atual pela Solicitação"
    )
    
    data_solicitacao = models.DateField(
        help_text="Data em que a solicitação foi feita",
        verbose_name="Data da Solicitação",
        default=timezone.now 
    )

    data_emissao = models.DateField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.EM_ANALISE,
        verbose_name="Status da Solicitação"
    )

    def save(self, *args, **kwargs):
        if self.pk:
            original = type(self).objects.get(pk=self.pk)
            campos_restritos = ['aluno', 'data_solicitacao']

            for campo in campos_restritos:
                if getattr(self, campo) != getattr(original, campo):
                    raise ValidationError(
                        f"O campo '{campo}' não pode ser alterado após a criação."
                    )
        
        if not self.pk and not self.verificar_disponibilidade():
            raise ValidationError("Este formulário não está disponível no momento.")
            
        super().save(*args, **kwargs)

    def get_form_identifier(self):
        return getattr(self, 'NOME_FORMULARIO_IDENTIFICADOR', self.__class__.__name__.upper())

    def verificar_disponibilidade(self):
        from .disponibilidade import Disponibilidade
        try:
            disp = Disponibilidade.objects.get(
                formulario=self.get_form_identifier(),
                ativo=True
            )
            if disp.sempre_disponivel:
                return True
            hoje = timezone.now().date()
            return disp.data_inicio <= hoje <= disp.data_fim
        except Disponibilidade.DoesNotExist:
            return True

    def __str__(self):
        nome_aluno = self.aluno.usuario.nome if self.aluno and self.aluno.usuario else "Sem Aluno"
        nome_formulario = self._meta.verbose_name
        return f"{nome_aluno} | {nome_formulario}"
    
    class Meta:
        ordering = ['-data_solicitacao']
        verbose_name = "Solicitação"
        verbose_name_plural = "Solicitações"