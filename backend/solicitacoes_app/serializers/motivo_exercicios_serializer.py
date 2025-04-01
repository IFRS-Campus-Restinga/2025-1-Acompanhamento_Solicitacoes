from rest_framework.serializers import ModelSerializer
from ..models.motivo_exercicios import MotivoExercicios

class MotivoExerciciosSerializer(ModelSerializer):

    class Meta:
        model = MotivoExercicios
        fields = [
            'id',
            'descricao'
        ]

        