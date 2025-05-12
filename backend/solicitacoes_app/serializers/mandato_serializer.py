from rest_framework import serializers
from ..models import Mandato, Curso, Coordenador
from django.core.exceptions import ValidationError

class MandatoSerializer(serializers.ModelSerializer):
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    coordenador = serializers.PrimaryKeyRelatedField(queryset=Coordenador.objects.all())
    inicio_mandato = serializers.DateField(format="%d-%m-%Y", input_formats=["%Y-%m-%d", "%d-%m-%Y"])
    fim_mandato = serializers.DateField(format="%d-%m-%Y", input_formats=["%Y-%m-%d", "%d-%m-%Y"], required=False, allow_null=True)
    
    class Meta:
        model = Mandato
        fields = '__all__'
    
    def validate(self, data):
          # Cria uma instância do model com os dados validados
        instance = self.Meta.model(**data)
        if self.instance:  # Se estiver editando, atribui o ID para a exclusão na validação
            instance.pk = self.instance.pk
        try:
            instance.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return data
    
class MandatoHistoricoSerializer(serializers.ModelSerializer):
    coordenador = serializers.SerializerMethodField()
    inicio_mandato = serializers.DateField(format="%d-%m-%Y")
    fim_mandato = serializers.DateField(format="%d-%m-%Y", allow_null=True)

    class Meta:
        model = Mandato
        fields = ('id', 'coordenador', 'inicio_mandato', 'fim_mandato')

    def get_coordenador(self, mandato):
        from ..serializers.coordenador_serializer import CoordenadorMinimoSerializer
        coordenador = Coordenador.objects.select_related('usuario').get(id=mandato.coordenador_id)
        serializer = CoordenadorMinimoSerializer(coordenador)
        return serializer.data