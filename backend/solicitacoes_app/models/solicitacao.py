# seu_app/models/solicitacao.py

from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from .status import Status
from .aluno import Aluno
from django.core.exceptions import ValidationError
from .posse_solicitacao import PosseSolicitacao
from datetime import date
from django.utils import timezone

class Solicitacao(BaseModel):
    # Adicionamos todas as opções de formulários para manter a validação centralizada se necessário.
    FORMULARIO_CHOICES = [
        ('TRANCAMENTODISCIPLINA', 'Trancamento de Disciplina'),
        ('TRANCAMENTOMATRICULA', 'Trancamento de Matrícula'),
        ('DISPENSAEDFISICA', 'Dispensa de Educação Física'),
        ('DESISTENCIAVAGA', 'Desistência de Vaga'),
        ('EXERCICIOSDOMICILIARES', 'Exercícios Domiciliares'),
        ('ABONOFALTAS', 'Abono de Faltas'),
        ('ENTREGACERTIFICADOS', 'Entrega de Certificados'),
        ('ENTREGAATIVCOMPL', 'Entrega de Atividades Complementares'), # Adicionada para consistência
    ]
    
    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.DO_NOTHING
    )
    
    nome_formulario = models.CharField(
        max_length=60,
        choices=FORMULARIO_CHOICES,
        null=True,
    )
    
    posse_solicitacao = models.CharField(
        max_length=20,
        choices=PosseSolicitacao.choices,
        default=PosseSolicitacao.COORDENACAO,
        verbose_name="Responsável Atual pela Solicitação"
    )
    
    data_solicitacao = models.DateField(
        help_text="Escreva aqui a data da solicitação",
        verbose_name="Data da Solicitação:",
        default=date.today
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

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if self.pk:
            original = self.__class__.objects.get(pk=self.pk)
            campos_restritos = ['aluno', 'data_solicitacao']

            for campo in campos_restritos:
                if getattr(self, campo) != getattr(original, campo):
                    raise ValidationError(
                        f"O campo '{campo}' não pode ser alterado após a criação."
                    )
        
        if not self.pk and not self.verificar_disponibilidade():
            raise ValidationError("Este formulário não está disponível no momento.")
            
        super().save(*args, **kwargs)

    def verificar_disponibilidade(self):
        from .disponibilidade import Disponibilidade
        try:
            disp = Disponibilidade.objects.get(
                formulario=self.nome_formulario,
                ativo=True
            )
            if disp.sempre_disponivel:
                return True
            hoje = timezone.now().date()
            return disp.data_inicio <= hoje <= disp.data_fim
        except Disponibilidade.DoesNotExist:
            return True
