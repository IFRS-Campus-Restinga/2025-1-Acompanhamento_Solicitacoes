from rest_framework import serializers
from ..models import Coordenador, Curso, Usuario


class CoordenadorSerializer(serializers.ModelSerializer):
    
    depth = 1
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())

    class Meta:
        model = Coordenador
        fields = ['usuario', 'siape', 'inicio_mandato', 'fim_mandato', 'curso']

    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')

        # Cria ou recupera o usuário
        usuario = Usuario.objects.get(id=usuario_data.id)  # Assume que o ID do Usuario está sendo passado

        # Cria o Coordenador com o Usuario existente
        return Coordenador.objects.create(usuario=usuario, **validated_data)
