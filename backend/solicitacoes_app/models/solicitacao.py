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
                         models.Q(app_label='solicitacoes_app', model='formulariotrancamentomatricula')
    )
    
    object_id = models.PositiveIntegerField(
        verbose_name="ID do Formulário Vinculado",
        help_text="O ID da instância específica do formulário."
    )
    formulario_associado = GenericForeignKey('content_type', 'object_id')

    data_solicitacao = models.DateField(
        help_text="Escreva aqui a data da solicitação", 
        verbose_name="Data da Solicitação:",
    )

    data_emissao = models.DateField(
        help_text="Escreva aqui a data de emissão", 
        verbose_name="Data emissão:",
    )

    status = models.CharField( 
        max_length=20, 
        choices=Status.choices,
        blank=False,
        null=False,
        verbose_name="Status da Solicitação"
    )

    def clean(self):
        ModelClass = self.content_type.model_class()
        if not ModelClass.objects.filter(pk=self.object_id).exists():
            raise ValidationError("O ID do formulário associado não existe para este tipo.")
        
    
    def __str__(self):
        return self.aluno.usuario.nome + ' | '
