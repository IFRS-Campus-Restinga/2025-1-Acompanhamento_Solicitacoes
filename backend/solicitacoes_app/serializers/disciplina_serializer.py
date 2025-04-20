from rest_framework import serializers
from ..models import Disciplina, Ppc
from .ppc_serializer import PpcSerializer

class DisciplinaSerializer(serializers.ModelSerializer):
    ppcs = PpcSerializer(many=True, read_only=True)

    class Meta:
        model = Disciplina
        fields = ['nome', 'codigo', 'ppcs']

    def validate(self, data):
        ppcs_codigos = self.initial_data.get('ppcs', [])
        if not ppcs_codigos:
            raise serializers.ValidationError({"ppcs": "Pelo menos um PPC deve ser selecionado."})
        return data

    def save(self, **kwargs):
        formDisciplina = super().save(**kwargs)
        ppcs_codigos = self.initial_data.get('ppcs', [])
        if ppcs_codigos:
            ppcs = Ppc.objects.filter(codigo__in=ppcs_codigos)
            formDisciplina.ppcs.set(ppcs)
        formDisciplina.full_clean()
        formDisciplina.save()
        return formDisciplina