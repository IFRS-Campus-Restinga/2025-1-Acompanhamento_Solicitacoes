from rest_framework import serializers
from ..models import Disciplina, Ppc
from .ppc_serializer import PpcSerializer

class DisciplinaSerializer(serializers.ModelSerializer):
    ppc = serializers.PrimaryKeyRelatedField(queryset=Ppc.objects.all())

    class Meta:
        model = Disciplina
        fields = ['nome', 'codigo', 'ppc']

    def validate(self, data):
        if not data.get('ppc'):
            raise serializers.ValidationError({"ppc": "Um PPC deve ser selecionado."})
        return data