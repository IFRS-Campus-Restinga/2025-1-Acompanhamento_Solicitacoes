from rest_framework import serializers
from ..models import Disciplina

class DisciplinaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Disciplina
        fields = '__all__'