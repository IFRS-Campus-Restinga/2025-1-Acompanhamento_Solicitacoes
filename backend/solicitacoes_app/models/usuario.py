from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from django.forms import ValidationError
from ..models.status_usuario import StatusUsuario
from ..managers.usuario_manager import UsuarioManager
from .validators import *
from django.apps import apps


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
        null=True,  
        blank=True,
    )
    telefone = models.CharField(
        max_length=11,
        validators=[
            RegexValidator(regex=r'^\d{10,11}$', message="O telefone deve conter 10 ou 11 dígitos numéricos.")
        ],
        help_text="Escreva aqui o telefone",
        verbose_name="Telefone:",
        null=True,  
        blank=True,
    )
    data_nascimento = models.DateField(
        help_text="Escreva aqui a data de nascimento", 
        verbose_name="Data nascimento:",
        validators=[validar_idade],
        null=True,  
        blank=True,
    )
    
    status_usuario = models.CharField( 
        max_length=20, 
        choices=StatusUsuario.choices,
        blank=False,
        null=False,
        default=StatusUsuario.ATIVO,
        verbose_name="Status do Usuario"
    )
   
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False) #os usuários não terão acesso ao django-admin
    

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome', 'cpf', 'telefone', 'data_nascimento']
    
    
    def delete(self, using=None, keep_parents=False):
        """
        Se o usuário tiver registros associados em qualquer um dos modelos 
        (mesmo que não estejam ativos no momento), realiza deleção lógica.
        Caso contrário, exclui definitivamente.
        """
        Aluno = apps.get_model('solicitacoes_app', 'Aluno')
        Coordenador = apps.get_model('solicitacoes_app', 'Coordenador')
        CRE = apps.get_model('solicitacoes_app', 'CRE')
        Responsavel = apps.get_model('solicitacoes_app', 'Responsavel')

        tem_vinculo = (
            Aluno.objects.filter(usuario=self).exists() or
            Coordenador.objects.filter(usuario=self).exists() or
            CRE.objects.filter(usuario=self).exists() or
            Responsavel.objects.filter(usuario=self).exists()
        )

        if tem_vinculo: #se Usuario em status_usuario = NOVO ou EM_ANALISE ou sem vinculo - permite deleção física
            if self.status_usuario == StatusUsuario.NOVO or self.status_usuario == StatusUsuario.EM_ANALISE:
                super().delete(using=using, keep_parents=keep_parents)
            else:
                self.status_usuario = StatusUsuario.INATIVO
                self.is_active = False  # Desativa autenticação no sistema
                self.save()            
        else:
            super().delete(using=using, keep_parents=keep_parents)
        
        
    def clean(self):
       if not isinstance(self.nome, str):
            raise ValidationError({"nome": "Nome informado é do tipo errado"}, code="error001")
            
    def __str__(self):
        return self.nome
    
    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
    
    def save(self, **kwargs): 
             
        if self.password is None or self.password == "":
            self.password = "Teste123"        
        if not self.pk:
            self.status_usuario = StatusUsuario.NOVO

        super().save(**kwargs)
        