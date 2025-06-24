from rest_framework import serializers
from ..models import Responsavel, Usuario
from django.db import transaction
from ..serializers.usuario_serializer import UsuarioWriteSerializer, UsuarioSerializer 


class ResponsavelReadSerializer(serializers.ModelSerializer):
    
    usuario = UsuarioSerializer(read_only=True) 
    aluno = serializers.SerializerMethodField()
    
    class Meta:
        model = Responsavel
        fields = ['usuario', 'id', 'aluno']
        read_only_fields = fields 

    def get_aluno(self, obj):
        if obj.aluno and obj.aluno.usuario:
            return {'nome': obj.aluno.usuario.nome, 'cpf': obj.aluno.usuario.cpf}
        return None


class ResponsavelWriteSerializer(serializers.ModelSerializer):
    
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
    
    
    @transaction.atomic # Garante que a criação do Usuário e Responsável ocorra atomicamente
    def create(self, validated_data):
        """
        Cria um novo Usuario e um Responsavel a partir dos dados validados.
        """
        usuario_data = validated_data.pop('usuario') # Extrai os dados do usuário
        aluno_instance = self.aluno_instance # Obtém a instância do Aluno validada pelo validate_aluno_cpf

        # Cria o usuário usando o UsuarioWriteSerializer
        usuario_serializer = UsuarioWriteSerializer(data=usuario_data)
        usuario_serializer.is_valid(raise_exception=True) 
        usuario = usuario_serializer.save() 

        # Cria a instância do Responsavel associando o usuário e o aluno
        responsavel = Responsavel.objects.create(usuario=usuario, aluno=aluno_instance)
        return responsavel

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Atualiza uma instância existente de Responsavel.
        """
        usuario_data = validated_data.pop('usuario', {}) 
        if usuario_data:
            usuario_serializer = UsuarioWriteSerializer(instance.usuario, data=usuario_data, partial=True)
            usuario_serializer.is_valid(raise_exception=True)
            usuario_serializer.save()

        aluno_cpf_from_data = validated_data.get('aluno_cpf') 
        if aluno_cpf_from_data:
            aluno_cpf_limpo = ''.join(filter(str.isdigit, aluno_cpf_from_data))
            try:
                # Encontra o Aluno pelo novo CPF
                aluno_usuario = Usuario.objects.get(cpf=aluno_cpf_limpo, aluno__isnull=False)
                new_aluno_instance = aluno_usuario.aluno

                # Se o novo aluno for diferente do aluno atualmente associado a este Responsavel
                if instance.aluno != new_aluno_instance:
                    # Verifica se o NOVO aluno já possui um responsável associado
                    if Responsavel.objects.filter(aluno=new_aluno_instance).exclude(pk=instance.pk).exists():
                        raise serializers.ValidationError({"aluno_cpf": "O novo aluno já possui um responsável cadastrado."})

                    # Atribui o novo aluno à instância do Responsavel
                    instance.aluno = new_aluno_instance
                    instance.save(update_fields=['aluno']) 

            except Usuario.DoesNotExist:
                raise serializers.ValidationError({"aluno_cpf": "Aluno com o CPF fornecido não encontrado para atualização."})
            except Exception as e:
                raise serializers.ValidationError({"aluno_cpf": f"Erro ao atualizar CPF do aluno: {e}"})

        return super().update(instance, validated_data)

