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
    


class CursoComHistoricoMandatosSerializer(serializers.Serializer):
    nome = serializers.CharField()
    codigo = serializers.CharField()
    historico_mandatos = serializers.SerializerMethodField()

    def get_historico_mandatos(self, curso):
        from ..serializers.mandato_serializer import MandatoHistoricoSerializer
        mandatos = Mandato.objects.filter(curso=curso).order_by('-inicio_mandato').select_related('coordenador__usuario')
        serializer = MandatoHistoricoSerializer(mandatos, many=True, read_only=True)
        return serializer.data