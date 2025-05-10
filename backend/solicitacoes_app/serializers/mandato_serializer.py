from rest_framework import serializers
from ..models import Mandato, Curso, Coordenador
from django.core.exceptions import ValidationError

class MandatoSerializer(serializers.ModelSerializer):
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    coordenador = serializers.PrimaryKeyRelatedField(queryset=Coordenador.objects.all())
    inicio_mandato = serializers.DateField(format="%d-%m-%Y", input_formats=["%Y-%m-%d", "%d-%m-%Y"])
    fim_mandato = serializers.DateField(format="%d-%m-%Y", input_formats=["%Y-%m-%d", "%d-%m-%Y"], required=False)
    
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