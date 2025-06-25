from django.db import models
from ..solicitacao import Solicitacao   # sua classe abstrata

class FormularioTrancamentoMatricula(Solicitacao):
    motivo_solicitacao = models.TextField()
    
    def save(self, *args, **kwargs):
        # Definir o valor do choice para o método 'verificar_disponibilidade' funcionar
        self.nome_formulario = 'TRANCAMENTOMATRICULA'
        super().save(*args, **kwargs)
        
    class Meta:
        verbose_name = "Formulário de Trancamento de Matrícula"
        verbose_name_plural = "Formulários de Trancamento de Matrícula"