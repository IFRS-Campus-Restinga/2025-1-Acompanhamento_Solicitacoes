from rest_framework import serializers
from ..models import PeriodoDisponibilidade
from django.utils import timezone

class PeriodoDisponibilidadeSerializer(serializers.ModelSerializer):
    esta_ativo = serializers.SerializerMethodField()
    formulario_nome = serializers.CharField(
        source='disponibilidade.get_formulario_display', 
        read_only=True
    )

    class Meta:
        model = PeriodoDisponibilidade
        fields = [
            'id',
            'disponibilidade',
            'formulario_nome',
            'data_inicio',
            'data_fim',
            'esta_ativo'
        ]
        extra_kwargs = {
            'disponibilidade': {'required': True},
            'data_inicio': {'required': True},
        }

    def validate(self, data):
        # Validação básica de datas
        if 'data_fim' in data and data['data_fim'] and data['data_fim'] < data['data_inicio']:
            raise serializers.ValidationError({
                'data_fim': 'A data final não pode ser anterior à data de início.'
            })

        # Validação de sobreposição (se o objeto já existe)
        if not self.instance:
            disponibilidade = data['disponibilidade']
            qs = PeriodoDisponibilidade.objects.filter(
                disponibilidade=disponibilidade,
                data_inicio__lte=data.get('data_fim', timezone.now().date() + timezone.timedelta(days=3650)),
                data_fim__gte=data['data_inicio']
            )
            if qs.exists():
                raise serializers.ValidationError({
                    'data_inicio': 'Este período sobrepõe outro existente para o mesmo formulário.',
                    'data_fim': 'Este período sobrepõe outro existente para o mesmo formulário.'
                })

        return data

    def get_esta_ativo(self, obj):
        return obj.esta_ativo

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['data_inicio'] = instance.data_inicio.isoformat()
        if instance.data_fim:
            representation['data_fim'] = instance.data_fim.isoformat()
        return representation