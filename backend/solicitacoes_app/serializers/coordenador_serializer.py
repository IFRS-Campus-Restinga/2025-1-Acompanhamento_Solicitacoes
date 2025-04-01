from rest_framework import serializers
from ..models import Coordenador

class CoordenadorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Coordenador
        fields = '__all__'  
