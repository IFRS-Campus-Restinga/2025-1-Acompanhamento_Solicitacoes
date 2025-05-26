from datetime import date
from django.db import models
from ..models import MotivoAbono, Curso, Aluno
from django.core.exceptions import ValidationError
from .solicitacao import Solicitacao
from django.db.models import RESTRICT
from .ppc import Ppc 

class FormAbonoFalta(Solicitacao):

    curso = models.ForeignKey(
    Curso,
    on_delete=models.CASCADE,
    verbose_name="Curso"
    )

    ppc = models.ForeignKey(
        Ppc,
        on_delete=models.CASCADE,
        null=True
    )

    disciplinas = models.ManyToManyField(
        'Disciplina',
        verbose_name="Disciplinas relacionadas"
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
         # Acessa o nome do aluno através da relação com Solicitação
        aluno_nome = self.solicitacao.aluno.usuario.nome if hasattr(self, 'solicitacao') and self.solicitacao.aluno else "Aluno não identificado"
        return f"Abono de Falta - {aluno_nome} ({self.curso.nome})"
    
    def clean(self):
        if self.data_fim_afastamento < self.data_inicio_afastamento:
            raise ValidationError(
                {'data_fim_afastamento': 'A data de fim do afastamento não pode ser anterior à data de início.'}
            )
        super().clean()