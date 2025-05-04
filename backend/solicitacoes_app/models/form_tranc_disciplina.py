from django.db import models
from .curso import Curso
from .disciplina import Disciplina
from .form_base import FormularioBase
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError

class FormTrancDisciplina(FormularioBase):
    aluno = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(1)],
        verbose_name="Nome do Aluno",  
        help_text="Digite o nome do aluno",
    )
    
    curso = models.ForeignKey(
        Curso,
        on_delete=models.CASCADE,
        related_name="formularios_trancamento", 
        help_text="Selecione o curso"
    )
    
    disciplinas = models.ManyToManyField(
        Disciplina,
        related_name="formularios_trancamento",
        help_text="Selecione as disciplinas que deseja trancar"
    )

    # Pode ser interessante também adicionar um campo para saber se o aluno é ingressante
    ingressante = models.BooleanField(
        default=False,
        help_text="Marque se o aluno é ingressante. Essa informação é importante para limitar a quantidade de trancamentos."
    )

    def __str__(self):
        return f"Trancamento de disciplinas - Aluno: {self.aluno} - Curso: {self.curso.nome}"

    def clean(self):
        # Chama o clean do modelo base
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