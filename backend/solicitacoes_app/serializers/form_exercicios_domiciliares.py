from rest_framework import serializers
from ..models import FormExercicioDomiciliar

class FormExercicioDomiciliarSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormExercicioDomiciliar
        fields = '__all__'  # ou lista os campos manualmente
