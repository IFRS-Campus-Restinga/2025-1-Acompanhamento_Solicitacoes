from rest_framework import serializers
from ..models import Aluno, Usuario

class AlunoSerializer(serializers.ModelSerializer):
    
    depth=1
    
    class Meta:
        model = Aluno
        fields = ['usuario', 'matricula', 'turma', 'ano_ingresso']
        
    
    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')

        # Cria ou recupera o usuário
        usuario = Usuario.objects.get(id=usuario_data.id)

        # Cria o Coordenador com o Usuario existente
        return Aluno.objects.create(usuario=usuario, **validated_data)
