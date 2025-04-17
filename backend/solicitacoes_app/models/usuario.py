from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from django.forms import ValidationError
from ..managers.usuario_manager import UsuarioManager
from .validators import *


class Usuario(AbstractBaseUser, PermissionsMixin):
    nome = models.CharField(
        max_length=100, 
        help_text="Escreva aqui o nome", 
        verbose_name="Nome:"
    )
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
        validators=[validar_cpf],
    )
    telefone = models.CharField(
        max_length=11,
        validators=[
            RegexValidator(regex=r'^\d{10,11}$', message="O telefone deve conter 10 ou 11 dígitos numéricos.")
        ],
        help_text="Escreva aqui o telefone",
        verbose_name="Telefone:",
    )
    data_nascimento = models.DateField(
        help_text="Escreva aqui a data de nascimento", 
        verbose_name="Data nascimento:",
        validators=[validar_idade]
    )
    
   
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False) #os usuários não terão acesso ao django-admin
    

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome', 'cpf', 'telefone', 'data_nascimento']
        
        
    def clean(self):
       if not isinstance(str(self.nome), str):
            raise ValidationError({"nome": "Nome informado é do tipo errado"}, code="error001")
            
    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
    
    def save(self, **kwargs):
        if self.password is None or self.password == "":
            self.password = "Teste123"
        super().save(**kwargs)
        
        