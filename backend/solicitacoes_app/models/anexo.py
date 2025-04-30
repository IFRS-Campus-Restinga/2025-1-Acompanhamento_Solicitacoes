from django.forms import ValidationError
from .form_dispensa_ed_fisica import FormDispensaEdFisica
from django.db import models
from .form_abono_falta import FormAbonoFalta
from .forms.form_exercicio_domiciliar import FormExercicioDomiciliar
from .forms.form_desistencia_vaga import FormDesistenciaVaga
from .base import BaseModel

class Anexo(BaseModel):
    anexo = models.FileField(verbose_name="Anexo(s)", max_length=4096, upload_to="docs/")
    form_dispensa_ed_fisica = models.ForeignKey(
        FormDispensaEdFisica,
        on_delete=models.CASCADE,
        related_name="anexos",
        null=True,
        blank=True
    )
    form_abono_falta = models.ForeignKey(
        FormAbonoFalta,
        on_delete=models.CASCADE,
        related_name="abonos_anexos",
        null=True,
        blank=True
    )
    form_exercicos_domiciliares = models.ForeignKey(
        FormExercicioDomiciliar,
        on_delete=models.CASCADE,
        related_name="exercicios_anexos",
        null=True,
        blank=True
    )

    form_desistencia_vaga = models.ForeignKey(
        FormDesistenciaVaga,
        on_delete=models.CASCADE,
        related_name="desistencia_anexos",
        null=True,
        blank=True
    )


    def clean(self):
        linked_forms = [
            self.form_dispensa_ed_fisica,
            self.form_abono_falta,
            self.form_exercicos_domiciliares,
            self.form_desistencia_vaga
        ]
        if sum(bool(form) for form in linked_forms) != 1:
            raise ValidationError("O anexo deve estar vinculado a apenas um formulário.")

    
    

