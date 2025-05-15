from django.db import models
from .solicitacao import Solicitacao   # sua classe abstrata

class FormularioTrancamentoMatricula(Solicitacao):
    motivo_solicitacao = models.TextField()
    
    def save(self, *args, **kwargs):
        self.nome_formulario = "Formulário de Trancamento de Matrícula"
        
        super().save(*args, **kwargs)
    class Meta:
        verbose_name = "Formulário de Trancamento de Matrícula"

