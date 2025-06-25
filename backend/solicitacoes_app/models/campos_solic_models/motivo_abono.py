from django.forms import ValidationError
from ..base import BaseModel
from django.db import models
from .tipo_falta import TipoFalta
from django.core.validators import MinLengthValidator, RegexValidator

class MotivoAbono(BaseModel):
    descricao = models.CharField(
        max_length=255, 
        validators=[
            MinLengthValidator(10, message="A descrição deve ter no mínimo 10 caracteres."), 
            RegexValidator(
                regex=r'^[a-zA-Z0-9\s.,;:!?()áéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ-]+$',# Alterado para permitir números
                message="A descrição não pode conter caracteres especiais que não sejam pontuação ou acentos."
            )
        ], 
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
        # Validação adicional para tipo_falta
        if self.tipo_falta not in [choice[0] for choice in TipoFalta.choices]:
             raise ValidationError({'tipo_falta': 'Tipo de falta inválido.'})
        
    def __str__(self):
        return f'{self.descricao} - ({self.get_tipo_falta_display()})' # Use get_FOO_display para choices