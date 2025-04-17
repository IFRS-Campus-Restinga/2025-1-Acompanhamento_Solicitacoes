from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from django.forms import ValidationError
from ..managers.usuario_manager import UsuarioManager
import re
from datetime import date


class Usuario(AbstractBaseUser, PermissionsMixin):
    nome = models.CharField(max_length=100, help_text="Escreva aqui o nome", verbose_name="Nome:")
    email = models.EmailField(
        unique=True,
        help_text="Escreva aqui o email",
        verbose_name="Email:",
        validators=[EmailValidator()],
    )
    cpf = models.CharField(
        max_length=11,
        unique=True,
        help_text="Escreva aqui o CPF",
        verbose_name="CPF:",
    )
    telefone = models.CharField(
        max_length=11,
        validators=[
            RegexValidator(regex=r'^\d{10,11}$', message="O telefone deve conter 10 ou 11 dígitos numéricos.")
        ],
        help_text="Escreva aqui o telefone",
        verbose_name="Telefone:",
    )
    data_nascimento = models.DateField(help_text="Escreva aqui a data de nascimento", verbose_name="Data nascimento:")
    
   
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False) #os usuários não terão acesso ao django-admin
    

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome', 'cpf', 'telefone', 'data_nascimento']
        
        
    def clean(self):
        # --- Validação do CPF ---
        cpf = re.sub(r'[^0-9]', '', self.cpf)
        if len(cpf) != 11 or cpf in (str(i) * 11 for i in range(10)):
            raise ValidationError({'cpf': ("CPF inválido. O CPF deve conter 11 caracteres")})

        def calcula_digito(cpf, pesos):
            soma = sum(int(cpf[i]) * pesos[i] for i in range(len(pesos)))
            resto = (soma * 10) % 11
            return str(resto if resto < 10 else 0)

        if (
            calcula_digito(cpf, range(10, 1, -1)) != cpf[9] or
            calcula_digito(cpf, range(11, 1, -1)) != cpf[10]
        ):
            raise ValidationError({'cpf': ("CPF inválido.")})

        # --- Validação da idade ---
        if self.data_nascimento:
            hoje = date.today()
            idade = hoje.year - self.data_nascimento.year - (
                (hoje.month, hoje.day) < (self.data_nascimento.month, self.data_nascimento.day)
            )
            if idade < 14:
                raise ValidationError({'data_nascimento': ("O usuário deve ter pelo menos 14 anos de idade.")})
      
            
    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
    
    def save(self, **kwargs):
        if self.password is None or self.password == "":
            self.password = "Teste123"
        super().save(**kwargs)
        
        