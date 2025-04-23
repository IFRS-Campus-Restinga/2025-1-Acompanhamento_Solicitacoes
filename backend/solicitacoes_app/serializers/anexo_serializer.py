from rest_framework.serializers import Serializer
from ..models.anexo import Anexo

class AnexoSerializer(Serializer):
    class Meta:
        model = Anexo
        fields = ['anexo']