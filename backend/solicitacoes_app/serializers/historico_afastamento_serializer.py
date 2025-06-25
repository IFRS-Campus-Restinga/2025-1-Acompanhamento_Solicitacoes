from rest_framework import serializers
from ..models.forms.historico_afastamento import HistoricoAfastamento

class HistoricoAfastamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricoAfastamento
        fields = "__all__"