from ..solicitacao import Solicitacao
from django.db import models
from django.core.validators import MinLengthValidator
from datetime import date, time
from django.core.exceptions import ValidationError

class FormInterpreteLibras(Solicitacao):
    FINALIDADE_CHOICES = [
        ("ATENDIMENTOPROF", "Atendimento com professor da disciplina"),
        ("EXTRACLASSE", "Atividade extra classe"),
        ("APOIO", "Apoio do intérprete educacional"),
        ("ATENDIMENTOENSINO", "Atendimento com ensino (Orientação educacional/Assistência Estudantil/Registros escolares/Gestão escolar)")
    ]

    finalidade = models.CharField(max_length=100, choices=FINALIDADE_CHOICES)
    professor = models.CharField(max_length=100, verbose_name="Professor(a)", blank=True, null=True, validators=[MinLengthValidator(3)])
    disciplina = models.CharField(max_length=100, verbose_name="Disciplina", blank=True, null=True, validators=[MinLengthValidator(5)])
    data = models.DateField(default=date.today(), verbose_name="Data")
    horario_inicio = models.TimeField(verbose_name="Horário de início")
    horario_termino = models.TimeField(verbose_name="Horário de término")
    local_sala_campus = models.CharField(max_length=30, validators=[MinLengthValidator(2)], verbose_name="Local/Sala do Campus")

    def __str__ (self):
        return f"{self.aluno.usuario.nome} - Solicitação de Intérprete de Libras"

    def save(self):
        if self.horario_termino < self.horario_inicio:
            raise ValidationError("O horário de término não pode ser anterior ao de início.")
        if self.horario_inicio > time(22, 30) or self.horario_inicio < time(7, 30):
            raise ValidationError("O horário de início não pode ser fora do intervalo do atendimento do campus (das 07h30 às 22h30).")
        if self.horario_termino > time(22, 30) or self.horario_termino < time(7, 30):
            raise ValidationError("O horário de término não pode ser fora do intervalo do atendimento do campus (das 07h30 às 22h30).")
        if self.data <= date.today():
            raise ValidationError("A data da solicitação só pode ser no futuro.")