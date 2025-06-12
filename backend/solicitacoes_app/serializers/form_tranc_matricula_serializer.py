from rest_framework import serializers
from ..models.form_tranc_matricula import FormularioTrancamentoMatricula

class FormularioTrancamentoMatriculaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormularioTrancamentoMatricula
        fields = '__all__'

    def create(self, validated_data):
        print("💾 Criando nova instância com:", validated_data)
        return super().create(validated_data)