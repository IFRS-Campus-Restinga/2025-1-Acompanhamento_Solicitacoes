from rest_framework import serializers
from ..models import Aluno, Usuario, Ppc
from .usuario_serializer import *
from .ppc_serializer import *
import datetime


class AlunoSerializerAntigo(serializers.ModelSerializer):
    ppc = PpcSerializer(read_only=True)
    depth=1
    usuario = UsuarioSerializerComPapeis(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
       source='usuario', queryset=Usuario.objects.all(), write_only=True
    )

    class Meta:
        model = Aluno
        fields = '__all__'
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        # Cria ou recupera o usuário
        usuario = Usuario.objects.get(id=usuario_data.id)
        # Cria o Aluno com o Usuario existente
        return Aluno.objects.create(usuario=usuario, **validated_data)
    
    def validate(self, data):
        if not data.get('ppc'):
            raise serializers.ValidationError({"ppc": "Um PPC deve ser selecionado."})
        return data


class AlunoSerializer(serializers.ModelSerializer):

    """
    Serializer para o modelo Aluno.
    """
    usuario = UsuarioSerializer()
    
    class Meta:
        model = Aluno
        fields = ['id', 'usuario', 'matricula', 'ppc', 'ano_ingresso']
        read_only_fields = ['id']
    
    def validate_matricula(self, value):
        """
        Valida se a matrícula é única, considerando o contexto de atualização.
        """
        instance = getattr(self, 'instance', None)
        if instance and instance.matricula == value:
            # Se estamos atualizando e a matrícula não mudou, é válida
            return value
            
        if Aluno.objects.filter(matricula=value).exists():
            raise serializers.ValidationError("Esta matrícula já está em uso.")
        return value
    
    def validate_ano_ingresso(self, value):
        """
        Valida se o ano de ingresso é válido.
        """
        
        current_year = datetime.datetime.now().year
        
        if value < 2000 or value > current_year + 1:  # Permite o próximo ano para matrículas antecipadas
            raise serializers.ValidationError(
                f"O ano de ingresso deve estar entre 2000 e {current_year + 1}."
            )
        return value
    

class AlunoReadSerializer(serializers.ModelSerializer):
    """
    Serializer para leitura de Aluno, incluindo dados do usuário.
    """
    # Inclui todos os dados do usuário de forma aninhada
    usuario = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = Aluno
        fields = ['usuario', 'id', 'matricula', 'ppc', 'ano_ingresso', ]
        read_only_fields = fields


class AlunoWriteSerializer(serializers.ModelSerializer):
    usuario = UsuarioWriteSerializer()

    class Meta:
        model = Aluno
        fields = ['usuario', 'matricula', 'ano_ingresso', 'ppc']

    def validate_matricula(self, value):
        aluno_id = self.instance.id if self.instance else None

        if aluno_id and Aluno.objects.get(id=aluno_id).matricula == value:
            return value

        if Aluno.objects.filter(matricula=value).exists():
            raise serializers.ValidationError("Esta matrícula já está em uso.")
        return value

    def validate_ano_ingresso(self, value):
        current_year = datetime.datetime.now().year
        if value < 2000 or value > current_year + 1:
            raise serializers.ValidationError(
                f"O ano de ingresso deve estar entre 2000 e {current_year + 1}."
            )
        return value

    def validate(self, data):
        if not data.get('ppc'):
            raise serializers.ValidationError({"ppc": "Um PPC deve ser selecionado."})
        return data

    def update(self, instance, validated_data):
        usuario_data = validated_data.pop('usuario', None)
        if usuario_data:
            usuario_serializer = UsuarioWriteSerializer(
                instance=instance.usuario,
                data=usuario_data,
                partial=True  # Allows partial updates; adjust if needed
            )
            usuario_serializer.is_valid(raise_exception=True)
            usuario_serializer.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    
    
    
    
    
    
    