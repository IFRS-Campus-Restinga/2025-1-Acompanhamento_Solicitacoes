from rest_framework import serializers
from ..models import Coordenador, Mandato, Usuario
from .mandato_serializer import MandatoSerializer
from .usuario_serializer import UsuarioSerializer
from django.db import transaction


class CoordenadorSerializer(serializers.ModelSerializer):
    mandato = MandatoSerializer(source='mandatos_coordenador.first', many=False)  # Ajuste para buscar os mandatos relacionados

    class Meta:
        model = Coordenador
        fields = ['usuario', 'siape', 'mandato']

    @transaction.atomic
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        mandato_data = validated_data.pop('mandato')

        # 1. Cria o Usuario
        usuario = Usuario.objects.create(**usuario_data)

        # 2. Cria o Coordenador
        coordenador = Coordenador.objects.create(
            usuario=usuario,
            siape=validated_data['siape']
        )

        # 3. Cria o Mandato
        Mandato.objects.create(
            coordenador=coordenador,
            curso=mandato_data['curso'],  # aqui assumimos que vem o ID do curso
            inicio_mandato=mandato_data['inicio_mandato'],
            fim_mandato=mandato_data.get('fim_mandato') 
        )

        return coordenador