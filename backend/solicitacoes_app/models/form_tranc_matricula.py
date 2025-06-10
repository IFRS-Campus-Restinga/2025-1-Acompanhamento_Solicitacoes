# seu_app/models/form_tranc_matricula.py

from django.db import models
from .solicitacao import Solicitacao

class FormularioTrancamentoMatricula(Solicitacao):
    # NOVO: Atributo de classe obrigatório para a lógica de disponibilidade no modelo pai.
    # O valor deve corresponder ao que você tem no seu modelo `Disponibilidade`.
    NOME_FORMULARIO_IDENTIFICADOR = 'TRANCAMENTOMATRICULA'
    
    # Seus campos específicos para este formulário
    motivo_solicitacao = models.TextField(
        verbose_name="Motivo da Solicitação"
    )
    
    class Meta:
        verbose_name = "Formulário de Trancamento de Matrícula"
        verbose_name_plural = "Formulários de Trancamento de Matrícula"