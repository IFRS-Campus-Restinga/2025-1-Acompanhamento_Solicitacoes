from rest_framework import serializers
from ..models import Coordenador, Usuario, Mandato, Curso
from ..serializers.usuario_serializer import UsuarioSerializer, UsuarioMinimoSerializer, UsuarioWriteSerializer
from ..serializers.mandato_serializer import MandatoSerializer
from django.core.exceptions import ValidationError

class CoordenadorMinimoSerializer(serializers.ModelSerializer):
    usuario = UsuarioMinimoSerializer(read_only=True)

    class Meta:
        model = Coordenador
        fields = ('id', 'siape', 'usuario')


class CoordenadorSerializer(serializers.ModelSerializer):
    mandatos_coordenador = serializers.SerializerMethodField(read_only=True)
    usuario = UsuarioSerializer(read_only=True)
    depth = 1

    class Meta:
        model = Coordenador
        fields = ['id','usuario', 'siape', 'mandatos_coordenador']

    def get_nome_usuario(self, obj):
        return [
            {'usuario': mandato.coordenador.usuario.nome}
            for mandato in obj.mandatos_coordenador.all()
        ]
    
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
    
    
    def validate(self, data):
        # Validações específicas do CadastroCoordenadorMandatoSerializer (se houver)
        if data['inicio_mandato'] and data.get('fim_mandato') and data['inicio_mandato'] >= data['fim_mandato']:
            raise serializers.ValidationError("A data de início do mandato deve ser anterior à data de fim.")

        # Cria uma instância temporária do Mandato para validação
        mandato_data = {
            'curso': data['curso'],
            'coordenador': Coordenador(),  # Um objeto Coordenador vazio é suficiente para a validação do Mandato
            'inicio_mandato': data['inicio_mandato'],
            'fim_mandato': data.get('fim_mandato')
        }
        mandato_instance = Mandato(**mandato_data)

        try:
            mandato_instance.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        return data

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
        
        
        
#########################################################

class CoordenadorReadSerializer(serializers.ModelSerializer):
    """
    Serializer para leitura de Coordenador, incluindo dados do usuário e mandatos.
    """
    mandatos_coordenador = serializers.SerializerMethodField(read_only=True)
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Coordenador
        fields = ['usuario', 'id', 'siape', 'mandatos_coordenador']
        read_only_fields = fields

    def get_mandatos_coordenador(self, obj):
        return [
            {
                'curso': mandato.curso.codigo,
                'inicio_mandato': mandato.inicio_mandato.strftime("%d-%m-%Y") if mandato.inicio_mandato else None,
                'fim_mandato': mandato.fim_mandato.strftime("%d-%m-%Y") if mandato.fim_mandato else None
            }
            for mandato in obj.mandatos_coordenador.all()
        ]


class CoordenadorWriteSerializer(serializers.ModelSerializer):
    """
    Serializer unificado para criação e atualização de Coordenador com Mandato.
    """
    usuario = UsuarioWriteSerializer()
    curso = serializers.CharField(max_length=10, write_only=True)  # Código do curso
    inicio_mandato = serializers.DateField(input_formats=["%Y-%m-%d", "%d-%m-%Y"],  write_only=True)
    fim_mandato = serializers.DateField(input_formats=["%Y-%m-%d", "%d-%m-%Y"],required=False, allow_null=True,  write_only=True)
    
    class Meta:
        model = Coordenador
        fields = ['usuario', 'siape', 'curso', 'inicio_mandato', 'fim_mandato']
    
    
    def validate_siape(self, value):
        coordenador_id = self.instance.id if self.instance else None

        if coordenador_id and Coordenador.objects.get(id=coordenador_id).siape == value:
            return value

        if Coordenador.objects.filter(siape=value).exists():
            raise serializers.ValidationError("Este SIAPE já está em uso.")
        return value    
    
    def validate_curso(self, value):
        try:
            curso = Curso.objects.get(codigo=value)
            return curso
        except Curso.DoesNotExist:
            raise serializers.ValidationError(f"Curso com código '{value}' não encontrado.")
    
    def validate(self, data):
        # Validações específicas para o mandato
        if data['inicio_mandato'] and data.get('fim_mandato') and data['inicio_mandato'] >= data.get('fim_mandato'):
            raise serializers.ValidationError({"fim_mandato": "A data de início do mandato deve ser anterior à data de fim."})

        return data
    
    def update(self, instance, validated_data):
        # Atualizar o Usuario
        usuario_data = validated_data.pop('usuario', None)
        if usuario_data:
            usuario_serializer = UsuarioSerializer(instance.usuario, data=usuario_data, partial=True)
            usuario_serializer.is_valid(raise_exception=True)
            usuario_serializer.save()

        # Atualizar campos do Coordenador (siape)
        instance.siape = validated_data.get('siape', instance.siape)
        instance.save()

        # Atualizar ou criar Mandato
        curso = validated_data.get('curso')
        inicio_mandato = validated_data.get('inicio_mandato')
        fim_mandato = validated_data.get('fim_mandato')

        if curso: # Só processa se o curso for fornecido na requisição
            mandato = Mandato.objects.filter(coordenador=instance, curso=curso).first()

            if mandato:
                mandato.inicio_mandato = inicio_mandato if inicio_mandato is not None else mandato.inicio_mandato
                mandato.fim_mandato = fim_mandato if fim_mandato is not None else mandato.fim_mandato
                mandato.save()
            else:
                # Criar novo mandato se o curso for novo para este coordenador
                Mandato.objects.create(
                    coordenador=instance,
                    curso=curso,
                    inicio_mandato=inicio_mandato,
                    fim_mandato=fim_mandato
                )
        
        return instance
