from django.db import models
from .disciplina import Disciplina
from .solicitacao import Solicitacao
from django.core.exceptions import ValidationError

class FormTrancDisciplina(Solicitacao):
    nome_formulario = "Formulário de Trancamento de Componente Curricular"
    
    disciplinas = models.ManyToManyField(
        Disciplina,
        related_name="formularios_trancamento",
        help_text="Selecione as disciplinas que deseja trancar"
    )

    ingressante = models.BooleanField(
        default=False,
        help_text="Marque se o aluno é ingressante. Essa informação é importante para limitar a quantidade de trancamentos."
    )

    motivo_solicitacao = models.TextField()
    
    def clean(self):
        super().clean()
        qtd_disciplinas = self.disciplinas.count()
        limite = 2 if self.ingressante else 5

        if qtd_disciplinas > limite:
            raise ValidationError({
                'disciplinas': f'Alunos {"ingressantes" if self.ingressante else "regulares"} podem trancar no máximo {limite} disciplinas.'
            })

        if qtd_disciplinas < 1:
            raise ValidationError({
                'disciplinas': 'Pelo menos uma disciplina deve ser selecionada para trancamento.'
            })

    class Meta:
        verbose_name = "Formulário de Trancamento de Componente Curricular"
        verbose_name_plural = "Formulários de Trancamento de Componente Curricular"

    def __str__(self):
        return f"{self.nome_formulario} (ID: {self.id})"