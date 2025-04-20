from rest_framework import serializers
from ..models import Turma
from .disciplina_serializer import DisciplinaSerializer  # Importando o serializer de Disciplina
from ..models import Disciplina

class TurmaSerializer(serializers.ModelSerializer):
    disciplinas = DisciplinaSerializer(many=True, read_only=True)  # Serializando as disciplinas

    class Meta:
        model = Turma
        fields = ['id', 'nome', 'disciplinas']  # Inclui id, nome e disciplinas

    def save(self, **kwargs):
        formTurma = super().save(**kwargs)
        disciplinas_codigos = self.initial_data.get('disciplinas', [])
        if disciplinas_codigos:
            disciplinas = Disciplina.objects.filter(codigo__in=disciplinas_codigos)
            formTurma.disciplinas.set(disciplinas)  # Associa as disciplinas à turma
        formTurma.full_clean()
        formTurma.save()
        return formTurma
