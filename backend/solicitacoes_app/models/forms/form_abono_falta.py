from datetime import date
from django.db import models
#from .. import  Curso, Disciplina
from solicitacoes_app.models.campos_solic_models.motivo_abono import MotivoAbono
from django.core.exceptions import ValidationError
from ..solicitacao import Solicitacao
from django.db.models import RESTRICT
#from ..ppc import Ppc 

class FormAbonoFalta(Solicitacao):

    # curso = models.ForeignKey(
    # Curso,
    # on_delete=models.CASCADE,
    # verbose_name="Curso"
    # )

    # ppc = models.ForeignKey(
    #     Ppc,
    #     on_delete=models.CASCADE,
    #     null=True
    # )

    # disciplinas = models.ManyToManyField(
    #     Disciplina,
    #     verbose_name="Disciplinas relacionadas",
    #     help_text="Selecione as disciplinas"
    # )

    motivo_solicitacao = models.ForeignKey(
        MotivoAbono, 
        on_delete=RESTRICT, 
        help_text="Escolha seu motivo da solicitação", 
        verbose_name="Motivo da Solicitação"
    )
    
    data_inicio_afastamento = models.DateField(
        default=date.today,
        verbose_name="Data de início do afastamento"
    )
    
    data_fim_afastamento = models.DateField(
        default=date.today,
        verbose_name="Data de fim do afastamento"
    )

    acesso_moodle = models.BooleanField(
        default=False,
        blank=True
    )

    perdeu_atividades = models.BooleanField(
        default=False,
        blank=True
    )
    
    class Meta:
        verbose_name = "Formulário de Abono de Faltas"
    
    
    def clean(self):
        if self.data_fim_afastamento < self.data_inicio_afastamento:
            raise ValidationError(
                {'data_fim_afastamento': 'A data de fim do afastamento não pode ser anterior à data de início.'}
            )
        super().clean()