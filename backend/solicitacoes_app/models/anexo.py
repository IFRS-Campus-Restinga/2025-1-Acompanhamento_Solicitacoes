from .form_dispensa_ed_fisica import FormDispensaEdFisica
from django.db import models

class Anexo(models.Model):
    anexo = models.FileField(upload_to="anexos/")
    form_dispensa_ed_fisica = models.ForeignKey(FormDispensaEdFisica, on_delete=models.CASCADE, related_name="anexos")