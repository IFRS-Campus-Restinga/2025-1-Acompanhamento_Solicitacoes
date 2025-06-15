from rest_framework import serializers
from ..models import Responsavel, Usuario, Aluno, StatusUsuario
from django.contrib.auth.models import Group
from django.db import transaction

from ..serializers.usuario_serializer import UsuarioWriteSerializer, UsuarioSerializer 

class ResponsavelListSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True) 
    aluno = serializers.SerializerMethodField()
    
    class Meta:
        model = Responsavel
        fields = ['id', 'usuario', 'aluno']
        depth = 1 

    def get_aluno(self, obj):
        if obj.aluno and obj.aluno.usuario:
            return {'nome': obj.aluno.usuario.nome, 'cpf': obj.aluno.usuario.cpf}
        return None

class ResponsavelCreateUpdateSerializer(serializers.ModelSerializer):
    usuario = UsuarioWriteSerializer(required=True) 
    aluno_cpf = serializers.CharField(write_only=True, max_length=14)
    
    class Meta:
        model = Responsavel
        fields = ['usuario', 'aluno_cpf'] 

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
        usuario_serializer = UsuarioWriteSerializer(data=data['usuario'])
        usuario_serializer.is_valid(raise_exception=True)
        data['usuario_validated_data'] = usuario_serializer.validated_data 
        
        return data

    @transaction.atomic
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario_validated_data')
        aluno_instance = self.aluno_instance

        usuario_data.pop('is_responsavel', None) 
        usuario_data.pop('aluno_cpf', None) 
        
        # --- ALTERAÇÃO AQUI ---
        # Removendo a senha padrão e deixando a criação do usuário mais flexível.
        # Se você precisa que uma senha seja definida automaticamente, 
        # use usuario.set_password("suasenha") e usuario.save()
        password = usuario_data.pop('password', None)
        
        # Definir is_active e status_usuario para que apareça na lista principal
        usuario_data['is_active'] = True
        usuario_data['status_usuario'] = StatusUsuario.ATIVO # Ou o status inicial que o coordenador tem

        if password:
            usuario_instance = Usuario.objects.create_user(**usuario_data, password=password)
        else:
            usuario_instance = Usuario.objects.create(**usuario_data)
            # ATENÇÃO: Se não houver password no frontend, este usuário NÃO TERÁ SENHA!
            # Considere definir uma senha aleatória aqui ou exigir no frontend.
            # Ex: usuario_instance.set_password(Usuario.objects.make_random_password())
            # usuario_instance.save(update_fields=['password'])
        
        responsavel = Responsavel.objects.create(usuario=usuario_instance, aluno=aluno_instance)
        
        try:
            grupo_responsavel = Group.objects.get(name='responsavel')
            usuario_instance.groups.add(grupo_responsavel)
        except Group.DoesNotExist:
            print("ERRO: Grupo 'responsavel' não encontrado. Não foi possível associar o usuário.")

        return responsavel

    def update(self, instance, validated_data):
        usuario_data = validated_data.pop('usuario', {})
        if usuario_data:
            usuario_serializer = UsuarioWriteSerializer(instance.usuario, data=usuario_data, partial=True)
            usuario_serializer.is_valid(raise_exception=True)
            usuario_serializer.save()

        # Adicione lógica para atualizar o aluno do responsável se o aluno_cpf for enviado
        aluno_cpf_from_data = validated_data.get('aluno_cpf')
        if aluno_cpf_from_data:
            aluno_cpf_limpo = ''.join(filter(str.isdigit, aluno_cpf_from_data))
            try:
                aluno_usuario = Usuario.objects.get(cpf=aluno_cpf_limpo, aluno__isnull=False)
                instance.aluno = aluno_usuario.aluno
                instance.save(update_fields=['aluno'])
            except Usuario.DoesNotExist:
                raise serializers.ValidationError({"aluno_cpf": "Aluno com o CPF fornecido não encontrado para atualização."})
            except Exception as e:
                raise serializers.ValidationError({"aluno_cpf": f"Erro ao atualizar CPF do aluno: {e}"})

        return super().update(instance, validated_data)

