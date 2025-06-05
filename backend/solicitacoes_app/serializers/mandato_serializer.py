from rest_framework import serializers
from ..models import Mandato, Curso, Coordenador
from django.core.exceptions import ValidationError
from ..serializers.curso_serializer import CursoSimplesSerializer
from ..serializers.coordenador_serializer import CoordenadorSimplesSerializer




class MandatoSerializer(serializers.ModelSerializer):
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    coordenador = serializers.PrimaryKeyRelatedField(queryset=Coordenador.objects.all())
    inicio_mandato = serializers.DateField(input_formats=["%Y-%m-%d", "%d-%m-%Y"])
    fim_mandato = serializers.DateField(input_formats=["%Y-%m-%d", "%d-%m-%Y"], required=False, allow_null=True)
    
    class Meta:
        model = Mandato
        fields = '__all__'
    
    def validate(self, data):
        """
       Função de validação que constrói uma instância do modelo (nova ou existente) com os dados validados
        e então chama o método full_clean() dessa instância do modelo Django.
        Isso garante que as validações definidas no nível do modelo também sejam executadas.
        """
        
        if self.instance:        
            effective_instance = self.instance
            for attr, value in data.items():
                setattr(effective_instance, attr, value)
            effective_instance.full_clean()
        else:
            new_instance = self.Meta.model(**data)
            new_instance.full_clean()
            
        return data

    
class MandatoDetalhadoSerializer(serializers.ModelSerializer):
    """
    Serializer para Mandato, incluindo detalhes do Curso e Coordenador, utilizado na lista de mandatos.
    """
    curso = CursoSimplesSerializer(read_only=True)
    coordenador = CoordenadorSimplesSerializer(read_only=True)

    class Meta:
        
        model = Mandato
        fields = [
            'id',
            'inicio_mandato',
            'fim_mandato',
            'curso',
            'coordenador'
        ]
