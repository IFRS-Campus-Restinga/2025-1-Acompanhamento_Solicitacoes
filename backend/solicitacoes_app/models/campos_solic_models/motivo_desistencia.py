from ..base import BaseModel
from django.db.models import CharField
from django.core.validators import MinLengthValidator
from django.forms import ValidationError

class MotivoDesistencia(BaseModel):
    descricao = CharField(
        max_length=255, 
        validators=[MinLengthValidator(10, message="A descrição deve ter no mínimo 10 caracteres.")], 
        help_text="Digite o motivo da desistência de vaga", 
        blank=False,
        null=False,
        unique=True,
        verbose_name="Descrição"
    )

    class Meta:
        verbose_name = "Motivo Desistencia"
        verbose_name_plural = "Motivos Desistencia"

    def clean(self):
        super().clean()
        if MotivoDesistencia.objects.filter(descricao__iexact=self.descricao).exclude(pk=self.pk).exists():
            raise ValidationError({'descricao': 'Já existe um motivo de desistência com esta descrição.'})

    def __str__(self):
        return self.descricao