from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from .status import Status
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .aluno import Aluno
from django.core.exceptions import ValidationError
from .posse_solicitacao import PosseSolicitacao

class Solicitacao(BaseModel):
    FORMULARIO_CHOICES = [
        ('TRANCAMENTODISCIPLINA', 'Trancamento de Disciplina'),
        ('TRANCAMENTOMATRICULA', 'Trancamento de Matrícula'),
        ('DISPENSAEDFISICA', 'Dispensa de Educação Física'),
        ('DESISTENCIAVAGA', 'Desistência de Vaga'),
        ('EXERCICIOSDOMICILIARES', 'Exercícios Domiciliares'),
        ('ABONOFALTAS', 'Abono de Faltas'),
        ('ENTREGACERTIFICADOS', 'Entrega de Certificados'),
    ]
    aluno = models.ForeignKey(
        Aluno,
        related_name='aluno',
        on_delete=models.DO_NOTHING
    )
    
    nome_formulario = models.CharField(
        max_length=60,
        choices=FORMULARIO_CHOICES,  # Adicionado choices aqui
        null=True,
        validators=[MinLengthValidator(10)]
    )
    
    posse_solicitacao = models.CharField(
        max_length=20,
        choices=PosseSolicitacao.choices,
        default=PosseSolicitacao.COORDENACAO,
        verbose_name="Responsável Atual pela Solicitação"
    )
    data_solicitacao = models.DateField(
        help_text="Escreva aqui a data da solicitação",
        verbose_name="Data da Solicitação:"
    )

    data_emissao = models.DateField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.EM_ANALISE,
        blank=False,
        null=False,
        verbose_name="Status da Solicitação"
    )

    def save(self, *args, **kwargs):
        if self.pk:
            original = Solicitacao.objects.get(pk=self.pk)
            campos_restritos = ['aluno', 'data_solicitacao']

            for campo in campos_restritos:
                if getattr(self, campo) != getattr(original, campo):
                    raise ValidationError(
                        f"O campo '{campo}' não pode ser alterado após a criação."
                    )
        super().save(*args, **kwargs)

    def __str__(self):
        nome_aluno = self.aluno.usuario.nome if self.aluno and self.aluno.usuario else "Sem Aluno"
        nome_formulario = self.nome_formulario or "Sem Formulário"
        return f"{nome_aluno} | {nome_formulario}"
    
    def verificar_disponibilidade(self):
        """Versão otimizada e segura"""
        from .disponibilidade import Disponibilidade
        from django.utils import timezone
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
