from rest_framework import serializers
from solicitacoes_app.models import TipoFalta

class TipoMotivoChoiceSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()

    @classmethod
    def get_choices(cls):
        return [{"value": choice.value, "label": choice.label} for choice in TipoFalta]
