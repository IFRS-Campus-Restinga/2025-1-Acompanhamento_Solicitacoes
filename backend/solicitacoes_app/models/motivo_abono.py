from .base import BaseModel
from django.db import models
from .tipo_falta import TipoFalta
from django.core.validators import MinLengthValidator

class MotivoAbono(BaseModel):
    descricao = models.CharField(
        max_length=255, 
        validators=[MinLengthValidator(10)], 
        blank=False,
        null=False, 
        verbose_name="Descrição"
    )
    tipo_falta = models.CharField( 
        max_length=20, 
        choices=TipoFalta.choices,
        blank=False,
        null=False,
        verbose_name="Tipo de Falta"
    )

    def __str__(self):
        return self.descricao
