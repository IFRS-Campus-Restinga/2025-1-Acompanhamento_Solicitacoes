from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator

# class Anexo(BaseModel):
#     arquivo = models.FileField(upload_to='anexos/')

class FormularioBase(BaseModel):
    nome = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(1)]
    )
    descricao = models.TextField()
    motivo_solicitacao = models.CharField(
        max_length=255
    )
    tipo_documento = models.CharField(
        max_length=100,
        blank=True
    )
    recebe_auxilio_estudantil = models.BooleanField(
        default=False,
        blank=True
    )
    acesso_ao_moodle = models.BooleanField(
        default=False,
        blank=True
    )
    observacoes = models.TextField(
        blank=True,
        blank=True
    )
    
    # anexos = models.ManyToManyField(
    #     'Anexo',
    #     blank=True,
    #     related_name='formularios',
    # )

    class Meta:
        abstract = True
        verbose_name = "Formulario"
        verbose_name_plural = "Formularios"

    def __str__(self):
        return f"Formulário: {self.nome} - {self.motivo_solicitacao}"