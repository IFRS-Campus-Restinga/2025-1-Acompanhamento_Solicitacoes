from rest_framework import serializers
from ..models import Coordenador, Usuario, Mandato, Curso
from ..serializers.usuario_serializer import UsuarioSerializer
from ..serializers.mandato_serializer import MandatoSerializer
from django.core.exceptions import ValidationError

class CoordenadorSerializer(serializers.ModelSerializer):
    mandatos_coordenador = serializers.SerializerMethodField(read_only=True)
    usuario = UsuarioSerializer(read_only=True)
    depth = 1

    class Meta:
        model = Coordenador
        fields = ['usuario', 'siape', 'mandatos_coordenador']

    def get_mandatos_coordenador(self, obj):
        return [
            {
                'curso': mandato.curso.codigo,
                'inicio_mandato': mandato.inicio_mandato.strftime("%d-%m-%Y") if mandato.inicio_mandato else None,
                'fim_mandato': mandato.fim_mandato.strftime("%d-%m-%Y") if mandato.fim_mandato else None
            }
            for mandato in obj.mandatos_coordenador.all()
        ]
    
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        # Cria ou recupera o usuário
        usuario = Usuario.objects.get(id=usuario_data.id)
        # Cria o Coordenador com o Usuario existente
        return Coordenador.objects.create(usuario=usuario, **validated_data)

    def validate(self, data):
        # Executa as validações do model
        instance = self.instance or self.Meta.model(**data)
        instance.full_clean()
        return data
    
    
class CadastroCoordenadorMandatoSerializer(serializers.Serializer):
    usuario = UsuarioSerializer()
    siape = serializers.CharField(max_length=20)
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    inicio_mandato = serializers.DateField()
    fim_mandato = serializers.DateField(required=False, allow_null=True)

    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        usuario = Usuario.objects.create(**usuario_data)

        coordenador = Coordenador.objects.create(usuario=usuario, siape=validated_data.pop('siape'))

        mandato_data = {
            'curso': validated_data['curso'],
            'coordenador': coordenador,
            'inicio_mandato': validated_data['inicio_mandato'],
            'fim_mandato': validated_data.get('fim_mandato')
        }
        mandato = Mandato.objects.create(**mandato_data)

        return {
            'usuario': UsuarioSerializer(usuario).data,
            'coordenador': CoordenadorSerializer(coordenador).data,
            'mandato': MandatoSerializer(mandato).data
        }