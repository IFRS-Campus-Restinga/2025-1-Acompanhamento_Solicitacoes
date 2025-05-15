from django.db import models
from .solicitacao import Solicitacao   # sua classe abstrata

class FormularioTrancamentoMatricula(Solicitacao):
    nome_formulario = "Formulário de Trancamento de Matrícula"
    motivo_solicitacao = models.TextField()
    
    class Meta:
        verbose_name = "Formulário de Trancamento de Matrícula"

