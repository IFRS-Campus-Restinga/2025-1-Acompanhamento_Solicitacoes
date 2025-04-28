from .form_dispensa_ed_fisica import FormDispensaEdFisica
from django.db import models
from .form_abono_falta import FormAbonoFalta

class Anexo(models.Model):
    anexo = models.FileField(upload_to="anexos/")
    form_dispensa_ed_fisica = models.ForeignKey(FormDispensaEdFisica, on_delete=models.CASCADE, related_name="anexos")

    form_abono_falta = models.ForeignKey(
        FormAbonoFalta, 
        on_delete=models.CASCADE, 
        related_name="abonos_anexos"
    )