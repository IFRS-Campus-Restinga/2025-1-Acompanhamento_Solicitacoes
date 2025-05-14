from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models, transaction
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
        default=StatusUsuario.NOVO,
        verbose_name="Status do Usuario"
    )
    
    is_active = models.BooleanField(default=True) 
    is_staff = models.BooleanField(default=False)
    
    objects = UsuarioManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome']

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        # Regra: Ao criar usuario, recebe o STATUSUSUARIO = NOVO e is_active=True
        if not self.pk: # Somente na criação
            self.status_usuario = StatusUsuario.NOVO
            self.is_active = True # Garante que is_active seja True na criação
        if self.password is None or self.password == "":
            self.password = "Teste123"   
        super().save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        # Regra: Usuários com STATUSUSUARIO NOVO ou EM_ANALISE podem ser deletados fisicamente.
        if self.status_usuario == StatusUsuario.NOVO or self.status_usuario == StatusUsuario.EM_ANALISE:
            # Para deletar fisicamente, precisamos deletar os papéis associados PRIMEIRO
            # devido ao on_delete=models.PROTECT nos modelos de papéis.
            with transaction.atomic():
                # Tenta deletar papéis associados. Usar hasattr para verificar se a relação existe e não falhar.
                if hasattr(self, 'aluno') and self.aluno:
                    self.aluno.delete() # O delete do Aluno não deve tentar deletar o Usuario de volta
                if hasattr(self, 'coordenador') and self.coordenador:
                    self.coordenador.delete()
                if hasattr(self, 'cre') and self.cre:
                    self.cre.delete()
                if hasattr(self, 'responsavel') and self.responsavel:
                    self.responsavel.delete()
                
                # Após remover os vínculos que causam PROTECT, deleta o usuário fisicamente.
                super().delete(using=using, keep_parents=keep_parents)
                return # Importante para sair após a deleção física

        # Regra: Usuários com STATUSUSUARIO ATIVO, ao serem deletados, passam para STATUSUSUARIO INATIVO e is_active=False.
        # (Isso também se aplicará a outros status não cobertos pela deleção física, como INATIVO já)
        self.status_usuario = StatusUsuario.INATIVO
        self.is_active = False
        self.save() # Salva as alterações para realizar a deleção lógica.
        # Não chama super().delete() aqui para deleção lógica.

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"