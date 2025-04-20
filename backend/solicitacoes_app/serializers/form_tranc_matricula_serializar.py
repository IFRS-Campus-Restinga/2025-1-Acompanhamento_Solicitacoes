from rest_framework import serializers
from ..models import FormularioTrancamento

class FormularioTrancamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FormularioTrancamento
        fields = ["id", "nome", "motivo_solicitacao"]   # unicos campos do modelo base que é usado neste formulario
