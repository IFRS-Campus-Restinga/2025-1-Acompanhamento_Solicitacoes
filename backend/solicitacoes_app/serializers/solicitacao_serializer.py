from rest_framework import serializers
from ..models import Solicitacao

class SolicitacaoSerializer(serializers.ModelSerializer):
    tipo = serializers.SerializerMethodField()
    nome_aluno = serializers.SerializerMethodField()

    class Meta:
        model = Solicitacao
        fields = '__all__'

    def get_tipo(self, obj):
        return obj.nome_formulario or obj.__class__.__name__

    def get_nome_aluno(self, obj):
        if obj.aluno and hasattr(obj.aluno, "usuario"):
            return obj.aluno.usuario.nome
        return "Aluno não disponível"
