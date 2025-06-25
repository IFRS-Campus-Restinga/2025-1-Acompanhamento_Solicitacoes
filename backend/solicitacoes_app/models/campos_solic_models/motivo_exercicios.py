from ..base import BaseModel
from django.db.models import CharField
from django.core.validators import MinLengthValidator
from django.forms import ValidationError

class MotivoExercicios(BaseModel):
    descricao = CharField(
        max_length=200, 
        validators=[MinLengthValidator(9, message="A descrição deve ter no mínimo 9 caracteres.")],
        help_text="Digite o motivo de exercícios domiciliares", 
        verbose_name="Descrição",
        unique=True
    )

    def clean(self):
            super().clean() # Chame o clean do pai se existir
            if MotivoExercicios.objects.filter(descricao__iexact=self.descricao).exclude(pk=self.pk).exists():
                raise ValidationError({'descricao': 'Já existe um motivo para exercícios domiciliares com esta descrição.'})

    def __str__(self):
        return self.descricao