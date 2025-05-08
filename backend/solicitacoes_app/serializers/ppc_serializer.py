from rest_framework import serializers
from ..models import Ppc
from .curso_serializer import CursoSerializer  # importe o serializer de Curso

class PpcSerializer(serializers.ModelSerializer):
    curso = CursoSerializer()  # Aqui está a mudança!

    class Meta:
        model = Ppc
        fields = '__all__'

    def save(self, **kwargs):
        formPpc = super().save(**kwargs)
        formPpc.full_clean()
        formPpc.save()
        return formPpc
