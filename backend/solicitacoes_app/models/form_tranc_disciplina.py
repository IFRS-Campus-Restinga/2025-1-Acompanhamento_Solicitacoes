from django.db import models
from .curso import Curso
from .disciplina import Disciplina
from .form_base import FormularioBase
from django.core.validators import MinLengthValidator

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