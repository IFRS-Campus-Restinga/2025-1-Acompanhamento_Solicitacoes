from .base import BaseModel
from django.db import models
# from django.core.validators import MinLengthValidator

class FormularioBase(BaseModel):
    descricao = models.TextField() #Campo que explica o objetivo do formulário em questão. Vai ser apresentado no frontend na tela de abertura do formulário.
    motivo_solicitacao = models.CharField(
        max_length=255
    )


    class Meta:
        abstract = True
        verbose_name = "Formulario"
        verbose_name_plural = "Formularios"

    def __str__(self):
        return f"Formulário: {self.nome} - {self.motivo_solicitacao}"
    