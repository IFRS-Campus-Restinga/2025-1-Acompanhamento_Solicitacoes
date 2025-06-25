from ..base import BaseModel
from django.db.models import CharField
from django.core.validators import MinLengthValidator
from django.forms import ValidationError

class MotivoDispensa(BaseModel):
    descricao = CharField(
        max_length=200, 
        validators=[MinLengthValidator(9, message="A descrição deve ter no mínimo 9 caracteres.")], 
        help_text="Digite o motivo da dispensa de ed.física", 
        verbose_name="Descrição",
        unique=True # Adicionado para garantir unicidade, pois é um "motivo"
    )

    def clean(self):
        super().clean() # Chame o clean do pai se existir
        # Validação de unicidade caso unique=True não seja suficiente ou queira mensagem customizada
        if MotivoDispensa.objects.filter(descricao__iexact=self.descricao).exclude(pk=self.pk).exists():
            raise ValidationError({'descricao': 'Já existe um motivo de dispensa com esta descrição.'})

    def __str__(self):
        return self.descricao