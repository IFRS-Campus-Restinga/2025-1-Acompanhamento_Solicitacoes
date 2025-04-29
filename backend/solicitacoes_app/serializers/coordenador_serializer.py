from rest_framework import serializers
from ..models import Coordenador
from .mandato_serializer import MandatoSerializer


class CoordenadorSerializer(serializers.ModelSerializer):
    mandatos_coordenador = serializers.SerializerMethodField()

    class Meta:
        model = Coordenador
        fields = ['id', 'usuario', 'siape', 'mandatos_coordenador']
        
    def get_mandatos_coordenador(self, obj):
        return [
            {
                'curso': mandato.curso.codigo,
                'inicio_mandato': mandato.inicio_mandato.strftime("%d-%m-%Y") if mandato.inicio_mandato else None,
                'fim_mandato': mandato.fim_mandato.strftime("%d-%m-%Y") if mandato.fim_mandato else None
            }
            for mandato in obj.mandatos_coordenador.all()
        ]
        
    def validate(self, data):
        # Executa as validações do model
        instance = self.instance or self.Meta.model(**data)
        instance.full_clean() 
        return data