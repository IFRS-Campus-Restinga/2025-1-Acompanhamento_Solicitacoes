from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from .status import Status
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .aluno import Aluno
from django.core.exceptions import ValidationError


class Solicitacao(BaseModel):
    aluno = models.ForeignKey(
        Aluno,
        related_name='aluno',
        on_delete=models.DO_NOTHING
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        verbose_name="Tipo de Formulário",
        help_text="O tipo específico de formulário associado a esta solicitação.",
        limit_choices_to=models.Q(app_label='solicitacoes_app', model='formexerciciodomiciliar') |
                         models.Q(app_label='solicitacoes_app', model='formdispensaedfisica') |
                         models.Q(app_label='solicitacoes_app', model='formtrancdisciplina') |
                         models.Q(app_label='solicitacoes_app', model='formabonofalta') |
                         models.Q(app_label='solicitacoes_app', model='formdesistenciavaga') |
                         models.Q(app_label='solicitacoes_app', model='formulariotrancamentomatricula'),
        related_name="formulario_associado"
    )

    object_id = models.PositiveIntegerField(
        verbose_name="ID do Formulário Vinculado",
        help_text="O ID da instância específica do formulário."
    )

    formulario_associado = GenericForeignKey('content_type', 'object_id')

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
            campos_restritos = ['aluno', 'content_type', 'object_id', 'data_solicitacao']

            for campo in campos_restritos:
                if getattr(self, campo) != getattr(original, campo):
                    raise ValidationError(
                        f"O campo '{campo}' não pode ser alterado após a criação."
                    )
        super().save(*args, **kwargs)

    def __str__(self):
        nome_aluno = self.aluno.usuario.nome if self.aluno and self.aluno.usuario else "Sem Aluno"
        nome_formulario = str(self.formulario_associado) if self.formulario_associado else "Sem Formulário"
        return f"{nome_aluno} | {nome_formulario}"
