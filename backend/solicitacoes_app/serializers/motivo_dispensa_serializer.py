from rest_framework.serializers import ModelSerializer
from ..models.motivo_dispensa import MotivoDispensa

class MotivoDispensaSerializer(ModelSerializer):

    class Meta:
        model = MotivoDispensa
        fields = [
            'id',
            'descricao'
        ]

        