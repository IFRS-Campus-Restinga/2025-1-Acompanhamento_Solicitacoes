from rest_framework import serializers
from ..models import Disponibilidade

class DisponibilidadeSerializer(serializers.ModelSerializer):
    nome_formulario = serializers.CharField(
        source='get_formulario_display',
        read_only=True
    )
    esta_ativo = serializers.BooleanField(read_only=True)

    class Meta:
        model = Disponibilidade
        fields = [
            'id',
            'formulario',
            'nome_formulario',
            'sempre_disponivel',
            'data_inicio',
            'data_fim',
            'ativo',
            'esta_ativo'
        ]
        extra_kwargs = {
            'formulario': {'required': True},
            'data_inicio': {'required': False},
            'data_fim': {'required': False}
        }

    def validate(self, data):
        """Validações customizadas"""
        # Valida datas apenas se não for sempre disponível
        if not data.get('sempre_disponivel', True):
            if not data.get('data_inicio') or not data.get('data_fim'):
                raise serializers.ValidationError(
                    {'datas': 'Defina as datas quando "sempre_disponivel" for False.'}
                )
            
            if data['data_fim'] < data['data_inicio']:
                raise serializers.ValidationError(
                    {'data_fim': 'A data final não pode ser anterior à inicial.'}
                )

        return data

    def to_representation(self, instance):
        """Formatação do JSON de saída"""
        representation = super().to_representation(instance)
        if instance.data_inicio:
            representation['data_inicio'] = instance.data_inicio.isoformat()
        if instance.data_fim:
            representation['data_fim'] = instance.data_fim.isoformat()
        return representation