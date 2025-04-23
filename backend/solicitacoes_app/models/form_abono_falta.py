from datetime import date
from django.db import models
from .motivo_abono import MotivoAbono
from django.core.exceptions import ValidationError
from .form_base import FormularioBase
from django.db.models import OneToOneField, RESTRICT

class FormAbonoFalta(FormularioBase):
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

    perdeu_atividades = models.BooleanField(
        default=False,
        blank=True
    )
    
    class Meta:
        verbose_name = "Formulário de Abono de Faltas"
    
    def __str__(self):
        return self.nome
    
    def clean(self):
        if self.data_fim_afastamento < self.data_inicio_afastamento:
            raise ValidationError(
                {'data_fim_afastamento': 'A data de fim do afastamento não pode ser anterior à data de início.'}
            )
        super().clean()