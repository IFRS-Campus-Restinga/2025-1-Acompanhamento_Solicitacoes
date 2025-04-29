from rest_framework import serializers
from ..models import Mandato, Curso, Coordenador

class MandatoSerializer(serializers.ModelSerializer):
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    coordenador = serializers.PrimaryKeyRelatedField(queryset=Coordenador.objects.all())
    inicio_mandato = serializers.DateField(format="%d-%m-%Y", input_formats=["%Y-%m-%d", "%d-%m-%Y"])
    fim_mandato = serializers.DateField(format="%d-%m-%Y", input_formats=["%Y-%m-%d", "%d-%m-%Y"], required=False)
    
    class Meta:
        model = Mandato
        fields = ['id', 'coordenador', 'curso', 'inicio_mandato', 'fim_mandato']
    
    def validate(self, data):
        # Executa as validações do model
        instance = self.instance or self.Meta.model(**data)
        instance.full_clean() 
        return data