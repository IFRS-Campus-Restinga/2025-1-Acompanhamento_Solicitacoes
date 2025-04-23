from django.contrib.auth.models import BaseUserManager
from ..models.status_usuario import StatusUsuario


class UsuarioManager(BaseUserManager):
    def create_user(self, email, nome=None, cpf=None, telefone=None, data_nascimento=None, password=None):
        if not email:
            raise ValueError("O usuário deve ter um email válido")

        email = self.normalize_email(email)
        usuario = self.model(
            email=email,
            nome=nome,
            cpf=cpf,
            telefone=telefone,
            data_nascimento=data_nascimento,
        )
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, nome, cpf, telefone, data_nascimento, password):
        usuario = self.create_user(email, nome, cpf, telefone, data_nascimento, password)
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.save(using=self._db)
        return usuario
    
    def get_queryset(self):
        return super().get_queryset().filter(
            is_active=True,
            status_usuario__in=[
                StatusUsuario.ATIVO,
                StatusUsuario.EM_ANALISE
            ]
        )