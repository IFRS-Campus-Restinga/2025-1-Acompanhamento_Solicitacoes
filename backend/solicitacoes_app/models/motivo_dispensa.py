from .base import BaseModel
from django.db.models import CharField
from django.core.validators import MinLengthValidator

class MotivoDispensa(BaseModel):
    descricao = CharField(max_length=200, validators=[MinLengthValidator(9)], help_text="Digite o motivo da dispensa", verbose_name="Descrição")

    def __str__(self):
        return self.descricao