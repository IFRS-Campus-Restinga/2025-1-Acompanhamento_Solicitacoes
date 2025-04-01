from rest_framework import serializers
from ..models import CRE

class CRESerializer(serializers.ModelSerializer):

    class Meta:
        model = CRE
        fields = '__all__'  