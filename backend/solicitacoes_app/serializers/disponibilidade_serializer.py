from rest_framework import serializers
from ..models import Disponibilidade, PeriodoDisponibilidade
from .periodo_disponibilidade_serializer import PeriodoDisponibilidadeSerializer

class DisponibilidadeSerializer(serializers.ModelSerializer):
    nome_formulario = serializers.CharField(
        source='get_formulario_display',
        read_only=True
    )
    esta_ativo = serializers.BooleanField(read_only=True)
    periodos = serializers.SerializerMethodField(read_only=True)
    sempre_disponivel = serializers.SerializerMethodField()  # Adiciona o campo sempre_disponivel

    class Meta:
        model = Disponibilidade
        fields = [
            'id',
            'formulario',
            'nome_formulario',
            'ativo',
            'esta_ativo',
            'periodos',
            'sempre_disponivel'  # Inclui o campo nos fields
        ]
        extra_kwargs = {
            'formulario': {'required': True},
        }

    def get_periodos(self, obj):
        periodos = obj.periodos.all().order_by('data_inicio')
        return PeriodoDisponibilidadeSerializer(periodos, many=True).data

    def get_esta_ativo(self, obj):
        return obj.esta_ativo

    def get_sempre_disponivel(self, obj):
        # Verifica se existe exatamente um período e se a data_fim desse período é nula.
        return obj.periodos.count() == 1 and obj.periodos.filter(data_fim__isnull=True).exists()