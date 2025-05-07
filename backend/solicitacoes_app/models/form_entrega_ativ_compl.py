from .form_base import FormularioBase
from django.db import models
from .aluno import Aluno
from .curso import Curso
from .disciplina import Disciplina

class FormEntregaAtivCompl(FormularioBase):
    aluno = models.ForeignKey(Aluno,
                              on_delete=models.RESTRICT,
                              verbose_name="Aluno",
                              )
    
    email = models.EmailField(verbose_name="Email",
                              help_text="Email será autopreenchido")
    
    nome = models.CharField(verbose_name="Nome do aluno",
                            help_text="Nome será autopreenchido")
    
    matricula = models.CharField(max_length=20,
                                 verbose_name="Matrícula",
                                 help_text="Matrícula será autopreenchido")
    
    curso = models.ForeignKey(Curso,
                              on_delete=models.RESTRICT,
                              verbose_name="Curso",
                              help_text="Selecione seu curso")
    
    disciplinas = models.ManyToManyField(Disciplina,
                                         verbose_name="Disciplinas",
                                         help_text="Selecione suas disciplinas")