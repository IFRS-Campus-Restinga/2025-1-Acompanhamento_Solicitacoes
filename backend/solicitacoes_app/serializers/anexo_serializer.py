from rest_framework.serializers import ModelSerializer
from ..models.anexo import Anexo

class AnexoSerializer(ModelSerializer):
    class Meta:
        model = Anexo
        fields = '__all__'
