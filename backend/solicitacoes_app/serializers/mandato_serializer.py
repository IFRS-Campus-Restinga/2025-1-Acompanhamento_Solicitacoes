from rest_framework import serializers
from ..models import Mandato, Curso

class MandatoSerializer(serializers.ModelSerializer):
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    coordenador = serializers.PrimaryKeyRelatedField(read_only=True)
    inicio_mandato = serializers.DateField(format="%d-%m-%Y", input_formats=["%Y-%m-%d", "%d-%m-%Y"])
    fim_mandato = serializers.DateField(format="%d-%m-%Y", input_formats=["%Y-%m-%d", "%d-%m-%Y"])
    
    class Meta:
        model = Mandato
        fields = ['coordenador', 'curso', 'inicio_mandato', 'fim_mandato']