from rest_framework import serializers
from ..models import Solicitacao
from django.contrib.contenttypes.models import ContentType

class SolicitacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solicitacao
        fields = '__all__'

    def validate(self, data):
        content_type = data.get('content_type')
        object_id = data.get('object_id')

        if content_type and object_id:
            model_class = content_type.model_class()
            if not model_class.objects.filter(id=object_id).exists():
                raise serializers.ValidationError("Formulário vinculado não encontrado.")
        return data
