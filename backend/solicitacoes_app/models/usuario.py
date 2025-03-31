from .base import BaseModel
from django.db import models
from django.core.validators import RegexValidator

class Usuario(BaseModel):
    nome = models.CharField(
        max_length=100,
        help_text="Escreva aqui o nome",
        verbose_name="Nome:"
    )
    email = models.EmailField(
        unique=True,
        help_text="Escreva aqui o email",
        verbose_name="Email:"
    )
    cpf = models.CharField(
        max_length=11, 
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\d{11}$',
                message="O CPF deve conter exatamente 11 dígitos numéricos."
            )
        ],
        help_text="Escreva aqui o CPF",
        verbose_name="CPF:"
    )
    telefone = models.CharField(
        max_length=11,
        validators=[
            RegexValidator(
                regex=r'^\d{10,11}$',
                message="O telefone deve conter 10 ou 11 dígitos numéricos."
            )
        ],
        help_text="Escreva aqui o telefone",
        verbose_name="Telefone:"
    )
    data_nascimento = models.DateField(
        help_text="Escreva aqui a data de nascimento",
        verbose_name="Data nascimento:"
    )


    class Meta:
        abstract = True