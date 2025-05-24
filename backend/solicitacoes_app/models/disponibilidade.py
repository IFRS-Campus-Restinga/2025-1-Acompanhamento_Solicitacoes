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

    sempre_disponivel = models.BooleanField(  
        default=True,
        verbose_name="Sempre disponível?"  
    )  

    data_inicio = models.DateField(  
        null=True,  
        blank=True,
        verbose_name="Data de início"  
    )  

    data_fim = models.DateField(  
        null=True,  
        blank=True,
        verbose_name="Data de término"  
    )  

    ativo = models.BooleanField(  
        default=True,
        verbose_name="Registro ativo?"  
    )  

    def clean(self):  
        if not self.sempre_disponivel and (not self.data_inicio or not self.data_fim):  
            raise ValidationError("Defina datas se o formulário não for sempre disponível.")  
        if self.data_fim and self.data_inicio and self.data_fim < self.data_inicio:  
            raise ValidationError("Data final não pode ser anterior à inicial.")  

    @property  
    def esta_ativo(self):  
        if self.sempre_disponivel:  
            return True  
        hoje = timezone.now().date()  
        return self.ativo and (self.data_inicio <= hoje <= self.data_fim)  

    def __str__(self):  
        return f"{self.get_formulario_display()} | {'Sempre disponível' if self.sempre_disponivel else f'De {self.data_inicio} a {self.data_fim}'}"