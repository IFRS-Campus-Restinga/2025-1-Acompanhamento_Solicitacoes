from .form_base import FormularioBase
from django.db import models
from .aluno import Aluno
from .curso import Curso
from .disciplina import Disciplina
from .multi_file_field import MultiFileField

class FormEntregaAtivCompl(FormularioBase):
    aluno = models.ForeignKey(Aluno,
                              on_delete=models.RESTRICT,
                              verbose_name="Aluno")

    disciplinas = models.ManyToManyField(Disciplina,
                                         verbose_name="Disciplinas",
                                         help_text="Selecione as disciplinas")
    
    curso = models.ForeignKey(Curso,
                              on_delete=models.RESTRICT,
                              verbose_name="Curso",
                              help_text="Selecione seu curso")
    
    anexos = MultiFileField(verbose_name="Anexo(s)", help_text="Selecione seus arquivos")
    
    class Meta:
        verbose_name = "Formulário de Atividades Complementares"