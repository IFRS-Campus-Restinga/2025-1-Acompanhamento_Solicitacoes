from rest_framework import serializers
from ..models import Curso, Mandato

class CursoSerializer(serializers.ModelSerializer):
    ppcs = serializers.SerializerMethodField()  

    class Meta:
        model = Curso
        fields = '__all__'  

    def get_ppcs(self, obj):
        return [ppc.codigo for ppc in obj.ppcs.all()]

    def save(self, **kwargs):
        formCurso = super().save(**kwargs)
        formCurso.full_clean()
        formCurso.save()
        return formCurso
    


class CursoSimplesSerializer(serializers.ModelSerializer):
    
    """ 
    Serializer simples para incluir informações do Curso no Mandato. 
    """
    
    class Meta:
        model = Curso
        fields = ['nome', 'codigo', 'tipo_periodo'] 
