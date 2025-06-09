from rest_framework import serializers
from ..models import Responsavel, Usuario, Aluno, StatusUsuario
from django.contrib.auth.models import Group
from django.db import transaction

# Certifique-se de que este import está correto e o UsuarioWriteSerializer está funcionando.
from ..serializers.usuario_serializer import UsuarioWriteSerializer


class ResponsavelListSerializer(serializers.ModelSerializer):
    depth = 1 

    class Meta:
        model = Responsavel
        fields = ['id', 'usuario', 'aluno']


class ResponsavelCreateUpdateSerializer(serializers.ModelSerializer):
    usuario = UsuarioWriteSerializer(required=False)
    usuario_id = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all(), write_only=True, required=False)
    aluno_cpf = serializers.CharField(write_only=True, max_length=14)
    
    class Meta:
        model = Responsavel
        fields = ['usuario', 'usuario_id', 'aluno_cpf']

    def validate_aluno_cpf(self, value):
        aluno_cpf_limpo = ''.join(filter(str.isdigit, value))
        try:
            aluno_usuario = Usuario.objects.get(cpf=aluno_cpf_limpo, aluno__isnull=False)
            self.aluno_instance = aluno_usuario.aluno
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Aluno com o CPF fornecido não encontrado.")
        except Exception as e:
            raise serializers.ValidationError(f"Erro ao validar CPF do aluno: {e}")
        return value

    def validate(self, data):
        if 'usuario' not in data and 'usuario_id' not in data:
            raise serializers.ValidationError("É necessário fornecer 'usuario' (para criar) ou 'usuario_id' (para vincular a um usuário existente).")
        
        if 'usuario' in data and 'usuario_id' in data:
            raise serializers.ValidationError("Forneça apenas 'usuario' OU 'usuario_id', não ambos.")
        
        if 'usuario' in data:
            usuario_data = data.pop('usuario')
            usuario_serializer = UsuarioWriteSerializer(data=usuario_data)
            usuario_serializer.is_valid(raise_exception=True) 
            
            data['usuario_validated_data'] = usuario_serializer.validated_data 
        
        return data

    @transaction.atomic
    def create(self, validated_data):
        usuario_instance = None
        aluno_instance = self.aluno_instance

        print(f"DEBUG NO CREATE: validated_data ao iniciar create: {validated_data}")
        print(f"DEBUG NO CREATE: self.aluno_instance: {self.aluno_instance}")
        print(f"DEBUG NO CREATE: 'usuario_validated_data' existe em validated_data? {'usuario_validated_data' in validated_data}")
        print(f"DEBUG NO CREATE: usuario_id existe em validated_data? {'usuario_id' in validated_data}")

        # Lógica para criar ou vincular o usuário base
        if 'usuario_validated_data' in validated_data:
            usuario_data = validated_data.pop('usuario_validated_data')
            
            # Remove campos que são do frontend/UsuarioWriteSerializer, não do modelo Usuario
            usuario_data.pop('is_responsavel', None) 
            usuario_data.pop('aluno_cpf', None) 
            
            password = usuario_data.pop('password', None)
            
            print(f"DEBUG NO CREATE: Tentando criar novo usuário com dados: {usuario_data}")

            if password:
                usuario_instance = Usuario.objects.create_user(**usuario_data, password=password)
            else:
                usuario_instance = Usuario.objects.create(**usuario_data)
                usuario_instance.set_password("Teste123")
                usuario_instance.save(update_fields=['password'])
            
            print(f"DEBUG NO CREATE: Usuário criado: {usuario_instance.email}")

            # --- REMOVIDAS ESTAS LINHAS: O USUARIO DEVE MANTER O STATUS PADRÃO APÓS A PRIMEIRA CRIAÇÃO ---
            # usuario_instance.status_usuario = StatusUsuario.EM_ANALISE
            # usuario_instance.is_active = False
            # usuario_instance.save(update_fields=['status_usuario', 'is_active'])

        elif 'usuario_id' in validated_data:
            usuario_instance = validated_data['usuario_id']
            print(f"DEBUG NO CREATE: Vinculando a usuário existente com ID: {usuario_instance.id}")
            
            # --- REMOVIDAS ESTAS LINHAS: O USUARIO DEVE MANTER O STATUS PADRÃO APÓS A PRIMEIRA CRIAÇÃO ---
            # usuario_instance.status_usuario = StatusUsuario.EM_ANALISE
            # usuario_instance.is_active = False
            # usuario_instance.save(update_fields=['status_usuario', 'is_active'])
            
            if hasattr(usuario_instance, 'aluno') and usuario_instance.aluno is not None:
                raise serializers.ValidationError("O usuário já é um aluno. Um usuário não pode ter múltiplos papéis (responsável e aluno).")

        print(f"DEBUG NO CREATE: usuario_instance antes da verificação final: {usuario_instance}")
        if not usuario_instance:
            print("DEBUG NO CREATE: usuario_instance é None! Levantando erro.")
            raise serializers.ValidationError("Não foi possível criar ou encontrar o usuário para o responsável.")

        responsavel = Responsavel.objects.create(usuario=usuario_instance, aluno=aluno_instance)
        print(f"DEBUG NO CREATE: Responsável criado: {responsavel.id}")

        try:
            grupo_responsavel = Group.objects.get(name='responsavel')
            usuario_instance.groups.add(grupo_responsavel)
            print(f"Usuário {usuario_instance.email} adicionado ao grupo 'responsavel'.")
        except Group.DoesNotExist:
            print("ERRO: Grupo 'responsavel' não encontrado. Não foi possível associar o usuário.")

        return responsavel

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

