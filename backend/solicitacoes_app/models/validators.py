from datetime import date
import re
from django.core.exceptions import ValidationError

def validar_cpf(cpf):
    cpf = re.sub(r'[^0-9]', '', cpf)  # remove qualquer caractere que não seja número
    if len(cpf) != 11 or cpf in (str(i) * 11 for i in range(10)):
        raise ValidationError("CPF inválido. O CPF deve conter 11 dígitos válidos.")

    def calcula_digito(cpf, pesos):
        soma = sum(int(cpf[i]) * pesos[i] for i in range(len(pesos)))
        resto = (soma * 10) % 11
        return str(resto if resto < 10 else 0)

    if (
        calcula_digito(cpf, range(10, 1, -1)) != cpf[9] or
        calcula_digito(cpf, range(11, 1, -1)) != cpf[10]
    ):
        raise ValidationError("CPF inválido.")

def validar_idade(data_nascimento):
    hoje = date.today()
    idade = hoje.year - data_nascimento.year - (
        (hoje.month, hoje.day) < (data_nascimento.month, data_nascimento.day)
    )
    if idade < 14:
        raise ValidationError("O usuário deve ter pelo menos 14 anos de idade.")
