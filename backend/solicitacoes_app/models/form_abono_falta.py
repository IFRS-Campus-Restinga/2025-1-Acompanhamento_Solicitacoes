from datetime import date
from django.db import models
from ..models import MotivoAbono, Curso, Aluno
from django.core.exceptions import ValidationError
from .form_base import FormularioBase
from django.db.models import RESTRICT
from django.core.validators import MinLengthValidator, EmailValidator

class FormAbonoFalta(FormularioBase):
    email = models.EmailField(
        validators=[EmailValidator()]
    )
    
    aluno_nome = models.ForeignKey(
        Aluno,
        on_delete=RESTRICT,
        verbose_name="Nome do Aluno",  
        help_text="Nome do aluno",
    )

    matricula = models.CharField(
        max_length=20, 
        validators=[MinLengthValidator(1)]
    )

    curso = models.ForeignKey(
        Curso, 
        on_delete=models.CASCADE, 
        verbose_name="Curso"
    )

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
    
    def __str__(self):
        return f"{self.aluno_nome} - {self.motivo_solicitacao}"
    
    def clean(self):
        if self.data_fim_afastamento < self.data_inicio_afastamento:
            raise ValidationError(
                {'data_fim_afastamento': 'A data de fim do afastamento não pode ser anterior à data de início.'}
            )
        super().clean()