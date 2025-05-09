from rest_framework import serializers
from ..models import Ppc
from .curso_serializer import CursoSerializer 

class PpcSerializer(serializers.ModelSerializer):
    curso = CursoSerializer()  

    class Meta:
        model = Ppc
        fields = '__all__'

    def save(self, **kwargs):
        formPpc = super().save(**kwargs)
        formPpc.full_clean()
        formPpc.save()
        return formPpc
