from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator

class FormularioBase(BaseModel):
    id = models.AutoField(primary_key=True)
    nome_formulario = models.CharField(max_length=60, null=True, validators=[MinLengthValidator(10)]) #Campo que explica o objetivo do formulário em questão. Vai ser apresentado no frontend na tela de abertura do formulário.
    descricao = models.TextField(blank=True, null=True) #Campo que explica o objetivo do formulário em questão. Vai ser apresentado no frontend na tela de abertura do formulário.

    motivo_solicitacao = models.CharField(
        max_length=255
    )

    class Meta:
        abstract = True
        verbose_name = "Formulario"
        verbose_name_plural = "Formularios"

    def __str__(self):
        return f"Formulário: {self.nome_formulario} - {self.motivo_solicitacao}"
    