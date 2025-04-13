from rest_framework import serializers
from ..models import Disciplina

class DisciplinaSerializer(serializers.ModelSerializer):
    ppcs = serializers.SerializerMethodField() 

    class Meta:
        model = Disciplina
        fields = '__all__'
    
    def get_ppcs(self, obj):
        return [ppc.codigo for ppc in obj.ppcs.all()]