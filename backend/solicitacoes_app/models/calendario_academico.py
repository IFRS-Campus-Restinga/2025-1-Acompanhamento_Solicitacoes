from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from .base import BaseModel

class CalendarioAcademico(BaseModel):
    # ========== CHOICES ==========
    TIPO_CURSO_CHOICES = [
        ('GRADUACAO', 'Graduação (Semestral)'),
        ('MEDIO', 'Ensino Médio Integrado (Anual)'),
    ]

    FORMULARIO_CHOICES = [
        ('TRANCAMENTODISCIPLINA', 'Trancamento de Disciplina'),
        ('TRANCAMENTOMATRICULA', 'Trancamento de Matrícula'),
        ('DISPENSAEDFISICA', 'Dispensa de Educação Física'),
        ('DESISTENCIAVAGA', 'Desistência de Vaga'),
        ('EXERCICIOSDOMICILIARES', 'Exercícios Domiciliares'),
        ('ABONOFALTAS', 'Abono de Faltas'),
        ('ENTREGACERTIFICADOS', 'Entrega de Certificados'),
    ]

    # ========== CAMPOS PRINCIPAIS ==========
    codigo = models.CharField(
        primary_key=True,
        max_length=10,
        verbose_name="Código do Período",
        blank=False,
        null=False,
        help_text="Código definido pela universidade"
    )

    formulario = models.CharField(
        max_length=50,
        choices=FORMULARIO_CHOICES,
        verbose_name="Tipo de Formulário",
        blank=False,
        null=False
    )

    tipo_curso = models.CharField(
        max_length=10,
        choices=TIPO_CURSO_CHOICES,
        verbose_name="Tipo de Curso",
        blank=False,
        null=False
    )

    data_inicio = models.DateField(
        verbose_name="Data de Início",
        blank=False,
        null=False
    )

    data_fim = models.DateField(
        verbose_name="Data de Término",
        blank=False,
        null=False
    )

    ativo = models.BooleanField(
        default=True,
        verbose_name="Prazo Ativo?"
    )

    # ========== VALIDAÇÕES ==========
    class Meta:
        verbose_name = "Calendário Acadêmico"
        verbose_name_plural = "Calendários Acadêmicos"
        ordering = ['-codigo']
        unique_together = ('formulario', 'codigo')

    def clean(self):
        """Validações lógicas"""
        # 1. Datas
        if self.data_fim < self.data_inicio:
            raise ValidationError("A data final não pode ser anterior à data inicial.")
        
        # 2. Evitar sobreposição de prazos ativos
        if self.ativo:
            conflitos = CalendarioAcademico.objects.filter(
                formulario=self.formulario,
                codigo=self.codigo,
                ativo=True
            ).exclude(pk=self.pk)
            
            if conflitos.exists():
                raise ValidationError("Já existe um prazo ativo para este formulário e código.")

    def save(self, *args, **kwargs):
        """Garante validações antes de salvar"""
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def esta_ativo(self):
        """Verifica se o prazo está vigente (data atual + ativo=True)"""
        hoje = timezone.now().date()
        return self.ativo and (self.data_inicio <= hoje <= self.data_fim)

    def __str__(self):
        return f"{self.get_formulario_display()} ({self.codigo})"