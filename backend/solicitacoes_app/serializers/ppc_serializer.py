from rest_framework import serializers
from ..models import Ppc, Curso
from .curso_serializer import CursoSerializer 

class PpcSerializer(serializers.ModelSerializer):
    curso = serializers.PrimaryKeyRelatedField(queryset=Curso.objects.all())
    curso_details = CursoSerializer(source='curso', read_only=True)
    class Meta:
        model = Ppc
        fields = '__all__'

    def save(self, **kwargs):
        formPpc = super().save(**kwargs)
        formPpc.full_clean()
        formPpc.save()
        return formPpc
