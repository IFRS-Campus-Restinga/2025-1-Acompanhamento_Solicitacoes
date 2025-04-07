from rest_framework import serializers
from .usuario_serializer import UsuarioSerializer
from ..models import Coordenador, Curso


class CoordenadorSerializer(serializers.ModelSerializer):
    
    usuario = UsuarioSerializer()
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())

    class Meta:
        model = Coordenador
        fields = ['id', 'usuario', 'siape', 'inicio_mandato', 'fim_mandato', 'curso']

    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        usuario, created = Usuario.objects.get_or_create(
            cpf=usuario_data['cpf'],
            defaults=usuario_data
        )
        if not created:
            for attr, value in usuario_data.items():
                setattr(usuario, attr, value)
            usuario.save()

        return Coordenador.objects.create(usuario=usuario, **validated_data)