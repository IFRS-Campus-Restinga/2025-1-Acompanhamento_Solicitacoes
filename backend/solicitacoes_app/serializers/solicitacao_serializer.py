# seu_app/serializers/solicitacao_serializer.py

from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.utils import timezone
from ..models import Disponibilidade, Aluno 
from django.contrib.auth.models import User

class SolicitacaoListSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    data_solicitacao = serializers.DateField(read_only=True)
    status = serializers.CharField(source='get_status_display', read_only=True)
    tipo_formulario = serializers.CharField(source='get_nome_formulario_display', read_only=True)
    nome_aluno = serializers.CharField(source='aluno.usuario.nome', read_only=True)
    tipo_formulario_key = serializers.CharField(source='nome_formulario', read_only=True)

class BaseSolicitacaoModelSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    nome_formulario_display = serializers.CharField(source='get_nome_formulario_display', read_only=True)
    nome_aluno = serializers.CharField(source='aluno.usuario.nome', read_only=True)

    def create(self, validated_data):
        try:
            return super().create(validated_data)
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
