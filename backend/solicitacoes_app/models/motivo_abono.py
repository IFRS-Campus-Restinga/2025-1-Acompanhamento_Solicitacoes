from .base import BaseModel
from django.db import models
from .tipo_falta import TipoFalta
from django.core.validators import MinLengthValidator

class MotivoAbono(BaseModel):
    descricao = models.CharField(
        required=True, 
        max_length=255, 
        validator=(MinLengthValidator(10)), 
        blank=False, 
        verbose_name="Descrição"
    )
    tipo_falta = models.CharField(
        required=True, 
        max_length=2, 
        choices=TipoFalta.choices, 
        verbose_name="Tipo de Falta"
    )

    def __str__(self):
        return self.descricao
