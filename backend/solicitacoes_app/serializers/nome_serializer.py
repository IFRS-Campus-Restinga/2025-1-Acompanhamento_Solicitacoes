from rest_framework import serializers
from ..models import Nome

class NomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nome
        fields = ['nome']  # Só tem esse mesmo