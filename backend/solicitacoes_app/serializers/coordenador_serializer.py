from rest_framework import serializers
from ..models import Coordenador, Usuario
from ..serializers.usuario_serializer import UsuarioSerializer


class CoordenadorSerializer(serializers.ModelSerializer):
    mandatos_coordenador = serializers.SerializerMethodField()
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        source='usuario', queryset=Usuario.objects.all(), write_only=True
    )

    class Meta:
        model = Coordenador
        fields = '__all__'
    
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