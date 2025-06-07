from rest_framework import serializers
from ..models import Disponibilidade, PeriodoDisponibilidade
from datetime import date

class DisponibilidadeSerializer(serializers.ModelSerializer):
    nome_formulario = serializers.CharField(
        source='get_formulario_display',
        read_only=True
    )
    esta_ativo = serializers.BooleanField(read_only=True)
    periodos = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Disponibilidade
        fields = [
            'id',
            'formulario',
            'nome_formulario',
            'ativo',
            'esta_ativo',
            'periodos'
        ]
        extra_kwargs = {
            'formulario': {'required': True},
        }

    def get_periodos(self, obj):
        from .periodo_disponibilidade_serializer import PeriodoDisponibilidadeSerializer
        periodos = obj.periodos.all().order_by('data_inicio')
        return PeriodoDisponibilidadeSerializer(periodos, many=True).data

    def get_esta_ativo(self, obj):
        return obj.esta_ativo