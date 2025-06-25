# models.py
from ..base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MinValueValidator, MaxValueValidator
from django.forms import ValidationError


class AtividadeComplementar(BaseModel):
    nome = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(5, message="O nome da atividade deve ter no mínimo 5 caracteres.")],
        blank=False,
        null=False,
        verbose_name="Nome da Atividade"
    )
    carga_horaria = models.IntegerField(
        validators=[
            MinValueValidator(1, message="A carga horária deve ser no mínimo 1 hora."),
            MaxValueValidator(999, message="A carga horária máxima é de 999 horas.")
        ],
        blank=False,
        null=False,
        verbose_name="Carga Horária (horas)"
    )

    class Meta:
        # Garante que não haja duas atividades com o mesmo nome e carga horária
        unique_together = ('nome', 'carga_horaria',)
        verbose_name = "Atividade Complementar"
        verbose_name_plural = "Atividades Complementares"


    def clean(self):
        super().clean()
        # Validação de unicidade combinada de nome e carga_horaria
        if AtividadeComplementar.objects.filter(
            nome__iexact=self.nome, carga_horaria=self.carga_horaria
        ).exclude(pk=self.pk).exists():
            raise ValidationError(
                {'nome': 'Já existe uma atividade complementar com este nome e carga horária.'}
            )

    def __str__(self):
        return f'{self.nome} ({self.carga_horaria}h)'