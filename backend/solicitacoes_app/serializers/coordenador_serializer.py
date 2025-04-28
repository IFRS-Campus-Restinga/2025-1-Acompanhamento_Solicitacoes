from django.shortcuts import get_object_or_404
from rest_framework import serializers
from ..models import Coordenador, Mandato, Usuario, Curso
from .mandato_serializer import MandatoSerializer
from django.db import transaction


class CoordenadorSerializer(serializers.ModelSerializer):
    mandato = MandatoSerializer(source='mandatos_coordenador.first', many=False)

    class Meta:
        model = Coordenador
        fields = ['usuario', 'siape', 'mandato']
        

    @transaction.atomic
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        mandato_data = validated_data.pop('mandato')

        # Se usuario_data for int (id), busca o usuário
        if isinstance(usuario_data, int):
            usuario = get_object_or_404(Usuario, id=usuario_data)
        elif isinstance(usuario_data, dict):
            # Se for um dicionário, cria um novo usuário
            usuario = Usuario.objects.create(**usuario_data)
        else:
            raise ValueError('Dados inválidos para o usuário.')

        # Cria o Coordenador
        coordenador = Coordenador.objects.create(
            usuario=usuario,
            siape=validated_data['siape']
        )

        # Cria o Mandato
        Mandato.objects.create(
            coordenador=coordenador,
            curso=get_object_or_404(Curso, id=mandato_data['curso']),
            inicio_mandato=mandato_data['inicio_mandato'],
            fim_mandato=mandato_data.get('fim_mandato')
        )

        return coordenador

    @transaction.atomic
    def update(self, instance, validated_data):
        usuario_data = validated_data.pop('usuario', None)
        mandato_data = validated_data.pop('mandato', None)
        siape = validated_data.get('siape')

        # Atualiza o Usuario
        if usuario_data:
            for attr, value in usuario_data.items():
                setattr(instance.usuario, attr, value)
            instance.usuario.save()

        # Atualiza o Coordenador
        if siape:
            instance.siape = siape
            instance.save()

        # Atualiza ou cria Mandato
        if mandato_data:
            mandato = instance.mandatos_coordenador.first()
            if mandato:
                for attr, value in mandato_data.items():
                    setattr(mandato, attr, value)
                mandato.save()
            else:
                Mandato.objects.create(
                    coordenador=instance,
                    curso=mandato_data['curso'],
                    inicio_mandato=mandato_data['inicio_mandato'],
                    fim_mandato=mandato_data.get('fim_mandato')
                )

        return instance