from .base import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from .periodo_disciplina import PeriodoDisciplina

class Curso(BaseModel):
    class TipoPeriodo(models.TextChoices):
        ANUAL = "Anual", "Anual"
        SEMESTRAL = "Semestral", "Semestral"

    class TipoCurso(models.TextChoices):
        EMI = "Ensino Médio Integral", "Ensino Médio Integral"
        SUBS = "Subsequente", "Subsequente"    
        CONC = "Concomitante", "Concomitante"
        SUCON = "Subsequente/Concomitante", "Subsequente/Concomitante"
        SUP = "Superior", "Superior"  
        
    nome = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(6)]  
    )
    
    codigo = models.CharField(
        primary_key=True,
        max_length=50,
        validators=[MinLengthValidator(3)] 
    )
    
    tipo_periodo = models.CharField(
        max_length=10,
        choices=TipoPeriodo.choices,
        default=TipoPeriodo.SEMESTRAL,
    )

    tipo_curso = models.CharField(
        max_length=24,
        choices=TipoCurso.choices,
        default=TipoCurso.SUP,
    )
    
    def __str__(self):
        return self.nome