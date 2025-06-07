from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from .base import BaseModel

class PeriodoDisponibilidade(BaseModel):
    disponibilidade = models.ForeignKey(
        'Disponibilidade',
        on_delete=models.CASCADE,
        related_name='periodos'
    )
    data_inicio = models.DateField(verbose_name="Data de início")
    data_fim = models.DateField(
        null=True,
        blank=True,
        verbose_name="Data de término (opcional)"
    )

    class Meta:
        verbose_name = "Período de Disponibilidade"
        verbose_name_plural = "Períodos de Disponibilidade"
        ordering = ['data_inicio']
        constraints = [
            models.UniqueConstraint(
                fields=['disponibilidade', 'data_inicio', 'data_fim'],
                name='unique_periodo_formulario'
            )
        ]

    def clean(self):
        # Validação básica de datas
        if self.data_fim and self.data_fim < self.data_inicio:
            raise ValidationError({
                'data_fim': 'Data final não pode ser anterior à data de início.'
            })

        # Validação de sobreposição
        periodos_sobrepostos = PeriodoDisponibilidade.objects.filter(
            disponibilidade=self.disponibilidade,
            data_inicio__lte=self.data_fim if self.data_fim else timezone.now().date() + timezone.timedelta(days=3650),  # 10 anos para períodos sem fim
            data_fim__gte=self.data_inicio,
        ).exclude(pk=self.pk if self.pk else None)

        if periodos_sobrepostos.exists():
            raise ValidationError({
                'data_inicio': 'Período sobrepõe outro existente para este formulário.',
                'data_fim': 'Período sobrepõe outro existente para este formulário.'
            })

    @property
    def esta_ativo(self):
        hoje = timezone.now().date()
        return (
            self.data_inicio <= hoje and 
            (self.data_fim is None or hoje <= self.data_fim)
        )

    def __str__(self):
        if self.data_fim:
            return f"{self.disponibilidade.get_formulario_display()}: {self.data_inicio} a {self.data_fim}"
        return f"{self.disponibilidade.get_formulario_display()}: A partir de {self.data_inicio}"