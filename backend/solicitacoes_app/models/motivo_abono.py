from django.forms import ValidationError
from .base import BaseModel
from django.db import models
from .tipo_falta import TipoFalta
from django.core.validators import MinLengthValidator, RegexValidator

class MotivoAbono(BaseModel):
    descricao = models.CharField(
        max_length=255, 
        validators=[MinLengthValidator(10),
                    RegexValidator(
                        regex=r'^[\w\s.,;:!?()áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ-]+$',
                        message="A descrição não pode conter caracteres especiais.")], 
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

    def clean(self):
        if MotivoAbono.objects.filter(descricao__iexact=self.descricao).exclude(pk=self.pk).exists():
            raise ValidationError({'descricao': 'Já existe um motivo com esta descrição.'})
        
    def __str__(self):
        return self.descricao
