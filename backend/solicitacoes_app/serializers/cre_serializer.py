from rest_framework import serializers
from ..models import CRE, Usuario
from .usuario_serializer import UsuarioSerializer, UsuarioWriteSerializer

class CRESerializer(serializers.ModelSerializer):
    
    depth = 1

    class Meta:
        model = CRE
        fields = ['usuario', 'siape']
        
        
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')

        # Cria ou recupera o usuário
        usuario = Usuario.objects.get(id=usuario_data.id)

        # Cria a CRE com o Usuario existente
        return CRE.objects.create(usuario=usuario, **validated_data)

    def validate(self, data):
        # Executa as validações do model
        instance = self.instance or self.Meta.model(**data)
        instance.full_clean() 
        return data
    
##########################################


class CREReadSerializer(serializers.ModelSerializer):
    """
    Serializer para leitura de Aluno, incluindo dados do usuário.
    """
    # Inclui todos os dados do usuário de forma aninhada
    usuario = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = CRE
        fields = ['usuario', 'id', 'siape']
        read_only_fields = fields


class CREWriteSerializer(serializers.ModelSerializer):
    usuario = UsuarioWriteSerializer()

    class Meta:
        model = CRE
        fields = ['usuario', 'siape']

    def validate_siape(self, value):
        cre_id = self.instance.id if self.instance else None

        if cre_id and CRE.objects.get(id=cre_id).siape == value:
            return value

        if CRE.objects.filter(siape=value).exists():
            raise serializers.ValidationError("Este SIAPE já está em uso.")
        return value

    def validate(self, data):
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


