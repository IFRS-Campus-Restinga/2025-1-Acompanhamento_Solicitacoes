from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from .status import Status
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import datetime

class Solicitacao(BaseModel):

    data_solicitacao = models.DateField(
        help_text="Data em que o evento da solicitação ocorreu ou para quando é solicitada.",
        verbose_name="Data Efetiva da Solicitação",
    )
    data_emissao = models.DateField(
        verbose_name="Data de Emissão/Conclusão",
        null=True, blank=True,
        help_text="Data em que a solicitação foi processada e teve um resultado."
    )

    status = models.CharField( 
        max_length=20, 
        choices=Status.choices,
        blank=False,
        null=False,
        verbose_name="Status da Solicitação"
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
                         models.Q(app_label='solicitacoes_app', model='formulariotrancamentomatricula')
    )
    
    object_id = models.PositiveIntegerField(
        verbose_name="ID do Formulário Vinculado",
        help_text="O ID da instância específica do formulário."
    )
    formulario_associado = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return self.status
