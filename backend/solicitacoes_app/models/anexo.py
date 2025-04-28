from .form_dispensa_ed_fisica import FormDispensaEdFisica
from django.db import models
from .form_abono_falta import FormAbonoFalta
from .base import BaseModel

class Anexo(BaseModel):
    anexo = models.FileField(verbose_name="Anexo(s)", max_length=4096, upload_to="docs/")
    form_dispensa_ed_fisica = models.ForeignKey(
        FormDispensaEdFisica, 
        on_delete=models.CASCADE, 
        related_name="anexos", 
        verbose_name="Form")

    form_abono_falta = models.ForeignKey(
        FormAbonoFalta, 
        on_delete=models.CASCADE, 
        related_name="abonos_anexos"
    )
