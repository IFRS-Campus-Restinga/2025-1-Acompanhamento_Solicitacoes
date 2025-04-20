from django.db import models
from .form_base import FormularioBase   # sua classe abstrata

class FormularioTrancamentoMatricula(FormularioBase):
    class Meta:
        verbose_name = "Formulário de Trancamento de Matrícula"

