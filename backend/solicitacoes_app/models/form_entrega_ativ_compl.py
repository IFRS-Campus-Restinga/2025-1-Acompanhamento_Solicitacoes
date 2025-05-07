from .form_base import FormularioBase
from django.db import models
from .aluno import Aluno
from .curso import Curso
from .disciplina import Disciplina

class FormEntregaAtivCompl(FormularioBase):
    nome = "Formulário de Atividades Complementares"
    
    class Meta:
        verbose_name = "Formulário de Trancamento de Matrícula"