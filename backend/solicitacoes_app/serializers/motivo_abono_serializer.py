from rest_framework import serializers
from ..models import MotivoAbono

class MotivoAbonoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotivoAbono
        fields = '__all__'