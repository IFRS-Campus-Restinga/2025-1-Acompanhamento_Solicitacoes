from .solicitacao import Solicitacao
from django.db import models
from .aluno import Aluno
from .curso import Curso
from .disciplina import Disciplina
from .multi_file_field import MultiFileField

class FormEntregaAtivCompl(Solicitacao):
    nome = "Formulário de Atividades Complementares"
    disciplinas = models.ManyToManyField(Disciplina,
        verbose_name="Disciplinas",
        help_text="Selecione as disciplinas"
    )
    
    anexos = MultiFileField(verbose_name="Anexo(s)", help_text="Selecione seus arquivos")
    
    class Meta:
        verbose_name = "Formulário de Atividades Complementares"