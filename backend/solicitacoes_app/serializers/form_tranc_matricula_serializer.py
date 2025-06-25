from rest_framework import serializers
from .solicitacao_serializer import BaseSolicitacaoModelSerializer
from ..models.forms.form_tranc_matricula import FormularioTrancamentoMatricula

class FormularioTrancamentoMatriculaSerializer(BaseSolicitacaoModelSerializer):
    class Meta:
        model = FormularioTrancamentoMatricula
        fields = '__all__'