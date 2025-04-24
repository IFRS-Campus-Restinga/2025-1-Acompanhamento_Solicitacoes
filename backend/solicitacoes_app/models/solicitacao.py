from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from .status import Status

class Solicitacao(BaseModel):


    data_solicitacao = models.DateField(
        help_text="Escreva aqui a data da solicitação", 
        verbose_name="Data da Solicitação:",
    )

    data_emissao = models.DateField(
        help_text="Escreva aqui a data de emissão", 
        verbose_name="Data emissão:",
    )


    status = models.CharField( 
        max_length=20, 
        choices=Status.choices,
        blank=False,
        null=False,
        verbose_name="Status da Solicitação"
    )
    
    def __str__(self):
        return self.status
