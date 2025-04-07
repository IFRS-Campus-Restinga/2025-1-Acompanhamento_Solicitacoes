from rest_framework import serializers
from ..models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nome', 'cpf', 'telefone', 'data_nascimento', 'is_active']
        read_only_fields = ['id']
