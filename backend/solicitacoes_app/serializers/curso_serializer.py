from rest_framework import serializers
from ..models import Curso, Mandato

class CursoSerializer(serializers.ModelSerializer):

    ppcs = serializers.SerializerMethodField() 
    tipo_curso_display = serializers.CharField(source='get_tipo_curso_display', read_only=True)
    tipo_periodo_display = serializers.CharField(source='get_tipo_periodo_display', read_only=True)
 
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
    tipo_curso_display = serializers.CharField(source='get_tipo_curso_display', read_only=True)
    
    class Meta:
        model = Curso
        fields = ['nome', 'codigo', 'tipo_periodo', 'tipo_curso', 'tipo_curso_display']


class CursoListSerializer(serializers.ModelSerializer):
    """
    Serializer para listagem de cursos com informações essenciais.
    Usado em dropdowns e seleções.
    """
    tipo_curso_display = serializers.CharField(source='get_tipo_curso_display', read_only=True)
    nome_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = Curso
        fields = ['codigo', 'nome', 'tipo_curso', 'tipo_curso_display', 'nome_completo']
    
    def get_nome_completo(self, obj):
        """Retorna nome do curso com tipo para melhor identificação"""
        return f"{obj.nome} - {obj.get_tipo_curso_display()}"
