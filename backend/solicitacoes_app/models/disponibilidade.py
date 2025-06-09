from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from .base import BaseModel

class Disponibilidade(BaseModel):
    FORMULARIO_CHOICES = [
        ('TRANCAMENTODISCIPLINA', 'Trancamento de Disciplina'),
        ('TRANCAMENTOMATRICULA', 'Trancamento de Matrícula'),
        ('DISPENSAEDFISICA', 'Dispensa de Educação Física'),
        ('DESISTENCIAVAGA', 'Desistência de Vaga'),
        ('EXERCICIOSDOMICILIARES', 'Exercícios Domiciliares'),
        ('ABONOFALTAS', 'Abono de Faltas'),
        ('ENTREGACERTIFICADOS', 'Entrega de Certificados'),
    ]

    formulario = models.CharField(
        max_length=50,
        choices=FORMULARIO_CHOICES,
        unique=True,
        verbose_name="Formulário"
    )
    ativo = models.BooleanField(
        default=True,
        verbose_name="Registro ativo?"
    )

    @property
    def esta_ativo(self):
        """Verifica se existe pelo menos um período ativo"""
        hoje = timezone.now().date()
        return self.periodos.filter(
            models.Q(data_fim__gte=hoje) | models.Q(data_fim__isnull=True),
            data_inicio__lte=hoje
        ).exists()

    def __str__(self):
        return f"{self.get_formulario_display()}"