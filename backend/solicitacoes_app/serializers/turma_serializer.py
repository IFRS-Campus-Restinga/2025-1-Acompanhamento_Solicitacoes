from rest_framework import serializers
from ..models import Turma

class TurmaSerializer(serializers.ModelSerializer):
    disciplinas = serializers.SerializerMethodField() 

    class Meta:
        model = Turma
        fields = '__all__'
    
    def get_disciplinas(self, obj):
        return [disciplina.codigo for disciplina in obj.disciplinas.all()]