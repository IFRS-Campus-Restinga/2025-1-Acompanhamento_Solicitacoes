from rest_framework import serializers
from ..models import FormularioTrancamentoMatricula

class FormularioTrancamentoMatriculaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FormularioTrancamentoMatricula
        fields = ["id", "nome", "motivo_solicitacao"]   # unicos campos do modelo base que é usado neste formulario
