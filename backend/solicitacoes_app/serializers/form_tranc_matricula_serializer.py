from rest_framework import serializers
from ..models.form_tranc_matricula import FormularioTrancamentoMatricula

class FormularioTrancamentoMatriculaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormularioTrancamentoMatricula
        fields = '__all__'
