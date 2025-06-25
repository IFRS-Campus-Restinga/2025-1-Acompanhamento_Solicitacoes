from rest_framework import serializers
from ..models import FormExercicioDomiciliar
from .solicitacao_serializer import BaseSolicitacaoModelSerializer

class FormExercicioDomiciliarSerializer(BaseSolicitacaoModelSerializer):
    class Meta:
        model = FormExercicioDomiciliar
        fields = '__all__'